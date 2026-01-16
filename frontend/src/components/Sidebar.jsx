import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, theme, user }) => {
  const baseNavItems = [
    { id: 'upload', label: 'Upload', icon: '📤' },
    { id: 'history', label: 'History', icon: '📋' },
    { id: 'documents', label: 'Documents', icon: '📁' },
    { id: 'analytics', label: 'Analytics', icon: '📊' }
  ];

  // Add Users option only for admin users
  const navItems = user && (user.role === 'admin' || user.is_superuser)
    ? [...baseNavItems, { id: 'users', label: 'Users', icon: '👥' }]
    : baseNavItems;

  return (
    <div
      style={{
        width: "240px",
        backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
        borderRight: `1px solid ${theme === "dark" ? "#333" : "#e0e0e0"}`,
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 0",
        transition: "background-color 0.3s ease"
      }}
    >
      {/* Logo Section */}
      <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#ff6b35",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem"
          }}
        >
          <span style={{ color: "#ff6b35" }}>"</span>
          <span style={{ color: theme === "dark" ? "#e0e0e0" : "#333" }}>Quoqo</span>
        </div>
        <div
          style={{
            fontSize: "0.7rem",
            color: "#ff6b35",
            marginTop: "0.2rem",
            letterSpacing: "0.05em"
          }}
        >
          ENTERPRISE AI
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              padding: "0.75rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              cursor: "pointer",
              backgroundColor: activeTab === item.id 
                ? (theme === "dark" ? "#2a2a2a" : "#f8f9fa")
                : "transparent",
              borderLeft: activeTab === item.id 
                ? "3px solid #5b7fff" 
                : "3px solid transparent",
              color: activeTab === item.id 
                ? "#5b7fff" 
                : (theme === "dark" ? "#b0b0b0" : "#666"),
              fontWeight: activeTab === item.id ? 500 : 400,
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              if (activeTab !== item.id) {
                e.currentTarget.style.backgroundColor = theme === "dark" ? "#252525" : "#f0f0f0";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item.id) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;