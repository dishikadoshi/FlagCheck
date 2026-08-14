// A few soft, slow-drifting blurred orbs instead of a screen full of floating
// hearts. Restrained on purpose — this sits behind real content, it
// shouldn't compete with it.
import { motion } from "framer-motion";

const ORBS = [
  { size: 340, top: "-8%", left: "-10%", color: "rgba(255,163,194,0.35)", dur: 22 },
  { size: 260, top: "55%", left: "78%", color: "rgba(216,163,77,0.16)", dur: 26 },
  { size: 200, top: "78%", left: "-6%", color: "rgba(248,71,126,0.14)", dur: 30 },
];

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-cream" />
      {ORBS.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{ width: o.size, height: o.size, top: o.top, left: o.left, background: o.color }}
          animate={{ x: [0, 24, -12, 0], y: [0, -18, 14, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="bg-dots absolute inset-0 opacity-[0.5]" />
    </div>
  );
}
