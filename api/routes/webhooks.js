const express = require('express');
const { validateWebhook } = require('../middleware/validation');
const { WebhookProcessor } = require('../services/webhookProcessor');

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

module.exports = router;