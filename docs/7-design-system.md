# Design System

> **Navigation:** [Back to Table of Contents](./1-table-of-contents.md)

All values sourced directly from `src/styles/theme.css` and component code.

---

## Dark Mode

### Activation Mechanism

Defined in `src/styles/tailwind.css` (Tailwind v4 syntax):

```css
@custom-variant dark (&:is(.dark *));
```

This means dark mode activates when **any ancestor** element carries the `.dark` class — not just `<html>`. Add `.dark` to the root `<div>` or any wrapper to scope dark mode.

### Two-Layer System

Dark mode is applied in two complementary ways. Both must be respected when building components:

| Layer | How | When to use |
|---|---|---|
| **CSS Variables** | `.dark {}` in `theme.css` — tokens flip automatically | For all semantic tokens (`--surface-1`, `--text-primary`, `--brand-blue`, etc.) |
| **Tailwind `dark:` prefix** | Utility class override per element | For hardcoded values not covered by a CSS var, or Tailwind color aliases (`gray-200`, `white/5`, etc.) |

### CSS Variable Flips (`.dark {}`)

All semantic tokens defined in `theme.css` flip automatically. Key changes:

| Token | Light | Dark |
|---|---|---|
| `--bg-base` | `#f9fafb` | `#1a1a1f` |
| `--surface-1` | `#ffffff` | `#242429` |
| `--surface-2` | `#f3f4f6` | `#2d2d33` |
| `--text-primary` | `#111827` | `#f5f5f7` |
| `--text-secondary` | `#4b5563` | `#8e8e93` |
| `--brand-blue` | `#2563eb` | `#0a84ff` |
| `--state-focus` | `#2563eb` | `#0a84ff` |
| `--border-subtle` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` |
| `--bg-grid` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.02)` |
| `--status-success` | `#16a34a` | `#4ade80` |
| `--status-warning` | `#d97706` | `#f59e0b` |
| `--status-danger` | `#dc2626` | `#ef4444` |
| `--status-info` | `#2563eb` | `#60a5fa` |
| `--destructive` | `#d4183d` | `oklch(0.396 0.141 25.723)` |
| `--border` | `rgba(0,0,0,0.1)` | `oklch(0.269 0 0)` |
| `--input` | `transparent` | `oklch(0.269 0 0)` |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.439 0 0)` |
| `--muted` | `#ececf0` | `oklch(0.269 0 0)` |
| `--muted-foreground` | `#717182` | `oklch(0.708 0 0)` |
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` |

### Background Grid — Separate Overlay Elements

The background grid pattern uses **two separate DOM elements** toggled by dark mode (not a single element with a dark variant):

```tsx
{/* Light mode only */}
<div className="absolute inset-0 pointer-events-none z-0 dark:hidden"
  style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), ...',
           backgroundSize: '24px 24px' }} />

{/* Dark mode only */}
<div className="absolute inset-0 pointer-events-none z-0 hidden dark:block"
  style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), ...',
           backgroundSize: '40px 40px',
           maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)' }} />
