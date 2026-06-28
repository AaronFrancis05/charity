/* ui-tokens.md — Design Token System
 *
 * Source of truth for all visual values in this project.
 * This block lives in src/app/globals.css under @import "tailwindcss".
 *
 * Rules:
 * - Never define colours in tailwind.config.ts
 * - Never use Tailwind built-in colour classes (bg-purple-500, text-gray-600)
 * - Never hardcode hex values inside component files
 * - Always reference tokens via CSS custom properties in Tailwind utility syntax:
 *   bg-[--color-accent], text-[--color-text-primary], rounded-[--radius-xl]
 */

@import "tailwindcss";

@theme {
  /* ─── Typography ─────────────────────────────────────────────── */
  --font-sans: "Inter", sans-serif;
  /* Applied to <html> in root layout via next/font/google className */

  /* ─── Page & Surface Backgrounds ────────────────────────────── */
  --color-background: #f6f7fb;
  /* Page canvas — used on <body> and outermost page wrappers */

  --color-surface: #ffffff;
  /* Cards, form inputs, navbar, modal backgrounds */

  --color-surface-secondary: #f9fafb;
  /* Table row hover, secondary info panels, empty state containers */

  --color-surface-tertiary: #f2f5f7;
  /* Deeply nested inner sections — used sparingly */

  /* ─── Borders ────────────────────────────────────────────────── */
  --color-border: #e7eaf3;
  /* Standard border for cards, inputs, table rows, dividers */

  --color-border-light: #e5e7eb;
  /* Lighter variant — used inside cards for inner section dividers */

  /* ─── Typography Colors ──────────────────────────────────────── */
  --color-text-primary: #101828;
  /* Headings (16px/600), body (14px/500), stat numbers (30px/600) */

  --color-text-secondary: #6a7282;
  /* Table column headers, secondary labels */

  --color-text-muted: #99a1af;
  /* Timestamps, region subtitles, input placeholders, empty state text */

  /* ─── Accent — Majestic Purple ───────────────────────────────── */
  --color-accent: #7c5cfc;
  /* Primary button background, active nav item color, focus ring */

  --color-accent-dark: #5e4cff;
  /* Primary button hover state */

  --color-accent-light: #f3e8ff;
  /* Card payment badge background */

  --color-accent-foreground: #ffffff;
  /* Text on accent-colored backgrounds */

  /* ─── Success ────────────────────────────────────────────────── */
  --color-success: #10b981;
  /* 80–100% funded progress bar fill, settled status badge background */

  --color-success-dark: #007a55;
  /* Success badge text when background is --color-success-lightest */

  --color-success-lightest: #ecfdf5;
  /* Trend badge background (financial dashboard positive indicators) */

  /* ─── Warning & Error ────────────────────────────────────────── */
  --color-warning: #ff8904;
  /* Below 60% funded progress bar fill, pending status badge */

  --color-error: #ef4444;
  /* Failed status badge, Airtel badge text, form error text */

  /* ─── Local Payment Network Colors ──────────────────────────── */
  --color-mtn-momo: #ffcc00;
  /* MTN MoMo brand — badge background */

  --color-mtn-momo-text: #b38f00;
  /* MTN MoMo badge text — dull gold for readability on yellow */

  --color-airtel-money: #ff0000;
  /* Airtel Money brand — used only for badge border/icon accents */

  --color-airtel-bg: #fff0f0;
  /* Airtel badge background — soft red tint */

  /* ─── Border Radii ───────────────────────────────────────────── */
  --radius-sm: 4px;
  /* Trend badges on financial cards only */

  --radius-md: 8px;
  /* Buttons, form inputs, dropdown menus */

  --radius-lg: 12px;
  /* Child profile photos and video containers */

  --radius-xl: 16px;
  /* All cards — the primary card radius */

  --radius-full: 9999px;
  /* Status badges, pill badges, progress bar track and fill */
}

/*
 * ─── Utility Notes ──────────────────────────────────────────────
 *
 * Tailwind v4 CSS variable utility syntax in components:
 *
 *   background  →  bg-[--color-surface]
 *   text        →  text-[--color-text-primary]
 *   border      →  border-[--color-border]
 *   radius      →  rounded-[--radius-xl]
 *   ring        →  ring-[--color-accent]
 *
 * Box shadow for cards (not tokenised — apply directly):
 *   shadow: 0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)
 *   Tailwind: shadow-sm  (closest approximation — verify visually)
 *
 * Progress bar fill color logic (applied conditionally in component):
 *   >= 80%  →  bg-[--color-success]    (#10b981 green)
 *   60–79%  →  bg-[#61A8FF]            (growth blue — no token, use inline)
 *   < 60%   →  bg-[--color-warning]    (#ff8904 orange)
 *
 * Note on growth blue (#61A8FF):
 * This value is used only for the 60–79% funding progress fill.
 * It is intentionally not tokenised because it is a single-use
 * conditional value computed at runtime. Apply it as bg-[#61A8FF]
 * only inside the DonationMeter component fill logic.
 */