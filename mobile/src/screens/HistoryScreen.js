import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';

export default function HistoryScreen() {
  const { callHistory, clearCallHistory, refreshCallHistory } = useApp();

  const data = useMemo(() => callHistory, [callHistory]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call History</Text>
      {data.length === 0 ? (
        <Text style={{ color: '#6a737d' }}>No calls initiated yet</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View>
                <Text style={styles.itemPhone}>{item.phoneNumber}</Text>
                <Text style={styles.itemMeta}>{new Date(item.timestamp).toLocaleString()}</Text>
                {item.id ? <Text style={styles.itemId}>{item.id}</Text> : null}
              </View>
              <Text style={[styles.badge, styles[item.status] || styles.queued]}>{item.status}</Text>
            </View>
          )}
        />
      )}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <TouchableOpacity style={[styles.button, { flex: 1 }]} onPress={refreshCallHistory}>
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { flex: 1, backgroundColor: '#b00020' }]} onPress={clearCallHistory}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  item: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e1e4e8', borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPhone: { fontWeight: '700' },
  itemMeta: { fontSize: 12, color: '#6a737d' },
  itemId: { fontFamily: 'menlo', fontSize: 12, color: '#6a737d', marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, color: '#fff', overflow: 'hidden', fontWeight: '700' },
  queued: { backgroundColor: '#6a737d' },
  ended: { backgroundColor: '#1a7f37' },
  button: { backgroundColor: '#24292f', padding: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' }
});


