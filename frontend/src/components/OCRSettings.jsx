import React from 'react';

const OCRSettings = ({ outputFormats, handleFormatChange, theme }) => {
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
        OCR Settings
      </h3>

      <div style={{ marginBottom: "0.5rem" }}>
        <div
          style={{
            fontSize: "0.875rem",
            color: theme === "dark" ? "#e0e0e0" : "#333",
            fontWeight: 500,
            marginBottom: "0.75rem"
          }}
        >
          Output Formats:
        </div>

        <label
          style={{
            fontSize: "0.875rem",
            color: theme === "dark" ? "#b0b0b0" : "#666",
            display: "block",
            marginBottom: "0.5rem",
            cursor: "pointer",
            transition: "color 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme === "dark" ? "#e0e0e0" : "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme === "dark" ? "#b0b0b0" : "#666";
          }}
        >
          <input
            type="checkbox"
            checked={outputFormats.pdf}
            onChange={() => handleFormatChange('pdf')}
            style={{ marginRight: "0.5rem", cursor: "pointer" }}
          />
          PDF Document
        </label>

        <label
          style={{
            fontSize: "0.875rem",
            color: theme === "dark" ? "#b0b0b0" : "#666",
            display: "block",
            marginBottom: "0.5rem",
            cursor: "pointer",
            transition: "color 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme === "dark" ? "#e0e0e0" : "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme === "dark" ? "#b0b0b0" : "#666";
          }}
        >
          <input
            type="checkbox"
            checked={outputFormats.txt}
            onChange={() => handleFormatChange('txt')}
            style={{ marginRight: "0.5rem", cursor: "pointer" }}
          />
          Plain Text (TXT)
        </label>

        <label
          style={{
            fontSize: "0.875rem",
            color: theme === "dark" ? "#b0b0b0" : "#666",
            display: "block",
            marginBottom: "0.5rem",
            cursor: "pointer",
            transition: "color 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme === "dark" ? "#e0e0e0" : "#333";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme === "dark" ? "#b0b0b0" : "#666";
          }}
        >
          <input
            type="checkbox"
            checked={outputFormats.docx}
            onChange={() => handleFormatChange('docx')}
            style={{ marginRight: "0.5rem", cursor: "pointer" }}
          />
          Word Document (DOCX)
        </label>

        <div
          style={{
            fontSize: "0.75rem",
            color: theme === "dark" ? "#777" : "#999",
            marginTop: "0.75rem",
            fontStyle: "italic"
          }}
        >
          * At least one format must be selected
        </div>
      </div>
    </div>
  );
};

export default OCRSettings;