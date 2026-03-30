# CLAUDE.md — Enterprise AI Light

Client-side React prototype for an **Enterprise AI Assistant** interface. No backend — all data is mocked/hardcoded.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18.3.1 + TypeScript |
| Build | Vite 6.3.5 |
| Routing | React Router 7.13.0 |
| Styling | Tailwind CSS 4 + CSS Variables (`src/styles/theme.css`) |
| Theme | `next-themes` — `ThemeProvider` wraps app in `App.tsx` |
| Animation | Motion (`motion/react`) + inline `<style>` keyframes |
| Icons | Lucide React (exclusively) |
| Charts | Recharts 2.15.2 |
| Forms | React Hook Form 7.55.0 |
| Toasts | Sonner (`toast.success(...)`, `toast.error(...)`) |
| Class Utils | `cn()` = clsx + tailwind-merge (`@/lib/utils`) |
| UI Primitives | Radix UI + shadcn/ui (`src/app/components/ui/`) |

---

## Commands

```bash
npm run dev    # http://localhost:5173
npm run build
```

---

## Project Structure

```
src/
├── main.tsx
├── app/
│   ├── App.tsx                  # ThemeProvider > AuthProvider > RouterProvider
│   ├── routes.tsx               # createBrowserRouter — all routes
│   ├── context/
│   │   └── AuthContext.tsx      # useAuth() → { isAuthenticated, login, logout }
│   └── components/
│       ├── AppShell.tsx         # Reusable layout: sidebar + main + right panel
│       ├── AppHeader.tsx        # Top bar with logo, theme toggle, panel toggles
│       ├── LoginEntry.tsx       # Login page — email/password, demo user picker
│       ├── BiometricSetup.tsx   # Fingerprint/face onboarding
│       ├── Login.tsx            # Biometric quick-sign-in screen
│       ├── Home.tsx             # Main AI chat dashboard (Rahul Ved / DMS)
│       ├── EmployeeHome.tsx     # AI dashboard for Rita Sharma (AI Unit)
│       ├── B2BHome.tsx          # AI dashboard for Rahul Shah (B2B Urban)
│       ├── HRHome.tsx           # AI dashboard for Roshni Kale (HR)
│       ├── SalesHelpline.tsx    # Sales support chat (AppShell wrapper)
│       ├── DealerOnboarding.tsx # Multi-step dealer onboarding
│       ├── ITServiceDesk.tsx    # IT ticket categories + chat
│       ├── PortfolioMonitoring.tsx
│       ├── LeaveTracking.tsx
│       ├── ChatComposer.tsx     # Input tray — 4 states (see below)
│       ├── UserMessageBubble.tsx
│       ├── BotMessageText.tsx   # Supports isLoading shimmer animation
│       ├── QuickReplyChips.tsx  # "Yes, raise it" / "Not now" chips
│       ├── SegmentedControl.tsx # Motion.js animated tab bar
│       ├── RoleBadge.tsx        # Pill badge with tone: 'blue'|'green'|'purple'
│       ├── TaskTile.tsx         # Icon + text action tile
│       ├── NextActionsCard.tsx  # Card wrapping action button grid
│       ├── IMPSLimitTrackerCard.tsx
│       ├── NotificationPanel.tsx
│       ├── SuggestiveActions.tsx # Category pill + prompt panel
│       ├── BrandMark.tsx        # Small brand SVG mark
│       ├── B2BChat.tsx
│       ├── figma/ImageWithFallback.tsx
│       └── sales-helpline/
│           ├── SalesChat.tsx
│           └── SalesComponents.tsx
└── styles/
    ├── index.css    # Imports all below
    ├── fonts.css
    ├── tailwind.css # @import "tailwindcss"
    └── theme.css    # All CSS design tokens (light + dark)
```

---

## Routes & Auth Flow

| Path | Component | User |
|---|---|---|
| `/` | `LoginEntry` | — |
| `/biometric-setup` | `BiometricSetup` | Rahul Ved only |
| `/quicksignin` | `Login` | fallback |
| `/home` | `Home` | fallback → /quicksignin |
| `/saleshelpline` | `SalesHelpline` | Rahul Ved (DMS) |
| `/employee-home` | `EmployeeHome` | Rita Sharma (AI Unit) |
| `/b2b-home` | `B2BHome` | Rahul Shah (B2B Urban) |
| `/hr-home` | `HRHome` | Roshni Kale (HR) |
| `/dealeronboarding` | `DealerOnboarding` | — |
| `/itservicedesk` | `ITServiceDesk` | — |
| `/portfoliomonitoring` | `PortfolioMonitoring` | — |
| `/leavetracking` | `LeaveTracking` | — |

