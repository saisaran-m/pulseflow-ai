// src/components/ChartContainer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell 
} from 'recharts';
import styles from '@/styles/Dashboard.module.css';

interface ChartDataPoint {
  timestamp: string;
  requests: number;
  errors: number;
  latency: number;
}

interface ChartContainerProps {
  data: ChartDataPoint[];
}

export default function ChartContainer({ data }: ChartContainerProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent Next.js SSR hydration mismatches for SVG charts
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard} style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-muted)' }}>Loading Telemetry Visualizer...</div>
        </div>
        <div className={styles.chartCard} style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-muted)' }}>Loading Latency Analyser...</div>
        </div>
      </div>
    );
  }

  // Custom tooltips with styled glassmorphism overlays
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(6, 9, 19, 0.95)',
          border: '1px solid var(--border-glow)',
          borderRadius: '8px',
          padding: '12px 16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px'
        }}>
          <p style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', fontWeight: 'bold' }}>Bucket: {label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ margin: '3px 0 0 0', color: p.color || p.fill }}>
              {p.name}: <span style={{ fontWeight: 'bold', color: 'white' }}>{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartsGrid}>
      {/* Chart 1: Traffic Throughput and Error Streams */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Traffic throughput &amp; Error rates</h3>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Requests vs Status Failures
          </div>
        </div>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--status-5xx)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="var(--status-5xx)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                stroke="var(--text-muted)" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="requests" 
                name="Total Requests" 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRequests)" 
              />
              <Area 
                type="monotone" 
                dataKey="errors" 
                name="Failed Requests" 
                stroke="var(--status-5xx)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorErrors)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: System Latency Ticks */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>Server Latency Distribution</h3>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Average Duration (ms)
          </div>
        </div>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                stroke="var(--text-muted)" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                unit="ms"
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="latency" 
                name="Avg Duration" 
                fill="var(--status-2xx)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              >
                {data.map((entry, index) => {
                  // Make slow bars look warning-colored (orange/red) dynamically!
                  let color = 'var(--color-primary)';
                  if (entry.latency > 1000) color = 'var(--status-5xx)';
                  else if (entry.latency > 300) color = 'var(--status-3xx)';
                  return <Cell key={`cell-${index}`} fill={color} opacity={0.8} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
