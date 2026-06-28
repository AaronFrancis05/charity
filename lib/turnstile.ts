import "server-only";

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY!;
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Cloudflare Turnstile token server-side.
 * Returns true only if Cloudflare confirms success.
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  if (!token || token.trim() === "") {
    return false;
  }

  // Development bypass — the login form sends "dev-bypass" when
  // the Turnstile widget is not available (e.g. local dev).
  if (token === "dev-bypass") {
    return true;
  }

  if (!TURNSTILE_SECRET) {
    console.warn("TURNSTILE_SECRET_KEY not set — skipping Turnstile verification");
    return true;
  }

  try {
    const formData = new FormData();
    formData.append("secret", TURNSTILE_SECRET);
    formData.append("response", token);

    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) return false;

    const data = (await response.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
