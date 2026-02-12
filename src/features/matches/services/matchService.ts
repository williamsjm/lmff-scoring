import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
  onSnapshot,
  increment,
} from 'firebase/firestore';
import { db } from '../../../app/firebase';
import { COLLECTIONS } from '../../../shared/constants/firestore-paths';
import type { Match, MatchFormValues, MatchScoreUpdate } from '../types/match.types';
import type { Team } from '../../teams/types/team.types';

export const matchService = {
  getByMatchday: async (
    leagueId: string,
    tournamentId: string,
    matchdayId: string
  ): Promise<Match[]> => {
    const q = query(
      collection(db, COLLECTIONS.MATCHES(leagueId, tournamentId)),
      where('matchdayId', '==', matchdayId),
      orderBy('date', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match));
  },

  getAll: async (leagueId: string, tournamentId: string): Promise<Match[]> => {
    const q = query(
      collection(db, COLLECTIONS.MATCHES(leagueId, tournamentId)),
      orderBy('date', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match));
  },

  create: async (
    leagueId: string,
    tournamentId: string,
    data: MatchFormValues,
    matchdayId: string,
    matchdayNumber: number,
    homeTeam: Team,
    awayTeam: Team
  ): Promise<string> => {
    const docRef = await addDoc(
      collection(db, COLLECTIONS.MATCHES(leagueId, tournamentId)),
      {
        matchdayId,
        matchdayNumber,
        homeTeamId: homeTeam.id,
        homeTeamName: homeTeam.name,
        homeTeamLogo: homeTeam.logo,
        awayTeamId: awayTeam.id,
        awayTeamName: awayTeam.name,
        awayTeamLogo: awayTeam.logo,
        homeScore: null,
        awayScore: null,
        date: Timestamp.fromDate(new Date(data.date)),
        time: data.time,
        venue: data.venue,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
    );
    const matchdayRef = doc(db, COLLECTIONS.MATCHDAYS(leagueId, tournamentId), matchdayId);
    await updateDoc(matchdayRef, { matchCount: increment(1) });
    return docRef.id;
  },

  updateScore: async (
    leagueId: string,
    tournamentId: string,
    matchId: string,
    homeScore: number,
    awayScore: number
  ): Promise<void> => {
    const matchRef = doc(db, COLLECTIONS.MATCHES(leagueId, tournamentId), matchId);
    await updateDoc(matchRef, {
      homeScore,
      awayScore,
      status: 'completed',
      updatedAt: serverTimestamp(),
    });
  },

  updateScoresBatch: async (
    leagueId: string,
    tournamentId: string,
    scores: MatchScoreUpdate[],
    matchdayId: string
  ): Promise<void> => {
    const batch = writeBatch(db);
    let newCompletedCount = 0;

    for (const score of scores) {
      const matchRef = doc(db, COLLECTIONS.MATCHES(leagueId, tournamentId), score.matchId);
      batch.update(matchRef, {
        homeScore: score.homeScore,
        awayScore: score.awayScore,
        status: 'completed',
        updatedAt: serverTimestamp(),
      });
      newCompletedCount++;
    }

    const matchdayRef = doc(db, COLLECTIONS.MATCHDAYS(leagueId, tournamentId), matchdayId);
    batch.update(matchdayRef, {
      completedMatchCount: increment(newCompletedCount),
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  },

  delete: async (
    leagueId: string,
    tournamentId: string,
    matchId: string,
    matchdayId: string
  ): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.MATCHES(leagueId, tournamentId), matchId));
    const matchdayRef = doc(db, COLLECTIONS.MATCHDAYS(leagueId, tournamentId), matchdayId);
    await updateDoc(matchdayRef, { matchCount: increment(-1) });
  },

  subscribeByMatchday: (
    leagueId: string,
    tournamentId: string,
    matchdayId: string,
    callback: (matches: Match[]) => void
  ) => {
    const q = query(
      collection(db, COLLECTIONS.MATCHES(leagueId, tournamentId)),
      where('matchdayId', '==', matchdayId),
      orderBy('date', 'asc')
    );
    return onSnapshot(q, (snapshot) => {
      const matches = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match));
      callback(matches);
    });
  },
};
