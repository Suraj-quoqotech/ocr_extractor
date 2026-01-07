import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import HistoryList from "./HistoryList";
import backgroundImage from "./assets/pexels-caio-46274.jpg";

export default function App() {
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch history from backend
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
    display: "flex",
    alignItems: "center",
    gap: "5px",
  });

  const handleHover = (e) => {
    e.target.style.transform = "scale(1.05)";
    e.target.style.boxShadow = "0 6px 12px rgba(0,0,0,0.3)";
  };
  const handleLeave = (e) => {
    e.target.style.transform = "scale(1)";
    e.target.style.boxShadow = "0 4px 6px rgba(0,0,0,0.2)";
  };

  // Download helper
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

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: "done", result: res.data, progress: 100 }
            : f
        )
      );

      fetchHistory();
    } catch (err) {
      console.error(err);
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "error" } : f))
      );
    }
  };

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
        background: `linear-gradient(rgba(255,255,255,0.3), rgba(0,0,0,0.3)), url(${backgroundImage}) center/cover no-repeat`,
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

      {/* Show History button at top-right */}
      <div style={{ position: "absolute", top: "20px", right: "20px" }}>
        {!showHistory && (
          <button
            onClick={() => setShowHistory(true)}
            style={buttonStyle("#3672e4ff")}
            onMouseEnter={handleHover}
            onMouseLeave={handleLeave}
          >
            Show History
          </button>
        )}
      </div>

      {/* Main content container (blurred when history modal is active) */}
      <div
        style={{
          filter: showHistory ? "blur(5px)" : "none",
          transition: "filter 0.3s",
        }}
      >
        {/* Dropzone */}
        <div
          {...getRootProps()}
          style={{
            border: "2px dashed #007bff",
            borderRadius: "95px",
            padding: "2rem",
            textAlign: "center",
            maxWidth: "300px",
            minHeight: "40px",
            margin: "auto",
            backgroundColor: isDragActive ? "#2f73b3ff" : "#edf1f5ff",
            cursor: "pointer",
            marginBottom: "1.5rem",
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop PDFs here...</p>
          ) : (
            <p>Drag & drop or Click to select files</p>
          )}
        </div>

        {/* Current uploads */}
        <div style={{ maxWidth: "700px", margin: "auto" }}>
          {files.map((fileObj, index) => (
            <div
              key={index}
              style={{
                border: "2px solid #db8d8dff",
                padding: "1rem",
                marginBottom: "0.5rem",
                borderRadius: "15px",
                backgroundColor:
                  fileObj.status === "done"
                    ? "#e6ffed"
                    : fileObj.status === "error"
                    ? "#ffe6e6"
                    : "#fff",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong>{fileObj.file.name}</strong>

                {/* Inline Upload & OCR button */}
                {(fileObj.status === "pending" || fileObj.status === "error") && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "10px" }}
                  >
                    <button
                      onClick={() => uploadFile(fileObj, index)}
                      style={buttonStyle("#007bff")}
                      onMouseEnter={handleHover}
                      onMouseLeave={handleLeave}
                    >
                      Perform OCR
                    </button>

                    {fileObj.status === "uploading" && (
                      <div
                        style={{
                          width: "60px",
                          height: "10px",
                          border: "1px solid #007bff",
                          borderRadius: "5px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${fileObj.progress}%`,
                            height: "100%",
                            backgroundColor: "#14b90eff",
                            transition: "width 0.3s",
                          }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}
              </div>

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

              {fileObj.result && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  {["pdf", "txt", "docx"].map((type) => {
                    const color =
                      type === "pdf"
                        ? "#1f65afff"
                        : type === "txt"
                        ? "#3b7c4bff"
                        : "#c78d47ff";

                    const fileName = `${fileObj.file.name.replace(
                      /\.[^/.]+$/,
                      ""
                    )}.${type}`;

                    return (
                      <div
                        key={type}
                        style={{ display: "flex", alignItems: "center", gap: "5px" }}
                      >
                        <a
                          href={fileObj.result[type]}
                          target="_blank"
                          rel="noreferrer"
                          style={buttonStyle(color)}
                          onMouseEnter={handleHover}
                          onMouseLeave={handleLeave}
                        >
                          View {type.toUpperCase()}
                        </a>

                        {/* Emoji download */}
                        <span
                          onClick={() => handleDownload(fileObj.result[type], fileName)}
                          style={{
                            cursor: "pointer",
                            fontSize: "1.5rem",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                          title={`Download (${type.toUpperCase()})`}
                          onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")}
                          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                        >
                          ⬇️
                        </span>
                      </div>
                    );
                  })}

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
      </div>

      {/* History Modal */}
      {showHistory && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: "700px",
            maxHeight: "500px",
            backgroundColor: "#fff",
            borderRadius: "15px",
            padding: "1rem 2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2>Upload History</h2>
            <button
              onClick={() => setShowHistory(false)}
              style={buttonStyle("#3672e4ff")}
              onMouseEnter={handleHover}
              onMouseLeave={handleLeave}
            >
              Hide History
            </button>
          </div>
          <HistoryList history={history} onDelete={handleDelete} />
        </div>
      )}
    </div>
  );
}
