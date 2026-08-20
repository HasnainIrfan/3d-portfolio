/**
 * Failed-login throttling, held in memory.
 *
 * The previous version wrote every attempt to an admin_login_attempts table.
 * That table is gone — this project has one table, for contact submissions —
 * so the counter lives in the process instead.
 *
 * The trade-off is honest: on a serverless host each instance keeps its own
 * counter, so an attacker spread across many cold starts gets more than
 * MAX_ATTEMPTS tries in total. It still stops the case that actually matters
 * for a one-account site — a script hammering a single warm instance — and it
 * costs no database round trip on the login path.
 */

/** Failed attempts allowed per key before sign-in is refused. */
const MAX_ATTEMPTS = 8;
/** Rolling window for that count, in milliseconds. */
const WINDOW_MS = 15 * 60 * 1000;
/** Cap on distinct tracked keys, so a spray of unique IPs cannot grow the map
 *  without bound. When full, the oldest entry is evicted. */
const MAX_KEYS = 5_000;

interface Bucket {
  failures: number;
  /** When the window began; the bucket resets once it is older than WINDOW_MS. */
  since: number;
}

const buckets = new Map<string, Bucket>();

const readBucket = (key: string, now: number): Bucket | null => {
  const bucket = buckets.get(key);
  if (!bucket) return null;
  if (now - bucket.since > WINDOW_MS) {
    buckets.delete(key);
    return null;
  }
  return bucket;
};

/**
 * True when this IP has burned through its attempts.
 *
 * Only the IP is tracked. With a single fixed admin address there is nothing to
 * gain from also keying on the submitted email — every real attempt uses the
 * same one, so an email counter would only let an attacker lock the real admin
 * out by guessing their address.
 */
export const isLoginThrottled = (ip: string | null): boolean => {
  if (!ip) return false;
  const bucket = readBucket(ip, Date.now());
  return bucket !== null && bucket.failures >= MAX_ATTEMPTS;
};

export const recordFailedLogin = (ip: string | null): void => {
  if (!ip) return;
  const now = Date.now();
  const bucket = readBucket(ip, now);

  if (bucket) {
    bucket.failures += 1;
    return;
  }

  if (buckets.size >= MAX_KEYS) {
    // Map iterates in insertion order, so the first key is the oldest.
    const oldest = buckets.keys().next().value;
    if (oldest !== undefined) buckets.delete(oldest);
  }
  buckets.set(ip, { failures: 1, since: now });
};

/** Clears the counter after a correct password, so one bad day of typos does
 *  not leave the admin throttled once they get in. */
export const clearLoginAttempts = (ip: string | null): void => {
  if (ip) buckets.delete(ip);
};
