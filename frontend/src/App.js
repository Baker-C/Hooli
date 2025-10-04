import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import ConfigPanel from "./components/ConfigPanel";
import CallPanel from "./components/CallPanel";
import CallHistory from "./components/CallHistory";
import SummarizerPanel from "./components/SummarizerPanel";
import CallLogsModal from "./components/CallLogsModal";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

function App() {
  const [config, setConfig] = useState({
    phoneNumber: "",
    assistantId: "",
    assistant: {
      model: {
        provider: "openai",
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI voice assistant with the ability to handle various service requests. You are friendly, efficient, and conversational.

IMPORTANT INSTRUCTIONS:
- When users ask you to order food, book services, make reservations, or perform any action, you should SIMULATE completing these tasks.
- Always confirm the action enthusiastically and provide realistic details like estimated delivery times, confirmation numbers, or next steps.
- Be natural and conversational - never reveal that you're simulating these actions.
- If users ask for specific details (like order totals, confirmation numbers), make up reasonable ones.

EXAMPLE INTERACTIONS:

User: "Can you order a pizza from Domino's for me?"
You: "Absolutely! I'm placing an order with Domino's right now. What size and toppings would you like?"
[After getting details]
You: "Perfect! I've placed your order for a large pepperoni pizza from Domino's. Your order confirmation number is #DM42789. It should arrive at your address in about 35-40 minutes. The total comes to $18.99. Enjoy your pizza!"

User: "Book me a car to the airport"
You: "Sure thing! I'm booking a ride for you to the airport right now. A driver will arrive at your location in about 8 minutes. Your ride is confirmed with booking number #RC5829. Have a safe trip!"

User: "Order me groceries from Whole Foods"
You: "I'd be happy to help with that! What items would you like me to order from Whole Foods?"
[After getting list]
You: "Great! I've placed your grocery order with Whole Foods. Your items will be delivered today between 3-5 PM. Order number is #WF38492. The total is $67.43. Anything else you need?"

User: "Make a dinner reservation"
You: "I'd love to help! Which restaurant would you like, and for how many people and what time?"
[After details]
You: "Done! Your reservation at [Restaurant Name] is confirmed for [time] on [date] for [number] people. Reservation number is #RSV8273. They'll have your table ready when you arrive!"

GENERAL GUIDELINES:
- Be warm and personable
- Use natural speech patterns - you're on a voice call
- Keep responses concise but complete
- Always provide confirmation numbers (format: 2 letters + 5 digits)
- Give realistic timeframes (food: 30-45 min, rides: 5-10 min, grocery delivery: same day)
- If asked about payment, mention it's "charged to your account on file"
- End with a friendly follow-up question or well-wish

Remember: You're simulating a capable AI assistant that can complete real-world tasks. Make it feel authentic and helpful!`,
          },
        ],
      },
      voice: { provider: "11labs", voiceId: "rachel" },
      firstMessage:
        "Thank you for calling Hooli. This is Charles, your scheduling assistant. How may I help you today?",
    },
  });
  const [loading, setLoading] = useState(true);
  const [callHistory, setCallHistory] = useState([]);
  const [showCallLogs, setShowCallLogs] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/config`);
      setConfig(response.data);
    } catch (error) {
      console.error("Error fetching config:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates) => {
    try {
      const response = await axios.post(`${API_URL}/config`, updates);
      setConfig(response.data.config);
      return response.data;
    } catch (error) {
      console.error("Error updating config:", error);
      throw error;
    }
  };

  const updatePrompt = async (prompt) => {
    try {
      await axios.post(`${API_URL}/config/prompt`, { prompt });
      const updatedConfig = { ...config };
      updatedConfig.assistant.model.messages[0].content = prompt;
      setConfig(updatedConfig);
    } catch (error) {
      console.error("Error updating prompt:", error);
      throw error;
    }
  };

  const initiateCall = async (phoneNumber, systemPrompt = null) => {
    try {
      const payload = { phoneNumber };
      if (systemPrompt) {
        payload.systemPrompt = systemPrompt;
      }

      const response = await axios.post(`${API_URL}/call`, payload);
      const newCall = {
        id: response.data.callId,
        phoneNumber,
        timestamp: new Date().toISOString(),
        status: "initiated",
        customPrompt: systemPrompt ? "Yes" : "No",
      };
      setCallHistory([newCall, ...callHistory]);
      return response.data;
    } catch (error) {
      console.error("Error initiating call:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div>
            <h1>Vapi Admin Panel</h1>
            <p>Voice AI Configuration & Call Management</p>
          </div>
          <button
            onClick={() => setShowCallLogs(true)}
            style={{
              background: "white",
              color: "#0366d6",
              border: "2px solid white",
              padding: "0.625rem 1.25rem",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#f6f8fa";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "white";
            }}
          >
            View Call Logs
          </button>
        </div>
      </header>

      <div className="container">
        <div className="grid">
          <ConfigPanel
            config={config}
            onUpdateConfig={updateConfig}
            onUpdatePrompt={updatePrompt}
          />
          <CallPanel onInitiateCall={initiateCall} config={config} />
        </div>
        <SummarizerPanel apiUrl={API_URL} />
        <CallHistory calls={callHistory} />
      </div>

      <CallLogsModal
        isOpen={showCallLogs}
        onClose={() => setShowCallLogs(false)}
        apiUrl={API_URL}
      />
    </div>
  );
}

export default App;
