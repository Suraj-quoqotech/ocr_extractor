import React from 'react';
import AboutSection from './AboutSection';

const SettingsModal = ({ 
  showSettings, 
  setShowSettings, 
  theme, 
  setTheme,
  showAbout,
  setShowAbout 
}) => {
  if (!showSettings) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}
      onClick={() => {
        setShowSettings(false);
        setShowAbout(false);
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "520px",
          backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
          borderRadius: "12px",
          padding: "1.5rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          transition: "background-color 0.3s ease"
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: theme === "dark" ? "#e0e0e0" : "#333",
            fontSize: "1.5rem",
            fontWeight: 600
          }}
        >
          Settings
        </h2>

        {/* Appearance */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h4
            style={{
              color: theme === "dark" ? "#e0e0e0" : "#333",
              fontSize: "1rem",
              fontWeight: 500,
              marginBottom: "0.75rem"
            }}
          >
           ☀️ Appearance 🌙
          </h4>
          <button
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#5b7fff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "background-color 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#4a66e8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#5b7fff";
            }}
          >
            Switch to {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>

        {/* About */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h4
            style={{
              color: theme === "dark" ? "#e0e0e0" : "#333",
              fontSize: "1rem",
              fontWeight: 500,
              marginBottom: "0.75rem"
            }}
          >
            About
          </h4>
          <button
            onClick={() => setShowAbout(!showAbout)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
              transition: "background-color 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#218838";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#28a745";
            }}
          >
            {showAbout ? "Hide" : "View"} Steps 
          </button>

          {showAbout && <AboutSection theme={theme} />}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "right" }}>
          <button
            onClick={() => {
              setShowSettings(false);
              setShowAbout(false);
            }}
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;