import { apiClient } from '../../../shared/services/apiClient';
import type { Player, PlayerFormValues } from '../types/player.types';

export const playerService = {
  getAll: async (leagueId: string): Promise<Player[]> => {
    return apiClient.get<Player[]>(`/leagues/${leagueId}/players`);
  },

  getByTeam: async (leagueId: string, teamId: string): Promise<Player[]> => {
    return apiClient.get<Player[]>(`/leagues/${leagueId}/players?teamId=${teamId}`);
  },

  create: async (leagueId: string, data: PlayerFormValues, _teamName?: string): Promise<string> => {
    const result = await apiClient.post<{ id: string }>(`/leagues/${leagueId}/players`, data);
    return result.id;
  },

  update: async (
    leagueId: string,
    playerId: string,
    data: Partial<PlayerFormValues>,
    _teamName?: string
  ): Promise<void> => {
    await apiClient.patch(`/leagues/${leagueId}/players/${playerId}`, data);
  },

  delete: async (leagueId: string, playerId: string, _teamId?: string): Promise<void> => {
    await apiClient.delete(`/leagues/${leagueId}/players/${playerId}`);
  },
};
