# UI Registry — Charity Web Application

Living document. Updated after every component is built using `/imprint`.
Read this before building any new component — match existing patterns exactly
before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component type already exists here
2. If yes — match its exact classes without deviation
3. If no — build it following `ui-rules.md` and `ui-tokens.md`, then run
   `/imprint` to add it here

After building any component — run `/imprint [filepath]` and this file will be
updated automatically.

---

## Token Quick Reference

These are the only values permitted in components. Never use Tailwind's
built-in colour classes or raw hex values.

| Token | Value | Use |
|---|---|---|
| `bg-[--color-background]` | `#f6f7fb` | Page background |
| `bg-[--color-surface]` | `#ffffff` | Card and input background |
| `bg-[--color-surface-secondary]` | `#f9fafb` | Table row hover, secondary panels |
| `border-[--color-border]` | `#e7eaf3` | All component borders |
| `text-[--color-text-primary]` | `#101828` | Headings, body, primary text |
| `text-[--color-text-secondary]` | `#6a7282` | Table column headers, labels |
| `text-[--color-text-muted]` | `#99a1af` | Timestamps, region subtitles, placeholders |
| `bg-[--color-accent]` | `#7c5cfc` | Primary button background, active nav item |
| `text-[--color-accent]` | `#7c5cfc` | Active nav item text, focus rings |
| `bg-[--color-accent-light]` | `#f3e8ff` | Card badge background |
| `text-[--color-success]` | `#10b981` | 80–100% funding fill, trend positive |
| `text-[--color-warning]` | `#ff8904` | Below 60% funding fill |
| `text-[--color-error]` | `#ef4444` | Airtel badge text, error states |
| `rounded-[--radius-sm]` | `4px` | Trend badges |
| `rounded-[--radius-md]` | `8px` | Buttons, form inputs |
| `rounded-[--radius-lg]` | `12px` | Media images |
| `rounded-[--radius-xl]` | `16px` | Cards |
| `rounded-[--radius-full]` | `9999px` | Badges, progress bar track and fill |

---

## Components

<!-- IMPRINT ENTRIES BEGIN -->

### Sidebar Navigation

File: `src/components/layout/AdminSidebar.tsx`
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Background | `bg-[--color-surface]` |
| Border right | `border-r border-[--color-border]` |
| Width | `w-[240px]` |
| Brand name text | `text-[16px] font-semibold text-[--color-text-primary]` |
| Brand subtitle text | `text-[12px] text-[--color-text-muted]` |
| Nav link — active | `bg-[--color-accent-light] text-[--color-accent] rounded-[--radius-md] px-3 py-2` |
| Nav link — inactive | `text-[--color-text-secondary] hover:bg-[--color-surface-secondary] rounded-[--radius-md] px-3 py-2` |
| Nav link text | `text-[14px] font-medium` |
| Brand area padding | `px-6 pt-8 pb-6` |
| Nav area padding | `px-3` |

**Pattern notes:** Sidebar is fixed left, full height. Active nav item uses a light purple background pill with purple text (no bold/underline change — colour only). Inactive items get gray text with background highlight on hover. No icons on any nav item.

---

### Card

File: All components
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Background | `bg-[--color-surface]` |
| Border | `border border-[--color-border]` |
| Border radius | `rounded-[--radius-xl]` |
| Padding | `p-6` |
| Shadow | `shadow-sm` |
| Title text | `text-[16px] font-semibold text-[--color-text-primary]` |

**Pattern notes:** Every content section lives in a card — forms, stat panels, tables, charts. Never use coloured card backgrounds. Never stack more than two levels of border radius. Inner content (inside a card) uses `rounded-[--radius-md]` at most.

---

### Stat Card

File: `src/app/admin/dashboard/page.tsx`
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Background | `bg-[--color-surface]` |
| Border | `border border-[--color-border]` |
| Border radius | `rounded-[--radius-xl]` |
| Padding | `p-6` |
| Shadow | `shadow-sm` |
| Label text | `text-[12px] text-[--color-text-muted]` |
| Value text | `text-[30px] font-semibold text-[--color-text-primary]` |

