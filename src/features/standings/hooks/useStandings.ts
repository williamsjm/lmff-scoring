import { useState, useEffect } from 'react';
import { useLeagueId } from '../../../shared/hooks/useLeagueId';
import { standingsService } from '../services/standingsService';
import type { Standing } from '../types/standings.types';

export const useStandings = (tournamentId: string | undefined, realtime = false) => {
  const leagueId = useLeagueId();
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tournamentId) {
      setLoading(false);
      return;
    }

    if (realtime) {
      setLoading(true);
      const unsubscribe = standingsService.subscribe(leagueId, tournamentId, (data) => {
        setStandings(data);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      const fetch = async () => {
        setLoading(true);
        try {
          const data = await standingsService.getAll(leagueId, tournamentId);
          setStandings(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetch();
    }
  }, [leagueId, tournamentId, realtime]);

  const fetchByMatchday = async (matchdayNumber: number) => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      const data = await standingsService.getByMatchday(leagueId, tournamentId, matchdayNumber);
      setStandings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { standings, loading, fetchByMatchday };
};
