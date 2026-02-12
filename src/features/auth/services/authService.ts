import { apiClient } from '../../../shared/services/apiClient';

interface SetUserRoleParams {
  uid: string;
  role: string;
  leagueId: string;
}

export const authService = {
  setUserRole: async (params: SetUserRoleParams) => {
    return apiClient.post<{ success: boolean }>(`/users/${params.uid}/role`, {
      role: params.role,
      leagueId: params.leagueId,
    });
  },
};
