import { useState, useEffect } from "react";
import { useQuery, skipToken } from "@tanstack/react-query";
import { useLeagueId } from "../../../shared/hooks/useLeagueId";
import { standingsService } from "../services/standingsService";
import type { Standing } from "../types/standings.types";
import { queryKeys } from "../../../shared/lib/queryKeys";

export const useStandings = (
  tournamentId: string | undefined,
  realtime = false,
) => {
  const leagueId = useLeagueId();
  const [matchdayNumber, setMatchdayNumber] = useState<number | null>(null);
  const [realtimeStandings, setRealtimeStandings] = useState<Standing[]>([]);
  const [realtimeLoading, setRealtimeLoading] = useState(true);

  // Query para standings generales (cuando no hay matchdayNumber específico)
  const { data: standingsData = [], isLoading: queryLoading } = useQuery({
    queryKey: queryKeys.standings.all(leagueId, tournamentId ?? ""),
    queryFn:
      leagueId && tournamentId && !realtime && matchdayNumber === null
        ? () => standingsService.getAll(leagueId, tournamentId)
        : skipToken,
  });

  // Query para standings por matchday específico
  const { data: matchdayStandingsData = [], isLoading: matchdayLoading } =
    useQuery({
      queryKey: queryKeys.standings.byMatchday(
        leagueId,
        tournamentId ?? "",
        matchdayNumber ?? 0,
      ),
      queryFn:
        leagueId && tournamentId && !realtime && matchdayNumber !== null
          ? () =>
              standingsService.getByMatchday(
                leagueId,
                tournamentId,
                matchdayNumber,
              )
          : skipToken,
    });

  // Efecto para realtime (onSnapshot)
  useEffect(() => {
    if (!tournamentId || !realtime) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRealtimeLoading(false);
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRealtimeLoading(true);
    const unsubscribe = standingsService.subscribe(
      leagueId,
      tournamentId,
      (data) => {
        setRealtimeStandings(data);
        setRealtimeLoading(false);
      },
      (error) => {
        console.error("Standings subscription error:", error);
        setRealtimeLoading(false);
      },
    );
    return () => unsubscribe();
  }, [leagueId, tournamentId, realtime]);

  const fetchByMatchday = (n: number) => {
    setMatchdayNumber(n);
  };

  // Determinar qué datos y loading state mostrar
  const standings = realtime
    ? realtimeStandings
    : matchdayNumber !== null
      ? matchdayStandingsData
      : standingsData;

  const loading = realtime
    ? realtimeLoading
    : matchdayNumber !== null
      ? matchdayLoading
      : queryLoading;

  return { standings, loading, fetchByMatchday };
};
