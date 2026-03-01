import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface AudioLevelIndicatorProps {
  stream: MediaStream | null;
  isActive: boolean;
  onLevelUpdate?: (avg: number, peak: number) => void;
}

/**
 * Visual audio level meter that shows real-time microphone input level.
 * Warns user if level is too low or too high (clipping).
 */
export default function AudioLevelIndicator({ stream, isActive, onLevelUpdate }: AudioLevelIndicatorProps) {
  const [level, setLevel] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const peakRef = useRef(0);
  const avgAccRef = useRef<number[]>([]);

  useEffect(() => {
    if (!stream || !isActive) {
      setLevel(0);
      setWarning(null);
      return;
    }

    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      ctxRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        let max = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = Math.abs(dataArray[i] - 128);
          sum += v;
          if (v > max) max = v;
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 64);

        setLevel(normalized);
        peakRef.current = Math.max(peakRef.current, max / 128);
        avgAccRef.current.push(normalized);

        // Warnings
        if (normalized < 0.02) {
          setWarning("🔇 Niveau trop bas – rapproche le micro");
        } else if (max > 120) {
          setWarning("🔊 Niveau trop fort – éloigne le micro");
        } else {
          setWarning(null);
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      tick();

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        source.disconnect();
        ctx.close().catch(() => {});

        // Report final stats
        if (onLevelUpdate && avgAccRef.current.length > 0) {
          const totalAvg = avgAccRef.current.reduce((a, b) => a + b, 0) / avgAccRef.current.length;
          onLevelUpdate(totalAvg, peakRef.current);
        }
        peakRef.current = 0;
        avgAccRef.current = [];
      };
    } catch {
      return;
    }
  }, [stream, isActive]);

  if (!isActive) return null;

  return (
    <div className="space-y-1">
      {/* Level bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              level > 0.7 ? "bg-destructive" : level > 0.15 ? "bg-primary" : "bg-muted-foreground/40"
            }`}
            animate={{ width: `${Math.max(2, level * 100)}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round(level * 100)}%</span>
      </div>

      {/* Warning */}
      {warning && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] text-warning text-center"
        >
          {warning}
        </motion.p>
      )}
    </div>
  );
}
