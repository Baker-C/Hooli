import React, { useState } from "react";

function ConfigPanel({ config, onUpdateConfig, onUpdatePrompt }) {
  const [phoneNumber, setPhoneNumber] = useState(config.phoneNumber);
  const [assistantId, setAssistantId] = useState(config.assistantId);
  const [systemPrompt, setSystemPrompt] = useState(
    config.assistant?.model?.messages[0]?.content || ""
  );
  const [firstMessage, setFirstMessage] = useState(
    config.assistant?.firstMessage || ""
  );
  const [voiceId, setVoiceId] = useState(
    config.assistant?.voice?.voiceId || "rachel"
  );
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await onUpdateConfig({
        phoneNumber,
        assistantId,
        assistant: {
          ...config.assistant,
          firstMessage,
          voice: {
            ...config.assistant.voice,
            voiceId,
          },
        },
      });

      setMessage({
        type: "success",
        text: "Configuration saved successfully",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to save configuration",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrompt = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      await onUpdatePrompt(systemPrompt);
      setMessage({
        type: "success",
        text: "System prompt updated successfully",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update prompt",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <h2>Configuration</h2>

      {message.text && (
        <div className={`alert ${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSaveConfig}>
        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number ID</label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="6a615c7a-c73e-4158-bf64-ffc02dd57192"
          />
          <p className="input-hint">
            Your Vapi phone number ID from the dashboard
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="assistantId">Assistant ID (Optional)</label>
          <input
            type="text"
            id="assistantId"
            value={assistantId}
            onChange={(e) => setAssistantId(e.target.value)}
            placeholder="46e48af1-38dd-4321-91eb-85d665f347f8"
          />
          <p className="input-hint">
            Leave empty to use inline config below, or provide your Vapi
            assistant ID
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="firstMessage">First Message</label>
          <input
            type="text"
            id="firstMessage"
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            placeholder="Hi this is Robbie. I'd like to change my order from 6 to 7"
          />
          <p className="input-hint">
            The greeting message when the call connects
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="voiceId">Voice</label>
          <select
            id="voiceId"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
          >
            <option value="rachel">Rachel (Female)</option>
            <option value="josh">Josh (Male)</option>
            <option value="bella">Bella (Female)</option>
            <option value="antoni">Antoni (Male)</option>
            <option value="elli">Elli (Female)</option>
            <option value="adam">Adam (Male)</option>
          </select>
          <p className="input-hint">Choose the voice for your AI assistant</p>
        </div>

        <button type="submit" className="button" disabled={saving}>
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </form>

      <form
        onSubmit={handleSavePrompt}
        style={{
          marginTop: "1.5rem",
          paddingTop: "1.5rem",
          borderTop: "1px solid #e1e4e8",
        }}
      >
        <div className="form-group">
          <label htmlFor="systemPrompt">System Prompt</label>
          <textarea
            id="systemPrompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Enter the system prompt for your AI assistant..."
            rows={8}
          />
          <p className="input-hint">
            Define how your AI assistant should behave and respond
          </p>
        </div>

        <button type="submit" className="button" disabled={saving}>
          {saving ? "Saving..." : "Update System Prompt"}
        </button>
      </form>
    </div>
  );
}

export default ConfigPanel;
