# Build Plan — Open Hearts Foundation Child Sponsorship Platform

## Core Principle

Fix schema alignment issues first. Then generate missing routes, pages, and components in order. Never rewrite working code. Every node must be visually verified before the next begins.

---

## Status Key
- ✅ COMPLETE — do not touch
- 🔧 NEEDS ALIGNMENT — existing file, schema mismatch to fix
- ❌ MISSING — generate from scratch

---

## Phase 1 — Security & Database Foundations ✅ DONE

- ✅ **01 — Environment & Project Bootstrap**
- ✅ **02 — Database Collections**
- ✅ **03 — Input Validation Sieve** — `schemas.ts` exists but needs alignment (see Phase 0)
- ✅ **04 — Rate Limiter** — `lib/rate-limit.ts` complete
- ✅ **05 — Turnstile Verification** — `lib/turnstile.ts` complete
- ✅ **06 — Middleware** — `middleware.ts` complete

---

## Phase 0 — Schema Alignment (Do This Before Phase 2 Work)

These are corrections to already-built files. They are blocking — nothing in Phase 2+ works correctly without them.

### 0a — `/lib/validations/schemas.ts` 🔧

Replace three-goal fields with single `goal_monthly_ugx`. Remove `category` from donation schema.

```typescript
// REMOVE:
goal_food_ugx, goal_shelter_ugx, goal_education_ugx
category: z.enum(["food", "shelter", "education", "general"])

// ADD:
goal_monthly_ugx: z.number().int().positive("Monthly goal must be a positive number")

// UPDATE DonationInitiateSchema provider enum:
provider: z.enum(["FLUTTERWAVE", "MTN_MOMO", "AIRTEL_MONEY"])

// ADD to DonationInitiateSchema:
amountUgx: z.number().int().min(5000, "Minimum donation is UGX 5,000")
donorName: z.string().min(2, "Name must be at least 2 characters")
```

### 0b — `/actions/children.ts` 🔧

```typescript
// UPDATE ChildProfile interface:
// REMOVE: goal_food_ugx, goal_shelter_ugx, goal_education_ugx
// ADD:    goal_monthly_ugx: number

// UPDATE ChildWithFunding interface:
// REMOVE: raised_food_ugx, raised_shelter_ugx, raised_education_ugx
// ADD:    raised_ugx: number  (total settled donations for this child)

// UPDATE getChildById() aggregate query:
// Sum all settled donations into a single raised_ugx figure
// No per-category breakdown

// UPDATE createChild() and updateChild():
// Use goal_monthly_ugx — remove category from audit log metadata
// initialGoal PostHog property = goal_monthly_ugx value

// UPDATE getDashboardStats():
// Funding tier computed from (raised_ugx / goal_monthly_ugx * 100) per child
```

### 0c — `/actions/donations.ts` 🔧

```typescript
// UPDATE initiateDonation():
// Remove category from input, from ledger insert
// Provider enum: "FLUTTERWAVE" | "MTN_MOMO" | "AIRTEL_MONEY"
// donation_initiated PostHog event: no category property
```

### 0d — `/components/ui/progress-bar.tsx` 🔧

`DonationMeter` component: accepts `raised: number` and `goal: number` (both in UGX) and renders one bar. The three-category layout is removed.

### 0e — `/components/cards/ChildCard.tsx` 🔧

Replace the three `ProgressBar` rows with a single `DonationMeter`:
```typescript
<DonationMeter raised={child.raised_ugx} goal={child.goal_monthly_ugx} />
```

### 0f — `/components/admin/ProfileForm.tsx` 🔧

Replace three goal input fields with a single field:
```
label: "Monthly sponsorship goal (UGX)"
name: "goal_monthly_ugx"
type: number, min: 5000, placeholder: "500000"
```

---

## Phase 2 — Administrative Content Core ✅ DONE (after alignment)

- ✅ **07 — Admin Login** — `app/admin/login/` complete
- ✅ **08 — Admin Dashboard Shell** — `app/admin/dashboard/layout.tsx` + `page.tsx` complete
- ✅ **09 — Child Profile Management** — list, new, edit pages complete
- ✅ **10 — Financial Audit Ledger** — ledger page complete

