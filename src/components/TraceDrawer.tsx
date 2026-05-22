// src/components/TraceDrawer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Check, Copy } from 'lucide-react';
import styles from '@/styles/Logs.module.css';

interface TraceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  log: any | null;
}

export default function TraceDrawer({ isOpen, onClose, log }: TraceDrawerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset analysis when drawer log changes
  useEffect(() => {
    setAnalysisReport(null);
    setAnalyzing(false);
  }, [log]);

  if (!isOpen || !log) return null;

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Pretty-print JSON bodies safely
  const formatJson = (str: string | null) => {
    if (!str) return 'None';
    try {
      const parsed = JSON.parse(str);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return str;
    }
  };

  // Trigger Gemini AI Diagnostic Analysis
  const runAiAnalysis = async () => {
    if (!log) return;
    setAnalyzing(true);
    setAnalysisReport(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: log.id })
      });

      const data = await response.json();
      if (data.success) {
        setAnalysisReport(data.analysis);
      } else {
        alert('AI Diagnostics failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Network error during SRE analysis: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Click-to-copy code patch implementation
  const handleCopyPatch = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Method Badge Stylings
  const getMethodStyle = (method: string) => {
    switch (method) {
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

  // Latency Speed Stylings
  const getDurationStyle = (duration: number) => {
    if (duration >= 1000) return styles.durationSlow;
    if (duration >= 300) return styles.durationWarning;
    return styles.durationFast;
  };

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerHeaderTop}>
            <div className={styles.drawerTitle}>
              <span className={`${styles.methodBadge} ${getMethodStyle(log.method)}`}>
                {log.method}
              </span>
              <span className={styles.path}>{log.path}</span>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className={styles.drawerMetaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status Code</span>
              <span className={`${styles.statusBadge} ${getStatusStyle(log.statusCode)}`}>
                {log.statusCode}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Duration</span>
              <span className={`${styles.metaValue} ${getDurationStyle(log.duration)}`}>
                {log.duration} ms
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Timestamp</span>
              <span className={styles.timestamp}>
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Simulated IP</span>
              <span className={styles.metaValue}>{log.ip}</span>
            </div>
          </div>
        </div>

        {/* Drawer Body content (scrollable) */}
        <div className={styles.drawerBody}>
          <div className={styles.bodySection}>
            <span className={styles.sectionLabel}>Client User-Agent</span>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {log.userAgent}
            </div>
          </div>

          {log.requestPayload && (
            <div className={styles.bodySection}>
              <span className={styles.sectionLabel}>Request Payload (JSON)</span>
              <pre className={styles.codeBlock}>{formatJson(log.requestPayload)}</pre>
            </div>
          )}

          <div className={styles.bodySection}>
            <span className={styles.sectionLabel}>Response Body</span>
            <pre className={styles.codeBlock}>{formatJson(log.responseBody)}</pre>
          </div>

          {log.stackTrace && (
            <div className={styles.bodySection}>
              <span className={styles.sectionLabel}>Stack Trace logs</span>
              <pre className={`${styles.codeBlock} ${styles.stackTraceBlock}`}>{log.stackTrace}</pre>
            </div>
          )}

          {/* AI Root-Cause Diagnostic Segment */}
          {(log.statusCode >= 400 || log.duration >= 1000) && (
            <div className={styles.aiAnalysisSection}>
              {!analyzing && !analysisReport && (
                <button className={styles.analyzeBtn} onClick={runAiAnalysis}>
                  <Sparkles size={16} />
                  <span>Analyze Trace with Gemini</span>
                </button>
              )}

              {/* Glowing Purple Loader Ticker */}
              {analyzing && (
                <div className={styles.aiLoader}>
                  <Sparkles size={28} className={`${styles.sparklePulse} glow-ai`} />
                  <span className={styles.aiLoaderText}>Correlating trace nodes with Gemini...</span>
                </div>
              )}

              {/* Gemini SRE Diagnostic Report Output */}
              {analysisReport && (
                <div className={`${styles.aiReportCard} glow-ai`}>
                  <div className={styles.aiReportHeader}>
                    <div className={styles.aiTitle}>
                      <Sparkles size={16} />
                      <span>Gemini Root Cause Report</span>
                      <span className={`${styles.severityBadge} ${styles['severity' + analysisReport.severity]}`}>
                        {analysisReport.severity}
                      </span>
                    </div>
                    <span className={styles.aiProviderBadge}>AI Observability Engine</span>
                  </div>

                  <div className={styles.reportBlock}>
                    <span className={styles.reportLabel}>Issue Identified</span>
                    <p className={styles.reportText}>{analysisReport.issueIdentification}</p>
                  </div>

                  <div className={styles.reportBlock}>
                    <span className={styles.reportLabel}>Downstream System Impact</span>
                    <p className={styles.reportText}>{analysisReport.systemImpact}</p>
                  </div>

                  {analysisReport.suggestedPatch && (
                    <div className={styles.reportBlock}>
                      <span className={styles.reportLabel}>Suggested Patch Correction</span>
                      <div className={styles.patchContainer}>
                        <div className={styles.patchHeader}>
                          <span className={styles.patchTitle}>patched_code_update</span>
                          <button 
                            className={styles.copyPatchBtn}
                            onClick={() => handleCopyPatch(analysisReport.suggestedPatch)}
                          >
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                          </button>
                        </div>
                        <pre className={styles.patchCodeBlock}>{analysisReport.suggestedPatch}</pre>
                      </div>
                    </div>
                  )}

                  {analysisReport.quickActions && analysisReport.quickActions.length > 0 && (
                    <div className={styles.reportBlock}>
                      <span className={styles.reportLabel}>Quick Remediation Steps</span>
                      <div className={styles.actionsGrid}>
                        {analysisReport.quickActions.map((action: string, idx: number) => (
                          <div key={idx} className={styles.reportActionItem}>
                            <AlertCircle size={12} className={styles.actionCheck} />
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
