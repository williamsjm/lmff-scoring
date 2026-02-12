import { useState, useEffect } from 'react';
import { useLeagueId } from '../../../shared/hooks/useLeagueId';
import { tournamentService } from '../services/tournamentService';
import type { Tournament } from '../types/tournament.types';

export const useActiveTournament = () => {
  const leagueId = useLeagueId();
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const all = await tournamentService.getAll(leagueId);
        setAllTournaments(all);
        const active = all.find(t => t.status === 'active') || all[0] || null;
        setActiveTournament(active);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [leagueId]);

  const selectTournament = (tournamentId: string) => {
    const found = allTournaments.find(t => t.id === tournamentId);
    if (found) setActiveTournament(found);
  };

  return { activeTournament, allTournaments, loading, selectTournament };
};
