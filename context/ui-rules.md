# UI Rules — Charity Web Application

Source of truth for all visual decisions. Read this before building any
component. If a rule here conflicts with a Tailwind default — this file wins.

---

## Foundational Constraints

**Font**: Inter via `next/font/google`. Applied to `<html>` in root layout.
The `--font-sans` variable is declared in `@theme` in `globals.css`. Never
use system fonts as the primary typeface.

**Page max-width**: 1440px, centered.

**Main content padding**: 32px on all sides.

**Section gap**: 24px between page-level sections.

**Colours**: All colours come from `ui-tokens.md` via CSS custom properties.
Never use Tailwind built-in colour classes. Never hardcode hex values in
component files. The single exception is `#61A8FF` (60–79% funding fill) inside
`DonationMeter` — documented in `ui-tokens.md`.

---

## Story-First Content Placement

The platform's job is to introduce a donor to a child, not to a balance sheet.
Funding percentages, payment provider logos, and financial proof points are
tools for someone who has already decided to act — they belong on `/sponsor`,
`/sponsor/[id]`, and `/sponsor/[id]/donate`. They do not belong on the landing
page or anywhere a visitor is still being introduced to the mission.

**Landing page (`/`) specifically:**
- No `DonationMeter` or funding percentage of any kind, including on featured
  child teaser cards. A child is introduced by name, age, region, and their
  own words — not by how far funded they are.
- No payment provider badges (Card, MTN MoMo, Airtel). Payment trust signals
  are a Step 3 donation-flow concern, not a first-impression concern.
- Testimonial / child-story cards are the largest, most visually weighted
  element on the page. Stat proof points (children supported, communities
  reached) are a quiet single-row strip — never a coloured panel competing
  with the children's own stories for attention.
- CTA copy is relational, never transactional. Use "Walk with [Name]" or
  "Walk with a child" — never "Sponsor now" or "Donate." This applies to
  every CTA on the page, including the closing section.

**Everywhere else:** funding meters, provider badges, and "Sponsor" CTA
language are correct and expected once a visitor has moved into the
directory or a child's own profile — the rule above applies to the landing
page only.

---

## Layout

### Navbar

