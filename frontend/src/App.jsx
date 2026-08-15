import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Hero from "./components/Hero.jsx";
import AmbientBackground from "./components/AmbientBackground.jsx";
import TopNav from "./components/TopNav.jsx";
import Onboarding from "./components/Onboarding.jsx";
import ConversationCard from "./components/ConversationCard.jsx";
import ResultStamp from "./components/ResultStamp.jsx";
import TimerRing from "./components/TimerRing.jsx";
import {
  getStoredUsername,
  setStoredUsername,
  onboardPlayer,
  enterAsPlayer,
  submitGuess,
  fetchHistory,
} from "./lib/api.js";

// One shared, light transition for every top-level phase change
// (onboarding -> playing -> result), so the app reads as one continuous
// motion language rather than a grab-bag of effects.
//
// Deliberately transform/opacity-only: an earlier version animated a CSS
// `filter: blur()` here on top of a card that already has `backdrop-blur-xl`
// applied to it. Animating blur is expensive to composite (it can't run on
// the GPU compositor the way transform/opacity can) and, stacked on another
// blur, was heavy enough to visibly stall the main thread for a beat on
// every phase change -- exactly the "loads and pauses" glitch on both
// Start Reading and tapping a flag, since both go through this transition.
const PHASE_TRANSITION = { duration: 0.22, ease: "easeOut" };
const phaseMotion = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99, transition: { duration: 0.15, ease: "easeIn" } },
  transition: PHASE_TRANSITION,
};

