# Library Docs — Charity Web Application

Project-specific usage patterns for every third-party library in this project. This file only covers how we use each library in this specific codebase — rules, patterns, and constraints that override general knowledge.

Read the relevant section before implementing any feature that touches these libraries.

---

## Authority Order

Before implementing any feature that uses a third-party library:

1. Check for an MCP server configured for that library — use it first if available
2. Read this file for project-specific patterns
3. Fall back to official library documentation only if neither above covers it

Never rely on general training knowledge alone for library APIs — they change and training data may be outdated.

```
MCP server (real-time docs) → This file (project rules) → Official docs
```

---

## InsForge

InsForge is the entire backend authority for this project — database, auth, and file storage. It is Supabase-compatible. Two separate client instances exist and must never be mixed.

### Client Instances

```typescript
// src/lib/insforge-client.ts — browser context only
import { createBrowserClient } from "@insforge/ssr";

export const insforge = createBrowserClient(
  process.env.NEXT_PUBLIC_INSFORGE_URL!,
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
);
```

```typescript
// src/lib/insforge-server.ts — server context only
import { createServerClient } from "@insforge/ssr";
import { cookies } from "next/headers";

export const createInsforgeServer = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_INSFORGE_URL!,
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};
```

**Rules:**

- Browser client — Client Components only
- Server client — Server Components, API routes, Server Actions
- Never use browser client in server context
- Never use server client in browser context
- Always `await createInsforgeServer()` — it reads cookies asynchronously

---

### Auth

```typescript
// Get current user in server context
const insforge = await createInsforgeServer();
const {
  data: { user },
  error,
} = await insforge.auth.getUser();
if (!user) redirect("/admin/login");
```

```typescript
// Create session on login
const { data, error } = await insforge.auth.signInWithPassword({
  email,
  password, // plain — InsForge handles bcrypt comparison internally
});
```

```typescript
// Sign out
const { error } = await insforge.auth.signOut();
```

**Rules:**

- Session is stored in a cookie — middleware reads it via `getUser()`
- Never store the session token manually — InsForge manages the cookie lifecycle
- Password comparison uses bcrypt — never compare plain text passwords manually

---

### DB Queries

```typescript
// Read all active children (public)
const { data, error } = await insforge
  .from("children_profiles")
  .select("*")
  .eq("is_active", true)
  .order("created_at", { ascending: false });

// Read single child by ID
const { data, error } = await insforge
  .from("children_profiles")
  .select("*")
  .eq("id", childId)
  .eq("is_active", true)
  .single();

// Insert new child profile
const { data, error } = await insforge
  .from("children_profiles")
  .insert({ name, date_of_birth, region, narrative, profile_image_url, ... })
  .select()
  .single();

// Partial update
const { error } = await insforge
  .from("children_profiles")
  .update({ narrative, updated_at: new Date().toISOString() })
  .eq("id", childId);

// Soft delete — never hard delete
const { error } = await insforge
  .from("children_profiles")
  .update({ is_active: false })
  .eq("id", childId);
```

```typescript
// Insert donation record (initiated state)
const { data, error } = await insforge
  .from("donations_ledger")
  .insert({
    child_id: childId,
    provider,
    amount_usd: provider === "CARD" ? amountUsd : null,
    amount_ugx: provider !== "CARD" ? amountUgx : null,
    donor_email: donorEmail,
    status: "initiated",
    provider_reference: sessionId,
  })
  .select()
  .single();

// Update donation to settled — webhook handlers only
const { error } = await insforge
  .from("donations_ledger")
  .update({
    status: "settled",
    webhook_verified_at: new Date().toISOString(),
    receipt_reference: receiptRef,
  })
  .eq("provider_reference", providerReference);
```

```typescript
// Insert audit log entry
const { error } = await insforge
  .from("admin_audit_logs")
  .insert({
    admin_id: adminId,
    event_type: "profile_created",
    target_id: childId,
    metadata: { fieldsChanged: ["name", "narrative"] },
  });
```

**Rules:**

