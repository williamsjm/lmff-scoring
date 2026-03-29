export const queryKeys = {
  teams: {
    root: ["teams"] as const,
    all: (leagueId: string) => ["teams", leagueId] as const,
    detail: (leagueId: string, teamId: string) =>
      ["teams", leagueId, teamId] as const,
  },
  players: {
    root: ["players"] as const,
    all: (leagueId: string, teamId?: string) =>
      ["players", leagueId, teamId ?? null] as const,
  },
  tournaments: {
    root: ["tournaments"] as const,
    all: (leagueId: string) => ["tournaments", leagueId] as const,
  },
  matchdays: {
    root: ["matchdays"] as const,
    all: (leagueId: string, tournamentId: string) =>
      ["matchdays", leagueId, tournamentId] as const,
  },
  matches: {
    root: ["matches"] as const,
    byMatchday: (leagueId: string, tournamentId: string, matchdayId: string) =>
      ["matches", leagueId, tournamentId, matchdayId] as const,
  },
  playerStats: {
    root: ['playerStats'] as const,
    byMatch: (leagueId: string, tournamentId: string, matchId: string) =>
      ['playerStats', leagueId, tournamentId, matchId] as const,
    aggregate: (leagueId: string, tournamentId: string) =>
      ['playerStats', leagueId, tournamentId, 'aggregate'] as const,
  },
  standings: {
    root: ["standings"] as const,
    all: (leagueId: string, tournamentId: string) =>
      ["standings", leagueId, tournamentId] as const,
    byMatchday: (leagueId: string, tournamentId: string, n: number) =>
      ["standings", leagueId, tournamentId, "matchday", n] as const,
  },
} as const;
