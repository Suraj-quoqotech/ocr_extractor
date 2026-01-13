import React from 'react';
import UserProfile from './UserProfile';

const Header = ({ setShowSettings, theme, history, onLogout }) => {
  return (
    <header
      style={{
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
        borderBottom: `1px solid ${theme === "dark" ? "#333" : "#e0e0e0"}`,
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "background-color 0.3s ease"
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 600,
            color: theme === "dark" ? "#e0e0e0" : "#333"
          }}
        >
          Quoqo Technologies (P) Ltd.
        </h1>
        <p
          style={{
            margin: "0.25rem 0 0 0",
            fontSize: "0.875rem",
            color: theme === "dark" ? "#b0b0b0" : "#666"
          }}
        >
          A secure, enterprise-grade Optical Character Recognition platform designed to
          extract, process, and manage text from scanned documents with accuracy and
          efficiency.
        </p>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <UserProfile theme={theme} history={history} onLogout={onLogout} />
        <button
          onClick={() => setShowSettings(true)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: theme === "dark" ? "#e0e0e0" : "#666",
            fontSize: "1.3rem",
            transition: "transform 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ⚙️
        </button>
      </div>
    </header>
  );
};

export default Header;