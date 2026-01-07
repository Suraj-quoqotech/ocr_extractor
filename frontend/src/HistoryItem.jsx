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
        <strong>{fileObj.name}</strong>
        <div style={{ fontSize: "0.8rem", color: "#555", marginTop: "0.2rem" }}>
          Uploaded: {new Date(fileObj.timestamp * 1000).toLocaleString()}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "0.5rem" }}>
        <a href={fileObj.pdf} target="_blank" rel="noreferrer" style={buttonStyle("#007bff")} onMouseEnter={handleHover} onMouseLeave={handleLeave}>
          PDF
        </a>
        <a href={fileObj.txt} target="_blank" rel="noreferrer" style={buttonStyle("#28a745")} onMouseEnter={handleHover} onMouseLeave={handleLeave}>
          TXT
        </a>
        <a href={fileObj.docx} target="_blank" rel="noreferrer" style={buttonStyle("#ff8c00")} onMouseEnter={handleHover} onMouseLeave={handleLeave}>
          DOCX
        </a>
        <button onClick={() => onDelete(fileObj.name)} style={buttonStyle("#dc3545")} onMouseEnter={handleHover} onMouseLeave={handleLeave}>
          Delete
        </button>
      </div>
    </div>
  );
}
