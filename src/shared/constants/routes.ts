export const ROUTES = {
  HOME: '/',
  STANDINGS: '/standings',
  STANDINGS_TOURNAMENT: '/standings/:tournamentId',
  RESULTS: '/results',
  RESULTS_TOURNAMENT: '/results/:tournamentId',
  RESULTS_MATCHDAY: '/results/:tournamentId/:matchdayId',

  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_TOURNAMENTS: '/admin/tournaments',
  ADMIN_MATCHDAYS: '/admin/tournaments/:id/matchdays',
  ADMIN_MATCH_RESULTS: '/admin/tournaments/:id/matchdays/:mdId/results',
  ADMIN_TEAMS: '/admin/teams',
  ADMIN_PLAYERS: '/admin/players',
} as const;
