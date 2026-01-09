import React, { useState, useEffect } from "react";
import axios from "axios";

// API Base URL
const API_BASE_URL = "http://127.0.0.1:8000/api/ocr";

function App() {
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  // Output format settings - all checked by default
  const [outputFormats, setOutputFormats] = useState({
    pdf: true,
    txt: true,
    docx: true
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history/`);
      setHistory(response.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const handleFormatChange = (format) => {
    // Check if at least one format will remain checked
    const newFormats = { ...outputFormats, [format]: !outputFormats[format] };
    const hasAtLeastOne = Object.values(newFormats).some(v => v);
    
    if (!hasAtLeastOne) {
      alert("At least one output format must be selected!");
      return;
    }
    
    setOutputFormats(newFormats);
  };

  const addFiles = (newFiles) => {
    const fileObjects = newFiles.map((file) => ({
      file,
      status: "pending",
      result: null,
      progress: 0,
      id: Date.now() + Math.random()
    }));
    setFiles((prev) => [...prev, ...fileObjects]);
  };

  const uploadFile = async (fileObj, index) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: "processing", progress: 0 } : f))
    );

    const formData = new FormData();
    formData.append("file", fileObj.file);
    
    // Send selected output formats
    const selectedFormats = Object.keys(outputFormats).filter(key => outputFormats[key]);
    formData.append("output_formats", JSON.stringify(selectedFormats));

    try {
      const response = await axios.post(`${API_BASE_URL}/upload/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setFiles((prev) =>
            prev.map((f, i) =>
              i === index ? { ...f, progress: percentCompleted } : f
            )
          );
        },
      });

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "done",
                result: response.data,
                progress: 100,
              }
            : f
        )
      );

      fetchHistory();
    } catch (err) {
      console.error("Upload failed", err);
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "error", progress: 0 } : f))
      );
    }
  };

  const handleDelete = async (filename) => {
    try {
      await axios.delete(`${API_BASE_URL}/delete/${filename}/`);
      fetchHistory();
    } catch (err) {
      console.error("Delete failed", err);
    }
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

  const formatSize = (size) => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredHistory = history.filter((file) =>
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", backgroundColor: "#f5f5f5" }}>
      {/* Sidebar */}
      <div style={{ width: "240px", backgroundColor: "#fff", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", padding: "1.5rem 0" }}>
        {/* Logo */}
        <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#ff6b35", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <span style={{ color: "#ff6b35" }}>"</span>
            <span style={{ color: "#883f3fff" }}>Quoqo</span>
          </div>
          <div style={{ fontSize: "0.7rem", color: "#ff6b35", marginTop: "0.2rem", letterSpacing: "0.05em" }}>ENTERPRISE AI</div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          <div style={{ padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", backgroundColor: "#f8f9fa", borderLeft: "3px solid #5b7fff", color: "#5b7fff", fontWeight: 500 }}>
            <span style={{ fontSize: "1.1rem" }}>📤</span>
            <span>Upload</span>
          </div>
          <div style={{ padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", color: "#666" }}>
            <span style={{ fontSize: "1.1rem" }}>🕐</span>
            <span>History</span>
          </div>
          <div style={{ padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer", color: "#666" }}>
            <span style={{ fontSize: "1.1rem" }}>📄</span>
            <span>Documents</span>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <header style={{ backgroundColor: "#fff", borderBottom: "1px solid #e0e0e0", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600, color: "#070707ff" }}>Quoqo Technologies (P) Ltd.</h1>
            <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#666" }}>
              A secure, enterprise-grade Optical Character Recognition platform designed to extract, process, and manage text from scanned documents with accuracy and efficiency.
            </p>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: "1.3rem" }}>
              👤
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: "1.3rem" }}>
              ⚙️
            </button>
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                padding: "0.5rem 1.25rem",
                backgroundColor: "#5b7fff",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: "0.875rem"
              }}
            >
              {showHistory ? "Hide History" : "Show History"}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: 1, overflow: "auto", padding: "2rem", display: "flex", gap: "2rem" }}>
          {/* Left Panel - Upload & Queue */}
          <div style={{ flex: showHistory ? "0 0 58%" : 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Upload Dropzone */}
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "2rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: isDragging ? "2px dashed #5b7fff" : "2px dashed #d0d0d0",
                  borderRadius: "12px",
                  padding: "3rem 2rem",
                  textAlign: "center",
                  backgroundColor: isDragging ? "#f0f4ff" : "#fafafa",
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
                  <div style={{ fontSize: "1rem", color: "#333", marginBottom: "0.5rem", fontWeight: 500 }}>
                    Drag & drop or Click to select files
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#999" }}>
                    Supports PDF, JPEG, PNG, TIFF
                  </div>
                </label>
              </div>

              {/* Carousel Dots */}
              <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#5b7fff" }}></div>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#d0d0d0" }}></div>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#d0d0d0" }}></div>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#d0d0d0" }}></div>
              </div>
            </div>

            {/* Upload Queue */}
            {files.length > 0 && (
              <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 600, color: "#333" }}>Upload Queue</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                  {files.map((fileObj, index) => (
                    <div
                      key={fileObj.id}
                      style={{
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                        padding: "1rem",
                        backgroundColor: "#fafafa",
                        position: "relative"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "1.2rem" }}>📄</span>
                        <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#333", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {fileObj.file.name}
                        </div>
                      </div>
                      
                      <div style={{ fontSize: "0.75rem", color: "#666", marginBottom: "0.5rem" }}>
                        {fileObj.status === "pending" && "Pending"}
                        {fileObj.status === "processing" && "Processing"}
                        {fileObj.status === "done" && "Done"}
                        {fileObj.status === "error" && "Error"}
                      </div>

                      {fileObj.status === "processing" && (
                        <div style={{ backgroundColor: "#e0e0e0", borderRadius: "4px", height: "4px", overflow: "hidden", marginBottom: "0.5rem" }}>
                          <div style={{ backgroundColor: "#5b7fff", height: "100%", width: `${fileObj.progress}%`, transition: "width 0.3s ease" }}></div>
                        </div>
                      )}

                      {fileObj.status === "done" && (
                        <div style={{ fontSize: "0.75rem", color: "#28a745", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <span>✓</span>
                          <span>{fileObj.progress}%</span>
                        </div>
                      )}

                      {fileObj.status === "error" && (
                        <div style={{ fontSize: "0.75rem", color: "#dc3545", display: "flex", alignItems: "center", gap: "0.25rem" }}>
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
                            marginTop: "0.5rem"
                          }}
                        >
                          {fileObj.status === "error" ? "Retry" : "Start OCR"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Settings & History */}
          <div style={{ flex: showHistory ? "0 0 40%" : "0 0 350px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* OCR Settings */}
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 600, color: "#333" }}>Output Settings</h3>
              
              <div style={{ marginBottom: "0.5rem" }}>
                <div style={{ fontSize: "0.875rem", color: "#333", fontWeight: 500, marginBottom: "0.75rem" }}>
                  Output Formats:
                </div>
                
                <label style={{ fontSize: "0.875rem", color: "#666", display: "block", marginBottom: "0.5rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={outputFormats.pdf}
                    onChange={() => handleFormatChange('pdf')}
                    style={{ marginRight: "0.5rem" }} 
                  />
                  PDF Document
                </label>

                <label style={{ fontSize: "0.875rem", color: "#666", display: "block", marginBottom: "0.5rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={outputFormats.txt}
                    onChange={() => handleFormatChange('txt')}
                    style={{ marginRight: "0.5rem" }} 
                  />
                  Plain Text (TXT)
                </label>

                <label style={{ fontSize: "0.875rem", color: "#666", display: "block", marginBottom: "0.5rem", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={outputFormats.docx}
                    onChange={() => handleFormatChange('docx')}
                    style={{ marginRight: "0.5rem" }} 
                  />
                  Word Document (DOCX)
                </label>
                
                <div style={{ fontSize: "0.75rem", color: "#ad3535ff", marginTop: "0.75rem", fontStyle: "italic" }}>
                  * At least one format must be selected
                </div>
              </div>
            </div>

            {/* Processing History */}
            {showHistory && (
              <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 600, color: "#333" }}>Processing History</h3>
                
                {/* Search */}
                <div style={{ position: "relative", marginBottom: "1rem" }}>
                  <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#999" }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "75%",
                      padding: "0.5rem 0.75rem 0.5rem 2rem",
                      border: "1px solid #918686ff",
                      borderRadius: "6px",
                      fontSize: "0.875rem"
                    }}
                  />
                </div>

                {/* Table Header */}
                <div style={{ display: "grid", gridTemplateColumns: "2.5fr 2fr 1fr 1.5fr 1fr", gap: "0.5rem", padding: "0.5rem 0", borderBottom: "1px solid #e0e0e0", fontSize: "0.75rem", fontWeight: 600, color: "#141212ff" }}>
                  <div>Name</div>
                  <div>Date</div>
                  <div>Status</div>
                  <div>Download</div>
                  <div>Delete</div>
                </div>

                {/* History Items */}
                <div style={{ flex: 1, overflowY: "auto", marginTop: "0.5rem" }}>
                  {filteredHistory.length === 0 && (
                    <div style={{ textAlign: "center", color: "#999", padding: "2rem 0" }}>
                      No files found
                    </div>
                  )}
                  {filteredHistory.map((fileObj, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2.5fr 2fr 1fr 1.5fr 1fr",
                        gap: "0.5rem",
                        padding: "0.75rem 0",
                        borderBottom: "1px solid #f0f0f0",
                        fontSize: "0.875rem",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={fileObj.file_name}>
                        {idx + 1}. {fileObj.file_name}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#666" }}>
                        {new Date(fileObj.uploaded_at).toLocaleDateString()}
                      </div>
                      <div>
                        {fileObj.status === "done" ? (
                          <span style={{ color: "#28a745", fontSize: "0.75rem" }}>Success</span>
                        ) : (
                          <span style={{ color: "#dc3545", fontSize: "0.75rem" }}>Failed</span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                        {fileObj.status === "done" ? (
                          <>
                            {fileObj.pdf_url && (
                              <button
                                onClick={() => handleDownload(fileObj.pdf_url, fileObj.file_name.replace(/\.[^/.]+$/, "") + ".pdf")}
                                style={{
                                  padding: "0.25rem 0.4rem",
                                  backgroundColor: "#007bff",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "0.7rem",
                                  color: "#fff"
                                }}
                                title={`PDF (${formatSize(fileObj.pdf_size)})`}
                              >
                                PDF
                              </button>
                            )}
                            {fileObj.txt_url && (
                              <button
                                onClick={() => handleDownload(fileObj.txt_url, fileObj.file_name.replace(/\.[^/.]+$/, "") + ".txt")}
                                style={{
                                  padding: "0.25rem 0.4rem",
                                  backgroundColor: "#28a745",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "0.7rem",
                                  color: "#fff"
                                }}
                                title={`TXT (${formatSize(fileObj.txt_size)})`}
                              >
                                TXT
                              </button>
                            )}
                            {fileObj.docx_url && (
                              <button
                                onClick={() => handleDownload(fileObj.docx_url, fileObj.file_name.replace(/\.[^/.]+$/, "") + ".docx")}
                                style={{
                                  padding: "0.25rem 0.4rem",
                                  backgroundColor: "#ff8c00",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "0.7rem",
                                  color: "#fff"
                                }}
                                title={`DOCX (${formatSize(fileObj.docx_size)})`}
                              >
                                DOCX
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            style={{
                              padding: "0.25rem 0.5rem",
                              backgroundColor: "#fff3cd",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.7rem",
                              color: "#856404"
                            }}
                          >
                            Log
                          </button>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete "${fileObj.file_name}"?`)) {
                              handleDelete(fileObj.file_name);
                            }
                          }}
                          style={{
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "#dc3545",
                            border: "none",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontSize: "0.7rem",
                            color: "#ffffffff"
                          }}
                          title="Delete file"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>         
      </div>
    </div>
  );
}

export default App;