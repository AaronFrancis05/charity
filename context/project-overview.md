# Project Overview — Open Hearts Foundation Child Sponsorship Platform

A zero-leak, maximum-security Child Profiling and Sponsorship Platform connecting vulnerable children in Uganda with international card donors and local Ugandan mobile money contributors. Every architectural decision prioritises child safety, data integrity, and financial transparency.

**Payment provider: Flutterwave** — handles card (Visa, Mastercard, Apple Pay) and Mobile Money (MTN MoMo, Airtel) on a single provider. No Stripe. No split between providers at the API level.

---

## Who This System Serves

### Administrators
Internal staff who manage child profiles, monitor donations, and oversee the platform. No public sign-ups. Admins are provisioned manually by a super-admin. Two roles: `super_admin` (full access) and `content_admin` (profile management only, no financial data).

### International Donors
People outside Uganda who discover children through the public sponsorship directory and contribute via Flutterwave using Visa, Mastercard, or Apple Pay.

### Local Ugandan Contributors
People inside Uganda who donate via MTN Mobile Money (MoMo) or Airtel Money directly in UGX. Both flows are handled by Flutterwave and verified via webhook.

---

## Core Feature Areas

### 1. Admin Security & Content Management (CMS)

**Protected Administrative Panel**
- Zero public access. The `/admin` path is protected by Next.js middleware that reads a custom base64 session cookie (set by `actions/auth.ts`) and verifies it before allowing access.
- Admin sign-in uses email + password. No OAuth. No magic links. Credentials verified against bcrypt hashes in the `admins` InsForge collection.
- Failed login attempts rate-limited: 5 per 15 minutes per IP via Upstash Redis.

**Child Profile Management**
- Each child profile contains: full name, date of birth, region, profile photo, optional video, biographical narrative, and a **single combined monthly sponsorship goal in UGX** (`goal_monthly_ugx`).
- Donations are NOT earmarked to specific needs (food, shelter, education). Every settled contribution counts toward the child's one combined goal.
- Admins can create, edit, deactivate, and reactivate profiles. Soft-delete only — records are never permanently removed.
- Image and video uploads go to InsForge Storage (`child-images` / `child-videos` buckets). Paths are converted to public URLs before saving to DB.

**Funding Goal Structure**
Each child has ONE `goal_monthly_ugx` figure. Total raised is computed by summing all `settled` donations in `donations_ledger` for that child. The funding progress bar reflects `(total raised / goal_monthly_ugx) * 100`. No per-category breakdown exists anywhere in the system.

**Financial Audit Ledger**
- `super_admin` only — `content_admin` is redirected to dashboard.
- Shows every donation: amount (UGX or USD), provider (FLUTTERWAVE / MTN_MOMO / AIRTEL_MONEY), status, receipt reference, date.
- CSV export available.

---

### 2. Public Landing Page (`/`)

The landing page introduces the mission and children — not financial mechanics.

**Rules for this page (already implemented — do not change):**
- No `DonationMeter` or funding percentages on featured child cards
- No payment provider badges
- Child story cards are the largest visual element
- Stat strip (children supported, communities reached, etc.) is a quiet single row
- CTAs use relational language: "Walk with [Name]" — never "Sponsor now" or "Donate"
- Routes visitors into `/sponsor` once they are ready to browse

---

### 3. Public Sponsorship Directory (`/sponsor`)

- Responsive card grid (4 cols desktop / 2 tablet / 1 mobile)
- `ChildCard` component: profile photo, name, region badge, ONE funding meter, "Sponsor" CTA
- Filter by region, sort by most urgent (lowest funding %) and newest
- Pagination: 12 per page
- Funding percentage computed server-side: `sum(settled donations) / goal_monthly_ugx`

---

### 4. Individual Child Profile Page (`/sponsor/[id]`)