**Pattern notes:** Stat cards sit in a horizontal row (grid of 4). The label is small muted text above a large bold number. No icon, no hover effect.

---

### Form Input

File: `src/components/admin/ProfileForm.tsx`
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Background | `bg-[--color-surface]` |
| Border | `border border-[--color-border]` |
| Border radius | `rounded-[--radius-md]` |
| Text | `text-[14px] text-[--color-text-primary]` |
| Placeholder | `placeholder:text-[--color-text-muted]` |
| Focus | `focus:border-[--color-accent] focus:ring-1 focus:ring-[--color-accent]` |
| Padding | `px-3 py-2` |
| Width | `w-full` |
| Label | `block text-[14px] font-medium text-[--color-text-primary]` |
| Top margin (label to input) | `mt-1` |
| Layout gap | `space-y-6` |
| Select dropdown | Same as input, no additional styling |

**Pattern notes:** Text inputs, email inputs, date inputs, textareas, and select dropdowns all share the exact same classes. Textarea additionally uses `rows={4}`. File inputs use Tailwind `file:` variant with `file:bg-[--color-accent-light] file:text-[--color-accent]` on hover becomes `file:bg-[--color-accent] file:text-[--color-accent-foreground]`.

---

### Button — Primary

File: All components
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Background | `bg-[--color-accent]` |
| Text | `text-[--color-accent-foreground]` |
| Border radius | `rounded-[--radius-md]` |
| Font | `text-[14px] font-medium` |
| Padding | `px-4 py-2` (inline) / `px-6 py-2` (form submit) |
| Hover | `hover:bg-[--color-accent-dark]` |
| Disabled | `disabled:opacity-50` |

**Pattern notes:** Primary buttons use the accent purple as background with white text. Hover darkens the purple. Full-width (`w-full`) variant used for login form. Standard padding is `px-4 py-2`; form submit buttons use `px-6 py-2`.

---

### Button — Secondary

File: `src/components/admin/ProfileForm.tsx`
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Background | `bg-[--color-surface]` |
| Border | `border border-[--color-border]` |
| Text | `text-[--color-text-primary]` |
| Border radius | `rounded-[--radius-md]` |
| Font | `text-[14px] font-medium` |
| Padding | `px-6 py-2` |
| Hover | `hover:bg-[--color-surface-secondary]` |

**Pattern notes:** Secondary buttons are outlined with a border (no fill background). Used for Cancel / Back actions. Background changes to surface-secondary on hover.

---

### Badge — Status

File: All components
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Border radius | `rounded-[--radius-full]` |
| Padding | `px-2 py-0.5` |
| Font | `text-[12px] font-medium` |
| Display | `inline-block` |
| — `settled` background | `bg-[--color-success-lightest]` |
| — `settled` text | `text-[--color-success-dark]` |
| — `pending` background | `bg-[#FFF9E6]` |
| — `pending` text | `text-[#B38F00]` |
| — `initiated` background | `bg-[--color-accent-light]` |
| — `initiated` text | `text-[--color-accent]` |
| — `failed` background | `bg-[#FFF0F0]` |
| — `failed` text | `text-[--color-error]` |
| — `refunded` background | `bg-[--color-surface-secondary]` |
| — `refunded` text | `text-[--color-text-secondary]` |
| — Active (profile) | `bg-[--color-success-lightest] text-[--color-success-dark]` |
| — Inactive (profile) | `bg-[--color-surface-secondary] text-[--color-text-secondary]` |
| — Capitalize | `capitalize` |

**Pattern notes:** Status badges are pill-shaped with status-specific colour pairs matching `ui-rules.md`. The `capitalize` class transforms the raw status string for display.

---

### Badge — Provider

File: All components
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Border radius | `rounded-[--radius-full]` |
| Padding | `px-2 py-0.5` |
| Font | `text-[12px] font-medium` |
| Display | `inline-block` |
| — `CARD` background | `bg-[--color-accent-light]` |
| — `CARD` text | `text-[--color-accent]` |
| — `MTN_MOMO` background | `bg-[#FFF9E6]` |
| — `MTN_MOMO` text | `text-[--color-mtn-momo-text]` |
| — `AIRTEL_MONEY` background | `bg-[--color-airtel-bg]` |
| — `AIRTEL_MONEY` text | `text-[--color-error]` |

