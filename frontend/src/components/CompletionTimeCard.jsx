import React, { useMemo } from 'react';

// Format milliseconds to readable time
const formatTime = (ms) => {
  if (!ms || ms === 0) return "0s";
  
  const totalSeconds = Math.floor(ms / 1000);
  
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  if (minutes < 60) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const CompletionTimeCard = ({ files, theme }) => {
  const isDark = theme === "dark";

  // Calculate average completion time from completed files
  const avgCompletionTime = useMemo(() => {
    const completedFiles = files.filter(
      f => f.status === "done" && f.processing_time && f.processing_time > 0
    );

    if (completedFiles.length === 0) return 0;

    const totalTime = completedFiles.reduce((sum, f) => sum + f.processing_time, 0);
    return Math.round(totalTime / completedFiles.length);
  }, [files]);

  const completedCount = files.filter(f => f.status === "done").length;

  return (
    <div
      style={{
        backgroundColor: isDark ? "#1e1e1e" : "#fff",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: isDark
          ? "0 1px 3px rgba(255,255,255,0.1)"
          : "0 1px 3px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
        marginTop: "1.5rem"
      }}
    >
      <h3
        style={{
          margin: "0 0 1rem 0",
          fontSize: "1rem",
          fontWeight: 600,
          color: isDark ? "#e0e0e0" : "#333",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}
      >
        <span style={{ fontSize: "1rem" }}>⏱️</span>
        Processing Statistics :
        <span style={{ fontSize: "0.75rem", color: isDark ? "#888" : "#666" }}> How fast are we?</span>
      </h3>

      {/* Average Time Display */}
      <div
        style={{
          backgroundColor: isDark ? "#252525" : "#f8f9fa",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "1rem",
          border: `2px solid ${isDark ? "#17a2b8" : "#17a2b8"}`,
          borderLeft: "4px solid #17a2b8"
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            color: isDark ? "#888" : "#666",
            marginBottom: "0.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}
        >
          Average Completion Time
        </div>
        <div
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#17a2b8",
            display: "flex",
            alignItems: "baseline",
            gap: "0.5rem"
          }}
        >
          {formatTime(avgCompletionTime)}
          {avgCompletionTime === 0 && (
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 400,
                color: isDark ? "#888" : "#666"
              }}
            >
              (No data yet)
            </span>
          )}
        </div>
      </div>

      {/* Statistics Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem"
        }}
      >
        {/* Completed Count */}
        <div
          style={{
            backgroundColor: isDark ? "#252525" : "#f8f9fa",
            borderRadius: "8px",
            padding: "0.75rem",
            textAlign: "center"
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              color: isDark ? "#888" : "#666",
              marginBottom: "0.25rem"
            }}
          >
            Completed
          </div>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#28a745"
            }}
          >
            {completedCount}
          </div>
        </div>

        {/* Total Files */}
        <div
          style={{
            backgroundColor: isDark ? "#252525" : "#f8f9fa",
            borderRadius: "8px",
            padding: "0.75rem",
            textAlign: "center"
          }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              color: isDark ? "#888" : "#666",
              marginBottom: "0.25rem"
            }}
          >
            In Queue
          </div>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#5b7fff"
            }}
          >
            {files.length}
          </div>
        </div>
      </div>

      {/* Info Text */}
      <div
        style={{
          marginTop: "1rem",
          fontSize: "0.7rem",
          color: isDark ? "#666" : "#999",
          textAlign: "center",
          fontStyle: "italic"
        }}
      >
        {avgCompletionTime > 0
          ? `Based on ${completedCount} completed file${completedCount !== 1 ? 's' : ''}`
          : "Upload files to see statistics"}
      </div>

      {/* Live Indicator */}
      {files.some(f => f.status !== "pending" && f.status !== "done" && f.status !== "error") && (
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            fontSize: "0.75rem",
            color: "#28a745"
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#28a745",
              animation: "pulse 1.5s infinite"
            }}
          ></span>
          Processing in progress...
        </div>
      )}

      {/* Pulse Animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.3;
            }
          }
        `}
      </style>
    </div>
  );
};

export default CompletionTimeCard;