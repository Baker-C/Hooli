import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  apiBaseUrl: 'api_base_url'
};

const DEFAULT_API_URL = (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL)
  ? process.env.EXPO_PUBLIC_API_URL
  : 'http://localhost:3000/api';

async function getBaseUrl() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.apiBaseUrl);
    return stored || DEFAULT_API_URL;
  } catch {
    return DEFAULT_API_URL;
  }
}

async function setBaseUrl(url) {
  const trimmed = (url || '').trim();
  const normalized = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  await AsyncStorage.setItem(STORAGE_KEYS.apiBaseUrl, normalized || DEFAULT_API_URL);
  return normalized || DEFAULT_API_URL;
}

function getOriginFromBase(baseUrl) {
  try {
    const url = new URL(baseUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    // Fallback: if base contains '/api', strip it
    const idx = baseUrl.indexOf('/api');
    return idx > -1 ? baseUrl.slice(0, idx) : baseUrl;
  }
}

async function request(path, options = {}) {
  const base = await getBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

async function healthCheck() {
  // Try /api/health if origin exposes it, else /health
  const base = await getBaseUrl();
  const origin = getOriginFromBase(base);
  const candidates = [`${origin}/api/health`, `${origin}/health`];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return { ok: true, data };
      }
    } catch {
      // continue
    }
  }
  return { ok: false };
}

async function getConfig() {
  return request('/config', { method: 'GET' });
}

async function updateConfig(payload) {
  return request('/config', { method: 'POST', body: JSON.stringify(payload) });
}

async function updatePrompt(prompt) {
  return request('/config/prompt', { method: 'POST', body: JSON.stringify({ prompt }) });
}

async function initiateCall(phoneNumber, systemPrompt) {
  const body = { phoneNumber };
  if (systemPrompt) body.systemPrompt = systemPrompt;
  return request('/call', { method: 'POST', body: JSON.stringify(body) });
}

async function getCallStatus(callId) {
  return request(`/call/${encodeURIComponent(callId)}`, { method: 'GET' });
}

async function getCallSummary(callId) {
  return request(`/call/${encodeURIComponent(callId)}/summary`, { method: 'GET' });
}

export const api = {
  getBaseUrl,
  setBaseUrl,
  healthCheck,
  getConfig,
  updateConfig,
  updatePrompt,
  initiateCall,
  getCallStatus,
  getCallSummary
};