**Pattern notes:** Provider badges follow the same pill shape as status badges with provider-specific colour pairs. The displayed label uses a helper mapping: `CARD` → "Card", `MTN_MOMO` → "MTN MoMo", `AIRTEL_MONEY` → "Airtel".

---

### Table

File: All admin list pages
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Width | `w-full` |
| Text align | `text-left` |
| Font | `text-[14px]` |
| Header text | `text-[12px] font-medium uppercase text-[--color-text-secondary]` |
| Header border | `border-b border-[--color-border]` |
| Row border | `border-b border-[--color-border]` |
| Row hover | `hover:bg-[--color-surface-secondary]` |
| Cell padding | `py-3 pr-4` (header) / `py-3 pr-4` (body) / `pb-3` (last col header) |
| Empty state text | `text-center text-[14px] text-[--color-text-muted]` |

**Pattern notes:** Tables use no alternating row colours — every row white, hover highlight only. Column headers are small uppercase gray text. Cells use primary text colour.

---

### Dropdown / Select Filter

File: `src/app/admin/dashboard/children/page.tsx`
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Background | `bg-[--color-surface]` |
| Border | `border border-[--color-border]` |
| Border radius | `rounded-[--radius-md]` |
| Text | `text-[14px] text-[--color-text-primary]` |
| Padding | `px-3 py-1.5` |
| Focus | `focus:border-[--color-accent] focus:ring-1 focus:ring-[--color-accent]` |

**Pattern notes:** Filter dropdowns are smaller than form inputs (tighter vertical padding `py-1.5` vs `py-2`). Same focus ring pattern. Used in admin list page filter bars.

---

### Progress Bar (Funding Meter)

File: `src/app/admin/dashboard/children/page.tsx`
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Track background | `bg-[--color-border]` |
| Track height | `h-2` |
| Track width | `w-20` |
| Track radius | `rounded-[--radius-full]` |
| Fill radius | `rounded-[--radius-full]` |
| Fill colour — 80%+ | `bg-[--color-success]` |
| Fill colour — 60-79% | `backgroundColor: "#61A8FF"` |
| Fill colour — <60% | `bg-[--color-warning]` |
| Percentage text | `text-[12px] text-[--color-text-secondary]` |

**Pattern notes:** Inline horizontal meter. Track is a short fixed width (`w-20`) with percentage text beside it. Fill transitions via `transition-all`. The 60-79% blue colour (`#61A8FF`) is the single allowed hardcoded hex value in the project (per `ui-rules.md`).

---

### ChildCard (Public Directory Card) — Redesigned June 28

File: `src/components/cards/ChildCard.tsx`
Last updated: 2026-06-28

| Zone | Property | Class |
|---|---|---|
| **Link wrapper** | Container | `block bg-[--color-surface] rounded-[--radius-xl] border border-[--color-border] shadow-sm overflow-hidden group` |
| | Hover | `hover:shadow-[--shadow-card-hover] hover:-translate-y-1 transition-all duration-200` |
| **Zone 1 — Image** | Container | `relative h-56 bg-[--color-surface-muted] overflow-hidden` |
| | Image fill | `object-cover group-hover:scale-105 transition-transform duration-500` |
| | Gradient overlay | `absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent` |
| | Status badge (top-left) | `absolute top-3 left-3` -> uses `<Badge variant="success">` |
| | Name overlay (bottom-left) | `absolute bottom-3 left-3 right-3` -> `text-white text-lg font-bold drop-shadow-sm` |
| | Video icon (top-right) | `absolute top-3 right-3 bg-black/50 rounded-full w-9 h-9 backdrop-blur-sm` |
| | Empty fallback | `text-6xl font-bold text-[--color-text-muted]` (initial letter) |
| **Zone 2 — Video** | Video label | `px-4 pt-3 flex items-center gap-1.5` -> `text-xs text-[--color-brand-purple] font-medium` with `Play` icon |
| **Zone 3 — Footer** | Content padding | `p-4 flex flex-col gap-2` |
| | Region text | `text-xs text-[--color-text-secondary]` |
| | Quote preview | `text-sm text-[--color-text-secondary] italic leading-relaxed line-clamp-2` with `&ldquo;` `&rdquo;` |
| | CTA — Primary ("Walk with {Name}") | `flex-1 text-center bg-[--color-brand-purple] text-white text-sm font-semibold py-2.5 rounded-[--radius-md] hover:bg-[--color-brand-purple-dark]` |
| | CTA — Outline ("Quick Donate") | `flex-1 text-center border border-[--color-border] text-[--color-text-primary] text-sm font-semibold py-2.5 rounded-[--radius-md] hover:bg-[--color-surface-secondary]` |
| | CTA row | `flex gap-2 mt-auto pt-2` |
| | Both CTAs | `onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = href; }}` |

