/**
 * Generate Sample Audio Files for Testing
 * Creates mock audio files in various formats for testing purposes
 */

const fs = require('fs');
const path = require('path');

class AudioSampleGenerator {
  constructor() {
    this.sampleRate = 44100;
    this.channels = 1; // Mono
    this.bitsPerSample = 16;
  }

  /**
   * Generate a simple sine wave audio buffer
   */
  generateSineWave(frequency = 440, duration = 2) {
    const samples = this.sampleRate * duration;
    const buffer = Buffer.alloc(samples * 2); // 16-bit samples
    
    for (let i = 0; i < samples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / this.sampleRate) * 0.3;
      const intSample = Math.round(sample * 32767);
      buffer.writeInt16LE(intSample, i * 2);
    }
    
    return buffer;
  }

  /**
   * Generate white noise
   */
  generateWhiteNoise(duration = 1) {
    const samples = this.sampleRate * duration;
    const buffer = Buffer.alloc(samples * 2);
    
    for (let i = 0; i < samples; i++) {
      const sample = (Math.random() - 0.5) * 0.1; // Low volume noise
      const intSample = Math.round(sample * 32767);
      buffer.writeInt16LE(intSample, i * 2);
    }
    
    return buffer;
  }

  /**
   * Generate a simple WAV file header
   */
  generateWavHeader(dataLength) {
    const header = Buffer.alloc(44);
    
    // RIFF header
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataLength, 4);
    header.write('WAVE', 8);
    
    // fmt chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // chunk size
    header.writeUInt16LE(1, 20);  // audio format (PCM)
    header.writeUInt16LE(this.channels, 22);
    header.writeUInt32LE(this.sampleRate, 24);
    header.writeUInt32LE(this.sampleRate * this.channels * this.bitsPerSample / 8, 28); // byte rate
    header.writeUInt16LE(this.channels * this.bitsPerSample / 8, 32); // block align
    header.writeUInt16LE(this.bitsPerSample, 34);
    
    // data chunk
    header.write('data', 36);
    header.writeUInt32LE(dataLength, 40);
    
    return header;
  }

  /**
   * Create a complete WAV file
   */
  createWavFile(audioData) {
    const header = this.generateWavHeader(audioData.length);
    return Buffer.concat([header, audioData]);
  }

  /**
   * Generate all sample files
   */
  generateAllSamples() {
    const outputDir = __dirname;
    
    // Ensure directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('🎵 Generating sample audio files...');

    // 1. Short greeting (2 seconds, 440Hz tone)
    const greeting = this.generateSineWave(440, 2);
    const greetingWav = this.createWavFile(greeting);
    fs.writeFileSync(path.join(outputDir, 'greeting.wav'), greetingWav);
    console.log('✅ Created greeting.wav (2s, 440Hz)');

    // 2. Question tone (3 seconds, 523Hz - C note)
    const question = this.generateSineWave(523, 3);
    const questionWav = this.createWavFile(question);
    fs.writeFileSync(path.join(outputDir, 'question.wav'), questionWav);
    console.log('✅ Created question.wav (3s, 523Hz)');

    // 3. Support request (4 seconds, 330Hz - E note)
    const support = this.generateSineWave(330, 4);
    const supportWav = this.createWavFile(support);
    fs.writeFileSync(path.join(outputDir, 'support-request.wav'), supportWav);
    console.log('✅ Created support-request.wav (4s, 330Hz)');

    // 4. Short noise sample
    const noise = this.generateWhiteNoise(1);
    const noiseWav = this.createWavFile(noise);
    fs.writeFileSync(path.join(outputDir, 'noise-sample.wav'), noiseWav);
    console.log('✅ Created noise-sample.wav (1s, white noise)');

    // 5. Long sample for testing limits
    const longSample = this.generateSineWave(220, 10);
    const longWav = this.createWavFile(longSample);
    fs.writeFileSync(path.join(outputDir, 'long-sample.wav'), longWav);
    console.log('✅ Created long-sample.wav (10s, 220Hz)');

    // 6. Create a very small file for edge case testing
    const tiny = this.generateSineWave(880, 0.1);
    const tinyWav = this.createWavFile(tiny);
    fs.writeFileSync(path.join(outputDir, 'tiny-sample.wav'), tinyWav);
    console.log('✅ Created tiny-sample.wav (0.1s, 880Hz)');

    // Create a README for the samples
    const readme = `# Sample Audio Files for Testing

These audio files are generated for testing the OMI voice integration endpoints.

## Files:

- **greeting.wav** (2s, 440Hz) - Simulates a short greeting
- **question.wav** (3s, 523Hz) - Simulates a customer question
- **support-request.wav** (4s, 330Hz) - Simulates a support request
- **noise-sample.wav** (1s, white noise) - Tests noise handling
- **long-sample.wav** (10s, 220Hz) - Tests longer audio processing
- **tiny-sample.wav** (0.1s, 880Hz) - Tests very short audio

## Usage:

Use these files with the test utilities:

\`\`\`bash
# Test with specific audio file
node tests/runTests.js audio <sessionId> tests/sampleAudio/greeting.wav

# Or use the test utilities directly
const testUtils = new TestUtils();
await testUtils.testAudioProcessing(sessionId, './tests/sampleAudio/greeting.wav');
\`\`\`

## Note:

These are synthetic audio files created for testing purposes only.
They contain simple tones and noise, not actual speech.
`;

    fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
    console.log('✅ Created README.md');

    console.log('\n🎉 All sample audio files generated successfully!');
    console.log(`📁 Files saved to: ${outputDir}`);
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new AudioSampleGenerator();
  generator.generateAllSamples();
}

module.exports = AudioSampleGenerator;