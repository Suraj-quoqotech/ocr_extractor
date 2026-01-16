import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, Filter, Download, RefreshCw, AlertCircle, CheckCircle, Clock, Trash2, ChevronDown, ChevronRight, User } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/api/ocr";

export default function Users({ theme = 'light' }) {
  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("username");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/auth/users/`);
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  const deleteUser = async (username) => {
    if (!window.confirm(`Delete user "${username}" permanently? This action cannot be undone.`)) return;
    try {
      await axios.delete(`${API_BASE}/auth/delete-user/${username}/`);
      fetchUsers();
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const exportData = () => {
    const csv = [
      ["Username", "Email", "Role", "Total Uploads", "Storage Used", "Last Activity"].join(","),
      ...filteredUsers.map(u => 
        [u.username, u.email, u.role, u.total_uploads, u.total_size || 0, u.documents[0]?.uploaded_at || "N/A"].join(",")
      )
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  /* ---------- Helpers ---------- */

  const formatSize = (s) =>
    !s ? "0 B" : s < 1024 ? `${s} B` : s < 1048576 ? `${(s / 1024).toFixed(1)} KB` : `${(s / 1048576).toFixed(2)} MB`;

  const formatDate = (d) =>
    new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

  const getRelativeTime = (d) => {
    const diff = Date.now() - new Date(d);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  /* ---------- Derived Data ---------- */

  const filteredUsers = useMemo(() => {
    let filtered = users.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchSearch && matchRole;
    });

    filtered.sort((a, b) => {
      if (sortBy === "username") return a.username.localeCompare(b.username);
      if (sortBy === "uploads") return b.total_uploads - a.total_uploads;
      if (sortBy === "storage") return (b.total_size || 0) - (a.total_size || 0);
      return 0;
    });

    return filtered;
  }, [users, search, roleFilter, sortBy]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter(u => u.role === "admin").length,
    activeUsers: users.filter(u => u.total_uploads > 0).length,
    totalUploads: users.reduce((a, b) => a + b.total_uploads, 0),
    totalStorage: users.reduce((a, b) => a + (b.total_size || 0), 0),
  }), [users]);

  /* ---------- Theme-aware Styles ---------- */

  const getStyles = () => ({
    container: {
      padding: "32px 40px",
      maxWidth: 1400,
      margin: "0 auto",
      backgroundColor: isDark ? "#111827" : "#f9fafb",
      minHeight: "100vh",
      color: isDark ? "#f9fafb" : "#111827"
    },
    
    loadingContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: isDark ? "#111827" : "#f9fafb",
      color: isDark ? "#f9fafb" : "#111827"
    },
    
    errorContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: isDark ? "#111827" : "#f9fafb",
      color: isDark ? "#f9fafb" : "#111827"
    },
    
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 32,
      padding: "24px 0"
    },

    headerText: {
      color: isDark ? "#9ca3af" : "#6b7280"
    },
    
    kpiGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: 20,
      marginBottom: 32
    },
    
    kpiCard: {
      backgroundColor: isDark ? "#1f2937" : "white",
      padding: 24,
      borderRadius: 12,
      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
      boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.05)"
    },
    
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    
    trend: {
      fontSize: 12,
      color: "#10b981",
      fontWeight: 500
    },

    kpiLabel: {
      fontSize: 13,
      color: isDark ? "#9ca3af" : "#6b7280",
      marginBottom: 4
    },

    kpiValue: {
      fontSize: 28,
      fontWeight: 700,
      marginBottom: 4,
      color: isDark ? "#f9fafb" : "#111827"
    },

    kpiSubtitle: {
      fontSize: 12,
      color: isDark ? "#6b7280" : "#9ca3af"
    },
    
    controlsContainer: {
      display: "flex",
      gap: 16,
      marginBottom: 20,
      flexWrap: "wrap"
    },
    
    searchContainer: {
      position: "relative",
      flex: 1,
      minWidth: 300
    },
    
    searchInput: {
      width: "90%",
      padding: "10px 12px 10px 40px",
      borderRadius: 8,
      border: `1px solid ${isDark ? "#374151" : "#d1d5db"}`,
      fontSize: 14,
      backgroundColor: isDark ? "#1f2937" : "white",
      color: isDark ? "#f9fafb" : "#111827",
      outline: "none"
    },
    
    select: {
      padding: "10px 32px 10px 12px",
      borderRadius: 8,
      border: `1px solid ${isDark ? "#374151" : "#d1d5db"}`,
      fontSize: 14,
      backgroundColor: isDark ? "#1f2937" : "white",
      color: isDark ? "#f9fafb" : "#111827",
      cursor: "pointer",
      outline: "none"
    },
    
    iconBtn: {
      padding: "10px 12px",
      borderRadius: 8,
      border: `1px solid ${isDark ? "#374151" : "#d1d5db"}`,
      backgroundColor: isDark ? "#1f2937" : "white",
      color: isDark ? "#f9fafb" : "#111827",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    
    exportBtn: {
      padding: "10px 16px",
      borderRadius: 8,
      border: "none",
      backgroundColor: "#3b82f6",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontWeight: 500,
      fontSize: 14
    },
    
    retryBtn: {
      marginTop: 16,
      padding: "10px 24px",
      borderRadius: 8,
      border: "none",
      backgroundColor: "#3b82f6",
      color: "white",
      cursor: "pointer",
      fontWeight: 500
    },
    
    resultsInfo: {
      fontSize: 14,
      color: isDark ? "#9ca3af" : "#6b7280",
      marginBottom: 16
    },
    
    tableContainer: {
      backgroundColor: isDark ? "#1f2937" : "white",
      borderRadius: 12,
      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
      overflow: "hidden",
      boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.05)"
    },
    
    tableHeader: {
      display: "flex",
      padding: "16px 24px",
      backgroundColor: isDark ? "#111827" : "#f9fafb",
      borderBottom: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
      fontWeight: 600,
      fontSize: 13,
      color: isDark ? "#d1d5db" : "#374151",
      textTransform: "uppercase",
      letterSpacing: "0.5px"
    },
    
    userRow: {
      borderBottom: `1px solid ${isDark ? "#374151" : "#f3f4f6"}`
    },
    
    userRowMain: {
      display: "flex",
      padding: "20px 24px",
      cursor: "pointer",
      alignItems: "center",
      transition: "background-color 0.15s"
    },
    
    avatar: (role) => ({
      width: 40,
      height: 40,
      borderRadius: "50%",
      backgroundColor: role === "admin" ? (isDark ? "#7f1d1d" : "#fee2e2") : (isDark ? "#1e3a8a" : "#dbeafe"),
      color: role === "admin" ? (isDark ? "#fecaca" : "#991b1b") : (isDark ? "#93c5fd" : "#1e40af"),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: 16
    }),

    username: {
      fontWeight: 600,
      fontSize: 15,
      color: isDark ? "#f9fafb" : "#111827"
    },

    lastActive: {
      fontSize: 12,
      color: isDark ? "#6b7280" : "#9ca3af"
    },

    email: {
      color: isDark ? "#9ca3af" : "#6b7280"
    },
    
    roleBadge: (role) => ({
      display: "inline-block",
      padding: "4px 12px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 600,
      textTransform: "uppercase",
      backgroundColor: role === "admin" ? (isDark ? "#7f1d1d" : "#fee2e2") : (isDark ? "#1e3a8a" : "#dbeafe"),
      color: role === "admin" ? (isDark ? "#fecaca" : "#991b1b") : (isDark ? "#93c5fd" : "#1e40af")
    }),

    activityCount: {
      fontWeight: 600,
      color: isDark ? "#f9fafb" : "#111827"
    },

    activityLabel: {
      fontSize: 12,
      color: isDark ? "#6b7280" : "#9ca3af"
    },
    
    deleteBtn: {
      padding: 8,
      border: "none",
      backgroundColor: "transparent",
      color: "#dc2626",
      cursor: "pointer",
      borderRadius: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.15s"
    },
    
    expandedContent: {
      padding: "0 24px 24px 24px",
      backgroundColor: isDark ? "#111827" : "#f9fafb"
    },

    expandedTitle: {
      margin: "0 0 16px 0",
      fontSize: 14,
      fontWeight: 600,
      color: isDark ? "#d1d5db" : "#374151"
    },
    
    noDocuments: {
      textAlign: "center",
      padding: "40px 20px",
      color: isDark ? "#6b7280" : "#9ca3af"
    },
    
    documentGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: 16
    },
    
    documentCard: {
      backgroundColor: isDark ? "#1f2937" : "white",
      padding: 16,
      borderRadius: 8,
      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`
    },
    
    documentHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
      paddingBottom: 12,
      borderBottom: `1px solid ${isDark ? "#374151" : "#f3f4f6"}`
    },

    documentName: {
      fontWeight: 600,
      fontSize: 14,
      marginBottom: 4,
      color: isDark ? "#f9fafb" : "#111827"
    },

    documentTime: {
      fontSize: 12,
      color: isDark ? "#6b7280" : "#9ca3af",
      display: "flex",
      alignItems: "center",
      gap: 6
    },
    
    documentStats: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 12
    },
    
    statItem: {
      textAlign: "center"
    },

    statLabel: {
      fontSize: 11,
      color: isDark ? "#6b7280" : "#9ca3af",
      textTransform: "uppercase"
    },

    statValue: {
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? "#f9fafb" : "#111827"
    },
    
    statusBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 10px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 600,
      textTransform: "capitalize"
    },
    
    emptyState: {
      textAlign: "center",
      padding: "80px 20px",
      color: isDark ? "#6b7280" : "#9ca3af"
    }
  });

  const styles = getStyles();

  /* ---------- UI ---------- */

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <RefreshCw size={40} color={isDark ? "#9ca3af" : "#6b7280"} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 16, color: isDark ? "#9ca3af" : "#6b7280" }}>Loading user data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={48} color="#dc2626" />
        <h3 style={{ marginTop: 16 }}>Error Loading Users</h3>
        <p style={{ color: isDark ? "#9ca3af" : "#6b7280" }}>{error}</p>
        <button onClick={fetchUsers} style={styles.retryBtn}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <User size={32} color={isDark ? "#f9fafb" : "#111827"} />
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>User Management</h1>
          </div>
          <p style={{ ...styles.headerText, margin: 0 }}>
            Monitor and manage user accounts, roles, and document activity across the platform
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={handleRefresh} style={styles.iconBtn} disabled={refreshing}>
            <RefreshCw size={18} style={refreshing ? { animation: "spin 1s linear infinite" } : {}} />
          </button>
          <button onClick={exportData} style={styles.exportBtn}>
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      {/* KPI Dashboard */}
      <div style={styles.kpiGrid}>
        <KPICard 
          icon={<User size={24} />}
          label="Total Users" 
          value={stats.total}
          trend="+12% from last month"
          color="#3b82f6"
          isDark={isDark}
          styles={styles}
        />
        <KPICard 
          icon={<User size={24} />}
          label="Active Users" 
          value={stats.activeUsers}
          subtitle={`${stats.admins} Admins`}
          color="#8b5cf6"
          isDark={isDark}
          styles={styles}
        />
        <KPICard 
          icon={<CheckCircle size={24} />}
          label="Total Uploads" 
          value={stats.totalUploads}
          subtitle="Documents processed"
          color="#10b981"
          isDark={isDark}
          styles={styles}
        />
        <KPICard 
          icon={<AlertCircle size={24} />}
          label="Storage Used" 
          value={formatSize(stats.totalStorage)}
          subtitle="Across all users"
          color="#f59e0b"
          isDark={isDark}
          styles={styles}
        />
      </div>

      {/* Controls */}
      <div style={styles.controlsContainer}>
        <div style={styles.searchContainer}>
          <Search size={18} color={isDark ? "#6b7280" : "#9ca3af"} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Filter size={18} color={isDark ? "#9ca3af" : "#6b7280"} />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={styles.select}>
              <option value="all">All Roles</option>
              <option value="admin">Admin Only</option>
              <option value="user">Users Only</option>
            </select>
          </div>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
            <option value="username">Sort: Name</option>
            <option value="uploads">Sort: Uploads</option>
            <option value="storage">Sort: Storage</option>
          </select>
        </div>
      </div>

      {/* Results Info */}
      <div style={styles.resultsInfo}>
        Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users
      </div>

      {/* Users Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <div style={{ flex: 1.5 }}>User</div>
          <div style={{ flex: 2 }}>Contact</div>
          <div style={{ flex: 1 }}>Role</div>
          <div style={{ flex: 1, textAlign: "center" }}>Activity</div>
          <div style={{ flex: 1, textAlign: "center" }}>Storage</div>
          <div style={{ width: 100 }}></div>
        </div>

        {filteredUsers.length === 0 ? (
          <div style={styles.emptyState}>
            <User size={48} color={isDark ? "#4b5563" : "#d1d5db"} />
            <p style={{ marginTop: 16 }}>No users found matching your criteria</p>
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div key={u.username} style={styles.userRow}>
              <div
                onClick={() => setExpanded(expanded === u.username ? null : u.username)}
                style={styles.userRowMain}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isDark ? "#374151" : "#f9fafb"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div style={{ flex: 1.5, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={styles.avatar(u.role)}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={styles.username}>{u.username}</div>
                    {u.documents.length > 0 && (
                      <div style={styles.lastActive}>
                        Last active: {getRelativeTime(u.documents[0].uploaded_at)}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ flex: 2, ...styles.email }}>{u.email}</div>

                <div style={{ flex: 1 }}>
                  <span style={styles.roleBadge(u.role)}>{u.role}</span>
                </div>

                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={styles.activityCount}>{u.total_uploads}</div>
                  <div style={styles.activityLabel}>uploads</div>
                </div>

                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={styles.activityCount}>{formatSize(u.total_size || 0)}</div>
                  <div style={styles.activityLabel}>used</div>
                </div>

                <div style={{ width: 100, display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
                  {u.role !== "admin" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteUser(u.username);
                      }}
                      style={styles.deleteBtn}
                      title="Delete user"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {expanded === u.username ? 
                    <ChevronDown size={20} color={isDark ? "#9ca3af" : "#6b7280"} /> : 
                    <ChevronRight size={20} color={isDark ? "#9ca3af" : "#6b7280"} />
                  }
                </div>
              </div>

              {/* Expanded Document List */}
              {expanded === u.username && (
                <div style={styles.expandedContent}>
                  <h4 style={styles.expandedTitle}>
                    Documents ({u.documents.length})
                  </h4>
                  
                  {u.documents.length === 0 ? (
                    <div style={styles.noDocuments}>
                      <AlertCircle size={24} color={isDark ? "#4b5563" : "#d1d5db"} />
                      <p style={{ marginTop: 8 }}>No documents uploaded yet</p>
                    </div>
                  ) : (
                    <div style={styles.documentGrid}>
                      {u.documents.map((d, i) => (
                        <div key={i} style={styles.documentCard}>
                          <div style={styles.documentHeader}>
                            <div style={{ flex: 1 }}>
                              <div style={styles.documentName}>{d.file_name}</div>
                              <div style={styles.documentTime}>
                                <Clock size={12} />
                                {formatDate(d.uploaded_at)}
                              </div>
                            </div>
                            <StatusBadge status={d.status} isDark={isDark} />
                          </div>
                          
                          <div style={styles.documentStats}>
                            <StatItem label="PDF" value={formatSize(d.pdf_size)} styles={styles} />
                            <StatItem label="TXT" value={formatSize(d.txt_size)} styles={styles} />
                            <StatItem label="DOCX" value={formatSize(d.docx_size)} styles={styles} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

const KPICard = ({ icon, label, value, subtitle, trend, color, isDark, styles }) => (
  <div style={styles.kpiCard}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
      <div style={{ ...styles.iconCircle, backgroundColor: `${color}${isDark ? '33' : '15'}`, color }}>{icon}</div>
      {trend && <span style={styles.trend}>{trend}</span>}
    </div>
    <div style={styles.kpiLabel}>{label}</div>
    <div style={styles.kpiValue}>{value}</div>
    {subtitle && <div style={styles.kpiSubtitle}>{subtitle}</div>}
  </div>
);

const StatusBadge = ({ status, isDark }) => {
  const config = {
    done: { 
      bg: isDark ? "#065f46" : "#dcfce7", 
      color: isDark ? "#6ee7b7" : "#166534", 
      icon: <CheckCircle size={14} /> 
    },
    error: { 
      bg: isDark ? "#7f1d1d" : "#fee2e2", 
      color: isDark ? "#fca5a5" : "#991b1b", 
      icon: <AlertCircle size={14} /> 
    },
    processing: { 
      bg: isDark ? "#78350f" : "#fef3c7", 
      color: isDark ? "#fcd34d" : "#92400e", 
      icon: <Clock size={14} /> 
    }
  };
  const c = config[status] || config.processing;
  
  return (
    <span style={{ 
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 10px",
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 600,
      textTransform: "capitalize",
      backgroundColor: c.bg, 
      color: c.color 
    }}>
      {c.icon}
      {status}
    </span>
  );
};

const StatItem = ({ label, value, styles }) => (
  <div style={styles.statItem}>
    <div style={styles.statLabel}>{label}</div>
    <div style={styles.statValue}>{value}</div>
  </div>
);

// Add keyframes for spin animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);