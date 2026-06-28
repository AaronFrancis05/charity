# Memory — Sponsor Listing Page Redesign

Last updated: 2026-06-28

## What was built

1. **`components/cards/ChildCard.tsx`** — Complete redesign with 3-zone layout:
   - Zone 1: Full-bleed h-56 image with black gradient overlay, name/age overlaid bottom-left, status badge top-left, video play icon top-right
   - Zone 2: Conditional "Watch video" label row
   - Zone 3: Region, italic quote preview, dual CTAs (purple "Walk with {name}" + outlined "Quick Donate")
   - Card wraps `<Link>`, buttons use `stopPropagation`, hover lift with `-translate-y-1`

2. **`app/sponsor/page.tsx`** — Complete redesign:
   - Header: Eyebrow badge + "Sponsor a **Child**" headline + descriptive subtext
   - Search input: Form-based GET search with `ilike` name query on server
   - Status filter chips: All/Available/Partially Sponsored/Fully Sponsored pill filters (replaced region chips)
   - Grid: 1/2/3 cols (was 4-col), gap-6

3. **`actions/children.ts`** — Added `searchQuery` param to `getChildren()` for ILIKE name search

## Decisions made

- **Status chips over region chips**: The spec explicitly replaces region filters with sponsorship status filters. Status is computed from `raised_ugx`/`goal_monthly_ugx` ratio in the page component.
- **Form-based search**: Uses `<form method="GET" action="/sponsor">` with hidden inputs preserving other params — works without JavaScript.
- **`stopPropagation` on CTA buttons**: The card wraps in `<Link>`, so buttons must prevent the link navigation from firing and navigate to their own destination (sponsor detail or donate page).
- **Hardcoded "Available" badge**: Since listing-level `raised_ugx` is 0 for seeded data, all children show "Available". The infrastructure for dynamic status is correct — it just needs real donation data.
- **3-col grid**: Changed from `lg:grid-cols-4 xl:grid-cols-4` to `lg:grid-cols-3` to give cards more room.

## Problems solved

- **`placehold.co` hostname error**: Added to `next.config.ts` `remotePatterns` — was missing, causing runtime `next/image` errors for seed data images.

## Current state

- **Build passes**: `npx tsc --noEmit` = 0 errors, `npx next build` = 16/16 routes
- **ChildCard** redesigned with 3 zones, hover effects, dual CTAs, video indicator — verified at build time
- **Sponsor page** has new header, search, status filters, 3-col grid — all compiling
- **`ui-registry.md`** updated with new ChildCard, filter pill, search input, and sponsor page header entries
- **`progress-tracker.md`** updated with redesign notes
- All children seeded with 0 raised_ugx — status filters will show all as "Available"

## Next session starts with

The sponsor detail page (`/sponsor/[id]/page.tsx`) redesign — split layout hero, sponsorship panel with tabs, video modal, sponsors list, related children section.

## Open questions

- Status filter logic needs real donation data to be meaningful. Once donation flow is exercised, statuses will compute correctly.
- Video modal component not yet built for the card's video play icon (currently just a visual indicator).
