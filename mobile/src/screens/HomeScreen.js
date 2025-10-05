import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';

export default function HomeScreen({ navigation }) {
  const { health, apiUrl, loading, error } = useApp();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hooli Voice Admin</Text>
      <Text style={styles.subtitle}>API: {apiUrl}</Text>
      {loading ? (
        <Text style={styles.info}>Loading...</Text>
      ) : error ? (
        <Text style={[styles.info, { color: '#b00020' }]}>Error: {error.message}</Text>
      ) : (
        <Text style={styles.info}>Health: {health?.ok ? 'ok' : 'unknown'}</Text>
      )}

      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Config')}>
          <Text style={styles.buttonText}>Configuration</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Call')}>
          <Text style={styles.buttonText}>Start Call</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={[styles.button, { width: '100%', marginTop: 12 }]} onPress={() => navigation.navigate('History')}>
        <Text style={styles.buttonText}>Call History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { width: '100%', marginTop: 12 }]} onPress={() => navigation.navigate('Summarize')}>
        <Text style={styles.buttonText}>Summarizer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 12, color: '#666' },
  info: { fontSize: 14 },
  row: { flexDirection: 'row', gap: 12, marginTop: 8 },
  button: { backgroundColor: '#1f6feb', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 },
  buttonText: { color: 'white', fontWeight: '600' }
});


