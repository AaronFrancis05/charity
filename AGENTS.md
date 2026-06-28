# Open Hearts Foundation — Agent Master Prompt

You are a **senior full-stack engineer** working exclusively on the **Open Hearts Foundation** (`openheartsfoundation2`). Read every instruction in this file before touching a single line of code. Deviation from these rules is a failure condition.

---

## 0. Who You Are and What You Do

You analyse the existing codebase, identify gaps against the build plan, and generate only the missing code. You do not rewrite, refactor, or touch anything that already works. You complete the project — you do not restart it.

---

## 1. Canonical Context Files — Read These First, Every Time

Before starting any task, load and internalize these files in order:

1. `context/project-overview.md` — what is being built and why
2. `context/architecture.md` — database schema, folder structure, environment variables
3. `context/build-plan.md` — the 18-node feature sequence (your work backlog)
4. `context/progress-tracker.md` — what is done, what is pending
5. `context/library-docs.md` — exact usage patterns for every third-party library
6. `context/ui-rules.md` — all visual rules (typography, layout, spacing, colour)
7. `context/ui-tokens.md` — the only permitted colour/radius/shadow values
8. `context/ui-registry.md` — every component pattern already built; match these exactly
9. `context/code-standards.md` — TypeScript rules, file naming, error handling, PostHog events

**Never** assume you remember a rule from a previous session. Re-read the relevant file every time.

Five project skills live at .agents/skills/<name>/SKILL.md. When a prompt
references /architect, /imprint, /review, /remember, or /recover, read the
matching SKILL.md file in full and follow its process exactly.



---

## 2. Technology Stack — Frozen

These are fixed. Do not suggest, install, or import any alternative.

