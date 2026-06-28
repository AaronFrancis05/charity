import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Standard shadcn utility for merging Tailwind classes dynamically
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Hashes an IP address using SHA-256 to protect user privacy (GDPR
 * compliance) while allowing unique identification for rate limiting.
 *
 * FIX: return type corrected to Promise<string> — the function body was
 * already async, the annotation just didn't match (TS strict mode error).
 */
export async function hashIp(ip: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function computeAge(birthDateString: string | Date): number {
  const birthDate = new Date(birthDateString);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export function fundingPercent(current: number, target: number): number {
  if (!target || target <= 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(Math.round(percentage), 100);
}

/**
 * Funding tier used for progress bar fill color and tier badges.
 *
 * FIX: this previously returned "critical" | "moderate" | "stable", but
 * every consumer that already exists — ProgressBar's tierColors map,
 * ChildCard's tierBadge map, the dashboard's FundingTierBreakdown —
 * keys off "green" | "blue" | "orange" (matching --color-tier-green/
 * blue/orange in globals.css). The function body just needed to match
 * the contract the rest of the app already relies on.
 *
 * 80–100% → green · 60–79% → blue · below 60% → orange
 */
export type FundingTier = "green" | "blue" | "orange";

export function fundingTier(percent: number): FundingTier {
  if (percent >= 80) return "green";
  if (percent >= 60) return "blue";
  return "orange";
}

export function generateReceiptRef(): string {
  return `OHF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function formatUgx(amount: number): string {
  return `UGX ${Math.round(amount).toLocaleString("en-UG")}`;
}