import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { admin, db } from '../../admin';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';

export const usersRouter = Router();

const SetRoleSchema = z.object({
  role: z.enum(['admin', 'captain', 'player']),
  leagueId: z.string().optional().nullable(),
});

// POST /api/users/:uid/role
usersRouter.post('/:uid/role', authenticate, requireAdmin, async (req: Request, res: Response): Promise<void> => {
  const uid = req.params.uid as string;
  const parse = SetRoleSchema.safeParse(req.body);
  if (!parse.success) { res.status(400).json({ error: parse.error.flatten() }); return; }

  const { role, leagueId } = parse.data;

  try {
    await admin.auth().setCustomUserClaims(uid, { role, leagueId: leagueId ?? null });
    await db.doc(`users/${uid}`).update({
      role,
      leagueId: leagueId ?? null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to set user role' });
  }
});
