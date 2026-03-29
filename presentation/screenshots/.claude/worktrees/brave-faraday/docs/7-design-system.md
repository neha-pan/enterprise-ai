# Design System

> **Navigation:** [Back to Table of Contents](./1-table-of-contents.md)

---

## Overview

This document defines the visual and interaction design system for Blu for Enterprise. Use this as the single source of truth for all UI implementation.

---

## Design Tokens

### Color Palette

#### Primary Colors

<!-- TODO: Define actual color values -->

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#TBD` | Primary actions, links, key UI elements |
| `--color-primary-hover` | `#TBD` | Hover state for primary elements |
| `--color-primary-active` | `#TBD` | Active/pressed state |
| `--color-primary-subtle` | `#TBD` | Backgrounds, subtle emphasis |

#### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#TBD` | Success states, confirmations |
| `--color-warning` | `#TBD` | Warnings, caution states |
| `--color-error` | `#TBD` | Errors, destructive actions |
| `--color-info` | `#TBD` | Informational messages |

#### Neutral Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `#TBD` | Primary body text |
| `--color-text-secondary` | `#TBD` | Secondary, supporting text |
| `--color-text-disabled` | `#TBD` | Disabled state text |
| `--color-background` | `#TBD` | Page background |
| `--color-surface` | `#TBD` | Card/component backgrounds |
| `--color-border` | `#TBD` | Borders, dividers |

#### Agent-Specific Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-agent-message` | `#TBD` | Agent message bubbles |
| `--color-user-message` | `#TBD` | User message bubbles |
| `--color-agent-accent` | `#TBD` | Agent UI accents |

---

### Typography

#### Font Families

| Token | Value | Usage |
|-------|-------|-------|
| `--font-primary` | `TBD` | Body text, general UI |
| `--font-mono` | `TBD` | Code, technical content |

#### Font Sizes

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `--text-xs` | 12px | 16px | Captions, labels |
| `--text-sm` | 14px | 20px | Secondary text |
| `--text-base` | 16px | 24px | Body text |
| `--text-lg` | 18px | 28px | Large body, emphasis |
| `--text-xl` | 20px | 28px | Section headers |
| `--text-2xl` | 24px | 32px | Page headers |
| `--text-3xl` | 30px | 36px | Major headings |

#### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Emphasis, labels |
| `--font-semibold` | 600 | Headers, buttons |
| `--font-bold` | 700 | Strong emphasis |

---

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight spacing |
| `--space-2` | 8px | Default small gap |
| `--space-3` | 12px | Medium gap |
| `--space-4` | 16px | Default component padding |
| `--space-5` | 20px | Section gap |
| `--space-6` | 24px | Large gap |
| `--space-8` | 32px | Section separation |
| `--space-10` | 40px | Major sections |
| `--space-12` | 48px | Page-level spacing |

---

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small elements, tags |
| `--radius-md` | 8px | Cards, inputs |
| `--radius-lg` | 12px | Modals, large cards |
| `--radius-full` | 9999px | Pills, avatars |

---

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `TBD` | Subtle elevation |
| `--shadow-md` | `TBD` | Cards, dropdowns |
| `--shadow-lg` | `TBD` | Modals, popovers |

---

## Components

### Chat Interface

#### Message Bubble - Agent

```
┌─────────────────────────────────────┐
│ 🤖                                  │
│ Message content from the agent      │
│ with support for multiple lines.    │
│                                     │
│                           12:34 PM  │
└─────────────────────────────────────┘
```

**Specs:**
- Background: `--color-agent-message`
- Border radius: `--radius-lg`
- Padding: `--space-4`
- Max width: 80% of container

#### Message Bubble - User

```
┌─────────────────────────────────────┐
│                                     │
│       User message content          │
│                                     │
│ 12:35 PM                            │
└─────────────────────────────────────┘
```

**Specs:**
- Background: `--color-user-message`
- Border radius: `--radius-lg`
- Padding: `--space-4`
- Max width: 80% of container
- Alignment: Right

#### Input Area

```
┌───────────────────────────────────────────┐
│ ┌─────────────────────────────────┐  ┌──┐ │
│ │ Type a message...               │  │→ │ │
│ └─────────────────────────────────┘  └──┘ │
└───────────────────────────────────────────┘
```

**Specs:**
- Input background: `--color-surface`
- Border: `--color-border`
- Border radius: `--radius-md`
- Send button: `--color-primary`

---

### Buttons

#### Primary Button

```
┌─────────────────┐
│   Button Text   │
└─────────────────┘
```

**States:**
| State | Background | Text |
|-------|------------|------|
| Default | `--color-primary` | white |
| Hover | `--color-primary-hover` | white |
| Active | `--color-primary-active` | white |
| Disabled | `--color-border` | `--color-text-disabled` |

#### Secondary Button

**States:**
| State | Background | Border | Text |
|-------|------------|--------|------|
| Default | transparent | `--color-border` | `--color-text-primary` |
| Hover | `--color-surface` | `--color-primary` | `--color-primary` |

---

### Cards

#### Standard Card

```
┌─────────────────────────────────────┐
│ Card Title                     [⋮]  │
├─────────────────────────────────────┤
│                                     │
│ Card content goes here with         │
│ whatever information needed.        │
│                                     │
│ ┌─────────┐                         │
│ │ Action  │                         │
│ └─────────┘                         │
└─────────────────────────────────────┘
```

**Specs:**
- Background: `--color-surface`
- Border: `--color-border`
- Border radius: `--radius-lg`
- Padding: `--space-4`
- Shadow: `--shadow-sm`

---

### Form Elements

#### Text Input

**States:**
| State | Border | Background |
|-------|--------|------------|
| Default | `--color-border` | `--color-surface` |
| Focus | `--color-primary` | `--color-surface` |
| Error | `--color-error` | `--color-surface` |
| Disabled | `--color-border` | `--color-background` |

---

## Interaction Patterns

### Loading States

| Pattern | Usage |
|---------|-------|
| Skeleton | Content loading |
| Spinner | Action in progress |
| Typing indicator | Agent composing response |
| Progress bar | Multi-step processes |

### Agent Thinking Indicator

```
┌─────────────────────────────────────┐
│ 🤖  ●●●                             │
│     Thinking...                     │
└─────────────────────────────────────┘
```

---

### Feedback & Confirmation

| Action Type | Pattern |
|-------------|---------|
| Success | Toast notification (auto-dismiss) |
| Error | Inline message + toast |
| Destructive | Confirmation modal |
| Important | Persistent banner |

---

## Responsive Breakpoints

| Breakpoint | Min Width | Target |
|------------|-----------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

---

## Accessibility

### Focus States
- All interactive elements must have visible focus indicators
- Focus ring: 2px solid `--color-primary`
- Focus offset: 2px

### Color Contrast
- Text on backgrounds: minimum 4.5:1 ratio
- Large text (18px+): minimum 3:1 ratio
- UI components: minimum 3:1 ratio

### Motion
- Respect `prefers-reduced-motion`
- All animations should be subtle (<300ms)
- No auto-playing animations that can't be paused

---

## Related Documents

- [Principles](./6-principles.md) - Values driving design decisions
- [Agent Persona](./8-agent-persona.md) - Voice and tone for UI copy
- [Platform Access](./5-platform-access.md) - Contexts where design is applied

---

*Last updated: 2026-03-17*
