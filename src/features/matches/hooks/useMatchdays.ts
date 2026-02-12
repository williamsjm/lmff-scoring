import { useState, useEffect, useCallback } from 'react';
import { useLeagueId } from '../../../shared/hooks/useLeagueId';
import { matchdayService } from '../services/matchdayService';
import type { Matchday, MatchdayFormValues } from '../types/match.types';
import { message } from 'antd';

export const useMatchdays = (tournamentId: string | undefined) => {
  const leagueId = useLeagueId();
  const [matchdays, setMatchdays] = useState<Matchday[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMatchdays = useCallback(async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      const data = await matchdayService.getAll(leagueId, tournamentId);
      setMatchdays(data);
    } catch (error) {
      message.error('Error al cargar jornadas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [leagueId, tournamentId]);

  useEffect(() => {
    fetchMatchdays();
  }, [fetchMatchdays]);

  const createMatchday = async (data: MatchdayFormValues) => {
    if (!tournamentId) return;
    await matchdayService.create(leagueId, tournamentId, data);
    message.success('Jornada creada');
    await fetchMatchdays();
  };

  const updateMatchday = async (matchdayId: string, data: Partial<MatchdayFormValues>) => {
    if (!tournamentId) return;
    await matchdayService.update(leagueId, tournamentId, matchdayId, data);
    message.success('Jornada actualizada');
    await fetchMatchdays();
  };

  const deleteMatchday = async (matchdayId: string) => {
    if (!tournamentId) return;
    await matchdayService.delete(leagueId, tournamentId, matchdayId);
    message.success('Jornada eliminada');
    await fetchMatchdays();
  };

  return { matchdays, loading, fetchMatchdays, createMatchday, updateMatchday, deleteMatchday };
};
