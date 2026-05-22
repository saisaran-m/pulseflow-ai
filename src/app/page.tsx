// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Activity, Play, Server, AlertTriangle, ArrowRight, ShieldAlert, Sparkles, Terminal 
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import MetricsGrid from '@/components/MetricsGrid';
import ChartContainer from '@/components/ChartContainer';
import TraceDrawer from '@/components/TraceDrawer';
import styles from '@/styles/Dashboard.module.css';
import logStyles from '@/styles/Logs.module.css';

interface MetricState {
  totalRequests: number;
  averageLatency: number;
  p95Latency: number;
  errorRate: number;
  rps: number;
}

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

export default function HomeDashboard() {
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricState>({
    totalRequests: 0,
    averageLatency: 0,
    p95Latency: 0,
    errorRate: 0,
    rps: 0
  });
  const [chartData, setChartData] = useState([]);
  const [recentCrashes, setRecentCrashes] = useState<LogRecord[]>([]);

  // Simulation states
  const [simulating, setSimulating] = useState<string | null>(null);

  // Selected trace drawer
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch telemetry logs and statistics from backend
  const fetchDashboardData = async (showLoadingState = false) => {
    if (showLoadingState) setLoading(true);
    try {
      // 1. Fetch filtered metrics and charts
      const response = await fetch(`/api/logs?timeRange=${timeRange}`);
      const data = await response.json();
      if (data.success) {
        setMetrics(data.metrics);
        setChartData(data.chartData);
      }

      // 2. Fetch recent critical 500 crashes
      const crashesResponse = await fetch('/api/logs?statusClass=5xx&limit=5');
      const crashesData = await crashesResponse.json();
      if (crashesData.success) {
        setRecentCrashes(crashesData.logs);
      }

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-poll database metrics every 3 seconds to animates charts in real-time
  useEffect(() => {
    fetchDashboardData(true);

    const interval = setInterval(() => {
      fetchDashboardData(false); // background refresh
    }, 3000);

    return () => clearInterval(interval);
  }, [timeRange]);

  // Quick Action: shoots instant simulated traffic to SQLite from the dashboard
  const handleQuickSimulation = async (scenario: string, count = 1) => {
    setSimulating(scenario);
    try {
      const paths = ['/api/users', '/api/payment', '/api/products', '/api/analytics'];
      
      for (let i = 0; i < count; i++) {
        const randPath = paths[Math.floor(Math.random() * paths.length)];
        const method = randPath === '/api/payment' ? 'POST' : 'GET';

        await fetch('/api/sandbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenario, method, path: randPath })
        });
      }
      
      // Instantly refresh numbers
      await fetchDashboardData(false);
    } catch (err) {
      console.error('Failed to run quick simulation:', err);
    } finally {
      setSimulating(null);
    }
  };

  const handleOpenCrashLog = (log: LogRecord) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  return (
    <Navigation>
      {/* 1. Header with Time Range Selectors */}
      <div className={styles.chartHeader} style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>Telemetry Observability</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Real-time analytics engine bucketed by chronological log timestamps.
          </span>
        </div>
        
        <div className={styles.timeSelector}>
          {[
            { id: '1h', label: '1 Hour' },
            { id: '24h', label: '24 Hours' },
            { id: '7d', label: '7 Days' }
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTimeRange(item.id)}
              className={`${styles.timeBtn} ${timeRange === item.id ? styles.activeTimeBtn : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Core Metrics KPI Grid */}
      {loading && metrics.totalRequests === 0 ? (
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '40px' }}>
          Initializing system dashboard...
        </div>
      ) : (
        <MetricsGrid metrics={metrics} />
      )}

      {/* 3. Recharts Area Chart Panel */}
      <ChartContainer data={chartData} />

      {/* 4. Split Pane: Quick Simulation and Recent Outages */}
      <div className={styles.chartsGrid}>
        {/* Left Side: Quick Simulation Portal */}
        <div className={styles.quickActionsCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>SaaS Telemetry Simulator</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Quick action triggers to seed log queries.
            </span>
          </div>

          <div className={styles.actionsList}>
            {/* Action 1: Seed successful traffic */}
            <div className={styles.actionItem}>
              <div className={styles.actionInfo}>
                <span className={styles.actionName}>Simulate 5x Standard Queries</span>
                <span className={styles.actionDesc}>Sends successful API traffic returning 200 OK responses.</span>
              </div>
              <button
                type="button"
                className={styles.actionBtn}
                disabled={simulating !== null}
                onClick={() => handleQuickSimulation('success', 5)}
              >
                {simulating === 'success' ? 'Simulating...' : 'Shoot Traffic'}
              </button>
            </div>

            {/* Action 2: Trigger unindexed query delay */}
            <div className={styles.actionItem}>
              <div className={styles.actionInfo}>
                <span className={styles.actionName}>Simulate DB Read Bottleneck</span>
                <span className={styles.actionDesc}>Simulates slow SQL table scan queries (1500-2500ms).</span>
              </div>
              <button
                type="button"
                className={styles.actionBtn}
                style={{ color: 'var(--status-3xx)', backgroundColor: 'rgba(245,158,11,0.1)', borderColor: 'rgba(245,158,11,0.2)' }}
                disabled={simulating !== null}
                onClick={() => handleQuickSimulation('database_lag', 3)}
              >
                {simulating === 'database_lag' ? 'Simulating...' : 'Trigger Lag'}
              </button>
            </div>

            {/* Action 3: Trigger critical server crash */}
            <div className={styles.actionItem}>
              <div className={styles.actionInfo}>
                <span className={styles.actionName}>Simulate Server Crash</span>
                <span className={styles.actionDesc}>Generates severe Java compiler exception stack traces (500 Error).</span>
              </div>
              <button
                type="button"
                className={styles.actionBtn}
                style={{ color: 'var(--status-5xx)', backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)' }}
                disabled={simulating !== null}
                onClick={() => handleQuickSimulation('server_error', 2)}
              >
                {simulating === 'server_error' ? 'Simulating...' : 'Trigger Crash'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Recent Server Outage logs */}
        <div className={styles.recentErrorsSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.chartTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} style={{ color: 'var(--status-5xx)' }} className="glow-5xx" />
              <span>Recent Critical Crashes</span>
            </h3>
            <Link href="/logs?statusClass=5xx" className={styles.viewAllLink}>
              View All Crashes
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentCrashes.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '30px' }}>
                No active 500 error logs recorded.
              </div>
            ) : (
              recentCrashes.map((crash) => (
                <div 
                  key={crash.id} 
                  className={logStyles.tr}
                  onClick={() => handleOpenCrashLog(crash)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'rgba(239, 68, 68, 0.01)',
                    borderColor: 'rgba(239, 68, 68, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span className={logStyles.path} style={{ fontSize: '12.5px' }}>
                      {crash.method} {crash.path}
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(crash.timestamp).toLocaleTimeString()} • {crash.ip}
                    </span>
                  </div>
                  <span className={`${logStyles.statusBadge} ${logStyles.status5xx}`} style={{ fontSize: '10px' }}>
                    {crash.statusCode}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Slide-out details drawer panel */}
      <TraceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        log={selectedLog}
      />
    </Navigation>
  );
}
