class BreathingCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.particles = [];
    this.particleCount = 220;
    this.center = { x: 0, y: 0 };
    
    // Core parameters for orbital and breathing guidance
    this.baseRadius = 60;
    this.currentRadius = 60;
    this.targetRadius = 60;
    this.breathingState = 'hold'; // inhale, hold_high, exhale, hold_low
    this.breathCycleTime = 0; // ms
    this.isAnimating = false;
    
    // Interactive mouse / touch state
    this.mouse = { x: null, y: null, active: false };
    this.repelRadius = 75;
    this.repelForceMultiplier = 0.08;
    
    this.init();
    this.setupListeners();
  }

  init() {
    this.resize();
    this.generateParticles();
  }

  resize() {
    const rect = this.canvas.parentNode.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    
    this.center.x = rect.width / 2;
    this.center.y = rect.height / 2;
  }

  generateParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      // Particles orbit in layers
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.005 + Math.random() * 0.012;
      const orbitOffset = (Math.random() - 0.5) * 22; // spread around target orbit
      const size = 1.2 + Math.random() * 2.2;
      
      // Color gradient selection: purple, pink, cyan
      let color;
      const rng = Math.random();
      if (rng < 0.45) {
        color = 'rgba(192, 132, 252, ' + (0.35 + Math.random() * 0.45) + ')'; // Purple
      } else if (rng < 0.8) {
        color = 'rgba(56, 189, 248, ' + (0.35 + Math.random() * 0.45) + ')'; // Cyan
      } else {
        color = 'rgba(244, 114, 182, ' + (0.4 + Math.random() * 0.4) + ')'; // Pink
      }
      
      this.particles.push({
        angle: angle,
        angularSpeed: speed,
        orbitOffset: orbitOffset,
        size: size,
        color: color,
        // Current actual position
        x: this.center.x,
        y: this.center.y,
        // Target orbital position
        targetX: this.center.x,
        targetY: this.center.y,
        // Velocity offsets for physics reactions
        vx: 0,
        vy: 0,
        friction: 0.94,
        easeSpeed: 0.08 + Math.random() * 0.05
      });
    }
  }

  setupListeners() {
    // Canvas interaction listeners (Mouse & Touch)
    const getCoords = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const handleStart = (e) => {
      this.mouse.active = true;
      const coords = getCoords(e);
      this.mouse.x = coords.x;
      this.mouse.y = coords.y;
    };

    const handleMove = (e) => {
      if (!this.mouse.active) return;
      const coords = getCoords(e);
      this.mouse.x = coords.x;
      this.mouse.y = coords.y;
    };

    const handleEnd = () => {
      this.mouse.active = false;
      this.mouse.x = null;
      this.mouse.y = null;
    };

    this.canvas.addEventListener('mousedown', handleStart);
    this.canvas.addEventListener('mousemove', handleMove);
    this.canvas.addEventListener('mouseup', handleEnd);
    this.canvas.addEventListener('mouseleave', handleEnd);

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.cancelable) e.preventDefault();
      handleStart(e);
    }, { passive: false });
    this.canvas.addEventListener('touchmove', (e) => {
      if (e.cancelable) e.preventDefault();
      handleMove(e);
    }, { passive: false });
    this.canvas.addEventListener('touchend', handleEnd);
    
    window.addEventListener('resize', () => this.resize());
  }

  updateBreathingAura(phase, value) {
    // Adjust target radius dynamically according to the cycle state
    this.breathingState = phase;
    
    if (phase === 'inhale') {
      // Smooth interpolation from 50px to 105px
      this.targetRadius = 50 + (value * 55); 
    } else if (phase === 'hold_high') {
      // Maintain peak width with a gentle sinusoidal vibration
      this.targetRadius = 105 + Math.sin(Date.now() * 0.005) * 2.5;
    } else if (phase === 'exhale') {
      // Interpolate down
      this.targetRadius = 105 - (value * 55);
    } else if (phase === 'hold_low') {
      // Maintain minimum with slow breathing float
      this.targetRadius = 50 + Math.sin(Date.now() * 0.002) * 1.5;
    }
  }

  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.tick();
  }

  stop() {
    this.isAnimating = false;
  }

  tick() {
    if (!this.isAnimating) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.tick());
  }

  update() {
    // Easing the current orbit radius toward target
    this.currentRadius += (this.targetRadius - this.currentRadius) * 0.08;
    
    this.particles.forEach(p => {
      // Advance the orbit angle
      p.angle += p.angularSpeed;
      
      // Calculate normal orbital coordinate
      const orbitR = this.currentRadius + p.orbitOffset;
      const idealX = this.center.x + Math.cos(p.angle) * orbitR;
      const idealY = this.center.y + Math.sin(p.angle) * orbitR;
      
      // Interaction physics: repulsion from pointer
      if (this.mouse.active && this.mouse.x !== null) {
        // Calculate distance to current particle position
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.repelRadius) {
          // Calculate force vector
          const force = (this.repelRadius - dist) / this.repelRadius;
          const angle = Math.atan2(dy, dx);
          
          // Add repulsive velocity
          p.vx += Math.cos(angle) * force * this.repelForceMultiplier * 60;
          p.vy += Math.sin(angle) * force * this.repelForceMultiplier * 60;
        }
      }
      
      // Apply friction to physics offsets
      p.vx *= p.friction;
      p.vy *= p.friction;
      
      // Interpolate towards orbital trajectory, adding physics velocities
      p.x += (idealX - p.x) * p.easeSpeed + p.vx;
      p.y += (idealY - p.y) * p.easeSpeed + p.vy;
    });
  }

  draw() {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw background atmospheric soft glow inside the coaching ring
    const auraGlow = this.ctx.createRadialGradient(
      this.center.x, this.center.y, 10,
      this.center.x, this.center.y, this.currentRadius * 1.3
    );
    
    let glowColor;
    if (this.breathingState === 'inhale' || this.breathingState === 'hold_high') {
      glowColor = 'rgba(168, 85, 247, 0.08)'; // Purple atmospheric
    } else {
      glowColor = 'rgba(56, 189, 248, 0.06)'; // Calm cyan
    }
    
    auraGlow.addColorStop(0, glowColor);
    auraGlow.addColorStop(0.5, 'rgba(16, 14, 31, 0.0)');
    auraGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    this.ctx.fillStyle = auraGlow;
    this.ctx.beginPath();
    this.ctx.arc(this.center.x, this.center.y, this.currentRadius * 1.5, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw connection webbing lines for neighboring particles (creates premium galaxy look)
    this.ctx.lineWidth = 0.45;
    for (let i = 0; i < this.particles.length; i += 4) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < i + 6; j++) {
        if (j >= this.particles.length) break;
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 42) {
          const alpha = (42 - dist) / 42 * 0.12;
          this.ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
    
    // Render the individual particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      
      // Give a slight directional stretching if particle is moving fast
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 1.2) {
        const stretch = Math.min(speed * 0.25, 3.5);
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      } else {
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      }
      
      this.ctx.fill();
    });
  }
}

// Export class globally
window.BreathingCanvas = BreathingCanvas;
