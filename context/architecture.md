# Architecture — Open Hearts Foundation Child Sponsorship Platform

## Core Technology Stack

| Layer | Tool | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | Full-stack framework — Strict Server Components |
| Auth + DB + Storage | InsForge Engine (`@insforge/sdk`) | Entire backend authority — database, session auth, file storage |
| Payment | Flutterwave (REST — no SDK) | Single provider for card (Visa, Mastercard, Apple Pay) and Mobile Money (MTN MoMo, Airtel) — one checkout link per transaction |
| Email | Resend (`resend`) | Donor confirmation emails only — called from webhook handlers |
| Validation | Zod | All inbound payloads validated before any DB call |
| Rate Limiting | Upstash Redis (REST fetch — no `@upstash/redis` SDK) | Token bucket rate limiting on all public API routes |
| Anti-Bot | Cloudflare Turnstile | Challenge on admin login and donation initiation |
| Styling | Tailwind CSS v4 | Token-driven system via `@theme` in `globals.css` |
| Typography | Geist + Inter via `next/font/google` | Applied to `<html>` in root layout |
| Analytics | PostHog (`posthog-js` browser, `posthog-node` server) | 7 approved events only — see `code-standards.md` |

---

## Folder Structure

```
├── context/
│   ├── project-overview.md
│   ├── architecture.md           ← this file
│   ├── build-plan.md
│   ├── library-docs.md
│   ├── ui-rules.md
│   ├── ui-tokens.md
│   ├── ui-registry.md
│   ├── code-standards.md
│   └── progress-tracker.md
├── app/
│   ├── layout.tsx                ← root layout, font vars, globals.css
│   ├── page.tsx                  ← public landing page (COMPLETE)
│   ├── not-found.tsx             ← root 404
│   ├── error.tsx                 ← root error boundary ("use client")
│   ├── api/
│   │   ├── children/
│   │   │   └── route.ts          ← public GET active children (rate limited)
│   │   ├── ledger/
│   │   │   └── export/route.ts   ← super_admin CSV export
│   │   ├── turnstile/
│   │   │   └── route.ts          ← Turnstile verify proxy (rate limited)
│   │   └── webhooks/
│   │       └── flutterwave/
│   │           └── route.ts      ← Flutterwave webhook handler
│   ├── admin/
│   │   ├── login/
│   │   │   ├── page.tsx          ← login page (COMPLETE)
│   │   │   └── login-form.tsx    ← client login form (COMPLETE)
│   │   └── dashboard/
│   │       ├── layout.tsx        ← admin shell with sidebar (COMPLETE)
│   │       ├── page.tsx          ← dashboard overview (COMPLETE)
│   │       ├── children/
│   │       │   ├── page.tsx      ← children list table (COMPLETE)
│   │       │   ├── new/
│   │       │   │   └── page.tsx  ← create profile (COMPLETE)
│   │       │   └── [id]/
│   │       │       ├── page.tsx  ← child detail (MISSING)
│   │       │       └── edit/
│   │       │           └── page.tsx ← edit profile (COMPLETE)
│   │       └── ledger/
│   │           └── page.tsx      ← financial ledger (COMPLETE)
│   └── sponsor/
│       ├── page.tsx              ← public child directory (COMPLETE)
│       └── [id]/
│           ├── page.tsx          ← individual child profile (MISSING)
│           ├── donate/
│           │   └── page.tsx      ← donation flow (MISSING)
│           └── complete/
│               └── page.tsx      ← post-payment landing (MISSING)
├── actions/
│   ├── auth.ts                   ← adminLogin, adminLogout, getAdminSession (COMPLETE)
│   ├── children.ts               ← NEEDS SCHEMA ALIGNMENT (goal_monthly_ugx)
│   └── donations.ts              ← NEEDS SCHEMA ALIGNMENT (no category)
├── components/
│   ├── ui/
│   │   ├── badge.tsx             ← Badge, StatusBadge, ProviderBadge (COMPLETE)
│   │   ├── button.tsx            ← Button with loading state (COMPLETE)
│   │   ├── card.tsx              ← Card, CardHeader (COMPLETE)
│   │   ├── input.tsx             ← Input (COMPLETE)
│   │   ├── progress-bar.tsx      ← ProgressBar, DonationMeter — NEEDS ALIGNMENT
│   │   ├── select.tsx            ← Select, SelectTrigger, etc. (COMPLETE)
│   │   └── textarea.tsx          ← Textarea (COMPLETE)
│   ├── cards/
│   │   ├── ChildCard.tsx         ← NEEDS ALIGNMENT (single funding meter)
│   │   └── ChildVideoCard.tsx    ← (MISSING)
│   ├── admin/
│   │   ├── ProfileForm.tsx       ← NEEDS ALIGNMENT (goal_monthly_ugx field)
│   │   ├── LedgerTable.tsx       ← (MISSING)
│   │   └── StatsPanel.tsx        ← (MISSING)
│   ├── donation/
│   │   ├── PaymentSelector.tsx   ← (MISSING)
│   │   └── TurnstileWidget.tsx   ← (MISSING)
│   └── layout/
│       ├── Navbar.tsx            ← (COMPLETE)
│       └── AdminSidebar.tsx      ← (COMPLETE)
├── lib/
│   ├── validations/
│   │   └── schemas.ts            ← NEEDS ALIGNMENT (goal_monthly_ugx, no category)
│   ├── insforge-client.ts        ← browser client (COMPLETE)
│   ├── insforge-server.ts        ← server service-role client (COMPLETE)
│   ├── flutterwave.ts            ← createFlutterwavePayment, verify (COMPLETE)
│   ├── resend.ts                 ← sendDonorConfirmation (COMPLETE)
│   ├── settle-donation.ts        ← settleDonation, markDonationFailed (COMPLETE)
│   ├── turnstile.ts              ← verifyTurnstileToken (COMPLETE)
│   ├── rate-limit.ts             ← rateLimit (COMPLETE)
│   └── utils.ts                  ← cn, computeAge, fundingPercent, fundingTier, etc. (COMPLETE)
├── proxy.ts                      ← next.js request proxy / middleware (COMPLETE)
└── .env.local                    ← all vars set — do not change nameslocal                               ← all vars set — do not change names
```