**Auth routing logic (LoginEntry):**
```
rahul.ved@bajaj.finserv.in  → /biometric-setup → /saleshelpline
rita.sharma@bajaj.finserv.in → /employee-home
rahul.shah@bajaj.finserv.in  → /b2b-home
roshni.kale@bajaj.finserv.in → /hr-home
anyone else                  → /quicksignin → /home
```

All demo users accept any non-empty password.

---

## Key Patterns

### Component
```tsx
interface Props { label: string; onClick?: () => void; }

export function MyComponent({ label, onClick }: Props) {
  const [state, setState] = useState(false);
  return <div>...</div>;
}
```

### Styling — three layers
1. **Tailwind CSS 4** — primary; use `hover:bg-[var(--surface-2)]`, `active:scale-[0.96]` etc.
2. **CSS variables** — for theming; prefer over hardcoded hex
3. **Inline `style`** — only when value must come from a CSS var at runtime

```tsx
// Correct — CSS var in inline style
style={{ backgroundColor: 'var(--surface-1)', color: 'var(--text-primary)' }}

// Correct — hover/active via Tailwind (NOT onMouseEnter/Leave DOM mutations)
className="hover:bg-[var(--surface-2)] active:scale-[0.96]"
```

**Never use `onMouseEnter/Leave` to mutate `e.currentTarget.style`** — use Tailwind hover classes instead.

### Hover on conditionally-styled elements
When an element's default background varies (e.g. active vs inactive state), keep the conditional background in `className`, not `style`:
```tsx
className={`... ${isActive ? 'bg-[var(--surface-2)]' : 'bg-transparent hover:bg-[var(--surface-2)]'}`}
```

### Animations — inline keyframes
```tsx
<>
  <style>{`
    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `}</style>
  <div style={{ animation: 'slideUpFade 0.3s ease forwards' }}>...</div>
</>
```

Motion.js for layout/spring: `<motion.div layoutId="..." transition={{ type: 'spring' }} />`

### Staged bot responses
```tsx
type BotResponseStage = 'idle' | 'line1' | 'line2' | 'line3' | 'showChips' | 'showCard';
// useEffect watches botStage, chains setTimeout to add messages and advance stage
```

### AppShell layout
Used by SalesHelpline, EmployeeHome, B2BHome, HRHome:
```tsx
<AppShell
  conversations={CONVERSATIONS}   // ConversationItem[]
  user={USER}                      // UserInfo
  accentBorderColor="rgba(...)"
  accentTextColor="#hex"
  rightPanel={<NotificationPanel ... />}
  rightPanelMobile={(onClose) => <NotificationMobilePanel onClose={onClose} />}
>
  <PageContent />
</AppShell>
```

### RoleBadge
```tsx
<RoleBadge label="Sales Manager" tone="blue" />  // tone: 'blue'|'green'|'purple'
```

### ChatComposer states
| State | UI |
|---|---|
| `default` | Text input + mic + send |
| `recording` | Animated waveform (CSS-driven) + timer |
| `transcribing` | Shimmer / spinner |
| `transcriptReady` | Transcript text ready to send |

---

## Design Tokens (key vars)

```css
/* Light (default) */
--background: #f9fafb;   --surface-1: #ffffff;    --surface-2: #f3f4f6;
--text-primary: #111827; --text-secondary: #4b5563;
--border: #e5e7eb;       --border-subtle: #f3f4f6;
--brand-blue: #2563eb;
--status-success: #16a34a; --status-warning: #d97706;
--status-danger: #dc2626;  --status-info: #2563eb;

/* Dark (.dark class on <html>) — all vars auto-flip */
--background: #1a1a1f;  --surface-1: #242429;  --surface-2: #2d2d33;
--text-primary: #f5f5f7;
```

Dark mode: `next-themes` manages the `.dark` class. Use `dark:` Tailwind prefix for class overrides.

---

## Conventions

- **Path alias:** `@/` = `src/` (configured in `vite.config.ts`)
- **No Redux** — `AuthContext` for auth, `useState` for all other state
- **No real API calls** — all data hardcoded
- **TypeScript throughout** — explicit `Props` interfaces, type unions for stage variables
- **No nested ternaries** — use `if/else` or `switch` for multiple conditions
- **Unused wrappers** — don't add pass-through functions or redundant wrapper divs
