import type { BaseDocument, FirestoreTimestamp } from '../../../shared/types/common.types';

export type MatchStatus = 'scheduled' | 'completed';
export type MatchdayStatus = 'upcoming' | 'in_progress' | 'completed';

export interface Match extends BaseDocument {
  matchdayId: string;
  matchdayNumber: number;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamLogo: string | null;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamLogo: string | null;
  homeScore: number | null;
  awayScore: number | null;
  date: FirestoreTimestamp;
  time: string;
  venue: string;
  status: MatchStatus;
}

export interface MatchFormValues {
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  time: string;
  venue: string;
}

export interface MatchScoreUpdate {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface Matchday extends BaseDocument {
  number: number;
  label: string;
  date: FirestoreTimestamp;
  status: MatchdayStatus;
  matchCount: number;
  completedMatchCount: number;
}

export interface MatchdayFormValues {
  number: number;
  label: string;
  date: string;
  status: MatchdayStatus;
}
