class LiquidCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Wave Spring Physics Parameters
    this.springs = [];
    this.springCount = 28;
    this.tension = 0.025;     // stiffness
    this.dampening = 0.05;    // friction of waves
    this.spread = 0.16;       // how fast wave propagates
    
    this.bubbles = [];
    this.maxBubbles = 15;
    
    this.fillRatio = 0.0;     // current logged ratio (0.0 to 1.0)
    this.targetFillRatio = 0.0;
    this.liquidY = 0;         // current pixel Y height of fluid
    
    this.isAnimating = false;
    
    this.init();
    this.setupListeners();
  }

  init() {
    this.resize();
    
    // Create initial column springs representing sections of the liquid surface
    this.springs = [];
    for (let i = 0; i < this.springCount; i++) {
      this.springs.push({
        y: this.targetY,       // current height of this node
        targetY: this.targetY, // neutral height
        velocity: 0
      });
    }
  }

  resize() {
    const rect = this.canvas.parentNode.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    
    this.width = rect.width;
    this.height = rect.height;
    
    this.updateLiquidLevel();
  }

  updateLiquidLevel() {
    // The visual top surface Y level (0 is top, height is bottom of canvas)
    // Keep a minimum level even when 0ml is logged so user sees liquid
    const minVisualHeight = this.height * 0.85;
    const maxVisualHeight = this.height * 0.15;
    
    this.liquidY = minVisualHeight - (this.fillRatio * (minVisualHeight - maxVisualHeight));
    
    // Reset neutral target of springs
    this.springs.forEach(s => {
      s.targetY = this.liquidY;
      // If spring is resting, move it directly
      if (!this.isAnimating) {
        s.y = this.liquidY;
      }
    });
  }

  setupListeners() {
    // Tap on the canvas to splash/slosh the water
    const handleTap = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      
      // Calculate which spring index was tapped
      const colWidth = this.width / (this.springCount - 1);
      const index = Math.min(
        Math.max(Math.floor(x / colWidth), 0),
        this.springCount - 1
      );
      
      // Inject force (downwards displacement)
      this.splash(index, 35);
    };

    this.canvas.addEventListener('mousedown', handleTap);
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.cancelable) e.preventDefault();
      handleTap(e);
    }, { passive: false });
    
    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });
  }

  splash(index, force) {
    if (index >= 0 && index < this.springCount) {
      this.springs[index].velocity = force;
      this.start();
    }
  }

  setHydrationRatio(ratio) {
    this.targetFillRatio = Math.min(Math.max(ratio, 0), 1.0);
    this.start();
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
    
    // Check if springs and level are fully at rest to conserve battery
    const stillSloshing = this.springs.some(s => Math.abs(s.velocity) > 0.05 || Math.abs(s.y - s.targetY) > 0.05);
    const filling = Math.abs(this.fillRatio - this.targetFillRatio) > 0.001;
    
    if (stillSloshing || filling || this.bubbles.length > 0) {
      requestAnimationFrame(() => this.tick());
    } else {
      this.stop();
    }
  }

  update() {
    // Easing the overall fluid level height
    if (Math.abs(this.fillRatio - this.targetFillRatio) > 0.001) {
      this.fillRatio += (this.targetFillRatio - this.fillRatio) * 0.06;
      this.updateLiquidLevel();
    }
    
    // Update individual column spring equations
    for (let i = 0; i < this.springCount; i++) {
      const s = this.springs[i];
      const displacement = s.targetY - s.y;
      
      // acceleration = tension * displacement - dampening * velocity
      const accel = this.tension * displacement - this.dampening * s.velocity;
      s.y += s.velocity;
      s.velocity += accel;
    }
    
    // Propagate wave energy left and right to neighboring springs
    const leftDeltas = new Array(this.springCount).fill(0);
    const rightDeltas = new Array(this.springCount).fill(0);
    
    // 8 passes of wave dispersion for high-fidelity fluid sloshing
    for (let pass = 0; pass < 8; pass++) {
      for (let i = 0; i < this.springCount; i++) {
        if (i > 0) {
          leftDeltas[i] = this.spread * (this.springs[i].y - this.springs[i - 1].y);
          this.springs[i - 1].velocity += leftDeltas[i];
        }
        if (i < this.springCount - 1) {
          rightDeltas[i] = this.spread * (this.springs[i].y - this.springs[i + 1].y);
          this.springs[i + 1].velocity += rightDeltas[i];
        }
      }
      
      for (let i = 0; i < this.springCount; i++) {
        if (i > 0) this.springs[i - 1].y += leftDeltas[i];
        if (i < this.springCount - 1) this.springs[i + 1].y += rightDeltas[i];
      }
    }
    
    // Update Bubbles physics
    if (this.bubbles.length < this.maxBubbles && Math.random() < 0.1 && this.targetFillRatio > 0.05) {
      this.spawnBubble();
    }
    
    this.bubbles.forEach((b, idx) => {
      // Float up
      b.y -= b.speed;
      // Sway side-to-side
      b.x += Math.sin(b.wobbleFactor + b.y * 0.05) * 0.35;
      
      // Determine height of the water surface at this bubble's X position
      const progress = b.x / this.width;
      const colWidth = this.width / (this.springCount - 1);
      const colIdx = Math.min(Math.max(Math.floor(b.x / colWidth), 0), this.springCount - 2);
      const t = (b.x % colWidth) / colWidth;
      const waterSurfaceY = this.springs[colIdx].y * (1 - t) + this.springs[colIdx + 1].y * t;
      
      // Pop bubble when it hits or breaches the water surface
      if (b.y <= waterSurfaceY) {
        // Trigger a tiny splash disturbance
        if (Math.random() < 0.3) {
          this.springs[colIdx].velocity -= 0.5;
        }
        this.bubbles.splice(idx, 1);
      }
    });
  }

  spawnBubble() {
    this.bubbles.push({
      x: Math.random() * this.width,
      y: this.height + 10,
      radius: 1 + Math.random() * 3,
      speed: 0.5 + Math.random() * 1.0,
      wobbleFactor: Math.random() * 100
    });
  }

  draw() {
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
    
    if (this.springs.length === 0) return;
    
    // Create dual-tone fluid layering for a premium, heavy 3D glass look
    
    // LAYER 2: Back Wave (slightly darker and offset, provides volume depth)
    this.ctx.fillStyle = 'rgba(3, 105, 161, 0.25)'; // Dark Cyan
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    
    const colWidth = this.width / (this.springCount - 1);
    this.ctx.lineTo(0, this.springs[0].y + Math.sin(Date.now() * 0.003) * 2.5);
    
    for (let i = 1; i < this.springCount; i++) {
      // Offset wave slightly
      const waveOffsetY = Math.sin(Date.now() * 0.002 + i * 0.5) * 1.5;
      this.ctx.lineTo(i * colWidth, this.springs[i].y + waveOffsetY);
    }
    this.ctx.lineTo(this.width, this.height);
    this.ctx.closePath();
    this.ctx.fill();
    
    // LAYER 1: Front Fluid Body (with glowing gradient)
    const fluidGrad = this.ctx.createLinearGradient(0, this.liquidY - 20, 0, this.height);
    fluidGrad.addColorStop(0, 'rgba(56, 189, 248, 0.7)');  // Neon cyan top glow
    fluidGrad.addColorStop(0.2, 'rgba(14, 116, 144, 0.65)'); // Deep teal
    fluidGrad.addColorStop(1, 'rgba(8, 7, 24, 0.85)');      // Dark space floor
    
    this.ctx.fillStyle = fluidGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.height);
    this.ctx.lineTo(0, this.springs[0].y);
    
    for (let i = 1; i < this.springCount; i++) {
      this.ctx.lineTo(i * colWidth, this.springs[i].y);
    }
    this.ctx.lineTo(this.width, this.height);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Draw the bright highlights right on the crest of the top wave
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.springs[0].y);
    for (let i = 1; i < this.springCount; i++) {
      this.ctx.lineTo(i * colWidth, this.springs[i].y);
    }
    this.ctx.stroke();
    
    // Render buoyancy bubbles
    this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    this.ctx.lineWidth = 0.8;
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    
    this.bubbles.forEach(b => {
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Bubble shine highlight
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.beginPath();
      this.ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.25, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
}

// Export class globally
window.LiquidCanvas = LiquidCanvas;
