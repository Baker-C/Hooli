import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { useApp } from '../context/AppContext';

export default function CallScreen() {
  const { startCall } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [calling, setCalling] = useState(false);

  function normalizeNumber(value) {
    const digits = (value || '').replace(/\D/g, '');
    if (digits.length === 10) return `+1${digits}`;
    return digits.startsWith('+') ? digits : `+${digits}`;
  }

  async function handleStart() {
    if (!phoneNumber) {
      Alert.alert('Validation', 'Enter a phone number');
      return;
    }
    const normalized = normalizeNumber(phoneNumber);
    if (!/^[+][0-9]{10,15}$/.test(normalized)) {
      Alert.alert('Validation', 'Enter a valid E.164 phone number');
      return;
    }
    setCalling(true);
    try {
      const res = await startCall(normalized, useCustomPrompt ? customPrompt : undefined);
      Alert.alert('Success', `Call initiated (ID: ${res.callId})`);
      setPhoneNumber('');
      setCustomPrompt('');
      setUseCustomPrompt(false);
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to initiate call');
    } finally {
      setCalling(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Initiate Call</Text>
      <Text style={styles.label}>Phone Number</Text>
      <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="+15105551234" keyboardType="phone-pad" />
      <View style={styles.switchRow}>
        <Text style={{ fontWeight: '600' }}>Use custom prompt</Text>
        <Switch value={useCustomPrompt} onValueChange={setUseCustomPrompt} />
      </View>
      {useCustomPrompt && (
        <TextInput style={[styles.input, { height: 120, textAlignVertical: 'top' }]} value={customPrompt} onChangeText={setCustomPrompt} placeholder="Enter custom prompt..." multiline />
      )}
      <TouchableOpacity style={styles.button} onPress={handleStart} disabled={calling}>
        <Text style={styles.buttonText}>{calling ? 'Initiating...' : 'Start Call'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#d1d5da', borderRadius: 8, padding: 10 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  button: { backgroundColor: '#1f6feb', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: 'white', fontWeight: '600' }
});


