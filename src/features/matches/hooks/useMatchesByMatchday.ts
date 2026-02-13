import { useCallback } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  skipToken,
} from "@tanstack/react-query";
import { useLeagueId } from "../../../shared/hooks/useLeagueId";
import { matchService } from "../services/matchService";
import type {
  MatchFormValues,
  MatchScoreUpdate,
} from "../types/match.types";
import { message } from "antd";
import { queryKeys } from "../../../shared/lib/queryKeys";

export const useMatchesByMatchday = (
  tournamentId: string | undefined,
  matchdayId: string | undefined,
) => {
  const leagueId = useLeagueId();
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.matches.byMatchday(
      leagueId,
      tournamentId ?? "",
      matchdayId ?? "",
    ),
    queryFn:
      leagueId && tournamentId && matchdayId
        ? () =>
            matchService.getByMatchday(leagueId, tournamentId, matchdayId)
        : skipToken,
  });

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      matchdayNumber,
    }: {
      data: MatchFormValues;
      matchdayNumber: number;
    }) => {
      if (!tournamentId || !matchdayId)
        throw new Error("Missing tournament or matchday");
      return matchService.create(
        leagueId,
        tournamentId,
        data,
        matchdayId,
        matchdayNumber,
      );
    },
    onSuccess: () => {
      message.success("Partido creado");
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.byMatchday(
          leagueId,
          tournamentId ?? "",
          matchdayId ?? "",
        ),
      });
    },
    onError: (error) => {
      message.error("Error al crear partido");
      console.error(error);
    },
  });

  const updateScoreMutation = useMutation({
    mutationFn: ({
      matchId,
      homeScore,
      awayScore,
    }: {
      matchId: string;
      homeScore: number;
      awayScore: number;
    }) => {
      if (!tournamentId) throw new Error("No tournament selected");
      return matchService.updateScore(
        leagueId,
        tournamentId,
        matchId,
        homeScore,
        awayScore,
      );
    },
    onSuccess: () => {
      message.success("Resultado guardado");
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.byMatchday(
          leagueId,
          tournamentId ?? "",
          matchdayId ?? "",
        ),
      });
      // También invalidar standings ya que el resultado afecta la tabla
      if (tournamentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.standings.all(leagueId, tournamentId),
        });
      }
    },
    onError: (error) => {
      message.error("Error al guardar resultado");
      console.error(error);
    },
  });

  const updateScoresBatchMutation = useMutation({
    mutationFn: (scores: MatchScoreUpdate[]) => {
      if (!tournamentId || !matchdayId)
        throw new Error("Missing tournament or matchday");
      return matchService.updateScoresBatch(
        leagueId,
        tournamentId,
        scores,
        matchdayId,
      );
    },
    onSuccess: (_, scores) => {
      message.success(`${scores.length} resultado(s) guardado(s)`);
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.byMatchday(
          leagueId,
          tournamentId ?? "",
          matchdayId ?? "",
        ),
      });
      // También invalidar standings
      if (tournamentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.standings.all(leagueId, tournamentId),
        });
      }
    },
    onError: (error) => {
      message.error("Error al guardar resultados");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (matchId: string) => {
      if (!tournamentId || !matchdayId)
        throw new Error("Missing tournament or matchday");
      return matchService.delete(leagueId, tournamentId, matchId, matchdayId);
    },
    onSuccess: () => {
      message.success("Partido eliminado");
      queryClient.invalidateQueries({
        queryKey: queryKeys.matches.byMatchday(
          leagueId,
          tournamentId ?? "",
          matchdayId ?? "",
        ),
      });
    },
    onError: (error) => {
      message.error("Error al eliminar partido");
      console.error(error);
    },
  });

  const fetchMatches = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.matches.byMatchday(
        leagueId,
        tournamentId ?? "",
        matchdayId ?? "",
      ),
    });
  }, [queryClient, leagueId, tournamentId, matchdayId]);

  const createMatch = async (
    data: MatchFormValues,
    matchdayNumber: number,
  ) => {
    return createMutation.mutateAsync({
      data,
      matchdayNumber,
    });
  };

  const updateScore = async (
    matchId: string,
    homeScore: number,
    awayScore: number,
  ) => {
    return updateScoreMutation.mutateAsync({ matchId, homeScore, awayScore });
  };

  const updateScoresBatch = async (scores: MatchScoreUpdate[]) => {
    return updateScoresBatchMutation.mutateAsync(scores);
  };

  const deleteMatch = async (matchId: string) => {
    return deleteMutation.mutateAsync(matchId);
  };

  return {
    matches,
    loading,
    fetchMatches,
    createMatch,
    updateScore,
    updateScoresBatch,
    deleteMatch,
  };
};
