import React, { useState } from "react";
import HistoryItem from "./HistoryItem";

export default function HistoryList({ history, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter((file) =>
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (history.length === 0)
    return <p style={{ textAlign: "center", color: "#333" }}>No previous uploads yet.</p>;

  return (
    <div style={{ flex: 1, overflowY: "auto", marginTop: "1rem" }}>
      {/* Search */}
      <input
        type="text"
        placeholder="Search files..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem 1rem",
          marginBottom: "1rem",
          borderRadius: "10px",
          border: "1px solid #ccc",
        }}
      />

      {/* History items */}
      {filteredHistory.length === 0 && (
        <p style={{ textAlign: "center", color: "#555" }}>No matching files.</p>
      )}
      {filteredHistory.map((fileObj) => (
        <HistoryItem key={fileObj.file_name} fileObj={fileObj} onDelete={onDelete} />
      ))}
    </div>
  );
}