- Never delete rows from `donations_ledger` — immutable financial record
- Never delete rows from `admin_audit_logs` — immutable audit trail
- Always use soft delete (`is_active = false`) for child profiles
- Always handle the `error` return — never assume success
- Use `.single()` when expecting exactly one row — it throws if zero or multiple rows returned
- `donations_ledger` status updates go through webhook handlers only — never from client code or Server Actions

---

### Storage

```typescript
// Upload child profile image — server side only
const { data, error } = await insforge.storage
  .from("child-media")
  .upload(`profiles/${childId}/profile.jpg`, fileBuffer, {
    contentType: "image/jpeg",
    upsert: true,
  });

// Upload child video — server side only
const { data, error } = await insforge.storage
  .from("child-media")
  .upload(`profiles/${childId}/video.mp4`, fileBuffer, {
    contentType: "video/mp4",
    upsert: true,
  });

// Get secure URL after upload
const { data } = insforge.storage
  .from("child-media")
  .getPublicUrl(`profiles/${childId}/profile.jpg`);

const secureUrl = data.publicUrl;
```

**Storage paths:**

- Profile image: `profiles/{child_id}/profile.jpg`
- Profile video: `profiles/{child_id}/video.mp4`

**Rules:**

- All uploads go through server-side route handlers — never direct browser uploads
- Always save the returned public URL to `children_profiles` before the DB record is considered complete
- Always use `upsert: true` — allows re-upload when profile is edited
- Never write files to disk — always upload buffer directly to InsForge Storage
- Bucket name is `child-media` for all child profile assets

---

## Flutterwave

Flutterwave handles all payment rails — international card payments (USD) and mobile money (UGX). All calls are server-side only.

### Checkout Session Creation

```typescript
// src/lib/flutterwave.ts
const FLUTTERWAVE_API = "https://api.flutterwave.com/v3";

export async function createFlutterwaveSession(params: {
  childId: string;
  donorEmail: string;
  amount: number;
  currency: "USD" | "UGX";
  paymentMethod: "CARD" | "MTN_MOMO" | "AIRTEL_MONEY";
  ledgerRecordId: string;
  childName: string;
}): Promise<{ checkoutUrl: string; transactionId: string }> {
  const payload: Record<string, unknown> = {
    tx_ref: params.ledgerRecordId,
    amount: params.amount,
    currency: params.currency,
    customer: {
      email: params.donorEmail,
    },
    meta: {
      childId: params.childId,
      ledgerRecordId: params.ledgerRecordId,
    },
    redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/sponsor/${params.childId}/donate/success`,
  };

  if (params.paymentMethod === "CARD") {
    payload.payment_options = "card";
  } else {
    payload.payment_type = "mobilemoneyuganda";
    payload.payment_options = params.paymentMethod === "MTN_MOMO"
      ? "mobilemoneyuganda"
      : "mobilemoneyuganda";
    payload.meta = {
      ...payload.meta as Record<string, string>,
      mobile_provider: params.paymentMethod,
    };
  }

  const response = await fetch(`${FLUTTERWAVE_API}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY!}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Flutterwave API error: ${response.status}`);
  }

  const data = await response.json();
  return { checkoutUrl: data.data.link, transactionId: data.data.id.toString() };
}
```

### Webhook Signature Verification

```typescript
// app/api/webhooks/flutterwave/route.ts
import { createHmac, timingSafeEqual } from "crypto";

