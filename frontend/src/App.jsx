import { useCallback, useEffect, useRef, useState } from "react";
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
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState("onboarding"); // onboarding | playing | result | error
  const [player, setPlayer] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [history, setHistory] = useState(null);

  // ---- browser back/forward support -------------------------------------
  // There's no router in this app (no react-router-dom in package.json) --
  // every phase change is local useState, so the browser's history stack
  // never grows past the initial page load. That's why one "Back" press
  // exits the site entirely: there's nothing in-app for it to step back to.
  //
  // Fix: push a real history entry on every meaningful phase change, and
  // restore state from `popstate` when the user navigates with Back/Forward.
  // `fromPopStateRef` guards against re-pushing an entry while we're in the
  // middle of *responding* to a popstate event (which would corrupt the
  // stack -- every popstate-driven update must be a pure state restore,
  // never a new push).
  const fromPopStateRef = useRef(false);

  const pushHistory = useCallback((state) => {
    if (fromPopStateRef.current) return;
    window.history.pushState(state, "");
  }, []);

  useEffect(() => {
    // Seed a base entry so the very first "Back" press lands on a known
    // in-app state instead of immediately leaving.
    window.history.replaceState({ entered: false, phase: "onboarding" }, "");

    function onPopState(e) {
      const s = e.state;
      fromPopStateRef.current = true;
      if (!s || s.entered === false) {
        setEntered(false);
        setShowHero(true);
        setReady(false);
        setPhase("onboarding");
      } else {
        setEntered(true);
        setShowHero(false);
        setReady(true);
        if (s.phase) setPhase(s.phase);
        if (s.phase === "onboarding") {
          // stepping back to onboarding also means "no active player" in the UI
          setResult(null);
        }
      }
      // release the guard on the next tick, after React has applied the
      // state above -- otherwise a *user-driven* push right after a
      // popstate could get silently dropped too.
      setTimeout(() => {
        fromPopStateRef.current = false;
      }, 0);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Fetched proactively (never on-demand) so the streak calendar popover has
  // no loading state to show.
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
      pushHistory({ entered: true, phase: "result" });
    } else {
      setPhase("playing");
      pushHistory({ entered: true, phase: "playing" });
    }
  }, [pushHistory]);

  async function resolveEntry() {
    setError("");
    try {
      const stored = getStoredUsername();
      if (!stored) {
        setPhase("onboarding");
        setReady(true);
        return;
      }
      const entry = await enterAsPlayer(stored).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
      if (!entry) {
        setPhase("onboarding");
      } else {
        setPlayer(entry.player);
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
      const { player: p, puzzle } = await onboardPlayer({ username, gender });
      if (!p || !p.username || !puzzle) {
        throw new Error("Couldn't create your profile — try again.");
      }
      setPlayer(p);
      setStoredUsername(p.username);
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
      pushHistory({ entered: true, phase: "result" });
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
        pushHistory({ entered: true, phase: "result" });
      } else {
        setError(e.message || "Couldn't submit your guess — try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  const handleExpire = useCallback(() => {
    handleGuess("red");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, player]);

  function handleGoHome() {
    setCalendarOpen(false);
    setResult(null);
    setPuzzle(null);
    setHistory(null);
    setError("");
    setPlayer(null);
    setPhase("onboarding");
    pushHistory({ entered: true, phase: "onboarding" });
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
              pushHistory({ entered: true, phase: "onboarding" });
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
              <AnimatePresence mode="popLayout">
                {/* Previously: nothing rendered here at all while `ready`
                    was false, which is exactly the blank screen with just
                    the header logo showing up in bug reports. This closes
                    that gap with an actual loading state instead of an
                    unstyled void. It won't make the underlying network
                    request faster (that's a backend/Supabase latency
                    question) but the UI never goes blank again. */}
                {!ready && (
                  <motion.div
                    key="loading"
                    {...phaseMotion}
                    className="flex flex-col items-center justify-center gap-3 py-16"
                  >
                    <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-blush-200 border-t-blush-600" />
                    <p className="text-sm text-blush-500">getting today's conversation ready…</p>
                  </motion.div>
                )}

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