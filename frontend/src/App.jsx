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
import CompletionTimeCard from "./components/CompletionTimeCard";

// Import notification helpers
import {
  notifyUploadSuccess,
  notifyUploadError
} from "./utils/notificationHelper";

// API Base URL
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

  const fetchHistory = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/history/`);

    const savedTimes = JSON.parse(
      localStorage.getItem("processingTimes") || "{}"
    );

    const enrichedHistory = res.data.map(file => ({
      ...file,
      processing_time: savedTimes[file.file_name] || null
    }));

    setHistory(enrichedHistory);
  } catch (err) {
    console.error("Failed to fetch history", err);
  }
};


  // Drag & Drop
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

  // Add files to queue
  const addFiles = newFiles => {
    const fileObjects = newFiles.map(file => ({
      file,
      id: Date.now() + Math.random(),
      status: "pending",
      progress: 0,
      result: null,
      startedAt: null,
      finishedAt: null
    }));

    setFiles(prev => [...prev, ...fileObjects]);
  };

  const uploadFile = async (fileObj, index) => {
  const startTime = Date.now(); // ⏱️ Start timer

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
    key => outputFormats[key]
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

    // UI stages
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

    // ⏱️ Calculate completion time
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    const savedTimes = JSON.parse(localStorage.getItem('processingTimes') || '{}');
    savedTimes[fileObj.file.name] = processingTime;
    localStorage.setItem('processingTimes', JSON.stringify(savedTimes));
    // Final update with completion time
    setFiles(prev =>
      prev.map((f, i) =>
        i === index
          ? {
              ...f,
              status: "done",
              progress: 100,
              result: response.data,
              finishedAt: endTime,
              processingTime: processingTime
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

  // Delete
  const handleDelete = async filename => {
    try {
      await axios.delete(`${API_BASE_URL}/delete/${filename}/`);
      fetchHistory();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (!selectedFiles.length) return;
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

  const handleSelectFile = filename => {
    setSelectedFiles(prev =>
      prev.includes(filename)
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
  };

  const handleSelectAll = () => {
    setSelectedFiles(
      selectedFiles.length === filteredHistory.length
        ? []
        : filteredHistory.map(f => f.file_name)
    );
  };

  const handleDownload = async (url, filename) => {
    const res = await fetch(url);
    const blob = await res.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const formatSize = size => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = date =>
    new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  let filteredHistory = history.filter(file => {
    const matchesSearch = file.file_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || file.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  filteredHistory.sort((a, b) => {
    if (sortBy === "date_desc")
      return new Date(b.uploaded_at) - new Date(a.uploaded_at);
    if (sortBy === "date_asc")
      return new Date(a.uploaded_at) - new Date(b.uploaded_at);
    if (sortBy === "name_asc")
      return a.file_name.localeCompare(b.file_name);
    if (sortBy === "name_desc")
      return b.file_name.localeCompare(a.file_name);
    return 0;
  });

  return (
    <div style={{ display: "flex", height: "100vh", background: theme === "dark" ? "#121212" : "#f5f5f5" }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header theme={theme} setShowSettings={setShowSettings} history={history} />
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

            {/* Right sidebar with OCR Settings and Completion Time Card */}
            <div style={{ width: 350, display: "flex", flexDirection: "column", gap: "0" }}>
              <OCRSettings
                outputFormats={outputFormats}
                handleFormatChange={handleFormatChange}
                theme={theme}
              />
              {/* ⏱️ Add Completion Time Card HERE */}
              <CompletionTimeCard files={history} theme={theme} />
            </div>
          </div>
        )}

        {activeTab === "history" && (
          <HistoryTable
            filteredHistory={filteredHistory}
            history={history}
            selectedFiles={selectedFiles}
            handleSelectAll={handleSelectAll}
            handleSelectFile={handleSelectFile}
            handleDownload={handleDownload}
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
            handleDownload={handleDownload}
            handleDelete={handleDelete}
            formatDate={formatDate}
            formatSize={formatSize}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
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
