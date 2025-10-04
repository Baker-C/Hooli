const Joi = require('joi');

/**
 * Validation schema for voice input
 */
const voiceInputSchema = Joi.object({
  sessionId: Joi.string().optional(),
  text: Joi.string().max(5000).optional(),
  format: Joi.string().valid('wav', 'mp3', 'ogg', 'webm').optional(),
  sampleRate: Joi.number().valid(8000, 16000, 22050, 44100, 48000).optional(),
  language: Joi.string().valid('en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE').optional(),
  context: Joi.object().optional()
}); // Allow either text or audio (file) input

/**
 * Validation schema for webhook data
 */
const webhookSchema = Joi.object({
  event: Joi.string().required(),
  data: Joi.object().required(),
  timestamp: Joi.string().isoDate().optional(),
  sessionId: Joi.string().uuid().optional(),
  status: Joi.string().optional()
});

/**
 * Middleware to validate voice input
 */
const validateVoiceInput = (req, res, next) => {
  const { error } = voiceInputSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      message: error.details[0].message,
      details: error.details
    });
  }

  // Additional validation for file upload
  if (req.file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      return res.status(413).json({
        error: 'File too large',
        message: 'Audio file must be smaller than 10MB'
      });
    }

    const allowedMimeTypes = [
      'audio/wav',
      'audio/mpeg',
      'audio/ogg',
      'audio/webm'
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only WAV, MP3, OGG, and WebM audio files are allowed'
      });
    }
  }

  next();
};

/**
 * Middleware to validate webhook data
 */
const validateWebhook = (req, res, next) => {
  const { error } = webhookSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      error: 'Webhook validation failed',
      message: error.details[0].message,
      details: error.details
    });
  }

  next();
};

/**
 * Generic validation middleware factory
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.details[0].message,
        details: error.details
      });
    }

    next();
  };
};

module.exports = {
  validateVoiceInput,
  validateWebhook,
  validate,
  schemas: {
    voiceInputSchema,
    webhookSchema
  }
};