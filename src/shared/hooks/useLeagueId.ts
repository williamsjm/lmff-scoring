import { useAuthContext } from '../../features/auth/context/AuthContext';
import { usePublicLeague } from '../../features/leagues/context/PublicLeagueContext';
import { DEFAULT_LEAGUE_ID } from '../constants/firestore-paths';

export const useLeagueId = (): string => {
  const { user } = useAuthContext();
  const { selectedLeagueId } = usePublicLeague();

  // Admin autenticado → usa su liga del token JWT
  if (user?.leagueId) return user.leagueId;

  // Público → usa la liga seleccionada por el visitante
  return selectedLeagueId ?? DEFAULT_LEAGUE_ID;
};
