// The backend runs on a free tier that spins down when idle, so the first
// request after a while can fail outright or come back 502/503/504 while it
// wakes up. Retry a couple times with a short delay before giving up — but
// only for those transient failures, not real application errors (400, 401,
// 404, etc.), which should surface immediately.
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

export async function fetchWithRetry(url, options = {}, { attempts = 3, delayMs = 4000 } = {}) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || !RETRYABLE_STATUSES.has(res.status) || attempt === attempts) return res;
    } catch (err) {
      if (attempt === attempts) throw err;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}
