import React from "react";
import HistoryItem from "./HistoryItem";

export default function HistoryList({ history, onDelete }) {
  if (history.length === 0) return <p style={{ textAlign: "center", color: "#333" }}>No previous uploads yet.</p>;

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "auto",
        marginTop: "1rem",
        maxHeight: "400px",
        overflowY: "auto",
        paddingRight: "5px",
      }}
    >
      {history.map((fileObj) => (
        <HistoryItem key={fileObj.file_name} fileObj={fileObj} onDelete={onDelete} />
      ))}
    </div>
  );
}
