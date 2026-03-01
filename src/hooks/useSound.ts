import { useCallback, useRef } from "react";

type SoundName = "qiblaFound" | "verseCorrect" | "sessionComplete" | "error" | "collectDing" | "powerUpSubhanAllah" | "gameOverAstaghfirullah" | "levelUp";

// Synthesized sounds using Web Audio API — no external files needed
function createOscillator(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  duration: number,
  gain: number,
  rampDown = true
): { osc: OscillatorNode; gainNode: GainNode } {
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gainNode.gain.value = gain;
  if (rampDown) {
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  }
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  return { osc, gainNode };
}

const SOUND_GENERATORS: Record<SoundName, (ctx: AudioContext) => void> = {
  // Gentle "ding" — two harmonics
  qiblaFound: (ctx) => {
    const { osc: o1 } = createOscillator(ctx, 880, "sine", 0.5, 0.15);
    const { osc: o2 } = createOscillator(ctx, 1320, "sine", 0.4, 0.08);
    o1.start(); o1.stop(ctx.currentTime + 0.5);
    o2.start(ctx.currentTime + 0.05); o2.stop(ctx.currentTime + 0.45);
  },

  // Rising "whoosh" — ascending frequency
  verseCorrect: (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.35);
  },

  // Warm "success" — major chord arpeggio
  sessionComplete: (ctx) => {
    [523, 659, 784].forEach((freq, i) => {
      const { osc } = createOscillator(ctx, freq, "sine", 0.6, 0.12);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.6);
    });
  },

  // Soft "bip" — low tone, very short
  error: (ctx) => {
    const { osc } = createOscillator(ctx, 280, "triangle", 0.2, 0.1);
    osc.start(); osc.stop(ctx.currentTime + 0.2);
  },

  // Quick bright "ding" for collecting dots
  collectDing: (ctx) => {
    const { osc } = createOscillator(ctx, 1200, "sine", 0.12, 0.1);
    osc.start(); osc.stop(ctx.currentTime + 0.12);
  },

  // Rising triumphant chord for power-up (SubhanAllah feel)
  powerUpSubhanAllah: (ctx) => {
    [660, 880, 1100, 1320].forEach((freq, i) => {
      const { osc } = createOscillator(ctx, freq, "sine", 0.5, 0.1);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.5);
    });
    // Add a gentle shimmer
    const { osc: shimmer } = createOscillator(ctx, 2200, "sine", 0.8, 0.04);
    shimmer.frequency.setValueAtTime(2200, ctx.currentTime + 0.1);
    shimmer.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.8);
    shimmer.start(ctx.currentTime + 0.1);
    shimmer.stop(ctx.currentTime + 0.9);
  },

  // Descending soft tone for game over (AstaghfiruLlah feel)
  gameOverAstaghfirullah: (ctx) => {
    [520, 440, 350, 280].forEach((freq, i) => {
      const { osc } = createOscillator(ctx, freq, "triangle", 0.4, 0.1);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.4);
    });
  },

  // Level up fanfare
  levelUp: (ctx) => {
    [523, 659, 784, 1047].forEach((freq, i) => {
      const { osc } = createOscillator(ctx, freq, "sine", 0.35, 0.12);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.35);
    });
  },
};

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback((name: SoundName) => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      SOUND_GENERATORS[name](ctx);
    } catch {
      // Audio not supported — fail silently
    }
  }, []);

  const vibrate = useCallback((pattern: number | number[] = 50) => {
    try {
      navigator.vibrate?.(pattern);
    } catch {}
  }, []);

  return { play, vibrate };
}
