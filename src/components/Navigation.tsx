// src/components/Navigation.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ListFilter, PlayCircle, Bell, Terminal, Cpu } from 'lucide-react';
import styles from '@/styles/Navigation.module.css';

interface NavigationProps {
  children: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: Activity },
    { name: 'Request Tracer', path: '/logs', icon: ListFilter },
    { name: 'Traffic Sandbox', path: '/sandbox', icon: PlayCircle },
    { name: 'Alert Center', path: '/alerts', icon: Bell }
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* 1. Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logoGlow}>
            <Terminal size={18} />
          </div>
          <span className={styles.brandName}>PulseFlow AI</span>
        </div>

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
          <div className={styles.statusIndicator}>
            <div className={styles.pulseDot}></div>
            <span>PulseEngine Active</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            v1.2.0 • SQLite Dev DB
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
