// src/components/GlowCard.tsx
'use client';

import React, { useRef } from 'react';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function GlowCard({ children, className = '', style = {}, onClick }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x coordinate relative to card
    const y = e.clientY - rect.top;  // y coordinate relative to card

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`glow-card-wrapper ${className}`}
      style={style}
    >
      {/* Outer borders and glowing spotlights */}
      <div className="glow-card-glow-bg" />
      <div className="glow-card-glow-border" />
      
      {/* Inner Content wrapper */}
      <div className="glow-card-content">
        {children}
      </div>
    </div>
  );
}