export default function App() {
  const [showHero, setShowHero] = useState(true);
  const [entered, setEntered] = useState(false);
  const [ready, setReady] = useState(false); // true once we know which phase to show — no separate "loading" screen is ever rendered
  const [phase, setPhase] = useState("onboarding"); // onboarding | playing | result | error
  const [player, setPlayer] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [history, setHistory] = useState(null);

  // Fetched proactively (never on-demand) so the streak calendar popover has
  // no loading state to show — by the time anyone taps the streak badge, the
  // data has already been sitting in memory for a while.
  const refreshHistory = useCallback(async (username) => {
    try {
      const h = await fetchHistory(username, 35);
      setHistory(h);
    } catch {
      // non-critical: leave whatever history is already in state
    }
  }, []);

  const loadPuzzleAndMaybeResult = useCallback((p) => {
    setPuzzle(p);
    if (p.alreadyPlayed) {
      setResult({
        correct: p.resultToday.correct,
        timedOut: p.resultToday.timedOut,
        correctAnswer: p.resultToday.correctAnswer,
        explanation: p.resultToday.explanation,
      });
      setPhase("result");
    } else {
      setPhase("playing");
    }
  }, []);

  // Fired the instant the flag is tapped, in parallel with the door-opening
  // animation (~1.3s). Whichever profile this browser last used (if any) is
  // resolved *while the doors are swinging*, so by the time they're fully
  // open the correct screen is already sitting there waiting — no spinner,
  // no separate loading screen, ever.
  async function resolveEntry() {
    setError("");
    try {
      const stored = getStoredUsername();
      if (!stored) {
        setPhase("onboarding");
        setReady(true);
        return;
      }
      // One combined request instead of fetchPlayer() + fetchTodayPuzzle()
      // as two sequential round trips.
      const entry = await enterAsPlayer(stored).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!entry) {
        setPhase("onboarding");
      } else {
        setPlayer(entry.player);
        // History is only for the streak-calendar popover, not needed to
        // show the puzzle/result screen -- fetch it in the background
        // instead of making the phase transition wait on it too.
        refreshHistory(entry.player.username);
        loadPuzzleAndMaybeResult(entry.puzzle);
      }
      setReady(true);
    } catch (e) {
      setError(e.message || "Something went wrong reaching the server.");
      setPhase("error");
      setReady(true);
    }
  }

  async function handleOnboard({ username, gender }) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      // One combined request instead of createPlayer() + fetchTodayPuzzle()
      // as two sequential round trips -- this is what was making "Start
      // reading" feel slow even after the loading state itself got lighter.
      const { player: p, puzzle } = await onboardPlayer({ username, gender });
      // Defensive: a malformed/empty response should surface as a normal
      // error message, never as a raw "Cannot read properties of null" crash.
      if (!p || !p.username || !puzzle) {
        throw new Error("Couldn't create your profile — try again.");
      }
      setPlayer(p);
      setStoredUsername(p.username);
      // Same as above: don't hold up the phase change waiting on the
      // (non-critical) streak history to load.
      refreshHistory(p.username);
      loadPuzzleAndMaybeResult(puzzle);
      setReady(true);
    } catch (e) {
      setError(e.message || "Couldn't start your profile — try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGuess(answer) {
    if (busy || !player) return;
    setBusy(true);
    try {
      const r = await submitGuess({ username: player.username, answer });
      setPlayer(r);
      setResult({
        correct: r.correct,
        timedOut: r.timedOut,
        correctAnswer: r.correctAnswer,
        explanation: r.explanation,
      });
      setPhase("result");
      refreshHistory(r.username);
    } catch (e) {
      if (e.status === 409 && e.data) {
        setPlayer(e.data);
        setResult({
          correct: e.data.resultToday?.correct,
          timedOut: e.data.resultToday?.timedOut,
          correctAnswer: e.data.resultToday?.correctAnswer,
          explanation: e.data.resultToday?.explanation,
        });
        setPhase("result");
      } else {
        setError(e.message || "Couldn't submit your guess — try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  const handleExpire = useCallback(() => {
    // lock in a forced (losing) submission once the 90s window server-side has passed
    handleGuess("red");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, player]);

  // "Switch reader" — the home icon next to the streak badge. Instantly
  // shows the username form again (no fetch, nothing to wait on, since the
  // app is already open). Typing the same username returns that same
  // player's result/streak; typing a different one starts (or resumes) a
  // completely separate player — each has their own streak, stored
  // server-side by username, not by device.
  function handleGoHome() {
    setCalendarOpen(false);
    setResult(null);
    setPuzzle(null);
    setHistory(null);
    setError("");
    // Fully clear the previous reader, not just the visible phase. Leaving
    // `player` set here was a real bug: the header kept showing "reading as
    // <old name>" even on the fresh onboarding screen, and it meant every
    // piece of state briefly pointed at two different people at once while
    // a new profile was being created.
    setPlayer(null);
    setPhase("onboarding");
  }

  const showControls = ready && phase !== "onboarding" && phase !== "error" && !!player;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AmbientBackground />
      <AnimatePresence>
        {showHero && (
          <Hero
            onEnter={() => {
              setEntered(true);
              resolveEntry();
            }}
            onExitComplete={() => setShowHero(false)}
          />
        )}
      </AnimatePresence>

      {entered && (
        <div className="relative z-10 flex h-full flex-col">
          <TopNav
            player={player}
            showControls={showControls}
            onHome={handleGoHome}
            calendarOpen={calendarOpen}
            onToggleCalendar={() => setCalendarOpen((v) => !v)}
            onCloseCalendar={() => setCalendarOpen(false)}
            history={history}
          />

          <main className="flex flex-1 items-center justify-center overflow-y-auto px-4 pb-6">
            <div className="relative w-full max-w-md">
              {/* mode="popLayout" takes the exiting card out of normal layout
                  flow (position: absolute) the moment it starts animating
                  out, so the incoming card can immediately sit in its final
                  centered position instead of both cards briefly coexisting
                  in this flex column. That coexistence was the actual cause
                  of the result/onboarding card first appearing low and then
                  jumping up: for a moment there were two stacked children
                  pushing each other off-center. mode="wait" avoided that by
                  never rendering two at once, but paid for it with a visible
                  stall before the new card appeared -- popLayout gets both:
                  instant, correctly-centered entry and a clean, non-janky exit. */}
              <AnimatePresence mode="popLayout">
                {ready && phase === "onboarding" && (
                  <motion.div key="onboarding" {...phaseMotion}>
                    <Onboarding onSubmit={handleOnboard} submitting={busy} error={error} />
                  </motion.div>
                )}

                {ready && phase === "playing" && puzzle && (
                  <motion.div
                    key="playing"
                    {...phaseMotion}
                    className="bg-white/90 backdrop-blur-xl border border-blush-100 rounded-[28px] shadow-card-lg p-5 sm:p-7"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-blush-400">today's conversation</p>
                        <h2 className="font-display text-xl font-semibold text-ink-800">{puzzle.title}</h2>
                      </div>
                      <TimerRing
                        startedAt={puzzle.startedAt || Date.now()}
                        timeLimitMs={puzzle.timeLimitMs}
                        onExpire={handleExpire}
                        paused={busy}
                      />
                    </div>
                    <ConversationCard
                      puzzle={puzzle}
                      askingAbout={puzzle.askingAbout}
                      onGuess={handleGuess}
                      guessing={busy}
                      disabled={busy}
                    />
                  </motion.div>
                )}

                {ready && phase === "result" && result && (
                  <motion.div
                    key="result"
                    {...phaseMotion}
                    className="bg-white/85 backdrop-blur-xl border border-blush-200 rounded-[28px] shadow-soft p-6 sm:p-8"
                  >
                    <ResultStamp result={result} askingAbout={puzzle?.askingAbout} puzzleTitle={puzzle?.title} />
                    {player && (
                      <div className="flex items-center justify-center gap-6 mt-6 pt-5 border-t border-blush-100">
                        <div className="text-center">
                          <p className="font-display text-2xl font-bold text-blush-800">{player.streak}</p>
                          <p className="text-[11px] uppercase tracking-wide text-blush-400">current streak</p>
                        </div>
                        <div className="text-center">
                          <p className="font-display text-2xl font-bold text-blush-800">{player.longestStreak}</p>
                          <p className="text-[11px] uppercase tracking-wide text-blush-400">best streak</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {ready && phase === "error" && (
                  <motion.div
                    key="error"
                    {...phaseMotion}
                    className="bg-white/90 border border-red-200 rounded-[28px] shadow-card-lg p-7 text-center"
                  >
                    <p className="text-red-600 font-semibold mb-2">Couldn't reach the server</p>
                    <p className="text-blush-600 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}