export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

const LAST_USERNAME_KEY = "flagcheck_last_username";
const DEVICE_KEY = "flagcheck_device_id"; // sent to the server only as a breadcrumb, never used for identity

export function getStoredUsername() {
  return localStorage.getItem(LAST_USERNAME_KEY) || "";
}
export function setStoredUsername(username) {
  if (username) localStorage.setItem(LAST_USERNAME_KEY, username);
}
export function clearStoredUsername() {
  localStorage.removeItem(LAST_USERNAME_KEY);
}

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function fetchPlayer(username) {
  return request(`/api/player/${encodeURIComponent(username)}`);
}

// Same username (case-insensitive) always resolves to the same player and
// their existing streak; a different username is always a different player.
export function createPlayer({ username, gender }) {
  return request(`/api/player`, {
    method: "POST",
    body: JSON.stringify({ username, gender, deviceId: getDeviceId() }),
  });
}

// Create-or-get the player AND fetch today's puzzle in one request, instead
// of createPlayer() + fetchTodayPuzzle() as two sequential round trips.
// Returns { player, puzzle }. This is what "Start reading" calls.
export function onboardPlayer({ username, gender }) {
  return request(`/api/onboard`, {
    method: "POST",
    body: JSON.stringify({ username, gender, deviceId: getDeviceId() }),
  });
}

// Fetch an existing player AND today's puzzle in one request, instead of
// fetchPlayer() + fetchTodayPuzzle() as two sequential round trips. Returns
// { player, puzzle }. Used when re-entering as a previously-created reader.
export function enterAsPlayer(username) {
  return request(`/api/enter?username=${encodeURIComponent(username)}`);
}

export function fetchTodayPuzzle(username) {
  return request(`/api/puzzle/today?username=${encodeURIComponent(username)}`);
}

export function submitGuess({ username, answer }) {
  return request(`/api/guess`, {
    method: "POST",
    body: JSON.stringify({ username, answer }),
  });
}

export function fetchHistory(username, days = 35) {
  return request(`/api/player/${encodeURIComponent(username)}/history?days=${days}`);
}