---

## Database Collections (InsForge)

### `admins`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| email | text | Unique — used for login |
| password_hash | text | bcrypt hash — never stored plain |
| role | enum | `super_admin` \| `content_admin` |
| created_at | timestamptz | Auto |
| last_login_at | timestamptz | Updated on successful login |
| is_active | boolean | Super-admin can deactivate accounts |

### `children_profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | Full name |
| date_of_birth | date | Used to compute age via `computeAge()` in `utils.ts` |
| region | text | Ugandan district — enum: Kampala, Gulu, Jinja, Mbale, Mbarara, Other |
| narrative | text | Biographical content |
| profile_image_url | text | InsForge Storage public URL |
| video_url | text \| null | Optional — InsForge Storage public URL |
| **goal_monthly_ugx** | integer | **Single combined monthly goal in UGX** — not split by category |
| is_active | boolean | `false` = hidden from public directory |
| created_by | uuid | FK → admins.id |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

> **Critical**: There are NO `goal_food_ugx`, `goal_shelter_ugx`, or `goal_education_ugx` columns. Any existing code referencing these must be rewritten to use `goal_monthly_ugx`.

### `donations_ledger`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| child_id | uuid | FK → children_profiles.id |
| provider | enum | `FLUTTERWAVE` \| `MTN_MOMO` \| `AIRTEL_MONEY` |
| amount_ugx | numeric \| null | Primary currency — UGX for all transactions |
| amount_usd | numeric \| null | Set for card transactions if available |
| donor_email | text | Collected at donation initiation |
| donor_name | text \| null | Collected at donation initiation |
| status | enum | `initiated` \| `pending` \| `settled` \| `failed` \| `refunded` |
| provider_reference | text | Flutterwave `tx_ref` |
| webhook_verified_at | timestamptz \| null | Set when webhook signature is verified |
| receipt_reference | text \| null | Unique ref sent to donor in confirmation email |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto |

> **Critical**: There is NO `category` column. Donations are not earmarked. Every settled donation counts toward the child's `goal_monthly_ugx`.

### `admin_audit_logs`
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| admin_id | uuid \| null | FK → admins.id. Null for unauthenticated events |
| event_type | text | `login_success`, `login_failed`, `profile_created`, `profile_updated` |
| target_id | uuid \| null | ID of affected child profile or donation record |
| ip_hash | text \| null | SHA-256 hash of IP — for failed login tracking |
| metadata | jsonb \| null | Structured context |
| created_at | timestamptz | Auto |

---

## Middleware — Route Protection

`middleware.ts` (already implemented — do not change):

