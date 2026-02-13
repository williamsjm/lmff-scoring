import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLeagueId } from "../../../shared/hooks/useLeagueId";
import { teamService } from "../services/teamService";
import type { TeamFormValues } from "../types/team.types";
import { message } from "antd";
import { queryKeys } from "../../../shared/lib/queryKeys";

export const useTeams = () => {
  const leagueId = useLeagueId();
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.teams.all(leagueId),
    queryFn: () => teamService.getAll(leagueId),
    enabled: !!leagueId,
  });

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      logoFile,
    }: {
      data: TeamFormValues;
      logoFile?: File;
    }) => {
      let logoUrl: string | null = null;
      if (logoFile) {
        logoUrl = await teamService.uploadLogo(leagueId, logoFile);
      }
      return teamService.create(leagueId, { ...data, logo: logoUrl });
    },
    onSuccess: () => {
      message.success("Equipo creado exitosamente");
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.all(leagueId),
      });
    },
    onError: (error) => {
      message.error("Error al crear equipo");
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      teamId,
      data,
      logoFile,
    }: {
      teamId: string;
      data: Partial<TeamFormValues>;
      logoFile?: File;
    }) => {
      if (logoFile) {
        const logoUrl = await teamService.uploadLogo(leagueId, logoFile);
        return teamService.update(leagueId, teamId, { ...data, logo: logoUrl });
      }
      return teamService.update(leagueId, teamId, data);
    },
    onSuccess: () => {
      message.success("Equipo actualizado");
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.all(leagueId),
      });
    },
    onError: (error) => {
      message.error("Error al actualizar equipo");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (teamId: string) => teamService.delete(leagueId, teamId),
    onSuccess: () => {
      message.success("Equipo eliminado");
      queryClient.invalidateQueries({
        queryKey: queryKeys.teams.all(leagueId),
      });
    },
    onError: (error) => {
      message.error("Error al eliminar equipo");
      console.error(error);
    },
  });

  const fetchTeams = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.teams.all(leagueId) });
  }, [queryClient, leagueId]);

  const createTeam = async (data: TeamFormValues, logoFile?: File) => {
    return createMutation.mutateAsync({ data, logoFile });
  };

  const updateTeam = async (
    teamId: string,
    data: Partial<TeamFormValues>,
    logoFile?: File,
  ) => {
    return updateMutation.mutateAsync({ teamId, data, logoFile });
  };

  const deleteTeam = async (teamId: string) => {
    return deleteMutation.mutateAsync(teamId);
  };

  return { teams, loading, fetchTeams, createTeam, updateTeam, deleteTeam };
};
