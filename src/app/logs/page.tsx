// src/app/logs/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import Navigation from '@/components/Navigation';
import TraceDrawer from '@/components/TraceDrawer';
import styles from '@/styles/Logs.module.css';

interface LogRecord {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  ip: string;
  userAgent: string;
  requestPayload: string | null;
  responseBody: string | null;
  errorMessage: string | null;
  stackTrace: string | null;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 15; // logs per page in table

  // Filter states
  const [searchPath, setSearchPath] = useState('');
  const [method, setMethod] = useState('');
  const [statusClass, setStatusClass] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');

  // Selected drawer log
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load telemetry logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        timeRange,
        statusClass
      });

      if (searchPath) params.append('path', searchPath);
      if (method) params.append('method', method);

      const response = await fetch(`/api/logs?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.logs);
        setTotalLogs(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to load telemetry logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, method, statusClass, timeRange]);

  // Handle typing search with debounce fallback or manual enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  // Drawer trigger
  const handleOpenTrace = (log: LogRecord) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  // Method Badge Stylings
  const getMethodStyle = (m: string) => {
    switch (m) {
      case 'GET': return styles.methodGet;
      case 'POST': return styles.methodPost;
      case 'PUT': return styles.methodPut;
      case 'DELETE': return styles.methodDelete;
      default: return '';
    }
  };

  // Status Badge Stylings
  const getStatusStyle = (code: number) => {
    if (code >= 500) return styles.status5xx;
    if (code >= 400) return styles.status4xx;
    if (code >= 300) return styles.status3xx;
    return styles.status2xx;
  };

  // Duration Stylings
  const getDurationStyle = (d: number) => {
    if (d >= 1000) return styles.durationSlow;
    if (d >= 300) return styles.durationWarning;
    return styles.durationFast;
  };

  return (
    <Navigation>
      <div className={styles.container}>
        {/* Filters Header Block */}
        <form className={styles.filtersPanel} onSubmit={handleSearchSubmit}>
          <div className={styles.searchGroup}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              value={searchPath}
              onChange={(e) => setSearchPath(e.target.value)}
              placeholder="Search request path (e.g. /api/users)..."
              className={styles.searchInput}
            />
          </div>

          <div className={styles.selectGroup}>
            <span className={styles.selectLabel}>Method:</span>
            <select
              value={method}
              onChange={(e) => { setMethod(e.target.value); setPage(1); }}
              className={styles.selectInput}
            >
              <option value="">ALL</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div className={styles.selectGroup}>
            <span className={styles.selectLabel}>Status:</span>
            <select
              value={statusClass}
              onChange={(e) => { setStatusClass(e.target.value); setPage(1); }}
              className={styles.selectInput}
            >
              <option value="all">ALL STATUSES</option>
              <option value="2xx">2xx OK</option>
              <option value="3xx">3xx Redirect</option>
              <option value="4xx">4xx Client Error</option>
              <option value="5xx">5xx Crash</option>
            </select>
          </div>

          <div className={styles.selectGroup}>
            <span className={styles.selectLabel}>Time:</span>
            <select
              value={timeRange}
              onChange={(e) => { setTimeRange(e.target.value); setPage(1); }}
              className={styles.selectInput}
            >
              <option value="1h">Last 1 Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>

          <button
            type="submit"
            className={styles.pageBtn}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          >
            <RefreshCw size={12} className={loading ? 'sparklePulse' : ''} />
            <span>Refresh</span>
          </button>
        </form>

        {/* Telemetry Paginated Grid */}
        <div className={styles.tableContainer}>
          {loading && logs.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '60px' }}>
              Loading request telemetry database...
            </div>
          ) : logs.length === 0 ? (
            <div className={styles.noLogs}>
              <AlertCircle size={32} style={{ color: 'var(--text-muted)' }} />
              <h3>No matching telemetry records found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                Try relaxing your search filters, or head to the Traffic Sandbox page to trigger mock API logs.
              </p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Timestamp</th>
                  <th className={styles.th}>Method</th>
                  <th className={styles.th}>Path</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th} style={{ textAlign: 'right' }}>Response Time</th>
                  <th className={styles.th} style={{ paddingLeft: '40px' }}>Client IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className={styles.tr} onClick={() => handleOpenTrace(log)}>
                    <td className={`${styles.td} ${styles.timestamp}`}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className={styles.td}>
                      <span className={`${styles.methodBadge} ${getMethodStyle(log.method)}`}>
                        {log.method}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.path}`}>{log.path}</td>
                    <td className={styles.td}>
                      <span className={`${styles.statusBadge} ${getStatusStyle(log.statusCode)}`}>
                        {log.statusCode}
                      </span>
                    </td>
                    <td className={`${styles.td} ${styles.duration} ${getDurationStyle(log.duration)}`}>
                      {log.duration} ms
                    </td>
                    <td className={`${styles.td} ${styles.timestamp}`} style={{ paddingLeft: '40px' }}>
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination Controls */}
          <div className={styles.pagination}>
            <span>
              Showing {logs.length > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, totalLogs)} of {totalLogs} traces
            </span>

            <div className={styles.paginationButtons}>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ alignSelf: 'center', padding: '0 8px', fontSize: '13px', fontWeight: 'bold' }}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className={styles.pageBtn}
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out log trace details drawer panel */}
      <TraceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        log={selectedLog}
      />
    </Navigation>
  );
}
