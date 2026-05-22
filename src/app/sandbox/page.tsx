// src/app/sandbox/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlayCircle, ShieldAlert, Sparkles, Database, UserCheck, Eye, Terminal } from 'lucide-react';
import Navigation from '@/components/Navigation';
import styles from '@/styles/Sandbox.module.css';

interface ConsoleLog {
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  scenario: string;
  error?: string;
}

export default function Sandbox() {
  const [scenario, setScenario] = useState('success');
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('/api/users');
  const [firing, setFiring] = useState(false);
  const [autopilot, setAutopilot] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  
  const consoleRef = useRef<HTMLDivElement>(null);
  const autopilotInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll terminal console to bottom on new logs
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // Handle Autopilot traffic generation
  useEffect(() => {
    if (autopilot) {
      // Seed initial mock calls
      triggerMockCall(true);
      
      autopilotInterval.current = setInterval(() => {
        triggerMockCall(true);
      }, 3000); // Fills database logs every 3 seconds
    } else {
      if (autopilotInterval.current) {
        clearInterval(autopilotInterval.current);
        autopilotInterval.current = null;
      }
    }

    return () => {
      if (autopilotInterval.current) {
        clearInterval(autopilotInterval.current);
      }
    };
  }, [autopilot]);

  // Set default method when path changes to keep sandbox sensible
  useEffect(() => {
    if (path === '/api/payment') {
      setMethod('POST');
    } else {
      setMethod('GET');
    }
  }, [path]);

  // Programmatically trigger a mock telemetry call
  const triggerMockCall = async (isAutopilotRun = false) => {
    if (!isAutopilotRun) setFiring(true);

    // Pick random variables if Autopilot is active
    let activeScenario = scenario;
    let activeMethod = method;
    let activePath = path;

    if (isAutopilotRun) {
      const scenarios = ['success', 'success', 'success', 'database_lag', 'auth_failure', 'server_error', 'rate_limit'];
      activeScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      
      const paths = ['/api/users', '/api/payment', '/api/products', '/api/analytics'];
      activePath = paths[Math.floor(Math.random() * paths.length)];
      
      activeMethod = activePath === '/api/payment' ? 'POST' : 'GET';
    }

    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: activeScenario,
          method: activeMethod,
          path: activePath
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        const newLog: ConsoleLog = {
          timestamp: new Date(data.log.timestamp).toLocaleTimeString(),
          method: data.log.method,
          path: data.log.path,
          statusCode: data.log.statusCode,
          duration: data.log.duration,
          scenario: activeScenario,
          error: data.log.errorMessage || undefined
        };

        setConsoleLogs(prev => [...prev.slice(-49), newLog]); // keep last 50 logs in shell
      }
    } catch (err) {
      console.error('Failed to trigger mock sandbox call:', err);
    } finally {
      if (!isAutopilotRun) setFiring(false);
    }
  };

  const scenariosList = [
    { id: 'success', name: 'HTTP 200 OK', desc: 'Fires normal successful database operations.', icon: UserCheck },
    { id: 'database_lag', name: 'DB Read Lag', desc: 'Simulates heavy unindexed database joins (1500-2500ms).', icon: Database },
    { id: 'auth_failure', name: 'Auth Block', desc: 'Fires JWT validation failure logs (HTTP 401).', icon: ShieldAlert },
    { id: 'server_error', name: 'Server Crash', desc: 'Simulates full java exceptions with error traces (HTTP 500).', icon: Sparkles },
    { id: 'rate_limit', name: 'Rate Throttling', desc: 'Fires automated rapid API hammers (HTTP 429).', icon: Eye }
  ];

  return (
    <Navigation>
      <div className={styles.splitLayout}>
        {/* Left Side: Interactive Controls Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <PlayCircle size={20} style={{ color: 'var(--color-primary)' }} />
              <h2>Traffic Generation Controls</h2>
            </div>
            <span className={styles.panelDesc}>
              Select a telemetry scenario profile and fire mock traffic onto the PulseFlow API engine.
            </span>
          </div>

          {/* Autopilot Toggler */}
          <div className={styles.autoPilotHeader}>
            <div className={styles.autoPilotInfo}>
              <div className={`${styles.pulseIndicator} ${autopilot ? 'glow-primary' : ''}`} />
              <span className={styles.autoPilotText}>Autopilot Traffic Generator</span>
            </div>
            <label className={styles.autoPilotToggle}>
              <input 
                type="checkbox" 
                checked={autopilot} 
                onChange={(e) => setAutopilot(e.target.checked)} 
              />
              <span className={styles.slider} />
            </label>
          </div>

          {/* Scenario Selection Grid */}
          <div className={styles.formGroup}>
            <span className={styles.formLabel}>Select Telemetry Profile</span>
            <div className={styles.scenarioGrid}>
              {scenariosList.map((sc) => {
                const Icon = sc.icon;
                const isActive = scenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setScenario(sc.id)}
                    className={`${styles.scenarioBtn} ${styles['scenarioBtn_' + sc.id]} ${isActive ? styles.activeScenario : ''}`}
                    disabled={autopilot}
                  >
                    <div className={styles.scenarioIcon}>
                      <Icon size={16} />
                    </div>
                    <span className={styles.scenarioName}>{sc.name}</span>
                    <span className={styles.scenarioDesc}>{sc.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Path Parameter Controls */}
          <div className={styles.formGroup}>
            <span className={styles.formLabel}>Endpoint Path</span>
            <select
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className={styles.selectField}
              disabled={autopilot}
            >
              <option value="/api/users">/api/users (User Profiles)</option>
              <option value="/api/payment">/api/payment (Checkout Engine)</option>
              <option value="/api/products">/api/products (Catalogue Query)</option>
              <option value="/api/analytics">/api/analytics (SaaS Reports)</option>
            </select>
          </div>

          {/* Method Override Toggles */}
          <div className={styles.formGroup}>
            <span className={styles.formLabel}>HTTP Method Override</span>
            <div className={styles.methodToggles}>
              {['GET', 'POST', 'PUT', 'DELETE'].map((m) => {
                const isActive = method === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`${styles.methodToggleBtn} ${isActive ? styles['methodToggleActive_' + m] : ''}`}
                    disabled={autopilot || path === '/api/payment'} // lock payment to POST
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Trigger Button */}
          <button
            type="button"
            onClick={() => triggerMockCall(false)}
            disabled={firing || autopilot}
            className={styles.triggerBtn}
          >
            <Terminal size={16} />
            <span>{firing ? 'Firing Telemetry Call...' : 'Fire Mock Telemetry API'}</span>
          </button>
        </div>

        {/* Right Side: Rolling Logs Terminal Shell */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <Terminal size={20} style={{ color: 'var(--status-2xx)' }} />
              <h2>PulseFlow Log Stream Console</h2>
            </div>
            <span className={styles.panelDesc}>
              Tailing live request inputs written to SQLite dev database.
            </span>
          </div>

          {/* Console Shell Output */}
          <div className={styles.terminalConsole} ref={consoleRef}>
            {consoleLogs.length === 0 ? (
              <div className={styles.consoleWelcome}>
                <span>$ tail -f /var/log/pulseflow/api.log</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  [System] Log stream initialised. Fire API requests or activate Autopilot above to watch logs roll in...
                </span>
              </div>
            ) : (
              consoleLogs.map((log, idx) => {
                const statusClass = log.statusCode >= 500 ? styles.consoleStatus_5xx : 
                                    log.statusCode >= 400 ? styles.consoleStatus_4xx : 
                                    log.statusCode >= 300 ? styles.consoleStatus_3xx : styles.consoleStatus_2xx;
                
                const methodClass = styles['consoleMethod_' + log.method];

                return (
                  <div key={idx} className={styles.consoleLogEntry}>
                    <div className={styles.consoleLogLine}>
                      <span className={styles.consoleTime}>[{log.timestamp}]</span>
                      <span className={`${styles.consoleMethod} ${methodClass}`}>{log.method}</span>
                      <span className={styles.consolePath}>{log.path}</span>
                      <span className={`${styles.consoleStatus} ${statusClass}`}>{log.statusCode}</span>
                      <span className={styles.consoleDuration}>({log.duration}ms)</span>
                    </div>
                    {log.error && (
                      <div className={styles.consoleDetails}>
                        <span className={styles.consoleError}>└─ Error: {log.error}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Navigation>
  );
}
