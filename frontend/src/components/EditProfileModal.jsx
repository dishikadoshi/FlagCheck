import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EditProfileModal({ open, onClose, player, onSave, saving, error }) {
  const [username, setUsername] = useState(player?.username || "");
  const [gender, setGender] = useState(player?.gender || "");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = username.trim();
    if (trimmed.length < 2 || !gender || saving) return;
    onSave({ username: trimmed, gender });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm"
          />
          <motion.div
            key="sheet"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[26px] border border-blush-100 bg-white p-6 shadow-card-lg"
            role="dialog"
            aria-modal="true"
            aria-label="Edit profile"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blush-400">Profile</p>
                <h2 className="font-display mt-1 text-xl font-semibold text-ink-800">Edit your details</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 -mt-1 rounded-full p-2 text-ink-400 transition hover:bg-blush-50 hover:text-blush-600"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-blush-500">Display name</span>
                <input
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  maxLength={24}
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

              <div className="mt-7 flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-2xl border border-blush-200 py-3 text-sm font-semibold text-ink-600 transition hover:bg-blush-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || username.trim().length < 2 || !gender}
                  className="flex-1 rounded-2xl bg-blush-500 py-3 text-sm font-semibold text-white shadow-pop transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
