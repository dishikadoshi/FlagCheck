import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const WEEKS = 5; // 5x7 = 35 days
const DAY_MS = 86400000;

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

// `history` is pre-fetched by App (in parallel with the day's puzzle, while
// the door animation plays) and simply handed down here — this component
// never fetches anything itself, so there's nothing to wait on when it opens.
export default function StreakCalendarPopover({ open, onClose, history, currentStreak, longestStreak }) {
  const grid = useMemo(() => {
    const byDate = new Map((history?.days || []).map((d) => [d.date, d.correct]));
    const today = new Date();
    const cells = [];
    for (let i = WEEKS * 7 - 1; i >= 0; i--) {
      const d = new Date(today.getTime() - i * DAY_MS);
      const key = toDateStr(d);
      cells.push({
        key,
        day: d.getDate(),
        isToday: i === 0,
        state: byDate.has(key) ? (byDate.get(key) ? "correct" : "wrong") : "empty",
      });
    }
    return cells;
  }, [history]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden="true" />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -6 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="absolute right-0 top-[calc(100%+10px)] z-40 w-[280px] origin-top-right rounded-3xl border border-blush-100 bg-white p-5 shadow-card-lg"
            role="dialog"
            aria-label="Streak calendar"
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-[15px] font-semibold text-blush-800">Your streak</p>
              <div className="flex items-center gap-1 text-[13px] font-semibold text-blush-500">
                <span>🔥</span>
                {currentStreak}
              </div>
            </div>
            <p className="mt-0.5 text-[11px] text-blush-400">
              best: {longestStreak} day{longestStreak === 1 ? "" : "s"}
            </p>

            <div className="mt-4 grid grid-cols-7 gap-1.5">
              {grid.map((c) => (
                <div
                  key={c.key}
                  title={c.key}
                  className={`flex aspect-square items-center justify-center rounded-lg text-[10px] font-semibold tabular-nums ring-1 ring-inset ${
                    c.state === "correct"
                      ? "bg-emerald-500 text-white ring-emerald-500"
                      : c.state === "wrong"
                      ? "bg-blush-200 text-blush-700 ring-blush-200"
                      : "bg-blush-50 text-blush-300 ring-blush-100"
                  } ${c.isToday ? "ring-2 ring-offset-1 ring-offset-white ring-blush-800" : ""}`}
                >
                  {c.day}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3.5 border-t border-blush-100 pt-3.5 text-[10.5px] text-blush-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-emerald-500" /> read right
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-blush-200" /> missed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-blush-50 ring-1 ring-inset ring-blush-100" /> no play
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
