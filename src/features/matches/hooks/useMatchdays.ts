import { useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  skipToken,
} from "@tanstack/react-query";
import { useLeagueId } from "../../../shared/hooks/useLeagueId";
import { matchdayService } from "../services/matchdayService";
import type { MatchdayFormValues } from "../types/match.types";
import { message } from "antd";
import { queryKeys } from "../../../shared/lib/queryKeys";

export const useMatchdays = (tournamentId: string | undefined) => {
  const leagueId = useLeagueId();
  const queryClient = useQueryClient();

  const { data: matchdays = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.matchdays.all(leagueId, tournamentId ?? ""),
    queryFn:
      leagueId && tournamentId
        ? () => matchdayService.getAll(leagueId, tournamentId)
        : skipToken,
  });

  const createMutation = useMutation({
    mutationFn: (data: MatchdayFormValues) => {
      if (!tournamentId) throw new Error("No tournament selected");
      return matchdayService.create(leagueId, tournamentId, data);
    },
    onSuccess: () => {
      message.success("Jornada creada");
      queryClient.invalidateQueries({
        queryKey: queryKeys.matchdays.all(leagueId, tournamentId ?? ""),
      });
    },
    onError: (error) => {
      message.error("Error al crear jornada");
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      matchdayId,
      data,
    }: {
      matchdayId: string;
      data: Partial<MatchdayFormValues>;
    }) => {
      if (!tournamentId) throw new Error("No tournament selected");
      return matchdayService.update(leagueId, tournamentId, matchdayId, data);
    },
    onSuccess: () => {
      message.success("Jornada actualizada");
      queryClient.invalidateQueries({
        queryKey: queryKeys.matchdays.all(leagueId, tournamentId ?? ""),
      });
    },
    onError: (error) => {
      message.error("Error al actualizar jornada");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (matchdayId: string) => {
      if (!tournamentId) throw new Error("No tournament selected");
      return matchdayService.delete(leagueId, tournamentId, matchdayId);
    },
    onSuccess: () => {
      message.success("Jornada eliminada");
      queryClient.invalidateQueries({
        queryKey: queryKeys.matchdays.all(leagueId, tournamentId ?? ""),
      });
    },
    onError: (error) => {
      message.error("Error al eliminar jornada");
      console.error(error);
    },
  });

  const fetchMatchdays = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.matchdays.all(leagueId, tournamentId ?? ""),
    });
  }, [queryClient, leagueId, tournamentId]);

  const createMatchday = async (data: MatchdayFormValues) => {
    return createMutation.mutateAsync(data);
  };

  const updateMatchday = async (
    matchdayId: string,
    data: Partial<MatchdayFormValues>,
  ) => {
    return updateMutation.mutateAsync({ matchdayId, data });
  };

  const deleteMatchday = async (matchdayId: string) => {
    return deleteMutation.mutateAsync(matchdayId);
  };

  return {
    matchdays,
    loading,
    fetchMatchdays,
    createMatchday,
    updateMatchday,
    deleteMatchday,
  };
};
