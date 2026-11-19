const store = globalThis.__throttleStore ?? (globalThis.__throttleStore = new Map());

function prune(now) {
  if (store.size < 5000) return;
  for (const [key, value] of store) {
    if (value.resetAt <= now) store.delete(key);
  }
}

/** Count one event for `key`. */
export function hit(key, { limit, windowMs }) {
  const now = Date.now();
  prune(now);
  let entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }
  entry.count += 1;
  return {
    allowed: entry.count <= limit,
    retryAfter: Math.ceil((entry.resetAt - now) / 1000),
  };
}

export function isBlocked(key, limit) {
  const entry = store.get(key);
  return !!entry && entry.resetAt > Date.now() && entry.count >= limit;
}

export function clear(key) {
  store.delete(key);
}