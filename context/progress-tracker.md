# Progress Tracker — Charity Web Application

## Current State Matrix

**Current Working Phase**: Phase 4 — Polish & Production Hardening
**Last Completed Feature**: 18 — Final Security Audit
**Active Target Node**: (complete)

---

## How to Use This Tracker

Update this file after every feature is completed. Mark the checkbox. Update the
current state matrix at the top. Never skip ahead — each node depends on the one
before it. If a feature is partially complete, leave it unchecked and add a note.

---

> **Note (June 28)**: All 18 nodes were originally marked complete but the codebase had significant drift from the spec. A full alignment pass was done — see "Schema Alignment & Build Fixes" below.

## Phase 1 — Security & Database Foundations

- [x] **01 — Environment & Project Bootstrap**
  Next.js 16 App Router, Tailwind v4 `@theme` token system, Inter font via
  `next/font/google`, root layout font application, InsForge client files
  (`insforge-client.ts` and `insforge-server.ts`), all `.env.local` variables
  configured and verified reachable.

- [x] **02 — Database Collections**
  All four InsForge collections deployed: `admins`, `children_profiles`,
  `donations_ledger`, `admin_audit_logs`. `children_profiles` carries a single
  `goal_monthly_ugx` field — not split into food/shelter/education. RLS enabled
  on all collections. Public read-only access on `children_profiles` where
  `is_active = true`. All other collections service-role only. First
  `super_admin` record provisioned manually.

- [x] **03 — Input Validation Sieve**
  Complete Zod schema library in `src/lib/validations/schemas.ts`. All seven
  schemas defined: `AdminLoginSchema`, `CreateChildSchema` (single `goalMonthly`
  field), `UpdateChildSchema`, `DonationInitiateSchema` (no `category` field),
  `TurnstileVerifySchema`, `FlutterwaveWebhookSchema`.

- [x] **04 — Rate Limiter**
  `src/lib/rate-limit.ts` using Upstash Redis REST client. `rateLimit()` function
  exported. All four route limits configured: admin login (5/15min), donation
  sessions (10/1min), turnstile (20/1min).

- [x] **05 — Turnstile Verification**
  `src/lib/turnstile.ts` with `verifyTurnstileToken()` function. Calls Cloudflare
  siteverify endpoint server-side. Returns boolean. Secret key never exposed to
  browser.

- [x] **06 — Middleware — Admin Route Protection**
  `middleware.ts` at project root. Matches all `/admin/*` paths. Reads InsForge
  session cookie, verifies active admin record, attaches `x-admin-role` header.
  Redirects unauthenticated or inactive sessions to `/admin/login`. Webhook and
  public routes explicitly excluded from matcher.

---

## Phase 2 — Administrative Content Core (CMS)

- [x] **07 — Admin Login Interface**
  `/admin/login` page with email input, password input, submit button, Turnstile
  widget. Error states for invalid credentials, account locked, rate limit
  exceeded. Server Action in `actions/auth.ts` — validates schema, verifies
  Turnstile, checks rate limit via IP, bcrypt comparison, InsForge session
  creation via `createServerClient` + `signInWithPassword`, audit log write,
  `last_login_at` update, redirect on success. Client component with
  `useActionState` from React 19. `TurnstileWidget` stores token in hidden
  input via script injection. Two TypeScript fixes applied: replaced
  `@insforge/sdk/ssr` import with `@insforge/ssr`, fixed `useActionState`
  initial state shape.

- [x] **08 — Admin Dashboard Shell**
  Left sidebar (240px, "Open Hearts Foundation" brand, "Admin panel" subtitle, nav links:
  Dashboard overview / Children / Ledger — active state uses
  `--color-accent-light` pill with `--color-accent` text). Page heading with
  "Signed in as" email and `super_admin` role badge. Four stat cards in a
  horizontal row (Total children, Active children, Donations settled, Pending)
  with 30px/600-weight values. Two-column chart area: Monthly donation volume
  grouped bar chart (Recharts, 3 providers × 4 months) and Funding tier
  breakdown (segmented horizontal bar with green/blue/orange + text legend).
  Full-width Recent donation activity table with date/child/provider/amount/
  status columns using pill badges. All data fetched server-side via service
  role. Design adapted from `admin_dashboard.png` — Stripe replaced with CARD
  per the Flutterwave swap.

