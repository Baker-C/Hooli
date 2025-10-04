const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter for general API requests
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// Rate limiter for voice processing (more restrictive)
const voiceRateLimiter = new RateLimiterMemory({
  keyPrefix: 'voice',
  points: 20, // Number of voice requests
  duration: 60, // Per 60 seconds
});

// Rate limiter for webhooks
const webhookRateLimiter = new RateLimiterMemory({
  keyPrefix: 'webhook',
  points: 200, // Number of webhook requests
  duration: 60, // Per 60 seconds
});

/**
 * General rate limiting middleware
 */
const rateLimiterMiddleware = async (req, res, next) => {
  try {
    const key = req.ip || req.connection.remoteAddress;
    await rateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

/**
 * Voice-specific rate limiting middleware
 */
const voiceRateLimiterMiddleware = async (req, res, next) => {
  try {
    const key = req.ip || req.connection.remoteAddress;
    await voiceRateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Voice Rate Limit Exceeded',
      message: `Voice processing rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

/**
 * Webhook-specific rate limiting middleware
 */
const webhookRateLimiterMiddleware = async (req, res, next) => {
  try {
    const key = req.ip || req.connection.remoteAddress;
    await webhookRateLimiter.consume(key);
    next();
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    res.set('Retry-After', String(secs));
    res.status(429).json({
      error: 'Webhook Rate Limit Exceeded',
      message: `Webhook rate limit exceeded. Try again in ${secs} seconds.`,
      retryAfter: secs
    });
  }
};

module.exports = {
  rateLimiter: rateLimiterMiddleware,
  voiceRateLimiter: voiceRateLimiterMiddleware,
  webhookRateLimiter: webhookRateLimiterMiddleware
};