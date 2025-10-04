import React, { useState } from "react";

function SummarizerPanel({ apiUrl }) {
  const [transcript, setTranscript] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [summary, setSummary] = useState("");
  const [usage, setUsage] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [summarizing, setSummarizing] = useState(false);

  const handleSummarize = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setSummary("");
    setUsage(null);

    if (!transcript.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a transcript to summarize",
      });
      return;
    }

    setSummarizing(true);

    try {
      const payload = { transcript };
      if (customInstructions.trim()) {
        payload.customInstructions = customInstructions;
      }

      const response = await fetch(`${apiUrl}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
        setUsage(data.usage);
        setMessage({
          type: "success",
          text: "Summary generated successfully!",
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to generate summary",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to generate summary",
      });
    } finally {
      setSummarizing(false);
    }
  };

  const handleClear = () => {
    setTranscript("");
    setCustomInstructions("");
    setSummary("");
    setUsage(null);
    setMessage({ type: "", text: "" });
  };

  const loadSampleTranscript = () => {
    setTranscript(`Customer: Hi, I'm calling about my recent order. I haven't received it yet.
Agent: I'd be happy to help you with that. Can you provide your order number?
Customer: Yes, it's #ORD-12345.
Agent: Thank you. Let me look that up for you. I can see your order was shipped 3 days ago and is currently in transit. It should arrive by tomorrow.
Customer: Oh great! Will I get a notification when it arrives?
Agent: Yes, you'll receive an email and SMS notification once it's delivered.
Customer: Perfect, thank you so much for your help!
Agent: You're welcome! Is there anything else I can help you with today?
Customer: No, that's all. Thanks again!
Agent: Have a great day!`);
  };

  return (
    <div className="card" style={{ gridColumn: "1 / -1" }}>
      <h2>Transcript Summarizer</h2>

      {message.text && (
        <div className={`alert ${message.type}`}>{message.text}</div>
      )}

      <form onSubmit={handleSummarize}>
        <div className="form-group">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <label htmlFor="transcript">Transcript</label>
            <button
              type="button"
              onClick={loadSampleTranscript}
              style={{
                background: "transparent",
                border: "1px solid #d1d5da",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.75rem",
                cursor: "pointer",
                color: "#0366d6",
              }}
            >
              Load Sample
            </button>
          </div>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste call transcript here..."
            rows={8}
            disabled={summarizing}
          />
          <p className="input-hint">
            Enter the full call transcript you want to summarize
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="customInstructions">
            Custom Instructions (Optional)
          </label>
          <input
            type="text"
            id="customInstructions"
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder="e.g., Focus on action items and customer sentiment"
            disabled={summarizing}
          />
          <p className="input-hint">
            Customize how the summary should be generated
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="submit"
            className="button"
            disabled={summarizing}
            style={{ flex: 1 }}
          >
            {summarizing ? "Summarizing..." : "Generate Summary"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="button"
            disabled={summarizing}
            style={{
              flex: 1,
              background: "#6a737d",
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {summary && (
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            background: "#f6f8fa",
            borderRadius: "4px",
            border: "1px solid #d1d5da",
          }}
        >
          <h3
            style={{
              fontSize: "0.875rem",
              marginBottom: "0.75rem",
              color: "#24292e",
              fontWeight: 600,
            }}
          >
            Summary
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#24292e",
              lineHeight: "1.6",
              margin: 0,
              whiteSpace: "pre-wrap",
            }}
          >
            {summary}
          </p>

          {usage && (
            <div
              style={{
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid #e1e4e8",
                display: "flex",
                gap: "1rem",
                fontSize: "0.8125rem",
                color: "#6a737d",
              }}
            >
              <div>
                <strong>Tokens:</strong> {usage.totalTokens}
              </div>
              <div>
                <strong>Input:</strong> {usage.promptTokens}
              </div>
              <div>
                <strong>Output:</strong> {usage.completionTokens}
              </div>
              <div>
                <strong>Cost:</strong> ~$
                {(
                  (usage.promptTokens * 0.15 + usage.completionTokens * 0.6) /
                  1000000
                ).toFixed(6)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SummarizerPanel;
