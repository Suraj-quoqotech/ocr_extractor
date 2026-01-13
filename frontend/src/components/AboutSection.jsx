import React from 'react';

const AboutSection = ({ theme }) => {
  return (
    <div
      style={{
        marginTop: "1rem",
        fontSize: "0.85rem",
        lineHeight: 1.6,
        color: theme === "dark" ? "#b0b0b0" : "#555",
        maxHeight: "300px",
        overflowY: "auto",
        padding: "1rem",
        backgroundColor: theme === "dark" ? "#252525" : "#f8f9fa",
        borderRadius: "8px",
        border: `1px solid ${theme === "dark" ? "#333" : "#e0e0e0"}`,
        transition: "all 0.3s ease"
      }}
    >
      <strong style={{ color: theme === "dark" ? "#e0e0e0" : "#333" }}>
        How OCR Works:
      </strong>
      <p style={{ margin: "0.5rem 0 1rem 0" }}>
        Optical Character Recognition (OCR) converts scanned documents,
        images, or PDFs into machine-readable text using image preprocessing,
        text detection, and AI-based character recognition models.
      </p>

      <strong style={{ color: theme === "dark" ? "#e0e0e0" : "#333" }}>
        Document Scanning:
      </strong>
      <ol style={{ margin: "0.5rem 0 1rem 0", paddingLeft: "1.5rem" }}>
        <li>Scan the document using the "Document Scanner" local App.</li>
        <li>Store it in the Zoho workdrive</li>
        <li>Upload it to the OCR system</li>
      </ol>

      <strong style={{ color: theme === "dark" ? "#e0e0e0" : "#333" }}>
        Processing Steps:
      </strong>
      <ol style={{ margin: "0.5rem 0 1rem 0", paddingLeft: "1.5rem" }}>
        <li>Upload a document (PDF, JPG, PNG)</li>
        <li>Click "Process Document"</li>
        <li>Review extracted text</li>
        <li>Export or save results</li>
      </ol>

      <div
        style={{
          marginTop: "1rem",
          padding: "0.75rem",
          backgroundColor: theme === "dark" ? "#1a1a1a" : "#e9ecef",
          borderRadius: "6px",
          fontSize: "0.8rem",
          color: theme === "dark" ? "#999" : "#666"
        }}
      >
        <strong style={{ color: theme === "dark" ? "#b0b0b0" : "#555" }}>
          💡 Tip:
        </strong>{" "}
        For best results, ensure documents are well-lit and text is clearly visible.
      </div>
    </div>
  );
};

export default AboutSection;