import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../../app/firebase';
import { COLLECTIONS } from '../../../shared/constants/firestore-paths';
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
    const fn = httpsCallable<
      { leagueId: string; tournamentId: string; matchdayNumber: number },
      Standing[]
    >(functions, 'getStandingsByMatchday');
    const result = await fn({ leagueId, tournamentId, matchdayNumber });
    return result.data;
  },
};
