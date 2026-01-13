import React from 'react';

const UploadArea = ({ 
  isDragging, 
  handleDragOver, 
  handleDragLeave, 
  handleDrop, 
  handleFileSelect,
  theme 
}) => {
  return (
    <div
      style={{
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: theme === "dark" 
          ? "0 1px 3px rgba(255,255,255,0.1)" 
          : "0 1px 3px rgba(0,0,0,0.1)",
        transition: "all 0.3s ease"
      }}
    >
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging 
            ? "2px dashed #5b7fff" 
            : `2px dashed ${theme === "dark" ? "#444" : "#d0d0d0"}`,
          borderRadius: "12px",
          padding: "3rem 2rem",
          textAlign: "center",
          backgroundColor: isDragging 
            ? (theme === "dark" ? "#1a2040" : "#f0f4ff")
            : (theme === "dark" ? "#252525" : "#fafafa"),
          cursor: "pointer",
          transition: "all 0.3s ease"
        }}
      >
        <input
          type="file"
          id="fileInput"
          onChange={handleFileSelect}
          multiple
          accept="application/pdf,image/*"
          style={{ display: "none" }}
        />
        <label htmlFor="fileInput" style={{ cursor: "pointer", display: "block" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📄</div>
          <div
            style={{
              fontSize: "1rem",
              color: theme === "dark" ? "#e0e0e0" : "#333",
              marginBottom: "0.5rem",
              fontWeight: 500
            }}
          >
            Drag & drop or Click to select files
          </div>
          <div
            style={{
              fontSize: "0.875rem",
              color: theme === "dark" ? "#888" : "#999"
            }}
          >
            Supports uploading PDF & Docx
          </div>
        </label>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "1.5rem"
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#5b7fff"
          }}
        ></div>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: theme === "dark" ? "#444" : "#d0d0d0"
          }}
        ></div>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: theme === "dark" ? "#444" : "#d0d0d0"
          }}
        ></div>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: theme === "dark" ? "#444" : "#d0d0d0"
          }}
        ></div>
      </div>
    </div>
  );
};

export default UploadArea;