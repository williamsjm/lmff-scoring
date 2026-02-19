import type { BaseDocument } from '../../../shared/types/common.types';

export type PlayerPosition = 'QB' | 'WR' | 'CB' | 'S' | 'LB' | 'RB' | 'OL' | 'DL';

export interface Player extends BaseDocument {
  name: string;
  number: number;
  position: PlayerPosition;
  teamId: string;
  teamName: string;
  userId: string | null;
}

export interface PlayerFormValues {
  name: string;
  number: number;
  position: PlayerPosition;
  teamId: string;
}

export const POSITION_OPTIONS: { value: PlayerPosition; label: string }[] = [
  { value: 'QB', label: 'Quarterback (QB)' },
  { value: 'WR', label: 'Wide Receiver (WR)' },
  { value: 'RB', label: 'Running Back (RB)' },
  { value: 'OL', label: 'Offensive Line (OL)' },
  { value: 'CB', label: 'Cornerback (CB)' },
  { value: 'S', label: 'Safety (S)' },
  { value: 'LB', label: 'Linebacker (LB)' },
  { value: 'DL', label: 'Defensive Line (DL)' },
];
