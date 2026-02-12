import { useState, useEffect, useCallback } from 'react';
import { useLeagueId } from '../../../shared/hooks/useLeagueId';
import { tournamentService } from '../services/tournamentService';
import type { Tournament, TournamentFormValues } from '../types/tournament.types';
import { message } from 'antd';

export const useTournaments = () => {
  const leagueId = useLeagueId();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tournamentService.getAll(leagueId);
      setTournaments(data);
    } catch (error) {
      message.error('Error al cargar torneos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const createTournament = async (data: TournamentFormValues) => {
    await tournamentService.create(leagueId, data);
    message.success('Torneo creado exitosamente');
    await fetchTournaments();
  };

  const updateTournament = async (id: string, data: Partial<TournamentFormValues>) => {
    await tournamentService.update(leagueId, id, data);
    message.success('Torneo actualizado');
    await fetchTournaments();
  };

  const deleteTournament = async (id: string) => {
    await tournamentService.delete(leagueId, id);
    message.success('Torneo eliminado');
    await fetchTournaments();
  };

  return { tournaments, loading, fetchTournaments, createTournament, updateTournament, deleteTournament };
};
