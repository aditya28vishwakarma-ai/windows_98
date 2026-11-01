// sound.ts — Pure Web Audio API synthesized Windows 98 sound effects (zero external files)
let audioCtx: AudioContext | null = null;
let soundEnabled = true;
let masterVolume = 0.7;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  try {
    localStorage.setItem("w98:sound_enabled", enabled ? "1" : "0");
  } catch {}
}

export function isSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem("w98:sound_enabled");
    if (val !== null) return val === "1";
  } catch {}
  return soundEnabled;
}

export function setMasterVolume(vol: number) {
  masterVolume = Math.max(0, Math.min(1, vol));
  try {
    localStorage.setItem("w98:master_volume", String(masterVolume));
  } catch {}
}

export function getMasterVolume(): number {
  try {
    const val = localStorage.getItem("w98:master_volume");
    if (val !== null) return parseFloat(val);
  } catch {}
  return masterVolume;
}

/**
 * Windows 98 Startup Chord
 * Nostalgic major chord with shimmering synth tones
 */
export function playStartupSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume();

  // Notes of Win98 startup: Eb4, Bb4, Eb5, G5, Bb5, C6 (warm lush pad chord)
  const notes = [
    { freq: 155.56, time: 0, dur: 2.8, type: "sine" as OscillatorType, gain: 0.35 },
    { freq: 233.08, time: 0.15, dur: 2.6, type: "triangle" as OscillatorType, gain: 0.3 },
    { freq: 311.13, time: 0.3, dur: 2.5, type: "sine" as OscillatorType, gain: 0.35 },
    { freq: 392.00, time: 0.45, dur: 2.4, type: "triangle" as OscillatorType, gain: 0.3 },
    { freq: 466.16, time: 0.6, dur: 2.3, type: "sine" as OscillatorType, gain: 0.25 },
    { freq: 622.25, time: 0.75, dur: 2.4, type: "sine" as OscillatorType, gain: 0.2 },
    { freq: 932.33, time: 0.9, dur: 2.2, type: "triangle" as OscillatorType, gain: 0.15 },
  ];

  notes.forEach((n) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();

    osc.type = n.type;
    osc.frequency.setValueAtTime(n.freq, now + n.time);

    g.gain.setValueAtTime(0, now + n.time);
    g.gain.linearRampToValueAtTime(n.gain * vol, now + n.time + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

    osc.connect(g);
    g.connect(ctx.destination);

    osc.start(now + n.time);
    osc.stop(now + n.time + n.dur);
  });
}

/**
 * Classic Win98 "Chord" / Critical Stop sound
 */
export function playChordSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume();
  const freqs = [130.81, 164.81, 196.00, 261.63]; // C3, E3, G3, C4

  freqs.forEach((f) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(f, now);

    g.gain.setValueAtTime(0.25 * vol, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    // Filter to give that authentic 16-bit Sound Blaster warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, now);

    osc.connect(filter);
    filter.connect(g);
    g.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.7);
  });
}

/**
 * Windows 98 "Ding" / Asterisk
 */
export function playDingSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume();

  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now); // A5
  osc.frequency.exponentialRampToValueAtTime(1760, now + 0.05);

  g.gain.setValueAtTime(0.3 * vol, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

  osc.connect(g);
  g.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.6);
}

/**
 * Navigation / Button Click tick
 */
export function playClickSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume();

  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

  g.gain.setValueAtTime(0.12 * vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  osc.connect(g);
  g.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.035);
}

/**
 * Mine Explosion sound for Minesweeper
 */
export function playExplosionSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume();

  // White noise burst
  const bufferSize = ctx.sampleRate * 0.5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.exponentialRampToValueAtTime(80, now + 0.5);

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.5 * vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

  noise.connect(filter);
  filter.connect(g);
  g.connect(ctx.destination);

  noise.start(now);
  noise.stop(now + 0.5);
}

/**
 * Recycle Bin Paper Crumple sound
 */
export function playRecycleSound() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const vol = getMasterVolume();

  for (let i = 0; i < 4; i++) {
    const t = now + i * 0.08;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300 + Math.random() * 500, t);

    g.gain.setValueAtTime(0.15 * vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(g);
    g.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);
  }
}
