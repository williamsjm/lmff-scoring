import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db, admin } from '../../admin';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import { serializeDoc } from '../utils/serialization';

export const teamsRouter = Router({ mergeParams: true });

const TeamSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  logo: z.string().nullable().optional(),
});

// GET /api/leagues/:leagueId/teams
// GET /api/leagues/:leagueId/teams?ids=a,b,c
teamsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { leagueId } = req.params;
  const idsParam = req.query.ids as string | undefined;

  try {
    let docs;
    if (idsParam) {
      const ids = idsParam.split(',').filter(Boolean);
      if (ids.length === 0) { res.json([]); return; }
      const chunks: string[][] = [];
      for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30));
      const results = [];
      for (const chunk of chunks) {
        const snap = await db
          .collection(`leagues/${leagueId}/teams`)
          .where(admin.firestore.FieldPath.documentId(), 'in', chunk)
          .get();
        results.push(...snap.docs);
      }
      docs = results;
    } else {
      const snap = await db
        .collection(`leagues/${leagueId}/teams`)
        .orderBy('name', 'asc')
        .get();
      docs = snap.docs;
    }

    const teams = docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) }));
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// GET /api/leagues/:leagueId/teams/:teamId
teamsRouter.get('/:teamId', async (req: Request, res: Response): Promise<void> => {
  const { leagueId, teamId } = req.params;
  try {
    const snap = await db.doc(`leagues/${leagueId}/teams/${teamId}`).get();
    if (!snap.exists) { res.status(404).json({ error: 'Team not found' }); return; }
    res.json({ id: snap.id, ...serializeDoc(snap.data()!) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// POST /api/leagues/:leagueId/teams
teamsRouter.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parse = TeamSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

  const { leagueId } = req.params;
  try {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection(`leagues/${leagueId}/teams`).add({
      ...parse.data,
      logo: parse.data.logo ?? null,
      playerCount: 0,
      createdAt: now,
      updatedAt: now,
    });
    res.status(201).json({ id: docRef.id });
  } catch {
    res.status(500).json({ error: 'Failed to create team' });
  }
});

// PATCH /api/leagues/:leagueId/teams/:teamId
teamsRouter.patch('/:teamId', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { leagueId, teamId } = req.params;
  const parse = TeamSchema.partial().safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

  try {
    await db.doc(`leagues/${leagueId}/teams/${teamId}`).update({
      ...parse.data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ id: teamId });
  } catch {
    res.status(500).json({ error: 'Failed to update team' });
  }
});

// DELETE /api/leagues/:leagueId/teams/:teamId
teamsRouter.delete('/:teamId', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { leagueId, teamId } = req.params;
  try {
    await db.doc(`leagues/${leagueId}/teams/${teamId}`).delete();
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete team' });
  }
});
