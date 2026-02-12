import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../app/firebase';
import { COLLECTIONS } from '../../../shared/constants/firestore-paths';
import type { Tournament, TournamentFormValues } from '../types/tournament.types';

export const tournamentService = {
  getAll: async (leagueId: string): Promise<Tournament[]> => {
    const q = query(collection(db, COLLECTIONS.TOURNAMENTS(leagueId)), orderBy('startDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Tournament));
  },

  getActive: async (leagueId: string): Promise<Tournament[]> => {
    const q = query(
      collection(db, COLLECTIONS.TOURNAMENTS(leagueId)),
      where('status', '==', 'active'),
      orderBy('startDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Tournament));
  },

  getById: async (leagueId: string, tournamentId: string): Promise<Tournament | null> => {
    const docRef = doc(db, COLLECTIONS.TOURNAMENTS(leagueId), tournamentId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Tournament;
  },

  create: async (leagueId: string, data: TournamentFormValues): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.TOURNAMENTS(leagueId)), {
      ...data,
      startDate: Timestamp.fromDate(new Date(data.startDate)),
      endDate: Timestamp.fromDate(new Date(data.endDate)),
      matchdayCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  update: async (leagueId: string, tournamentId: string, data: Partial<TournamentFormValues>): Promise<void> => {
    const updateData: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
    if (data.startDate) updateData.startDate = Timestamp.fromDate(new Date(data.startDate));
    if (data.endDate) updateData.endDate = Timestamp.fromDate(new Date(data.endDate));
    await updateDoc(doc(db, COLLECTIONS.TOURNAMENTS(leagueId), tournamentId), updateData);
  },

  delete: async (leagueId: string, tournamentId: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.TOURNAMENTS(leagueId), tournamentId));
  },
};
