import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../app/firebase';
import { COLLECTIONS } from '../../../shared/constants/firestore-paths';
import { apiClient } from '../../../shared/services/apiClient';
import type { Match, MatchFormValues, MatchScoreUpdate } from '../types/match.types';
import type { Team } from '../../teams/types/team.types';

type ApiMatch = Omit<Match, 'date' | 'createdAt' | 'updatedAt'> & {
  date: string;
  createdAt: string;
  updatedAt: string;
};

function toMatch(m: ApiMatch): Match {
  return {
    ...m,
    date: Timestamp.fromDate(new Date(m.date)),
    createdAt: Timestamp.fromDate(new Date(m.createdAt)),
    updatedAt: Timestamp.fromDate(new Date(m.updatedAt)),
  };
}

export const matchService = {
  getByMatchday: async (
    leagueId: string,
    tournamentId: string,
    matchdayId: string
  ): Promise<Match[]> => {
    const data = await apiClient.get<ApiMatch[]>(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matches?matchdayId=${matchdayId}`
    );
    return data.map(toMatch);
  },

  getAll: async (leagueId: string, tournamentId: string): Promise<Match[]> => {
    const data = await apiClient.get<ApiMatch[]>(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matches`
    );
    return data.map(toMatch);
  },

  // homeTeam and awayTeam kept for API compatibility; backend denormalizes server-side
  create: async (
    leagueId: string,
    tournamentId: string,
    data: MatchFormValues,
    matchdayId: string,
    matchdayNumber: number,
    _homeTeam?: Team,
    _awayTeam?: Team
  ): Promise<string> => {
    const result = await apiClient.post<{ id: string }>(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matches`,
      {
        matchdayId,
        matchdayNumber,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        date: data.date,
        time: data.time,
        venue: data.venue,
      }
    );
    return result.id;
  },

  updateScore: async (
    leagueId: string,
    tournamentId: string,
    matchId: string,
    homeScore: number,
    awayScore: number
  ): Promise<void> => {
    await apiClient.patch(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matches/${matchId}/score`,
      { homeScore, awayScore }
    );
  },

  updateScoresBatch: async (
    leagueId: string,
    tournamentId: string,
    scores: MatchScoreUpdate[],
    matchdayId: string
  ): Promise<void> => {
    await apiClient.patch(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matches/scores-batch`,
      { matchdayId, scores }
    );
  },

  delete: async (
    leagueId: string,
    tournamentId: string,
    matchId: string,
    _matchdayId?: string
  ): Promise<void> => {
    await apiClient.delete(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matches/${matchId}`
    );
  },

  subscribeByMatchday: (
    leagueId: string,
    tournamentId: string,
    matchdayId: string,
    callback: (matches: Match[]) => void
  ) => {
    const q = query(
      collection(db, COLLECTIONS.MATCHES(leagueId, tournamentId)),
      where('matchdayId', '==', matchdayId),
      orderBy('date', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const matches = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match));
      callback(matches);
    });
  },
};
