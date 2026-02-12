import type { Timestamp } from 'firebase/firestore';

export type FirestoreTimestamp = Timestamp;

export interface BaseDocument {
  id: string;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export type UserRole = 'super_admin' | 'admin' | 'captain' | 'player';

export interface AppUser extends BaseDocument {
  email: string;
  displayName: string;
  role: UserRole;
  leagueId: string | null;
  teamId: string | null;
  playerId: string | null;
  lastLogin: FirestoreTimestamp;
}