**Pattern notes:** ChildCard is a self-contained card wrapping a full `<Link>` to the child profile. Three visual zones stacked vertically. Image zone uses a dark gradient overlay at the bottom for name readability. Status badge uses the existing `<Badge variant="success">` — the "Available" label is hardcoded since sponsorship status is computed from funding data not available at listing level. Both CTA buttons stop propagation so clicking them navigates to their specific destination instead of the card's link. The card lifts on hover (`-translate-y-1` + enhanced shadow). Name uses `text-lg font-bold` inside the image overlay (not in the footer).

---

### Navbar (Public)

File: `src/components/layout/Navbar.tsx`
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Container background | `bg-[--color-surface]` |
| Container border | `border-b border-[--color-border]` |
| Container height | `h-16` |
| Container padding | `px-6` |
| Layout | `flex items-center justify-between` |
| Brand text | `text-[16px] font-semibold text-[--color-text-primary]` |
| Nav item gap | `gap-6` |
| Nav link text | `text-[14px] font-medium text-[--color-text-secondary]` |
| Nav link hover | `hover:text-[--color-accent]` |

**Pattern notes:** The public navbar is a simple top-of-page navigation bar. Brand name is "Hope Bridge Sponsorship" (public-facing). Active state is colour change only (accent colour), matching the ui-rules navbar spec. No sidebar on public pages — only the top navbar.

---

### Filter Pill (Status Chips)

File: `src/app/sponsor/page.tsx`
Last updated: 2026-06-28

| Property | Class |
|---|---|
| Font | `text-sm font-medium` |
| Padding | `px-4 py-1.5` |
| Radius | `rounded-[--radius-full]` |
| — Active background | `bg-[--color-brand-purple]` |
| — Active text | `text-white` |
| — Active border | `border-[--color-brand-purple]` |
| — Inactive background | `bg-[--color-surface]` |
| — Inactive border | `border border-[--color-border]` |
| — Inactive text | `text-[--color-text-secondary]` |
| — Inactive hover | `hover:border-[--color-brand-purple] hover:text-[--color-brand-purple]` |

**Pattern notes:** Used for sponsorship status filter chips (All, Available, Partially Sponsored, Fully Sponsored). Pill-shaped with accent purple fill active state, bordered surface inactive. Replaced the previous region filter buttons. Each chip is a `<Link>` to the same page with updated `status` search param.

---

### Sponsor Page Header

File: `src/app/sponsor/page.tsx`
Last updated: 2026-06-28

| Property | Class |
|---|---|
| Eyebrow badge | `<Badge variant="purple">` — follows existing badge pattern |
| Headline | `text-[clamp(28px,4vw,40px)] font-extrabold text-[--color-foreground] leading-tight` |
| Accent word (headline) | `text-[--color-brand-purple]` — wraps "Child" in `<span>` |
| Subtext | `text-[--color-text-secondary] mt-3 max-w-2xl text-sm sm:text-base leading-relaxed` |

**Pattern notes:** The sponsor page header uses the same eyebrow/highlighted-word pattern as the landing page hero. Centered on mobile (`text-center sm:text-left`). The eyebrow uses the existing purple variant badge. Currently used as the top section header only — not applied to other pages yet.

