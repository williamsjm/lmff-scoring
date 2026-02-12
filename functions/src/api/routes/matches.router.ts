import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db, admin } from '../../admin';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import { serializeDoc, toTimestamp } from '../utils/serialization';

export const matchesRouter = Router({ mergeParams: true });

const MatchSchema = z.object({
  matchdayId: z.string().min(1),
  matchdayNumber: z.number().int().positive(),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  date: z.string().min(1),
  time: z.string().optional().default(''),
  venue: z.string().optional().default(''),
});

const ScoreSchema = z.object({
  homeScore: z.number().int().nonnegative(),
  awayScore: z.number().int().nonnegative(),
});

const ScoresBatchSchema = z.object({
  matchdayId: z.string().min(1),
  scores: z.array(z.object({
    matchId: z.string().min(1),
    homeScore: z.number().int().nonnegative(),
    awayScore: z.number().int().nonnegative(),
  })),
});

// GET /api/leagues/:leagueId/tournaments/:tId/matches
// GET /api/leagues/:leagueId/tournaments/:tId/matches?matchdayId=...
matchesRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { leagueId, tId } = req.params;
  const { matchdayId } = req.query;

  try {
    let query = db.collection(`leagues/${leagueId}/tournaments/${tId}/matches`) as FirebaseFirestore.Query;
    if (matchdayId) {
      query = query.where('matchdayId', '==', matchdayId).orderBy('date', 'asc');
    } else {
      query = query.orderBy('date', 'asc');
    }
    const snap = await query.get();
    const matches = snap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) }));
    res.json(matches);
  } catch {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

// POST /api/leagues/:leagueId/tournaments/:tId/matches
matchesRouter.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parse = MatchSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

  const { leagueId, tId } = req.params;
  const data = parse.data;

  try {
    const [homeSnap, awaySnap] = await Promise.all([
      db.doc(`leagues/${leagueId}/teams/${data.homeTeamId}`).get(),
      db.doc(`leagues/${leagueId}/teams/${data.awayTeamId}`).get(),
    ]);

    if (!homeSnap.exists || !awaySnap.exists) {
      res.status(400).json({ error: 'One or both teams not found' });
      return;
    }

    const homeTeam = homeSnap.data() as { name: string; logo?: string | null };
    const awayTeam = awaySnap.data() as { name: string; logo?: string | null };

    const now = admin.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();

    const matchRef = db.collection(`leagues/${leagueId}/tournaments/${tId}/matches`).doc();
    batch.set(matchRef, {
      matchdayId: data.matchdayId,
      matchdayNumber: data.matchdayNumber,
      homeTeamId: data.homeTeamId,
      homeTeamName: homeTeam.name,
      homeTeamLogo: homeTeam.logo ?? null,
      awayTeamId: data.awayTeamId,
      awayTeamName: awayTeam.name,
      awayTeamLogo: awayTeam.logo ?? null,
      homeScore: null,
      awayScore: null,
      date: toTimestamp(data.date),
      time: data.time,
      venue: data.venue,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    });

    const matchdayRef = db.doc(`leagues/${leagueId}/tournaments/${tId}/matchdays/${data.matchdayId}`);
    batch.update(matchdayRef, {
      matchCount: admin.firestore.FieldValue.increment(1),
    });

    await batch.commit();
    res.status(201).json({ id: matchRef.id });
  } catch {
    res.status(500).json({ error: 'Failed to create match' });
  }
});

// PATCH /api/leagues/:leagueId/tournaments/:tId/matches/scores-batch
// IMPORTANT: this must be declared BEFORE /:matchId/score
matchesRouter.patch('/scores-batch', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parse = ScoresBatchSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

  const { leagueId, tId } = req.params;
  const { matchdayId, scores } = parse.data;

  try {
    const now = admin.firestore.FieldValue.serverTimestamp();
    const batch = db.batch();
    let newCompletedCount = 0;

    for (const score of scores) {
      const matchRef = db.doc(`leagues/${leagueId}/tournaments/${tId}/matches/${score.matchId}`);
      const matchSnap = await matchRef.get();
      const wasCompleted = matchSnap.exists && (matchSnap.data() as { status: string }).status === 'completed';

      batch.update(matchRef, {
        homeScore: score.homeScore,
        awayScore: score.awayScore,
        status: 'completed',
        updatedAt: now,
      });

      if (!wasCompleted) newCompletedCount++;
    }

    if (newCompletedCount > 0) {
      const matchdayRef = db.doc(`leagues/${leagueId}/tournaments/${tId}/matchdays/${matchdayId}`);
      batch.update(matchdayRef, {
        completedMatchCount: admin.firestore.FieldValue.increment(newCompletedCount),
        updatedAt: now,
      });
    }

    await batch.commit();
    res.json({ updated: scores.length, newlyCompleted: newCompletedCount });
  } catch {
    res.status(500).json({ error: 'Failed to update scores' });
  }
});

// PATCH /api/leagues/:leagueId/tournaments/:tId/matches/:matchId/score
matchesRouter.patch('/:matchId/score', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { leagueId, tId, matchId } = req.params;
  const parse = ScoreSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

  try {
    await db.doc(`leagues/${leagueId}/tournaments/${tId}/matches/${matchId}`).update({
      homeScore: parse.data.homeScore,
      awayScore: parse.data.awayScore,
      status: 'completed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ id: matchId });
  } catch {
    res.status(500).json({ error: 'Failed to update score' });
  }
});

// DELETE /api/leagues/:leagueId/tournaments/:tId/matches/:matchId
matchesRouter.delete('/:matchId', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { leagueId, tId, matchId } = req.params;

  try {
    const matchSnap = await db.doc(`leagues/${leagueId}/tournaments/${tId}/matches/${matchId}`).get();
    if (!matchSnap.exists) { res.status(404).json({ error: 'Match not found' }); return; }
    const matchdayId = (matchSnap.data() as { matchdayId: string }).matchdayId;

    const batch = db.batch();
    batch.delete(db.doc(`leagues/${leagueId}/tournaments/${tId}/matches/${matchId}`));
    batch.update(db.doc(`leagues/${leagueId}/tournaments/${tId}/matchdays/${matchdayId}`), {
      matchCount: admin.firestore.FieldValue.increment(-1),
    });
    await batch.commit();
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete match' });
  }
});
