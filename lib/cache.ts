import "server-only";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL!;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN!;

function isConfigured(): boolean {
  return !!UPSTASH_URL && !!UPSTASH_TOKEN;
}

async function restCommand(command: string, ...args: string[]): Promise<unknown> {
  const response = await fetch(`${UPSTASH_URL}/${command}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  if (!response.ok) return null;
  const json = await response.json() as { result: unknown };
  return json.result;
}

/**
 * Caches a value in Upstash Redis with a TTL.
 * Falls back to executing the fetch function if Redis is unavailable.
 */
export async function cacheGet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  if (!isConfigured()) return fetchFn();

  try {
    const cached = await restCommand("get", key);
    if (cached !== null) {
      return JSON.parse(cached as string) as T;
    }
  } catch {
    return fetchFn();
  }

  const value = await fetchFn();

  try {
    await fetch(`${UPSTASH_URL}/set`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([key, JSON.stringify(value), "EX", String(ttlSeconds)]),
    });
  } catch {
    // Cache write failure — value is still returned
  }

  return value;
}

/**
 * Invalidates a cache key.
 */
export async function cacheInvalidate(pattern: string): Promise<void> {
  if (!isConfigured()) return;
  try {
    const keysResponse = await fetch(`${UPSTASH_URL}/keys`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([pattern]),
    });
    if (!keysResponse.ok) return;
    const { result: keys } = await keysResponse.json() as { result: string[] };
    if (!keys || keys.length === 0) return;
    await fetch(`${UPSTASH_URL}/del`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(keys),
    });
  } catch {
    // Silent fail
  }
}
