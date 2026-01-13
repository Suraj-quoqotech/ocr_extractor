import React, { useState, useEffect } from 'react';

const UserProfile = ({ theme, history, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('notificationsEnabled') === 'true' || false
  );
  
  // User info - you can replace this with actual user data from your auth system
  const [userInfo] = useState({
    username: 'USER01',
    email: 'user@quoqo.com',
    loginTime: new Date().toISOString()
  });

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Request notification permission
  useEffect(() => {
    if (notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [notificationsEnabled]);

  // Format session time
  const formatSessionTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format login time
  const formatLoginTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate analytics
  const totalFilesProcessed = history.length;
  const today = new Date().toDateString();
  const todayFilesProcessed = history.filter(file => {
    const fileDate = new Date(file.uploaded_at).toDateString();
    return fileDate === today;
  }).length;

  const successfulFiles = history.filter(f => f.status === 'done').length;
  const failedFiles = history.filter(f => f.status === 'error').length;

  // Toggle notifications
  const handleNotificationToggle = () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('notificationsEnabled', newValue.toString());
    
    if (newValue && 'Notification' in window) {
      Notification.requestPermission();
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear any user data
      localStorage.removeItem('notificationsEnabled');
      // Call parent logout handler
      if (onLogout) {
        onLogout();
      }
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: theme === 'dark' ? '#e0e0e0' : '#666',
          fontSize: '1.3rem',
          transition: 'transform 0.2s ease',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        👤
        {/* Active indicator dot */}
        <span
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '8px',
            height: '8px',
            backgroundColor: '#28a745',
            borderRadius: '50%',
            border: `2px solid ${theme === 'dark' ? '#1e1e1e' : '#fff'}`
          }}
        ></span>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowDropdown(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999
            }}
          ></div>

          {/* Dropdown */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: '320px',
              backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
              border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              zIndex: 1000,
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
          >
            {/* User Info Section */}
            <div
              style={{
                padding: '1.5rem',
                borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                background: theme === 'dark' 
                  ? 'linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%)'
                  : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#5b7fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    color: '#fff',
                    fontWeight: 'bold'
                  }}
                >
                  {userInfo.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: theme === 'dark' ? '#e0e0e0' : '#333',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {userInfo.username}
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: theme === 'dark' ? '#888' : '#666'
                    }}
                  >
                    {userInfo.email}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: theme === 'dark' ? '#888' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>🕐</span>
                <span>Logged in: {formatLoginTime(userInfo.loginTime)}</span>
              </div>
            </div>

            {/* Analytics Section */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: theme === 'dark' ? '#e0e0e0' : '#333',
                  marginBottom: '0.75rem'
                }}
              >
                📊 Analytics
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {/* Total Files */}
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: theme === 'dark' ? '#252525' : '#f8f9fa',
                    borderRadius: '8px',
                    border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: theme === 'dark' ? '#888' : '#666',
                      marginBottom: '0.25rem'
                    }}
                  >
                    Total Files
                  </div>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#5b7fff'
                    }}
                  >
                    {totalFilesProcessed}
                  </div>
                </div>

                {/* Today's Files */}
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: theme === 'dark' ? '#252525' : '#f8f9fa',
                    borderRadius: '8px',
                    border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: theme === 'dark' ? '#888' : '#666',
                      marginBottom: '0.25rem'
                    }}
                  >
                    Today
                  </div>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#28a745'
                    }}
                  >
                    {todayFilesProcessed}
                  </div>
                </div>

                {/* Success Rate */}
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: theme === 'dark' ? '#252525' : '#f8f9fa',
                    borderRadius: '8px',
                    border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: theme === 'dark' ? '#888' : '#666',
                      marginBottom: '0.25rem'
                    }}
                  >
                    Success
                  </div>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#28a745'
                    }}
                  >
                    {successfulFiles}
                  </div>
                </div>

                {/* Failed */}
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: theme === 'dark' ? '#252525' : '#f8f9fa',
                    borderRadius: '8px',
                    border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: theme === 'dark' ? '#888' : '#666',
                      marginBottom: '0.25rem'
                    }}
                  >
                    Failed
                  </div>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: '#dc3545'
                    }}
                  >
                    {failedFiles}
                  </div>
                </div>
              </div>
            </div>

            {/* Session Time */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>⏱️</span>
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: theme === 'dark' ? '#888' : '#666'
                    }}
                  >
                    Session Time
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: theme === 'dark' ? '#e0e0e0' : '#333',
                      fontFamily: 'monospace'
                    }}
                  >
                    {formatSessionTime(sessionTime)}
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications Toggle */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderBottom: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>🔔</span>
                <div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: theme === 'dark' ? '#e0e0e0' : '#333'
                    }}
                  >
                    Notifications
                  </div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: theme === 'dark' ? '#888' : '#666'
                    }}
                  >
                    Get alerts on completion
                  </div>
                </div>
              </div>
              <label
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '44px',
                  height: '24px',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={handleNotificationToggle}
                  style={{ display: 'none' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: notificationsEnabled ? '#28a745' : '#ccc',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      content: '',
                      height: '18px',
                      width: '18px',
                      left: notificationsEnabled ? '23px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }}
                  ></span>
                </span>
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;