# CLAUDE.md — Enterprise AI Light

This is a client-side React prototype for an **Enterprise AI Assistant** interface. No backend — all data is mocked/hardcoded.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18.3.1 + TypeScript |
| Build Tool | Vite 6.3.5 |
| Routing | React Router 7.13.0 |
| Styling | Tailwind CSS 4 + CSS Variables |
| Animation | Motion 12.23.24 + inline keyframes |
| UI Primitives | Radix UI (comprehensive) |
| Icons | Lucide React 0.487.0 |
| Charts | Recharts 2.15.2 |
| Forms | React Hook Form 7.55.0 |
| Class Utils | clsx + tailwind-merge + class-variance-authority |
| Toasts | Sonner 2.0.3 |
| Component Lib | Material UI 7.3.5 (light usage, mainly for Emotion) |

---

## Project Structure

```
enterprise-ai-light/
├── src/
│   ├── main.tsx                        # React root mount
│   ├── app/
│   │   ├── App.tsx                     # Root component, wraps with AuthProvider + RouterProvider
│   │   ├── routes.tsx                  # All route definitions (createBrowserRouter)
│   │   ├── context/
│   │   │   └── AuthContext.tsx         # Auth state (isAuthenticated, login, logout)
│   │   └── components/
│   │       ├── LoginEntry.tsx          # Landing / login page
│   │       ├── BiometricSetup.tsx      # Biometric onboarding
│   │       ├── Login.tsx               # Quick sign-in screen
│   │       ├── Home.tsx                # Main dashboard + AI chat
│   │       ├── SalesHelpline.tsx       # Sales support chat
│   │       ├── DealerOnboarding.tsx    # Dealer onboarding flow
│   │       ├── ITServiceDesk.tsx       # IT ticket system
│   │       ├── PortfolioMonitoring.tsx # Portfolio tracking
│   │       ├── LeaveTracking.tsx       # Leave management
│   │       ├── ChatComposer.tsx        # Reusable input tray (4 states)
│   │       ├── MessageComponents.tsx   # UserMessageBubble, BotMessageText, QuickReplyChips
│   │       ├── SegmentedControl.tsx    # Animated tab selector (Motion.js)
│   │       └── sales-helpline/
│   │           ├── SalesChat.tsx
│   │           └── SalesComponents.tsx
│   └── styles/
│       ├── index.css                   # Main CSS entry (imports all below)
│       ├── fonts.css                   # Font-face declarations
│       ├── tailwind.css                # @import "tailwindcss"
│       └── theme.css                   # All CSS design tokens (light + dark)
├── docs/                               # Project documentation
├── guidelines/
│   └── Guidelines.md                  # Design guidelines
├── index.html
├── vite.config.ts
├── postcss.config.mjs
└── package.json
```

---

## Commands

```bash
npm run dev       # Start dev server (Vite, usually http://localhost:5173)
npm run build     # Production build
```

---

## Key Routes

| Path | Component | Description |
|---|---|---|
| `/` | `LoginEntry` | Email + password login entry |
| `/biometric-setup` | `BiometricSetup` | Fingerprint/face setup (special users) |
| `/quicksignin` | `Login` | Biometric quick-auth screen |
| `/home` | `Home` | Main AI assistant dashboard |
| `/saleshelpline` | `SalesHelpline` | Sales support chat with sidebar |
| `/dealeronboarding` | `DealerOnboarding` | Multi-step dealer onboarding |
| `/itservicedesk` | `ITServiceDesk` | IT ticket categories + chat |
| `/portfoliomonitoring` | `PortfolioMonitoring` | Portfolio tracking view |
| `/leavetracking` | `LeaveTracking` | Leave management view |

### Auth Flow

```
/ (LoginEntry)
  ├─ rahul.ved@gmail.com → /biometric-setup → /saleshelpline
  └─ anyone else         → /quicksignin     → /home
```

Auth state lives in `AuthContext` — `useAuth()` provides `{ isAuthenticated, login, logout }`.

