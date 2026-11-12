// Lightweight analytics stored in this browser's localStorage.
// Every event looks like:
//   { type, productId, colour, timestamp, sessionId }
// A "session" lasts as long as the browser tab (sessionStorage), which is
// how insights.html compares visitors who used AR with those who didn't.

const STORAGE_KEY = 'roomi_events';
const SESSION_KEY = 'roomi_session';

export const EVENT_TYPES = ['product_view', 'ar_opened', 'colour_changed', 'add_to_basket'];

function makeId() {
  // crypto.randomUUID only exists on HTTPS / localhost, so fall back on plain http.
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = makeId();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'no-session-storage';
  }
}

export function getEvents() {
  try {
    const events = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(events) ? events : [];
  } catch {
    return [];
  }
}

export function saveEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Storage full or blocked (e.g. some private modes): tracking is best-effort.
  }
}

export function trackEvent(type, { productId, colour = null } = {}) {
  if (!EVENT_TYPES.includes(type)) {
    console.warn(`Unknown tracking event "${type}"`);
    return;
  }
  const events = getEvents();
  events.push({
    type,
    productId,
    colour,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  });
  saveEvents(events);
}

export function clearEvents() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
