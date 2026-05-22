class ZenAudioSynthesizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
    }
    
    this.audioCtx = null;
    this.masterGain = null;
    this.analyser = null;
    this.activeTracks = {}; // stores active synthesis nodes
    this.isAnimating = false;
    
    // Track states
    this.trackVolumes = {
      pad: 0.8,
      drone: 0.8,
      rain: 0.8
    };
    
    this.initVisualizer();
  }

  // Visualizer initialization
  initVisualizer() {
    this.resizeVisualizer();
    window.addEventListener('resize', () => this.resizeVisualizer());
    
    // Start drawing resting visualizer wave immediately
    this.isAnimating = true;
    this.tickVisualizer();
  }

  resizeVisualizer() {
    if (!this.canvas) return;
    const rect = this.canvas.parentNode.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    
    this.width = rect.width;
    this.height = rect.height;
  }

  // Audio Context lazy initializer
  initAudio() {
    if (this.audioCtx) return;
    
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    
    // Master Gain
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.audioCtx.currentTime);
    
    // Analyser Node for dynamic waveform visualizations
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 512;
    
    // Routing: Synth -> Track Gains -> Master Gain -> Analyser -> Audio Destination
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
  }

  toggleTrack(trackName) {
    this.initAudio();
    
    // Resume context if suspended by browser security policy
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    if (this.activeTracks[trackName]) {
      this.stopTrack(trackName);
      return false; // stopped
    } else {
      this.startTrack(trackName);
      return true; // started
    }
  }

  setVolume(trackName, value) {
    this.trackVolumes[trackName] = value / 100;
    
    // Dynamically adjust active gains
    if (this.activeTracks[trackName]) {
      const gainNode = this.activeTracks[trackName].gainNode;
      if (gainNode) {
        gainNode.gain.linearRampToValueAtTime(
          this.trackVolumes[trackName] * 0.45, 
          this.audioCtx.currentTime + 0.1
        );
      }
    }
  }

  // ==================== TRACK SYNTHESIZERS ====================

  startTrack(trackName) {
    this.stopTrack(trackName); // clean up any old nodes
    
    const trackData = {
      oscillators: [],
      noiseNodes: [],
      gainNode: this.audioCtx.createGain()
    };
    
    trackData.gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
    trackData.gainNode.connect(this.masterGain);
    
    const now = this.audioCtx.currentTime;

    if (trackName === 'pad') {
      // BINAURAL ZEN PAD
      // F# minor carrier frequencies (100Hz / 106.18Hz)
      const carrier1 = this.audioCtx.createOscillator();
      carrier1.type = 'sine';
      carrier1.frequency.setValueAtTime(98.0, now); // G#1 fundamental

      const carrier2 = this.audioCtx.createOscillator();
      carrier2.type = 'sine';
      carrier2.frequency.setValueAtTime(104.18, now); // Calming 6.18Hz Delta Beat

      // Modulating sweeps (creates rich chorus/swell effects)
      const lfo = this.audioCtx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.06, now); // Sweeps every 16 seconds
      
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(1.5, now);
      
      // Warm low-pass filter
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);
      filter.Q.setValueAtTime(2.0, now);

      // Route
      lfo.connect(lfoGain);
      lfoGain.connect(carrier1.frequency);
      
      carrier1.connect(filter);
      carrier2.connect(filter);
      filter.connect(trackData.gainNode);

      // Start
      lfo.start(now);
      carrier1.start(now);
      carrier2.start(now);
      
      // Store references to shut down later
      trackData.oscillators.push(lfo, carrier1, carrier2);
      
    } else if (trackName === 'drone') {
      // RESONANT COSMIC DRONE
      // Trio of waves for rich analog feel (Fundamental, perfect fifth, octave)
      const osc1 = this.audioCtx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(73.42, now); // D2 note

      const osc2 = this.audioCtx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(110.0, now); // perfect fifth fifth (A2)

      const osc3 = this.audioCtx.createOscillator();
      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(146.83, now); // octave upper (D3)
      
      const osc3Gain = this.audioCtx.createGain();
      osc3Gain.gain.setValueAtTime(0.08, now); // keep sawtooth very low & clean

      // Sweep filter
      const sweepFilter = this.audioCtx.createBiquadFilter();
      sweepFilter.type = 'bandpass';
      sweepFilter.frequency.setValueAtTime(300, now);
      sweepFilter.Q.setValueAtTime(4.5, now);

      // Feedback Delay Loop for spatial soundscape reverb
      const delay = this.audioCtx.createDelay(1.0);
      delay.delayTime.setValueAtTime(0.4, now);
      
      const delayFeedback = this.audioCtx.createGain();
      delayFeedback.gain.setValueAtTime(0.35, now); // 35% echo persistence

      // Modulating sweeps filter
      const filterLFO = this.audioCtx.createOscillator();
      filterLFO.type = 'sine';
      filterLFO.frequency.setValueAtTime(0.09, now); // oscillates every 11 seconds
      
      const filterLFOGain = this.audioCtx.createGain();
      filterLFOGain.gain.setValueAtTime(180, now); // sweeps frequency range +/- 180hz

      // Route
      filterLFO.connect(filterLFOGain);
      filterLFOGain.connect(sweepFilter.frequency);

      osc1.connect(sweepFilter);
      osc2.connect(sweepFilter);
      osc3.connect(osc3Gain);
      osc3Gain.connect(sweepFilter);

      // Delay feedback route
      sweepFilter.connect(trackData.gainNode);
      sweepFilter.connect(delay);
      delay.connect(delayFeedback);
      delayFeedback.connect(delay); // feedback loop
      delayFeedback.connect(trackData.gainNode); // feed into output

      // Start
      filterLFO.start(now);
      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      trackData.oscillators.push(filterLFO, osc1, osc2, osc3);

    } else if (trackName === 'rain') {
      // FILTERED SYNTHESIZED RAIN
      // 1. Programmatic White Noise buffer creation
      const bufferSize = 2 * this.audioCtx.sampleRate;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      
      const noiseSource = this.audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Dynamic Bandpass filter to model rainfall pitch
      const rainFilter = this.audioCtx.createBiquadFilter();
      rainFilter.type = 'bandpass';
      rainFilter.frequency.setValueAtTime(1100, now);
      rainFilter.Q.setValueAtTime(0.6, now);

      // Wind modulation (Low frequency swell simulating gusts)
      const windLFO = this.audioCtx.createOscillator();
      windLFO.type = 'sine';
      windLFO.frequency.setValueAtTime(0.04, now); // 25s wind cycle
      
      const windGain = this.audioCtx.createGain();
      windGain.gain.setValueAtTime(400, now); // swept frequency displacement

      // Route
      windLFO.connect(windGain);
      windGain.connect(rainFilter.frequency);

      noiseSource.connect(rainFilter);
      rainFilter.connect(trackData.gainNode);

      // Start
      windLFO.start(now);
      noiseSource.start(now);

      trackData.oscillators.push(windLFO);
      trackData.noiseNodes.push(noiseSource);
    }

    // Fade-in to avoid annoying loud sound pops
    trackData.gainNode.gain.linearRampToValueAtTime(
      this.trackVolumes[trackName] * 0.45, 
      this.audioCtx.currentTime + 1.8 // soft fade-in over 1.8 seconds
    );
    
    this.activeTracks[trackName] = trackData;
  }

  stopTrack(trackName) {
    const trackData = this.activeTracks[trackName];
    if (!trackData) return;
    
    const now = this.audioCtx.currentTime;
    
    // Fade-out sound to zero
    trackData.gainNode.gain.cancelScheduledValues(now);
    trackData.gainNode.gain.setValueAtTime(trackData.gainNode.gain.value, now);
    trackData.gainNode.gain.linearRampToValueAtTime(0.001, now + 1.2); // fade-out over 1.2s
    
    // Stop all oscillators and buffers after fade out complete
    setTimeout(() => {
      trackData.oscillators.forEach(osc => {
        try { osc.stop(); } catch(e) {}
      });
      trackData.noiseNodes.forEach(src => {
        try { src.stop(); } catch(e) {}
      });
      trackData.gainNode.disconnect();
    }, 1300);
    
    delete this.activeTracks[trackName];
  }

  stopAll() {
    Object.keys(this.activeTracks).forEach(trackName => {
      this.stopTrack(trackName);
    });
  }

  // ==================== VISUALIZER RENDERING ENGINE ====================

  tickVisualizer() {
    if (!this.isAnimating) return;
    this.drawVisualizer();
    requestAnimationFrame(() => this.tickVisualizer());
  }

  drawVisualizer() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Check if sound is active
    const isActive = this.analyser && Object.keys(this.activeTracks).length > 0;
    
    // Grab data from analyzer
    let dataArray = new Uint8Array(256);
    if (isActive) {
      this.analyser.getByteTimeDomainData(dataArray);
    } else {
      // Synthesize default resting sine data (silence)
      for (let i = 0; i < 256; i++) {
        dataArray[i] = 128 + Math.sin(Date.now() * 0.0035 + i * 0.08) * 8.0;
      }
    }
    
    // Render 3 premium layers of overlapping organic Bezier waveforms
    
    // LAYER 3: Deep background shadow wave
    this.drawBezierWave(dataArray, 'rgba(192, 132, 252, 0.12)', 2.0, 15, 0.95);
    
    // LAYER 2: Middle Cyan visualizer wave
    this.drawBezierWave(dataArray, 'rgba(56, 189, 248, 0.22)', 1.2, -8, 1.05);
    
    // LAYER 1: Core Foreground highlight glowing line
    const glowGrad = this.ctx.createLinearGradient(0, 0, rect.width, 0);
    glowGrad.addColorStop(0, 'rgba(192, 132, 252, 0.85)'); // Purple
    glowGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.9)'); // Cyan
    glowGrad.addColorStop(1, 'rgba(244, 114, 182, 0.85)'); // Pink
    
    this.drawBezierWave(dataArray, glowGrad, 2.5, 0, 1.0);
  }

  drawBezierWave(dataArray, strokeStyle, lineWidth, heightOffset, scaleFactor) {
    const sliceWidth = this.width / (dataArray.length - 1);
    const centerY = this.height / 2 + heightOffset;
    
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    
    // Smooth drawing using quadratic/bezier controls
    let x = 0;
    const firstVal = (dataArray[0] - 128) / 128; // value bounds: [-1.0, 1.0]
    let y = centerY + firstVal * 38 * scaleFactor;
    
    this.ctx.moveTo(x, y);
    
    for (let i = 1; i < dataArray.length; i += 4) {
      x = i * sliceWidth;
      const val = (dataArray[i] - 128) / 128;
      y = centerY + val * 38 * scaleFactor;
      
      const nextX = (i + 4) * sliceWidth;
      const nextIdx = Math.min(i + 4, dataArray.length - 1);
      const nextVal = (dataArray[nextIdx] - 128) / 128;
      const nextY = centerY + nextVal * 38 * scaleFactor;
      
      // Control point in middle of nodes
      const cpX = (x + nextX) / 2;
      const cpY = (y + nextY) / 2;
      
      this.ctx.quadraticCurveTo(x, y, cpX, cpY);
    }
    
    this.ctx.stroke();
  }
}

// Export class globally
window.ZenAudioSynthesizer = ZenAudioSynthesizer;
