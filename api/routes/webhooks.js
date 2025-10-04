const express = require('express');
const { validateWebhook } = require('../middleware/validation');
const { WebhookProcessor } = require('../services/webhookProcessor');
const { CallStore } = require('../services/callStore');

const router = express.Router();
const webhookProcessor = new WebhookProcessor();

/**
 * POST /api/webhooks/omi
 * Handle OMI webhooks
 */
router.post('/omi', validateWebhook, async (req, res) => {
  try {
    const { event, data, timestamp } = req.body;

    console.log(`Received OMI webhook: ${event}`, { timestamp, data });

    const result = await webhookProcessor.processOMIWebhook(event, data);

    res.json({
      success: true,
      message: 'Webhook processed successfully',
      result
    });

  } catch (error) {
    console.error('OMI webhook processing error:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

/**
 * POST /api/webhooks/voice-status
 * Handle voice processing status updates
 */
router.post('/voice-status', validateWebhook, async (req, res) => {
  try {
    const { sessionId, status, data } = req.body;

    console.log(`Voice status update: ${status}`, { sessionId, data });

    const result = await webhookProcessor.processVoiceStatus(sessionId, status, data);

    res.json({
      success: true,
      message: 'Voice status processed successfully',
      result
    });

  } catch (error) {
    console.error('Voice status webhook error:', error);
    res.status(500).json({
      error: 'Voice status processing failed',
      message: error.message
    });
  }
});

/**
 * GET /api/webhooks/test
 * Test webhook endpoint
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoint is working',
    timestamp: new Date().toISOString(),
    endpoints: {
      omi: '/api/webhooks/omi',
      voiceStatus: '/api/webhooks/voice-status'
    }
  });
});

/**
 * POST /api/webhooks/vapi
 * Handle Vapi call events (status updates, transcripts, end-of-call summaries)
 */
router.post('/vapi', async (req, res) => {
  try {
    const body = req.body;
    const type = body?.message?.type || body?.type;

    const callId = body?.message?.call?.id || body?.call?.id || body?.message?.session?.id;
    if (!callId) return res.json({ ok: true });

    if (type === 'status' || type === 'session.updated') {
      const status = body?.message?.call?.status || body?.message?.session?.status;
      if (status) CallStore.patch(callId, { status });
    if (status) console.log('📶 Call status update', { callId, status });
      const recordingUrl = body?.message?.call?.recordingUrl || body?.call?.recordingUrl;
      if (recordingUrl) CallStore.patch(callId, { recordingUrl });
    }

    if (type === 'transcript' || type === 'transcript.part') {
      const chunk = body?.message?.transcript ?? body?.artifact?.messages ?? '';
      const text = Array.isArray(chunk) ? chunk.map(m => (typeof m === 'string' ? m : m?.text || '')).join('\n') : String(chunk || '');
      const prev = CallStore.get(callId)?.transcript || '';
      CallStore.patch(callId, { transcript: prev + (text ? `\n${text}` : '') });
    if (text) console.log('📝 Transcript chunk', { callId, chars: text.length });
    }

    if (type === 'end-of-call-report') {
      const analysis = body?.message?.analysis || body?.analysis;
      const summary = analysis?.summary || analysis?.notes || 'No summary.';
      const transcript = analysis?.transcript || CallStore.get(callId)?.transcript;
      const recordingUrl = body?.message?.call?.recordingUrl || body?.call?.recordingUrl;
      CallStore.patch(callId, { status: 'ended', summary, transcript, recordingUrl });
    console.log('✅ End-of-call summary ready', { callId, summaryChars: (summary || '').length, fetch: `/api/voice/call/${callId}` });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error('Vapi webhook error:', e);
    res.status(200).json({ ok: true });
  }
});

module.exports = router;