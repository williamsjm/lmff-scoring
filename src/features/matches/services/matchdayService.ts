import { Timestamp } from 'firebase/firestore';
import { apiClient } from '../../../shared/services/apiClient';
import type { Matchday, MatchdayFormValues } from '../types/match.types';

type ApiMatchday = Omit<Matchday, 'date' | 'createdAt' | 'updatedAt'> & {
  date: string;
  createdAt: string;
  updatedAt: string;
};

function toMatchday(m: ApiMatchday): Matchday {
  return {
    ...m,
    date: Timestamp.fromDate(new Date(m.date)),
    createdAt: Timestamp.fromDate(new Date(m.createdAt)),
    updatedAt: Timestamp.fromDate(new Date(m.updatedAt)),
  };
}

export const matchdayService = {
  getAll: async (leagueId: string, tournamentId: string): Promise<Matchday[]> => {
    const data = await apiClient.get<ApiMatchday[]>(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matchdays`
    );
    return data.map(toMatchday);
  },

  create: async (leagueId: string, tournamentId: string, data: MatchdayFormValues): Promise<string> => {
    const result = await apiClient.post<{ id: string }>(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matchdays`,
      data
    );
    return result.id;
  },

  update: async (
    leagueId: string,
    tournamentId: string,
    matchdayId: string,
    data: Partial<MatchdayFormValues>
  ): Promise<void> => {
    await apiClient.patch(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matchdays/${matchdayId}`,
      data
    );
  },

  delete: async (leagueId: string, tournamentId: string, matchdayId: string): Promise<void> => {
    await apiClient.delete(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matchdays/${matchdayId}`
    );
  },
};