---

## Phase 3 — Public Profiles & Payment Webhooks

### 11 — Public Sponsorship Directory ✅ DONE

`/sponsor/page.tsx` — complete. Uses `ChildCard` component (needs alignment from 0e).

---

### 12 — Individual Child Profile Page ❌ MISSING

**File**: `/app/sponsor/[id]/page.tsx`

Server Component. No `"use client"`.

```typescript
export default async function ChildProfilePage({ params }: { params: { id: string } }) {
  const child = await getChildById(params.id);
  if (!child || !child.is_active) notFound();
  // ...
}
```

**Layout** (desktop: 2-column, mobile: 1-column):
- Left column (60%): hero `<Image>` or `<ChildVideoCard>` if `video_url` exists, then full `narrative` text
- Right column (40%): `DonationMeter`, donor count, "Sponsor This Child" CTA → `/sponsor/${id}/donate`

**DonationMeter props**: `raised={child.raised_ugx}` `goal={child.goal_monthly_ugx}`

**Donor count**: `child.donor_count` (count of unique donor emails with settled status)

Returns `notFound()` if `is_active === false` OR child not found.

Uses existing `Navbar` at top.

---

### 12b — ChildVideoCard Component ❌ MISSING

**File**: `/components/cards/ChildVideoCard.tsx`

```typescript
// Named export — no default exports
export function ChildVideoCard({ videoUrl, childName }: { videoUrl: string; childName: string }) {
  return (
    <div className="relative aspect-video rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-surface-muted)]">
      <video
        ={videoUrl}
        controls
        muted
        playsInline
        className="w-full h-full object-cover"
        aria-label={`${childName} profile video`}
      />
    </div>
  );
}
// Never autoplay audio. controls always visible. muted attribute required.
```

---

### 13 — Donation Flow Page ❌ MISSING

**File**: `/app/sponsor/[id]/donate/page.tsx`

Client Component (`"use client"`) — two-step form.

**Step 1** — Amount + Contact:
- Amount input (UGX, min 5,000, type number)
- Donor name input (text, min 2 chars)
- Donor email input (email)
- "Continue" button → advance to Step 2

**Step 2** — Payment Method + Turnstile:
- `PaymentSelector` component (see 13b)
- `TurnstileWidget` (see 13c)
- "Complete Sponsorship" button → calls `initiateDonation()` Server Action
- On success: `router.push(result.paymentUrl)` — redirect to Flutterwave checkout
- On error: display inline error message

No category selection. No provider-level session split. One unified flow.

The child's name is fetched server-side (the page can be a server component wrapper that passes child name down, or a simple heading from route params).

---

### 13b — PaymentSelector Component ❌ MISSING

**File**: `/components/donation/PaymentSelector.tsx`

```typescript
"use client";

type Provider = "FLUTTERWAVE" | "MTN_MOMO" | "AIRTEL_MONEY";

interface PaymentSelectorProps {
  selected: Provider | null;
  onSelect: (provider: Provider) => void;
}

export function PaymentSelector({ selected, onSelect }: PaymentSelectorProps) { ... }
```

Three payment method cards in a column:
1. **Card** (FLUTTERWAVE) — "Visa, Mastercard, Apple Pay" — purple badge
2. **MTN MoMo** (MTN_MOMO) — amber badge
3. **Airtel Money** (AIRTEL_MONEY) — red badge

Selected card: `border-[var(--color-brand-purple)] bg-[var(--color-brand-purple-light)]`
Unselected card: `border-[var(--color-border)] bg-[var(--color-surface)]`

All badge styling matches existing `ProviderBadge` variants.

---

### 13c — TurnstileWidget Component ❌ MISSING

**File**: `/components/donation/TurnstileWidget.tsx`

```typescript
"use client";

import { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

export function TurnstileWidget({ onVerify, onExpire }: TurnstileWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") return;
    const turnstile = (window as any).turnstile;
    if (!turnstile) return;
    const widgetId = turnstile.render(ref.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
      callback: onVerify,
      "expired-callback": onExpire,
    });
    return () => turnstile.remove(widgetId);
  }, [onVerify, onExpire]);

  return <div ref={ref} />;
}
```

