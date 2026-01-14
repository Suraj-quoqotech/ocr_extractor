import React from 'react';

const HistoryTable = ({
  filteredHistory,
  history,
  selectedFiles,
  handleSelectAll,
  handleSelectFile,
  handleDownload,
  handleDelete,
  handleBulkDelete,
  formatDate,
  formatSize,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem"
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 600,
            color: theme === "dark" ? "#e0e0e0" : "#333"
          }}
        >
          Processing History
        </h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          {selectedFiles.length > 0 && (
            <button
              onClick={handleBulkDelete}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
                transition: "background-color 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#c82333";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#dc3545";
              }}
            >
              Delete Selected ({selectedFiles.length})
            </button>
          )}
        </div>
      </div>

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
            placeholder="Search files..."
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
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
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
          <option value="all">All Status</option>
          <option value="done">Success</option>
          <option value="error">Failed</option>
        </select>

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

      <div style={{ overflowX: "auto", flex: 1 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${theme === "dark" ? "#333" : "#e0e0e0"}` }}>
              <th
                style={{
                  padding: "0.75rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: theme === "dark" ? "#b0b0b0" : "#666"
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedFiles.length === filteredHistory.length && filteredHistory.length > 0}
                  onChange={handleSelectAll}
                  style={{ cursor: "pointer" }}
                />
              </th>
              <th
                style={{
                  padding: "0.75rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: theme === "dark" ? "#b0b0b0" : "#666"
                }}
              >
                File Name
              </th>
              <th
                style={{
                  padding: "0.75rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: theme === "dark" ? "#b0b0b0" : "#666"
                }}
              >
                Upload Date
              </th>
              <th
                style={{
                  padding: "0.75rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: theme === "dark" ? "#b0b0b0" : "#666"
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "0.75rem",
                  textAlign: "left",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: theme === "dark" ? "#b0b0b0" : "#666"
                }}
              >
               Delete
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: theme === "dark" ? "#666" : "#999"
                  }}
                >
                  No files found
                </td>
              </tr>
            )}
            {filteredHistory.map((fileObj, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: `1px solid ${theme === "dark" ? "#2a2a2a" : "#f0f0f0"}`,
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme === "dark" ? "#252525" : "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <td style={{ padding: "0.75rem" }}>
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(fileObj.file_name)}
                    onChange={() => handleSelectFile(fileObj.file_name)}
                    style={{ cursor: "pointer" }}
                  />
                </td>
                <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>📄</span>
                    <span style={{ color: theme === "dark" ? "#e0e0e0" : "#333" }}>
                      {fileObj.file_name}
                    </span>
                  </div>
                </td>
                <td
                  style={{
                    padding: "0.75rem",
                    fontSize: "0.875rem",
                    color: theme === "dark" ? "#888" : "#666"
                  }}
                >
                  {formatDate(fileObj.uploaded_at)}
                </td>
                <td style={{ padding: "0.75rem" }}>
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
                </td>
                <td style={{ padding: "0.75rem" }}>
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
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.7rem",
                      color: "#fff",
                      fontWeight: 500,
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        style={{
          marginTop: "1rem",
          fontSize: "0.875rem",
          color: theme === "dark" ? "#888" : "#666"
        }}
      >
        Showing {filteredHistory.length} of {history.length} files
      </div>
    </div>
  );
};

export default HistoryTable;