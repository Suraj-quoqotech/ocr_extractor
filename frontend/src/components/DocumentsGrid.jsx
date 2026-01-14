import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Format completion time
const formatCompletionTime = (ms) => {
  if (!ms || ms === 0) return null;
  
  const totalSeconds = Math.floor(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds}s`;
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
};

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
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const isDark = theme === "dark";

  // Toggle selection
  const handleSelectDoc = (fileName) => {
    setSelectedDocs(prev =>
      prev.includes(fileName)
        ? prev.filter(f => f !== fileName)
        : [...prev, fileName]
    );
  };

  // Select all
  const handleSelectAll = () => {
    if (selectedDocs.length === filteredHistory.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(filteredHistory.map(f => f.file_name));
    }
  };



  // Download selected as ZIP
  const handleDownloadAsZip = async () => {
    if (selectedDocs.length === 0) {
      alert("No files selected!");
      return;
    }

    setIsDownloading(true);

    try {
      const zip = new JSZip();

      // Get selected file objects
      const selectedFiles = filteredHistory.filter(f =>
        selectedDocs.includes(f.file_name)
      );

      // Fetch and add each file to ZIP
      for (const fileObj of selectedFiles) {
        const baseName = fileObj.file_name.replace(/\.[^/.]+$/, "");
        
        // Add PDF
        if (fileObj.pdf_url) {
          try {
            const response = await fetch(fileObj.pdf_url);
            const blob = await response.blob();
            zip.file(`${baseName}.pdf`, blob);
          } catch (err) {
            console.error(`Failed to fetch PDF for ${baseName}`, err);
          }
        }

        // Add TXT
        if (fileObj.txt_url) {
          try {
            const response = await fetch(fileObj.txt_url);
            const blob = await response.blob();
            zip.file(`${baseName}.txt`, blob);
          } catch (err) {
            console.error(`Failed to fetch TXT for ${baseName}`, err);
          }
        }

        // Add DOCX
        if (fileObj.docx_url) {
          try {
            const response = await fetch(fileObj.docx_url);
            const blob = await response.blob();
            zip.file(`${baseName}.docx`, blob);
          } catch (err) {
            console.error(`Failed to fetch DOCX for ${baseName}`, err);
          }
        }
      }

      // Generate ZIP and download
      const content = await zip.generateAsync({ type: "blob" });
      const timestamp = new Date().toISOString().split('T')[0];
      saveAs(content, `ocr-documents-${timestamp}.zip`);

      // Clear selection
      setSelectedDocs([]);
    } catch (err) {
      console.error("Failed to create ZIP", err);
      alert("Failed to create ZIP file");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        padding: "2rem"
      }}
    >
      <div
        style={{
          backgroundColor: isDark ? "#1e1e1e" : "#fff",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: isDark
            ? "0 1px 3px rgba(255,255,255,0.1)"
            : "0 1px 3px rgba(0,0,0,0.1)",
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 600,
              color: isDark ? "#e0e0e0" : "#333"
            }}
          >
            Document Library
          </h2>

          {/* Bulk Actions */}
          {selectedDocs.length > 0 && (
            <button
              onClick={handleDownloadAsZip}
              disabled={isDownloading}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: isDownloading ? "#6c757d" : "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: isDownloading ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "background-color 0.2s ease"
              }}
              onMouseEnter={(e) => {
                if (!isDownloading) {
                  e.currentTarget.style.backgroundColor = "#218838";
                }
              }}
              onMouseLeave={(e) => {
                if (!isDownloading) {
                  e.currentTarget.style.backgroundColor = "#28a745";
                }
              }}
            >
              {isDownloading ? (
                <>
                  <span>⏳</span>
                  <span>Creating ZIP...</span>
                </>
              ) : (
                <>
                  <span>📦</span>
                  <span>Download Selected as ZIP ({selectedDocs.length})</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {/* Select All Checkbox */}
          {filteredHistory.length > 0 && (
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: isDark ? "#e0e0e0" : "#333",
                fontWeight: 500
              }}
            >
              <input
                type="checkbox"
                checked={selectedDocs.length === filteredHistory.length && filteredHistory.length > 0}
                onChange={handleSelectAll}
                style={{ cursor: "pointer", width: "16px", height: "16px" }}
              />
              Select All
            </label>
          )}

          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: isDark ? "#666" : "#999"
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
                width: "50%",
                padding: "0.5rem 0.75rem 0.5rem 2.5rem",
                border: `1px solid ${isDark ? "#333" : "#e0e0e0"}`,
                borderRadius: "6px",
                fontSize: "0.875rem",
                backgroundColor: isDark ? "#252525" : "#fff",
                color: isDark ? "#e0e0e0" : "#333",
                transition: "all 0.3s ease"
              }}
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "0.5rem 1rem",
              border: `1px solid ${isDark ? "#333" : "#e0e0e0"}`,
              borderRadius: "6px",
              fontSize: "0.875rem",
              cursor: "pointer",
              backgroundColor: isDark ? "#252525" : "#fff",
              color: isDark ? "#e0e0e0" : "#333",
              transition: "all 0.3s ease"
            }}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
          </select>
        </div>

        {/* Documents Grid */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredHistory.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: isDark ? "#666" : "#999"
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
              <div>No documents found</div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "1.5rem"
              }}
            >
              {filteredHistory.map((fileObj, idx) => {
                const isSelected = selectedDocs.includes(fileObj.file_name);
                const completionTime = formatCompletionTime(fileObj.processing_time);

                return (
                  <div
                    key={idx}
                    style={{
                      border: isSelected
                        ? `2px solid #5b7fff`
                        : `1px solid ${isDark ? "#333" : "#e0e0e0"}`,
                      borderRadius: "12px",
                      padding: "1rem",
                      backgroundColor: isDark ? "#252525" : "#ffffff",
                      boxShadow: isDark
                        ? "0 2px 4px rgba(255,255,255,0.05)"
                        : "0 2px 4px rgba(0,0,0,0.05)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      position: "relative"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = isDark
                        ? "0 4px 12px rgba(255,255,255,0.1)"
                        : "0 4px 12px rgba(0,0,0,0.1)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = isDark
                        ? "0 2px 4px rgba(255,255,255,0.05)"
                        : "0 2px 4px rgba(0,0,0,0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      style={{
                        position: "absolute",
                        top: "0.75rem",
                        right: "0.75rem"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectDoc(fileObj.file_name)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          cursor: "pointer",
                          width: "18px",
                          height: "18px"
                        }}
                      />
                    </div>

                    <div style={{ fontSize: "3rem", textAlign: "center", marginBottom: "1rem" }}>
                      📄
                    </div>

                    <h3
                      style={{
                        margin: "0 0 0.5rem 0",
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: isDark ? "#e0e0e0" : "#333",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        paddingRight: "2rem"
                      }}
                      title={fileObj.file_name}
                    >
                      {fileObj.file_name}
                    </h3>

                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: isDark ? "#888" : "#666",
                        marginBottom: "0.5rem"
                      }}
                    >
                      {formatDate(fileObj.uploaded_at)}
                    </div>

                    {/* Completion Time */}
                    {completionTime && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "#17a2b8",
                          marginBottom: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontWeight: 500
                        }}
                      >
                        <span>⏱️</span>
                        <span>{completionTime}</span>
                      </div>
                    )}

                    <div style={{ marginBottom: "1rem" }}>
                      {fileObj.status === "done" ? (
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            backgroundColor: isDark ? "#1a4d2e" : "#d4edda",
                            color: isDark ? "#7cff7c" : "#155724",
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
                            backgroundColor: isDark ? "#4d1a1a" : "#f8d7da",
                            color: isDark ? "#ff7c7c" : "#721c24",
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(
                              fileObj.file_name,
                              'pdf',
                              fileObj.file_name.replace(/\.[^/.]+$/, "") + ".pdf"
                            );
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(
                              fileObj.file_name,
                              'txt',
                              fileObj.file_name.replace(/\.[^/.]+$/, "") + ".txt"
                            );
                          }}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(
                              fileObj.file_name,
                              'docx',
                              fileObj.file_name.replace(/\.[^/.]+$/, "") + ".docx"
                            );
                          }}
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
                        onClick={(e) => {
                          e.stopPropagation();
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
                );
              })}
            </div>   
          )}
        </div>

        <div
          style={{
            marginTop: "1rem",
            fontSize: "0.875rem",
            color: isDark ? "#888" : "#666",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <span>Showing {filteredHistory.length} documents</span>
          {selectedDocs.length > 0 && (
            <span style={{ color: "#5b7fff", fontWeight: 500 }}>
              {selectedDocs.length} selected
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsGrid;