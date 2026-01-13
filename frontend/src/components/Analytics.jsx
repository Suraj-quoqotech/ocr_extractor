import React, { useState, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Analytics = ({ history, theme }) => {
  const [dateRange, setDateRange] = useState('7'); // 7, 30, 90, all
  const chartRef = useRef(null);

  // Process data based on date range
  const chartData = useMemo(() => {
    const now = new Date();
    const ranges = {
      '7': 7,
      '30': 30,
      '90': 90,
      'all': Infinity
    };

    const daysToShow = ranges[dateRange];
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToShow);

    // Filter history by date range
    const filteredHistory = history.filter(file => {
      const fileDate = new Date(file.uploaded_at);
      return daysToShow === Infinity || fileDate >= startDate;
    });

    // Group by date
    const groupedByDate = {};
    
    filteredHistory.forEach(file => {
      const date = new Date(file.uploaded_at);
      const dateKey = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: dateRange === 'all' ? 'numeric' : undefined
      });
      
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = {
          date: dateKey,
          total: 0,
          success: 0,
          failed: 0,
          timestamp: date.getTime()
        };
      }
      
      groupedByDate[dateKey].total += 1;
      if (file.status === 'done') {
        groupedByDate[dateKey].success += 1;
      } else if (file.status === 'error') {
        groupedByDate[dateKey].failed += 1;
      }
    });

    // Convert to array and sort by timestamp
    return Object.values(groupedByDate)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ date, total, success, failed }) => ({
        date,
        total,
        success,
        failed
      }));
  }, [history, dateRange]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const total = history.length;
    const success = history.filter(f => f.status === 'done').length;
    const failed = history.filter(f => f.status === 'error').length;
    const successRate = total > 0 ? ((success / total) * 100).toFixed(1) : 0;

    // Documents in selected range
    const rangeTotal = chartData.reduce((sum, day) => sum + day.total, 0);
    const rangeSuccess = chartData.reduce((sum, day) => sum + day.success, 0);
    const rangeFailed = chartData.reduce((sum, day) => sum + day.failed, 0);

    return {
      total,
      success,
      failed,
      successRate,
      rangeTotal,
      rangeSuccess,
      rangeFailed
    };
  }, [history, chartData]);

  // Export as PNG
  const exportAsPNG = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `analytics-${dateRange}-days-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('Failed to export PNG:', err);
      alert('Failed to export chart as PNG');
    }
  };

  // Export as PDF
  const exportAsPDF = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff',
        scale: 2
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`analytics-${dateRange}-days-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      alert('Failed to export chart as PDF');
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
            border: `1px solid ${theme === 'dark' ? '#444' : '#ccc'}`,
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          <p
            style={{
              margin: '0 0 8px 0',
              fontWeight: 600,
              color: theme === 'dark' ? '#e0e0e0' : '#333',
              fontSize: '0.875rem'
            }}
          >
            {label}
          </p>
          {payload.map((entry, index) => (
            <p
              key={index}
              style={{
                margin: '4px 0',
                color: entry.color,
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: entry.color,
                  borderRadius: '2px',
                  display: 'inline-block'
                }}
              ></span>
              <span style={{ color: theme === 'dark' ? '#b0b0b0' : '#666' }}>
                {entry.name}:
              </span>
              <span style={{ fontWeight: 600, color: theme === 'dark' ? '#e0e0e0' : '#333' }}>
                {entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        flex: 1,
        overflow: 'auto',
        padding: '2rem',
        backgroundColor: theme === 'dark' ? '#121212' : '#f5f5f5'
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: theme === 'dark'
            ? '0 1px 3px rgba(255,255,255,0.1)'
            : '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2
              style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: theme === 'dark' ? '#e0e0e0' : '#333'
              }}
            >
              📊 Analytics Dashboard
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: theme === 'dark' ? '#888' : '#666'
              }}
            >
              Document processing insights and statistics
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: `1px solid ${theme === 'dark' ? '#333' : '#e0e0e0'}`,
                borderRadius: '6px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                backgroundColor: theme === 'dark' ? '#252525' : '#fff',
                color: theme === 'dark' ? '#e0e0e0' : '#333',
                fontWeight: 500
              }}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 3 Months</option>
              <option value="all">All Time</option>
            </select>

            {/* Export Buttons */}
            <button
              onClick={exportAsPNG}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0056b3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#007bff';
              }}
            >
              📸 Export PNG
            </button>

            <button
              onClick={exportAsPDF}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c82333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc3545';
              }}
            >
              📄 Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: theme === 'dark'
              ? '0 1px 3px rgba(255,255,255,0.1)'
              : '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #5b7fff'
          }}
        >
          <div style={{ fontSize: '0.875rem', color: theme === 'dark' ? '#888' : '#666', marginBottom: '0.5rem' }}>
            Total Documents (Range)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#5b7fff' }}>
            {stats.rangeTotal}
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: theme === 'dark'
              ? '0 1px 3px rgba(255,255,255,0.1)'
              : '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #28a745'
          }}
        >
          <div style={{ fontSize: '0.875rem', color: theme === 'dark' ? '#888' : '#666', marginBottom: '0.5rem' }}>
            Successful (Range)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#28a745' }}>
            {stats.rangeSuccess}
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: theme === 'dark'
              ? '0 1px 3px rgba(255,255,255,0.1)'
              : '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #dc3545'
          }}
        >
          <div style={{ fontSize: '0.875rem', color: theme === 'dark' ? '#888' : '#666', marginBottom: '0.5rem' }}>
            Failed (Range)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#dc3545' }}>
            {stats.rangeFailed}
          </div>
        </div>

        <div
          style={{
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: theme === 'dark'
              ? '0 1px 3px rgba(255,255,255,0.1)'
              : '0 1px 3px rgba(0,0,0,0.1)',
            borderLeft: '4px solid #ffc107'
          }}
        >
          <div style={{ fontSize: '0.875rem', color: theme === 'dark' ? '#888' : '#666', marginBottom: '0.5rem' }}>
            Success Rate (All Time)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ffc107' }}>
            {stats.successRate}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div
        ref={chartRef}
        style={{
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: theme === 'dark'
            ? '0 1px 3px rgba(255,255,255,0.1)'
            : '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <h3
          style={{
            margin: '0 0 1.5rem 0',
            fontSize: '1.125rem',
            fontWeight: 600,
            color: theme === 'dark' ? '#e0e0e0' : '#333'
          }}
        >
          Documents Processed Over Time
        </h3>

        {chartData.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              color: theme === 'dark' ? '#666' : '#999'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <div>No data available for the selected period</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={theme === 'dark' ? '#333' : '#e0e0e0'} 
              />
              <XAxis 
                dataKey="date" 
                stroke={theme === 'dark' ? '#888' : '#666'}
                style={{ fontSize: '0.75rem' }}
              />
              <YAxis 
                stroke={theme === 'dark' ? '#888' : '#666'}
                style={{ fontSize: '0.75rem' }}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ 
                  color: theme === 'dark' ? '#e0e0e0' : '#333',
                  fontSize: '0.875rem'
                }}
              />
              <Bar dataKey="success" fill="#28a745" name="Successful" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" fill="#dc3545" name="Failed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" fill="#5b7fff" name="Total" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Info */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: theme === 'dark' ? '#888' : '#666',
          textAlign: 'center',
          boxShadow: theme === 'dark'
            ? '0 1px 3px rgba(255,255,255,0.1)'
            : '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        📈 Analytics auto-update in real-time when new documents are processed
      </div>
    </div>
  );
};

export default Analytics;