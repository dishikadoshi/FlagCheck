import { motion } from "framer-motion";
import { useState } from "react";

export default function Onboarding({ onSubmit, submitting, error }) {
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState(null);

  const canSubmit = username.trim().length >= 2 && gender && !submitting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 16 }}
      className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-xl border border-blush-200 rounded-[28px] shadow-soft p-7 sm:p-9"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, -8, 8, -4, 0] }}
        transition={{ delay: 0.15, duration: 0.7, ease: "easeOut" }}
        className="text-5xl text-center mb-3"
      >
        💌
      </motion.div>
      <h2 className="font-display text-2xl text-center text-blush-800 mb-1">Before we start</h2>
      <p className="text-center text-blush-600/80 text-sm mb-6">
        Two quick things so we can hand you the right side of the conversation.
      </p>

      <label className="block text-xs font-semibold tracking-wide uppercase text-blush-700 mb-2">
        Pick a name
      </label>
      <input
        value={username}
        maxLength={24}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="e.g. rosequartz"
        className="w-full rounded-2xl border-2 border-blush-200 focus:border-blush-500 bg-blush-50/60 px-4 py-3 text-blush-900 placeholder:text-blush-300 outline-none transition-colors mb-6"
      />

      <label className="block text-xs font-semibold tracking-wide uppercase text-blush-700 mb-2">
        You're reading as
      </label>
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { key: "male", label: "A guy", emoji: "🧑" },
          { key: "female", label: "A girl", emoji: "👩"},
        ].map((opt) => (
          <motion.button
            key={opt.key}
            type="button"
            onClick={() => setGender(opt.key)}
            whileTap={{ scale: 0.94 }}
            whileHover={{ y: -2 }}
            className={`relative rounded-2xl border-2 px-3 py-4 text-center transition-colors ${
              gender === opt.key
                ? "border-blush-600 bg-blush-100 shadow-soft"
                : "border-blush-200 bg-white/70"
            }`}
          >
            <div className="text-2xl mb-1">{opt.emoji}</div>
            <div className="font-semibold text-blush-800 text-sm">{opt.label}</div>
            <div className="text-[11px] text-blush-500 mt-0.5">{opt.hint}</div>
            {gender === opt.key && (
              <motion.div
                layoutId="genderTick"
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blush-600 text-white text-xs flex items-center justify-center shadow-soft"
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-red-600 text-sm text-center mb-4"
        >
          {error}
        </motion.p>
      )}

      <motion.button
        type="button"
        disabled={!canSubmit}
        onClick={() => onSubmit({ username: username.trim(), gender })}
        whileTap={canSubmit ? { scale: 0.96 } : {}}
        whileHover={canSubmit ? { scale: 1.02 } : {}}
        className={`w-full rounded-2xl py-3.5 font-display font-semibold text-lg tracking-wide transition-all ${
          canSubmit
            ? "bg-gradient-to-r from-blush-500 to-blush-700 text-white shadow-soft"
            : "bg-blush-100 text-blush-300 cursor-not-allowed"
        }`}
      >
        {submitting ? "Setting up…" : "Start reading"}
      </motion.button>
    </motion.div>
  );
}