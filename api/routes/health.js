const express = require('express');
const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: 'connected', // Update based on actual DB connection
      omi: 'connected',      // Update based on OMI service status
      voice: 'ready'         // Update based on voice service status
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  };

  res.json(healthData);
});

/**
 * GET /api/health/detailed
 * Detailed health check with service status
 */
router.get('/detailed', async (req, res) => {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      },
      services: {
        api: {
          status: 'healthy',
          responseTime: Date.now()
        },
        omi: {
          status: 'connected', // TODO: Implement actual OMI health check
          lastCheck: new Date().toISOString()
        },
        voice: {
          status: 'ready', // TODO: Implement actual voice service health check
          capabilities: ['speech-to-text', 'text-to-speech']
        }
      }
    };

    res.json(healthData);

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;