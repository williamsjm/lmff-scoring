import { apiClient } from '../../../shared/services/apiClient';
import type { PlayerStat, PlayerStatFormValues, PlayerStatAggregate } from '../types/playerStats.types';

export const playerStatsService = {
  getByMatch: (leagueId: string, tId: string, matchId: string): Promise<PlayerStat[]> =>
    apiClient.get(`/leagues/${leagueId}/tournaments/${tId}/matches/${matchId}/player-stats`),

  create: (leagueId: string, tId: string, matchId: string, data: PlayerStatFormValues): Promise<{ id: string }> =>
    apiClient.post(`/leagues/${leagueId}/tournaments/${tId}/matches/${matchId}/player-stats`, data),

  update: (leagueId: string, tId: string, matchId: string, statId: string, data: Partial<PlayerStatFormValues>): Promise<{ id: string }> =>
    apiClient.patch(`/leagues/${leagueId}/tournaments/${tId}/matches/${matchId}/player-stats/${statId}`, data),

  delete: (leagueId: string, tId: string, matchId: string, statId: string): Promise<void> =>
    apiClient.delete(`/leagues/${leagueId}/tournaments/${tId}/matches/${matchId}/player-stats/${statId}`),

  getAggregate: (leagueId: string, tId: string): Promise<PlayerStatAggregate[]> =>
    apiClient.get(`/leagues/${leagueId}/tournaments/${tId}/player-stats/aggregate`),
};
