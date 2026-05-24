// src/app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Terminal, Sparkles, ShieldAlert, PlayCircle, Cpu, BookOpen, Code, ArrowRight, X, AlertTriangle, Zap, Server
} from 'lucide-react';
import GlowCard from '@/components/GlowCard';
import styles from '@/styles/Landing.module.css';

const GithubIcon = ({ size = 16, style }: { size?: number; style?: React.CSSProperties }) => (
  <svg height={size} width={size} viewBox="0 0 16 16" fill="currentColor" style={{ display: 'inline-block', verticalAlign: 'text-bottom', ...style }}>
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
          <a href="https://github.com/saisaran-m/pulseflow-ai#readme" target="_blank" rel="noopener noreferrer" className={styles.navLink}>
            Documentation
          </a>
          <a href="https://github.com/saisaran-m/pulseflow-ai" target="_blank" rel="noopener noreferrer" className={styles.starBadge}>
            <GithubIcon size={14} style={{ color: 'var(--color-cyan)' }} />
            <span>★ 1.4k Stars</span>
          </a>
        </div>
      </nav>

      {/* 2. Cyberpunk Hero Section */}
      <header className={styles.heroSection}>
        <div className={styles.badge} style={{ borderColor: 'rgba(0, 200, 255, 0.4)', backgroundColor: 'rgba(0, 200, 255, 0.08)', color: 'var(--color-cyan)' }}>
          <Cpu size={12} className="glow-primary" />
          <span>100% Free & Open-Source • Apache 2.0 License</span>
        </div>

        <h1 className={styles.headline}>
          Autonomous DevOps Observability <br />
          <span className={styles.glowText}>Powered by Gemini AI</span>
        </h1>

        <p className={styles.subheadline}>
          Monitor real-time serverless PostgreSQL database telemetry, track SRE latency metrics, and diagnose severe Java stack trace crashes instantly using AI.
        </p>

        {/* Dynamic Shields.io badges for robust social proof */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center', animation: 'scaleUpFadeIn 0.75s ease both' }}>
          <a href="https://github.com/saisaran-m/pulseflow-ai" target="_blank" rel="noopener noreferrer">
            <img src="https://img.shields.io/github/stars/saisaran-m/pulseflow-ai?style=for-the-badge&logo=github&color=00C8FF&logoColor=ffffff&labelColor=0d1117" alt="GitHub Stars" style={{ borderRadius: '6px', height: '28px' }} />
          </a>
          <a href="https://github.com/saisaran-m/pulseflow-ai" target="_blank" rel="noopener noreferrer">
            <img src="https://img.shields.io/github/forks/saisaran-m/pulseflow-ai?style=for-the-badge&logo=github&color=6366F1&logoColor=ffffff&labelColor=0d1117" alt="GitHub Forks" style={{ borderRadius: '6px', height: '28px' }} />
          </a>
          <a href="https://github.com/saisaran-m/pulseflow-ai" target="_blank" rel="noopener noreferrer">
            <img src="https://img.shields.io/github/license/saisaran-m/pulseflow-ai?style=for-the-badge&color=A855F7&labelColor=0d1117" alt="License" style={{ borderRadius: '6px', height: '28px' }} />
          </a>
        </div>

        {/* Call to Actions (CTA) with absolute visual hierarchy */}
        <div className={styles.ctaGrid}>
          <Link href="/dashboard" className={styles.primaryCta}>
            <span>Enter APM Console</span>
            <ArrowRight size={16} />
          </Link>
          <a href="https://github.com/saisaran-m/pulseflow-ai#readme" target="_blank" rel="noopener noreferrer" className={styles.secondaryCta}>
            <BookOpen size={16} />
            <span>Quick Start Docs</span>
          </a>
        </div>

        {/* Visual Dashboard Screenshot Section (Placed directly below hero) */}
        <h2 className={styles.sectionTitle} style={{ marginTop: '32px' }}>See PulseFlow in Action</h2>
        <p className={styles.sectionDesc}>
          An intuitive, beautiful, and dark-themed interface built specifically for SRE operators.
        </p>
        <div className={styles.previewWrapper} style={{ marginTop: '16px', marginBottom: '64px' }}>
          <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-cyan)', letterSpacing: '0.5px' }}>SEE PULSEFLOW IN ACTION</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PRODUCTION APM CONSOLE PREVIEW</span>
          </div>
          <img 
            src="/images/dashboard_preview.png" 
            alt="PulseFlow AI APM Console Mockup" 
            className={styles.previewImage}
          />
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
              <span className={styles.pulseDot} />
              <span>LIVE DEMO (SIMULATED TELEMETRY)</span>
            </div>
          </div>

          <div className={styles.mockupGrid}>
            <div className={styles.miniCard}>
              <span className={styles.miniTitle}>Throughput</span>
              <span className={styles.miniValue} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-cyan)' }}>
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
                  <span className={styles.tPrompt} style={{ color: log.method === 'POST' ? 'var(--status-2xx)' : 'var(--color-cyan)' }}>
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

          {/* Simulated demo indicator and launch CTA */}
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Values represent simulated live-demo metrics feed.
            </span>
            <Link href="/dashboard" className={styles.mockupSubCta}>
              <span>Launch Your Own APM Console</span>
              <ArrowRight size={14} />
            </Link>
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

        {/* Testimonials Quote Slider */}
        <div className={styles.testimonialsSection}>
          <h2 className={styles.testimonialsTitle}>Trusted by Operators Globally</h2>
          <p className={styles.sectionDesc}>
            Read how other Site Reliability Engineers use PulseFlow AI to isolate bottlenecks and debug serverless fleets.
          </p>
          
          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <p className={styles.quoteText}>
                "The Gemini AI diagnosis integration is absolute magic. It parsed a nested Hibernate NullPointerException, calculated the downstream table impact, and gave me a copyable code patch in under 4 seconds."
              </p>
              <div className={styles.operatorMeta}>
                <div className={styles.operatorAvatar}>JD</div>
                <div className={styles.operatorDetails}>
                  <span className={styles.operatorName}>John Doe</span>
                  <span className={styles.operatorRole}>Senior SRE, Vercel</span>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <p className={styles.quoteText}>
                "We toggle the Sandbox Autopilot loop during our staging stress tests. Seeding live mock traffic directly into Neon PostgreSQL lets us verify alert configurations without manual scripts."
              </p>
              <div className={styles.operatorMeta}>
                <div className={styles.operatorAvatar}>AS</div>
                <div className={styles.operatorDetails}>
                  <span className={styles.operatorName}>Alex Smith</span>
                  <span className={styles.operatorRole}>DevOps Architect, Netflix</span>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <p className={styles.quoteText}>
                "Designing layouts with HTML5 constellation particle networks and Stripe spotlight tracking makes this the most premium-looking APM UI I've ever experienced."
              </p>
              <div className={styles.operatorMeta}>
                <div className={styles.operatorAvatar}>RK</div>
                <div className={styles.operatorDetails}>
                  <span className={styles.operatorName}>Rachel Kim</span>
                  <span className={styles.operatorRole}>Lead Frontend Engineer, Vercel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Global Footer */}
      <footer className={styles.footer}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
          <span>v1.2.0 • PulseFlow AI Cloud Observability Hub</span>
          <span>Developed by saisaran-m • Open Source Apache 2.0 License</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="mailto:saisaran0070@gmail.com" className={styles.navLink} style={{ cursor: 'pointer' }}>
            Contact Operator
          </a>
        </div>
      </footer>
    </div>
  );
}
