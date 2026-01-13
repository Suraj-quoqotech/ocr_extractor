import React from 'react';

const UploadQueue = ({ files, uploadFile, theme }) => {
  if (files.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: theme === "dark"
          ? "0 1px 3px rgba(255,255,255,0.1)"
          : "0 1px 3px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease"
      }}
    >
      <h3
        style={{
          margin: "0 0 1rem 0",
          fontSize: "1rem",
          fontWeight: 600,
          color: theme === "dark" ? "#e0e0e0" : "#333"
        }}
      >
        Upload Queue
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))",
          gap: "1rem"
        }}
      >
        {files.map((fileObj, index) => (
          <div
            key={fileObj.id}
            style={{
              border: `1px solid ${theme === "dark" ? "#333" : "#e0e0e0"}`,
              borderRadius: "20px",
              padding: "1rem",
              backgroundColor: theme === "dark" ? "#252525" : "#fafafa",
              transition: "all 0.3s ease"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem"
              }}
            >
              <span style={{ fontSize: "1.2rem" }}>📄</span>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: theme === "dark" ? "#e0e0e0" : "#333",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flex: 1
                }}
              >
                {fileObj.file.name}
              </div>
            </div>

            <div
              style={{
                fontSize: "0.75rem",
                color: theme === "dark" ? "#888" : "#666",
                marginBottom: "0.5rem"
              }}
            >
              {fileObj.status === "pending" && "Pending"}
              {fileObj.status === "processing" && "Processing"}
              {fileObj.status === "done" && "Done"}
              {fileObj.status === "error" && "Error"}
            </div>

            {fileObj.status === "processing" && (
              <div
                style={{
                  backgroundColor: theme === "dark" ? "#333" : "#e0e0e0",
                  borderRadius: "4px",
                  height: "4px",
                  overflow: "hidden",
                  marginBottom: "0.5rem"
                }}
              >
                <div
                  style={{
                    backgroundColor: "#12c521ff",
                    height: "100%",
                    width: `${fileObj.progress}%`,
                    transition: "width 0.3s ease"
                  }}
                ></div>
              </div>
            )}

            {fileObj.status === "done" && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#28a745",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem"
                }}
              >
                <span>✓</span>
                <span>{fileObj.progress}%</span>
              </div>
            )}

            {fileObj.status === "error" && (
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#dc3545",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem"
                }}
              >
                <span>✗</span>
                <span>Failed</span>
              </div>
            )}

            {(fileObj.status === "pending" || fileObj.status === "error") && (
              <button
                onClick={() => uploadFile(fileObj, index)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  backgroundColor: "#5b7fff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  marginTop: "0.5rem",
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#4a66e8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#5b7fff";
                }}
              >
                {fileObj.status === "error" ? "Retry" : "Start OCR"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadQueue;