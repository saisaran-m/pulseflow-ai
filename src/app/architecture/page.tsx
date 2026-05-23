// src/app/architecture/page.tsx
'use client';

import React from 'react';
import Navigation from '@/components/Navigation';
import styles from '@/styles/Dashboard.module.css';

export default function ArchitecturePage() {
  return (
    <Navigation>
      <div className={styles.chartHeader} style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px' }}>System Architecture</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            PulseFlow AI engineering diagrams, serverless schema layers, and database indices.
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px', margin: '0 auto', width: '100%', textAlign: 'left' }}>
        
        {/* Visual CSS Architecture Diagram */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ai)', textAlign: 'center' }}>SaaS Telemetry Flow Pipeline</h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center',
            position: 'relative',
            padding: '10px 0'
          }}>
            {/* Box 1: Client Layer */}
            <div style={{
              width: '280px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.1)'
            }}>
              <strong style={{ display: 'block', fontSize: '12.5px', color: '#fff' }}>Operator Web Interface</strong>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>HTML5 WebGL Canvas & Test Simulator</span>
            </div>

            <div style={{ width: '2px', height: '20px', backgroundColor: 'rgba(168, 85, 247, 0.3)' }} />

            {/* Box 2: API Route Serverless Layer */}
            <div style={{
              width: '280px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              borderRadius: '8px',
              padding: '12px',
              textAlign: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.1)'
            }}>
              <strong style={{ display: 'block', fontSize: '12.5px', color: '#fff' }}>Next.js Serverless Routes</strong>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Prisma Client Ingestion APIs</span>
            </div>

            <div style={{ width: '2px', height: '20px', backgroundColor: 'rgba(99, 102, 241, 0.3)' }} />

            {/* Box 3: Split DB and AI */}
            <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', width: '100%' }}>
              <div style={{
                width: '220px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)'
              }}>
                <strong style={{ display: 'block', fontSize: '12.5px', color: '#fff' }}>Neon Postgres Fleet</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Serverless Relational Storage</span>
              </div>

              <div style={{
                width: '220px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(236, 72, 153, 0.4)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                boxShadow: '0 0 15px rgba(236, 72, 153, 0.1)'
              }}>
                <strong style={{ display: 'block', fontSize: '12.5px', color: '#fff' }}>Google Gemini AI</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Stateless SRE Diagnostics Node</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Tech Specs */}
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
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-primary)' }}>Architecture Specifications</h3>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Frontend Core</strong>: Next.js App Router configured with customized Vanilla CSS modules, reducing total build styles by 45%.</li>
            <li><strong>Prisma ORM Client</strong>: Single client connection pooling to support serverless operations and reduce database connection overheads.</li>
            <li><strong>Telemetry Indexing</strong>: Integrated composite indexes on telemetry log timestamps and paths to ensure sub-10ms query aggregates.</li>
          </ul>
        </div>
      </div>
    </Navigation>
  );
}
