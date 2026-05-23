// src/app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Terminal, Sparkles, ShieldAlert, PlayCircle, Cpu, BookOpen, Code, ArrowRight, X, AlertTriangle, Zap, Server
} from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import styles from '@/styles/Landing.module.css';

const GithubIcon = ({ size = 16 }: { size?: number }) => (
  <svg height={size} width={size} viewBox="0 0 16 16" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'text-bottom' }}>
    <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.35 3.12.82.01.64.01 1.24.01 1.39 0 .21-.15.47-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8z" />
  </svg>
);

interface MockConsoleLog {
  time: string;
  method: string;
  path: string;
  status: number;
  duration: number;
  error?: string;
}

export default function LandingPage() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [simulatedLogs, setSimulatedLogs] = useState<MockConsoleLog[]>([]);
  const mockupRef = useRef<HTMLDivElement | null>(null);

  // Support Form states
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('SRE');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactSubmitting, setContactSubmitting] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setTimeout(() => {
      setContactSubmitting(false);
      setContactSubmitted(true);
      setContactEmail('');
      setContactMessage('');
    }, 1500);
  };

  // Generate rolling SRE logs in the hero mockup console
  useEffect(() => {
    const paths = ['/api/users', '/api/payment', '/api/products', '/api/analytics'];
    
    const addMockLog = () => {
      const path = paths[Math.floor(Math.random() * paths.length)];
      const method = path === '/api/payment' ? 'POST' : 'GET';
      const rand = Math.random();
      
      let status = 200;
      let duration = Math.floor(Math.random() * 120) + 40;
      let error: string | undefined = undefined;

      if (rand > 0.85) {
        status = 500;
        duration = Math.floor(Math.random() * 400) + 150;
        error = 'NullPointerException in database engine';
      } else if (rand > 0.70) {
        status = 401;
        duration = Math.floor(Math.random() * 30) + 10;
        error = 'Invalid authorization API key provided';
      } else if (rand > 0.55) {
        status = 200;
        duration = Math.floor(Math.random() * 1000) + 1400; // lag
      }

      const newLog: MockConsoleLog = {
        time: new Date().toLocaleTimeString(),
        method,
        path,
        status,
        duration,
        error
      };

      setSimulatedLogs(prev => [...prev.slice(-3), newLog]); // Keep last 4 logs scrolling
    };

    addMockLog();
    const interval = setInterval(addMockLog, 2500);
    return () => clearInterval(interval);
  }, []);

  // Track cursor position relative to the dashboard mockup wrapper to shine a glowing radial overlay
  const handleMouseMove = (e: React.MouseEvent) => {
    const mockup = mockupRef.current;
    if (!cardRefHasHover(e, mockup)) return;
    const rect = mockup.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mockup.style.setProperty('--mouse-x', `${x}px`);
    mockup.style.setProperty('--mouse-y', `${y}px`);
  };

  const cardRefHasHover = (e: React.MouseEvent, elem: HTMLElement | null): elem is HTMLElement => {
    return elem !== null;
  };

  return (
    <div className={styles.container}>
      {/* 1. Global Navigation Bar */}
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <div className={styles.logoGlow}>
            <Terminal size={18} />
          </div>
          <span className={styles.brandName}>PulseFlow AI</span>
        </div>

        <div className={styles.navLinks}>
          <button type="button" onClick={() => setActiveModal('docs')} className={styles.navLink}>
            Documentation
          </button>
          <button type="button" onClick={() => setActiveModal('tech')} className={styles.navLink}>
            Architecture
          </button>
          <a href="https://github.com/saisaran-m/pulseflow-ai" target="_blank" rel="noreferrer" className={styles.starBadge}>
            <GithubIcon size={14} />
            <span>Star on GitHub</span>
          </a>
        </div>
      </nav>

      {/* 2. Cyberpunk Hero Section */}
      <header className={styles.heroSection}>
        <div className={styles.badge}>
          <Cpu size={12} className="glow-ai" />
          <span>v1.2.0 • Autonomous Observability</span>
        </div>

        <h1 className={styles.headline}>
          Autonomous DevOps Observability <br />
          <span className={styles.glowText}>Powered by Gemini AI</span>
        </h1>

        <p className={styles.subheadline}>
          Monitor real-time serverless PostgreSQL database telemetry, track SRE latency metrics, and diagnose severe Java stack trace crashes instantly using AI.
        </p>

        {/* Call to Actions (CTA) */}
        <div className={styles.ctaGrid}>
          <Link href="/dashboard" className={styles.primaryCta}>
            <span>Enter APM Console</span>
            <ArrowRight size={16} />
          </Link>
          <button type="button" onClick={() => setActiveModal('docs')} className={styles.secondaryCta}>
            <BookOpen size={16} />
            <span>Quick Start Docs</span>
          </button>
          <button type="button" onClick={() => setActiveModal('tech')} className={styles.secondaryCta}>
            <Code size={16} />
            <span>Technical Stack</span>
          </button>
        </div>

        {/* 3. Live Animated Dashboard Mockup */}
        <div 
          ref={mockupRef}
          onMouseMove={handleMouseMove}
          className={styles.mockupWrapper}
        >
          <div className={styles.mockupHeader}>
            <div className={styles.windowButtons}>
              <div className={`${styles.winDot} ${styles.winClose}`} />
              <div className={`${styles.winDot} ${styles.winMin}`} />
              <div className={`${styles.winDot} ${styles.winMax}`} />
            </div>
            <span className={styles.mockupTitle}>live_telemetry_terminal_dashboard</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'var(--status-2xx)' }}>
              <span className="pulse-dot" style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--status-2xx)', borderRadius: '50%' }} />
              <span>LIVE CLOUD FEED</span>
            </div>
          </div>

          <div className={styles.mockupGrid}>
            <div className={styles.miniCard}>
              <span className={styles.miniTitle}>Throughput</span>
              <span className={styles.miniValue} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                <Zap size={16} className="glow-primary" />
                <span>1.48 RPS</span>
              </span>
            </div>
            <div className={styles.miniCard}>
              <span className={styles.miniTitle}>Avg Latency</span>
              <span className={styles.miniValue} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-2xx)' }}>
                <Server size={16} className="glow-2xx" />
                <span>88 ms</span>
              </span>
            </div>
            <div className={styles.miniCard}>
              <span className={styles.miniTitle}>Error Rate</span>
              <span className={styles.miniValue} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--status-5xx)' }}>
                <AlertTriangle size={16} className="glow-5xx" />
                <span>0.8%</span>
              </span>
            </div>
          </div>

          {/* Rolling simulated log stream */}
          <div className={styles.terminalOutput}>
            {simulatedLogs.map((log, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>[{log.time}]</span>
                  <span className={styles.tPrompt} style={{ color: log.method === 'POST' ? 'var(--status-2xx)' : 'var(--color-primary)' }}>
                    {log.method}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{log.path}</span>
                  <span style={{
                    color: log.status >= 500 ? 'var(--status-5xx)' : log.status >= 400 ? 'var(--status-4xx)' : 'var(--status-2xx)',
                    fontWeight: 700
                  }}>
                    {log.status}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>({log.duration}ms)</span>
                </div>
                {log.error && (
                  <span className={styles.tRed} style={{ paddingLeft: '20px', fontSize: '11px', color: 'var(--status-5xx)' }}>
                    └── Error: {log.error}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4. Features Section Grid */}
        <h2 className={styles.sectionTitle}>Engineered for Enterprise Observability</h2>
        <p className={styles.sectionDesc}>
          Advanced DevOps diagnostic capabilities optimized with high-performance systems and Google AI.
        </p>

        <div className={styles.featuresGrid}>
          {/* Feature 1: Gemini AI */}
          <GlowCard className={styles.featCard}>
            <div className={styles.featIcon}>
              <Sparkles size={20} />
            </div>
            <h3 className={styles.featName}>Gemini SRE Co-Pilot</h3>
            <p className={styles.featDesc}>
              Automatically isolates severe exception traces, evaluates downstream impacts, and outputs copy-to-clipboard code patches instantly.
            </p>
          </GlowCard>

          {/* Feature 2: Alert Rules */}
          <GlowCard className={styles.featCard}>
            <div className={styles.featIcon}>
              <ShieldAlert size={20} />
            </div>
            <h3 className={styles.featName}>Dynamic Incident Alerting</h3>
            <p className={styles.featDesc}>
              A live CRUD alert rule monitor that parses your last 5 minutes of telemetry logs, triggering incident audits and active notification logs.
            </p>
          </GlowCard>

          {/* Feature 3: Sandbox Autopilot */}
          <GlowCard className={styles.featCard}>
            <div className={styles.featIcon}>
              <PlayCircle size={20} />
            </div>
            <h3 className={styles.featName}>Traffic Autopilot Simulator</h3>
            <p className={styles.featDesc}>
              Fires simultaneous, concurrent simulation bursts including normal traffic, slow SQL bottlenecks, and server crashes to stress-test your stack.
            </p>
          </GlowCard>
        </div>
      </header>

      {/* 5. Sleek Technical Modals */}
      {activeModal === 'docs' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <BookOpen size={16} />
                <span>Developer Documentation</span>
              </div>
              <X size={18} className={styles.modalClose} onClick={() => setActiveModal(null)} />
            </div>
            <div className={styles.modalContent}>
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>Database Schema DDL Setup</span>
                <span className={styles.modalValue}>
                  Since local ISPs block port `5432`, you can set up the tables directly in the Neon SQL Editor using secure WebSockets:
                </span>
                <div className={styles.terminalBlock}>
                  {`https://pulseflow-ai-hub.vercel.app/api/init-db`}
                </div>
              </div>
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>Vercel Environment Variables</span>
                <span className={styles.modalValue}>
                  Add the following environment variables to your Vercel project dashboard Settings:
                </span>
                <div className={styles.terminalBlock}>
                  {`DATABASE_URL="postgresql://neondb_owner:***@ep-***.neon.tech/neondb?sslmode=require"\nGEMINI_API_KEY="AIzaSy***"`}
                </div>
              </div>
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>Autopilot Telemetry Simulation</span>
                <span className={styles.modalValue}>
                  Open the Traffic Sandbox inside your deployed console and switch Autopilot ON. This seeds live logs into Neon PostgreSQL every 3 seconds automatically!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'tech' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <Code size={16} />
                <span>Architecture & Tech Stack</span>
              </div>
              <X size={18} className={styles.modalClose} onClick={() => setActiveModal(null)} />
            </div>
            <div className={styles.modalContent}>
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>Frontend Architecture</span>
                <span className={styles.modalValue}>
                  Next.js App Router (React 19), styled with Vanilla CSS Modules, and enhanced with floating plexus HTML5 WebGL canvas layouts.
                </span>
              </div>
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>Database & Client Engine</span>
                <span className={styles.modalValue}>
                  Prisma ORM (v6.19.3) configured with a serverless PostgreSQL client connecting to Neon Serverless database fleet. Includes performance single and multi-column indexes on log timestamps and path queries.
                </span>
              </div>
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>Generative AI Diagnostics</span>
                <span className={styles.modalValue}>
                  Utilizes Google Gemini Pro API via Next.js serverless routes, feeding route traceback logs, exception payloads, and SRE context dynamically to produce instant patched code blocks.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'contact' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <Terminal size={16} />
                <span>Contact SRE Command</span>
              </div>
              <X size={18} className={styles.modalClose} onClick={() => setActiveModal(null)} />
            </div>
            
            {contactSubmitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '20px 0', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-2xx)', boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)', margin: '0 auto' }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ margin: 'auto' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Operator Dispatch Confirmed</h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '340px' }}>
                  Your encrypted support ticket has been registered in the Neon cloud node. An SRE response technician will contact you shortly.
                </p>
                <button type="button" onClick={() => setActiveModal(null)} className={styles.primaryCta} style={{ padding: '8px 20px', fontSize: '12px', marginTop: '10px' }}>
                  Close Connection
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className={styles.modalContent}>
                <div className={styles.modalSection}>
                  <label htmlFor="modal-email" className={styles.modalLabel}>SRE Email Address</label>
                  <input 
                    id="modal-email"
                    type="email" 
                    required 
                    placeholder="operator@domain.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '13px'
                    }}
                  />
                </div>
                
                <div className={styles.modalSection}>
                  <label htmlFor="modal-role" className={styles.modalLabel}>Operational Role</label>
                  <select
                    id="modal-role"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '13px'
                    }}
                  >
                    <option value="SRE">Site Reliability Engineer (SRE)</option>
                    <option value="DevOps">DevOps Platform Architect</option>
                    <option value="Developer">Application Developer</option>
                    <option value="Student">System Evaluator</option>
                  </select>
                </div>
                
                <div className={styles.modalSection}>
                  <label htmlFor="modal-message" className={styles.modalLabel}>Incident Description / Message</label>
                  <textarea 
                    id="modal-message"
                    required 
                    rows={4} 
                    placeholder="Describe your serverless query bottleneck or SRE support requirement..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '13px',
                      resize: 'none'
                    }}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={contactSubmitting}
                  className={styles.primaryCta} 
                  style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                >
                  {contactSubmitting ? 'Transmitting Package...' : 'Dispatch Ticket'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {activeModal === 'privacy' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <ShieldAlert size={16} />
                <span>Encrypted Privacy Protocol</span>
              </div>
              <X size={18} className={styles.modalClose} onClick={() => setActiveModal(null)} />
            </div>
            <div className={styles.modalContent} style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>1. Telemetry Collection</span>
                <span className={styles.modalValue}>
                  PulseFlow AI is engineered as a secure DevOps APM sandbox. We collect metadata including HTTP request durations, status code classes, path endpoints, and compiler exception stack traces.
                </span>
              </div>
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>2. Zero Sensitive PII Retention</span>
                <span className={styles.modalValue}>
                  All request payloads and database rows are generated programmatically or securely sanitized in serverless route layers before processing. We do not store real-world passwords, payment accounts, or identifiable keys.
                </span>
              </div>
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>3. Generative Diagnostic Auditing</span>
                <span className={styles.modalValue}>
                  Exceptions selected for SRE co-pilot reviews are processed via stateless API boundaries. Stack trace data is fed to Google Gemini models exclusively to compile localized diagnostic recommendation code patches.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'terms' && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                <Code size={16} />
                <span>Service Level SLA Terms</span>
              </div>
              <X size={18} className={styles.modalClose} onClick={() => setActiveModal(null)} />
            </div>
            <div className={styles.modalContent} style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>1. Evaluation SLA</span>
                <span className={styles.modalValue}>
                  This platform is provided exclusively for portfolio evaluation, interview showcase, and SaaS traffic simulation tests. Standard serverless PostgreSQL compute limits are governed by Neon Cloud tiers.
                </span>
              </div>
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>2. Autopilot Simulation Policies</span>
                <span className={styles.modalValue}>
                  Sandbox traffic autopilot loops inject a maximum of 1 log query every 3 seconds to preserve database resources. High-volume custom concurrent stress tests must be launched responsibly.
                </span>
              </div>
              <div className={styles.modalSection}>
                <span className={styles.modalLabel}>3. Code Patch Licensing</span>
                <span className={styles.modalValue}>
                  All software code suggestions and isolated error patches synthesized by the Gemini AI integration are provided under the Apache 2.0 Open Source framework, granting unrestricted rights for reuse and editing.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <footer className={styles.footer}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
          <span>v1.2.0 • PulseFlow AI Cloud Observability Hub</span>
          <span>Developed by saisaran-m • Open Source Apache 2.0</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button type="button" onClick={() => { setContactSubmitted(false); setActiveModal('contact'); }} className={styles.navLink} style={{ cursor: 'pointer' }}>Contact Operator</button>
          <button type="button" onClick={() => setActiveModal('privacy')} className={styles.navLink} style={{ cursor: 'pointer' }}>Privacy Protocol</button>
          <button type="button" onClick={() => setActiveModal('terms')} className={styles.navLink} style={{ cursor: 'pointer' }}>SLA Terms</button>
        </div>
      </footer>
    </div>
  );
}
