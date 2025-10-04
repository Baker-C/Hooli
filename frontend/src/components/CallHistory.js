import React from "react";

function CallHistory({ calls }) {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="card">
      <h2>Call History</h2>

      {calls.length === 0 ? (
        <div className="empty-state">
          <p>No calls initiated yet</p>
        </div>
      ) : (
        <div>
          {calls.map((call) => (
            <div key={call.id} className="call-item">
              <div className="call-info">
                <strong>{call.phoneNumber}</strong>
                <small>{formatTimestamp(call.timestamp)}</small>
                {call.id && (
                  <small
                    style={{
                      display: "block",
                      marginTop: "0.25rem",
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                    }}
                  >
                    {call.id}
                  </small>
                )}
              </div>
              <span className={`status-badge ${call.status}`}>
                {call.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CallHistory;
