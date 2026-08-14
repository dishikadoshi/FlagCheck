export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

const DEVICE_KEY = "flagcheck_device_id";

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
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

export function fetchPlayer(deviceId) {
  return request(`/api/player/${deviceId}`);
}

export function createPlayer({ deviceId, username, gender }) {
  return request(`/api/player`, {
    method: "POST",
    body: JSON.stringify({ deviceId, username, gender }),
  });
}

export function fetchTodayPuzzle(deviceId) {
  return request(`/api/puzzle/today?deviceId=${encodeURIComponent(deviceId)}`);
}

export function submitGuess({ deviceId, answer }) {
  return request(`/api/guess`, {
    method: "POST",
    body: JSON.stringify({ deviceId, answer }),
  });
}

export function updatePlayer(deviceId, { username, gender }) {
  return request(`/api/player/${deviceId}`, {
    method: "PATCH",
    body: JSON.stringify({ username, gender }),
  });
}

export function fetchHistory(deviceId, days = 35) {
  return request(`/api/player/${deviceId}/history?days=${days}`);
}
