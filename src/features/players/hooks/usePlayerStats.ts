import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { useLeagueId } from '../../../shared/hooks/useLeagueId';
import { playerStatsService } from '../services/playerStatsService';
import { queryKeys } from '../../../shared/lib/queryKeys';
import type { PlayerStatFormValues } from '../types/playerStats.types';

export const usePlayerStats = (tournamentId: string, matchId: string) => {
  const leagueId = useLeagueId();
  const queryClient = useQueryClient();

  const { data: stats = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.playerStats.byMatch(leagueId, tournamentId, matchId),
    queryFn: () => playerStatsService.getByMatch(leagueId, tournamentId, matchId),
    enabled: !!leagueId && !!tournamentId && !!matchId,
  });

  const createMutation = useMutation({
    mutationFn: (data: PlayerStatFormValues) =>
      playerStatsService.create(leagueId, tournamentId, matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playerStats.byMatch(leagueId, tournamentId, matchId) });
    },
    onError: () => message.error('Error al guardar estadística'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ statId, data }: { statId: string; data: Partial<PlayerStatFormValues> }) =>
      playerStatsService.update(leagueId, tournamentId, matchId, statId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.playerStats.byMatch(leagueId, tournamentId, matchId) });
    },
    onError: () => message.error('Error al actualizar estadística'),
  });

  const createStat = (data: PlayerStatFormValues) => createMutation.mutateAsync(data);
  const updateStat = (statId: string, data: Partial<PlayerStatFormValues>) =>
    updateMutation.mutateAsync({ statId, data });

  return { stats, loading, createStat, updateStat };
};

export const usePlayerStatsAggregate = (tournamentId: string) => {
  const leagueId = useLeagueId();

  const { data: aggregate = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.playerStats.aggregate(leagueId, tournamentId),
    queryFn: () => playerStatsService.getAggregate(leagueId, tournamentId),
    enabled: !!leagueId && !!tournamentId,
  });

  return { aggregate, loading };
};
