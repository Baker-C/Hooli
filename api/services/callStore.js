// In-memory call store for Vapi calls
const calls = new Map();

const CallStore = {
  upsert(rec) {
    calls.set(rec.callId, rec);
  },
  patch(callId, patch) {
    const cur = calls.get(callId);
    if (!cur) return;
    calls.set(callId, { ...cur, ...patch, lastUpdate: Date.now() });
  },
  get(callId) {
    return calls.get(callId);
  }
};

module.exports = { CallStore };