### Search Input (Sponsor Page)

File: `src/app/sponsor/page.tsx`
Last updated: 2026-06-28

| Property | Class |
|---|---|
| Container | `relative flex-1 max-w-sm` |
| Icon | `absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-muted] pointer-events-none` |
| Input element | `w-full h-9 pl-9 pr-3 rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] text-sm text-[--color-foreground] placeholder:text-[--color-text-muted] focus:border-[--color-brand-purple] focus:ring-1 focus:ring-[--color-brand-purple] outline-none transition-colors` |

**Pattern notes:** The search input is wrapped in a `<form method="GET" action="/sponsor">` that includes all existing search params as hidden inputs so the search works without JavaScript. The `Search` icon from lucide-react is positioned absolutely inside the input. Uses the standard input border/focus tokens from the project.

### Public Page Layout

File: `src/app/sponsor/layout.tsx`
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Page background | `bg-[--color-background]` |
| Layout | `flex min-h-screen flex-col` |
| Main max width | `max-w-[1440px]` |
| Main padding | `px-8 py-8` |
| Main alignment | `mx-auto w-full` |

**Pattern notes:** Public pages follow a centered layout with a top navbar and max-width `6xl` (`1152px`). No sidebar. The `--color-background` is used as the page background. All public pages should use this layout. The sponsor page uses `py-12` vertical padding (was `py-10`) to give more breathing room with the new header and search bar.

---

### DonationMeter (Public Profile)

File: `src/components/cards/DonationMeter.tsx`
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Label text | `text-[14px] font-medium text-[--color-text-primary]` |
| Amount text | `text-[14px] text-[--color-text-secondary]` |
| Track background | `bg-[--color-border]` |
| Track height | `h-2` |
| Track width | `w-full` |
| Track radius | `rounded-[--radius-full]` |
| Fill radius | `rounded-[--radius-full]` |
| Fill colour — 80%+ | `backgroundColor: "var(--color-success)"` |
| Fill colour — 60-79% | `backgroundColor: "#61A8FF"` |
| Fill colour — <60% | `backgroundColor: "var(--color-warning)"` |
| Percentage text | `text-[12px] text-[--color-text-muted]` |
| Layout | label/amount on one row, meter below, pct right-aligned below |

**Pattern notes:** Unlike the admin table's compact inline meter (`w-20`), the DonationMeter is full-width (`w-full`) with a label row showing the goal/donated amounts. Used on the public child profile page as the primary funding display.

---

### ChildVideoCard

File: `src/components/cards/ChildVideoCard.tsx`
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Container background | `bg-[--color-surface-secondary]` |
| Aspect ratio | `aspect-video` (16:9) |
| Radius | `rounded-[--radius-lg]` |
| Overflow | `overflow-hidden` |
| Video fill | `h-full w-full object-cover` |
| Controls | Native browser controls, `controlsList="nodownload"` |

**Pattern notes:** Used on the public child profile page when `video_url` exists. Aspect ratio 16:9 with `rounded-[--radius-lg]` consistent with image hero styling. Never auto-plays audio. Controls are always visible.

---

### Child Profile Page (Public)

File: `src/app/sponsor/[id]/page.tsx`
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Hero/CTA layout | `grid grid-cols-1 gap-8 lg:grid-cols-5` |
| Hero span | `lg:col-span-3` |
| CTA sidebar span | `lg:col-span-2` |
| Hero image ratio | `aspect-[4/3]` |
| Hero image radius | `rounded-[--radius-lg]` |
| Hero image background | `bg-[--color-surface-secondary]` |
| Child name + age | `text-[16px] font-semibold text-[--color-text-primary]` |
| Region badge | `rounded-[--radius-full] border border-[--color-border] bg-[--color-surface-secondary] px-2 py-0.5 text-[12px] font-medium text-[--color-text-secondary]` |
| Donor count card | `rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] p-6 shadow-sm` |
| Donor count text | `text-[14px] text-[--color-text-primary]` with `font-semibold` on number |
| Sponsor CTA | `w-full rounded-[--radius-md] bg-[--color-accent] px-6 py-2 text-center text-[14px] font-medium text-[--color-accent-foreground] hover:bg-[--color-accent-dark]` |
| Biography container | `max-w-prose` |
| Biography text | `text-[14px] leading-relaxed text-[--color-text-primary] whitespace-pre-wrap` |

