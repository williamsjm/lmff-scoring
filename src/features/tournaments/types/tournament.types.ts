import type { BaseDocument, FirestoreTimestamp } from '../../../shared/types/common.types';

export type TournamentFormat = 'round_robin' | 'groups_elimination' | 'single_elimination';
export type TournamentStatus = 'upcoming' | 'active' | 'finished';

export interface Tournament extends BaseDocument {
  name: string;
  format: TournamentFormat;
  status: TournamentStatus;
  teamIds: string[];
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  startDate: FirestoreTimestamp;
  endDate: FirestoreTimestamp;
  matchdayCount: number;
}

export interface TournamentFormValues {
  name: string;
  format: TournamentFormat;
  status: TournamentStatus;
  teamIds: string[];
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  startDate: string;
  endDate: string;
}

export const FORMAT_OPTIONS: { value: TournamentFormat; label: string }[] = [
  { value: 'round_robin', label: 'Todos contra todos' },
  { value: 'groups_elimination', label: 'Grupos + Eliminacion' },
  { value: 'single_elimination', label: 'Eliminacion directa' },
];

export const STATUS_OPTIONS: { value: TournamentStatus; label: string }[] = [
  { value: 'upcoming', label: 'Proximo' },
  { value: 'active', label: 'Activo' },
  { value: 'finished', label: 'Finalizado' },
];
