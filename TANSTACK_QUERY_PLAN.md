# Plan: Implementar TanStack Query

## Context
Los hooks actuales usan el patrón manual `useState + useEffect + useCallback` para data fetching. Sin caché, sin deduplicación, refetch manual tras cada mutación. TanStack Query resuelve todo esto.

---

## Archivos a crear
- `src/shared/lib/queryKeys.ts`

## Archivos a modificar
- `package.json` — agregar dependencias
- `src/app/providers.tsx`
- `src/features/teams/hooks/useTeams.ts`
- `src/features/players/hooks/usePlayers.ts`
- `src/features/tournaments/hooks/useTournaments.ts`
- `src/features/tournaments/hooks/useActiveTournament.ts`
- `src/features/matches/hooks/useMatchdays.ts`
- `src/features/matches/hooks/useMatchesByMatchday.ts`
- `src/features/standings/hooks/useStandings.ts`

---

## Paso 1: Instalar dependencias
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```
> Ambas en `dependencies` (no devDependencies) — devtools se importa con `import.meta.env.DEV` en JSX, Vite lo tree-shake en producción.

---

## Paso 2: providers.tsx
- Agregar `QueryClient` con `staleTime: 60_000` y `retry: 1` (evita reintentos en errores de permiso Firebase)
- `QueryClientProvider` va como wrapper más externo
- `ReactQueryDevtools` solo en DEV, fuera del árbol de providers

---

## Paso 3: queryKeys.ts
```typescript
export const queryKeys = {
  teams: {
    all: (leagueId: string) => ['teams', leagueId] as const,
    detail: (leagueId: string, teamId: string) => ['teams', leagueId, teamId] as const,
  },
  players: {
    all: (leagueId: string, teamId?: string) => ['players', leagueId, teamId ?? null] as const,
  },
  tournaments: {
    all: (leagueId: string) => ['tournaments', leagueId] as const,
  },
  matchdays: {
    all: (leagueId: string, tournamentId: string) => ['matchdays', leagueId, tournamentId] as const,
  },
  matches: {
    byMatchday: (leagueId: string, tournamentId: string, matchdayId: string) =>
      ['matches', leagueId, tournamentId, matchdayId] as const,
  },
  standings: {
    all: (leagueId: string, tournamentId: string) => ['standings', leagueId, tournamentId] as const,
    byMatchday: (leagueId: string, tournamentId: string, n: number) =>
      ['standings', leagueId, tournamentId, 'matchday', n] as const,
  },
} as const;
```

---

## Paso 4: Patrón de cada hook

**Regla general:**
- Mismo contrato de retorno — componentes no cambian
- `useQuery` para lecturas con `enabled: !!leagueId && !!otherRequiredParam`
- `useMutation` con `onSuccess` → `invalidateQueries` y `onError` → `message.error`
- `fetchX` en return = `useCallback` sobre `invalidateQueries`

### Casos especiales
- **`useActiveTournament`**: usa mismo `queryKey` que `useTournaments` (caché compartida, cero fetch duplicado). `selectedId` local sobreescribe la derivación automática. Preserva `selectTournament(id)`.
- **`useStandings`**: `realtime=true` → onSnapshot manual sin cambios. `realtime=false` → `useQuery`. `fetchByMatchday(n)` → estado local `matchdayNumber` que activa un segundo `useQuery`.
- **`useMatchdays`**: `enabled: !!tournamentId && !!leagueId`, `queryKey` usa `tournamentId ?? ''` como placeholder.
- **`useMatchesByMatchday`**: `enabled: !!tournamentId && !!matchdayId && !!leagueId`.
- **`usePlayers`**: `queryKey` usa `teamId ?? null` para key estable cuando `teamId` es `undefined`.

---

## Verificación
1. `npm run dev` — compila sin errores TypeScript
2. React Query Devtools visible en desarrollo → queries en `success`
3. Navegar a `/admin/teams` → equipos cargan
4. Navegar a otra página y volver → sin spinner (datos desde caché)
5. Crear un equipo → lista se actualiza automáticamente
