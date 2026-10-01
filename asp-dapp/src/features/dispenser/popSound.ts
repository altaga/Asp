/** Synthesised dispenser sounds (no audio files) + haptics. Needs a user gesture first. */
let ctx: AudioContext | null = null;
let muted = false;

export function setPopMuted(next: boolean) {
  muted = next;
}

export function isPopMuted() {
  return muted;
}

function audio(): AudioContext | null {
  if (muted || typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, seconds: number, type: OscillatorType, gain: number, endFreq?: number) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  const t = ac.currentTime;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + seconds);
  amp.gain.setValueAtTime(gain, t);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  osc.connect(amp).connect(ac.destination);
  osc.start(t);
  osc.stop(t + seconds);
}

export const popSound = {
  press: () => tone(1200, 0.05, 'square', 0.05, 700),
  whirr: () => tone(90, 0.75, 'sawtooth', 0.04, 140),
  thud: () => tone(170, 0.25, 'sine', 0.3, 50),
  chime: () => [784, 988, 1319].forEach((f, i) => setTimeout(() => tone(f, 0.3, 'triangle', 0.07), i * 110)),
};

export function buzz(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
}
