import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

// Import Components
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import UploadArea from "./components/UploadArea";
import UploadQueue from "./components/UploadQueue";
import OCRSettings from "./components/OCRSettings";
import SettingsModal from "./components/SettingsModal";
import HistoryTable from "./components/HistoryTable";
import DocumentsGrid from "./components/DocumentsGrid";
import Analytics from "./components/Analytics";
import AverageProcessingTimeCard from "./components/AverageProcessingTimeCard";

// Notifications
import {
  notifyUploadSuccess,
  notifyUploadError
} from "./utils/notificationHelper";

const API_BASE_URL = "http://127.0.0.1:8000/api/ocr";

function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState("light");
  const [showAbout, setShowAbout] = useState(false);

  const [outputFormats, setOutputFormats] = useState({
    pdf: true,
    txt: true,
    docx: true
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  /* ==============================
     GLOBAL AVERAGE (SINGLE SOURCE)
     ============================== */
  const globalAvgProcessingTime = useMemo(() => {
    const valid = history.filter(
      f => typeof f.processing_time === "number" && f.processing_time > 0
    );

    if (!valid.length) return null;

    const total = valid.reduce((sum, f) => sum + f.processing_time, 0);
    return Math.round(total / valid.length);
  }, [history]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/history/`);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  /* ==============================
     DRAG & DROP
     ============================== */
  const handleDragOver = e => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = e => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileSelect = e => {
    addFiles(Array.from(e.target.files));
  };

  const handleFormatChange = format => {
    const next = { ...outputFormats, [format]: !outputFormats[format] };
    if (!Object.values(next).some(Boolean)) {
      alert("At least one output format must be selected!");
      return;
    }
    setOutputFormats(next);
  };

  /* ==============================
     ADD FILES
     ============================== */
  const addFiles = newFiles => {
    const mapped = newFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: "pending",
      progress: 0,
      result: null,

      // timing (frontend source of truth)
      startedAt: null,
      finishedAt: null,
      processingTime: null
    }));

    setFiles(prev => [...prev, ...mapped]);
  };

  /* ==============================
     UPLOAD FILE
     ============================== */
  const uploadFile = async (fileObj, index) => {
    const startTime = Date.now();

    setFiles(prev =>
      prev.map((f, i) =>
        i === index
          ? { ...f, status: "uploading", progress: 0, startedAt: startTime }
          : f
      )
    );

    const formData = new FormData();
    formData.append("file", fileObj.file);

    const selectedFormats = Object.keys(outputFormats).filter(
      k => outputFormats[k]
    );
    formData.append("output_formats", JSON.stringify(selectedFormats));

    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: e => {
            const percent = Math.round((e.loaded * 100) / e.total);
            const capped = Math.min(percent * 0.25, 25);

            setFiles(prev =>
              prev.map((f, i) =>
                i === index ? { ...f, progress: capped } : f
              )
            );
          }
        }
      );

      // visual phases
      setFiles(prev =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "processing", progress: 65 } : f
        )
      );
      setFiles(prev =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "generating", progress: 85 } : f
        )
      );
      setFiles(prev =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "finalizing", progress: 95 } : f
        )
      );

      // ⏱️ FINAL TIME — EXACTLY WHEN 100%
      const endTime = Date.now();
      const duration = endTime - startTime;

      setFiles(prev =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "done",
                progress: 100,
                finishedAt: endTime,
                processingTime: duration,
                result: response.data
              }
            : f
        )
      );

      notifyUploadSuccess(fileObj.file.name);
      fetchHistory();
    } catch (err) {
      console.error("Upload failed", err);

      setFiles(prev =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "error", progress: 0 } : f
        )
      );

      notifyUploadError(fileObj.file.name);
    }
  };

  /* ==============================
     DELETE / BULK DELETE
     ============================== */
  const handleDelete = async filename => {
    try {
      await axios.delete(`${API_BASE_URL}/delete/${filename}/`);
      fetchHistory();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedFiles.length) return alert("No files selected!");
    if (!window.confirm(`Delete ${selectedFiles.length} file(s)?`)) return;

    try {
      await axios.post(`${API_BASE_URL}/bulk-delete/`, {
        filenames: selectedFiles
      });
      setSelectedFiles([]);
      fetchHistory();
    } catch (err) {
      console.error("Bulk delete failed", err);
    }
  };

  /* ==============================
     HELPERS
     ============================== */
  const formatSize = size => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = dateString =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  let filteredHistory = history.filter(file => {
    const matchSearch = file.file_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "all" || file.status === filterStatus;
    return matchSearch && matchStatus;
  });

  /* ==============================
     RENDER
     ============================== */
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: theme === "dark" ? "#121212" : "#f5f5f5"
      }}
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header theme={theme} history={history} setShowSettings={setShowSettings} />

        {activeTab === "upload" && (
          <div style={{ padding: "2rem", display: "flex", gap: "2rem" }}>
            <div style={{ flex: 1 }}>
              <UploadArea
                isDragging={isDragging}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
                handleFileSelect={handleFileSelect}
                theme={theme}
              />
              <UploadQueue files={files} uploadFile={uploadFile} theme={theme} />
            </div>

            <div style={{ width: 350 }}>
              <OCRSettings
                outputFormats={outputFormats}
                handleFormatChange={handleFormatChange}
                theme={theme}
              />
              <AverageProcessingTimeCard
                avgTime={globalAvgProcessingTime}
                totalDocs={history.filter(f => f.processing_time > 0).length}
                theme={theme}
              />
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <HistoryTable
            filteredHistory={filteredHistory}
            history={history}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            handleDelete={handleDelete}
            handleBulkDelete={handleBulkDelete}
            formatDate={formatDate}
            formatSize={formatSize}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
            theme={theme}
          />
        )}

        {activeTab === "documents" && (
          <DocumentsGrid
            filteredHistory={filteredHistory}
            handleDelete={handleDelete}
            formatDate={formatDate}
            formatSize={formatSize}
            theme={theme}
          />
        )}

        {activeTab === "analytics" && (
          <Analytics history={history} theme={theme} />
        )}
      </div>

      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        theme={theme}
        setTheme={setTheme}
        showAbout={showAbout}
        setShowAbout={setShowAbout}
      />
    </div>
  );
}

export default App;
