import type { Timestamp } from 'firebase/firestore';

export interface Standing {
  id: string;
  teamId: string;
  teamName: string;
  teamLogo: string | null;
  teamColor: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  scoreFor: number;
  scoreAgainst: number;
  scoreDifference: number;
  points: number;
  rank: number;
  lastUpdated: Timestamp;
}