---

## Code Patterns

### Component structure
```tsx
// Props interface at top
interface Props {
  label: string;
  onClick?: () => void;
}

// Functional component with hooks
export default function MyComponent({ label, onClick }: Props) {
  const [state, setState] = useState(false);
  return <div>...</div>;
}
```

### Inline keyframe animations
Components define animations in a co-located `<style>` tag:
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

### CSS variable usage for theming
Prefer CSS vars over hardcoded colors so dark mode works automatically:
```tsx
style={{ backgroundColor: 'var(--surface-1)', color: 'var(--text-primary)' }}
```

### Class merging utility
Use `cn()` (clsx + tailwind-merge) for conditional classnames:
```tsx
import { cn } from '@/lib/utils';
<div className={cn('base-class', isActive && 'active-class')} />
```

### Staged bot responses
Pages simulate AI responses using `setTimeout` chains and a union-type stage variable:
```tsx
type BotResponseStage = 'idle' | 'thinking' | 'streaming' | 'done';
```

### Motion.js animated tabs (SegmentedControl)
Uses `<motion.div layoutId="...">` for smooth sliding background:
```tsx
<motion.div layoutId="segment-bg" transition={{ type: 'spring', ... }} />
```

---

## Path Aliases

Configured in `vite.config.ts`:

```ts
resolve: {
  alias: { '@': path.resolve(__dirname, './src') }
}
```

Use `@/` instead of relative `../../` imports everywhere:
```ts
import AuthContext from '@/app/context/AuthContext';
import { cn } from '@/lib/utils';
```

---

## Styling

### Overview
Three layers work together:

1. **Tailwind CSS 4** — utility classes (primary approach)
2. **CSS Variables** (`src/styles/theme.css`) — design tokens, auto dark mode
3. **Inline `style` props** — when a value must come from a CSS var dynamically

### Design Tokens (`src/styles/theme.css`)

```css
:root {
  --background: #f9fafb;
  --surface-1: #ffffff;
  --surface-2: #f3f4f6;
  --primary: #030213;
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --border: #e5e7eb;
  --border-subtle: #f3f4f6;
  --status-success: #16a34a;
  --status-warning: #d97706;
  --status-danger: #dc2626;
  --status-info: #2563eb;
  /* ...charts, sidebar, input vars */
}

.dark {
  --background: #1a1a1f;
  --surface-1: #242429;
  --surface-2: #2d2d33;
  --text-primary: #f5f5f7;
  /* ...dark overrides */
}
```

### Dark Mode
Toggle the `.dark` class on `<html>` or a wrapper element. All CSS vars flip automatically. Use `dark:` Tailwind prefix for class-based overrides:
```tsx
className="bg-white dark:bg-[#1a1a1f]"
```

### Responsive Prefixes
Mobile-first with standard Tailwind breakpoints:
```tsx
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
className="hidden lg:flex"   // sidebar — desktop only
```

### Fonts
Declared in `src/styles/fonts.css`. Custom typefaces loaded via `@font-face`.

---

## ChatComposer States

The `ChatComposer` component has 4 distinct UI states:

| State | UI |
|---|---|
| `default` | Text input + mic button + send button |
| `recording` | Waveform animation + elapsed timer |
| `transcribing` | Gradient shimmer "processing" state |
| `transcriptReady` | Transcript text ready to send |

---

## Conventions

- **Component files:** PascalCase matching the component name (`Home.tsx`)
- **CSS variables:** kebab-case (`--text-primary`)
- **No Redux** — React Context for auth, `useState` for everything else
- **No real API calls** — all data is hardcoded mock data
- **TypeScript throughout** — define prop interfaces, use type unions for state stages
- **Animations** — prefer Motion.js for layout/spring animations; inline keyframes for entrance effects
- **Icons** — use Lucide React exclusively
- **Toasts** — use Sonner (`toast.success(...)`, `toast.error(...)`)