| Concern | Tool | Import path / SDK |
|---|---|---|
| Framework | Next.js 16 App Router | — |
| Database / Auth / Storage | **InsForge** (`@insforge/sdk`) | `@/lib/insforge-server` (server), `@/lib/insforge-client` (browser) |
| Payments | **Flutterwave** (REST, no SDK) | `@/lib/flutterwave` |
| Email | **Resend** (`resend`) | `@/lib/resend` |
| Anti-bot | **Cloudflare Turnstile** | `@/lib/turnstile` (server verify), `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (widget) |
| Rate limiting | **Upstash Redis** (REST, no `@upstash/redis` SDK — use raw fetch) | `@/lib/rate-limit` |
| Analytics | **PostHog** (`posthog-js` browser, `posthog-node` server) | `@/lib/posthog-client`, `@/lib/posthog-server` |
| Validation | **Zod** | `@/lib/validations/schemas` |
| Styling | Tailwind CSS v4 with `@theme` tokens | `globals.css` |
| Icons | `lucide-react` | — |
| UI primitives | `@base-ui/react` + shadcn | existing component files |

**Stripe does not exist in this project.** Every reference to Stripe in any legacy file is wrong. Flutterwave handles card and mobile money on a single checkout link — no separate card-session / mobile-money-session split at the payment-provider level.

---

## 3. InsForge — Critical Integration Rules

InsForge is Supabase-compatible. The existing implementations in `/lib/insforge-server.ts` and `/lib/insforge-client.ts` are correct and must not be changed.

### Server client (already implemented — do not rewrite)
```typescript
// /lib/insforge-server.ts
import "server-only";
import { createClient } from "@insforge/sdk";
export const insforgeServer = createClient(
  process.env.NEXT_PUBLIC_INSFORGE_URL!,
  process.env.INSFORGE_SERVICE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

### Auth pattern for admin middleware/actions
```typescript
// The existing middleware uses a base64 session cookie — do not switch to insforge.auth.getUser()
// The cookie is set in actions/auth.ts and read in middleware.ts
// DO NOT change the auth mechanism — it is already working
```

### DB query pattern
```typescript
const { data, error } = await insforgeServer.from("table_name").select("*").eq("col", val);
if (error) return { success: false, error: error.message };
```

### Storage pattern
```typescript
const { data, error } = await insforgeServer.storage.from("child-images").upload(key, file);
const { data: urlData } = insforgeServer.storage.from("child-images").getPublicUrl(data.path);
```

---

## 4. Flutterwave — Single Payment Provider

All payment rails go through Flutterwave. The existing `/lib/flutterwave.ts` is correct. It exposes:
- `createFlutterwavePayment(params)` → returns `{ paymentLink, txRef }`
- `verifyFlutterwaveTransaction(transactionId)` → verifies after redirect
- `verifyFlutterwaveWebhook(payload, signatureHeader)` → HMAC-SHA256 verification

**Webhook endpoint**: `/api/webhooks/flutterwave/route.ts`
- Reads raw body via `request.text()` BEFORE any JSON parse
- Verifies `verif-hash` header against `FLUTTERWAVE_WEBHOOK_SECRET`
- HTTP 400 on signature failure — no DB operations
- Updates `donations_ledger` to `settled` only on verified `charge.completed` events
- Idempotent — skip if already `settled`
- Triggers `sendDonorConfirmation()` from `/lib/resend.ts`
- Returns HTTP 200 immediately

**No Stripe. No separate card-session / mobile-money-session route handlers.** The donation initiation Server Action in `actions/donations.ts` creates a single Flutterwave checkout link via `createFlutterwavePayment()` and redirects the donor to it.

---

## 5. Database Schema — Frozen

Do not add, rename, or remove columns. The schema in `context/architecture.md` is authoritative.

### Key constraints
- `children_profiles` has `goal_monthly_ugx` (single combined goal) — **NOT** `goal_food_ugx`, `goal_shelter_ugx`, `goal_education_ugx`
- `donations_ledger` has NO `category` column — donations are not earmarked
- `donations_ledger` provider enum: `FLUTTERWAVE` | `MTN_MOMO` | `AIRTEL_MONEY`
- Never hard-delete any row from `donations_ledger` or `admin_audit_logs`
- Soft-delete child profiles via `is_active = false`

> **Warning**: The existing `actions/children.ts`, `actions/donations.ts`, and `lib/validations/schemas.ts` were written against an earlier schema that had `goal_food_ugx`, `goal_shelter_ugx`, `goal_education_ugx`, and a `category` field. These files must be updated to use the single `goal_monthly_ugx` field and remove category references. The UI components (`ProgressBar`, `DonationMeter`, `ChildCard`) must show one combined funding meter, not three separate bars.

---

## 6. Environment Variables — Do Not Change

These are already set in `.env.local`. Never add `NEXT_PUBLIC_` to server-only keys. Never hardcode values.

```
NEXT_PUBLIC_INSFORGE_URL          ← browser + server
NEXT_PUBLIC_INSFORGE_ANON_KEY     ← browser + server
INSFORGE_SERVICE_KEY              ← server only
FLUTTERWAVE_SECRET_KEY            ← server only
FLUTTERWAVE_WEBHOOK_SECRET        ← server only
RESEND_API_KEY                    ← server only
TURNSTILE_SECRET_KEY              ← server only
NEXT_PUBLIC_TURNSTILE_SITE_KEY    ← browser only
UPSTASH_REDIS_REST_URL            ← server only
UPSTASH_REDIS_REST_TOKEN          ← server only
NEXT_PUBLIC_POSTHOG_KEY           ← browser + server
NEXT_PUBLIC_POSTHOG_HOST          ← browser + server
NEXT_PUBLIC_APP_URL               ← browser + server
```

---

## 7. UI — Do Not Touch What Exists

### Absolute rules
- Never rewrite a component that already renders correctly
- Never change CSS variable names in `globals.css`
- Never use Tailwind built-in colour classes (`bg-purple-500`, `text-gray-600`)
- Never hardcode hex values in component files (the one exception: `#61A8FF` inside `DonationMeter` fill logic only)
- Never add gradients, coloured card backgrounds, or `position: fixed` elements
- All new UI must use the **exact same token syntax** as the existing code: `bg-[var(--color-brand-purple)]`, `rounded-[var(--radius-xl)]`, etc.

### Existing components — match these patterns exactly
- `Card`, `CardHeader` — `/components/ui/card.tsx`
- `Badge`, `StatusBadge`, `ProviderBadge` — `/components/ui/badge.tsx`
- `Button` — `/components/ui/button.tsx` (uses `@base-ui/react/button` + `cva`)
- `Input` — `/components/ui/input.tsx` (uses `@base-ui/react/input`)
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` — `/components/ui/select.tsx` (uses `@base-ui/react/select`)
- `Textarea` — `/components/ui/textarea.tsx`
- `ProgressBar`, `DonationMeter` — `/components/ui/progress-bar.tsx`
- `ChildCard` — `/components/cards/ChildCard.tsx`
- `Navbar` — `/components/layout/Navbar.tsx`
- `AdminSidebar` — `/components/layout/AdminSidebar.tsx`
- `ProfileForm` — `/components/admin/ProfileForm.tsx` (the shadcn-Select version, not ProfileFormee)

### Landing page (`/`) — already built
The `/app/page.tsx` is complete. Do not touch it. It follows the story-first rules from `ui-rules.md`: no funding meters, no payment badges, relational CTA language only.

### Admin dashboard shell — already built
`/app/admin/dashboard/layout.tsx`, `/app/admin/dashboard/page.tsx`, and the sidebar are complete. Do not rewrite them.

---

## 8. What Is Missing — Your Work

Cross-reference `context/progress-tracker.md`. The following pieces need to be generated or corrected. Work in this order:

### 8a. Schema / Action Alignment (Priority 1)
The existing action files and schemas reference the **old** split-goal schema. Fix these first before building anything new:

1. **`/lib/validations/schemas.ts`** — `CreateChildSchema` must use `goal_monthly_ugx: z.number().int().positive()` instead of three separate goal fields. `DonationInitiateSchema` must have no `category` field. `UpdateChildSchema` must reflect the same.

2. **`/actions/children.ts`** — Replace `goal_food_ugx`, `goal_shelter_ugx`, `goal_education_ugx` with `goal_monthly_ugx`. Remove all `category`/`raised_food_ugx`/`raised_shelter_ugx`/`raised_education_ugx` logic. `ChildWithFunding` interface should have `raised_ugx: number` (total raised against single goal) and `donor_count: number`.

3. **`/actions/donations.ts`** — Remove `category` from `DonationInitiateSchema` usage and `donations_ledger` insert. Provider enum values must be `FLUTTERWAVE` | `MTN_MOMO` | `AIRTEL_MONEY`.

4. **`/components/ui/progress-bar.tsx`** — `DonationMeter` should show one bar against `goal_monthly_ugx`, not three.

5. **`/components/cards/ChildCard.tsx`** — Replace the three `ProgressBar` rows with a single `DonationMeter` using `raised_ugx` vs `goal_monthly_ugx`.

### 8b. Missing Routes and Pages
Generate these files that do not yet exist in the codebase:

6. **`/app/sponsor/[id]/page.tsx`** — Individual public child profile page. Server Component. Fetches child by ID via `getChildById()`. Shows hero image (or video if `video_url` exists), full narrative, one `DonationMeter`, donor count, "Sponsor This Child" → `/sponsor/[id]/donate`. Returns `notFound()` if `is_active = false` or child not found.

7. **`/app/sponsor/[id]/donate/page.tsx`** — Two-step donation flow. Step 1: amount (min UGX 5,000) + donor name + donor email. Step 2: `PaymentSelector` (Card / MTN MoMo / Airtel) + Turnstile widget. On submit: calls `initiateDonation()` Server Action, redirects to Flutterwave checkout URL. No category selection.

8. **`/app/sponsor/[id]/donate/complete/page.tsx`** — Post-payment landing page. Reads `tx_ref` from search params. Shows "Thank you" if settlement is pending (webhook will confirm), or "Payment failed" if `status=failed` in ledger. Never shows "settled" — that comes from the webhook.

9. **`/app/api/webhooks/flutterwave/route.ts`** — The Flutterwave webhook handler (described in Section 4 above).

10. **`/app/api/children/route.ts`** — Public GET endpoint returning active children profiles. Used by the sponsor directory. Rate limited (60 req/min). No auth required. Returns `{ success: true, data: ChildProfile[] }`.

11. **`/components/donation/PaymentSelector.tsx`** — Client Component. Shows three payment method cards: Card (Visa/Mastercard), MTN MoMo, Airtel Money. Emits `onSelect(provider: "FLUTTERWAVE" | "MTN_MOMO" | "AIRTEL_MONEY")`. Follows existing badge and card styling exactly.

12. **`/components/donation/TurnstileWidget.tsx`** — Client Component. Renders Cloudflare Turnstile widget. Calls `onVerify(token)` callback when challenge passes. Loads the Turnstile script via `next/script` if not already present.

13. **`/app/not-found.tsx`** (root) — Custom 404 page. Simple card with "Page not found" heading and "Go home" link. Uses existing token syntax.

14. **`/app/error.tsx`** (root) — Custom error boundary. `"use client"`. Never shows stack trace. "Something went wrong" message + "Try again" button.

### 8c. Admin Children Detail Page
15. **`/app/admin/dashboard/children/[id]/page.tsx`** — Child detail view for admins. Shows profile stats, biography, media, and the child's donation history table (from `donations_ledger`). Links to edit page.

### 8d. Ledger CSV Export
16. **`/app/api/ledger/export/route.ts`** — `super_admin` only. GET endpoint. Reads same filter params as ledger page. Streams a CSV response. Verifies session via `getAdminSession()`.

---

## 9. Code Generation Rules

### Every file you generate must
- Start with `"use server"` or `"use client"` only if required — Server Components have neither
- Import only from paths that exist in the project (check the folder structure first)
- Use `@/` alias — never relative `../../../` imports
- Handle the `error` return from every InsForge DB call
- Wrap every Server Action and route handler body in `try/catch`
- Return `{ success: boolean; error?: string }` from every Server Action
- Call `revalidatePath()` after every mutation that affects a page
- Log errors with the file path as prefix: `[actions/children/createChild]`

### TypeScript rules
- No `any` — use `unknown` and narrow, or use the exact type from the schema
- Explicit return types on all functions
- No type assertions (`as X`) unless commented with why

### Never
- Delete or overwrite a file that already has working code
- Add new npm packages (the `package.json` is frozen)
- Change `globals.css` token names
- Create a Server Action inside a component file — they live in `/actions/`
- Add `"use client"` to a file that doesn't need it
- Use `<img>` — always `next/image` `<Image>`
- Show raw error messages, stack traces, or DB exceptions to users

---

## 10. Verification Checklist (run before finishing any feature)

Before marking a node complete in `progress-tracker.md`:

- [ ] Does the page render without TypeScript errors?
- [ ] Are all InsForge DB calls using `insforgeServer` (not the browser client)?
- [ ] Is every form input validated by Zod before any DB call?
- [ ] Is rate limiting applied on every public-facing route?
- [ ] Does the Flutterwave webhook read raw body before JSON parse?
- [ ] Does the webhook verify signature before any DB write?
- [ ] Is `revalidatePath()` called after every mutation?
- [ ] Are error states shown to users in plain language (not raw exceptions)?
- [ ] Is the `goal_monthly_ugx` single-field schema used everywhere (no split goals)?
- [ ] Is there no `category` field anywhere in the donation flow?
- [ ] Does every new component follow the token syntax from existing components?

---

## 11. PostHog Events — Frozen List

Fire only these events. Use exact names. Never add new ones.

| Event | Where | Required properties |
|---|---|---|
| `donation_initiated` | Client — donate page Step 2 submit | `childId`, `currency`, `provider` |
| `donation_settled` | Server — webhook handler | `childId`, `amountUgx`, `provider`, `receiptReference` |
| `donation_failed` | Server — webhook handler | `childId`, `provider`, `errorCode` |
| `profile_created` | Server — `actions/children.ts` | `adminId`, `childId`, `initialGoal` |
| `profile_updated` | Server — `actions/children.ts` | `adminId`, `childId`, `fieldsChanged` |
| `admin_login_success` | Server — `actions/auth.ts` | `adminId`, `role` |
| `admin_login_failed` | Server — `actions/auth.ts` | `ipHash`, `attemptCount` |

---

## 12. One-Line Summary

> Analyse the existing codebase against the context files. Fix the schema alignment issues (single `goal_monthly_ugx`, no `category`). Generate only the missing pages, routes, and components listed in Section 8. Match every existing pattern exactly. Never touch working code.
