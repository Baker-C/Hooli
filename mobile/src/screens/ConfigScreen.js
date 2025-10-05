import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useApp } from '../context/AppContext';

export default function ConfigScreen() {
  const { config, updateConfig, updatePrompt } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [assistantId, setAssistantId] = useState('');
  const [firstMessage, setFirstMessage] = useState('');
  const [voiceId, setVoiceId] = useState('rachel');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!config) return;
    setPhoneNumber(config.phoneNumber || '');
    setAssistantId(config.assistantId || '');
    setFirstMessage(config.assistant?.firstMessage || '');
    setVoiceId(config.assistant?.voice?.voiceId || 'rachel');
    setSystemPrompt(config.assistant?.model?.messages?.[0]?.content || '');
  }, [config]);

  async function handleSaveConfig() {
    setSaving(true);
    try {
      await updateConfig({
        phoneNumber,
        assistantId,
        assistant: {
          ...config?.assistant,
          firstMessage,
          voice: { ...config?.assistant?.voice, voiceId }
        }
      });
      Alert.alert('Success', 'Configuration saved');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePrompt() {
    setSaving(true);
    try {
      await updatePrompt(systemPrompt);
      Alert.alert('Success', 'Prompt updated');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update prompt');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuration</Text>

      <Text style={styles.label}>Phone Number ID</Text>
      <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="6a615c7a-..." />
      <Text style={styles.hint}>Your Vapi phone number ID from the dashboard</Text>

      <Text style={styles.label}>Assistant ID (optional)</Text>
      <TextInput style={styles.input} value={assistantId} onChangeText={setAssistantId} placeholder="46e48af1-..." />
      <Text style={styles.hint}>Leave empty to use inline assistant config</Text>

      <Text style={styles.label}>First Message</Text>
      <TextInput style={styles.input} value={firstMessage} onChangeText={setFirstMessage} placeholder="Greeting message" />

      <Text style={styles.label}>Voice ID</Text>
      <TextInput style={styles.input} value={voiceId} onChangeText={setVoiceId} placeholder="rachel" />

      <TouchableOpacity style={styles.button} disabled={saving} onPress={handleSaveConfig}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Configuration'}</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 16 }]}>System Prompt</Text>
      <TextInput style={[styles.input, { height: 120, textAlignVertical: 'top' }]} value={systemPrompt} onChangeText={setSystemPrompt} placeholder="Enter system prompt..." multiline />

      <TouchableOpacity style={styles.button} disabled={saving} onPress={handleSavePrompt}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Update Prompt'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#d1d5da', borderRadius: 8, padding: 10 },
  hint: { fontSize: 12, color: '#6a737d', marginBottom: 8 },
  button: { backgroundColor: '#1f6feb', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: 'white', fontWeight: '600' }
});


