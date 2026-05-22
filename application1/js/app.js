document.addEventListener('DOMContentLoaded', () => {
  
  // ==================== APP STATE ====================
  const state = {
    currentTab: 'dashboard',
    waterLogged: 0,
    waterGoal: 2000,
    energyState: null,
    flowScore: 68, // base score, rises as user logs metrics
    moodStreak: 2,
    isBreathingActive: false,
    breathingTimer: null,
    breathingSeconds: 0,
    breathingPhase: 'inhale', // inhale, hold_high, exhale, hold_low
    breathingStartTimestamp: null
  };

  // ==================== INITIALIZE COMPONENTS ====================
  const liquidCanvas = new LiquidCanvas('liquid-canvas');
  const breathingCanvas = new BreathingCanvas('breathing-canvas');
  const audioSynth = new ZenAudioSynthesizer('visualizer-canvas');

  // Trigger initial liquid rendering frame
  liquidCanvas.setHydrationRatio(0.0);

  // Initialize standard flow ring progress
  updateFlowScore(state.flowScore);

  // ==================== NAVIGATION AND ROUTING ====================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const screens = document.querySelectorAll('.screen');

  function switchTab(tabId) {
    if (tabId === state.currentTab) return;
    
    // Deactivate current tab
    const currentBtn = document.querySelector(`.tab-btn[data-tab="${state.currentTab}"]`);
    const currentScreen = document.getElementById(`screen-${state.currentTab}`);
    
    if (currentBtn) currentBtn.classList.remove('active');
    if (currentScreen) {
      currentScreen.classList.remove('active');
    }
    
    // Stop active canvas animations when changing away to preserve CPU
    if (state.currentTab === 'breathing') {
      breathingCanvas.stop();
      if (state.isBreathingActive) {
        toggleBreathingSession();
      }
    }
    if (state.currentTab === 'dashboard') {
      liquidCanvas.stop();
    }
    
    // Activate new tab
    const newBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const newScreen = document.getElementById(`screen-${tabId}`);
    
    state.currentTab = tabId;
    
    if (newBtn) newBtn.classList.add('active');
    if (newScreen) {
      newScreen.classList.add('active');
    }
    
    // Start canvas animations depending on active tab
    if (tabId === 'breathing') {
      breathingCanvas.start();
    } else if (tabId === 'dashboard') {
      liquidCanvas.start();
      // slosh gently on load
      setTimeout(() => {
        liquidCanvas.splash(14, -20);
      }, 300);
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Start rendering dashboard liquid immediately
  liquidCanvas.start();

  // ==================== DASHBOARD STATE AND WIDGETS ====================

  // Flow Score calculation logic
  function updateFlowScore(score) {
    state.flowScore = Math.min(Math.max(score, 0), 100);
    
    // Update central ring display
    const ring = document.getElementById('flow-circle-progress');
    const display = document.getElementById('flow-value-display');
    
    if (ring && display) {
      display.textContent = `${state.flowScore}%`;
      // strokeDasharray of r=70 is 2 * PI * 70 = 439.8 (approx 440)
      const dashOffset = 440 - (440 * state.flowScore) / 100;
      ring.style.strokeDashoffset = dashOffset;
    }
  }

  // Mood/Energy Selector handler
  const moodButtons = document.querySelectorAll('.mood-btn');
  const streakValDisplay = document.getElementById('streak-display-value');

  moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mood = btn.getAttribute('data-mood');
      
      // If clicking same mood, toggle off
      if (state.energyState === mood) {
        btn.classList.remove('selected');
        state.energyState = null;
        updateFlowScore(state.flowScore - 8); // remove score weight
      } else {
        // Clear previous selected mood
        moodButtons.forEach(b => b.classList.remove('selected'));
        // Select new
        btn.classList.add('selected');
        state.energyState = mood;
        
        // Add one-time score bonus
        updateFlowScore(state.flowScore + 8);
        
        // Log positive psychological response triggers
        triggerStreakLog();
      }
    });
  });

  function triggerStreakLog() {
    state.moodStreak = 3;
    if (streakValDisplay) {
      streakValDisplay.textContent = `${state.moodStreak} Days`;
      streakValDisplay.parentElement.classList.add('premium-pulsing');
      setTimeout(() => {
        streakValDisplay.parentElement.classList.remove('premium-pulsing');
      }, 1000);
    }
  }

  // ==================== WATER TRACKER LOGIC ====================
  const btnAddWater = document.getElementById('btn-add-water');
  const btnWaterReset = document.getElementById('btn-water-reset');
  const textWaterLogged = document.getElementById('water-logged-text');

  function logWater(amount) {
    state.waterLogged = Math.min(state.waterLogged + amount, 3500); // hard cap at 3.5 Liters
    
    if (textWaterLogged) {
      textWaterLogged.textContent = `${state.waterLogged} / ${state.waterGoal} ml`;
    }
    
    // Update liquid level in physics canvas
    const ratio = state.waterLogged / state.waterGoal;
    liquidCanvas.setHydrationRatio(ratio);
    
    // Splash at random spring columns
    const randCol = Math.floor(Math.random() * 28);
    liquidCanvas.splash(randCol, -38);
    
    // Add minor flow score progress for logging metrics
    if (state.waterLogged <= state.waterGoal) {
      updateFlowScore(state.flowScore + 3);
    }
  }

  if (btnAddWater) {
    btnAddWater.addEventListener('click', () => logWater(250));
  }

  if (btnWaterReset) {
    btnWaterReset.addEventListener('click', () => {
      state.waterLogged = 0;
      if (textWaterLogged) {
        textWaterLogged.textContent = `0 / ${state.waterGoal} ml`;
      }
      liquidCanvas.setHydrationRatio(0.0);
      liquidCanvas.splash(14, -15);
      updateFlowScore(68); // reset flow score
    });
  }

  // ==================== AURA BREATHING SESSION TIMERS ====================
  const btnBreathingToggle = document.getElementById('btn-breathing-toggle');
  const textBreathPhase = document.getElementById('breathing-phase');
  const textBreathTimer = document.getElementById('breathing-timer');

  function toggleBreathingSession() {
    if (state.isBreathingActive) {
      // STOP SESSION
      state.isBreathingActive = false;
      btnBreathingToggle.textContent = 'Start Breathing Session';
      btnBreathingToggle.classList.remove('active');
      textBreathPhase.textContent = 'Ready';
      textBreathTimer.textContent = '0.0s';
      
      cancelAnimationFrame(state.breathingTimer);
      state.breathingTimer = null;
      
      // return aura back to resting low state
      breathingCanvas.updateBreathingAura('hold_low', 0);
      
    } else {
      // START SESSION
      state.isBreathingActive = true;
      btnBreathingToggle.textContent = 'End Breathing Session';
      btnBreathingToggle.style.background = 'linear-gradient(135deg, var(--accent-cyan) 0%, #0284c7 100%)';
      btnBreathingToggle.style.boxShadow = '0 4px 15px rgba(56, 189, 248, 0.3)';
      
      state.breathingStartTimestamp = Date.now();
      state.breathingPhase = 'inhale';
      textBreathPhase.textContent = 'Breathe In';
      
      // Start the core breathing timers
      runBreathingTick();
      
      // Boost dashboard flow score
      updateFlowScore(state.flowScore + 10);
    }
  }

  function runBreathingTick() {
    if (!state.isBreathingActive) return;
    
    const elapsed = (Date.now() - state.breathingStartTimestamp) / 1000;
    
    // Cycle structure (seconds):
    // 0.0 to 4.0: Inhale (4s)
    // 4.0 to 6.0: Hold High (2s)
    // 6.0 to 10.0: Exhale (4s)
    // 10.0 to 12.0: Hold Low (2s)
    
    const cycleTime = elapsed % 12.0;
    
    let phase = 'inhale';
    let phaseProgress = 0.0;
    let text = 'Breathe In';
    let color = 'var(--accent-purple)';
    
    if (cycleTime < 4.0) {
      phase = 'inhale';
      phaseProgress = cycleTime / 4.0; // 0 to 1
      text = 'Breathe In';
      color = 'var(--accent-purple)';
    } else if (cycleTime < 6.0) {
      phase = 'hold_high';
      phaseProgress = (cycleTime - 4.0) / 2.0;
      text = 'Hold';
      color = 'var(--accent-pink)';
    } else if (cycleTime < 10.0) {
      phase = 'exhale';
      phaseProgress = (cycleTime - 6.0) / 4.0;
      text = 'Breathe Out';
      color = 'var(--accent-cyan)';
    } else {
      phase = 'hold_low';
      phaseProgress = (cycleTime - 10.0) / 2.0;
      text = 'Rest';
      color = 'var(--text-secondary)';
    }
    
    // Update visual text displays
    if (textBreathPhase) {
      textBreathPhase.textContent = text;
      textBreathPhase.style.backgroundImage = `linear-gradient(135deg, ${color} 0%, #fff 100%)`;
    }
    if (textBreathTimer) {
      textBreathTimer.textContent = `${cycleTime.toFixed(1)}s`;
    }
    
    // Command the canvas system to render new boundaries
    breathingCanvas.updateBreathingAura(phase, phaseProgress);
    
    state.breathingTimer = requestAnimationFrame(runBreathingTick);
  }

  if (btnBreathingToggle) {
    btnBreathingToggle.addEventListener('click', toggleBreathingSession);
  }

  // ==================== ZEN SOUNDSCAPES CONTROLLER ====================
  const soundTracks = document.querySelectorAll('.sound-track');
  const visualizerSub = document.getElementById('visualizer-subtitle');

  soundTracks.forEach(track => {
    const trackName = track.getAttribute('data-track');
    const volumeSlider = track.nextElementSibling.querySelector('.volume-slider');
    
    // Track click triggers toggle
    track.addEventListener('click', (e) => {
      // Don't trigger if clicked directly on slider container
      if (e.target.closest('.track-volume-slider')) return;
      
      const isActive = audioSynth.toggleTrack(trackName);
      
      // Update UI active indicators
      if (isActive) {
        track.classList.add('active');
        // change play icon to pause
        track.querySelector('.play-state-indicator').innerHTML = `
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1"></rect>
            <rect x="14" y="4" width="4" height="16" rx="1"></rect>
          </svg>
        `;
        
        // update top visualizer text
        if (visualizerSub) {
          visualizerSub.textContent = `Playing: ${track.querySelector('.track-info h5').textContent}`;
        }
        
      } else {
        track.classList.remove('active');
        track.querySelector('.play-state-indicator').innerHTML = `
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        `;
        
        // check if any track is still active
        const anyActive = document.querySelector('.sound-track.active');
        if (!anyActive && visualizerSub) {
          visualizerSub.textContent = 'Ambient synthesizer silent';
        }
      }
    });

    // Volume slider adjust listeners
    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        audioSynth.setVolume(trackName, value);
      });
    }
  });

});
