# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Vite dev server
npm start            # Start dev server on port 3000 with auto-open

# Build & Lint
npm run build        # TypeScript check + Vite production build (output: dist/)
npm run lint         # ESLint
npm run preview      # Preview production build locally

# Firebase Functions (run from functions/)
npm run build        # Compile TypeScript
npm run serve        # Build + start emulators (functions only)
npm run deploy       # Deploy functions to Firebase
```

## Environment Setup

Copy `.env.example` to `.env` and fill in Firebase credentials. Set `VITE_USE_EMULATORS=true` for local development with Firebase emulators.

Firebase emulators (started via `firebase emulators:start`):
- Auth: 9099, Functions: 5001, Firestore: 8080, Storage: 9199

## Architecture

**Full-stack**: React 19 + TypeScript frontend hosted on Firebase Hosting, with Firestore as the database, Firebase Auth, Cloud Storage, and Cloud Functions for backend logic.

### Frontend (`src/`)

Feature-based modular structure:

```
src/
├── app/            # Root: App.tsx, firebase.ts (init + emulator setup), router.tsx, providers.tsx
├── features/       # Domain modules: auth, tournaments, matches, teams, players, standings
│   └── <feature>/  # Each has: components/, hooks/, services/, types/
├── pages/
│   ├── admin/      # Protected pages: Dashboard, Tournaments, Matchdays, MatchResults, Teams, Players
│   └── public/     # Public pages: Home, Standings, Results
├── layouts/        # AdminLayout, PublicLayout (with header/sidebar/navbar/footer)
└── shared/         # ProtectedRoute, LoadingSpinner, constants/routes.ts, common types
```

**Routing**: Two layouts — `PublicLayout` for unauthenticated views, `AdminLayout` (behind `ProtectedRoute`) for management. Route constants defined in `shared/constants/routes.ts`.

**Firebase client** initialized in `src/app/firebase.ts`, which conditionally connects to emulators when `VITE_USE_EMULATORS=true`.

**UI**: Ant Design (antd 5) components with global styles in `src/styles/`.

### Backend (`functions/src/`)

Cloud Functions organized by domain:
- `auth/` — `setCustomClaims.ts`, `onUserCreated.ts` (sets admin roles)
- `standings/` — `onMatchWrite.ts` (recalculates standings on match write), `getStandingsByMatchday.ts`
- `denormalization/` — `onTeamUpdate.ts` (keeps denormalized team data in sync)

### Data Flow

Match results entered in admin → `onMatchWrite` Cloud Function triggers → standings recalculated in Firestore → public standings/results pages read from Firestore in real time.

### Code Splitting

Vite is configured to split: `antd`, `firebase-core`, `firebase-firestore`, `firebase-storage`, and `react-vendor` into separate chunks.

## Coding Conventions

### File Naming
- Components: `PascalCase.tsx`
- Hooks: `camelCase.ts` (prefix `use`)
- Types: `camelCase.type.ts`
- Utils: `camelCase.ts`
- Tests: `matchesFileName.test.ts(x)`

### Component Structure (internal order)
1. Imports (React → external libs → internal → CSS)
2. Types/Interfaces
3. Component with destructured props
4. Hooks
5. Handlers
6. Early returns (loading → error → empty → success)
7. JSX

### TypeScript
- Minimize `any` — use `unknown` or proper types
- Destructure props in function signatures
- Prefer string unions over enums: `type Status = "pending" | "active"`
- Use `as const` for constant objects
- Exhaustive switch: `function assertExhaustive(value: never): never { throw new Error(...) }`

### Exports
- Named exports preferred for `.ts` files
- Page components: `export const MyPage = ...` (supports React Router lazy loading)

### Custom Hooks
- Always prefix with `use`
- Return `{}` for multiple values, `[]` for single toggle-like values

### Performance
- `React.memo` for expensive, frequently re-rendered components
- `useMemo` only for genuinely expensive computations
- `useCallback` only when passed to memoized children
