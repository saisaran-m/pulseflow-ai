// src/app/login/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Terminal, AlertCircle, ArrowLeft, Cpu } from 'lucide-react';
import styles from '@/styles/Login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // If already logged in, skip login page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = sessionStorage.getItem('pulseflow_session');
      if (session === 'authorized' || session === 'demo_authorized') {
        router.push('/dashboard');
      }
    }
  }, [router]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simple demo validation rules (admin@pulseflow.ai / admin)
    setTimeout(() => {
      if (email.trim().toLowerCase() === 'admin@pulseflow.ai' && password === 'admin') {
        sessionStorage.setItem('pulseflow_session', 'authorized');
        router.push('/dashboard');
      } else {
        setError('Invalid SRE console credentials. Try admin@pulseflow.ai / admin');
        setLoading(false);
      }
    }, 1200);
  };

  const handleDemoAccess = () => {
    setError(null);
    setIsDemoLoading(true);
    
    // Smooth bypass delay for highly premium transition state
    setTimeout(() => {
      sessionStorage.setItem('pulseflow_session', 'demo_authorized');
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <div 
        ref={cardRef} 
        onMouseMove={handleMouseMove} 
        className={styles.loginCard}
      >
        {/* Card Header Brand */}
        <div className={styles.header}>
          <div className={styles.logoGlow}>
            <Terminal size={22} />
          </div>
          <h1 className={styles.title}>Console Portal</h1>
          <p className={styles.subtitle}>Enter your SRE operator credentials to access PulseFlow AI</p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleLoginSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Operator Email</label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input 
                id="email"
                type="email"
                required
                placeholder="operator@pulseflow.ai"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Secure Code</label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input 
                id="password"
                type="password"
                required
                placeholder="••••••••"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Validation Error Banner */}
          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Core Submission */}
          <button 
            type="submit" 
            disabled={loading || isDemoLoading} 
            className={styles.primaryBtn}
          >
            {loading ? (
              <span>Connecting Operator...</span>
            ) : (
              <>
                <span>Access SRE Console</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span>Demo Evaluation</span>
          <div className={styles.dividerLine} />
        </div>

        {/* Quick Demo Access Bypass Button */}
        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={loading || isDemoLoading}
          className={styles.demoBtn}
        >
          {isDemoLoading ? (
            <span>Authorizing Demo Node...</span>
          ) : (
            <>
              <Cpu size={16} className="glow-ai" />
              <span>Demo Quick Access</span>
            </>
          )}
        </button>

        {/* Return link */}
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={14} />
          <span>Back to Landing Page</span>
        </Link>
      </div>
    </div>
  );
}
