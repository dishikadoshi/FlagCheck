import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy backend/.env.example to backend/.env, fill in your Supabase project's URL and\n" +
      "service_role key (Project Settings -> API), run backend/schema.sql in the SQL editor,\n" +
      "then `node seed.js` to load the puzzle bank."
  );
  process.exit(1);
}

// service_role key = full read/write, bypasses RLS. Server-side only -- never send this to the frontend.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const app = express();
app.use(cors());
app.use(express.json());

const TIME_LIMIT_MS = 90 * 1000;
const GRACE_MS = 4000; // small server-side buffer for network latency

// ---- date helpers (all dates handled as YYYY-MM-DD, UTC) ----
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}
function yesterdayStr() {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
function dayIndex() {
  const epoch = new Date("2024-01-01T00:00:00Z").getTime();
  return Math.floor((Date.now() - epoch) / 86400000);
}
function usernameKey(u) {
  return String(u || "").trim().toLowerCase();
}

function publicPlayer(p, resultToday) {
  if (!p) return null;
  const today = todayStr();
  const playedToday = p.last_played_date === today;
  return {
    username: p.username,
    gender: p.gender,
    streak: p.current_streak,
    longestStreak: p.longest_streak,
    lastPlayedDate: p.last_played_date,
    playedToday,
    resultToday: playedToday ? resultToday || null : null,
  };
}

// Players are looked up by username, case-insensitively, via the generated
// `username_key` column (see schema.sql). This is what lets two different
// people share a browser/device and still have completely separate streaks:
// whoever types "priya" always gets priya's row, whoever types "sam" always
// gets sam's, regardless of which device either of them is on.
async function getPlayerByUsername(username) {
  const key = usernameKey(username);
  if (!key) return null;
  const { data, error } = await supabase.from("players").select("*").eq("username_key", key).maybeSingle();
  if (error) throw error;
  return data;
}

// Deterministically picks (and persists) which published puzzle a given calendar date gets.
async function getOrAssignDailyPuzzle(dateStr) {
  const existing = await supabase
    .from("daily_puzzles")
    .select("date, puzzle_id, puzzles(*)")
    .eq("date", dateStr)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data.puzzles;

  const { data: published, error: pubErr } = await supabase
    .from("puzzles")
    .select("*")
    .eq("status", "published")
    .order("slug", { ascending: true });
  if (pubErr) throw pubErr;
  if (!published || published.length === 0) {
    throw new Error("No published puzzles found -- run `node seed.js` after applying schema.sql.");
  }

  const idx = ((dayIndex() % published.length) + published.length) % published.length;
  const puzzle = published[idx];

  // insert, ignoring a race where another request already inserted the same date
  const { error: insertErr } = await supabase
    .from("daily_puzzles")
    .insert({ date: dateStr, puzzle_id: puzzle.id })
    .select()
    .maybeSingle();
  if (insertErr && insertErr.code !== "23505") throw insertErr; // 23505 = unique_violation, fine, someone beat us to it

  return puzzle;
}

async function getAttempt(playerId, puzzleId) {
  const { data, error } = await supabase
    .from("attempts")
    .select("*")
    .eq("player_id", playerId)
    .eq("puzzle_id", puzzleId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function toClientPuzzle(puzzle) {
  return {
    id: puzzle.slug,
    title: puzzle.title,
    messages: puzzle.messages,
    // "who is being judged" -- puzzle-defined, never derived from the player's own gender
    askingAbout: puzzle.target_person,
  };
}

function resultPayload(puzzle, attempt) {
  return {
    correct: attempt.correct,
    timedOut: attempt.timed_out ?? false,
    correctAnswer: puzzle.verdict,
    explanation: puzzle.explanation,
    askingAbout: puzzle.target_person,
    puzzleTitle: puzzle.title,
  };
}

// Shared by /api/puzzle/today, /api/onboard, and /api/enter -- builds
// today's puzzle payload for a given (already-resolved) player row, or a
// player-less generic payload if `player` is null. Pulled out into one
// function so the onboard/enter endpoints can return player + puzzle in a
// single response instead of the frontend needing two round trips for it.
async function buildTodayPuzzlePayload(player) {
  const today = todayStr();
  const puzzle = await getOrAssignDailyPuzzle(today);

  let startedAt = null;
  let alreadyPlayed = false;
  let resultToday = null;

  if (player) {
    const attempt = await getAttempt(player.id, puzzle.id);
    alreadyPlayed = !!attempt;

    if (attempt) {
      resultToday = resultPayload(puzzle, attempt);
      startedAt = new Date(attempt.played_at).getTime();
    } else {
      const puzzleState = player.puzzle_state || {};
      if (!puzzleState[today]) {
        puzzleState[today] = { startedAt: Date.now() };
        const { error } = await supabase
          .from("players")
          .update({ puzzle_state: puzzleState })
          .eq("id", player.id);
        if (error) throw error;
      }
      startedAt = puzzleState[today].startedAt;
    }
  }

  return {
    date: today,
    ...toClientPuzzle(puzzle),
    timeLimitMs: TIME_LIMIT_MS,
    startedAt,
    alreadyPlayed,
    resultToday,
  };
}

// ---- routes ----

// Create or fetch a player by username. If no player exists for that
// username yet, gender is required and a new row is created. If a player
// with that username (case-insensitively) already exists, their existing
// row is returned as-is -- this is the "same username = same person, same
// streak" rule; a different username is always a different player.

// True only when the 23505 came from the username_key unique index
// specifically (a genuine "someone else grabbed this exact name" race).
// Supabase/Postgres error objects name the offending constraint/column in
// `details` (e.g. "Key (username_key)=(veer) already exists.") and often in
// `message` too, so this is a reliable way to tell that case apart from any
// other unique-constraint conflict.
function isUsernameKeyConflict(error) {
  const text = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  return text.includes("username_key");
}

// Get-or-create. Two things this guards against:
//
// 1. A genuine race: two requests try to create the same (case-insensitive)
//    username at once. Whoever loses gets a 23505 on username_key -- we just
//    fetch the row the winner created.
//
// 2. A *device_id* conflict, not a username one. This app is meant to let
//    several people share one browser/device, each under their own
//    username (see schema.sql) -- but if a database is still running the
//    schema from before migration_002_username_identity.sql was applied,
//    `device_id` may still carry a leftover UNIQUE constraint (and, as it
//    turns out, NOT NULL too) from the old device-based identity model.
//    Since every player created from the same browser sends the same
//    `deviceId` (see api.js getDeviceId), that old UNIQUE constraint makes
//    *every* second player on that device fail to insert, every time -- not
//    a rare race. Retrying with `device_id: null` isn't safe either if the
//    column is also NOT NULL. So on a non-username 23505 we retry with a
//    synthetic value instead: `${deviceId}::${username}` -- unique per
//    (device, username) pair, so it satisfies both a legacy UNIQUE and a
//    legacy NOT NULL at once, without ever colliding with another player's
//    row. It's only a breadcrumb field, never used for identity, so this
//    placeholder has no effect on gameplay.
//    Run migration_002_username_identity.sql on the database to remove the
//    old constraints properly and avoid relying on this fallback.
async function getOrCreatePlayer({ username, gender, deviceId }) {
  const stored = username.slice(0, 24);

  let player = await getPlayerByUsername(stored);
  if (player) {
    if (deviceId) {
      // best-effort breadcrumb of last device used, not used for identity —
      // never let a failure here (e.g. that same legacy constraint) block
      // returning the player.
      await supabase
        .from("players")
        .update({ device_id: deviceId })
        .eq("id", player.id)
        .then(null, () => {});
    }
    return player;
  }

  if (!gender || !["male", "female"].includes(gender)) {
    const err = new Error("gender ('male' | 'female') is required for a new player");
    err.status = 400;
    throw err;
  }

  const insertRow = { username: stored, gender, device_id: deviceId || null };
  let { data, error } = await supabase.from("players").insert(insertRow).select().single();

  if (error && error.code === "23505" && !isUsernameKeyConflict(error)) {
    // Not a username collision -- almost certainly the legacy device_id
    // constraint(s). Retry with a synthetic, always-non-null, per-username
    // value instead of the raw shared deviceId.
    const placeholderDeviceId = `${deviceId || "device"}::${stored.toLowerCase()}`;
    ({ data, error } = await supabase
      .from("players")
      .insert({ ...insertRow, device_id: placeholderDeviceId })
      .select()
      .single());
  }

  if (!error) return data;

  if (error.code === "23505") {
    // Real username race (or the retry above still lost a username race)
    // -- the winning row should already be committed.
    player = await getPlayerByUsername(stored);
    if (player) return player;
  }

  throw error.code ? error : new Error("player was not created or found");
}

app.post("/api/player", async (req, res) => {
  try {
    const { username, gender, deviceId } = req.body || {};
    const trimmed = String(username || "").trim();
    if (trimmed.length < 2) return res.status(400).json({ error: "username must be at least 2 characters" });

    const player = await getOrCreatePlayer({ username: trimmed, gender, deviceId });

    res.json(publicPlayer(player));
  } catch (e) {
    console.error(e);
    res.status(e.status || 500).json({ error: e.message || "server error" });
  }
});

// Combined create-or-get-player + today's-puzzle in one round trip -- what
// the "Start reading" button calls. Doing this as two separate requests
// (POST /api/player then GET /api/puzzle/today) meant the button sat there
// for two sequential network round trips before the app could move on;
// this cuts it to one.
app.post("/api/onboard", async (req, res) => {
  try {
    const { username, gender, deviceId } = req.body || {};
    const trimmed = String(username || "").trim();
    if (trimmed.length < 2) return res.status(400).json({ error: "username must be at least 2 characters" });

    const player = await getOrCreatePlayer({ username: trimmed, gender, deviceId });
    const puzzle = await buildTodayPuzzlePayload(player);

    res.json({ player: publicPlayer(player), puzzle });
  } catch (e) {
    console.error(e);
    res.status(e.status || 500).json({ error: e.message || "server error" });
  }
});

// Combined fetch-existing-player + today's-puzzle in one round trip -- used
// when re-entering as a previously-created reader (see resolveEntry in the
// frontend), for the same reason as /api/onboard above.
app.get("/api/enter", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "username is required" });
    const player = await getPlayerByUsername(username);
    if (!player) return res.status(404).json({ error: "player not found" });
    const puzzle = await buildTodayPuzzlePayload(player);
    res.json({ player: publicPlayer(player), puzzle });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "server error" });
  }
});

