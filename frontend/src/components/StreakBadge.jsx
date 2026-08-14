import { motion, AnimatePresence } from "framer-motion";

export default function StreakBadge({ streak, onClick, open }) {
  return (
    <motion.button
      layout
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      aria-haspopup="dialog"
      aria-expanded={open}
      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 shadow-sm backdrop-blur transition ${
        open ? "border-blush-400 bg-white" : "border-blush-200 bg-white/80 hover:border-blush-300"
      }`}
    >
      <motion.span
        key={streak}
        initial={{ scale: 0.4, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 12 }}
        className="text-lg leading-none"
      >
        🔥
      </motion.span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={streak}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          className="font-display font-bold text-blush-800 tabular-nums"
        >
          {streak}
        </motion.span>
      </AnimatePresence>
      <span className="text-[11px] uppercase tracking-wide text-blush-500">streak</span>
    </motion.button>
  );
}
