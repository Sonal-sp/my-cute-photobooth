// 🎵 Cute UI sounds using Web Audio API (no audio files needed)
let muted = false;
let ctx = null;

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function beep(freq, duration, type = 'sine', volume = 0.15, delay = 0) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const start = c.currentTime + delay;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export const sounds = {
  click: () => beep(660, 0.09, 'triangle', 0.1),
  shutter: () => {
    beep(220, 0.08, 'square', 0.08);
    beep(180, 0.12, 'square', 0.08, 0.06);
  },
  sticker: () => {
    beep(880, 0.09, 'sine', 0.1);
    beep(1320, 0.12, 'sine', 0.08, 0.08);
  },
  print: () => {
    beep(300, 0.1, 'sawtooth', 0.05);
    beep(420, 0.08, 'sawtooth', 0.05, 0.12);
    beep(560, 0.15, 'triangle', 0.08, 0.24);
  },
  success: () => {
    beep(523, 0.12, 'sine', 0.12);
    beep(659, 0.12, 'sine', 0.12, 0.12);
    beep(784, 0.2, 'sine', 0.12, 0.24);
  },
  countdown: () => beep(440, 0.1, 'sine', 0.12),
};