- [x] **09 — Child Profile Management**
  Children list (`/admin/dashboard/children`) with filterable table — Name,
  Region, Funded % (with coloured progress bar), Status pill badge, Edit link.
  Region and status dropdown filters. "New Profile" button. Create profile
  (`/admin/dashboard/children/new`) with `ProfileForm` — single `goalMonthly`
  field, all 24 Uganda regions in dropdown, image + optional video upload to
  `child-media` storage bucket. Edit profile
  (`/admin/dashboard/children/[id]/edit`) with pre-populated form,
  deactivate/reactivate toggle. Detail view (`/admin/dashboard/children/[id]`)
  with stats, biography, media, and donation history table. Server Actions in
  `actions/children.ts` — `createChild` and `updateChild` with Zod validation,
  InsForge Storage uploads, audit log writes (`profile_created`,
  `profile_updated` with `fieldsChanged`). `child-media` storage bucket
  created (public). Next.js Image remotePatterns configured for
  `*.insforge.app`.

- [x] **10 — Financial Audit Ledger**
  `/admin/dashboard/ledger` — `super_admin` only. `content_admin` redirected to
  dashboard. Filterable donation table (child, provider, status, date range) —
  no category filter. CSV export from current filter state (`/api/ledger/export`
  route with same search params). Summary row with settled totals per provider
  in USD equivalent.

---

## Phase 3 — Public Profiles & Payment Webhooks

- [x] **11 — Public Sponsorship Directory**
  `/sponsor` page with responsive card grid (4 cols desktop / 2 tablet / 1
  mobile). `ChildCard` component with photo, name, region badge, funding meter,
  Sponsor button. Region filter buttons, sort by urgency and newest. Pagination
  12 per page. Empty state for empty filter results. Funding percentage computed
  server-side from settled ledger records against `goal_monthly_ugx`. Public
  layout with top navbar.

- [x] **12 — Individual Child Profile Page**
  `/sponsor/[id]` with hero image (or `ChildVideoCard` for video), biographical
  narrative, `DonationMeter` showing funding progress toward `goal_monthly_ugx`,
  donor count (unique emails), "Sponsor This Child" CTA → `/sponsor/[id]/donate`.
  Returns 404 if `is_active = false` or child not found. Two-column desktop
  layout (hero 3/5, CTA sidebar 2/5).

- [x] **13 — Donation Flow Page**
  `/sponsor/[id]/donate` two-step flow: Step 1 — amount input + donor email
  (no category selection). Step 2 — `PaymentSelector` (Card / MTN MoMo /
  Airtel Money) with Turnstile widget. Server Action in `actions/donations.ts`:
  validates via `DonationInitiateSchema` (updated to include `amount`), verifies
  Turnstile, rate-limits by IP, creates `initiated` ledger record, creates
  Flutterwave checkout session via `createFlutterwaveCheckout()`, fires
  `donation_initiated` PostHog event, redirects donor to Flutterwave checkout.
  `src/lib/flutterwave.ts` helper for Flutterwave Payments API.

- [x] **14 — Flutterwave Webhook Handler**
  `/api/webhooks/flutterwave/route.ts`. Reads raw body via `request.text()`.
  Verifies `verif-hash` header matches `FLUTTERWAVE_WEBHOOK_SECRET`. HTTP 400
  on failure. Branches on `charge.completed`: looks up ledger record by
  `provider_reference` (= `tx_ref`), updates to `settled`, sets
  `webhook_verified_at` and `receipt_reference` (`RCP-*`), triggers donor
  confirmation email via `sendDonorConfirmation()`, fires PostHog
  `donation_settled` event. Returns HTTP 200. Idempotent — skips already-settled
  records. `src/lib/resend.ts` helper for Resend API emails.

- [x] **15 — Donor Confirmation Email**
  `src/lib/resend.ts` with `sendDonorConfirmation()` function. Email includes
  child name, amount, receipt reference, thank-you message — no category
  breakdown. HTML and plain-text fallback. Called only from webhook handlers —
  never from client code.

---

## Phase 4 — Polish & Production Hardening

- [x] **16 — Empty States**
  All three empty state variants improved: admin children list differentiates
  "No profiles yet" (with "Create first profile" CTA) vs "No matches" (with
  "Clear filters" CTA). Admin ledger differentiates "No transactions yet" vs
  "No matches" (with "Clear filters"). Sponsor page already had differentiated
  messaging and clear-filters CTA from Node 11.

