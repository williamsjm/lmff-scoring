import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db, admin } from '../../admin';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import { serializeDoc } from '../utils/serialization';

export const playersRouter = Router({ mergeParams: true });

const PlayerSchema = z.object({
  name: z.string().min(1),
  number: z.number().int().nonnegative(),
  position: z.string().min(1),
  teamId: z.string().min(1),
});

// GET /api/leagues/:leagueId/players
// GET /api/leagues/:leagueId/players?teamId=...
playersRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { leagueId } = req.params;
  const { teamId } = req.query;

  try {
    let query = db.collection(`leagues/${leagueId}/players`) as FirebaseFirestore.Query;
    if (teamId) {
      query = query.where('teamId', '==', teamId).orderBy('number', 'asc');
    } else {
      query = query.orderBy('name', 'asc');
    }
    const snap = await query.get();
    const players = snap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) }));
    res.json(players);
  } catch {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// GET /api/leagues/:leagueId/players/:playerId
playersRouter.get('/:playerId', async (req: Request, res: Response): Promise<void> => {
  const { leagueId, playerId } = req.params;
  try {
    const snap = await db.doc(`leagues/${leagueId}/players/${playerId}`).get();
    if (!snap.exists) { res.status(404).json({ error: 'Player not found' }); return; }
    res.json({ id: snap.id, ...serializeDoc(snap.data()!) });
  } catch {
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

// POST /api/leagues/:leagueId/players
playersRouter.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parse = PlayerSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

  const { leagueId } = req.params;
  const { teamId } = parse.data;

  try {
    const teamSnap = await db.doc(`leagues/${leagueId}/teams/${teamId}`).get();
    if (!teamSnap.exists) { res.status(400).json({ error: 'Team not found' }); return; }
    const teamName = (teamSnap.data() as { name: string }).name;

    const now = admin.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();

    const playerRef = db.collection(`leagues/${leagueId}/players`).doc();
    batch.set(playerRef, {
      ...parse.data,
      teamName,
      userId: null,
      createdAt: now,
      updatedAt: now,
    });

    const teamRef = db.doc(`leagues/${leagueId}/teams/${teamId}`);
    batch.update(teamRef, { playerCount: admin.firestore.FieldValue.increment(1) });

    await batch.commit();
    res.status(201).json({ id: playerRef.id });
  } catch {
    res.status(500).json({ error: 'Failed to create player' });
  }
});

// PATCH /api/leagues/:leagueId/players/:playerId
playersRouter.patch('/:playerId', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { leagueId, playerId } = req.params;
  const parse = PlayerSchema.partial().safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

  try {
    const updateData: Record<string, unknown> = {
      ...parse.data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (parse.data.teamId) {
      const teamSnap = await db.doc(`leagues/${leagueId}/teams/${parse.data.teamId}`).get();
      if (teamSnap.exists) {
        updateData.teamName = (teamSnap.data() as { name: string }).name;
      }
    }

    await db.doc(`leagues/${leagueId}/players/${playerId}`).update(updateData);
    res.json({ id: playerId });
  } catch {
    res.status(500).json({ error: 'Failed to update player' });
  }
});

// DELETE /api/leagues/:leagueId/players/:playerId
playersRouter.delete('/:playerId', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { leagueId, playerId } = req.params;
  try {
    const playerSnap = await db.doc(`leagues/${leagueId}/players/${playerId}`).get();
    if (!playerSnap.exists) { res.status(404).json({ error: 'Player not found' }); return; }
    const teamId = (playerSnap.data() as { teamId: string }).teamId;

    const batch = db.batch();
    batch.delete(db.doc(`leagues/${leagueId}/players/${playerId}`));
    batch.update(db.doc(`leagues/${leagueId}/teams/${teamId}`), {
      playerCount: admin.firestore.FieldValue.increment(-1),
    });
    await batch.commit();
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete player' });
  }
});
