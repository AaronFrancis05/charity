# Code Standards — Charity Web Application

Implementation rules and conventions for the entire project. Follow these in every session without exception. These rules prevent pattern drift across sessions.

---

## Engineering Mindset

Operate as a senior engineer on this project. This means:

- **Think before implementing** — understand what is being built and why before writing a single line
- **Read context files first** — never assume, always verify against `architecture.md` and `project-overview.md`
- **Scope is sacred** — only build what the current feature requires. Never go beyond scope even if it seems helpful
- **Every feature must be testable** — if it cannot be verified immediately after implementation, it is incomplete
- **Clean over clever** — simple readable code that a junior developer can understand is always preferred over clever abstractions
- **One thing at a time** — complete one feature fully before touching the next
- **Failures are expected** — wrap operations in try/catch, log failures, never let one failure crash everything

---

## TypeScript

- Strict mode enabled in `tsconfig.json` — no exceptions
- Never use `any` — use `unknown` and narrow the type
- Never use type assertions (`as SomeType`) unless absolutely necessary and commented why
- All function parameters and return types must be explicitly typed
- Use `type` for object shapes and unions — use `interface` only for extendable component props
- All async functions must have proper error handling — never let promises float unhandled
- Use `const` by default — only use `let` when reassignment is necessary

---

## Next.js 16 Conventions

- App Router only — no Pages Router
- React 19 — use React 19 APIs throughout
- All components are Server Components by default
- Only add `"use client"` when the component requires:
  - `useState` or `useReducer`
  - `useEffect`
  - Browser APIs
  - Event listeners
  - Third-party client-only libraries (PostHog browser side, Turnstile widget)
- Never add `"use client"` to layout files unless absolutely required
- Data fetching happens in Server Components — never fetch in Client Components directly
- Route handlers live in `app/api/` — never put business logic directly in route handlers
- Server Actions live in `actions/` — never define Server Actions inline in components
- Caching is uncached by default — all dynamic code runs at request time
- Always read Next.js documentation before implementing any Next.js-specific feature — APIs may differ from training data

---

## File and Folder Naming

- Folders: kebab-case — `admin-login`, `card-session`
- Component files: PascalCase — `ChildCard.tsx`, `DonationMeter.tsx`
- Utility files: camelCase — `insforge-client.ts`, `rate-limit.ts`
- Type files: camelCase — `index.ts`
- API route files: always `route.ts`
- Server Action files: camelCase — `auth.ts`, `children.ts`, `donations.ts`
- One component per file — never export multiple components from one file
- Index files only in `components/ui/` — never barrel export from other folders

---

## Component Structure

Every component follows this exact order:

```typescript
"use client"; // only if needed

// 1. External imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Internal imports
import { DonationMeter } from "@/components/cards/DonationMeter";

// 3. Type definitions
type Props = {
  childId: string;
  fundingPercent: number;
};

// 4. Component
export function ComponentName({ childId, fundingPercent }: Props) {
  // state
  // derived values
  // handlers
  // return JSX
}
```

- Never use default exports for components — always named exports
- Props type defined directly above the component — not in a separate types file unless shared
- No inline styles — all styling via Tailwind classes using CSS variables from `ui-tokens.md`

---

## API Route Handlers

```typescript
// app/api/donations/card-session/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createInsforgeServer } from "@/lib/insforge-server";
import { DonationInitiateSchema } from "@/lib/validations/schemas";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await rateLimit(ip, 10, 60);
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 },
      );
    }

    const body = await req.json();
    const result = DonationInitiateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request data" },
        { status: 400 },
      );
    }

    // business logic here

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[api/donations/card-session]", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

- Every route handler has a try/catch
- Rate limit check always comes before Zod validation
- Zod validation always comes before any DB call
- Errors are logged with the route path as prefix: `[api/donations/card-session]`
- Always return `{ success: boolean, data?: T, error?: string }`
- Never return raw data without the success wrapper
- Webhook routes read raw body with `req.text()` before any other processing — signature verification before JSON parse

---

## Server Actions

```typescript
// actions/children.ts

"use server";

import { revalidatePath } from "next/cache";
import { createInsforgeServer } from "@/lib/insforge-server";
import { CreateChildSchema } from "@/lib/validations/schemas";

export async function createChild(formData: unknown) {
  try {
    const result = CreateChildSchema.safeParse(formData);
    if (!result.success) {
      return { success: false, error: "Invalid form data" };
    }

    const insforge = await createInsforgeServer();
    const { data, error } = await insforge
      .from("children_profiles")
      .insert(result.data)
      .select()
      .single();

    if (error) {
      console.error("[actions/children/createChild]", error);
      return { success: false, error: "Failed to create profile" };
    }

    revalidatePath("/admin/dashboard/children");
    return { success: true, data };
  } catch (error) {
    console.error("[actions/children/createChild]", error);
    return { success: false, error: "Failed to create profile" };
  }
}
```

- Every Server Action has a try/catch
- Every Server Action returns `{ success: boolean, error?: string }`
- Always call `revalidatePath` after mutations that affect page data
- Never throw from Server Actions — always return the error
- Log errors with the action path as prefix: `[actions/children/createChild]`

---

## InsForge Client Usage

```typescript
// Browser context — Client Components only
import { insforge } from "@/lib/insforge-client";

