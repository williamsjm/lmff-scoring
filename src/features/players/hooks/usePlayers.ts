import { useState, useEffect, useCallback } from 'react';
import { useLeagueId } from '../../../shared/hooks/useLeagueId';
import { playerService } from '../services/playerService';
import type { Player, PlayerFormValues } from '../types/player.types';
import { message } from 'antd';

export const usePlayers = (teamId?: string) => {
  const leagueId = useLeagueId();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const data = teamId
        ? await playerService.getByTeam(leagueId, teamId)
        : await playerService.getAll(leagueId);
      setPlayers(data);
    } catch (error) {
      message.error('Error al cargar jugadores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [leagueId, teamId]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const createPlayer = async (data: PlayerFormValues, teamName: string) => {
    await playerService.create(leagueId, data, teamName);
    message.success('Jugador registrado exitosamente');
    await fetchPlayers();
  };

  const updatePlayer = async (playerId: string, data: Partial<PlayerFormValues>, teamName?: string) => {
    await playerService.update(leagueId, playerId, data, teamName);
    message.success('Jugador actualizado');
    await fetchPlayers();
  };

  const deletePlayer = async (playerId: string, playerTeamId: string) => {
    await playerService.delete(leagueId, playerId, playerTeamId);
    message.success('Jugador eliminado');
    await fetchPlayers();
  };

  return { players, loading, fetchPlayers, createPlayer, updatePlayer, deletePlayer };
};
