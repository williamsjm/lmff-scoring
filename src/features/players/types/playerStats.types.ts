import type { BaseDocument } from '../../../shared/types/common.types';

export interface PlayerStat extends BaseDocument {
  playerId: string;
  playerName: string;
  playerNumber: number;
  teamId: string;
  teamName: string;
  // QB
  passCompletions: number;
  passIncomplete: number;
  rushes: number;
  tdPassing: number;
  // Receptor
  receptions: number;
  tdReceiving: number;
  // Defensiva
  flagPulls: number;
  sacks: number;
  interceptions: number;
  passesBlocked: number;
  tdDefensive: number;
}

export interface PlayerStatFormValues {
  playerId: string;
  passCompletions: number;
  passIncomplete: number;
  rushes: number;
  tdPassing: number;
  receptions: number;
  tdReceiving: number;
  flagPulls: number;
  sacks: number;
  interceptions: number;
  passesBlocked: number;
  tdDefensive: number;
}

export interface PlayerStatAggregate {
  playerId: string;
  playerName: string;
  playerNumber: number;
  teamId: string;
  teamName: string;
  passCompletions: number;
  passIncomplete: number;
  rushes: number;
  tdPassing: number;
  receptions: number;
  tdReceiving: number;
  flagPulls: number;
  sacks: number;
  interceptions: number;
  passesBlocked: number;
  tdDefensive: number;
}
