import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db, admin } from '../../admin';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import { serializeDoc } from '../utils/serialization';

// Match-scoped: /api/leagues/:leagueId/tournaments/:tId/matches/:matchId/player-stats
export const playerStatsRouter = Router({ mergeParams: true });

// Tournament-scoped: /api/leagues/:leagueId/tournaments/:tId/player-stats/aggregate
export const playerStatsAggregateRouter = Router({ mergeParams: true });

const StatFields = {
  passCompletions: z.number().int().min(0).default(0),
  passIncomplete: z.number().int().min(0).default(0),
  rushes: z.number().int().min(0).default(0),
  tdPassing: z.number().int().min(0).default(0),
  receptions: z.number().int().min(0).default(0),
  tdReceiving: z.number().int().min(0).default(0),
  flagPulls: z.number().int().min(0).default(0),
  sacks: z.number().int().min(0).default(0),
  interceptions: z.number().int().min(0).default(0),
  passesBlocked: z.number().int().min(0).default(0),
  tdDefensive: z.number().int().min(0).default(0),
};

const PlayerStatSchema = z.object({
  playerId: z.string().min(1),
  ...StatFields,
});

const PlayerStatPatchSchema = z.object(StatFields).partial();

// GET /api/leagues/:leagueId/tournaments/:tId/matches/:matchId/player-stats
playerStatsRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { leagueId, tId, matchId } = req.params as Record<string, string>;
  try {
    const snap = await db
      .collection(`leagues/${leagueId}/tournaments/${tId}/matches/${matchId}/playerStats`)
      .orderBy('playerName', 'asc')
      .get();
    const stats = snap.docs.map((d) => ({ id: d.id, ...serializeDoc(d.data()) }));
    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Failed to fetch player stats' });
  }
});

// POST /api/leagues/:leagueId/tournaments/:tId/matches/:matchId/player-stats
playerStatsRouter.post('/', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parse = PlayerStatSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

  const { leagueId, tId, matchId } = req.params as Record<string, string>;
  const { playerId, ...statData } = parse.data;

  try {
    const playerSnap = await db.doc(`leagues/${leagueId}/players/${playerId}`).get();
    if (!playerSnap.exists) { res.status(404).json({ error: 'Player not found' }); return; }

    const player = playerSnap.data() as { name: string; number: number; teamId: string; teamName: string };
    const now = admin.firestore.FieldValue.serverTimestamp();

    const docRef = await db
      .collection(`leagues/${leagueId}/tournaments/${tId}/matches/${matchId}/playerStats`)
      .add({
        playerId,
        playerName: player.name,
        playerNumber: player.number,
        teamId: player.teamId,
        teamName: player.teamName,
        ...statData,
        createdAt: now,
        updatedAt: now,
      });

    res.status(201).json({ id: docRef.id });
  } catch {
    res.status(500).json({ error: 'Failed to create player stat' });
  }
});

// PATCH /api/leagues/:leagueId/tournaments/:tId/matches/:matchId/player-stats/:statId
playerStatsRouter.patch('/:statId', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const parse = PlayerStatPatchSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

  const { leagueId, tId, matchId, statId } = req.params as Record<string, string>;

  try {
    const ref = db.doc(`leagues/${leagueId}/tournaments/${tId}/matches/${matchId}/playerStats/${statId}`);
    const snap = await ref.get();
    if (!snap.exists) { res.status(404).json({ error: 'Stat not found' }); return; }

    await ref.update({
      ...parse.data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ id: statId });
  } catch {
    res.status(500).json({ error: 'Failed to update player stat' });
  }
});

// DELETE /api/leagues/:leagueId/tournaments/:tId/matches/:matchId/player-stats/:statId
playerStatsRouter.delete('/:statId', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const { leagueId, tId, matchId, statId } = req.params as Record<string, string>;

  try {
    const ref = db.doc(`leagues/${leagueId}/tournaments/${tId}/matches/${matchId}/playerStats/${statId}`);
    const snap = await ref.get();
    if (!snap.exists) { res.status(404).json({ error: 'Stat not found' }); return; }

    await ref.delete();
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Failed to delete player stat' });
  }
});

// GET /api/leagues/:leagueId/tournaments/:tId/player-stats/aggregate
playerStatsAggregateRouter.get('/', async (req: Request, res: Response): Promise<void> => {
  const { leagueId, tId } = req.params as Record<string, string>;

  try {
    const matchesSnap = await db
      .collection(`leagues/${leagueId}/tournaments/${tId}/matches`)
      .get();

    const allStatSnaps = await Promise.all(
      matchesSnap.docs.map((m) =>
        db.collection(`leagues/${leagueId}/tournaments/${tId}/matches/${m.id}/playerStats`).get()
      )
    );

    type AggEntry = {
      playerId: string; playerName: string; playerNumber: number;
      teamId: string; teamName: string;
      passCompletions: number; passIncomplete: number; rushes: number; tdPassing: number;
      receptions: number; tdReceiving: number;
      flagPulls: number; sacks: number; interceptions: number; passesBlocked: number; tdDefensive: number;
    };

    const aggregated = new Map<string, AggEntry>();

    for (const snap of allStatSnaps) {
      for (const doc of snap.docs) {
        const d = doc.data() as AggEntry;
        if (!aggregated.has(d.playerId)) {
          aggregated.set(d.playerId, {
            playerId: d.playerId,
            playerName: d.playerName,
            playerNumber: d.playerNumber,
            teamId: d.teamId,
            teamName: d.teamName,
            passCompletions: 0, passIncomplete: 0, rushes: 0, tdPassing: 0,
            receptions: 0, tdReceiving: 0,
            flagPulls: 0, sacks: 0, interceptions: 0, passesBlocked: 0, tdDefensive: 0,
          });
        }
        const entry = aggregated.get(d.playerId)!;
        entry.passCompletions += d.passCompletions ?? 0;
        entry.passIncomplete += d.passIncomplete ?? 0;
        entry.rushes += d.rushes ?? 0;
        entry.tdPassing += d.tdPassing ?? 0;
        entry.receptions += d.receptions ?? 0;
        entry.tdReceiving += d.tdReceiving ?? 0;
        entry.flagPulls += d.flagPulls ?? 0;
        entry.sacks += d.sacks ?? 0;
        entry.interceptions += d.interceptions ?? 0;
        entry.passesBlocked += d.passesBlocked ?? 0;
        entry.tdDefensive += d.tdDefensive ?? 0;
      }
    }

    const result = Array.from(aggregated.values()).sort((a, b) => {
      const totalA = a.tdPassing + a.tdReceiving + a.tdDefensive;
      const totalB = b.tdPassing + b.tdReceiving + b.tdDefensive;
      return totalB - totalA;
    });

    res.json(result);
  } catch {
    res.status(500).json({ error: 'Failed to aggregate player stats' });
  }
});
