/**
 * Page-turn sound effect using Web Audio API.
 * Short, subtle "page flip" noise burst.
 */
let audioCtx: AudioContext | null = null;

export function playPageTurnSound() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const ctx = audioCtx;
    const duration = 0.12;
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Short noise burst that decays quickly — mimics paper
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 4) * 0.18;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3000;
    filter.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.value = 0.4;

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
  } catch {
    // silently fail
  }
}
