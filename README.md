# Flag Check — daily "red flag or green flag" conversation game

A daily-puzzle game: every day everyone gets the same short, deliberately tricky text conversation
between two people. You're asked to judge one specific person's side of it — **which person is
fixed by the puzzle itself, never by your own gender** — red flag or green flag? 90 seconds, one
guess, checked entirely on the server. Get it right and your streak goes up; get it wrong, run out
of time, or miss a day, and it resets.

## Structure

```
backend/    Express API + Supabase (Postgres) — puzzle logic, streaks, and attempts live here
frontend/   Vite + React + Tailwind + Framer Motion
```

## Run it locally

**1. Set up Supabase**
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run `backend/schema.sql` — this creates `players`, `skills`,
   `puzzles`, `daily_puzzles`, and `attempts`, including the `UNIQUE(player_id, puzzle_id)`
   constraint on `attempts` that gives you hard database-level enforcement of "one guess per
   player per puzzle" (no more relying on app logic to catch a double-submit).
3. Grab your **Project URL** and **service_role key** from Project Settings → API.

**2. Backend** (defaults to port 8787):
```
cd backend
npm install
cp .env.example .env      # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
node seed.js               # loads the 50 puzzles from puzzles.js into the puzzles table
npm start                  # or: npm run dev  (auto-restarts on save)
```

**3. Frontend** (defaults to port 5173):
```
cd frontend
npm install
cp .env.example .env       # points VITE_API_URL at the backend; edit if you deploy the API elsewhere
npm run dev
```
Open the printed localhost URL. `npm run build` produces a static `dist/` you can host anywhere
(Vercel, Netlify, Cloudflare Pages, S3, etc.) — just set `VITE_API_URL` at build time to wherever
the backend ends up.

## Database model

```
players        id, device_id, username, gender, current_streak, longest_streak,
                last_played_date, puzzle_state (jsonb, anchors the 90s timer), created_at
skills         id, name, description
puzzles        id, slug, skill_id, title, difficulty, messages (jsonb),
                target_person, verdict, explanation, status, created_at
daily_puzzles  date (pk), puzzle_id
attempts       id, player_id, puzzle_id, answer, correct, played_at
               UNIQUE(player_id, puzzle_id)
```

`target_person` + `verdict` on `puzzles` are the single source of truth for the correct answer —
see "Gender-independent verdicts" below.

## How the rules are enforced server-side

- `GET /api/puzzle/today` sends the conversation only — never the verdict or explanation — and
  stamps a server-side `startedAt` the first time a player fetches it that day. The frontend's
  90-second ring reads that timestamp; it can't be reset by refreshing the page.
- `POST /api/guess` re-derives the correct answer from the day's puzzle's own `target_person` /
  `verdict`, ignores anything the client claims about correctness, and independently checks the
  elapsed time against the 90s limit (with a small network-latency grace period) before deciding
  whether the guess counts.
- A player can only submit once per puzzle — enforced by the `UNIQUE(player_id, puzzle_id)`
  constraint on `attempts`, not just an app-level date check. A duplicate insert fails at the
  database with a `23505` error, which the API turns into a `409` response.
- The streak logic (unchanged): correct + played yesterday → streak+1. Correct after a missed day
  → streak resets to 1. Wrong, timed out, or a missed day entirely → streak resets to 0 on the
  next play.

## Gender-independent verdicts

Every puzzle explicitly names **which** speaker is being judged (`target_person`: `"boy"` or
`"girl"` — these just label the two chat-bubble roles, not the player) and stores **one** correct
`verdict` for that person. The same puzzle and the same correct answer apply to every player, no
matter which gender they registered with — a man and a woman playing on the same day get the exact
same question and are held to the exact same answer. `askingAbout` in the API response — and the
"his side" / "her side" wording in the UI — always comes from the puzzle, never from the logged-in
player's own gender.

## The puzzle set

50 hand-written conversations in `backend/puzzles.js`, each tagged with a `skill` (communication,
boundaries, control, trust, respect, accountability, support), a difficulty, and the
`targetPerson` / `verdict` / `explanation` described above. Run `node seed.js` any time after
editing this file to push changes into Supabase — it upserts by `slug`, so it's safe to re-run.
The day's puzzle is picked deterministically from the calendar date and persisted into
`daily_puzzles` the first time it's requested, so it never changes mid-day even if the puzzle bank
is edited later that day.

## Player identity

No auth — a random device ID is generated with `crypto.randomUUID()` and stored in `localStorage`
on first visit. That ID maps to a row in `players`, so a streak persists across visits and browser
restarts on the same device. Use the pencil icon next to the streak badge to edit your display name
or gender at any time — the original onboarding screen isn't a one-way door.

## Deploying

- **Backend**: any Node host works (Render, Railway, Fly.io, a small VPS, or a serverless
  function) — there's no local file store to worry about anymore, all state lives in Supabase.
- **Frontend**: static hosting anywhere (Vercel/Netlify are the easy path) with `VITE_API_URL`
  pointed at the deployed backend, plus CORS already open on the API.
