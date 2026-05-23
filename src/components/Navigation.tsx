// src/components/Navigation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, ListFilter, PlayCircle, Bell, Terminal, Cpu, LogOut } from 'lucide-react';
import styles from '@/styles/Navigation.module.css';

interface NavigationProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = sessionStorage.getItem('pulseflow_session');
      if (session !== 'authorized' && session !== 'demo_authorized') {
        router.push('/login');
      } else {
        setAuthorized(true);
      }
    }
  }, [router]);

  const handleSignOut = () => {
    sessionStorage.removeItem('pulseflow_session');
    router.push('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Request Tracer', path: '/logs', icon: ListFilter },
    { name: 'Traffic Sandbox', path: '/sandbox', icon: PlayCircle },
    { name: 'Alert Center', path: '/alerts', icon: Bell }
  ];

  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative', background: 'radial-gradient(circle at 50% 50%, #0c0b14 0%, #050508 100%)', overflow: 'hidden' }}>
        {/* 1. Skeleton Sidebar */}
        <aside className={styles.sidebar} style={{ borderRight: '1px solid rgba(255, 255, 255, 0.03)' }}>
          <div className={styles.brand}>
            <div className={styles.logoGlow} style={{ opacity: 0.6 }}>
              <Terminal size={18} />
            </div>
            <span className={styles.brandName}>PulseFlow AI</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="pulse-skeleton" style={{ height: '38px', width: '100%', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.01)' }} />
            ))}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '20px' }}>
            <div className="pulse-skeleton" style={{ height: '34px', width: '100%', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.01)', border: '1px solid rgba(239, 68, 68, 0.03)' }} />
            <div className="pulse-skeleton" style={{ height: '14px', width: '60%', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.02)' }} />
          </div>
        </aside>

        {/* 2. Skeleton Header */}
        <header className={styles.header} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
          <div className="pulse-skeleton" style={{ height: '20px', width: '150px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.03)' }} />
          <div className="pulse-skeleton" style={{ height: '24px', width: '120px', borderRadius: '12px', backgroundColor: 'rgba(168, 85, 247, 0.03)', border: '1px solid rgba(168, 85, 247, 0.05)' }} />
        </header>

        {/* 3. Skeleton Content Panel */}
        <main className={styles.contentWrapper}>
          <div className={styles.mainContainer}>
            {/* Operator Authorization Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'rgba(168, 85, 247, 0.02)', border: '1px solid rgba(168, 85, 247, 0.1)', padding: '14px 20px', borderRadius: '8px' }}>
              <div style={{ width: '14px', height: '14px', border: '2px solid rgba(168, 85, 247, 0.2)', borderTopColor: 'var(--color-ai)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--color-ai)', fontFamily: 'var(--font-mono)' }}>Authenticating SRE Node Session...</span>
            </div>

            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', width: '100%' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="pulse-skeleton" style={{ height: '105px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.02)' }} />
              ))}
            </div>

            {/* Chart Area */}
            <div className="pulse-skeleton" style={{ height: '320px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.015)', border: '1px solid rgba(255, 255, 255, 0.02)' }} />

            {/* Bottom Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', width: '100%' }}>
              <div className="pulse-skeleton" style={{ height: '240px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.015)', border: '1px solid rgba(255, 255, 255, 0.02)' }} />
              <div className="pulse-skeleton" style={{ height: '240px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.015)', border: '1px solid rgba(255, 255, 255, 0.02)' }} />
            </div>
          </div>
        </main>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes skeleton-pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.9; }
          }
          .pulse-skeleton {
            animation: skeleton-pulse 1.8s infinite ease-in-out;
          }
        `}} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* 1. Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <Link href="/" className={styles.brand} style={{ textDecoration: 'none', display: 'flex', width: '100%' }}>
          <div className={styles.logoGlow}>
            <Terminal size={18} />
          </div>
          <span className={styles.brandName}>PulseFlow AI</span>
        </Link>

        <nav className={styles.menu}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`${styles.navLink} ${isActive ? styles.activeNavLink : ''}`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          {/* Sign Out Button */}
          <button 
            type="button" 
            onClick={handleSignOut} 
            className={styles.navLink}
            style={{ 
              padding: '10px 16px',
              color: 'var(--status-5xx)', 
              borderColor: 'rgba(239, 68, 68, 0.1)',
              backgroundColor: 'rgba(239, 68, 68, 0.02)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s ease',
              marginBottom: '4px'
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>

          <div className={styles.statusIndicator}>
            <div className={styles.pulseDot}></div>
            <span>PulseEngine Active</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            v1.2.0 • Cloud Observability
          </div>
        </div>
      </aside>

      {/* 2. Top Glassmorphic Header */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>
          {menuItems.find((item) => item.path === pathname)?.name || 'Observability'}
        </h1>
        <div className={styles.headerActions}>
          <div className={styles.badge}>
            <Cpu size={12} className="glow-ai" />
            <span>Gemini AI: Enabled</span>
          </div>
        </div>
      </header>

      {/* 3. Main Content Container */}
      <main className={styles.contentWrapper}>
        <div className={styles.mainContainer}>
          {children}
        </div>
      </main>
    </div>
  );
}
