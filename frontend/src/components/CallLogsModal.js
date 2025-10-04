import React, { useState, useEffect } from "react";

function CallLogsModal({ isOpen, onClose, apiUrl }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedCall, setExpandedCall] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCalls();
    }
  }, [isOpen]);

  const fetchCalls = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/calls`);
      const data = await response.json();

      if (data.success) {
        setCalls(data.calls || []);
      } else {
        setError(data.message || "Failed to fetch calls");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch calls");
    } finally {
      setLoading(false);
    }
  };

  const fetchTranscript = async (callId) => {
    setLoadingTranscript(true);
    setTranscript("");
    setSummary("");

    try {
      const response = await fetch(`${apiUrl}/calls/${callId}/transcript`);
      const data = await response.json();

      if (data.success) {
        // Format the transcript
        let formattedTranscript = "";

        if (typeof data.transcript === "string") {
          formattedTranscript = data.transcript;
        } else if (Array.isArray(data.transcript)) {
          formattedTranscript = data.transcript
            .map((msg) => `${msg.role}: ${msg.message || msg.content}`)
            .join("\n\n");
        } else {
          formattedTranscript = JSON.stringify(data.transcript, null, 2);
        }

        setTranscript(formattedTranscript || "No transcript available");
        setExpandedCall(callId);
      } else {
        setTranscript(data.message || "Failed to fetch transcript");
      }
    } catch (err) {
      setTranscript(err.message || "Failed to fetch transcript");
    } finally {
      setLoadingTranscript(false);
    }
  };

  const summarizeTranscript = async () => {
    if (!transcript) return;

    setLoadingSummary(true);
    setSummary("");

    try {
      const response = await fetch(`${apiUrl}/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      });

      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
      } else {
        setSummary("Failed to generate summary: " + data.message);
      }
    } catch (err) {
      setSummary("Failed to generate summary: " + err.message);
    } finally {
      setLoadingSummary(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "2rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          padding: "2rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#24292e" }}>
            Call Logs
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6a737d",
              padding: "0.25rem 0.5rem",
            }}
          >
            ×
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Loading calls...
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "1rem",
              background: "#f8d7da",
              color: "#721c24",
              borderRadius: "4px",
              marginBottom: "1rem",
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && calls.length === 0 && (
          <div
            style={{ textAlign: "center", padding: "2rem", color: "#6a737d" }}
          >
            No calls found
          </div>
        )}

        {!loading && calls.length > 0 && (
          <div>
            {calls.map((call) => (
              <div
                key={call.id}
                style={{
                  border: "1px solid #e1e4e8",
                  borderRadius: "6px",
                  padding: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#24292e",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {call.customer?.number || "Unknown"}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#6a737d" }}>
                      ID: {call.id}
                    </div>
                    <div style={{ fontSize: "0.8125rem", color: "#6a737d" }}>
                      {new Date(call.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        padding: "0.25rem 0.625rem",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        background:
                          call.status === "ended" ? "#dcffe4" : "#dbedff",
                        color: call.status === "ended" ? "#22863a" : "#0366d6",
                      }}
                    >
                      {call.status}
                    </span>
                    <button
                      onClick={() => fetchTranscript(call.id)}
                      disabled={loadingTranscript}
                      style={{
                        background: "#0366d6",
                        color: "white",
                        border: "none",
                        padding: "0.5rem 1rem",
                        borderRadius: "4px",
                        fontSize: "0.875rem",
                        cursor: "pointer",
                      }}
                    >
                      {loadingTranscript && expandedCall === call.id
                        ? "Loading..."
                        : "View Transcript"}
                    </button>
                  </div>
                </div>

                {expandedCall === call.id && transcript && (
                  <div
                    style={{
                      marginTop: "1rem",
                      padding: "1rem",
                      background: "#f6f8fa",
                      borderRadius: "4px",
                      border: "1px solid #d1d5da",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: "#24292e",
                        }}
                      >
                        Transcript
                      </h4>
                      <button
                        onClick={summarizeTranscript}
                        disabled={loadingSummary}
                        style={{
                          background: "#28a745",
                          color: "white",
                          border: "none",
                          padding: "0.375rem 0.75rem",
                          borderRadius: "4px",
                          fontSize: "0.8125rem",
                          cursor: loadingSummary ? "not-allowed" : "pointer",
                          opacity: loadingSummary ? 0.6 : 1,
                        }}
                      >
                        {loadingSummary ? "Summarizing..." : "Summarize"}
                      </button>
                    </div>
                    <pre
                      style={{
                        fontSize: "0.8125rem",
                        color: "#24292e",
                        lineHeight: "1.6",
                        whiteSpace: "pre-wrap",
                        margin: 0,
                        fontFamily: "inherit",
                      }}
                    >
                      {transcript}
                    </pre>

                    {summary && (
                      <div
                        style={{
                          marginTop: "1rem",
                          padding: "1rem",
                          background: "#fff",
                          borderRadius: "4px",
                          border: "1px solid #d1d5da",
                        }}
                      >
                        <h5
                          style={{
                            margin: "0 0 0.5rem 0",
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            color: "#28a745",
                          }}
                        >
                          Summary
                        </h5>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "#24292e",
                            lineHeight: "1.6",
                            margin: 0,
                          }}
                        >
                          {summary}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CallLogsModal;
