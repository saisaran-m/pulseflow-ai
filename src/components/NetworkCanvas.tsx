// src/components/NetworkCanvas.tsx
'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const particleCount = 70; // Optimized capped count for premium rendering without CPU spikes
    const connectionDistance = 110;
    const mouseConnectionDistance = 160;

    // Resize canvas to match screen size (with high-DPI scaling)
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);

      // Re-initialize particles relative to screen size
      initParticles();
    };

    // Initialize particles
    const initParticles = () => {
      particles = [];
      const width = window.innerWidth;
      const height = window.innerHeight;

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35, // Drifts slowly for elegant motion
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 1.5 + 1 // Elegant small glowing nodes
        });
      }
    };

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    // Draw frame
    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const width = window.innerWidth;
      const height = window.innerHeight;
      const mouse = mouseRef.current;

      // Update and draw particles
      particles.forEach((p) => {
        // Drift position
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off canvas boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Gentle gravity pull towards mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 300) {
            // Apply slight acceleration towards mouse
            p.x += (dx / dist) * 0.05;
            p.y += (dy / dist) * 0.05;
          }
        }

        // Render particle dot with glowing center
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.4)'; // Cyber AI Purple
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      // Draw connection lines (plexus constellations)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.12; // Translucent lines
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Subtle color blend between Electric Indigo and Purple
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`; 
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Draw connection lines to mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouseConnectionDistance) {
            const alpha = (1 - dist / mouseConnectionDistance) * 0.25; // Brighter mouse links
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`; // AI Purple mouse threads
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // Attach listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Initial setup
    resizeCanvas();
    draw();

    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0, // Behind main contents but above deep background main color
        pointerEvents: 'none',
        opacity: 0.85,
        transition: 'opacity 1s ease-in-out'
      }}
    />
  );
}
