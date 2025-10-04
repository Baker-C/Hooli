const axios = require('axios');
const MockOmiService = require('./mockOmiService');

/**
 * OMI (Open Memory Interface) Integration Service
 */
class OMIIntegration {
  constructor() {
    this.baseURL = process.env.OMI_API_URL || 'https://api.omi.com';
    this.apiKey = process.env.OMI_API_KEY;
    this.sessions = new Map();
    this.useMock = process.env.NODE_ENV === 'development' || process.env.USE_MOCK_OMI === 'true' || !this.apiKey;
    
    if (this.useMock) {
      console.log('🔧 Using Mock OMI Service for testing');
      this.mockService = new MockOmiService();
    } else {
      // Configure axios instance
      this.client = axios.create({
        baseURL: this.baseURL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'User-Agent': 'Hooli-OMI-Backend/1.0.0'
        }
      });
    }

    // Add request/response interceptors
    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for logging and error handling
   */
  setupInterceptors() {
    if (!this.client) return;
    
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`OMI API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('OMI API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`OMI API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('OMI API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Process text input through OMI
   */
  async processText(sessionId, text, context = {}) {
    try {
      if (this.useMock) {
        return await this.mockService.processText(sessionId, text, context);
      }

      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const response = await this.client.post('/process/text', {
        sessionId,
        text,
        context,
        timestamp: new Date().toISOString()
      });

      // Update session activity
      session.lastActivity = new Date().toISOString();

      return {
        success: true,
        response: response.data.response,
        sessionId,
        context: response.data.context
      };
    } catch (error) {
      console.error('Error processing text:', error.message);
      throw new Error(`Failed to process text: ${error.message}`);
    }
  }

  /**
   * Process audio input through OMI
   */
  async processAudio(sessionId, audioBuffer, context = {}) {
    try {
      if (this.useMock) {
        return await this.mockService.processAudio(sessionId, audioBuffer, context);
      }

      const session = this.sessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Create form data for audio upload
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('audio', audioBuffer, {
        filename: 'audio.wav',
        contentType: 'audio/wav'
      });
      formData.append('context', JSON.stringify(context));
      formData.append('timestamp', new Date().toISOString());

      const response = await this.client.post('/process/audio', formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      // Update session activity
      session.lastActivity = new Date().toISOString();

      return {
        success: true,
        transcription: response.data.transcription,
        response: response.data.response,
        sessionId,
        context: response.data.context
      };
    } catch (error) {
      console.error('Error processing audio:', error.message);
      throw new Error(`Failed to process audio: ${error.message}`);
    }
  }

  /**
   * Process input through OMI
   * @param {Object} processedInput - Processed voice/text input
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} OMI response
   */
  async processInput(processedInput, sessionId) {
    try {
      // Create or update session
      let session = this.sessions.get(sessionId);
      if (!session) {
        session = await this.createSession(sessionId);
      }

      // Prepare OMI request payload
      const payload = {
        sessionId,
        input: processedInput,
        context: session.context || {},
        timestamp: new Date().toISOString()
      };

      // Send to OMI for processing
      const response = await this.client.post('/v1/process', payload);

      // Update session with response
      session.lastInteraction = new Date().toISOString();
      session.context = response.data.context || session.context;
      this.sessions.set(sessionId, session);

      return {
        sessionId,
        response: response.data.response,
        context: response.data.context,
        actions: response.data.actions || [],
        metadata: response.data.metadata || {}
      };

    } catch (error) {
      console.error('OMI processing error:', error);
      
      // Return fallback response
      return {
        sessionId,
        response: {
          text: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
          type: 'error'
        },
        error: error.message
      };
    }
  }

  /**
   * Create a new OMI session
   * @param {string} sessionId - Session ID
   * @param {Object} options - Session options
   * @returns {Promise<Object>} Session data
   */
  async createSession(sessionId, options = {}) {
    try {
      if (this.useMock) {
        return await this.mockService.createSession(sessionId, options);
      }

      const payload = {
        sessionId,
        timestamp: new Date().toISOString(),
        config: {
          language: 'en-US',
          voiceEnabled: true,
          contextRetention: true
        }
      };

      const response = await this.client.post('/v1/sessions', payload);

      const session = {
        id: sessionId,
        created: new Date().toISOString(),
        lastInteraction: new Date().toISOString(),
        context: response.data.context || {},
        config: response.data.config || payload.config,
        status: 'active'
      };

      this.sessions.set(sessionId, session);
      return session;

    } catch (error) {
      console.error('Session creation error:', error);
      
      // Create local session as fallback
      const session = {
        id: sessionId,
        created: new Date().toISOString(),
        lastInteraction: new Date().toISOString(),
        context: {},
        config: {
          language: 'en-US',
          voiceEnabled: true,
          contextRetention: true
        },
        status: 'active',
        fallback: true
      };

      this.sessions.set(sessionId, session);
      return session;
    }
  }

  /**
   * Get session data
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object|null>} Session data
   */
  async getSession(sessionId) {
    let session = this.sessions.get(sessionId);
    
    if (!session) {
      try {
        // Try to fetch from OMI API
        const response = await this.client.get(`/v1/sessions/${sessionId}`);
        session = response.data;
        this.sessions.set(sessionId, session);
      } catch (error) {
        console.error('Session retrieval error:', error);
        return null;
      }
    }

    return session;
  }

  /**
   * End a session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} End session result
   */
  async endSession(sessionId) {
    try {
      // Notify OMI API
      await this.client.delete(`/v1/sessions/${sessionId}`);

      // Update local session
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = 'ended';
        session.endedAt = new Date().toISOString();
        this.sessions.set(sessionId, session);
      }

      return {
        sessionId,
        status: 'ended',
        endedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Session end error:', error);
      
      // End session locally even if API call fails
      const session = this.sessions.get(sessionId);
      if (session) {
        session.status = 'ended';
        session.endedAt = new Date().toISOString();
        this.sessions.set(sessionId, session);
      }

      return {
        sessionId,
        status: 'ended',
        endedAt: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Update session context
   * @param {string} sessionId - Session ID
   * @param {Object} context - Context data to update
   * @returns {Promise<Object>} Updated session
   */
  async updateSessionContext(sessionId, context) {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Merge context
      session.context = { ...session.context, ...context };
      session.lastInteraction = new Date().toISOString();

      // Update in OMI API
      await this.client.patch(`/v1/sessions/${sessionId}`, {
        context: session.context
      });

      this.sessions.set(sessionId, session);
      return session;

    } catch (error) {
      console.error('Context update error:', error);
      throw error;
    }
  }

  /**
   * Get OMI service status
   * @returns {Promise<Object>} Service status
   */
  async getServiceStatus() {
    try {
      const response = await this.client.get('/v1/health');
      return {
        status: 'connected',
        version: response.data.version,
        uptime: response.data.uptime,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }
}

module.exports = { OMIIntegration };