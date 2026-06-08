import { settings } from './settings.js';

let audioCtx;
let audioUnlocked = false;

export function playSound(type) {
  if (!settings.sound) return;
  
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();

  const theme = settings.audioTheme || "minimal";

  if (theme === "minimal") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "pop") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === "tic") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } else if (type === "win") {
      osc.type = "square";
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.1);
      osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    }
  } else if (theme === "retro") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "pop") {
      // Short high pitch bend (NES Jump)
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(250, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(1000, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } else if (type === "tic") {
      // Crisp 8-bit blip (Coin pre-sound)
      osc.type = "square";
      osc.frequency.setValueAtTime(1100, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } else if (type === "win") {
      // Classic Mario-style arpeggio (C5 -> E5 -> G5 -> C6)
      osc.type = "square";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.24); // C6
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.455);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    }
  } else if (theme === "scifi") {
    if (type === "pop") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      // Sci-Fi laser drop
      osc.type = "sine";
      osc.frequency.setValueAtTime(2200, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.6, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.14);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.14);
    } else if (type === "tic") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      // Tiny metallic click
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.02);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.02);
    } else if (type === "win") {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      // Cyber modulated sweep (riser with vibrato)
      const lfo = audioCtx.createOscillator();
      const lfoGain = audioCtx.createGain();
      lfo.frequency.value = 16; // 16 Hz vibrato
      lfoGain.gain.value = 45;  // frequency modulation depth
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      osc.type = "sine";
      osc.frequency.setValueAtTime(250, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, audioCtx.currentTime + 0.55);

      gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.55);

      lfo.start();
      osc.start();
      
      lfo.stop(audioCtx.currentTime + 0.55);
      osc.stop(audioCtx.currentTime + 0.55);
    }
  }
}

export function triggerVibration(pattern) {
  if (!settings.vibration) return;
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

export function unlockAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();

  if (!audioUnlocked) {
    const dummyOsc = audioCtx.createOscillator();
    const dummyGain = audioCtx.createGain();
    dummyGain.gain.value = 0;
    dummyOsc.connect(dummyGain);
    dummyGain.connect(audioCtx.destination);
    dummyOsc.start();
    dummyOsc.stop(audioCtx.currentTime + 0.001);
    audioUnlocked = true;
  }
}
