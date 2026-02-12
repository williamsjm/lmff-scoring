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
  increment,
} from 'firebase/firestore';
import { db } from '../../../app/firebase';
import { COLLECTIONS } from '../../../shared/constants/firestore-paths';
import type { Player, PlayerFormValues } from '../types/player.types';

export const playerService = {
  getAll: async (leagueId: string): Promise<Player[]> => {
    const q = query(collection(db, COLLECTIONS.PLAYERS(leagueId)), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Player));
  },

  getByTeam: async (leagueId: string, teamId: string): Promise<Player[]> => {
    const q = query(
      collection(db, COLLECTIONS.PLAYERS(leagueId)),
      where('teamId', '==', teamId),
      orderBy('number', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Player));
  },

  getById: async (leagueId: string, playerId: string): Promise<Player | null> => {
    const docRef = doc(db, COLLECTIONS.PLAYERS(leagueId), playerId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Player;
  },

  create: async (leagueId: string, data: PlayerFormValues, teamName: string): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.PLAYERS(leagueId)), {
      ...data,
      teamName,
      userId: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    const teamRef = doc(db, COLLECTIONS.TEAMS(leagueId), data.teamId);
    await updateDoc(teamRef, { playerCount: increment(1) });
    return docRef.id;
  },

  update: async (
    leagueId: string,
    playerId: string,
    data: Partial<PlayerFormValues>,
    teamName?: string
  ): Promise<void> => {
    const updateData: Record<string, unknown> = { ...data, updatedAt: serverTimestamp() };
    if (teamName) updateData.teamName = teamName;
    const docRef = doc(db, COLLECTIONS.PLAYERS(leagueId), playerId);
    await updateDoc(docRef, updateData);
  },

  delete: async (leagueId: string, playerId: string, teamId: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.PLAYERS(leagueId), playerId));
    const teamRef = doc(db, COLLECTIONS.TEAMS(leagueId), teamId);
    await updateDoc(teamRef, { playerCount: increment(-1) });
  },
};
