import { useAuthContext } from '../../features/auth/context/AuthContext';
import { DEFAULT_LEAGUE_ID } from '../constants/firestore-paths';

export const useLeagueId = (): string => {
  const { user } = useAuthContext();
  return user?.leagueId ?? DEFAULT_LEAGUE_ID;
};