```

Do **not** try to merge these into one element with `dark:` overrides — they have structurally different styles (size, mask).

### Component-Level `dark:` Overrides

These are hardcoded in components with Tailwind's `dark:` prefix. They supplement or override CSS vars for values that have no token.

#### Surfaces & Backgrounds

| Light class | Dark override | Usage |
|---|---|---|
| `bg-white/95` | `dark:bg-[#1a1a1f]/95` | Sidebar, mobile header (with `backdrop-blur-md`) |
| `bg-white` | `dark:bg-[#1a1a1f]` | Sidebar footer, context panel bottom |
| `bg-gray-50` | `dark:bg-[#242429]` | Active sidebar item, card header row |
| `bg-gray-100` | `dark:bg-[#242429]` | Icon containers in context panel |
| `bg-gray-50` (hover) | `dark:hover:bg-[#242429]` | Sidebar item hover |
| `bg-gray-100` (hover) | `dark:hover:bg-[#2d2d33]` | Action grid item hover, ghost button hover |
| `bg-white` (card) | `dark:bg-[#242429]` | Metric cards, bot message bubble, option cards |
| `bg-white` (action) | `dark:bg-[#1a1a1f]` | Action grid item default |
| `bg-blue-50` | `dark:bg-[#0a84ff]/10` | Icon container (brand color), selected option bg |
| `bg-green-50` | `dark:bg-green-500/10` | Success action button bg |
| `bg-gray-100` (input) | `dark:bg-white/5` | Icon button hover in composer |

#### Text

| Light class | Dark override | Usage |
|---|---|---|
| `text-gray-900` | `dark:text-white` | Primary headings, active sidebar text |
| `text-gray-700` | `dark:text-gray-400` | Inactive sidebar item text |
| `text-gray-600` | `dark:text-gray-500` | Card label text, secondary body |
| `text-gray-500` | `dark:text-gray-400` | Icon colors, metadata, captions |
| `text-gray-500` | `dark:text-gray-600` | Timestamps, dimmed metadata |
| `text-gray-800` | `dark:text-gray-200` | Action item labels |
| `text-gray-800` | `dark:text-gray-300` | Data values in context panel |
| `text-blue-600` | `dark:text-[#0a84ff]` | Brand interactive text, active icons |
| `text-blue-600` | `dark:text-blue-400` | Active sidebar item preview text |
| `text-green-700` | `dark:text-green-400` | Success status text |
| `text-red-600` | `dark:text-red-400` | Danger/error text |
| `text-gray-900` (input) | `dark:text-[#f5f5f7]` | Input text value |
| `text-blue-900` (selected) | `dark:text-white` | Selected option heading |
| `placeholder:text-gray-500` | `dark:placeholder:text-gray-500/70` | Input placeholder (reduced opacity in dark) |

#### Borders

| Light class | Dark override | Usage |
|---|---|---|
| `border-gray-200` | `dark:border-white/5` | All standard dividers, card borders, sidebar borders |
| `border-gray-200` | `dark:border-white/10` | Card container border (slightly more visible) |
| `border-transparent` (hover) | `dark:hover:border-white/5` | Sidebar item hover border |
| `border-blue-200` | `dark:border-blue-500/20` | Active sidebar item border |
| `border-blue-300` (hover) | `dark:hover:border-[#0a84ff]/20` | Metric card hover border |
| `border-blue-300` (hover) | `dark:hover:border-[#0a84ff]/30` | Action item + composer hover border |
| `border-gray-100` | `dark:border-white/5` | Intra-card dividers |
| `border-green-200` | `dark:border-green-500/30` | Success action border |
| `border-green-200` | `dark:border-green-500/20` | Status badge border |
| `border-gray-300` (radio) | `dark:border-gray-500` | Unselected radio |
| `border-blue-600` (selected) | `dark:border-[#0a84ff]` | Selected option/radio |

#### Primary Button

| State | Light | Dark |
|---|---|---|
| Default bg | `bg-blue-600` | `dark:bg-[#0a84ff]` |
| Hover bg | `hover:bg-blue-700` | `dark:hover:bg-[#0071e3]` |
| Shadow | `shadow-blue-600/20` | `dark:shadow-blue-500/20` |

> Note: `#0071e3` is the dark mode button hover — this value is **not** in the CSS var tokens.

#### Focus & Ring States

| Element | Light | Dark |
|---|---|---|
| Composer focus-within | `focus-within:ring-blue-100` | `dark:focus-within:ring-[#0a84ff]/20` |
| Composer focus-within border | `focus-within:border-blue-300` | `dark:focus-within:border-[#0a84ff]/30` |
| Selected option ring | `shadow-[0_0_0_1px_#2563eb]` | `dark:shadow-[0_0_0_1px_#0a84ff]` |
| Selected option bg | `bg-blue-50` | `dark:bg-[#0a84ff]/10` |

#### Shadows

| Light | Dark | Usage |
|---|---|---|
| `shadow-[0_0_12px_rgba(37,99,235,0.3)]` | `dark:shadow-[0_0_12px_rgba(10,132,255,0.3)]` | Sidebar avatar glow |
| `shadow-[0_0_8px_rgba(37,99,235,0.4)]` | `dark:shadow-[0_0_8px_rgba(10,132,255,0.4)]` | Mobile header avatar glow |
| `shadow-[0_0_4px_rgba(22,163,74,0.4)]` | `dark:shadow-[0_0_4px_rgba(74,222,128,0.5)]` | Active status dot glow |

#### Disabled / Opacity

| Light | Dark | Usage |
|---|---|---|
| `opacity-50` | `dark:opacity-30` | Disabled send button (stronger fade in dark) |

#### Gradient Fade (Chat scroll)

```tsx
// Light
bg-gradient-to-t from-gray-50 via-gray-50 to-transparent

// Dark (hardcoded, no token)
dark:from-[#1a1a1f] dark:via-[#1a1a1f]
```

#### SegmentedControl

```
Track bg:     bg-black/5  → dark:bg-black/20
Track border: border-black/5  → dark:border-white/5
Active bg:    bg-blue-600  → dark:bg-[#0a84ff]
Active shadow: shadow-md  → dark:shadow-[0_0_12px_rgba(10,132,255,0.4)]
Inactive text: text-gray-600 hover:text-gray-900  → dark:text-gray-400 dark:hover:text-gray-200
```

#### Radix UI Components (from `src/app/components/ui/`)

| Component | Key dark variant |
|---|---|
| `button` (outline) | `dark:bg-input/30 dark:border-input dark:hover:bg-input/50` |
| `button` (ghost) | `dark:hover:bg-accent/50` |
| `button` (destructive) | `dark:bg-destructive/60 dark:focus-visible:ring-destructive/40` |
| `input` | `dark:bg-input/30`, `dark:aria-invalid:ring-destructive/40` |
| `textarea` | `dark:bg-input/30`, same invalid ring |
| `switch` (unchecked) | `dark:data-[state=unchecked]:bg-input/80` |
| `switch` thumb | `dark:data-[state=checked]:bg-primary-foreground` |
| `badge` (destructive) | `dark:bg-destructive/60 dark:focus-visible:ring-destructive/40` |
| `radio-group` | `dark:bg-input/30` |

---

## Color Tokens

### Surfaces & Backgrounds

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--bg-base` | `#f9fafb` | `#1a1a1f` | Page background |
| `--bg-grid` | `rgba(0,0,0,0.04)` | `rgba(255,255,255,0.02)` | Grid overlay pattern |
| `--surface-1` | `#ffffff` | `#242429` | Cards, panels, chat bubbles |
| `--surface-2` | `#f3f4f6` | `#2d2d33` | Input backgrounds, secondary surfaces |
| `--background` | `#ffffff` | `oklch(0.145 0 0)` | Tailwind base background |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Tailwind base foreground |
| `--card` | `#ffffff` | `oklch(0.145 0 0)` | Radix card background |
| `--muted` | `#ececf0` | `oklch(0.269 0 0)` | Muted surface |

### Text

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--text-primary` | `#111827` | `#f5f5f7` | Headings, body copy |
| `--text-secondary` | `#4b5563` | `#8e8e93` | Captions, metadata, placeholders |
| `--muted-foreground` | `#717182` | `oklch(0.708 0 0)` | Muted/dimmed text |

### Brand & Interactive

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--brand-blue` | `#2563eb` | `#0a84ff` | Primary actions, links, focus rings, avatars |
| `--state-focus` | `#2563eb` | `#0a84ff` | Focus ring color |
| `--primary` | `#030213` | `oklch(0.985 0 0)` | Tailwind primary |

### Brand Alpha Tints (inline, not tokenised)

| Value | Usage |
|---|---|
| `rgba(37,99,235,0.1)` | Light mode button/chip hover bg |
| `rgba(10,132,255,0.1)` | Dark mode button/chip hover bg |
| `rgba(59,130,246,0.12)` | Icon container bg |
| `rgba(37,99,235,0.3)` | Light mode glow shadow |
| `rgba(10,132,255,0.3)` | Dark mode glow shadow |
| `rgba(10,132,255,0.4)` | Dark mode avatar/tab shadow |

### Borders

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--border` | `rgba(0,0,0,0.1)` | `oklch(0.269 0 0)` | Tailwind border |
| `--border-subtle` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` | Card borders, dividers |

### Status / Semantic

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--status-success` | `#16a34a` | `#4ade80` | Success, approved, low priority |
| `--status-warning` | `#d97706` | `#f59e0b` | Warning, reviewing, medium priority |
| `--status-danger` | `#dc2626` | `#ef4444` | Error, high priority, destructive |
| `--status-info` | `#2563eb` | `#60a5fa` | Informational, submitted status |
| `--destructive` | `#d4183d` | `oklch(0.396 0.141 25.723)` | Destructive actions |

### Status Badge Combos (inline)

| State | Background | Text |
|---|---|---|
| Submitted | `rgba(59,130,246,0.15)` | `#60A5FA` |
| Reviewing | `rgba(245,158,11,0.15)` | `#FBBF24` |
| Approved | `rgba(52,199,89,0.15)` | `#34C759` |
| High priority | `rgba(239,68,68,0.15)` | `var(--status-danger)` |
| Medium priority | `rgba(245,158,11,0.15)` | `var(--status-warning)` |
| Low priority | `rgba(34,197,94,0.15)` | `var(--status-success)` |

### Charts

| Token | Light | Dark |
|---|---|---|
| `--chart-1` | `oklch(0.646 0.222 41.116)` | `oklch(0.488 0.243 264.376)` |
| `--chart-2` | `oklch(0.6 0.118 184.704)` | `oklch(0.696 0.17 162.48)` |
| `--chart-3` | `oklch(0.398 0.07 227.392)` | `oklch(0.769 0.188 70.08)` |
| `--chart-4` | `oklch(0.828 0.189 84.429)` | `oklch(0.627 0.265 303.9)` |
| `--chart-5` | `oklch(0.769 0.188 70.08)` | `oklch(0.645 0.246 16.439)` |

### Sidebar

| Token | Light | Dark |
|---|---|---|
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `--sidebar-primary` | `#030213` | `oklch(0.488 0.243 264.376)` |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(0.269 0 0)` |

---

## Typography

### Scale

| Class | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `text-xs` | 12px | — | 400 | Labels, metadata, captions |
| `text-sm` | 14px | — | 400/500 | Secondary text, sidebar items |
| `text-base` | 16px | 1.5 | 400 | Body, inputs, buttons |
| `text-lg` | 18px | 1.5 | 500 | `h3`, emphasis |
| `text-xl` | 20px | 1.5 | 500 | `h2`, section headers |
| `text-2xl` | 24px | 1.5 | 500 | `h1` |
| `text-3xl` | 30px | — | 600 | Hero sub-headings |
| `text-4xl` | 36px | — | 600 | Hero headings (sm+) |
| `text-5xl` | 48px | — | 600 | Hero headings (md+) |
| `text-6xl` | 60px | — | 700 | Large display |

Responsive hero pattern: `text-3xl sm:text-4xl md:text-5xl`

### Weights

| Token | Value | Usage |
|---|---|---|
| `--font-weight-normal` | `400` | Body, inputs |
| `--font-weight-medium` | `500` | Headings h1–h4, labels, buttons |
| `font-semibold` | `600` | Subheadings, card titles |
| `font-bold` | `700` | Strong emphasis, display |

### Letter Spacing

| Value | Usage |
|---|---|
| `letterSpacing: '-0.02em'` | Hero headings (LoginEntry, BiometricSetup) |
| `letterSpacing: '0.02em'` | Product/brand name |
| `tracking-wider` (`0.05em`) | Uppercase section labels |

### Special

- `font-mono` + `tabular-nums`: timer displays in ChatComposer
- `line-clamp-1`: single-line truncation
- Gradient text: `WebkitBackgroundClip: 'text'` + `WebkitTextFillColor: 'transparent'` + `backgroundClip: 'text'`

---

## Spacing

Scale follows Tailwind's default 4px base unit. Values used in components:

| Scale | px | Common usage |
|---|---|---|
| `0.5` | 2px | `mt-0.5` micro nudge |
| `1` | 4px | Tight icon gaps |
| `1.5` | 6px | `py-1.5` compact pill padding |
| `2` | 8px | Icon padding, small gaps |
| `2.5` | 10px | Icon button padding |
| `3` | 12px | Card section gaps, `py-3` |
| `3.5` | 14px | `py-3.5` medium vertical |
| `4` | 16px | Standard component padding |
| `5` | 20px | Card body padding |
| `6` | 24px | Large section padding |
| `8` | 32px | Auth card padding, large gaps |
| `12` | 48px | Vertical breathing room |

**Special values (inline):**
- `paddingBottom: '120px'` — space below pinned ChatComposer in scroll areas
- `height: '20vh'` — breathing room spacer at bottom of message list

---

## Border Radius

| Class | Value | Usage |
|---|---|---|
| `rounded-lg` | 8px | Cards, inputs, small containers |
| `rounded-xl` | 12px | Message bubbles, panels |
| `rounded-2xl` | 16px | Larger cards, modals |
| `rounded-3xl` | 24px | Chat composer, floating elements |
| `rounded-full` | 9999px | Avatars, pills, SegmentedControl track, icon circles |
| `--radius` | `0.625rem` (10px) | Tailwind base radius token |
| `--radius-sm` | `calc(var(--radius) - 4px)` = 6px | — |
| `--radius-md` | `calc(var(--radius) - 2px)` = 8px | — |
| `--radius-lg` | `var(--radius)` = 10px | — |
| `--radius-xl` | `calc(var(--radius) + 4px)` = 14px | — |

---

## Shadows

| Class / Value | Usage |
|---|---|
| `shadow-sm` | Message bubbles |
| `shadow-md` | SegmentedControl active tab |
| `shadow-lg` | Cards, input trays, sidebars |
| `shadow-xl` | Auth cards, modals |
| `shadow-inner` | SegmentedControl track |
| `0 0 12px rgba(37,99,235,0.3)` | Avatar glow (light) |
| `0 0 12px rgba(10,132,255,0.3)` | Avatar glow (dark) |
| `0 0 8px rgba(37,99,235,0.4)` | Small avatar glow (light) |
| `0 0 8px rgba(10,132,255,0.4)` | Small avatar glow (dark) |
| `0 0 12px rgba(10,132,255,0.4)` | SegmentedControl active tab (dark) |
| `0 0 8px rgba(74,222,128,0.4)` | Progress bar success glow |
| `0 0 4px rgba(22,163,74,0.4)` | Status indicator dot (light) |
| `0 0 4px rgba(74,222,128,0.5)` | Status indicator dot (dark) |
| `0 8px 16px rgba(10,132,255,0.3)` | Button hover lift shadow |

---

## Animations

### Keyframes

```css
/* Messages, tiles entering — 250ms ease-out */
@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Quick reply chips — 200ms ease-out, translateY(6px) variant */
@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Cards — 220ms ease-out */
@keyframes cardReveal {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Checkmark icons — 150ms ease-out */
@keyframes checkmarkFadeIn {
  from { opacity: 0; }
  to   { opacity: 0.6; }
}

/* Underline grow — 200ms ease-out */
@keyframes underlineGrow {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

/* Generic fade — 200–250ms ease-in/ease-out */
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Bot message loading text — 2s ease-in-out infinite */
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Timing Reference

| Animation | Duration | Easing | Trigger |
|---|---|---|---|
| `slideUpFade` | 250ms | ease-out | Message/tile mount |
| `slideUpFade` (chips) | 200ms | ease-out | QuickReply chip mount |
| `cardReveal` | 220ms | ease-out | Card mount |
| `checkmarkFadeIn` | 150ms | ease-out | Step completion |
| `underlineGrow` | 200ms | ease-out | Status label |
| `fadeIn` | 200–250ms | ease-out | General entrance |
| `shimmer` | 2s | ease-in-out | Bot message loading |
| Waveform bars | 300ms | `cubic-bezier(0.4,0,0.2,1)` | ChatComposer recording |
| Login progress bar | 2s | `cubic-bezier(0.4,0,0.6,1)` | `animate-pulse` infinite |

### Motion.js (SegmentedControl)

```js
// layoutId="segment-bg" sliding background
transition: { type: "spring", stiffness: 300, damping: 30 }
```

### Hover / Interaction States

| Interaction | Property | Value |
|---|---|---|
| Button hover | `transform` | `translateY(-1px)` |
| Button press | `transform` | `translateY(0)` |
| Category card hover | `transform` | `scale(1.05)` |
| Chip press | `transform` | `scale(0.96)` |
| Button hover | `box-shadow` | `0 8px 16px rgba(10,132,255,0.3)` |
| Default transition | `transition` | `all 200ms ease-out` |

### Tailwind Transition Utilities Used

- `transition-all duration-200` — most interactive elements
- `transition-colors duration-300` — color-only changes
- `transition-opacity duration-500` — slow fades

---

## Layout & Grid

### Background Grid Pattern

```js
// Light mode — 24×24px grid
backgroundImage: `
  linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)
`
backgroundSize: '24px 24px'

// Dark mode — 40×40px grid with radial fade
backgroundImage: `
  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
`
backgroundSize: '40px 40px'
maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
```

### Content Width Constraints

| Class | Value | Usage |
|---|---|---|
| `max-w-md` | 448px | Login forms |
| `max-w-2xl` | 672px | Content columns, message widths |
| `max-w-4xl` | 896px | Home, ITServiceDesk main area |
| `w-[85%]` | 85% | Bot message bubble width |
| `w-[90%]` | 90% | Bot bubble on sm+ |
| `w-80` | 320px | Left sidebar (SalesHelpline) |

### Common Grid Patterns

```tsx
// Category cards: 2-col mobile → 4-col desktop
grid grid-cols-2 sm:grid-cols-4 gap-3

// Content: 1-col mobile → 2-col tablet
grid grid-cols-1 sm:grid-cols-2 gap-4

// Full-height app shell
flex flex-col h-screen overflow-hidden

// Chat area (sidebar + main)
flex flex-row h-full

// Pinned input tray
fixed bottom-0 left-0 right-0 z-20
```

---

## Breakpoints

Tailwind defaults, mobile-first:

| Prefix | Min-width | Primary usage in project |
|---|---|---|
| _(none)_ | 0px | Mobile base styles |
| `sm:` | 640px | Wider phone / small tablet adjustments |
| `md:` | 768px | Tablet layout shifts |
| `lg:` | 1024px | Sidebar visibility, desktop layouts |
| `xl:` | 1280px | Context drawers, extra panels |
| `dark:` | — | Dark mode variant |

### Key Responsive Patterns

```tsx
hidden lg:flex          // Sidebar — desktop only
lg:hidden               // Mobile header — mobile only
hidden xl:flex          // Context panel — xl only
flex-col sm:flex-row    // Stack → row
px-4 sm:px-6           // Tighter → looser horizontal padding
text-3xl sm:text-4xl md:text-5xl   // Progressive hero sizing
```

---

## Z-Index

| Value | Usage |
|---|---|
| `z-0` | Background grid overlay |
| `z-10` | Main scrollable content |
| `z-20` | Pinned ChatComposer tray, sidebar |
| `z-50` | Mobile sticky header |

---

## Components

### ChatComposer — 4 States

| State | Visual | Key props |
|---|---|---|
| `default` | Text input + mic icon + send button | Standard border, `var(--surface-1)` bg |
| `recording` | Waveform bars (20–60% height, 300ms interval) + elapsed timer | Border → `var(--brand-blue)`, timer in `font-mono tabular-nums` |
| `transcribing` | Shimmer gradient text + `animate-spin` loader | `background: linear-gradient(90deg, var(--text-secondary) 0%, var(--text-primary) 40%, ...)`, animated `background-position` |
| `transcriptReady` | Transcript text, active send button | Send button enabled, full opacity |

Focus ring on input: `border-color: var(--brand-blue)` + `box-shadow: 0 0 0 3px rgba(10,132,255,0.1)`

### SegmentedControl

```
Track:    bg-black/5 dark:bg-black/20  |  border border-black/5 dark:border-white/5  |  shadow-inner  |  rounded-full  |  p-1
Active:   bg-blue-600 dark:bg-[#0a84ff]  |  shadow-md dark:shadow-[0_0_12px_rgba(10,132,255,0.4)]  |  rounded-full
Motion:   layoutId="segment-bg"  |  spring stiffness:300 damping:30
Text z:   relative z-10
```

### Message Bubbles

```
User:    bg → var(--brand-blue)  |  color: white  |  rounded-2xl  |  px-4 py-3  |  max-w-[85%]  |  ml-auto  |  shadow-sm
Bot:     bg → var(--surface-1)   |  color: var(--text-primary)  |  rounded-2xl  |  px-4 py-3  |  max-w-[85%]  |  shadow-sm
Loading: shimmer gradient animation on text, 2s infinite
```

### Avatar

```
Size:    w-9 h-9 (36px)
Shape:   rounded-full
BG:      bg-blue-600 (light)  |  #0a84ff (dark)
Shadow:  shadow-[0_0_12px_rgba(37,99,235,0.3)] (light)  |  shadow-[0_0_12px_rgba(10,132,255,0.3)] (dark)
Text:    font-bold text-white text-sm, centered
```

### Cards

```
BG:      var(--surface-1)
Border:  1px solid var(--border-subtle)
Radius:  rounded-xl (12px) or rounded-2xl (16px)
Padding: p-4 or p-5
Shadow:  shadow-sm or shadow-lg
Hover:   transition-all duration-200, optional scale/shadow lift
```

### Sidebar (SalesHelpline)

```
Width:      w-80 (320px)
BG:         bg-white/95 dark:bg-[#1a1a1f]/95
Backdrop:   backdrop-blur-md
Border:     border-r border-gray-200 dark:border-white/5
Shadow:     shadow-xl
Z-index:    z-20
Visibility: hidden lg:flex
```

### Mobile Header

```
Position:  sticky top-0
Z-index:   z-50
Padding:   p-4
Border:    border-b 1px solid var(--border-subtle)
BG:        var(--surface-1) with optional backdrop-blur
```

### Progress Bar

```
Track:  bg-gray-100 dark:bg-gray-800  |  rounded-full  |  h-2
Fill:   bg-green-500 (success)  |  bg-red-500 (danger)  |  rounded-full
Glow:   shadow: 0 0 8px rgba(74,222,128,0.4)
```

### Buttons

**Primary**
```
bg: var(--brand-blue)  |  color: #fff  |  font-size: 16px  |  font-weight: 500
border: none  |  border-radius: rounded-xl or rounded-full  |  px-6 py-3
hover: bg #1a8fff  |  translateY(-1px)  |  box-shadow: 0 8px 16px rgba(10,132,255,0.3)
press: translateY(0)  |  shadow removed
disabled: opacity-50
```

**Secondary / Ghost**
```
bg: transparent  |  border: 1px solid var(--border-subtle)
color: var(--text-primary) or var(--text-secondary)
hover: bg rgba(10,132,255,0.1)  |  color: var(--brand-blue)
```

### Input

```
BG:          var(--surface-2) or --input-background (#f3f3f5)
Border:      1px solid var(--border-subtle)
Radius:      rounded-xl
Font-size:   16px (prevent iOS zoom)
Font-weight: 400
Placeholder: color var(--text-secondary), opacity 0.6
Focus:       border-color var(--brand-blue), box-shadow 0 0 0 3px rgba(10,132,255,0.1)
Read-only:   opacity 0.7, pointer-events none, cursor default
```

---

## Input & Form Tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--input` | `transparent` | `oklch(0.269 0 0)` | Input border |
| `--input-background` | `#f3f3f5` | — | Input fill |
| `--switch-background` | `#cbced4` | — | Toggle/switch track |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.439 0 0)` | Focus ring |

---

## Accessibility

- **Focus rings:** `border-color: var(--brand-blue)` + `box-shadow: 0 0 0 3px rgba(10,132,255,0.1)`
- **Color contrast:** `--text-primary` on `--surface-1` meets 4.5:1 in both modes
- **Motion:** All entrance animations ≤ 250ms; shimmer is the only infinite animation — disable with `prefers-reduced-motion`
- **Font size:** Inputs fixed at `16px` to prevent iOS auto-zoom
- **Disabled states:** `opacity-50` + `pointer-events-none` or `disabled` attribute

---

## Related Documents

- [Principles](./6-principles.md)
- [Agent Persona](./8-agent-persona.md)
- [Platform Access](./5-platform-access.md)

---

*Last updated: 2026-03-19*
