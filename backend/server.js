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

function publicPlayer(p, resultToday) {
  if (!p) return null;
  const today = todayStr();
  const playedToday = p.last_played_date === today;
  return {
    deviceId: p.device_id,
    username: p.username,
    gender: p.gender,
    streak: p.current_streak,
    longestStreak: p.longest_streak,
    lastPlayedDate: p.last_played_date,
    playedToday,
    resultToday: playedToday ? resultToday || null : null,
  };
}

async function getPlayerByDeviceId(deviceId) {
  const { data, error } = await supabase.from("players").select("*").eq("device_id", deviceId).maybeSingle();
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

// ---- routes ----

// Create or fetch a player by device id. If the player doesn't exist yet, username+gender are required.
app.post("/api/player", async (req, res) => {
  try {
    const { deviceId, username, gender } = req.body || {};
    if (!deviceId) return res.status(400).json({ error: "deviceId is required" });

    let player = await getPlayerByDeviceId(deviceId);
    if (!player) {
      if (!username || !gender || !["male", "female"].includes(gender)) {
        return res
          .status(400)
          .json({ error: "username and gender ('male' | 'female') are required for a new player" });
      }
      const { data, error } = await supabase
        .from("players")
        .insert({ device_id: deviceId, username: String(username).slice(0, 24), gender })
        .select()
        .single();
      if (error) throw error;
      player = data;
    }
    res.json(publicPlayer(player));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/api/player/:deviceId", async (req, res) => {
  try {
    const player = await getPlayerByDeviceId(req.params.deviceId);
    if (!player) return res.status(404).json({ error: "player not found" });
    res.json(publicPlayer(player));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// Edit an existing player's profile (username and/or gender). Lets the
// frontend offer a "not you? edit profile" affordance instead of being
// permanently locked into whatever was typed during onboarding.
app.patch("/api/player/:deviceId", async (req, res) => {
  try {
    const { username, gender } = req.body || {};
    const player = await getPlayerByDeviceId(req.params.deviceId);
    if (!player) return res.status(404).json({ error: "player not found" });

    const patch = {};
    if (username !== undefined) {
      const trimmed = String(username).trim();
      if (trimmed.length < 2) return res.status(400).json({ error: "username must be at least 2 characters" });
      patch.username = trimmed.slice(0, 24);
    }
    if (gender !== undefined) {
      if (!["male", "female"].includes(gender)) return res.status(400).json({ error: "invalid gender" });
      patch.gender = gender;
    }
    if (Object.keys(patch).length === 0) return res.status(400).json({ error: "nothing to update" });

    const { data, error } = await supabase
      .from("players")
      .update(patch)
      .eq("device_id", req.params.deviceId)
      .select()
      .single();
    if (error) throw error;
    res.json(publicPlayer(data));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// Get today's puzzle. Never sends the verdict/explanation up front.
// Records a server-side start timestamp the first time it's fetched for the day, which
// anchors the 90-second limit so the timer can't just be restarted client-side.
app.get("/api/puzzle/today", async (req, res) => {
  try {
    const { deviceId } = req.query;
    const player = deviceId ? await getPlayerByDeviceId(deviceId) : null;
    if (deviceId && !player) return res.status(404).json({ error: "player not found" });

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

    res.json({
      date: today,
      ...toClientPuzzle(puzzle),
      timeLimitMs: TIME_LIMIT_MS,
      startedAt,
      alreadyPlayed,
      resultToday,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// Submit today's guess. Checked entirely server-side, including the timer.
// The UNIQUE(player_id, puzzle_id) constraint on `attempts` is the hard
// database-level guarantee of one guess per player per puzzle -- the insert
// itself fails (23505) on a second attempt, independent of any app logic.
app.post("/api/guess", async (req, res) => {
  try {
    const { deviceId, answer } = req.body || {};
    if (!deviceId || !["red", "green"].includes(answer)) {
      return res.status(400).json({ error: "deviceId and answer ('red' | 'green') are required" });
    }
    const player = await getPlayerByDeviceId(deviceId);
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
    res.status(500).json({ error: "server error" });
  }
});

// Recent play history for the streak calendar popup -- one entry per day played,
// sourced directly from `attempts` (real history, not just last-played-date).
app.get("/api/player/:deviceId/history", async (req, res) => {
  try {
    const days = Math.min(90, Math.max(7, parseInt(req.query.days, 10) || 35));
    const player = await getPlayerByDeviceId(req.params.deviceId);
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
    res.status(500).json({ error: "server error" });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => console.log(`flagcheck backend listening on :${PORT}`));