**Pattern notes:** The profile page uses a two-column layout on desktop: hero image (3/5 width) and sidebar with CTA (2/5 width). The biography sits full-width below both columns. The narrative is displayed with `whitespace-pre-wrap` to preserve line breaks. If `video_url` exists, the hero shows a `ChildVideoCard` (16:9) instead of the image (4:3). Missing profile images show a large person icon placeholder. Returns 404 if `is_active = false` or child not found.

---

### PaymentSelector

File: `src/components/donation/PaymentSelector.tsx`
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Grid | `grid grid-cols-2 gap-4` |
| Card — selected | `border-[--color-accent] ring-2 ring-[--color-accent]` |
| Card — inactive | `border-[--color-border] bg-[--color-surface] hover:border-[--color-accent]` |
| Card radius | `rounded-[--radius-xl]` |
| Card shadow | `shadow-sm` |
| Card padding | `p-4` |
| Card title text | `text-[14px] font-medium text-[--color-text-primary]` |
| Card subtitle text | `text-[12px] text-[--color-text-muted]` |
| Network sub-button — selected | `border-[--color-accent] bg-[--color-accent-light] text-[--color-accent]` |
| Network sub-button — inactive | `border-[--color-border] bg-[--color-surface] text-[--color-text-primary] hover:border-[--color-accent]` |
| Network sub-button radius | `rounded-[--radius-md]` |
| Network sub-button font | `text-[14px] font-medium` |

**Pattern notes:** PaymentSelector shows two payment method cards side by side. When "Mobile Money" is selected, two network sub-buttons appear below (MTN MoMo / Airtel) in their own 2-column grid. Selected card uses accent border + ring; sub-buttons use accent border + light background when active.

### Donation Flow Page

File: `src/app/sponsor/[id]/donate/page.tsx`
Last updated: 2026-06-27

| Property | Class |
|---|---|
| Page max width | `max-w-lg`, `mx-auto` |
| Title | `text-[16px] font-semibold text-[--color-text-primary]` |
| Description | `text-[14px] text-[--color-text-muted]` |
| Form layout gaps | `space-y-6` |
| Amount prefix box | `rounded-[--radius-md] border border-[--color-border] bg-[--color-surface] px-3 flex items-center` |
| Amount prefix text | `text-[14px] text-[--color-text-muted]` |
| Amount hint | `text-[12px] text-[--color-text-muted]` |
| Input | Standard form input pattern per registry |
| Error text | `text-[14px] text-[--color-error]` |
| Continue / Submit button | Standard primary button pattern per registry |
| Back button | Standard secondary button pattern per registry |

**Pattern notes:** The donation page is a two-step flow managed via `useState` step tracking. Step 1 collects amount and email locally; Step 2 shows payment method + Turnstile and submits via `useActionState`. The form uses `useActionState` with pending state for the submit button. On success, the page redirects to the Flutterwave checkout URL. All form data is passed through hidden inputs from Step 1.

### Landing Page

File: `src/app/page.tsx`
Last updated: 2026-06-28

