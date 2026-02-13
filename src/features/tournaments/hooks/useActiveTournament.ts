import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLeagueId } from "../../../shared/hooks/useLeagueId";
import { tournamentService } from "../services/tournamentService";

import { queryKeys } from "../../../shared/lib/queryKeys";

export const useActiveTournament = () => {
  const leagueId = useLeagueId();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: allTournaments = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.tournaments.all(leagueId),
    queryFn: () => tournamentService.getAll(leagueId),
    enabled: !!leagueId,
  });

  // If selectedId is set, try to find it; if it no longer exists, fall through to defaults
  const selectedTournament = selectedId
    ? allTournaments.find((t) => t.id === selectedId)
    : undefined;

  const activeTournament =
    selectedTournament ??
    allTournaments.find((t) => t.status === "active") ??
    allTournaments[0] ??
    null;

  const selectTournament = (tournamentId: string) => {
    setSelectedId(tournamentId);
  };

  return { activeTournament, allTournaments, loading, selectTournament };
};
