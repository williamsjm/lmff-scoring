import { Router, Request, Response } from 'express';
import { db } from '../../admin';
import { serializeDoc } from '../utils/serialization';

export const leaguesRouter = Router();

// GET /api/leagues
leaguesRouter.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const snap = await db.collection('leagues').orderBy('name', 'asc').get();
    const leagues = snap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) }));
    res.json(leagues);
  } catch {
    res.status(500).json({ error: 'Failed to fetch leagues' });
  }
});
