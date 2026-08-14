import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const EMOJI = { girl: "👩", boy: "🧑" };
const LABEL = { girl: "her", boy: "his" };

export default function ConversationCard({ puzzle, askingAbout, onGuess, guessing, disabled }) {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setShown(0);
    setTyping(false);
    const timers = [];
    let t = 250;
    puzzle.messages.forEach((_, i) => {
      timers.push(setTimeout(() => setTyping(true), t));
      t += 420;
      timers.push(
        setTimeout(() => {
          setTyping(false);
          setShown((s) => Math.max(s, i + 1));
        }, t)
      );
      t += 140;
    });
    return () => timers.forEach(clearTimeout);
  }, [puzzle.id]);

  const allShown = shown >= puzzle.messages.length;
  const subjectLabel = LABEL[askingAbout];
  const typingSpeaker = puzzle.messages[shown]?.s;

  return (
    <div>
      <div className="mb-6 min-h-[190px] space-y-2.5">
        {puzzle.messages.map((m, i) => {
          const mine = m.s === "boy";
          const visible = i < shown;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14, scale: 0.94 }}
              animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
            >
              {!mine && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blush-100 text-sm">
                  {EMOJI[m.s]}
                </span>
              )}
              <div
                className={`max-w-[76%] rounded-2xl px-4 py-2.5 text-[14.5px] leading-snug shadow-sm ${
                  mine
                    ? "rounded-br-md bg-ink-800 text-cream"
                    : "rounded-bl-md border border-blush-200 bg-white text-ink-800"
                }`}
              >
                {m.t}
              </div>
              {mine && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-800/10 text-sm">
                  {EMOJI[m.s]}
                </span>
              )}
            </motion.div>
          );
        })}

        <AnimatePresence>
          {typing && typingSpeaker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-end gap-2 ${typingSpeaker === "boy" ? "justify-end" : "justify-start"}`}
            >
              {typingSpeaker !== "boy" && (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blush-100 text-sm">
                  {EMOJI[typingSpeaker]}
                </span>
              )}
              <div
                className={`flex items-center gap-1 rounded-2xl px-3.5 py-3 ${
                  typingSpeaker === "boy" ? "rounded-br-md bg-ink-800" : "rounded-bl-md border border-blush-200 bg-white"
                }`}
              >
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: d * 0.14 }}
                    className={`h-1.5 w-1.5 rounded-full ${typingSpeaker === "boy" ? "bg-cream/60" : "bg-blush-300"}`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={allShown ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4 }}>
        <p className="font-display mb-4 text-center text-[17px] text-ink-800">
          Is <span className="font-semibold text-blush-600">{subjectLabel}</span> side of this a
          <span className="whitespace-nowrap"> red flag</span> or a <span className="whitespace-nowrap">green flag</span>?
        </p>
        <div className="grid grid-cols-2 gap-3.5">
          <motion.button
            disabled={!allShown || disabled}
            onClick={() => onGuess("red")}
            whileTap={allShown ? { scale: 0.95 } : {}}
            whileHover={allShown ? { y: -2 } : {}}
            className="flex flex-col items-center gap-1 rounded-2xl bg-gradient-to-b from-[#e0335a] to-[#b91650] py-4 font-display text-[17px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(185,22,80,0.55)] transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <span className="text-xl">🚩</span>
            Red flag
          </motion.button>
          <motion.button
            disabled={!allShown || disabled}
            onClick={() => onGuess("green")}
            whileTap={allShown ? { scale: 0.95 } : {}}
            whileHover={allShown ? { y: -2 } : {}}
            className="flex flex-col items-center gap-1 rounded-2xl bg-gradient-to-b from-[#1f9d6f] to-[#0a6e49] py-4 font-display text-[17px] font-semibold text-white shadow-[0_14px_30px_-10px_rgba(10,110,73,0.5)] transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <span className="text-xl">💚</span>
            Green flag
          </motion.button>
        </div>
        {guessing && <p className="mt-3 animate-pulse text-center text-sm text-blush-500">reading your answer…</p>}
      </motion.div>
    </div>
  );
}