- Hero image (or `ChildVideoCard` if `video_url` exists)
- Full biographical narrative
- One `DonationMeter`: total raised vs `goal_monthly_ugx`
- Donor count (unique emails in settled records — no names shown)
- "Sponsor This Child" CTA → `/sponsor/[id]/donate`
- Returns 404 if `is_active = false` or not found

---

### 5. Donation Flow (`/sponsor/[id]/donate`)

**Two-step flow:**

Step 1 — Enter amount and contact:
- Amount (UGX, min 5,000)
- Donor name
- Donor email
- No category selection

Step 2 — Select payment method:
- `PaymentSelector`: Card (FLUTTERWAVE), MTN MoMo (MTN_MOMO), Airtel (AIRTEL_MONEY)
- Cloudflare Turnstile challenge before submit

On submit:
1. `initiateDonation()` Server Action validates, rate-limits, creates `initiated` ledger record
2. Calls `createFlutterwavePayment()` → gets a single Flutterwave-hosted checkout URL
3. Updates ledger to `pending`
4. Redirects donor to Flutterwave checkout URL
5. Fires `donation_initiated` PostHog event

---

### 6. Payment Settlement (Flutterwave Webhook)

**Endpoint**: `POST /api/webhooks/flutterwave`

1. Read raw body BEFORE JSON parse
2. Verify `verif-hash` header (HMAC-SHA256 with `FLUTTERWAVE_WEBHOOK_SECRET`)
3. HTTP 400 on failure — no DB operations
4. On `charge.completed` with `status: successful`:
   - `settleDonation({ providerReference: tx_ref })` — updates ledger to `settled`, sets `webhook_verified_at` and `receipt_reference`
   - `sendDonorConfirmation()` via Resend
   - Fires `donation_settled` PostHog event
5. On `charge.completed` with `status: failed`:
   - `markDonationFailed(tx_ref)` — updates ledger to `failed`
   - Fires `donation_failed` PostHog event
6. Returns HTTP 200 immediately — always

Idempotent: if ledger row is already `settled`, skip all operations.

---

### 7. Transaction States

```
initiated → pending → settled
                    → failed
                    → refunded
```

- `initiated`: ledger row created by Server Action
- `pending`: Flutterwave checkout link created, donor redirected
- `settled`: webhook with valid signature confirms payment — ONLY path to settled
- `failed`: webhook reports failure, OR Flutterwave times out
- `refunded`: manual admin action (not in automated flow)

**No client code may write `settled` status.**

---

### 8. Notification Pipeline

**Donor confirmation email** (Resend):
- Triggered from webhook handler after `settled` update
- Subject: `Your sponsorship for [Child Name] is confirmed`
- Contains: child name, amount (UGX), receipt reference, thank-you message
- Always includes plain-text fallback
- Failure is logged but never crashes the webhook

---

## What This System Never Does

- Never allows public user registration
- Never exposes individual donor names in the public interface
- Never allows client code to update financial records
- Never auto-plays audio in video cards
- Never shows raw error messages, stack traces, or DB exceptions to public users
- Never stores API keys, secrets, or credentials in source code
- Never shows per-category funding splits (food / shelter / education)
- Never uses Stripe or any payment provider other than Flutterwave
- Never shows payment provider badges, funding percentages, or transactional CTA language on the public landing page (`/`)

---

## PostHog Events — Frozen List

```typescript
donation_initiated   // { childId, currency: "UGX" | "USD", provider: "FLUTTERWAVE" | "MTN_MOMO" | "AIRTEL_MONEY" }
donation_settled     // { childId, amountUgx, amountUsd, provider, receiptReference }
donation_failed      // { childId, provider, errorCode }
profile_created      // { adminId, childId, initialGoal: number }  ← single goal value
profile_updated      // { adminId, childId, fieldsChanged: string[] }
admin_login_success  // { adminId, role }
admin_login_failed   // { ipHash, attemptCount }
```

These are the only 7 events. Do not add more.
