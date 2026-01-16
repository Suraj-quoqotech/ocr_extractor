import React, { useState } from 'react';

const HistoryTable = ({
  history = [],
  selectedFiles = [],
  handleSelectFile,
  handleDownload,
  handleDelete,
  handleBulkDelete,
  formatDate,
  formatSize,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  theme
}) => {
  const [localSearch, setLocalSearch] = useState('');

  const localFilteredHistory = (() => {
    const term = (localSearch || '').toLowerCase();
    let localFiltered = (history || []).filter(file => {
      const matchesSearch =
        file.file_name.toLowerCase().includes(term) ||
        (file.uploaded_by && file.uploaded_by.toLowerCase().includes(term));

      const matchesStatus = filterStatus === 'all' || file.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    localFiltered.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.uploaded_at) - new Date(a.uploaded_at);
      if (sortBy === 'date_asc') return new Date(a.uploaded_at) - new Date(b.uploaded_at);
      if (sortBy === 'name_asc') return a.file_name.localeCompare(b.file_name);
      if (sortBy === 'name_desc') return b.file_name.localeCompare(a.file_name);
      return 0;
    });

    return localFiltered;
  })();

  const toggleSelectAllVisible = () => {
    const visible = localFilteredHistory;
    const allSelected = visible.length > 0 && visible.every(f => selectedFiles.includes(f.file_name));
    if (allSelected) {
      // unselect visible
      visible.forEach(f => {
        if (selectedFiles.includes(f.file_name)) handleSelectFile(f.file_name);
      });
    } else {
      // select visible
      visible.forEach(f => {
        if (!selectedFiles.includes(f.file_name)) handleSelectFile(f.file_name);
      });
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      style={{
        backgroundColor: isDark ? '#1e1e1e' : '#fff',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: isDark ? '0 1px 3px rgba(255,255,255,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: isDark ? '#e0e0e0' : '#333' }}>
            Processing History
          </h2>
          <div style={{ fontSize: 13, color: isDark ? '#9aa' : '#666' }}>Files processed by the OCR system</div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {selectedFiles.length > 0 && (
            <button
              onClick={handleBulkDelete}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              Delete Selected ({selectedFiles.length})
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: isDark ? '#666' : '#999'
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder="Search files..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            style={{
              width: '70%',
              padding: '0.5rem 0.75rem 0.5rem 2.5rem',
              border: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
              borderRadius: '6px',
              fontSize: '0.875rem',
              backgroundColor: isDark ? '#252525' : '#fff',
              color: isDark ? '#e0e0e0' : '#333',
              transition: 'all 0.3s ease'
            }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
            borderRadius: '6px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            backgroundColor: isDark ? '#252525' : '#fff',
            color: isDark ? '#e0e0e0' : '#333',
            transition: 'all 0.3s ease'
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
            padding: '0.5rem 1rem',
            border: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
            borderRadius: '6px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            backgroundColor: isDark ? '#252525' : '#fff',
            color: isDark ? '#e0e0e0' : '#333',
            transition: 'all 0.3s ease'
          }}
        >
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${isDark ? '#333' : '#e0e0e0'}` }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: isDark ? '#b0b0b0' : '#666' }}>
                <input
                  type="checkbox"
                  checked={selectedFiles.length === localFilteredHistory.length && localFilteredHistory.length > 0}
                  onChange={toggleSelectAllVisible}
                  style={{ cursor: 'pointer' }}
                />
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: isDark ? '#b0b0b0' : '#666' }}>
                File Name
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: isDark ? '#b0b0b0' : '#666' }}>
                Uploaded By
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: isDark ? '#b0b0b0' : '#666' }}>
                Upload Date
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: isDark ? '#b0b0b0' : '#666' }}>
                Status
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: isDark ? '#b0b0b0' : '#666' }}>
                Delete
              </th>
            </tr>
          </thead>

          <tbody>
            {localFilteredHistory.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: isDark ? '#666' : '#999' }}>
                  No files found
                </td>
              </tr>
            ) : (
              localFilteredHistory.map((fileObj, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: `1px solid ${isDark ? '#2a2a2a' : '#f0f0f0'}`, transition: 'background-color 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? '#252525' : '#f8f9fa'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <td style={{ padding: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(fileObj.file_name)}
                      onChange={() => handleSelectFile(fileObj.file_name)}
                      style={{ cursor: 'pointer' }}
                    />
                  </td>

                  <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>📄</span>
                      <span style={{ color: isDark ? '#e0e0e0' : '#333' }}>{fileObj.file_name}</span>
                    </div>
                  </td>

                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: isDark ? '#e0e0e0' : '#333' }}>
                    {fileObj.uploaded_by ? fileObj.uploaded_by : '-'}
                  </td>


                  <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: isDark ? '#888' : '#666' }}>
                    {formatDate(fileObj.uploaded_at)}
                  </td>

                  <td style={{ padding: '0.75rem' }}>
                    {fileObj.status === 'done' ? (
                      <span style={{ padding: '0.25rem 0.75rem', backgroundColor: isDark ? '#1a4d2e' : '#d4edda', color: isDark ? '#7cff7c' : '#155724', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500 }}>
                        Success
                      </span>
                    ) : (
                      <span style={{ padding: '0.25rem 0.75rem', backgroundColor: isDark ? '#4d1a1a' : '#f8d7da', color: isDark ? '#ff7c7c' : '#721c24', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500 }}>
                        Failed
                      </span>
                    )}
                  </td>

                  <td style={{ padding: '0.75rem' }}>
                    <button
                      onClick={() => { if (window.confirm(`Delete "${fileObj.file_name}"?`)) handleDelete(fileObj.file_name); }}
                      style={{ padding: '0.25rem 0.5rem', backgroundColor: '#dc3545', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', color: '#fff', fontWeight: 500 }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: isDark ? '#888' : '#666' }}>
        Showing {localFilteredHistory.length} of {(history || []).length} files
      </div>
    </div>
  );
};

export default HistoryTable;