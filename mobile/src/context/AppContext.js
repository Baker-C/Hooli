import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [apiUrl, setApiUrl] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);
  const [callHistory, setCallHistory] = useState([]);

  const STORAGE_KEYS = {
    callHistory: 'call_history_v1'
  };

  useEffect(() => {
    (async () => {
      try {
        const base = await api.getBaseUrl();
        setApiUrl(base);
        const healthRes = await api.healthCheck();
        setHealth(healthRes);
        const cfg = await api.getConfig();
        setConfig(cfg);
        const storedHistory = await AsyncStorage.getItem(STORAGE_KEYS.callHistory);
        if (storedHistory) {
          try {
            const parsed = JSON.parse(storedHistory);
            if (Array.isArray(parsed)) setCallHistory(parsed);
          } catch {}
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const actions = useMemo(() => ({
    async setBaseUrl(url) {
      const next = await api.setBaseUrl(url);
      setApiUrl(next);
      return next;
    },
    async refreshConfig() {
      const cfg = await api.getConfig();
      setConfig(cfg);
      return cfg;
    },
    async updateConfig(partial) {
      const res = await api.updateConfig(partial);
      setConfig(res.config);
      return res;
    },
    async updatePrompt(prompt) {
      await api.updatePrompt(prompt);
      setConfig((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          assistant: {
            ...prev.assistant,
            model: {
              ...prev.assistant.model,
              messages: [{ role: 'system', content: prompt }]
            }
          }
        };
      });
    },
    async startCall(phoneNumber, customPrompt) {
      const response = await api.initiateCall(phoneNumber, customPrompt);
      const newEntry = {
        id: response.callId,
        phoneNumber,
        timestamp: new Date().toISOString(),
        status: 'initiated',
        customPrompt: customPrompt ? 'Yes' : 'No'
      };
      setCallHistory((prev) => {
        const next = [newEntry, ...prev];
        AsyncStorage.setItem(STORAGE_KEYS.callHistory, JSON.stringify(next)).catch(() => {});
        return next;
      });
      return response;
    },
    async clearCallHistory() {
      setCallHistory([]);
      await AsyncStorage.removeItem(STORAGE_KEYS.callHistory);
    },
    async refreshCallHistory() {
      // Try to update statuses by querying backend where possible
      const current = [...callHistory];
      const updated = [];
      for (const entry of current) {
        try {
          if (!entry?.id) {
            updated.push(entry);
            continue;
          }
          const data = await api.getCallStatus(entry.id);
          // backend responds with either {..., status} or { data: {...} }
          const nextStatus = data?.status || data?.data?.status || entry.status;
          updated.push({ ...entry, status: nextStatus });
        } catch {
          updated.push(entry);
        }
      }
      setCallHistory(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.callHistory, JSON.stringify(updated));
    }
  }), []);

  const value = useMemo(() => ({ apiUrl, config, loading, health, error, callHistory, ...actions }), [apiUrl, config, loading, health, error, callHistory, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}


