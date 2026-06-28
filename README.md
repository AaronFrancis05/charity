# Open Hearts Foundation — Child Sponsorship Platform

Child sponsorship platform connecting vulnerable children in Uganda with sponsors worldwide.

## Technology Stack

Next.js 16, InsForge SDK, Flutterwave (REST), Resend, Cloudflare Turnstile, Upstash Redis, PostHog, Zod, Tailwind CSS v4, @base-ui/react, lucide-react.

## Getting Started

```bash
npm install
# Configure .env.local (see environment variables below)
npm run dev
```

### Database Migrations

```bash
npx @insforge/cli login
npx @insforge/cli link
npx @insforge/cli db migrations up --all
```

### Build

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Context |
|---|---|---|
| `NEXT_PUBLIC_INSFORGE_URL` | Yes | Browser + Server |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Yes | Browser + Server |
| `INSFORGE_SERVICE_KEY` | Yes | Server only |
| `FLUTTERWAVE_SECRET_KEY` | Yes | Server only |
| `FLUTTERWAVE_WEBHOOK_SECRET` | Yes | Server only |
| `RESEND_API_KEY` | Yes | Server only |
| `TURNSTILE_SECRET_KEY` | Yes | Server only |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes | Browser only |
| `UPSTASH_REDIS_REST_URL` | Yes | Server only |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Server only |
| `NEXT_PUBLIC_POSTHOG_KEY` | Yes | Browser + Server |
| `NEXT_PUBLIC_POSTHOG_HOST` | Yes | Browser + Server |
| `NEXT_PUBLIC_APP_URL` | Yes | Browser + Server |

## License

Private — Open Hearts Foundation. All rights reserved.
