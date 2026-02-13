import { Timestamp } from 'firebase/firestore';
import { apiClient } from '../../../shared/services/apiClient';
import type { Tournament, TournamentFormValues } from '../types/tournament.types';

type ApiTournament = Omit<Tournament, 'startDate' | 'endDate' | 'createdAt' | 'updatedAt'> & {
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

function toTournament(t: ApiTournament): Tournament {
  return {
    ...t,
    startDate: Timestamp.fromDate(new Date(t.startDate)),
    endDate: Timestamp.fromDate(new Date(t.endDate)),
    createdAt: Timestamp.fromDate(new Date(t.createdAt)),
    updatedAt: Timestamp.fromDate(new Date(t.updatedAt)),
  };
}

export const tournamentService = {
  getAll: async (leagueId: string): Promise<Tournament[]> => {
    const data = await apiClient.get<ApiTournament[]>(`/leagues/${leagueId}/tournaments`);
    return data.map(toTournament);
  },

  create: async (leagueId: string, data: TournamentFormValues): Promise<string> => {
    const result = await apiClient.post<{ id: string }>(`/leagues/${leagueId}/tournaments`, data);
    return result.id;
  },

  update: async (leagueId: string, tournamentId: string, data: Partial<TournamentFormValues>): Promise<void> => {
    await apiClient.patch(`/leagues/${leagueId}/tournaments/${tournamentId}`, data);
  },

  delete: async (leagueId: string, tournamentId: string): Promise<void> => {
    await apiClient.delete(`/leagues/${leagueId}/tournaments/${tournamentId}`);
  },
};