export async function POST(req: Request) {
  const body = await req.text(); // raw body first — always
  const signature = req.headers.get("verif-hash")!;

  const expectedSig = createHmac("sha256", process.env.FLUTTERWAVE_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSig);

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return new Response("Invalid signature", { status: 400 });
  }

  const payload = JSON.parse(body);

  if (payload.event === "charge.completed") {
    const { meta, amount, currency, tx_ref, id } = payload.data;
    const { childId, ledgerRecordId } = meta;

    const provider = currency === "UGX"
      ? payload.data.payment_type === "mobilemoneyuganda"
        ? payload.data.meta.mobile_provider
        : "MTN_MOMO"
      : "CARD";

    // update donations_ledger to settled using ledgerRecordId
  }

  return new Response("OK", { status: 200 });
}
```

**Rules:**

- Always read raw body with `req.text()` before JSON parse — signature verification first
- Always use `timingSafeEqual` for signature comparison — prevents timing attacks
- Return HTTP 400 on invalid signature — log to `admin_audit_logs`
- Return HTTP 200 immediately after receiving a valid webhook — process async
- `amount` is in the currency's base unit (cents for USD, subunits for UGX?)
- Always include `ledgerRecordId` in `meta` — required to match webhook back to our DB record
- Never create Flutterwave sessions from client components

---

## Resend

Handles all transactional email — donor confirmations and admin alerts. Server-side only.

### Setup

```typescript
// src/lib/resend.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
```

### Donor Confirmation Email

```typescript
export async function sendDonorConfirmation(params: {
  donorEmail: string;
  childName: string;
  amountDisplay: string;
  receiptReference: string;
}): Promise<void> {
  await resend.emails.send({
    from: "Hope Bridge <no-reply@hopebridge.org>",
    to: params.donorEmail,
    subject: `Your sponsorship for ${params.childName} is confirmed`,
    html: `
      <h2>Thank you for your support</h2>
      <p>Your contribution of <strong>${params.amountDisplay}</strong>
      toward <strong>${params.childName}</strong> has been received.</p>
      <p>Receipt reference: <code>${params.receiptReference}</code></p>
      <p>Your generosity makes a real difference.</p>
    `,
    text: `Thank you for your contribution of ${params.amountDisplay} for ${params.childName}. Receipt reference: ${params.receiptReference}.`,
  });
}
```

### Admin Alert Email

```typescript
export async function sendAdminAlert(params: {
  subject: string;
  body: string;
}): Promise<void> {
  await resend.emails.send({
    from: "Hope Bridge System <alerts@hopebridge.org>",
    to: process.env.SUPER_ADMIN_EMAIL!,
    subject: params.subject,
    html: `<p>${params.body}</p>`,
    text: params.body,
  });
}
```

**Rules:**

- Resend is called only from webhook handlers — never from client code or Server Actions
- Always include a plain text fallback alongside HTML
- Always wrap `resend.emails.send()` in try/catch — email failure must never break the webhook response
- `from` address must use a verified domain in Resend — never an unverified address
- Admin alert email address is stored in `SUPER_ADMIN_EMAIL` env variable — never hardcoded

---

## Zod

All inbound payloads are validated against a Zod schema before any DB operation. Schemas live in `src/lib/validations/schemas.ts`.

### Schema Definitions

```typescript
import { z } from "zod";

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const CreateChildSchema = z.object({
  name: z.string().min(1),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  region: z.enum(["Kampala", "Gulu", "Jinja", "Mbale", "Mbarara", "Masaka", "Lira", "Arua"]),
  narrative: z.string().min(1),
  goalMonthly: z.coerce.number().int().positive(),
});

export const UpdateChildSchema = CreateChildSchema.partial().extend({
  id: z.string().uuid(),
});

export const DonationInitiateSchema = z.object({
  childId: z.string().uuid(),
  donorEmail: z.string().email(),
  provider: z.enum(["CARD", "MTN_MOMO", "AIRTEL_MONEY"]),
});

