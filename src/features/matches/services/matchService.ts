import { Timestamp } from "firebase/firestore";
import { apiClient } from "../../../shared/services/apiClient";
import type {
  Match,
  MatchFormValues,
  MatchScoreUpdate,
} from "../types/match.types";

type ApiMatch = Omit<Match, "date" | "createdAt" | "updatedAt"> & {
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
    matchdayId: string,
  ): Promise<Match[]> => {
    const data = await apiClient.get<ApiMatch[]>(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matches?matchdayId=${matchdayId}`,
    );
    return data.map(toMatch);
  },

  create: async (
    leagueId: string,
    tournamentId: string,
    data: MatchFormValues,
    matchdayId: string,
    matchdayNumber: number,
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
      },
    );
    return result.id;
  },

  updateScore: async (
    leagueId: string,
    tournamentId: string,
    matchId: string,
    homeScore: number,
    awayScore: number,
  ): Promise<void> => {
    await apiClient.patch(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matches/${matchId}/score`,
      { homeScore, awayScore },
    );
  },

  updateScoresBatch: async (
    leagueId: string,
    tournamentId: string,
    scores: MatchScoreUpdate[],
    matchdayId: string,
  ): Promise<void> => {
    await apiClient.patch(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matches/scores-batch`,
      { matchdayId, scores },
    );
  },

  delete: async (
    leagueId: string,
    tournamentId: string,
    matchId: string,
  ): Promise<void> => {
    await apiClient.delete(
      `/leagues/${leagueId}/tournaments/${tournamentId}/matches/${matchId}`,
    );
  },
};
