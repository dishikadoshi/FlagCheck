import { motion } from "framer-motion";
import { useMemo } from "react";

const GLYPHS = ["♥", "♡"];

export default function FloatingHearts({ count = 14 }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 14 + Math.random() * 26,
        duration: 10 + Math.random() * 12,
        delay: Math.random() * 10,
        glyph: GLYPHS[i % 2],
        opacity: 0.08 + Math.random() * 0.16,
      })),
    [count]
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {hearts.map((h) => (
        <motion.span
          key={h.id}
          className="absolute text-blush-500 select-none"
          style={{ left: `${h.left}%`, fontSize: h.size, opacity: h.opacity, bottom: -60 }}
          animate={{ y: ["0vh", "-115vh"], rotate: [0, h.id % 2 ? 25 : -25] }}
          transition={{ duration: h.duration, delay: h.delay, repeat: Infinity, ease: "linear" }}
        >
          {h.glyph}
        </motion.span>
      ))}
    </div>
  );
}
