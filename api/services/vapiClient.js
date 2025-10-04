const axios = require('axios');

/**
 * Start an outbound phone call via Vapi
 * @param {Object} args
 * @param {string} [args.businessName]
 * @param {Object} [args.qaPairs]
 * @param {{ name: string, phoneE164: string }} args.user
 * @param {string} [args.firstMessage]
 * @param {string} [args.omiText] - Freeform text from OMI app to pass to assistant
 */
async function startVapiCall(args) {
  const apiKey = process.env.VAPI_API_KEY;
  const assistantId = process.env.VAPI_ASSISTANT_ID || '';
  const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

  if (!apiKey || !phoneNumberId) {
    throw new Error('Missing Vapi configuration (VAPI_API_KEY, VAPI_PHONE_NUMBER_ID)');
  }

  // Hardcoded business phone for testing (destination number)
  const businessPhone = '+17176156058';

  const basePayload = {
    phoneNumberId,
    customer: { number: businessPhone }
  };

  let payload;
  if (assistantId.trim() !== '') {
    const qaPairsJson = JSON.stringify(args.qaPairs || {});
    payload = {
      ...basePayload,
      assistantId,
      assistantOverrides: {
        variableValues: {
          userName: args.user?.name || 'Unknown',
          userPhoneE164: args.user?.phoneE164 || '',
          businessName: args.businessName || 'Unknown',
          businessPhone,
          qaPairsJson,
          omiText: args.omiText || ''
        },
        firstMessage: args.firstMessage || `Hello, this is an automated assistant calling on behalf of ${args.user?.name || 'the user'}.`
      }
    };
  } else {
    payload = {
      ...basePayload,
      assistant: {
        name: 'Hooli Support Caller',
        firstMessage: args.firstMessage || `Hello, this is an automated assistant calling on behalf of ${args.user?.name || 'the user'}.`,
        instructions: args.omiText ? `Context from user: ${args.omiText}` : undefined
      }
    };
  }

  const { data } = await axios.post('https://api.vapi.ai/call/phone', payload, {
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
  });

  return data;
}

module.exports = { startVapiCall };