- Matches all `/admin/*` paths except `/admin/login`
- Reads `admin_session` cookie (base64-encoded JSON session payload)
- Decodes and validates session age (8-hour expiry)
- If invalid or expired → redirects to `/admin/login` and deletes the cookie
- Attaches `x-admin-id`, `x-admin-role`, `x-admin-email` headers for downstream Server Components
- Public and webhook routes explicitly excluded from matcher

---

## Authentication Flow

The auth system uses a **custom base64 session cookie** — NOT InsForge's built-in auth.getUser().

```
Login POST → actions/auth.ts:adminLogin()
  → validates schema + Turnstile + rate limit
  → bcrypt.compare(password, hash from admins table)
  → creates base64(JSON({ adminId, role, email, iat })) cookie named "admin_session"
  → logs to admin_audit_logs
  → redirect("/admin/dashboard")

Middleware on every /admin/* request
  → reads "admin_session" cookie
  → atob() decode → JSON.parse → checks iat age
  → attaches x-admin-* headers
  → NextResponse.next() or redirect("/admin/login")

Server Components read session via
  → actions/auth.ts:getAdminSession() — reads cookie, validates age, returns typed session
```

Do not change this auth mechanism. It is working and intentional.

---

## Payment Flow (Flutterwave)

```
Donor on /sponsor/[id]/donate
  Step 1: enters amount (UGX) + name + email
  Step 2: selects provider (Card / MTN MoMo / Airtel) + passes Turnstile

  → actions/donations.ts:initiateDonation()
      → validates DonationInitiateSchema
      → verifies Turnstile token
      → rate limits by IP
      → inserts donations_ledger row (status: "initiated")
      → calls lib/flutterwave.ts:createFlutterwavePayment()
      → updates ledger to status: "pending"
      → redirect(paymentLink) → donor goes to Flutterwave

Flutterwave completes payment → sends webhook to /api/webhooks/flutterwave
  → reads raw body (request.text())
  → verifies verif-hash header (HMAC-SHA256 with FLUTTERWAVE_WEBHOOK_SECRET)
  → HTTP 400 on failure
  → parses JSON, checks event === "charge.completed"
  → calls lib/settle-donation.ts:settleDonation({ providerReference: tx_ref })
      → looks up ledger row by provider_reference
      → updates to status: "settled", sets webhook_verified_at, receipt_reference
      → calls lib/resend.ts:sendDonorConfirmation()
      → fires PostHog donation_settled event
  → returns HTTP 200

Donor lands on /sponsor/[id]/donate/complete?tx_ref={txRef}
  → reads ledger status by tx_ref
  → shows "Payment received — confirmation email sent" (pending → settled via webhook)
  → shows "Payment failed" if status is "failed"
  → never claims "settled" — webhook confirms asynchronously
```

---

## System Boundary Invariants

1. **No client-side financial writes** — `donations_ledger` status updates happen only in the webhook handler
2. **Webhook signature first** — HMAC-SHA256 verification before any DB operation
3. **Zod before DB** — every inbound payload validated before any DB call
4. **Soft delete only** — `is_active = false` for profiles; ledger rows never deleted
5. **Rate limit on all public routes** — breach returns HTTP 429 with `Retry-After`
6. **No secrets in browser** — `NEXT_PUBLIC_` prefix only on non-secret vars
7. **InsForge server client is service-role** — bypasses RLS; never expose to browser
8. **Idempotent webhook** — duplicate delivery of the same tx_ref is a no-op

---

## Environment Variables

| Variable | Context | Notes |
|---|---|---|
| `NEXT_PUBLIC_INSFORGE_URL` | Browser + Server | InsForge project URL |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Browser + Server | InsForge anon key |
| `INSFORGE_SERVICE_KEY` | Server only | Service role key — bypasses RLS |
| `FLUTTERWAVE_SECRET_KEY` | Server only | Flutterwave API secret |
| `FLUTTERWAVE_WEBHOOK_SECRET` | Server only | Flutterwave webhook signature secret |
| `RESEND_API_KEY` | Server only | Resend email API key |
| `TURNSTILE_SECRET_KEY` | Server only | Cloudflare Turnstile server secret |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Browser only | Cloudflare Turnstile widget key |
| `UPSTASH_REDIS_REST_URL` | Server only | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Server only | Upstash Redis REST token |
| `NEXT_PUBLIC_POSTHOG_KEY` | Browser + Server | PostHog project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | Browser + Server | PostHog host URL |
| `NEXT_PUBLIC_APP_URL` | Browser + Server | Base URL for Flutterwave redirect URLs |
