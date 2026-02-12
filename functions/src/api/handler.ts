import { onRequest } from 'firebase-functions/v2/https';
import { createApp } from './app';

const app = createApp();

export const api = onRequest(
  { region: 'us-central1', minInstances: 0 },
  app
);