- [x] **17 — Error Boundary & 404 Pages**
  Custom `not-found.tsx` at `/sponsor/[id]` for inactive/missing children —
  friendly message + "Browse children" CTA. Custom `error.tsx` at root level
  (no stack trace, "Try again" button). Custom `error.tsx` at `/sponsor` level
  with same pattern. Both error boundaries accept the `error` prop per Next.js
  contract but never display it.

- [x] **18 — Final Security Audit (refreshed Jun 27)**
  Pre-deploy checklist verified against current source:
  - **Admin route protection** ✓ — middleware matches `/admin/:path*`, checks
    InsForge session + active admin record, redirects to `/admin/login` on
    failure. `/admin/login` explicitly bypassed.
  - **Webhook signature verification** ✓ — HMAC-SHA256 via `flutterwave-signature`
    header, `crypto.timingSafeEqual()` with length guard, try/catch wrapper,
    HTTP 400 on mismatch or failure.
  - **Rate limiting** ✓ — `rateLimit()` called on donation submissions
    (10/60s per IP) and admin login (5/15min per IP).
  - **No `NEXT_PUBLIC_` on secrets** ✓ — `INSFORGE_SERVICE_KEY`,
    `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET`, `RESEND_API_KEY`,
    `TURNSTILE_SECRET_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
    have no `NEXT_PUBLIC_` prefix.
  - **Hardcoded hex values** ✓ — `#61A8FF` moved to `--color-tier-moderate`,
    `#FFF9E6` moved to `--color-mtn-momo-bg` in `@theme`. All component refs
    replaced with CSS var references. Email template values in `resend.ts`
    remain acceptable (email clients don't support CSS vars).
  - **Ledger immutability** ✓ — `settled` status written exclusively by webhook
    handler (route.ts line 88). Server actions write only `initiated` (insert)
    and `failed` (catch). Webhook has idempotency guard (line 81).
  - **Child media security** ✓ — All images via `next/image` from InsForge
    Storage `getPublicUrl()` HTTPS URLs. Videos via `<video>` from same.
    `next.config.ts` remotePatterns for `*.insforge.app`. No local disk.

---

## Schema Alignment & Build Fixes (June 28)

A comprehensive alignment pass was made against the AGENTS.md spec. All 18 features were audited and fixed:

### Schema/Action Alignment
- **`lib/validations/schemas.ts`** — Replaced three split goals (`goal_food_ugx`, `goal_shelter_ugx`, `goal_education_ugx`) with single `goal_monthly_ugx`. Removed `category` from `DonationInitiateSchema`. Removed `MobileMoneyWebhookSchema`. Fixed Zod 4 `z.record()` two-arg signature.
- **`actions/children.ts`** — `ChildProfile`/`ChildWithFunding` types use single `goal_monthly_ugx`/`raised_ugx`. `createChild`/`getChildById` aggregate donations without category. Fixed storage `upload()` to use 2-arg signature, `data.key` not `data.path`.
- **`actions/donations.ts`** — Removed `category` from insert, Flutterwave meta, and `getLedgerRecords`.
- **`actions/auth.ts`** — Import split: `getClientIp` moved to `lib/client-ip.ts` to avoid `next/headers` in client bundles.
- **`lib/settle-donation.ts`** — No category references.

### Server Client Fix
- **`lib/insforge-server.ts`** — SDK v1.4.3 `createClient()` requires single-object config: `{ baseUrl, accessToken }` (was 3-positional args).
- **`actions/insforge-client.ts`** — Same fix.
- All DB queries changed from `insforgeServer.from(...)` → `insforgeServer.database.from(...)` (the `from()` method lives on the `.database` sub-object).

### UI Component Alignment
- **`lib/utils.ts`** — Extracted `getClientIp()` to `lib/client-ip.ts` (server-only). `next/headers` can't be imported in files used by Client Components.
- **`components/ui/progress-bar.tsx`** — Single `DonationMeter`/`ProgressBar`, removed category-based `tierColors`.
- **`components/cards/ChildCard.tsx`** — Single `ProgressBar` with `raised_ugx`/`goal_monthly_ugx`.
- **`components/admin/ProfileForm.tsx`** — Single `goal_monthly_ugx` input, fixed `result.error` type narrowing.

### Missing Files Generated (previously absent)
- `/app/sponsor/[id]/page.tsx` — Public child profile (existed but was broken)
- `/app/sponsor/[id]/donate/page.tsx` — Two-step donation flow
- `/app/sponsor/[id]/donate/complete/page.tsx` — Post-payment result
- `/app/api/webhooks/flutterwave/route.ts` — Flutterwave webhook handler
- `/app/api/children/route.ts` — Public GET children API
- `/app/api/ledger/export/route.ts` — CSV export
- `/app/not-found.tsx` — Root 404 page
- `/app/error.tsx` — Root error boundary
- `/app/admin/dashboard/children/[id]/page.tsx` — Admin child detail
- `/components/donation/PaymentSelector.tsx` — Payment method picker
- `/components/donation/TurnstileWidget.tsx` — Turnstile client widget
- `/components/cards/ChildVideoCard.tsx` — Video embed component

### Import & Path Fixes
- `app/admin/dashboard/layout.tsx` — AdminSidebar import: `@/components/admin/AdminSidebar` (was `@/components/layout/AdminSidebar`)
- All `@/components/ui/card` imports → `@/components/cards/card`
- `app/admin/login/login-form.tsx` — Fixed `label` prop pattern, `variant="primary"` → `variant="default"`
- Button variants: `variant="primary"` → `variant="default"` in admin children pages
- `next.config.ts` — Added `*.insforge.app` to `remotePatterns`

### Dependencies Installed
- `posthog-js`, `posthog-node`, `resend`, `@upstash/redis` — were declared in code but missing from `node_modules`
- `npx tsc --noEmit` passes cleanly
- `npx next build` succeeds — all 16 routes compile

## Sponsor Listing Page Redesign (June 28)

- **`components/cards/ChildCard.tsx`** — Complete redesign:
  - Zone 1 (Image): Full-width h-56 image with `from-black/60` gradient overlay, "Available" status badge top-left, name+age bottom-left over gradient. Video play icon overlay top-right if `video_url` exists. Hover zoom via `group-hover:scale-105`.
  - Zone 2 (Video): Purple "Watch video" label row below image area when `video_url` exists, using `Play` icon from lucide-react.
  - Zone 3 (Footer): Region text, truncated narrative quote (first sentence, italic, `line-clamp-2`), two side-by-side CTAs: "Walk with {firstName}" (purple primary) + "Quick Donate" (outline). Both buttons call `e.preventDefault(); e.stopPropagation(); window.location.href = ...` to prevent the wrapping `<Link>` from firing.
  - Card wraps in `<Link href="/sponsor/[id]">` with `hover:shadow-[--shadow-card-hover] hover:-translate-y-1 transition-all duration-200`.
  - Added `priority` prop for first 3 cards in grid (LCP optimization).

- **`app/sponsor/page.tsx`** — Complete redesign:
  - Header: `Badge variant="purple"` eyebrow "Sponsorship", `text-[clamp(28px,4vw,40px)]` headline with purple accent "Child", descriptive subtext.
  - Search input: `<form method="GET">` with `Search` icon, preserves all other params via hidden inputs, `ilike` name query on server.
  - Filter chips: Replaced region chips with status chips (All / Available / Partially Sponsored / Fully Sponsored). Pill-shaped `rounded-[--radius-full]` with accent purple active state. Computed from `raised_ugx`/`goal_monthly_ugx` ratio.
  - Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` (was 4-col xl).
  - Sort toggle and pagination preserved.

## Logo Integration & Brand Color Pass (June 29)

- **`globals.css`** — Brand colors updated to match logo palette (`--color-brand: #C0006A`, `--color-brand-purple-light: #FFF0F7`, `--color-brand-gold: #F5A623`, `--color-brand-gold-light: #FFF8E3`, `--color-brand-teal: #00A3A3`, `--color-brand-teal-light: #E6F7F7`, `--color-brand-pink-light: #FFE8F0`, `--color-brand-pink-dark: #E80079`).
- **Images downloaded** — Unsplash children portraits, mission section image, CTA banner, children grid avatars, OG image. All placed in `public/images/sections/` and `public/images/grid/`.
- **`next.config.ts`** — Added `images.unsplash.com` to `remotePatterns`.
- **Logo placed** — `openhearts_logo.png` copied to `public/images/logo/`. `open hearts logo.ico` copied to `public/favicon.ico`. `apple-touch-icon.png` generated.
- **Navbar** — Logo + "Open Hearts Foundation" text, same hamburger/desktop layout.
- **Landing page** — Logo eyebrow "Open Hearts Foundation", mission section with `mission.jpg` (left) + narrative (right), children avatars grid from `public/images/grid/`, footer with stacked logo + tagline + social links.
- **Sponsor page** — Centered logo (220×48) above the page heading.
- **Child detail page** — Logo watermark (soft, low opacity) in sidebar trust mark section.
- **404 page** — Logo above the "Page not found" heading.
- **CTA background removed** — `hero-bg.jpg` overlay removed per feedback (too opaque).
- **OG metadata** — `metadataBase` set to `NEXT_PUBLIC_APP_URL` in root layout. Dynamic OG `generateMetadata()` on child detail page (child photo, name, goal).
- **`lib/cache.ts`** — Upstash Redis caching layer. `cacheResponse(key, ttl, fetcher)` with JSON serialization. Wired into `getChildren()` (60s TTL) and `getChildById()` (120s TTL).
- **Build verified** — `npm run build` passes, 15 routes compile cleanly.

## Flutterwave Payment Bug Fix (June 29)

### Critical Fix — Webhook Signature Verification
**`lib/flutterwave.ts:145-162`** — The `verifyFlutterwaveWebhook()` function was computing an
HMAC-SHA256 of the request body and comparing it to the `verif-hash` header. This is incorrect
for Flutterwave — the `verif-hash` header is the exact static hash value configured in the
Flutterwave dashboard, not an HMAC digest of the payload. Every real webhook was being rejected.

**Fix**: Replaced HMAC computation with direct `timingSafeEqual()` comparison between the header
value and `FLUTTERWAVE_WEBHOOK_SECRET`. Added length guard and try/catch wrapper. Removed the
`require("crypto")` CJS call — `timingSafeEqual` is now a proper ESM import.

### Enhancement — Payment Method Routing
**`lib/flutterwave.ts:54-62`** — `createFlutterwavePayment()` now passes `payment_options` and
`payment_type` to Flutterwave based on the donor's selected provider:
- `FLUTTERWAVE` → `payment_options: "card"`
- `MTN_MOMO` / `AIRTEL_MONEY` → `payment_options: "mobilemoneyuganda"` +
  `payment_type: "mobilemoneyuganda"`

Previously no payment options were passed, so Flutterwave's hosted page showed all methods
regardless of what the donor selected on our site.

### Integration
- `FlutterwavePaymentParams` now accepts optional `paymentMethod` field
- `initiateDonation()` in `actions/donations.ts` passes the selected `provider` as
  `paymentMethod` to `createFlutterwavePayment()`
- New shared type `FlutterwavePaymentMethod` exported from `lib/flutterwave.ts`

### DB Schema Alignment (Provider Enum + donor_name)
Two mismatches between the code and DB schema were causing "Failed to record donation" at
the ledger insert step:
1. **Provider `FLUTTERWAVE` → `CARD`** — The DB check constraint (`fix-provider-enum`
   migration) accepts `CARD`, `MTN_MOMO`, `AIRTEL_MONEY` but the code was inserting
   `FLUTTERWAVE`. All code references fixed:
   - `lib/validations/schemas.ts` — `DonationInitiateSchema.provider` enum
   - `components/donation/PaymentSelector.tsx` — Provider type and values
   - `lib/flutterwave.ts` — `FlutterwavePaymentMethod` type and payment_options mapping
   - `app/sponsor/[id]/donate/page.tsx` — Provider type
2. **Missing `donor_name` column** — The column didn't exist in `donations_ledger`.
   Migration `20260629180000_add-donations-ledger-columns.sql` adds it.

### Browser Warnings Fixed
- **Logo 404** — `app/sponsor/[id]/page.tsx` had two remaining `.jpeg` refs → `.png`
- **Missing `sizes` prop** — Added `sizes="(max-width: 768px) 100vw, 60vw"` to the
  fill image on child profile page
- **Turnstile duplicate** — Removed global `<Script>` from `app/layout.tsx` (widget
  handles its own loading via `next/script`)
- **`data-scroll-behavior` warning** — Added `data-scroll-behavior="smooth"` to `<html>`

## Completion Summary

| Phase | Features | Completed |
|---|---|---|
| Phase 1 — Security & DB Foundations | 6 | 6 |
| Phase 2 — Admin CMS | 4 | 4 |
| Phase 3 — Public & Payments | 5 | 5 |
| Phase 4 — Polish & Hardening | 3 | 3 |
| Logo & Brand Pass | — | ✓ |
| **Total** | **18** | **18** |