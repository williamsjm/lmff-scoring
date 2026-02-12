import { httpsCallable } from 'firebase/functions';
import { functions } from '../../../app/firebase';

interface SetUserRoleParams {
  uid: string;
  role: string;
  leagueId: string;
}

export const authService = {
  setUserRole: async (params: SetUserRoleParams) => {
    const setRole = httpsCallable(functions, 'setUserRole');
    return setRole(params);
  },
};
