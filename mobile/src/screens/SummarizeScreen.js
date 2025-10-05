import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { api } from '../api/client';

export default function SummarizeScreen() {
  const [transcript, setTranscript] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [summary, setSummary] = useState('');
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSummarize() {
    setMessage('');
    setSummary('');
    setUsage(null);
    if (!transcript.trim()) {
      setMessage('Please enter a transcript to summarize');
      return;
    }
    setLoading(true);
    try {
      // Call backend summarize endpoint using fetch to respect base url
      const base = await api.getBaseUrl();
      const res = await fetch(`${base}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, ...(customInstructions.trim() ? { customInstructions } : {}) })
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setUsage(data.usage);
        setMessage('Summary generated successfully!');
      } else {
        setMessage(data.message || 'Failed to generate summary');
      }
    } catch (e) {
      setMessage(e.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  }

  function loadSample() {
    setTranscript(`Customer: Hi, I'm calling about my recent order. I haven't received it yet.
Agent: I'd be happy to help you with that. Can you provide your order number?
Customer: Yes, it's #ORD-12345.
Agent: Thank you. Let me look that up for you. I can see your order was shipped 3 days ago and is currently in transit. It should arrive by tomorrow.
Customer: Oh great! Will I get a notification when it arrives?
Agent: Yes, you'll receive an email and SMS notification once it's delivered.
Customer: Perfect, thank you so much for your help!
Agent: You're welcome! Is there anything else I can help you with today?
Customer: No, that's all. Thanks again!
Agent: Have a great day!`);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transcript Summarizer</Text>
      {message ? <Text style={{ color: '#24292e' }}>{message}</Text> : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.label}>Transcript</Text>
        <TouchableOpacity onPress={loadSample} style={styles.secondaryButton}><Text style={styles.secondaryText}>Load Sample</Text></TouchableOpacity>
      </View>
      <TextInput value={transcript} onChangeText={setTranscript} style={[styles.input, { height: 160, textAlignVertical: 'top' }]} placeholder="Paste transcript here..." multiline />
      <Text style={styles.label}>Custom Instructions (optional)</Text>
      <TextInput value={customInstructions} onChangeText={setCustomInstructions} style={styles.input} placeholder="e.g., Focus on action items and sentiment" />
      <TouchableOpacity style={styles.button} disabled={loading} onPress={handleSummarize}>
        <Text style={styles.buttonText}>{loading ? 'Summarizing...' : 'Generate Summary'}</Text>
      </TouchableOpacity>

      {summary ? (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>{summary}</Text>
          {usage ? (
            <View style={styles.usageRow}>
              <Text style={styles.usageText}>Tokens: {usage.totalTokens}</Text>
              <Text style={styles.usageText}>Input: {usage.promptTokens}</Text>
              <Text style={styles.usageText}>Output: {usage.completionTokens}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#d1d5da', borderRadius: 8, padding: 10, marginBottom: 8 },
  button: { backgroundColor: '#1f6feb', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  buttonText: { color: 'white', fontWeight: '600' },
  secondaryButton: { borderWidth: 1, borderColor: '#d1d5da', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  secondaryText: { color: '#0366d6', fontSize: 12 },
  summaryBox: { marginTop: 12, backgroundColor: '#f6f8fa', borderWidth: 1, borderColor: '#d1d5da', borderRadius: 8, padding: 12 },
  summaryTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  summaryText: { fontSize: 14, color: '#24292e' },
  usageRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  usageText: { fontSize: 12, color: '#6a737d' }
});