// Server context — Server Components, Route Handlers, Server Actions
import { createInsforgeServer } from "@/lib/insforge-server";
const insforge = await createInsforgeServer();
```

- Never use the browser client in server context
- Never use the server client in browser context
- Always await `createInsforgeServer()` — it reads cookies asynchronously
- Always handle the `error` return from every InsForge DB call

---

## Financial Record Rules

These are inviolable constraints that protect the integrity of donation data:

- **Never update `donations_ledger` status from client code** — only webhook handlers may write status changes
- **Never delete any row from `donations_ledger`** — financial records are permanent
- **Never delete any row from `admin_audit_logs`** — audit trail is permanent
- **Webhook signature must be verified before any DB operation** — signature failure returns HTTP 400 immediately
- **`settled` status is set only when webhook signature is verified** — never infer settlement from any other signal

---

## Error Handling

- Never use empty catch blocks — always log or handle
- Console errors always include context prefix: `[component/function name]`
- User-facing errors must be human readable — never expose raw error messages, stack traces, or DB exceptions
- API route errors return `status: 500` with a generic message — never expose internals
- Webhook errors return `status: 400` for signature failures, `status: 500` for processing errors
- Email sending failures must never crash webhook processing — wrap in try/catch and log, then continue

---

## PostHog Events

All PostHog events must use these exact event names. Never invent new event names without adding them here first.

| Event | When | Key Properties |
|---|---|---|
| `donation_initiated` | Donation flow Step 2 submitted | `childId`, `currency`, `provider` |
| `donation_settled` | Webhook confirms payment | `childId`, `amountUsd`, `amountUgx`, `provider`, `receiptReference` |
| `donation_failed` | Webhook reports failure | `childId`, `provider`, `errorCode` |
| `profile_created` | Admin creates child profile | `adminId`, `childId`, `initialGoal` |
| `profile_updated` | Admin edits child profile | `adminId`, `childId`, `fieldsChanged` |
| `admin_login_success` | Admin successfully logs in | `adminId`, `role` |
| `admin_login_failed` | Admin login fails | `ipHash`, `attemptCount` |

These seven events are the only events in this project. Do not add more without updating this list first.

Note: `category` has been removed from `donation_initiated` and
`donation_settled`. Donations are not earmarked to food / shelter / education
— every settled donation counts toward a child's single combined goal.
`profile_created` now carries one `initialGoal` value instead of three
per-category goal values.

---

## Environment Variables

All environment variables defined in `.env.local` for development. Never hardcode any key, URL, or secret anywhere in the codebase.

| Variable | Context | Used In |
|---|---|---|
| `NEXT_PUBLIC_INSFORGE_URL` | Browser + Server | `lib/insforge-client.ts`, `lib/insforge-server.ts` |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Browser + Server | `lib/insforge-client.ts`, `lib/insforge-server.ts` |
| `INSFORGE_SERVICE_KEY` | Server only | Admin operations requiring service role |
| `FLUTTERWAVE_SECRET_KEY` | Server only | `lib/flutterwave.ts` |
| `FLUTTERWAVE_WEBHOOK_SECRET` | Server only | `app/api/webhooks/flutterwave/route.ts` |
| `RESEND_API_KEY` | Server only | `lib/resend.ts` |
| `SUPER_ADMIN_EMAIL` | Server only | `lib/resend.ts` — admin alert recipient |
| `TURNSTILE_SECRET_KEY` | Server only | `lib/turnstile.ts` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Browser only | `components/donation/TurnstileWidget.tsx` |
| `UPSTASH_REDIS_REST_URL` | Server only | `lib/rate-limit.ts` |
| `UPSTASH_REDIS_REST_TOKEN` | Server only | `lib/rate-limit.ts` |
| `NEXT_PUBLIC_POSTHOG_KEY` | Browser + Server | `lib/posthog-client.ts`, `lib/posthog-server.ts` |
| `NEXT_PUBLIC_POSTHOG_HOST` | Browser + Server | `lib/posthog-client.ts`, `lib/posthog-server.ts` |
| `NEXT_PUBLIC_APP_URL` | Browser + Server | Redirect URLs in checkout sessions |

`NEXT_PUBLIC_` prefix exposes the variable to the browser. Never use `NEXT_PUBLIC_` for secrets.

---

## Import Aliases

Always use the `@/` alias — never use relative imports that go up more than one level.

```typescript
// Correct
import { Button } from "@/components/ui/button";
import { createInsforgeServer } from "@/lib/insforge-server";
import { DonationInitiateSchema } from "@/lib/validations/schemas";

// Never
import { Button } from "../../../components/ui/button";
```

---

## Comments

- No comments explaining what the code does — code must be self-explanatory
- Comments only for why — explaining a non-obvious decision
- Webhook handlers may have a brief comment on signature verification strategy
- Never leave TODO comments in committed code

---

## Dependencies

Never install a new package without a clear reason. Before installing anything check:

1. Does shadcn/ui already have this component?
2. Does Next.js already provide this functionality?
3. Is there a simpler native solution?

Approved dependencies for this project:

- `@insforge/ssr` — InsForge client (database, auth, storage)
- `flutterwave` — REST-based payment provider (no SDK — use fetch directly)
- `@upstash/redis` + `@upstash/ratelimit` — rate limiting
- `resend` — transactional email
- `zod` — schema validation
- `bcryptjs` — password hashing for admin credentials
- `posthog-js` — PostHog browser client
- `posthog-node` — PostHog server client
- `lucide-react` — icons
- `tailwindcss` — styling
- `shadcn/ui` components — UI primitives
- `recharts` — admin dashboard charts

Do not install any other packages without updating this list first.

---

## Admin Role Guards

The two admin roles determine access to certain UI sections and data:

| Role | Dashboard | Children | Ledger | New Admin |
|---|---|---|---|---|
| `super_admin` | ✓ | ✓ | ✓ | ✓ |
| `content_admin` | ✓ | ✓ | ✗ | ✗ |

- Role is attached to request headers by middleware as `x-admin-role`
- Server Components read it via `headers()` from `next/headers`
- Redirect `content_admin` to `/admin/dashboard` if they attempt to access `/admin/dashboard/ledger`
- Never enforce role access only on the client — always check server-side