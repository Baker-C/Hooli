import React, { useState } from "react";

function CallPanel({ onInitiateCall, config }) {
  const [phoneNumber, setPhoneNumber] = useState("+15105079026");
  const [customPrompt, setCustomPrompt] = useState("");
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [calling, setCalling] = useState(false);

  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "");

    // Add +1 prefix if not present and format
    if (numbers.length <= 10) {
      return numbers;
    }
    return numbers;
  };

  const handlePhoneNumberChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleInitiateCall = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!phoneNumber) {
      setMessage({
        type: "error",
        text: "Please enter a phone number",
      });
      return;
    }

    // Basic validation
    if (phoneNumber.replace(/\D/g, "").length < 10) {
      setMessage({
        type: "error",
        text: "Please enter a valid phone number",
      });
      return;
    }

    setCalling(true);

    try {
      // Format number with country code if not present
      let formattedNumber = phoneNumber.replace(/\D/g, "");
      if (!formattedNumber.startsWith("1") && formattedNumber.length === 10) {
        formattedNumber = "+1" + formattedNumber;
      } else if (!formattedNumber.startsWith("+")) {
        formattedNumber = "+" + formattedNumber;
      }

      const result = await onInitiateCall(
        formattedNumber,
        useCustomPrompt && customPrompt ? customPrompt : null
      );

      setMessage({
        type: "success",
        text: `Call initiated successfully! Call ID: ${result.callId}`,
      });
      setPhoneNumber("");
      setCustomPrompt("");
      setUseCustomPrompt(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to initiate call",
      });
    } finally {
      setCalling(false);
    }
  };

  return (
    <div className="card">
      <h2>Initiate Call</h2>

      {message.text && (
        <div className={`alert ${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleInitiateCall}>
        <div className="form-group">
          <label htmlFor="callPhoneNumber">Phone Number</label>
          <input
            type="tel"
            id="callPhoneNumber"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            placeholder="+15105079026"
            disabled={calling}
          />
          <p className="input-hint">
            Phone number to call (include country code, e.g., +1)
          </p>
        </div>

        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={useCustomPrompt}
              onChange={(e) => setUseCustomPrompt(e.target.checked)}
              disabled={calling}
              style={{ width: "auto", margin: 0 }}
            />
            Use custom prompt for this call
          </label>
        </div>

        {useCustomPrompt && (
          <div className="form-group">
            <label htmlFor="customPrompt">Custom System Prompt</label>
            <textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter custom prompt for this call..."
              rows={4}
              disabled={calling}
            />
            <p className="input-hint">
              Override the default prompt for this call only
            </p>
          </div>
        )}

        <button type="submit" className="button" disabled={calling}>
          {calling ? "Initiating..." : "Start Call"}
        </button>
      </form>

      {config?.assistant?.model?.messages?.[0]?.content && (
        <div style={{ 
          marginTop: "1.5rem", 
          padding: "1rem", 
          background: "#fafbfc", 
          borderRadius: "4px",
          border: "1px solid #e1e4e8"
        }}>
          <h3 style={{ 
            fontSize: "0.875rem", 
            marginBottom: "0.5rem", 
            color: "#24292e",
            fontWeight: 600
          }}>
            Default Prompt (Preview)
          </h3>
          <p style={{ 
            fontSize: "0.8125rem", 
            color: "#6a737d", 
            lineHeight: "1.5",
            whiteSpace: "pre-wrap",
            margin: 0,
            maxHeight: "100px",
            overflow: "auto"
          }}>
            {config.assistant.model.messages[0].content.substring(0, 200)}
            {config.assistant.model.messages[0].content.length > 200 && "..."}
          </p>
        </div>
      )}
    </div>
  );
}

export default CallPanel;
