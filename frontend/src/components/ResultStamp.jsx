import { motion } from "framer-motion";

function nextPuzzleIn() {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const diff = next - now;
  const h = Math.floor(diff / 3.6e6);
  const m = Math.floor((diff % 3.6e6) / 6e4);
  return `${h}h ${m}m`;
}

export default function ResultStamp({ result, askingAbout, puzzleTitle }) {
  const { correct, timedOut, correctAnswer, explanation } = result;
  const subject = askingAbout === "girl" ? "her" : "his";
  const isRed = correctAnswer === "red";

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 3, opacity: 0, rotate: isRed ? -25 : 20 }}
        animate={{ scale: 1, opacity: 1, rotate: isRed ? -8 : 6 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
        className={`inline-flex flex-col items-center gap-1 border-4 rounded-2xl px-8 py-5 mb-5 ${
          isRed ? "border-red-600 text-red-700" : "border-emerald-600 text-emerald-700"
        }`}
        style={{ transform: `rotate(${isRed ? -6 : 4}deg)` }}
      >
        <span className="text-4xl">{isRed ? "🚩" : "💚"}</span>
        <span className="font-display font-black text-2xl tracking-widest uppercase">
          {isRed ? "Red flag" : "Green flag"}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p
          className={`font-display text-xl font-semibold mb-2 ${
            timedOut ? "text-blush-600" : correct ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {timedOut ? "Time's up — no read, no streak" : correct ? "You read it right." : "Not quite."}
        </p>
        <p className="text-blush-700 text-sm mb-1">
          "{puzzleTitle}" — {subject} side was the {isRed ? "red" : "green"} flag.
        </p>
        <p className="text-blush-800/90 text-[15px] leading-relaxed max-w-sm mx-auto bg-blush-50 border border-blush-100 rounded-2xl px-4 py-3 mt-3">
          {explanation}
        </p>
        <p className="text-blush-400 text-xs mt-5 tracking-wide">
          next conversation in {nextPuzzleIn()}
        </p>
      </motion.div>
    </div>
  );
}
