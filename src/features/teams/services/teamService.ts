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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../app/firebase';
import { COLLECTIONS } from '../../../shared/constants/firestore-paths';
import type { Team, TeamFormValues } from '../types/team.types';

export const teamService = {
  getAll: async (leagueId: string): Promise<Team[]> => {
    const q = query(collection(db, COLLECTIONS.TEAMS(leagueId)), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team));
  },

  getById: async (leagueId: string, teamId: string): Promise<Team | null> => {
    const docRef = doc(db, COLLECTIONS.TEAMS(leagueId), teamId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Team;
  },

  getByIds: async (leagueId: string, teamIds: string[]): Promise<Team[]> => {
    if (teamIds.length === 0) return [];
    const chunks: string[][] = [];
    for (let i = 0; i < teamIds.length; i += 30) {
      chunks.push(teamIds.slice(i, i + 30));
    }
    const results: Team[] = [];
    for (const chunk of chunks) {
      const q = query(collection(db, COLLECTIONS.TEAMS(leagueId)), where('__name__', 'in', chunk));
      const snapshot = await getDocs(q);
      results.push(...snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Team)));
    }
    return results;
  },

  create: async (leagueId: string, data: TeamFormValues): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.TEAMS(leagueId)), {
      ...data,
      playerCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  update: async (leagueId: string, teamId: string, data: Partial<TeamFormValues>): Promise<void> => {
    const docRef = doc(db, COLLECTIONS.TEAMS(leagueId), teamId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  delete: async (leagueId: string, teamId: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.TEAMS(leagueId), teamId));
  },

  uploadLogo: async (leagueId: string, file: File): Promise<string> => {
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `team-logos/${leagueId}/${fileName}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  deleteLogo: async (logoUrl: string): Promise<void> => {
    try {
      const storageRef = ref(storage, logoUrl);
      await deleteObject(storageRef);
    } catch {
      // Logo may not exist
    }
  },
};
