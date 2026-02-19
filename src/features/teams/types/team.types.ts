import type { BaseDocument } from '../../../shared/types/common.types';

export interface Team extends BaseDocument {
  name: string;
  logo: string | null;
  color: string;
  captainId: string | null;
  captainName: string | null;
  playerCount: number;
  isActive: boolean;
}

export interface TeamFormValues {
  name: string;
  color: string;
  logo?: string | null;
  captainId?: string | null;
  captainName?: string | null;
  isActive: boolean;
}
