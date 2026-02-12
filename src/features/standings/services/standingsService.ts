import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../../app/firebase';
import { COLLECTIONS } from '../../../shared/constants/firestore-paths';
import { apiClient } from '../../../shared/services/apiClient';
import type { Standing } from '../types/standings.types';

export const standingsService = {
  getAll: async (leagueId: string, tournamentId: string): Promise<Standing[]> => {
    const q = query(
      collection(db, COLLECTIONS.STANDINGS(leagueId, tournamentId)),
      orderBy('points', 'desc'),
      orderBy('scoreDifference', 'desc'),
      orderBy('scoreFor', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d, index) => ({
      id: d.id,
      ...d.data(),
      rank: index + 1,
    } as Standing));
  },

  subscribe: (
    leagueId: string,
    tournamentId: string,
    callback: (standings: Standing[]) => void
  ) => {
    const q = query(
      collection(db, COLLECTIONS.STANDINGS(leagueId, tournamentId)),
      orderBy('points', 'desc'),
      orderBy('scoreDifference', 'desc'),
      orderBy('scoreFor', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const standings = snapshot.docs.map((d, index) => ({
        id: d.id,
        ...d.data(),
        rank: index + 1,
      } as Standing));
      callback(standings);
    });
  },

  getByMatchday: async (
    leagueId: string,
    tournamentId: string,
    matchdayNumber: number
  ): Promise<Standing[]> => {
    return apiClient.get<Standing[]>(
      `/leagues/${leagueId}/tournaments/${tournamentId}/standings?matchday=${matchdayNumber}`
    );
  },
};
