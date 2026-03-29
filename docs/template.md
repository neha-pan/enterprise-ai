# Layout Template — Horizontal Shell Unification

## Target Shell (AppShell.tsx)

All 4 in-scope screens share this identical structural shell:

```
┌─────────────────────────────────────────────────────────────────────┐
│  LEFT SIDEBAR (w-60 expanded / w-14 icon-rail)                      │
│  ┌───────────────┐                                                  │
│  │ [Logo]  [◀▶]  │  ← collapse toggle (desktop only)               │
│  │ + New Chat    │                                                  │
│  │ ─────────── │                                                    │
│  │ RECENT        │                                                  │
│  │  Title  time  │  ← hover shows ⋯ → Star / Delete                │
│  │  sub-text     │                                                  │
│  │  ...          │                                                  │
│  │ ─────────── │                                                    │
│  │ [Avi] Name    │  ← click opens popup: Light/Dark/Sign out        │
│  └───────────────┘                                                  │
│                                                                     │
│  CENTRE (flex-1)                    RIGHT PANEL (xl: w-[22rem])     │
│  ┌──────────────────────┐          ┌──────────────────┐            │
│  │                      │          │ Notifications /  │            │
│  │   [Screen content]   │          │ context panel    │            │
│  │                      │          │                  │            │
│  └──────────────────────┘          └──────────────────┘            │
└─────────────────────────────────────────────────────────────────────┘

Mobile (< lg):
  - Sidebar hidden; hamburger top-left opens overlay with backdrop
  - Right panel hidden; PanelRight button top-right opens drawer
  - Top bar: [☰] [Logo] [🌙] [▷]
```

---

## Centre Content Pattern

### Welcome / idle state (no messages)
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│              [Badge / Role chip]                     │
│           Greeting, FirstName                        │
│              Role · Location                         │
│                                                      │
│    ┌─────────────────────────────────────┐           │
│    │  + [How can I help you?]  [🎤] [↑] │           │  ← ChatComposer, max-w-xl, centred
│    └─────────────────────────────────────┘           │
│                                                      │
│    [Action tile 1]   [Action tile 2]                 │  ← action grid / NextActionsCard
│    [Action tile 3]   [Action tile 4]                 │     below the input
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Chat / active state (messages present)
```
┌──────────────────────────────────────────────────────┐
│  [Greeting header — compact, stays at top]           │
│  ─────────────────────────────────────────           │
│  [User message bubble]                               │
│       [Bot response]                                 │
│  [User message bubble]                               │
│       [Bot response — loading...]                    │
│                                                      │
│  ┌─────────────────────────────────────┐             │
│  │  + [Type a message...]  [🎤] [↑]   │             │  ← bottom-pinned composer
│  └─────────────────────────────────────┘             │
└──────────────────────────────────────────────────────┘
```

> **B2BHome** and **SalesHelpline** delegate their entire centre to `B2BChat` and `SalesChat` respectively — these components manage their own chat UI and do not use the welcome/chat state pattern above.

---

## Screen Inventory

| Screen | Route | Centre Content | Right Panel |
|---|---|---|---|
| HRHome | `/hr-home` | Greeting (HR badge) + ChatComposer + TaskTile grid | `NotificationPanel profile="hr"` |
| EmployeeHome | `/employee-home` | Greeting (AI Unit badge) + ChatComposer + NextActionsCard | Custom: profile + leave balance + resources |
| B2BHome | `/b2b-home` | `<B2BChat />` (full chat UI) | `NotificationPanel profile="b2b"` |
| SalesHelpline | `/saleshelpline` | `<SalesChat />` (full chat UI) | `NotificationPanel profile="dms"` |

---

## Per-Screen Accent Colours

| Screen | Border (active conv) | Text (active sub) | Avatar |
|---|---|---|---|
| HRHome | `rgba(217,119,6,0.2)` | `#b45309` | `#d97706` |
| EmployeeHome | `rgba(22,163,74,0.2)` | `#16a34a` | `#16a34a` |
| B2BHome | `rgba(124,58,237,0.2)` | `#7c3aed` | `#7c3aed` |
| SalesHelpline | `rgba(37,99,235,0.2)` | `#2563eb` | `#2563eb` |

---

## Component Hierarchy

```
AppShell.tsx                    ← shared chrome (sidebar + grid + mobile topbar)
├── Left sidebar
│   ├── FullLogo / IconMark
│   ├── + New Chat button
│   ├── Conversation list (star / delete)
│   └── User footer + popup (light/dark/sign out)
├── Mobile top bar (lg:hidden)
│   ├── Hamburger → sidebar overlay
│   ├── FullLogo
│   └── Theme toggle + PanelRight toggle
├── children                    ← screen-specific centre content
└── rightPanel                  ← screen-specific right panel (manages own xl: visibility)

HRHome.tsx       → AppShell > greeting + ChatComposer + TaskTile grid
EmployeeHome.tsx → AppShell > welcome state OR chat state
B2BHome.tsx      → AppShell > B2BChat
SalesHelpline.tsx→ AppShell > SalesChat
```
