import React, { useState } from "react";

function CallPanel({ onInitiateCall }) {
  const [phoneNumber, setPhoneNumber] = useState("+15105079026");
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

      const result = await onInitiateCall(formattedNumber);

      setMessage({
        type: "success",
        text: `Call initiated successfully! Call ID: ${result.callId}`,
      });
      setPhoneNumber("");
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

        <button type="submit" className="button" disabled={calling}>
          {calling ? "Initiating..." : "Start Call"}
        </button>
      </form>
    </div>
  );
}

export default CallPanel;
