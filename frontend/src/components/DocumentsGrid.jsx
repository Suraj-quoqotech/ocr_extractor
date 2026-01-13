import React from 'react';

const DocumentsGrid = ({
  filteredHistory,
  handleDownload,
  handleDelete,
  formatDate,
  formatSize,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  theme
}) => {
  return (
    <div
      style={{
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: theme === "dark"
          ? "0 1px 3px rgba(255,255,255,0.1)"
          : "0 1px 3px rgba(0,0,0,0.1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease"
      }}
    >
      <h2
        style={{
          margin: "0 0 1.5rem 0",
          fontSize: "1.5rem",
          fontWeight: 600,
          color: theme === "dark" ? "#e0e0e0" : "#333"
        }}
      >
        Document Library
      </h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: theme === "dark" ? "#666" : "#999"
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "70%",
              padding: "0.5rem 0.75rem 0.5rem 2.5rem",
              border: `1px solid ${theme === "dark" ? "#333" : "#e0e0e0"}`,
              borderRadius: "6px",
              fontSize: "0.875rem",
              backgroundColor: theme === "dark" ? "#252525" : "#fff",
              color: theme === "dark" ? "#e0e0e0" : "#333",
              transition: "all 0.3s ease"
            }}
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            border: `1px solid ${theme === "dark" ? "#333" : "#e0e0e0"}`,
            borderRadius: "6px",
            fontSize: "0.875rem",
            cursor: "pointer",
            backgroundColor: theme === "dark" ? "#252525" : "#fff",
            color: theme === "dark" ? "#e0e0e0" : "#333",
            transition: "all 0.3s ease"
          }}
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
        </select>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredHistory.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: theme === "dark" ? "#666" : "#999"
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
            <div>No documents found</div>
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "1.5rem"
          }}
        >
          {filteredHistory.map((fileObj, idx) => (
            <div
              key={idx}
              style={{
                border: `1px solid ${theme === "dark" ? "#333" : "#e0e0e0"}`,
                borderRadius: "12px",
                padding: "1rem",
                backgroundColor: theme === "dark" ? "#252525" : "#ffffff",
                boxShadow: theme === "dark"
                  ? "0 2px 4px rgba(255,255,255,0.05)"
                  : "0 2px 4px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = theme === "dark"
                  ? "0 4px 12px rgba(255,255,255,0.1)"
                  : "0 4px 12px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = theme === "dark"
                  ? "0 2px 4px rgba(255,255,255,0.05)"
                  : "0 2px 4px rgba(0,0,0,0.05)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ fontSize: "3rem", textAlign: "center", marginBottom: "1rem" }}>
                📄
              </div>

              <h3
                style={{
                  margin: "0 0 0.5rem 0",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: theme === "dark" ? "#e0e0e0" : "#333",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
                title={fileObj.file_name}
              >
                {fileObj.file_name}
              </h3>

              <div
                style={{
                  fontSize: "0.75rem",
                  color: theme === "dark" ? "#888" : "#666",
                  marginBottom: "1rem"
                }}
              >
                {formatDate(fileObj.uploaded_at)}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                {fileObj.status === "done" ? (
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor: theme === "dark" ? "#1a4d2e" : "#d4edda",
                      color: theme === "dark" ? "#7cff7c" : "#155724",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: 500
                    }}
                  >
                    Success
                  </span>
                ) : (
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor: theme === "dark" ? "#4d1a1a" : "#f8d7da",
                      color: theme === "dark" ? "#ff7c7c" : "#721c24",
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: 500
                    }}
                  >
                    Failed
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {fileObj.pdf_url && (
                  <button
                    onClick={() =>
                      handleDownload(
                        fileObj.pdf_url,
                        fileObj.file_name.replace(/\.[^/.]+$/, "") + ".pdf"
                      )
                    }
                    style={{
                      padding: "0.5rem",
                      backgroundColor: "#007bff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      color: "#fff",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#0056b3";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#007bff";
                    }}
                  >
                    <span>📕 PDF</span>
                    <span style={{ fontSize: "0.75rem" }}>{formatSize(fileObj.pdf_size)}</span>
                  </button>
                )}
                {fileObj.txt_url && (
                  <button
                    onClick={() =>
                      handleDownload(
                        fileObj.txt_url,
                        fileObj.file_name.replace(/\.[^/.]+$/, "") + ".txt"
                      )
                    }
                    style={{
                      padding: "0.5rem",
                      backgroundColor: "#28a745",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      color: "#fff",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#218838";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#28a745";
                    }}
                  >
                    <span>📝 TXT</span>
                    <span style={{ fontSize: "0.75rem" }}>{formatSize(fileObj.txt_size)}</span>
                  </button>
                )}
                {fileObj.docx_url && (
                  <button
                    onClick={() =>
                      handleDownload(
                        fileObj.docx_url,
                        fileObj.file_name.replace(/\.[^/.]+$/, "") + ".docx"
                      )
                    }
                    style={{
                      padding: "0.5rem",
                      backgroundColor: "#ff8c00",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      color: "#fff",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "background-color 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e67e00";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#ff8c00";
                    }}
                  >
                    <span>📘 DOCX</span>
                    <span style={{ fontSize: "0.75rem" }}>{formatSize(fileObj.docx_size)}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${fileObj.file_name}"?`)) {
                      handleDelete(fileObj.file_name);
                    }
                  }}
                  style={{
                    padding: "0.5rem",
                    backgroundColor: "#dc3545",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    color: "#fff",
                    fontWeight: 500,
                    marginTop: "0.5rem",
                    transition: "background-color 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#c82333";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#dc3545";
                  }}
                >
                   Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: "1rem",
          fontSize: "0.875rem",
          color: theme === "dark" ? "#888" : "#666"
        }}
      >
        Showing {filteredHistory.length} documents
      </div>
    </div>
  );
};

export default DocumentsGrid;