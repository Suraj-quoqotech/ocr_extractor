import React from "react";

const formatTime = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const AverageProcessingTimeCard = ({ avgTime, theme, totalDocs }) => {
  const isDark = theme === "dark";

  return (
    <div
      style={{
        backgroundColor: isDark ? "#1e1e1e" : "#fff",
        borderRadius: 12,
        padding: "1.25rem",
        boxShadow: isDark
          ? "0 1px 3px rgba(255,255,255,0.1)"
          : "0 1px 3px rgba(0,0,0,0.1)",
        marginTop: "1rem"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.5rem" }}>⏱️</span>
        <div>
          <div
            style={{
              fontSize: "0.85rem",
              color: isDark ? "#aaa" : "#666"
            }}
          >
            Average Processing Time (All Documents)
          </div>

          {avgTime ? (
            <div
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "#5b7fff"
              }}
              title={`Calculated from ${totalDocs} processed documents`}
            >
              {formatTime(avgTime)}
            </div>
          ) : (
            <div
              style={{
                fontSize: "0.9rem",
                color: isDark ? "#777" : "#999"
              }}
            >
              No processing data available yet
            </div>
          )}
        </div>
      </div>

      {avgTime && (
        <div
          style={{
            marginTop: "0.5rem",
            fontSize: "0.7rem",
            color: isDark ? "#888" : "#777"
          }}
        >
          Based on {totalDocs} successfully processed documents
        </div>
      )}
    </div>
  );
};

export default AverageProcessingTimeCard;
