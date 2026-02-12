import type { BaseDocument } from './common.types';

export interface BaseApiDocument extends Omit<BaseDocument, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export type ToApiDocument<T extends BaseDocument> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};
