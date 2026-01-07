import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import HistoryList from "./HistoryList";

export default function App() {
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch history from backend (MySQL)
  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/ocr/history/");
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        status: "pending",
        result: null,
        progress: 0,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    },
    accept: { "application/pdf": [] },
    multiple: true,
  });

  const buttonStyle = (color) => ({
    padding: "0.5rem 1rem",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "white",
    backgroundColor: color,
    transition: "all 0.3s ease",
    marginRight: "10px",
  });

  const handleHover = (e) => {
    e.target.style.transform = "scale(1.05)";
    e.target.style.boxShadow = "0 6px 12px rgba(0,0,0,0.3)";
  };
  const handleLeave = (e) => {
    e.target.style.transform = "scale(1)";
    e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
  };

  // Upload a single file
  const uploadFile = async (fileObj, index) => {
    const formData = new FormData();
    formData.append("file", fileObj.file);

    setFiles((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, status: "uploading", progress: 0 } : f
      )
    );

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/ocr/upload/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (p) => {
            const percent = Math.round((p.loaded * 100) / p.total);
            setFiles((prev) =>
              prev.map((f, i) =>
                i === index ? { ...f, progress: percent } : f
              )
            );
          },
        }
      );

      // Update file status and result
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: "done", result: res.data, progress: 100 }
            : f
        )
      );

      // Refresh backend history after upload
      fetchHistory();
    } catch (err) {
      console.error(err);
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "error" } : f))
      );
    }
  };

  // Upload all pending/error files
  const handleUploadAll = () => {
    files.forEach((fileObj, index) => {
      if (fileObj.status === "pending" || fileObj.status === "error")
        uploadFile(fileObj, index);
    });
  };

  // Delete from backend (MySQL + local files)
  const handleDelete = async (filename) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/ocr/delete/${filename}/`);
      fetchHistory();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #eff1f3, #2565cc)",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "2rem",
          color: "#3e4a5a",
        }}
      >
        OCR Extractor
      </h1>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #007bff",
          borderRadius: "25px",
          padding: "2rem",
          textAlign: "center",
          maxWidth: "700px",
          minHeight: "150px",
          margin: "auto",
          backgroundColor: isDragActive ? "#d0e8ff" : "#f8f9fa",
          cursor: "pointer",
          marginBottom: "1.5rem",
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop PDFs here...</p>
        ) : (
          <p>Drag & drop PDFs here, or click to select files</p>
        )}
      </div>

      {/* Upload All */}
      {files.length > 0 && (
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <button
            onClick={handleUploadAll}
            style={buttonStyle("#007bff")}
            onMouseEnter={handleHover}
            onMouseLeave={handleLeave}
          >
            Upload & OCR
          </button>
        </div>
      )}

      {/* Current uploads */}
      <div style={{ maxWidth: "700px", margin: "auto" }}>
        {files.map((fileObj, index) => (
          <div
            key={index}
            style={{
              border: "2px solid #a39c9c",
              padding: "1rem",
              marginBottom: "0.5rem",
              borderRadius: "15px",
              backgroundColor:
                fileObj.status === "done"
                  ? "#e6ffed"
                  : fileObj.status === "error"
                  ? "#ffe6e6"
                  : "#fff",
            }}
          >
            <strong>{fileObj.file.name}</strong>
            <div>
              Status:{" "}
              <strong
                style={{
                  color:
                    fileObj.status === "done"
                      ? "green"
                      : fileObj.status === "uploading"
                      ? "blue"
                      : "red",
                }}
              >
                {fileObj.status}
              </strong>
            </div>

            {fileObj.status === "uploading" && (
              <div
                style={{
                  marginTop: "0.5rem",
                  height: "12px",
                  width: "100%",
                  backgroundColor: "#ddd",
                  borderRadius: "6px",
                }}
              >
                <div
                  style={{
                    width: `${fileObj.progress}%`,
                    height: "100%",
                    backgroundColor: "#007bff",
                    transition: "width 0.3s",
                  }}
                ></div>
              </div>
            )}

            {fileObj.result && (
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {["pdf", "txt", "docx"].map((type) => (
                  <a
                    key={type}
                    href={fileObj.result[type]}
                    target="_blank"
                    rel="noreferrer"
                    style={buttonStyle(
                      type === "pdf"
                        ? "#007bff"
                        : type === "txt"
                        ? "#28a745"
                        : "#ff8c00"
                    )}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleLeave}
                  >
                    {type.toUpperCase()}
                  </a>
                ))}
                {fileObj.status === "error" && (
                  <button
                    onClick={() => uploadFile(fileObj, index)}
                    style={buttonStyle("#dc3545")}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleLeave}
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* History toggle */}
      <div
        style={{
          textAlign: "left",
          marginTop: "2rem",
          marginBottom: "1rem",
        }}
      >
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={buttonStyle("#3672e4ff")}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
        >
          {showHistory ? "Hide History" : "Show History"}
        </button>
      </div>

      {/* History List */}
      {showHistory && <HistoryList history={history} onDelete={handleDelete} />}
    </div>
  );
}
