// src/app/alerts/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Bell, ShieldAlert, CheckCircle, Plus, Trash2, ShieldCheck, Activity } from 'lucide-react';
import Navigation from '@/components/Navigation';
import styles from '@/styles/Alerts.module.css';

interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: string;
  threshold: number;
  durationMin: number;
  active: boolean;
}

interface AlertLog {
  id: string;
  timestamp: string;
  ruleId: string;
  value: number;
  message: string;
  status: string; // ACTIVE, RESOLVED
  rule: AlertRule;
}

export default function AlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [metric, setMetric] = useState('latency');
  const [operator, setOperator] = useState('>');
  const [threshold, setThreshold] = useState('');
  const [durationMin, setDurationMin] = useState('5');
  const [creating, setCreating] = useState(false);

  // Fetch alert config and logs on load
  const fetchAlertsData = async () => {
    try {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      if (data.success) {
        setRules(data.rules);
        setAlertLogs(data.alertLogs);
      }
    } catch (err) {
      console.error('Failed to load alert details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsData();

    // Auto-refresh alerts logs every 5 seconds to keep dashboard alive
    const interval = setInterval(fetchAlertsData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle new alert rule creation
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !threshold) return;
    setCreating(true);

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          metric,
          operator,
          threshold,
          durationMin
        })
      });

      const data = await response.json();
      if (data.success) {
        setName('');
        setThreshold('');
        fetchAlertsData();
      }
    } catch (err) {
      console.error('Failed to create alert rule:', err);
    } finally {
      setCreating(false);
    }
  };

  // Toggle active toggle switch in SQLite
  const handleToggleRule = async (id: string, currentActive: boolean) => {
    try {
      // Optimistic UI update
      setRules(prev => prev.map(r => r.id === id ? { ...r, active: !currentActive } : r));

      await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive })
      });
    } catch (err) {
      console.error('Failed to toggle rule state:', err);
      fetchAlertsData(); // revert
    }
  };

  // Delete alert rule
  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert rule? All related incident history will be deleted.')) return;
    
    try {
      setRules(prev => prev.filter(r => r.id !== id));
      await fetch(`/api/alerts?id=${id}`, { method: 'DELETE' });
      fetchAlertsData();
    } catch (err) {
      console.error('Failed to delete alert rule:', err);
      fetchAlertsData();
    }
  };

  // Manages manual incident resolution trigger
  const handleResolveAlert = async (alertLogId: string) => {
    try {
      // Optimistic UI update
      setAlertLogs(prev => prev.map(log => log.id === alertLogId ? { ...log, status: 'RESOLVED' } : log));

      await fetch('/api/alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertLogId, status: 'RESOLVED' })
      });
    } catch (err) {
      console.error('Failed to resolve active alert incident:', err);
      fetchAlertsData(); // revert
    }
  };

  return (
    <Navigation>
      <div className={styles.splitLayout}>
        {/* Left Side: Rule Architect and Listing */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <Bell size={20} style={{ color: 'var(--color-primary)' }} />
              <h2>Alert Rule Thresholds</h2>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Configure threshold rules to monitor latency, throughput, and error rates.
            </span>
          </div>

          {/* New Rule Creation Form */}
          <form className={styles.createRuleForm} onSubmit={handleCreateRule}>
            <div className={styles.formGroup}>
              <span className={styles.formLabel}>Rule Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Critical Payment Timeout"
                className={styles.inputField}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <span className={styles.formLabel}>Target Metric</span>
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  className={styles.inputField}
                >
                  <option value="latency">Avg Latency (ms)</option>
                  <option value="errorRate">Error Rate (%)</option>
                  <option value="rps">Throughput (RPS)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <span className={styles.formLabel}>Condition</span>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className={styles.inputField}
                >
                  <option value=">">Greater Than (&gt;)</option>
                  <option value="<">Less Than (&lt;)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <span className={styles.formLabel}>Threshold Value</span>
                <input
                  type="number"
                  step="any"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="e.g., 500 or 5"
                  className={styles.inputField}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating || !name || !threshold}
              className={styles.addRuleBtn}
            >
              <Plus size={16} />
              <span>{creating ? 'Saving...' : 'Add Alert Rule'}</span>
            </button>
          </form>

          {/* Active Rules List */}
          <div className={styles.rulesList}>
            <span className={styles.formLabel}>Configured Rules</span>
            {loading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
                Loading rules configuration...
              </div>
            ) : rules.length === 0 ? (
              <div className={styles.noAlerts}>No metrics rules configured. Create one above.</div>
            ) : (
              rules.map((rule) => (
                <div key={rule.id} className={styles.ruleCard}>
                  <div className={styles.ruleInfo}>
                    <span className={styles.ruleName}>{rule.name}</span>
                    <span className={styles.ruleSpec}>
                      Check: {rule.metric} {rule.operator} {rule.threshold} (Evaluated over {rule.durationMin}m)
                    </span>
                  </div>

                  <div className={styles.ruleActions}>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={rule.active}
                        onChange={() => handleToggleRule(rule.id, rule.active)}
                      />
                      <span className={styles.slider} />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className={styles.deleteBtn}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Incident Activity Timeline */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <ShieldAlert size={20} style={{ color: 'var(--status-5xx)' }} />
              <h2>Alert History Logs</h2>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Real-time audit log of triggered and resolved telemetry threshold incidents.
            </span>
          </div>

          <div className={styles.timeline}>
            {loading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '40px' }}>
                Loading alert timeline logs...
              </div>
            ) : alertLogs.length === 0 ? (
              <div className={styles.noAlerts}>
                <CheckCircle size={28} style={{ color: 'var(--status-2xx)', marginBottom: '8px' }} />
                <span>All systems green! No incidents triggered in recent database logs.</span>
              </div>
            ) : (
              alertLogs.map((log) => {
                const isActive = log.status === 'ACTIVE';

                return (
                  <div key={log.id} className={styles.timelineItem}>
                    {/* Pulsing red dot if ACTIVE, otherwise standard green dot */}
                    <div className={`${styles.timelineDot} ${isActive ? styles.dotActive : styles.dotResolved}`}>
                      {isActive ? null : <ShieldCheck size={10} style={{ color: 'white' }} />}
                    </div>

                    <div className={styles.timelineHeader}>
                      <span className={styles.timelineRuleName}>{log.rule?.name || 'Threshold Crossed'}</span>
                      <span className={styles.timelineTime}>
                        {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div className={`${styles.timelineBody} ${isActive ? styles.timelineBodyActive : ''}`}>
                      <p className={styles.timelineMessage}>{log.message}</p>
                      
                      <div className={styles.timelineFooter}>
                        <span className={`${styles.timelineBadge} ${isActive ? styles.badgeActive : styles.badgeResolved}`}>
                          {log.status}
                        </span>

                        {isActive && (
                          <button
                            type="button"
                            onClick={() => handleResolveAlert(log.id)}
                            className={styles.resolveBtn}
                          >
                            Resolve Alert
                          </button>
                        )}
                      </div>
                    </div>
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
