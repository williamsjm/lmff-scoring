import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLeagueId } from "../../../shared/hooks/useLeagueId";
import { playerService } from "../services/playerService";
import type { Player, PlayerFormValues } from "../types/player.types";
import { message } from "antd";
import { queryKeys } from "../../../shared/lib/queryKeys";

export const usePlayers = (teamId?: string) => {
  const leagueId = useLeagueId();
  const queryClient = useQueryClient();

  const { data: players = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.players.all(leagueId, teamId),
    queryFn: () =>
      teamId
        ? playerService.getByTeam(leagueId, teamId)
        : playerService.getAll(leagueId),
    enabled: !!leagueId,
  });

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      teamName,
    }: {
      data: PlayerFormValues;
      teamName: string;
    }) => {
      return playerService.create(leagueId, data, teamName);
    },
    onSuccess: () => {
      message.success("Jugador registrado exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["players", leagueId],
      });
    },
    onError: (error) => {
      message.error("Error al crear jugador");
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      playerId,
      data,
      teamName,
    }: {
      playerId: string;
      data: Partial<PlayerFormValues>;
      teamName?: string;
    }) => {
      return playerService.update(leagueId, playerId, data, teamName);
    },
    onSuccess: () => {
      message.success("Jugador actualizado");
      queryClient.invalidateQueries({
        queryKey: ["players", leagueId],
      });
    },
    onError: (error) => {
      message.error("Error al actualizar jugador");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({
      playerId,
      playerTeamId,
    }: {
      playerId: string;
      playerTeamId: string;
    }) => {
      return playerService.delete(leagueId, playerId, playerTeamId);
    },
    onSuccess: () => {
      message.success("Jugador eliminado");
      queryClient.invalidateQueries({
        queryKey: ["players", leagueId],
      });
    },
    onError: (error) => {
      message.error("Error al eliminar jugador");
      console.error(error);
    },
  });

  const fetchPlayers = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["players", leagueId],
    });
  }, [queryClient, leagueId]);

  const createPlayer = async (data: PlayerFormValues, teamName: string) => {
    return createMutation.mutateAsync({ data, teamName });
  };

  const updatePlayer = async (
    playerId: string,
    data: Partial<PlayerFormValues>,
    teamName?: string,
  ) => {
    return updateMutation.mutateAsync({ playerId, data, teamName });
  };

  const deletePlayer = async (playerId: string, playerTeamId: string) => {
    return deleteMutation.mutateAsync({ playerId, playerTeamId });
  };

  return {
    players,
    loading,
    fetchPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
  };
};
