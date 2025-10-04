/**
 * Mock OMI Service for Local Testing
 * This service simulates OMI API responses for development and testing
 */

class MockOmiService {
  constructor() {
    this.sessions = new Map();
    this.mockResponses = {
      greeting: "Hello! I'm your AI assistant. How can I help you today?",
      processing: "I'm processing your request. Please wait a moment...",
      confirmation: "I understand. Let me help you with that.",
      farewell: "Thank you for using our service. Have a great day!"
    };
  }

  /**
   * Create a new session (mock)
   */
  async createSession(sessionId, options = {}) {
    const { userId, context } = options;
    
    this.sessions.set(sessionId, {
      id: sessionId,
      userId: userId || 'anonymous',
      context: context || {},
      createdAt: new Date().toISOString(),
      messages: [],
      status: 'active'
    });

    return {
      id: sessionId,
      userId: userId || 'anonymous',
      context: context || {},
      created: new Date().toISOString(),
      lastInteraction: new Date().toISOString(),
      config: {
        language: 'en-US',
        voiceEnabled: true,
        contextRetention: true
      },
      status: 'active'
    };
  }

  /**
   * Process text input (mock)
   */
  async processText(sessionId, text, context = {}) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    // Add user message to session
    session.messages.push({
      type: 'user',
      content: text,
      timestamp: new Date().toISOString()
    });

    // Generate mock response based on input
    let response = this.generateMockResponse(text);
    
    // Add AI response to session
    session.messages.push({
      type: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      response,
      sessionId,
      context: session.context
    };
  }

  /**
   * Process audio input (mock)
   */
  async processAudio(sessionId, audioBuffer, context = {}) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    // Mock transcription
    const mockTranscription = this.generateMockTranscription(audioBuffer.length);
    
    // Add transcribed message to session
    session.messages.push({
      type: 'user',
      content: mockTranscription,
      timestamp: new Date().toISOString(),
      audioLength: audioBuffer.length
    });

    // Generate response
    const response = this.generateMockResponse(mockTranscription);
    
    session.messages.push({
      type: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      transcription: mockTranscription,
      response,
      sessionId,
      context: session.context
    };
  }

  /**
   * Get session information
   */
  async getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    return {
      success: true,
      session
    };
  }

  /**
   * End session
   */
  async endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'ended';
    session.endedAt = new Date().toISOString();

    return {
      success: true,
      message: 'Session ended successfully',
      session
    };
  }

  /**
   * Generate mock response based on input text
   */
  generateMockResponse(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('hello') || lowerText.includes('hi')) {
      return this.mockResponses.greeting;
    }
    
    if (lowerText.includes('help') || lowerText.includes('support')) {
      return "I'd be happy to help you! Can you tell me more about what you need assistance with?";
    }
    
    if (lowerText.includes('thank') || lowerText.includes('bye')) {
      return this.mockResponses.farewell;
    }
    
    if (lowerText.includes('problem') || lowerText.includes('issue')) {
      return "I understand you're experiencing an issue. Let me help you resolve this. Can you provide more details about the problem?";
    }
    
    if (lowerText.includes('call') || lowerText.includes('phone')) {
      return "I can help you with making a call to customer service. What company would you like me to call, and what's the issue you need help with?";
    }
    
    // Default response
    return `I received your message: "${text}". This is a mock response for testing purposes. How else can I assist you?`;
  }

  /**
   * Generate mock transcription based on audio buffer size
   */
  generateMockTranscription(bufferLength) {
    const mockTranscriptions = [
      "Hello, I need help with my account",
      "Can you help me resolve a billing issue?",
      "I'm having trouble with my service",
      "I need to speak with customer support",
      "Can you call the support line for me?",
      "I have a question about my recent order"
    ];
    
    // Select transcription based on buffer size (for variety)
    const index = bufferLength % mockTranscriptions.length;
    return mockTranscriptions[index];
  }

  /**
   * Get all active sessions (for testing)
   */
  getAllSessions() {
    return Array.from(this.sessions.values());
  }

  /**
   * Clear all sessions (for testing)
   */
  clearAllSessions() {
    this.sessions.clear();
    return { success: true, message: 'All sessions cleared' };
  }
}

module.exports = MockOmiService;