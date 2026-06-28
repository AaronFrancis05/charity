# Open Hearts Foundation — Child Sponsorship Platform

A secure, full-stack child sponsorship platform connecting vulnerable children in Uganda with sponsors worldwide. Built for the [Open Hearts Foundation](https://openheartsfoundation.org), this system enables transparent donation processing through Flutterwave (card and mobile money), comprehensive admin management, and a public-facing sponsorship directory.

## The Problem

Thousands of vulnerable children in Uganda lack access to education, nutritious food, and stable shelter. Existing sponsorship platforms are fragmented—they either:

- Support only international card payments, excluding local Ugandan contributors who use mobile money (MTN MoMo, Airtel Money)
- Lack proper financial audit trails, making it difficult to track how donations translate to impact
- Expose donor and child data through inadequate security practices
- Require expensive per-transaction licensing fees that divert funds from the mission

Open Hearts Foundation needed a single platform that serves both international and local donors equally while maintaining the highest security and transparency standards.

## The Solution

A single-page sponsorship experience where:

- **International donors** contribute via Visa, Mastercard, or Apple Pay through Flutterwave
- **Local Ugandan contributors** donate directly in UGX via MTN MoMo or Airtel Money—same platform, same child, same flow
- **Administrators** manage child profiles, monitor the financial ledger, and generate audit reports
- **Every donation** is tracked through an immutable ledger from initiation through webhook-verified settlement

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | **Next.js 16** (App Router) | Full-stack React framework with strict Server Components |
| Database & Auth | **InsForge Engine** (`@insforge/sdk`) | Supabase-compatible backend — database, auth sessions, file storage |
| Payments | **Flutterwave** (REST API) | Single payment aggregator — card, MTN MoMo, and Airtel Money |
| Email | **Resend** | Transactional donor confirmation emails |
| Anti-Bot | **Cloudflare Turnstile** | Invisible challenge on donation and login forms |
| Rate Limiting | **Upstash Redis** (REST) | Token bucket rate limiting on all public endpoints |
| Analytics | **PostHog** | Privacy-preserving event tracking (7 approved events only) |
| Validation | **Zod** | Schema validation for all inbound data |
| Styling | **Tailwind CSS v4** | Token-based design system via CSS custom properties |
| Typography | **Geist + Inter** | Applied via `next/font/google` |
| UI Primitives | **@base-ui/react** | Accessible, unstyled headless components |
| Icons | **lucide-react** | Consistent icon set throughout the interface |

## Architecture Overview

```
openheartsfoundation2/
├── app/                          # Next.js App Router pages and API routes
│   ├── admin/                    # Administrative panel (middleware-protected)
│   │   ├── login/                #       Admin authentication
│   │   ├── invite/               #       Invite acceptance (token-gated)
│   │   └── dashboard/            #       Admin CMS
│   │       ├── page.tsx          #         Overview with stats and charts
│   │       ├── children/         #         Child profile CRUD
│   │       ├── ledger/           #         Financial audit ledger (super_admin)
│   │       ├── admins/           #         Invite and manage admins (super_admin)
│   │       └── profile/          #         Admin profile settings
│   ├── sponsor/                  # Public sponsorship pages
│   │   ├── page.tsx              #   Child directory with search and filters
│   │   └── [id]/                 #   Individual child profile + donation flow
│   └── api/                      # API routes
│       ├── webhooks/flutterwave/ #   Payment webhook handler
│       ├── children/             #   Public children API (rate limited)
│       └── ledger/export/        #   CSV export (super_admin only)
├── actions/                      # Server Actions (Zod-validated)
│   ├── auth.ts                   #   Admin login, profile, invite, session
│   ├── children.ts               #   Child profile CRUD + funding aggregation
│   └── donations.ts              #   Donation initiation + ledger queries
├── components/
│   ├── ui/                       # Primitive components (Button, Input, Card, Badge, etc.)
│   ├── cards/                    # ChildCard, ChildVideoCard
│   ├── donation/                 # PaymentSelector, TurnstileWidget
│   ├── admin/                    # ProfileForm, AdminSidebar, etc.
│   └── layout/                   # Navbar, AdminSidebar layouts
├── lib/                          # Server-only utilities and SDK wrappers
│   ├── flutterwave.ts            #   Payment creation + webhook verification
│   ├── settle-donation.ts        #   Ledger settlement logic
│   ├── resend.ts                 #   Transactional email templates
│   ├── insforge-server.ts        #   Service-role InsForge client
│   ├── insforge-client.ts        #   Browser InsForge client
│   ├── turnstile.ts              #   Cloudflare Turnstile verification
│   ├── rate-limit.ts             #   Upstash Redis rate limiter
│   ├── validations/schemas.ts    #   All Zod schemas
│   ├── cache.ts                  #   Upstash Redis caching layer
│   ├── posthog-server.ts         #   Server-side analytics
│   ├── posthog-client.ts         #   Client-side analytics
│   └── utils.ts                  #   Shared helpers
├── migrations/                   # Database migration SQL files
└── context/                      # Build documentation and standards
```

## Key Features

### Administrative Panel (`/admin/dashboard`)

- **Role-based access control** — `super_admin` (full access) and `content_admin` (profile management only, no financial data)
- **Child profile management** — Create, edit, deactivate/reactivate profiles with photos, videos, and biographical narratives
- **Financial audit ledger** — Complete donation history with provider, status, amounts, and receipt references
- **CSV export** — Filtered ledger data export for accounting
- **Admin management** — Super-admins can invite new administrators via email with role selection
- **Profile settings** — Avatar upload and name editing for admin accounts

### Public Sponsorship Directory (`/sponsor`)

- Responsive card grid with child photos, names, and funding progress
- Search by name, filter by region and funding status
- Sort by urgency (lowest funding) or newest profiles
- Pagination (12 per page)

### Individual Child Profile (`/sponsor/[id]`)

- Hero photo with optional video, biographical narrative
- Single funding meter showing combined progress toward monthly goal
- Sponsor count and "Sponsor This Child" call to action

### Donation Flow (`/sponsor/[id]/donate`)

- **Step 1**: Enter amount (UGX 5,000 minimum), donor name, and email
- **Step 2**: Select payment method (Card / MTN MoMo / Airtel Money) + complete Turnstile challenge
- Submits to Flutterwave-hosted checkout page
- Post-payment landing page shows real-time status from the ledger

### Landing Page (`/`)

Story-first design with relational language — no funding meters, no payment badges, no transactional CTAs. Follows charity communication best practices.

## Database Schema

### `admins`
| Column | Type | Description |
|---|---|---|
| id | `uuid` | Primary key |
| email | `text` | Login identifier (unique) |
| password_hash | `text` | bcrypt hash (nullable — set on invite acceptance) |
| role | `super_admin \| content_admin` | Access level |
| is_active | `boolean` | Account status |
| name | `text` | Display name |
| avatar_url | `text` | Profile photo URL |
| password_set | `boolean` | Whether the admin has accepted their invite |

### `children_profiles`
| Column | Type | Description |
|---|---|---|
| id | `uuid` | Primary key |
| name | `text` | Child's full name |
| date_of_birth | `date` | Used for age computation |
| region | `text` | Ugandan district |
| narrative | `text` | Biographical story |
| profile_image_url | `text` | Photo URL (InsForge Storage or local) |
| video_url | `text \| null` | Optional video |
| goal_monthly_ugx | `integer` | Single combined monthly goal — no split by category |
| is_active | `boolean` | Soft delete flag |

### `donations_ledger`
| Column | Type | Description |
|---|---|---|
| id | `uuid` | Primary key |
| child_id | `uuid` | Foreign key → children_profiles |
| provider | `CARD \| MTN_MOMO \| AIRTEL_MONEY` | Payment method used |
| amount_ugx | `numeric` | Amount in Ugandan Shillings |
| donor_email | `text` | Donor's email |
| donor_name | `text` | Donor's name |
| status | `initiated \| pending \| settled \| failed \| refunded` | Transaction state |
| provider_reference | `text` | Flutterwave transaction reference |
| receipt_reference | `text` | Internal receipt number |
| webhook_verified_at | `timestamptz` | When the webhook confirmed settlement |

### `admin_audit_logs`
Immutable audit trail for all administrative actions.

## Payment Flow

```
Donor submits → initiateDonation() Server Action
  → Zod validation + Turnstile verification + Rate limit check
  → Creates ledger record (status: "initiated")
  → Creates Flutterwave checkout via createFlutterwavePayment()
  → Redirects donor to Flutterwave-hosted payment page

Flutterwave processes payment → Sends webhook
  → /api/webhooks/flutterwave reads raw body
  → Verifies verif-hash header (timing-safe comparison)
  → Updates ledger to "settled" with receipt reference
  → Sends donor confirmation email via Resend
  → Fires donation_settled PostHog event

Donor lands on /sponsor/[id]/donate/complete?tx_ref=...
  → Queries ledger status by tx_ref
  → Shows confirmation or failure message
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- An InsForge project (with database, auth, and storage configured)
- Flutterwave merchant account (sandbox or production)
- Cloudflare Turnstile site key and secret key
- Upstash Redis instance (for rate limiting and caching)
- Resend API key (for email notifications)
- PostHog project (for analytics)

### Installation

```bash
git clone https://github.com/AaronFrancis05/charity.git
cd charity
npm install
```

### Environment Variables

Copy the following into `.env.local`:

```env
# InsForge
NEXT_PUBLIC_INSFORGE_URL=https://your-project.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_anon_key
INSFORGE_SERVICE_KEY=your_service_role_key

# Flutterwave
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret

# Resend
RESEND_API_KEY=re_...

# Cloudflare Turnstile
TURNSTILE_SECRET_KEY=0x4AAAAA...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAA...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-region.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Migrations

```bash
npx @insforge/cli login
npx @insforge/cli link
npx @insforge/cli db migrations up --all
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The sponsor directory is at `/sponsor`. The admin panel is at `/admin/login`.

### Build

```bash
npm run build
npm start
```

## Security Design

- **No client-side financial writes** — ledger status updates happen exclusively in the webhook handler
- **Webhook signature verification** — timing-safe comparison of `verif-hash` header before any DB operation
- **Rate limiting on all public routes** — Upstash Redis token bucket, returns HTTP 429 with `Retry-After`
- **Zod before DB** — every inbound payload validated before any database call
- **Soft delete only** — financial records are immutable; child profiles use `is_active` flag
- **Service-role server client** — InsForge server client uses service role key (bypasses RLS), never exposed to browser
- **No secrets in browser** — `NEXT_PUBLIC_` prefix only on non-sensitive environment variables
- **Idempotent webhooks** — duplicate delivery of the same transaction reference is a no-op
- **Empty state and error boundaries** — all errors display plain-language messages; no stack traces exposed

## License

Private — Open Hearts Foundation. All rights reserved.
