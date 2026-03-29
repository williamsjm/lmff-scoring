import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../../../shared/services/apiClient';

interface League {
  id: string;
  name: string;
}

interface PublicLeagueContextType {
  leagues: League[];
  selectedLeagueId: string | null;
  setSelectedLeagueId: (id: string) => void;
  loading: boolean;
}

const PublicLeagueContext = createContext<PublicLeagueContextType>({
  leagues: [],
  selectedLeagueId: null,
  setSelectedLeagueId: () => {},
  loading: true,
});

// eslint-disable-next-line react-refresh/only-export-components
export const usePublicLeague = () => useContext(PublicLeagueContext);

export const PublicLeagueProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<League[]>('/leagues')
      .then((data) => {
        setLeagues(data);
        if (data.length > 0) setSelectedLeagueId(data[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLeagueContext.Provider value={{ leagues, selectedLeagueId, setSelectedLeagueId, loading }}>
      {children}
    </PublicLeagueContext.Provider>
  );
};
