import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../../../app/firebase';
import { COLLECTIONS } from '../../../shared/constants/firestore-paths';
import type { Matchday, MatchdayFormValues } from '../types/match.types';

export const matchdayService = {
  getAll: async (leagueId: string, tournamentId: string): Promise<Matchday[]> => {
    const q = query(
      collection(db, COLLECTIONS.MATCHDAYS(leagueId, tournamentId)),
      orderBy('number', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Matchday));
  },

  create: async (leagueId: string, tournamentId: string, data: MatchdayFormValues): Promise<string> => {
    const docRef = await addDoc(
      collection(db, COLLECTIONS.MATCHDAYS(leagueId, tournamentId)),
      {
        ...data,
        date: Timestamp.fromDate(new Date(data.date)),
        matchCount: 0,
        completedMatchCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );
    const tournamentRef = doc(db, COLLECTIONS.TOURNAMENTS(leagueId), tournamentId);
    await updateDoc(tournamentRef, { matchdayCount: increment(1) });
    return docRef.id;
  },

  update: async (
    leagueId: string,
    tournamentId: string,
    matchdayId: string,
    data: Partial<MatchdayFormValues>
  ): Promise<void> => {
    const updateData: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
    if (data.date) updateData.date = Timestamp.fromDate(new Date(data.date));
    await updateDoc(
      doc(db, COLLECTIONS.MATCHDAYS(leagueId, tournamentId), matchdayId),
      updateData
    );
  },

  delete: async (leagueId: string, tournamentId: string, matchdayId: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.MATCHDAYS(leagueId, tournamentId), matchdayId));
    const tournamentRef = doc(db, COLLECTIONS.TOURNAMENTS(leagueId), tournamentId);
    await updateDoc(tournamentRef, { matchdayCount: increment(-1) });
  },
};