| Property | Class |
|---|---|
| Page background | `bg-[--color-background]` |
| Navbar background | `bg-[--color-surface] border-b border-[--color-border]` |
| Navbar brand text | `text-[18px] font-semibold text-[--color-foreground]` |
| Nav link text | `text-[14px] text-[--color-text-secondary] hover:text-[--color-brand-purple]` |
| Nav link gap | `gap-8` |
| Hero container | `bg-[--color-brand-purple-light] rounded-[--radius-xl] shadow-[--shadow-card]` |
| Hero eyebrow badge | `rounded-[--radius-full] bg-[--color-brand-purple]/10 text-[--color-brand-purple] text-[11px] font-semibold tracking-widest uppercase` |
| Hero headline | `text-[clamp(36px,5vw,52px)] font-extrabold text-[--color-foreground]` |
| Hero accent word | `text-[--color-brand-purple]` |
| Hero subtext | `text-[16px] text-[--color-text-secondary] leading-relaxed` |
| Inline accent highlight | `text-[--color-brand-purple] font-medium` |
| Pill CTA — primary | `rounded-[--radius-full] bg-[--color-brand-purple] text-white text-[14px] font-semibold px-7 py-3 hover:bg-[--color-brand-purple-dark]` |
| Pill CTA — outline | `rounded-[--radius-full] border-2 border-[--color-brand-purple] text-[--color-brand-purple] text-[14px] font-semibold px-7 py-3 hover:bg-[--color-brand-purple] hover:text-white` |
| Mission section | `grid grid-cols-1 lg:grid-cols-2 gap-12` |
| Mission headline | `text-[clamp(24px,3vw,32px)] font-bold text-[--color-foreground]` |
| Mission accent — sponsor | `text-[--color-brand-teal]` |
| Mission accent — raise | `text-[--color-brand-purple]` |
| Mission visual placeholder | `bg-[--color-brand-purple-light] rounded-[--radius-xl]` |
| Floating stat badge | `bg-[--color-surface] rounded-[--radius-lg] shadow-[--shadow-card]` |
| Section headline | `text-[clamp(24px,3vw,32px)] font-bold text-[--color-foreground]` |
| Section subtext | `text-[14px] text-[--color-text-secondary]` |
| Child card | `bg-[--color-surface] rounded-[--radius-xl] border border-[--color-border] p-6 shadow-[--shadow-card] hover:shadow-[--shadow-card-hover] hover:-translate-y-1 transition-all duration-200` |
| Avatar circle | `w-16 h-16 rounded-full bg-[--color-surface-muted] border-2 border-[--color-border]` |
| Child name | `text-[16px] font-bold text-[--color-foreground]` |
| Child region/accent | `text-[12px] text-[--color-brand-purple]` |
| Child quote | `text-[14px] text-[--color-text-secondary] italic leading-relaxed` |
| Child CTA | `w-full bg-[--color-brand-purple] text-white text-[14px] font-semibold py-2.5 rounded-[--radius-md] hover:bg-[--color-brand-purple-dark]` |
| Stats bar | `bg-[--color-surface] border-y border-[--color-border]` |
| Stat number | `text-[clamp(36px,4vw,52px)] font-bold text-[--color-brand-purple]` |
| Stat label | `text-[14px] text-[--color-text-muted]` |
| CTA banner | `bg-[--color-brand-purple-light] rounded-[--radius-2xl]` |
| CTA headline | `text-[clamp(24px,3vw,36px)] font-bold text-[--color-foreground]` |
| CTA body | `text-[14px] text-[--color-text-secondary] leading-relaxed` |
| CTA button | `rounded-[--radius-full] bg-[--color-brand-purple] text-white font-semibold px-9 py-3.5 hover:bg-[--color-brand-purple-dark]` |
| Social proof | `text-[12px] text-[--color-text-muted]` with `bg-[--color-success]` dot |
| Footer | `border-t border-[--color-border] py-10` |
| Footer text | `text-[12px] text-[--color-text-muted]` |
| Footer links gap | `gap-6` |

**Pattern notes:** The landing page follows a top-to-bottom single-column structure with max-width 6xl (`1152px`). Hero is a rounded lavender card with shadow. All CTAs use relational language ("Walk with [Name]", "Meet our children", "Walk with a child") per `ui-rules.md` — never "Sponsor now" or "Donate". Children are fetched from the database on each request (force-dynamic). No funding meters or payment badges appear on this page. Cards use `hover:-translate-y-1` lift effect on the featured children grid. The hero background uses `--color-brand-purple-light` as a section container, not a card background (following the rule that individual content cards stay white). Pill-shaped buttons use `rounded-[--radius-full]` while regular CTAs use `rounded-[--radius-md]`.

<!-- IMPRINT ENTRIES END -->