import { useState, useEffect, useCallback } from 'react';
import { useLeagueId } from '../../../shared/hooks/useLeagueId';
import { teamService } from '../services/teamService';
import type { Team, TeamFormValues } from '../types/team.types';
import { message } from 'antd';

export const useTeams = () => {
  const leagueId = useLeagueId();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const data = await teamService.getAll(leagueId);
      setTeams(data);
    } catch (error) {
      message.error('Error al cargar equipos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [leagueId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const createTeam = async (data: TeamFormValues, logoFile?: File) => {
    let logoUrl: string | null = null;
    if (logoFile) {
      logoUrl = await teamService.uploadLogo(leagueId, logoFile);
    }
    await teamService.create(leagueId, { ...data, logo: logoUrl });
    message.success('Equipo creado exitosamente');
    await fetchTeams();
  };

  const updateTeam = async (teamId: string, data: Partial<TeamFormValues>, logoFile?: File) => {
    if (logoFile) {
      const logoUrl = await teamService.uploadLogo(leagueId, logoFile);
      data.logo = logoUrl;
    }
    await teamService.update(leagueId, teamId, data);
    message.success('Equipo actualizado');
    await fetchTeams();
  };

  const deleteTeam = async (teamId: string) => {
    await teamService.delete(leagueId, teamId);
    message.success('Equipo eliminado');
    await fetchTeams();
  };

  return { teams, loading, fetchTeams, createTeam, updateTeam, deleteTeam };
};
