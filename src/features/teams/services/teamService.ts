import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../app/firebase';
import { apiClient } from '../../../shared/services/apiClient';
import type { Team, TeamFormValues } from '../types/team.types';

export const teamService = {
  getAll: async (leagueId: string): Promise<Team[]> => {
    return apiClient.get<Team[]>(`/leagues/${leagueId}/teams`);
  },

  create: async (leagueId: string, data: TeamFormValues): Promise<string> => {
    const result = await apiClient.post<{ id: string }>(`/leagues/${leagueId}/teams`, data);
    return result.id;
  },

  update: async (leagueId: string, teamId: string, data: Partial<TeamFormValues>): Promise<void> => {
    await apiClient.patch(`/leagues/${leagueId}/teams/${teamId}`, data);
  },

  delete: async (leagueId: string, teamId: string): Promise<void> => {
    await apiClient.delete(`/leagues/${leagueId}/teams/${teamId}`);
  },

  uploadLogo: async (leagueId: string, file: File): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `team-logos/${leagueId}/${fileName}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },
};
