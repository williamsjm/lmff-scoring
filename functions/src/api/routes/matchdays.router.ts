import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db, admin } from '../../admin';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import { serializeDoc, toTimestamp } from '../utils/serialization';

export const matchdaysRouter = Router({ mergeParams: true });

const MatchdaySchema = z.object({
  number: z.number().int().positive(),
  label: z.string().min(1),
  date: z.string().min(1),
  status: z.enum(['upcoming', 'in_progress', 'completed']).optional().default('upcoming'),
});

// GET /api/leagues/:leagueId/tournaments/:tId/matchdays
matchdaysRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { leagueId, tId } = req.params;
  try {
    const snap = await db
      .collection(`leagues/${leagueId}/tournaments/${tId}/matchdays`)
      .orderBy('number', 'asc')
      .get();
    const matchdays = snap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) }));
    res.json(matchdays);
  } catch {
    res.status(500).json({ error: 'Failed to fetch matchdays' });
  }
});

// POST /api/leagues/:leagueId/tournaments/:tId/matchdays
matchdaysRouter.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parse = MatchdaySchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

  const { leagueId, tId } = req.params;
  const data = parse.data;

  try {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();

    const mdRef = db.collection(`leagues/${leagueId}/tournaments/${tId}/matchdays`).doc();
    batch.set(mdRef, {
      ...data,
      date: toTimestamp(data.date),
      matchCount: 0,
      completedMatchCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    const tournamentRef = db.doc(`leagues/${leagueId}/tournaments/${tId}`);
    batch.update(tournamentRef, {
      matchdayCount: admin.firestore.FieldValue.increment(1),
    });

    await batch.commit();
    res.status(201).json({ id: mdRef.id });
  } catch {
    res.status(500).json({ error: 'Failed to create matchday' });
  }
});

// PATCH /api/leagues/:leagueId/tournaments/:tId/matchdays/:mdId
matchdaysRouter.patch('/:mdId', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { leagueId, tId, mdId } = req.params;
  const parse = MatchdaySchema.partial().safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

  const updateData: Record<string, unknown> = {
    ...parse.data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  if (parse.data.date) updateData.date = toTimestamp(parse.data.date);

  try {
    await db.doc(`leagues/${leagueId}/tournaments/${tId}/matchdays/${mdId}`).update(updateData);
    res.json({ id: mdId });
  } catch {
    res.status(500).json({ error: 'Failed to update matchday' });
  }
});

// DELETE /api/leagues/:leagueId/tournaments/:tId/matchdays/:mdId
matchdaysRouter.delete('/:mdId', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { leagueId, tId, mdId } = req.params;
  try {
    const batch = db.batch();
    batch.delete(db.doc(`leagues/${leagueId}/tournaments/${tId}/matchdays/${mdId}`));
    batch.update(db.doc(`leagues/${leagueId}/tournaments/${tId}`), {
      matchdayCount: admin.firestore.FieldValue.increment(-1),
    });
    await batch.commit();
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete matchday' });
  }
});