export const TurnstileVerifySchema = z.object({
  token: z.string().min(1),
});
```

### Validation in Route Handlers

```typescript
const result = DonationInitiateSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    { success: false, error: "Invalid request data" },
    { status: 400 },
  );
}
const validated = result.data;
```

**Rules:**

- Always use `.safeParse()` — never `.parse()` which throws on failure
- Return HTTP 400 with `"Invalid request data"` on failure — never expose raw Zod error messages to the client
- Every schema must exist in `schemas.ts` before the route that uses it is built
- Schemas are the single source of truth for field types — never duplicate type definitions

---

## Upstash Redis — Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function rateLimit(
  identifier: string,
  limit: number,
  window: number,
): Promise<{ success: boolean; retryAfter?: number }> {
  const key = `rate_limit:${identifier}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, window);
  }
  if (current > limit) {
    const ttl = await redis.ttl(key);
    return { success: false, retryAfter: ttl > 0 ? ttl : window };
  }
  return { success: true };
}
```

### Usage in Route Handlers

```typescript
const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
const { success, retryAfter } = await rateLimit(ip, 10, 60);
if (!success) {
  return NextResponse.json(
    { success: false, error: "Too many requests" },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    },
  );
}
```

**Rate limit table:**

| Route | Limit | Window |
|---|---|---|
| `/admin/login` | 5 requests | 15 minutes (900s) |
| `/api/donations/card-session` | 10 requests | 1 minute (60s) |
| `/api/donations/mobile-money-session` | 10 requests | 1 minute (60s) |
| `/api/turnstile` | 20 requests | 1 minute (60s) |

**Rules:**

- Rate limit key is always the incoming IP — never a user ID (unauthenticated routes have no user)
- Always include `Retry-After` header on 429 responses
- Rate limit check happens before any other processing in the route handler

---

## Cloudflare Turnstile

Anti-bot challenge on admin login and donation initiation. Token is validated server-side only.

```typescript
// src/lib/turnstile.ts
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: token,
      }),
    },
  );

  const data = await response.json();
  return data.success === true;
}
```

### Client Widget

```typescript
// components/donation/TurnstileWidget.tsx
"use client";

import { useEffect, useRef } from "react";

type Props = {
  onVerify: (token: string) => void;
};

export function TurnstileWidget({ onVerify }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Cloudflare Turnstile renders into the div
    (window as any).turnstile?.render(ref.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
      callback: onVerify,
    });
  }, [onVerify]);

  return <div ref={ref} />;
}
```

**Rules:**

- `TURNSTILE_SECRET_KEY` is server-only — never exposed to the browser
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is the browser widget key only
- Always verify the token server-side before processing any donation or login
- Return HTTP 400 if token is missing or verification fails — never proceed without a valid token
- Turnstile script must be loaded in the root layout via `<Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" />`

---

## PostHog

Tracks donation and admin events for analytics. Browser and server clients both exist.

### Browser Client

```typescript
// src/lib/posthog-client.ts
import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      capture_pageview: false,
    });
  }
}

// Capture client-side event
posthog.capture("donation_initiated", {
  childId,
  currency: "USD",
  provider: "CARD",
});
```

### Server Client

```typescript
// src/lib/posthog-server.ts
import { PostHog } from "posthog-node";

export const createPostHogServer = () =>
  new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    flushAt: 1,
    flushInterval: 0,
  });

// Always shutdown after use in server functions
const posthog = createPostHogServer();
posthog.capture({
  distinctId: donorEmail,
  event: "donation_settled",
  properties: { childId, amountUsd, provider, receiptReference },
});
await posthog.shutdown();
```

**Approved event names (from project-overview.md):**

| Event | Where fired | Required properties |
|---|---|---|
| `donation_initiated` | Client — donation Step 3 | `childId`, `currency`, `provider` |
| `donation_settled` | Server — webhook handler | `childId`, `amountUsd`, `amountUgx`, `provider`, `receiptReference` |
| `donation_failed` | Server — webhook handler | `childId`, `provider`, `errorCode` |
| `profile_created` | Server — Server Action | `adminId`, `childId`, `goalMonthly` |
| `profile_updated` | Server — Server Action | `adminId`, `childId`, `fieldsChanged` |
| `admin_login_success` | Server — Server Action | `adminId`, `role` |
| `admin_login_failed` | Server — Server Action | `ipHash`, `attemptCount` |

**Rules:**

- Always call `await posthog.shutdown()` in server functions — events are lost without it
- `flushAt: 1` and `flushInterval: 0` always set on server client
- Event names must match exactly the table above — never invent new event names
- `distinctId` for donation events is `donorEmail` — donors have no account
- `distinctId` for admin events is `adminId`