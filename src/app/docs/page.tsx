// src/app/docs/page.tsx
'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import styles from '@/styles/Dashboard.module.css';

export default function DocsPage() {
  return (
    <Navigation>
      <div className={styles.chartHeader} style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>Operator Documentation</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            PulseFlow AI quick start guides, database schemas, and integration commands.
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto', width: '100%', textAlign: 'left' }}>
        {/* Card 1: DDL Database Init */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ai)' }}>1. Database Schema DDL Setup</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            PulseFlow AI integrates with Neon Serverless PostgreSQL. To set up your schema tables instantly inside your Neon SQL Editor, execute the following API initialization route:
          </p>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: '#38bdf8'
          }}>
            GET https://pulseflow-ai-hub.vercel.app/api/init-db
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            * This checks your database credentials and automatically creates the Log, AlertRule, and AlertLog tables.
          </span>
        </div>

        {/* Card 2: Environment Variables */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)' }}>2. Vercel Environment Variables</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            To run PulseFlow AI on your own Vercel environment, add the following configuration environment variables inside your Project settings:
          </p>
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: '#38bdf8',
            whiteSpace: 'pre-wrap'
          }}>
            {`DATABASE_URL="postgresql://neondb_owner:***@ep-***.neon.tech/neondb?sslmode=require"\nGEMINI_API_KEY="AIzaSy***"`}
          </div>
        </div>

        {/* Card 3: Autopilot Traffic Injection */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--status-2xx)' }}>3. Telemetry Sandbox Autopilot</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Our traffic autopilot loop triggers active query logs in the background so you can stress test your APM console. Open the **Traffic Sandbox** in the sidebar and click the **Autopilot toggle** to begin seeding:
          </p>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Successful Calls</strong>: Seeds normal HTTP 200 OK operations.</li>
            <li><strong>Database read bottlenecks</strong>: Simulates slow SQL scans (1500-2500ms).</li>
            <li><strong>Critical crashes</strong>: Injects severe Java null database client stack traces.</li>
          </ul>
        </div>
      </div>
    </Navigation>
  );
}
