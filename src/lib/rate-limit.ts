const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

const store = new Map<string, { count: number; firstAttempt: number }>();

export function checkRateLimit(ip: string, email: string): boolean {
  const key = `${ip}:${email.toLowerCase()}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    store.set(key, { count: 1, firstAttempt: now });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export function resetRateLimit(ip: string, email: string): void {
  store.delete(`${ip}:${email.toLowerCase()}`);
}

// Purge stale entries every 15 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now - entry.firstAttempt > WINDOW_MS) store.delete(key);
    }
  }, WINDOW_MS);
}