The Turnstile script must be loaded in `app/layout.tsx` via `<Script ="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" />`.

---

### 14 — Flutterwave Webhook Handler ❌ MISSING

**File**: `/app/api/webhooks/flutterwave/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyFlutterwaveWebhook } from "@/lib/flutterwave";
import { settleDonation, markDonationFailed } from "@/lib/settle-donation";
import { insforgeServer } from "@/lib/insforge-server";

export async function POST(request: NextRequest) {
  // 1. Read raw body BEFORE any JSON parse
  const rawBody = await request.text();

  // 2. Verify signature
  const signatureHeader = request.headers.get("verif-hash") ?? "";
  if (!verifyFlutterwaveWebhook(rawBody, signatureHeader)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // 3. Parse verified payload
  const payload = JSON.parse(rawBody);

  // 4. Handle charge.completed
  if (payload.event === "charge.completed") {
    const txRef = payload.data?.tx_ref;
    const status = payload.data?.status;

    if (status === "successful" && txRef) {
      await settleDonation({ providerReference: txRef, amountUgx: payload.data?.amount });
    } else if (status === "failed" && txRef) {
      await markDonationFailed(txRef);
    }
  }

  // 5. Always return 200
  return NextResponse.json({ received: true }, { status: 200 });
}
```

Uses `settleDonation` and `markDonationFailed` from the already-complete `/lib/settle-donation.ts`.

---

### 15 — Donor Confirmation Email ✅ DONE

`/lib/resend.ts` — `sendDonorConfirmation()` is complete.

---

### Post-Payment Complete Page ❌ MISSING

**File**: `/app/sponsor/[id]/donate/complete/page.tsx`

Server Component. Reads `tx_ref` from `searchParams`. Queries `donations_ledger` by `provider_reference = tx_ref`. Displays:
- `status === "settled"` or `status === "pending"` → "Thank you! Your payment was received. A confirmation email is on its way."
- `status === "failed"` → "Payment failed. Please try again." with link back to donate page
- Record not found → "Payment not found." with link back

Never blocks on email delivery — the webhook fires the email asynchronously.

---

## Phase 4 — Polish & Production Hardening

### 16 — Empty States ✅ DONE

All three variants complete (see progress-tracker).

### 17 — Error Boundaries & 404 Pages ❌ PARTIALLY MISSING

- `/app/not-found.tsx` — root 404 — generate if missing
- `/app/error.tsx` — root error boundary — generate if missing
- `/app/sponsor/[id]/not-found.tsx` — profile-level 404 — generate if missing

### 18 — Security Audit ✅ DONE

Final pre-deploy checklist cleared per progress-tracker.

---

## Additional Missing Routes

### Public Children API ❌ MISSING

**File**: `/app/api/children/route.ts`

```typescript
export async function GET(request: NextRequest) {
  // Rate limit: 60 requests/min per IP
  // Returns active children for public consumption
  // Used by /sponsor page for client-side filtering (optional)
}
```

### Ledger CSV Export ❌ MISSING

**File**: `/app/api/ledger/export/route.ts`

```typescript
export async function GET(request: NextRequest) {
  // Verify super_admin session via getAdminSession()
  // Read filter params from searchParams
  // Query donations_ledger with same filters as ledger page
  // Stream CSV response with Content-Disposition: attachment; filename="ledger-export.csv"
}
```

---

## Completion Matrix

| Phase | Features | Status |
|---|---|---|
| Phase 0 — Schema Alignment | 6 files | 🔧 FIX FIRST |
| Phase 1 — Security & DB | 6 nodes | ✅ DONE |
| Phase 2 — Admin CMS | 4 nodes | ✅ DONE |
| Phase 3 — Public & Payments | 5 nodes | ❌ GENERATE |
| Phase 4 — Polish | 3 nodes | Partial |
| Additional Routes | 2 routes | ❌ GENERATE |
