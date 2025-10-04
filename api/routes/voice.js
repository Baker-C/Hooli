const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { validateVoiceInput } = require('../middleware/validation');
const { VoiceProcessor } = require('../services/voiceProcessor');
const { OMIIntegration } = require('../services/omiIntegration');
const { CallStore } = require('../services/callStore');
const { startVapiCall } = require('../services/vapiClient');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize services
const voiceProcessor = new VoiceProcessor();
const omiIntegration = new OMIIntegration();

/**
 * POST /api/voice/process
 * Process voice input for OMI integration
 */
router.post('/process', upload.single('audio'), validateVoiceInput, async (req, res) => {
  try {
    const sessionId = req.body.sessionId || uuidv4();
    const audioBuffer = req.file?.buffer;
    const textInput = req.body.text;

    if (!audioBuffer && !textInput) {
      return res.status(400).json({
        error: 'Missing input',
        message: 'Either audio file or text input is required'
      });
    }

    let processedInput;
    
    if (audioBuffer) {
      // Process audio input
      processedInput = await voiceProcessor.processAudio(audioBuffer, {
        sessionId,
        format: req.body.format || 'wav',
        sampleRate: req.body.sampleRate || 16000
      });
    } else {
      // Process text input
      processedInput = await voiceProcessor.processText(textInput, { sessionId });
    }

    // Send to OMI for processing
    const omiResponse = await omiIntegration.processInput(processedInput, sessionId);

    res.json({
      success: true,
      sessionId,
      response: omiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({
      error: 'Processing failed',
      message: error.message,
      sessionId: req.body.sessionId
    });
  }
});

/**
 * POST /api/voice/session
 * Create a new voice session
 */
router.post('/session', async (req, res) => {
  try {
    const sessionId = uuidv4();
    const { userId, context } = req.body;

    const sessionData = await omiIntegration.createSession(sessionId, {
      userId: userId || 'anonymous',
      context: context || {},
      createdAt: new Date().toISOString()
    });

    res.json({
      success: true,
      sessionId,
      data: sessionData
    });

  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({
      error: 'Failed to create session',
      message: error.message
    });
  }
});

/**
 * GET /api/voice/session/:sessionId
 * Get session information
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionData = await omiIntegration.getSession(sessionId);

    if (!sessionData) {
      return res.status(404).json({
        error: 'Session not found',
        sessionId
      });
    }

    res.json({
      success: true,
      sessionId,
      data: sessionData
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({
      error: 'Failed to retrieve session',
      message: error.message
    });
  }
});

/**
 * POST /api/voice/session/:sessionId/end
 * End a voice session
 */
router.post('/session/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await omiIntegration.endSession(sessionId);

    res.json({
      success: true,
      sessionId,
      result
    });

  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({
      error: 'Failed to end session',
      message: error.message
    });
  }
});

/**
 * GET /api/voice/capabilities
 * Get voice processing capabilities
 */
router.get('/capabilities', (req, res) => {
  res.json({
    success: true,
    capabilities: {
      audioFormats: ['wav', 'mp3', 'ogg', 'webm'],
      sampleRates: [8000, 16000, 22050, 44100, 48000],
      maxFileSize: '10MB',
      languages: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE'],
      features: [
        'speech-to-text',
        'text-to-speech',
        'voice-activity-detection',
        'noise-reduction',
        'real-time-processing'
      ]
    }
  });
});

/**
 * POST /api/voice/call
 * Start a phone call via Vapi using a hardcoded business phone number.
 * Body: { message: string, user?: { name?: string, phoneE164?: string }, businessName?: string, qaPairs?: object }
 */
router.post('/call', async (req, res) => {
  try {
    const { message, user = {}, businessName = 'Test Business', qaPairs = {} } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required (string)' });
    }

    // Hardcoded business phone for testing
    const businessPhone = '+17176156058';

    const data = await startVapiCall({
      businessPhone,
      businessName,
      qaPairs,
      user: {
        name: user.name || 'Demo User',
        phoneE164: user.phoneE164 || '+10000000000'
      },
      firstMessage: `Hello, this is an automated assistant calling on behalf of ${user.name || 'a user'}.`,
      omiText: message
    });

    const record = {
      callId: data.id,
      status: 'queued',
      lookup: { ok: true, name: businessName, phone: businessPhone },
      lastUpdate: Date.now()
    };
    CallStore.upsert(record);

    const statusUrl = `/api/voice/call/${record.callId}`;
    console.log('✅ Vapi call created', { callId: record.callId, statusUrl });
    res.set('Location', statusUrl);
    res.json({ success: true, callId: record.callId, statusUrl, lookup: record.lookup });
  } catch (error) {
    console.error('Call start error:', error);
    res.status(500).json({ error: 'Call initiation failed', message: error.message });
  }
});

/**
 * GET /api/voice/call/:id
 * Retrieve call status and artifacts
 */
router.get('/call/:id', async (req, res) => {
  const { id } = req.params;
  const waitFor = (req.query.wait || '').toString(); // 'ended'
  const timeoutSec = Math.min(parseInt(req.query.timeout, 10) || 0, 60); // cap at 60s

  const send = () => {
    const rec = CallStore.get(id);
    if (!rec) return res.status(404).json({ error: 'Not found' });
    return res.json({ success: true, ...rec });
  };

  if (waitFor !== 'ended' || timeoutSec <= 0) {
    return send();
  }

  const start = Date.now();
  const intervalMs = 800;
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      const rec = CallStore.get(id);
      const expired = Date.now() - start >= timeoutSec * 1000;
      if (!rec || rec.status === 'ended' || expired) {
        clearInterval(timer);
        if (!rec) {
          res.status(404).json({ error: 'Not found' });
        } else {
          if (rec.status === 'ended') {
            console.log('📞 Call ended', { callId: id, summaryChars: (rec.summary || '').length, fetch: `/api/voice/call/${id}` });
          }
          res.json({ success: true, ...rec, waited: true, timedOut: rec.status !== 'ended' });
        }
        resolve();
      }
    }, intervalMs);
  });
});

// Return only call summary
router.get('/call/:id/summary', (req, res) => {
  const rec = CallStore.get(req.params.id);
  if (!rec) return res.status(404).json({ error: 'Not found' });
  res.json({ summary: rec.summary || null });
});

module.exports = router;