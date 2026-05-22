// src/components/MetricsGrid.tsx
'use client';

import React from 'react';
import { ArrowUpRight, CheckCircle, AlertTriangle, Zap, Server } from 'lucide-react';
import styles from '@/styles/Dashboard.module.css';

interface MetricsGridProps {
  metrics: {
    totalRequests: number;
    averageLatency: number;
    p95Latency: number;
    errorRate: number;
    rps: number;
  };
}

export default function MetricsGrid({ metrics }: MetricsGridProps) {
  const { totalRequests, averageLatency, p95Latency, errorRate, rps } = metrics;

  // Determine health states to assign dynamic neon card glow borders
  const getErrorState = () => {
    if (errorRate > 10) return { style: styles.cardDanger, label: 'CRITICAL OUTAGE', color: 'var(--status-5xx)', icon: AlertTriangle };
    if (errorRate > 3) return { style: styles.cardWarning, label: 'DEGRADED PERFORMANCE', color: 'var(--status-3xx)', icon: AlertTriangle };
    return { style: styles.cardSuccess, label: 'SYSTEM HEALTHY', color: 'var(--status-2xx)', icon: CheckCircle };
  };

  const getLatencyState = () => {
    if (averageLatency > 500) return styles.cardWarning;
    if (averageLatency > 200) return styles.cardPrimary;
    return styles.cardSuccess;
  };

  const errorStatus = getErrorState();
  const ErrorIcon = errorStatus.icon;

  return (
    <div className={styles.metricsGrid}>
      {/* Card 1: System Throughput */}
      <div className={`${styles.card} ${styles.cardPrimary}`}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Throughput</span>
          <div className={styles.iconWrapper}>
            <Zap size={16} />
          </div>
        </div>
        <div className={styles.cardBody}>
          <span className={styles.cardValue}>{rps.toFixed(2)} RPS</span>
          <span className={styles.cardSubtext}>
            {totalRequests.toLocaleString()} total requests logged
          </span>
        </div>
      </div>

      {/* Card 2: System Health / Error Rate */}
      <div className={`${styles.card} ${errorStatus.style}`}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Error Rate</span>
          <div className={styles.iconWrapper}>
            <ErrorIcon size={16} />
          </div>
        </div>
        <div className={styles.cardBody}>
          <span className={styles.cardValue} style={{ color: errorStatus.color }}>
            {errorRate.toFixed(1)}%
          </span>
          <span className={styles.cardSubtext} style={{ color: errorStatus.color, fontWeight: 600, fontSize: '10px' }}>
            {errorStatus.label}
          </span>
        </div>
      </div>

      {/* Card 3: Average Latency */}
      <div className={`${styles.card} ${getLatencyState()}`}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Avg Latency</span>
          <div className={styles.iconWrapper}>
            <Server size={16} />
          </div>
        </div>
        <div className={styles.cardBody}>
          <span className={styles.cardValue}>{Math.round(averageLatency)} ms</span>
          <span className={styles.cardSubtext}>
            Target budget: &lt; 200ms
          </span>
        </div>
      </div>

      {/* Card 4: P95 Latency */}
      <div className={`${styles.card} ${p95Latency > 800 ? styles.cardWarning : styles.cardPrimary}`}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>P95 Latency</span>
          <div className={styles.iconWrapper}>
            <ArrowUpRight size={16} />
          </div>
        </div>
        <div className={styles.cardBody}>
          <span className={styles.cardValue}>{Math.round(p95Latency)} ms</span>
          <span className={styles.cardSubtext}>
            95% of requests complete within this budget
          </span>
        </div>
      </div>
    </div>
  );
}
