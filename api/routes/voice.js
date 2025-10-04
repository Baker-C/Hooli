const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { validateVoiceInput } = require('../middleware/validation');
const { VoiceProcessor } = require('../services/voiceProcessor');
const { OMIIntegration } = require('../services/omiIntegration');

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

module.exports = router;