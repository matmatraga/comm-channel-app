import { useEffect, useRef } from "react";

/**
 * Plays a classic phone ring pattern while `active` is true.
 * Uses Web Audio API — no external audio files required.
 */
export const useRingtone = (active) => {
  const intervalRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    const playBurst = (ctx) => {
      if (cancelled) return;
      const t = ctx.currentTime;
      [440, 480].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.1, t + 0.04);
        gain.gain.setValueAtTime(0.1, t + 0.85);
        gain.gain.linearRampToValueAtTime(0, t + 1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.05);
      });
    };

    const start = async () => {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      ctxRef.current = ctx;

      try {
        await ctx.resume();
      } catch {
        await ctx.close();
        return;
      }

      if (cancelled) {
        await ctx.close();
        return;
      }

      playBurst(ctx);
      intervalRef.current = window.setInterval(() => playBurst(ctx), 3000);
    };

    start();

    return () => {
      cancelled = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const ctx = ctxRef.current;
      ctxRef.current = null;
      ctx?.close().catch(() => {});
    };
  }, [active]);
};
