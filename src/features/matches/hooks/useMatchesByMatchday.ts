import { useState, useEffect, useCallback } from 'react';
import { useLeagueId } from '../../../shared/hooks/useLeagueId';
import { matchService } from '../services/matchService';
import type { Match, MatchFormValues, MatchScoreUpdate } from '../types/match.types';
import type { Team } from '../../teams/types/team.types';
import { message } from 'antd';

export const useMatchesByMatchday = (
  tournamentId: string | undefined,
  matchdayId: string | undefined
) => {
  const leagueId = useLeagueId();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMatches = useCallback(async () => {
    if (!tournamentId || !matchdayId) return;
    setLoading(true);
    try {
      const data = await matchService.getByMatchday(leagueId, tournamentId, matchdayId);
      setMatches(data);
    } catch (error) {
      message.error('Error al cargar partidos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [leagueId, tournamentId, matchdayId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const createMatch = async (
    data: MatchFormValues,
    matchdayNumber: number,
    homeTeam: Team,
    awayTeam: Team
  ) => {
    if (!tournamentId || !matchdayId) return;
    await matchService.create(leagueId, tournamentId, data, matchdayId, matchdayNumber, homeTeam, awayTeam);
    message.success('Partido creado');
    await fetchMatches();
  };

  const updateScore = async (matchId: string, homeScore: number, awayScore: number) => {
    if (!tournamentId) return;
    await matchService.updateScore(leagueId, tournamentId, matchId, homeScore, awayScore);
    message.success('Resultado guardado');
    await fetchMatches();
  };

  const updateScoresBatch = async (scores: MatchScoreUpdate[]) => {
    if (!tournamentId || !matchdayId) return;
    await matchService.updateScoresBatch(leagueId, tournamentId, scores, matchdayId);
    message.success(`${scores.length} resultado(s) guardado(s)`);
    await fetchMatches();
  };

  const deleteMatch = async (matchId: string) => {
    if (!tournamentId || !matchdayId) return;
    await matchService.delete(leagueId, tournamentId, matchId, matchdayId);
    message.success('Partido eliminado');
    await fetchMatches();
  };

  return { matches, loading, fetchMatches, createMatch, updateScore, updateScoresBatch, deleteMatch };
};
