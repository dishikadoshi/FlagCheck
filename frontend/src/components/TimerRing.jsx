import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const R = 26;
const CIRC = 2 * Math.PI * R;

export default function TimerRing({ startedAt, timeLimitMs, onExpire, paused }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, timeLimitMs - (Date.now() - startedAt))
  );
  const expiredRef = useRef(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      const left = Math.max(0, timeLimitMs - (Date.now() - startedAt));
      setRemaining(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    }, 200);
    return () => clearInterval(id);
  }, [startedAt, timeLimitMs, onExpire, paused]);

  const seconds = Math.ceil(remaining / 1000);
  const pct = remaining / timeLimitMs;
  const urgent = seconds <= 15;

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
        <circle cx="32" cy="32" r={R} fill="none" stroke="#ffe0ea" strokeWidth="5" />
        <motion.circle
          cx="32"
          cy="32"
          r={R}
          fill="none"
          stroke={urgent ? "#e02424" : "#e02461"}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          animate={{ strokeDashoffset: CIRC * (1 - pct) }}
          transition={{ duration: 0.2, ease: "linear" }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center font-display font-semibold text-blush-800 text-sm"
        animate={urgent ? { scale: [1, 1.18, 1] } : { scale: 1 }}
        transition={{ duration: 0.6, repeat: urgent ? Infinity : 0 }}
      >
        {seconds}
      </motion.div>
    </div>
  );
}
