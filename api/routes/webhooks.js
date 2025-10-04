const express = require('express');
const { validateWebhook } = require('../middleware/validation');
const { WebhookProcessor } = require('../services/webhookProcessor');
const { sendOmiNotification } = require('../services/omiNotificationService');

const router = express.Router();
const webhookProcessor = new WebhookProcessor();

/**
 * POST /api/webhooks/omi
 * Handle OMI webhooks - Simplified for text processing
 */
router.post('/omi', async (req, res) => {
  try {
    // Handle both structured OMI events and simple text input
    const { text, message, transcript, event, data, uid, user_id, userId } = req.body;
    
    // Extract the actual text from various possible formats
    const userText = text || message || transcript || (data && data.text) || (data && data.message);
    
    // Extract user ID from various possible formats
    const extractedUserId = uid || user_id || userId || (data && data.uid) || (data && data.user_id) || (data && data.userId);

    // Enhanced logging for OMI webhook debugging
    console.log('\n' + '🗣️ '.repeat(30));
    console.log('🔔 OMI VOICE MESSAGE RECEIVED');
    console.log('🗣️ '.repeat(30));
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('👤 User ID:', extractedUserId);
    console.log('💬 User Said:', userText);
    console.log('📦 Full Request:', JSON.stringify(req.body, null, 2));
    console.log('🗣️ '.repeat(30) + '\n');

    if (!userText) {
      console.log('❌ No text found in request');
      return res.status(400).json({
        success: false,
        error: 'No text content found in request'
      });
    }

    // Process the text and generate a response
    const response = await processUserText(userText);

    console.log('🤖 Bot Response:', response);

    // Try to send OMI notification if user ID is available
    if (extractedUserId) {
      try {
        console.log('📤 Attempting to send OMI notification...');
        const notificationResult = await sendOmiNotification(extractedUserId, response);
        console.log('✅ OMI notification sent successfully');
        
        // Return success response for webhook
        res.json({
          success: true,
          message: 'Notification sent successfully',
          notificationSent: true,
          userId: extractedUserId,
          response: response
        });
        
      } catch (notificationError) {
        console.error('❌ Failed to send OMI notification:', notificationError.message);
        
        // Fall back to JSON response if notification fails
        res.json({
          success: true,
          message: response,
          text: response,
          response: response,
          reply: response,
          content: response,
          notificationSent: false,
          notificationError: notificationError.message
        });
      }
    } else {
      console.log('⚠️ No user ID found, returning JSON response');
      
      // Return JSON response if no user ID available
      res.json({
        success: true,
        message: response,
        text: response,
        response: response,
        reply: response,
        content: response,
        notificationSent: false,
        reason: 'No user ID provided'
      });
    }

    console.log('✅ Processing complete\n');

  } catch (error) {
    console.error('❌ OMI webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

/**
 * Simple text processing function
 */
async function processUserText(text) {
  // Default response as requested by user
  return "I have heard you!";
}

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