- Height: 64px, full viewport width
- Background: `--color-surface` (#ffffff)
- Padding: 0 24px
- Three nav items: Dashboard, Sponsor Children, Profile
- Active item: `text-[--color-accent]`, `font-weight: 500`, `font-size: 14px`
- Inactive item: `text-[--color-text-secondary]`, `font-weight: 500`,
  `font-size: 14px`
- Active state is colour change only — no underline, no background highlight
- All pages use the top navbar only — no sidebar on public pages

### Admin Sidebar (Admin Section Only)

- Fixed left sidebar, width 240px
- Background: `--color-surface`
- Border right: `1px solid --color-border`
- Navigation links: Children, Ledger, Dashboard overview
- Active link: `text-[--color-accent]`, `bg-[--color-accent-light]`,
  `rounded-[--radius-md]`, padding `8px 12px`
- Inactive link: `text-[--color-text-secondary]`, no background

---

## Cards

Every content section lives in a card — child dossiers, stat panels, forms,
tables, and impact narratives.

```
background:    --color-surface (#ffffff)
border:        1px solid --color-border (#e7eaf3)
border-radius: --radius-xl (16px)
padding:       24px
box-shadow:    0px 1px 3px rgba(0,0,0,0.1), 0px 1px 2px -1px rgba(0,0,0,0.1)
```

**Never use coloured card backgrounds.** Colour goes inside cards — via badges,
progress bars, media, and text. The card surface is always white.

**Never stack more than two levels of border radius inside each other.**

---

## Typography

Three levels only. Never mix weights within a single UI element.

### Level 1 — Section Headings

Card titles, page section titles, child profile names.

```
font-size:   16px
font-weight: 600
color:       --color-text-primary (#101828)
line-height: 24px
```

### Level 2 — Body / Primary Content

Child biographies, descriptions, transactional text, form labels.

```
font-size:   14px
font-weight: 500
color:       --color-text-primary (#101828)
line-height: 20px
```

### Level 3 — Secondary / Muted

Labels, timestamps, regional subtitles (Kampala, Gulu, Jinja), table column
headers.

```
font-size:   12px
font-weight: 400
color:       --color-text-muted (#99a1af)
line-height: 16px
```

### Admin Dashboard Stat Numbers

```
font-size:   30px
font-weight: 600
color:       --color-text-primary (#101828)
```

---

## Buttons

### Primary Button

Used for: "Sponsor Now", "Save Profile", "Submit", primary CTAs.

```
background:    --color-accent (#7c5cfc)
color:         --color-accent-foreground (#ffffff)
border-radius: --radius-md (8px)
padding:       8px 16px
font-size:     14px
font-weight:   500
hover:         background --color-accent-dark (#5e4cff)
```

### Secondary Button

Used for: "Cancel", "Back", non-destructive secondary actions.

```
background:    --color-surface (#ffffff)
border:        1px solid --color-border (#e7eaf3)
color:         --color-text-primary (#101828)
border-radius: --radius-md (8px)
padding:       8px 16px
font-size:     14px
font-weight:   500
hover:         background --color-surface-secondary (#f9fafb)
```

---

## Form Inputs

```
background:        --color-surface (#ffffff)
border:            1px solid --color-border (#e7eaf3)
border-radius:     --radius-md (8px)
padding:           8px 12px
font-size:         14px
color:             --color-text-primary (#101828)
placeholder color: --color-text-muted (#99a1af)
focus:             ring-1 ring-[--color-accent] border-[--color-accent]
```

All inputs follow this pattern without exception — text inputs, email inputs,
textareas, and select dropdowns.

---

## Badges

All badges use `border-radius: --radius-full` (9999px / pill shape) unless
specified otherwise.

```
padding:     2px 8px
font-size:   12px
font-weight: 500
```

### Status Badges

| Status | Background | Text |
|---|---|---|
| `settled` | `--color-success-lightest` (#ecfdf5) | `--color-success-dark` (#007a55) |
| `pending` | #FFF9E6 | #B38F00 |
| `initiated` | `--color-accent-light` (#f3e8ff) | `--color-accent` (#7c5cfc) |
| `failed` | #FFF0F0 | `--color-error` (#ef4444) |
| `refunded` | `--color-surface-secondary` (#f9fafb) | `--color-text-secondary` (#6a7282) |

### Provider Badges

| Provider | Background | Text |
|---|---|---|
| Card | `--color-accent-light` (#f3e8ff) | `--color-accent` (#7c5cfc) |
| MTN MoMo | #FFF9E6 | `--color-mtn-momo-text` (#b38f00) |
| Airtel Money | `--color-airtel-bg` (#fff0f0) | `--color-error` (#ef4444) |

### Region Badges

```
background: --color-surface-secondary (#f9fafb)
border:     1px solid --color-border (#e7eaf3)
color:      --color-text-secondary (#6a7282)
```

### Trend Badges (Admin Financial Dashboard)

Trend badges use `border-radius: --radius-sm` (4px) — not pill shape.

```
background: --color-success-lightest (#ecfdf5)
color:      --color-success-dark (#007a55)
```

---

## Funding Progress Bar

A single inline horizontal meter showing overall sponsorship progress toward
a child's combined monthly goal. Each child has exactly one meter — there is
no per-category breakdown.

```
height:           4px
border-radius:    --radius-full (9999px)
background track: --color-border (#e7eaf3)
```

**Fill colour rules — applied conditionally in the component:**

| Funding Level | Fill Color | Token |
|---|---|---|
| 80% – 100% | #10B981 | `--color-success` |
| 60% – 79% | #61A8FF | hardcoded — see `ui-tokens.md` note |
| Below 60% | #FF8904 | `--color-warning` |

---

## Child Media Display

### Profile Images

```
aspect-ratio:  4:3 or 1:1
border-radius: --radius-lg (12px)
```

Always use Next.js `<Image>` component. Never use `<img>` tags.

### Video Cards

```
aspect-ratio:  16:9
border-radius: --radius-lg (12px)
controls:      minimal — matching --color-accent for play button border
```

**Never auto-play audio.** Video card controls are always visible.

### Biography Block

Positioned below or beside the media element. Apply a `max-w-prose` constraint
to keep narrative text readable. Text follows Level 2 body rules (14px / 500 /
`--color-text-primary`).

---

## Tables (Ledger & Admin Lists)

```
row background:    --color-surface (#ffffff) — no alternating rows
row border:        border-bottom: 1px solid --color-border (#e7eaf3)
column headers:    12px / font-weight 500 / uppercase / --color-text-secondary (#6a7282)
row text:          14px / --color-text-primary (#101828)
row hover:         background --color-surface-secondary (#f9fafb)
```

---

## Empty States

Every section that can be empty must have a minimal empty state.

```
text:   --color-text-muted (#99a1af), 14px, centered
icon:   optional — muted, above the text, 24px or 32px
button: secondary button style if there is a logical next action
```

Empty state lives inside the card that would otherwise hold content. Do not
show blank space.

---

## Do Nots

- Never use Tailwind's built-in colour classes (`bg-purple-500`, `text-gray-600`)
- Never hardcode hex values in component files (exception: `#61A8FF` in
  `DonationMeter` fill logic only)
- Never define colours in `tailwind.config.ts` — use `@theme` in `globals.css`
- Never use coloured card backgrounds — cards are always white
- Never add gradients to card backgrounds or behind biographical text
- Never auto-play audio in video cards
- Never use more than one font weight in a single UI element
- Never show raw database errors, stack traces, or API exception dumps to users
- Never stack more than two levels of border radius inside each other
- Never use `position: fixed` for UI components — use normal document flow
- Never use system fonts as the primary typeface
- Never show individual donor names anywhere in the public interface