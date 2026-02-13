export const COLLECTIONS = {
  USERS: "users",
  LEAGUES: "leagues",
  TEAMS: (leagueId: string) => `leagues/${leagueId}/teams`,
  PLAYERS: (leagueId: string) => `leagues/${leagueId}/players`,
  TOURNAMENTS: (leagueId: string) => `leagues/${leagueId}/tournaments`,
  MATCHDAYS: (leagueId: string, tournamentId: string) =>
    `leagues/${leagueId}/tournaments/${tournamentId}/matchdays`,
  MATCHES: (leagueId: string, tournamentId: string) =>
    `leagues/${leagueId}/tournaments/${tournamentId}/matches`,
  STANDINGS: (leagueId: string, tournamentId: string) =>
    `leagues/${leagueId}/tournaments/${tournamentId}/standings`,
} as const;

export const DEFAULT_LEAGUE_ID =
  import.meta.env.VITE_LEAGUE_ID || "default-league-id";
