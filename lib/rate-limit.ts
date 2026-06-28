import "server-only";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL!;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

interface RateLimitResult {
  success: boolean;
  retryAfter?: number;
  remaining?: number;
}

/**
 * Token bucket rate limiter via Upstash Redis REST API.
 * @param identifier - unique key (e.g. IP address)
 * @param limit - max requests allowed
 * @param windowSeconds - time window in seconds
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    // In development without Redis, always allow
    console.warn("Upstash Redis not configured — rate limiting disabled");
    return { success: true, remaining: limit };
  }

  const key = `rl:${identifier}`;

  try {
    // Use INCR + EXPIRE via Upstash pipeline
    const pipeline = [
      ["INCR", key],
      ["TTL", key],
    ];

    const response = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
    });

    if (!response.ok) {
      // Fail open — don't block users if Redis is down
      return { success: true, remaining: limit };
    }

    const results = await response.json() as Array<{ result: number }>;
    const count = results[0].result;
    const ttl = results[1].result;

    // Set expiry on first request
    if (count === 1) {
      await fetch(`${UPSTASH_URL}/expire/${key}/${windowSeconds}`, {
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      });
    }

    if (count > limit) {
      return {
        success: false,
        retryAfter: ttl > 0 ? ttl : windowSeconds,
        remaining: 0,
      };
    }

    return { success: true, remaining: limit - count };
  } catch {
    // Fail open
    return { success: true, remaining: limit };
  }
}