app.get("/api/player/:username", async (req, res) => {
  try {
    const player = await getPlayerByUsername(req.params.username);
    if (!player) return res.status(404).json({ error: "player not found" });
    res.json(publicPlayer(player));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "server error" });
  }
});

// Get today's puzzle. Never sends the verdict/explanation up front.
// Records a server-side start timestamp the first time it's fetched for the day, which
// anchors the 90-second limit so the timer can't just be restarted client-side.
app.get("/api/puzzle/today", async (req, res) => {
  try {
    const { username } = req.query;
    const player = username ? await getPlayerByUsername(username) : null;
    if (username && !player) return res.status(404).json({ error: "player not found" });

    res.json(await buildTodayPuzzlePayload(player));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "server error" });
  }
});

// Submit today's guess. Checked entirely server-side, including the timer.
// The UNIQUE(player_id, puzzle_id) constraint on `attempts` is the hard
// database-level guarantee of one guess per player per puzzle -- the insert
// itself fails (23505) on a second attempt, independent of any app logic.
app.post("/api/guess", async (req, res) => {
  try {
    const { username, answer } = req.body || {};
    if (!username || !["red", "green"].includes(answer)) {
      return res.status(400).json({ error: "username and answer ('red' | 'green') are required" });
    }
    const player = await getPlayerByUsername(username);
    if (!player) return res.status(404).json({ error: "player not found" });

    const today = todayStr();
    const puzzle = await getOrAssignDailyPuzzle(today);

    const existing = await getAttempt(player.id, puzzle.id);
    if (existing) {
      return res.status(409).json({
        error: "already played today",
        ...publicPlayer(player, resultPayload(puzzle, existing)),
      });
    }

    const startedAt = player.puzzle_state?.[today]?.startedAt ?? Date.now();
    const elapsed = Date.now() - startedAt;
    const timedOut = elapsed > TIME_LIMIT_MS + GRACE_MS;

    // The correct answer is the puzzle's own verdict for its target_person --
    // never derived from this player's gender.
    const correct = !timedOut && answer === puzzle.verdict;

    const { error: insertErr } = await supabase.from("attempts").insert({
      player_id: player.id,
      puzzle_id: puzzle.id,
      answer,
      correct,
    });
    if (insertErr) {
      if (insertErr.code === "23505") {
        // lost a race to a duplicate submission -- treat as already played
        const attempt = await getAttempt(player.id, puzzle.id);
        return res.status(409).json({
          error: "already played today",
          ...publicPlayer(player, resultPayload(puzzle, attempt)),
        });
      }
      throw insertErr;
    }

    const yPlayed = player.last_played_date === yesterdayStr();
    let nextStreak = player.current_streak;
    if (correct) {
      nextStreak = yPlayed || player.current_streak === 0 ? player.current_streak + 1 : 1;
    } else {
      nextStreak = 0;
    }
    const nextLongest = Math.max(player.longest_streak, nextStreak);

    const { data: updatedPlayer, error: updateErr } = await supabase
      .from("players")
      .update({
        current_streak: nextStreak,
        longest_streak: nextLongest,
        last_played_date: today,
      })
      .eq("id", player.id)
      .select()
      .single();
    if (updateErr) throw updateErr;

    res.json({
      correct,
      timedOut,
      correctAnswer: puzzle.verdict,
      explanation: puzzle.explanation,
      askingAbout: puzzle.target_person,
      ...publicPlayer(updatedPlayer),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "server error" });
  }
});

// Recent play history for the streak calendar popup -- one entry per day played,
// sourced directly from `attempts` (real history, not just last-played-date).
app.get("/api/player/:username/history", async (req, res) => {
  try {
    const days = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 35));
    const player = await getPlayerByUsername(req.params.username);
    if (!player) return res.status(404).json({ error: "player not found" });

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - days);

    const { data, error } = await supabase
      .from("attempts")
      .select("played_at, correct")
      .eq("player_id", player.id)
      .gte("played_at", since.toISOString())
      .order("played_at", { ascending: true });
    if (error) throw error;

    const byDate = {};
    for (const row of data || []) {
      const d = new Date(row.played_at).toISOString().slice(0, 10);
      byDate[d] = row.correct; // last attempt for a date wins (should only ever be one per day)
    }

    res.json({
      days: Object.entries(byDate).map(([date, correct]) => ({ date, correct })),
      currentStreak: player.current_streak,
      longestStreak: player.longest_streak,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "server error" });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`flagcheck backend listening on :${PORT}`));