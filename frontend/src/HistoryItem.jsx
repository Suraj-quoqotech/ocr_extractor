import React from "react";

export default function HistoryItem({ fileObj, onDelete }) {
  const buttonStyle = (color) => ({
    padding: "0.4rem 0.8rem",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "white",
    backgroundColor: color,
    transition: "all 0.2s ease",
  });

  const handleHover = (e) => {
    e.target.style.transform = "scale(1.05)";
    e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  };

  const handleLeave = (e) => {
    e.target.style.transform = "scale(1)";
    e.target.style.boxShadow = "none";
  };

  // Convert bytes to KB/MB
  const formatSize = (size) => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "1rem",
        marginBottom: "0.8rem",
        borderRadius: "12px",
        backgroundColor: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 200px", minWidth: "150px" }}>
        <strong>{fileObj.file_name}</strong>
        <div style={{ fontSize: "0.8rem", color: "#555", marginTop: "0.2rem" }}>
          Uploaded: {new Date(fileObj.uploaded_at).toLocaleString()}
        </div>
        <div style={{ fontSize: "0.8rem", color: "#555", marginTop: "0.1rem" }}>
          Status: {fileObj.status.toUpperCase()}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "5px",
          marginTop: "0.5rem",
        }}
      >
        <a
          href={fileObj.pdf_url}
          target="_blank"
          rel="noreferrer"
          style={buttonStyle("#007bff")}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          PDF ({formatSize(fileObj.pdf_size)})
        </a>
        <a
          href={fileObj.txt_url}
          target="_blank"
          rel="noreferrer"
          style={buttonStyle("#28a745")}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          TXT ({formatSize(fileObj.txt_size)})
        </a>
        <a
          href={fileObj.docx_url}
          target="_blank"
          rel="noreferrer"
          style={buttonStyle("#ff8c00")}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          DOCX ({formatSize(fileObj.docx_size)})
        </a>
        <button
          onClick={() => onDelete(fileObj.file_name)}
          style={buttonStyle("#dc3545")}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
