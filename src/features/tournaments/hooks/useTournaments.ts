import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLeagueId } from "../../../shared/hooks/useLeagueId";
import { tournamentService } from "../services/tournamentService";
import type { TournamentFormValues } from "../types/tournament.types";
import { message } from "antd";
import { queryKeys } from "../../../shared/lib/queryKeys";

export const useTournaments = () => {
  const leagueId = useLeagueId();
  const queryClient = useQueryClient();

  const { data: tournaments = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.tournaments.all(leagueId),
    queryFn: () => tournamentService.getAll(leagueId),
    enabled: !!leagueId,
  });

  console.log(tournaments, "tournaments");

  const createMutation = useMutation({
    mutationFn: (data: TournamentFormValues) =>
      tournamentService.create(leagueId, data),
    onSuccess: () => {
      message.success("Torneo creado exitosamente");
      queryClient.invalidateQueries({
        queryKey: queryKeys.tournaments.all(leagueId),
      });
    },
    onError: (error) => {
      message.error("Error al crear torneo");
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TournamentFormValues>;
    }) => tournamentService.update(leagueId, id, data),
    onSuccess: () => {
      message.success("Torneo actualizado");
      queryClient.invalidateQueries({
        queryKey: queryKeys.tournaments.all(leagueId),
      });
    },
    onError: (error) => {
      message.error("Error al actualizar torneo");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tournamentService.delete(leagueId, id),
    onSuccess: () => {
      message.success("Torneo eliminado");
      queryClient.invalidateQueries({
        queryKey: queryKeys.tournaments.all(leagueId),
      });
    },
    onError: (error) => {
      message.error("Error al eliminar torneo");
      console.error(error);
    },
  });

  const fetchTournaments = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.tournaments.all(leagueId),
    });
  }, [queryClient, leagueId]);

  const createTournament = async (data: TournamentFormValues) => {
    return createMutation.mutateAsync(data);
  };

  const updateTournament = async (
    id: string,
    data: Partial<TournamentFormValues>,
  ) => {
    return updateMutation.mutateAsync({ id, data });
  };

  const deleteTournament = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    tournaments,
    loading,
    fetchTournaments,
    createTournament,
    updateTournament,
    deleteTournament,
  };
};
