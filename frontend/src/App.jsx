import React, { useState, useEffect } from "react";
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

// Import notification helpers
import { notifyUploadSuccess, notifyUploadError } from "./utils/notificationHelper";

// API Base URL
const API_BASE_URL = "http://127.0.0.1:8000/api/ocr";

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState("light"); // light | dark
  const [showAbout, setShowAbout] = useState(false);

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

      // Show success notification
      notifyUploadSuccess(fileObj.file.name);

      fetchHistory();
    } catch (err) {
      console.error("Upload failed", err);
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "error", progress: 0 } : f))
      );

      // Show error notification
      notifyUploadError(fileObj.file.name);
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

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) {
      alert("No files selected!");
      return;
    }

    if (!window.confirm(`Delete ${selectedFiles.length} selected file(s)?`)) {
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/bulk-delete/`, {
        filenames: selectedFiles
      });
      setSelectedFiles([]);
      fetchHistory();
    } catch (err) {
      console.error("Bulk delete failed", err);
      alert("Failed to delete some files");
    }
  };

  const handleSelectFile = (filename) => {
    setSelectedFiles(prev => {
      if (prev.includes(filename)) {
        return prev.filter(f => f !== filename);
      } else {
        return [...prev, filename];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredHistory.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredHistory.map(f => f.file_name));
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

  const handleLogout = () => {
    // Clear session data
    setFiles([]);
    setSelectedFiles([]);
    setSearchTerm("");
    // You can add more logout logic here (clear tokens, redirect, etc.)
    alert("Logged out successfully!");
    // window.location.href = '/login'; // Redirect to login page
  };

  const formatSize = (size) => {
    if (!size) return "-";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter and sort history
  let filteredHistory = history.filter((file) => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Sort
  filteredHistory = [...filteredHistory].sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      case 'date_asc':
        return new Date(a.uploaded_at) - new Date(b.uploaded_at);
      case 'name_asc':
        return a.file_name.localeCompare(b.file_name);
      case 'name_desc':
        return b.file_name.localeCompare(a.file_name);
      default:
        return 0;
    }
  });

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: theme === "dark" ? "#121212" : "#f5f5f5",
        transition: "background-color 0.3s ease"
      }}
    >
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <Header 
          setShowSettings={setShowSettings} 
          theme={theme} 
          history={history}
          onLogout={handleLogout}
        />

        {/* Content Area - Upload Tab */}
        {activeTab === 'upload' && (
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "2rem",
              display: "flex",
              gap: "2rem"
            }}
          >
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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

            <div style={{ flex: "0 0 350px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <OCRSettings
                outputFormats={outputFormats}
                handleFormatChange={handleFormatChange}
                theme={theme}
              />
            </div>
          </div>
        )}

        {/* Content Area - History Tab */}
        {activeTab === 'history' && (
          <div style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
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
          </div>
        )}

        {/* Content Area - Documents Tab */}
        {activeTab === 'documents' && (
          <div style={{ flex: 1, overflow: "auto", padding: "2rem" }}>
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
          </div>
        )}

        {/* Content Area - Analytics Tab */}
        {activeTab === 'analytics' && (
          <Analytics history={history} theme={theme} />
        )}
      </div>

      {/* Settings Modal */}
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