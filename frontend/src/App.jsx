import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Hero from "./components/Hero.jsx";
import AmbientBackground from "./components/AmbientBackground.jsx";
import Onboarding from "./components/Onboarding.jsx";
import ConversationCard from "./components/ConversationCard.jsx";
import ResultStamp from "./components/ResultStamp.jsx";
import TimerRing from "./components/TimerRing.jsx";
import StreakBadge from "./components/StreakBadge.jsx";
import StreakCalendarPopover from "./components/StreakCalendarPopover.jsx";
import EditProfileModal from "./components/EditProfileModal.jsx";
import {
  getDeviceId,
  fetchPlayer,
  createPlayer,
  fetchTodayPuzzle,
  submitGuess,
  updatePlayer,
} from "./lib/api.js";

export default function App() {
  const [entered, setEntered] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const [phase, setPhase] = useState("loading"); // loading | onboarding | playing | result | error
  const [player, setPlayer] = useState(null);
  const [puzzle, setPuzzle] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");

  const deviceId = getDeviceId();

  const loadPuzzleAndMaybeResult = useCallback(async () => {
    const p = await fetchTodayPuzzle(deviceId);
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
  }, [deviceId]);

  useEffect(() => {
    if (!entered) return;
    (async () => {
      try {
        const existing = await fetchPlayer(deviceId).catch((e) => (e.status === 404 ? null : Promise.reject(e)));
        if (!existing) {
          setPhase("onboarding");
          return;
        }
        setPlayer(existing);
        await loadPuzzleAndMaybeResult();
      } catch (e) {
        setError(e.message || "Something went wrong reaching the server.");
        setPhase("error");
      }
    })();
  }, [entered, deviceId, loadPuzzleAndMaybeResult]);

  async function handleOnboard({ username, gender }) {
    setBusy(true);
    setError("");
    try {
      const p = await createPlayer({ deviceId, username, gender });
      setPlayer(p);
      await loadPuzzleAndMaybeResult();
    } catch (e) {
      setError(e.message || "Couldn't create your profile — try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGuess(answer) {
    if (busy) return;
    setBusy(true);
    try {
      const r = await submitGuess({ deviceId, answer });
      setPlayer(r);
      setResult({
        correct: r.correct,
        timedOut: r.timedOut,
        correctAnswer: r.correctAnswer,
        explanation: r.explanation,
      });
      setPhase("result");
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
  }, [busy]);

  async function handleSaveProfile({ username, gender }) {
    setEditBusy(true);
    setEditError("");
    try {
      const p = await updatePlayer(deviceId, { username, gender });
      setPlayer(p);
      setEditOpen(false);
    } catch (e) {
      setEditError(e.message || "Couldn't save changes — try again.");
    } finally {
      setEditBusy(false);
    }
  }

  return (
    <div className="min-h-screen relative">
      <AmbientBackground />
      <AnimatePresence>
        {showHero && (
          <Hero onEnter={() => setEntered(true)} onExitComplete={() => setShowHero(false)} />
        )}
      </AnimatePresence>

      {entered && (
        <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8 sm:py-12">
          <motion.header
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md flex items-center justify-between mb-6 sm:mb-8"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚩</span>
              <span className="font-display font-bold text-xl text-ink-800">Flag Check</span>
            </div>

            {player && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditOpen(true)}
                  aria-label="Edit profile"
                  title="Edit profile"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-blush-200 bg-white/80 text-ink-500 shadow-sm backdrop-blur transition hover:border-blush-300 hover:text-blush-600"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M11.3 2.3a1.4 1.4 0 0 1 2 2L5.8 12.6l-2.7.7.7-2.7 7.5-8.3Z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div className="relative">
                  <StreakBadge streak={player.streak} open={calendarOpen} onClick={() => setCalendarOpen((v) => !v)} />
                  <StreakCalendarPopover
                    open={calendarOpen}
                    onClose={() => setCalendarOpen(false)}
                    deviceId={deviceId}
                    currentStreak={player.streak}
                    longestStreak={player.longestStreak}
                  />
                </div>
              </div>
            )}
          </motion.header>

          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {phase === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 gap-4"
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                    className="h-9 w-9 rounded-full border-[3px] border-blush-200 border-t-blush-500"
                  />
                  <p className="text-blush-500 text-sm">loading today's read…</p>
                </motion.div>
              )}

              {phase === "onboarding" && (
                <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                  <Onboarding onSubmit={handleOnboard} submitting={busy} error={error} />
                </motion.div>
              )}

              {phase === "playing" && puzzle && (
                <motion.div
                  key="playing"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
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

              {phase === "result" && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  className="bg-white/90 backdrop-blur-xl border border-blush-100 rounded-[28px] shadow-card-lg p-6 sm:p-8"
                >
                  <ResultStamp result={result} askingAbout={puzzle?.askingAbout} puzzleTitle={puzzle?.title} />
                  {player && (
                    <div className="flex items-center justify-center gap-6 mt-6 pt-5 border-t border-blush-100">
                      <div className="text-center">
                        <p className="font-display text-2xl font-bold text-ink-800">{player.streak}</p>
                        <p className="text-[11px] uppercase tracking-wide text-blush-400">current streak</p>
                      </div>
                      <div className="text-center">
                        <p className="font-display text-2xl font-bold text-ink-800">{player.longestStreak}</p>
                        <p className="text-[11px] uppercase tracking-wide text-blush-400">best streak</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {phase === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/90 border border-red-200 rounded-[28px] shadow-card-lg p-7 text-center"
                >
                  <p className="text-red-600 font-semibold mb-2">Couldn't reach the server</p>
                  <p className="text-ink-500 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {player && phase !== "loading" && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-blush-400 text-xs mt-6">
              reading as <span className="font-semibold text-blush-500">{player.username}</span>
            </motion.p>
          )}

          <EditProfileModal
            open={editOpen}
            onClose={() => {
              setEditOpen(false);
              setEditError("");
            }}
            player={player}
            onSave={handleSaveProfile}
            saving={editBusy}
            error={editError}
          />
        </div>
      )}
    </div>
  );
}