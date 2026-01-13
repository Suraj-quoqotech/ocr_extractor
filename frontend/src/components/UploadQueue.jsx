import React, { useEffect, useState } from "react";

const STAGE_MAP = {
  pending: { label: "Pending", icon: "⏳" },
  uploading: { label: "Uploading", icon: "📤" },
  processing: { label: "Processing OCR", icon: "🔍" },
  generating: { label: "Generating Outputs", icon: "📄" },
  finalizing: { label: "Finalizing", icon: "✨" },
  done: { label: "Complete", icon: "✅" },
  error: { label: "Failed", icon: "❌" }
};

// helper: ms → mm:ss
const formatTime = (ms) => {
  if (!ms) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const UploadQueue = ({ files, uploadFile, theme }) => {
  const isDark = theme === "dark";

  // local timer tick (1s)
  const [, forceTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!files.length) return null;

  return (
    <div
      style={{
        backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
        borderRadius: 12,
        padding: "1.5rem",
        boxShadow: isDark
          ? "0 1px 4px rgba(0,0,0,0.6)"
          : "0 1px 3px rgba(0,0,0,0.1)"
      }}
    >
      <h3 style={{ marginBottom: "1rem", color: isDark ? "#e0e0e0" : "#333" }}>
        Upload Queue ({files.length})
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem"
        }}
      >
        {files.map((fileObj, index) => {
          const stage = STAGE_MAP[fileObj.status];

          // ⏱ determine elapsed time
          let elapsedMs = 0;
          if (fileObj.status !== "done" && fileObj.startedAt) {
            elapsedMs = Date.now() - fileObj.startedAt;
          } else if (fileObj.processingTime) {
            elapsedMs = fileObj.processingTime;
          }

          const badgeStyles = {
            done: { bg: isDark ? "#1a4d2e" : "#d4edda", color: isDark ? "#7cff7c" : "#155724" },
            error: { bg: isDark ? "#4d1a1a" : "#f8d7da", color: isDark ? "#ff7c7c" : "#721c24" },
            active: { bg: isDark ? "#1a3a4d" : "#d1ecf1", color: isDark ? "#7cc8ff" : "#0c5460" },
            pending: { bg: isDark ? "#4d4d1a" : "#fff3cd", color: isDark ? "#ffeb7c" : "#856404" }
          };

          const badge =
            fileObj.status === "done"
              ? badgeStyles.done
              : fileObj.status === "error"
              ? badgeStyles.error
              : fileObj.status === "pending"
              ? badgeStyles.pending
              : badgeStyles.active;

          return (
            <div
              key={fileObj.id}
              style={{
                border: `1px solid ${isDark ? "#333" : "#e0e0e0"}`,
                borderRadius: 8,
                padding: "1rem",
                backgroundColor: isDark ? "#252525" : "#fafafa"
              }}
            >
              {/* File name */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                📄
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: isDark ? "#e0e0e0" : "#333",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis"
                  }}
                  title={fileObj.file.name}
                >
                  {fileObj.file.name}
                </div>
              </div>

              {/* Status badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.25rem 0.75rem",
                  borderRadius: 12,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  marginBottom: "0.75rem",
                  backgroundColor: badge.bg,
                  color: badge.color
                }}
              >
                {stage.icon} {stage.label}
              </div>

              {/* Progress + timer */}
              {fileObj.status !== "pending" && (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.25rem",
                      fontSize: "0.7rem"
                    }}
                  >
                    <span style={{ color: isDark ? "#aaa" : "#666" }}>
                      Progress
                    </span>
                    <span style={{ color: "#5b7fff", fontWeight: 600 }}>
                      {fileObj.progress}%
                    </span>
                  </div>

                  <div
                    style={{
                      backgroundColor: isDark ? "#333" : "#e0e0e0",
                      borderRadius: 8,
                      height: 8,
                      overflow: "hidden",
                      marginBottom: "0.35rem"
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#5b7fff",
                        width: `${fileObj.progress}%`,
                        height: "100%",
                        transition: "width 0.4s ease"
                      }}
                    />
                  </div>

                  {/* ⏱ Timer */}
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: isDark ? "#aaa" : "#666",
                      textAlign: "right"
                    }}
                  >
                    ⏱ {formatTime(elapsedMs)}
                  </div>
                </>
              )}

              {/* Action */}
              {(fileObj.status === "pending" || fileObj.status === "error") && (
                <button
                  onClick={() => uploadFile(fileObj, index)}
                  style={{
                    width: "100%",
                    marginTop: "0.75rem",
                    padding: "0.5rem",
                    backgroundColor: "#5b7fff",
                    color: "#fff",
                    border: "none",
                    borderRadius: 4,
                    fontSize: "0.75rem",
                    cursor: "pointer"
                  }}
                >
                  {fileObj.status === "error" ? "Retry" : "Start OCR"}
                </button>
              )}

              {/* Size */}
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.7rem",
                  textAlign: "center",
                  color: isDark ? "#777" : "#999"
                }}
              >
                {(fileObj.file.size / 1024).toFixed(1)} KB
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UploadQueue;
