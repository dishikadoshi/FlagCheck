import { useState } from "react";
import { motion } from "framer-motion";

export default function Onboarding({ onSubmit, submitting, error, initial }) {
  const [username, setUsername] = useState(initial?.username || "");
  const [gender, setGender] = useState(initial?.gender || "");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length < 2 || !gender || submitting) return;
    onSubmit({ username: trimmed, gender });
  }

  const valid = username.trim().length >= 2 && !!gender;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-blush-100 bg-white/90 p-6 shadow-card-lg backdrop-blur-xl sm:p-8"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blush-400">Before we start</p>
      <h2 className="font-display mt-1 text-2xl font-semibold text-ink-800">Who's reading today?</h2>
      <p className="mt-2 text-[13.5px] leading-relaxed text-ink-400/90">
        Just enough to save your streak on this device. Every player gets the exact same puzzles and the exact
        same answers — this is only for your profile.
      </p>

      <label className="mt-6 block">
        <span className="text-xs font-semibold uppercase tracking-wide text-blush-500">Display name</span>
        <input
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={24}
          placeholder="e.g. doodles"
          className="mt-2 w-full rounded-2xl border border-blush-200 bg-cream px-4 py-3 text-[15px] text-ink-800 outline-none transition focus:border-blush-400 focus:ring-4 focus:ring-blush-100"
        />
      </label>

      <fieldset className="mt-5">
        <legend className="text-xs font-semibold uppercase tracking-wide text-blush-500">You are</legend>
        <div className="mt-2 grid grid-cols-2 gap-2.5">
          {[
            { v: "female", label: "Woman" },
            { v: "male", label: "Man" },
          ].map((opt) => (
            <button
              type="button"
              key={opt.v}
              onClick={() => setGender(opt.v)}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                gender === opt.v
                  ? "border-blush-500 bg-blush-500 text-white shadow-pop"
                  : "border-blush-200 bg-cream text-ink-600 hover:border-blush-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </fieldset>

      {error && <p className="mt-4 text-sm font-medium text-red-600">{error}</p>}

      <motion.button
        type="submit"
        disabled={!valid || submitting}
        whileTap={valid ? { scale: 0.98 } : {}}
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-blush-500 py-3.5 font-display text-[16px] font-semibold text-white shadow-pop transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Setting up…" : "Start reading"}
      </motion.button>
    </motion.form>
  );
}
