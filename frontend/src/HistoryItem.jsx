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
    display: "flex",
    alignItems: "center",
    gap: "5px",
  });

  const handleHover = (e) => {
    e.target.style.transform = "scale(1.05)";
    e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  };
  const handleLeave = (e) => {
    e.target.style.transform = "scale(1)";
    e.target.style.boxShadow = "none";
  };

  const formatSize = (size) => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed", err);
    }
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
        <div style={{ fontSize: "0.8rem", color: "#555" }}>
          Uploaded: {new Date(fileObj.uploaded_at).toLocaleString()}
        </div>
        <div style={{ fontSize: "0.8rem", color: "#555" }}>
          Status: {fileObj.status.toUpperCase()}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {["pdf", "txt", "docx"].map((type) => {
          const color =
            type === "pdf"
              ? "#007bff"
              : type === "txt"
              ? "#28a745"
              : "#ff8c00";

          const fileName = `${fileObj.file_name.replace(/\.[^/.]+$/, "")}.${type}`;

          return (
            <div key={type} style={{ display: "flex", gap: "4px" }}>
              <a
                href={fileObj[`${type}_url`]}
                target="_blank"
                rel="noreferrer"
                style={buttonStyle(color)}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
              >
                View {type.toUpperCase()}
              </a>
              <button
                onClick={() => handleDownload(fileObj[`${type}_url`], fileName)}
                style={buttonStyle("#972d2dff")}
                onMouseEnter={handleHover}
                onMouseLeave={handleLeave}
                title={`Download (${formatSize(fileObj[`${type}_size`])})`}
              >
                ⬇
              </button>
            </div>
          );
        })}

        <button
          onClick={() => onDelete(fileObj.file_name)}
          style={buttonStyle("#3812c4ff")}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          🗑 Delete
        </button>
      </div>
    </div>
  );
}
