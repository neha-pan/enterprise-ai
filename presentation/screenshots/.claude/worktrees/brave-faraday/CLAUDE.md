# Blu for Enterprise

Enterprise AI assistant platform - unified conversational interface for internal employee tools.

## Tech Stack

- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Components:** Radix UI primitives (shadcn/ui pattern), MUI
- **Routing:** React Router v7
- **State:** React Context (AuthContext)
- **Animations:** Motion, tw-animate-css

## Project Structure

```
src/
├── main.tsx                 # Entry point
├── app/
│   ├── App.tsx              # Root with AuthProvider + Router
│   ├── routes.tsx           # Route definitions
│   ├── context/             # React contexts
│   └── components/
│       ├── ui/              # Reusable UI primitives (shadcn pattern)
│       └── [Feature].tsx    # Feature components
├── styles/
│   ├── index.css            # Main CSS (imports others)
│   ├── tailwind.css         # Tailwind config
│   ├── theme.css            # Design tokens
│   └── fonts.css            # Font definitions
docs/                        # Product documentation (see 1-table-of-contents.md)
```

## Key Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | LoginEntry | Initial login |
| `/biometric-setup` | BiometricSetup | Biometric auth setup |
| `/quicksignin` | Login | Quick sign-in |
| `/home` | Home | Main dashboard |
| `/saleshelpline` | SalesHelpline | Sales support chat |
| `/dealeronboarding` | DealerOnboarding | Dealer onboarding |
| `/itservicedesk` | ITServiceDesk | IT support |
| `/portfoliomonitoring` | PortfolioMonitoring | Portfolio view |
| `/leavetracking` | LeaveTracking | Leave management |

## Commands

```bash
pnpm install     # Install dependencies
pnpm dev         # Start dev server
pnpm build       # Production build
```

## Code Patterns

### UI Components
Located in `src/app/components/ui/`. Follow shadcn/ui conventions:
- Use `class-variance-authority` for variants
- Use `cn()` utility from `utils.ts` for class merging
- Compose with Radix primitives

### Path Aliases
- `@/` maps to `src/`

### Styling
- Tailwind v4 with CSS-first config
- Custom theme in `styles/theme.css`
- No `tailwind.config.js` - uses `@import` directives

## Documentation

Reference `docs/` for product context:
- `2-platform-overview.md` - Vision, problem statement
- `7-design-system.md` - Design tokens, component specs
- `8-agent-persona.md` - AI assistant tone/personality
