import { Router, Request, Response } from "express";
import { z } from "zod";
import { db, admin } from "../../admin";
import { authenticate } from "../middleware/authenticate";
import { requireAdmin } from "../middleware/requireAdmin";
import { serializeDoc, toTimestamp } from "../utils/serialization";

export const tournamentsRouter = Router({ mergeParams: true });

const TournamentSchema = z.object({
  name: z.string().min(1),
  status: z.enum(["active", "finished", "upcoming"]),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  teamIds: z.array(z.string()).optional().default([]),
  pointsWin: z.number().int().nonnegative().optional().default(3),
  pointsDraw: z.number().int().nonnegative().optional().default(1),
  pointsLoss: z.number().int().nonnegative().optional().default(0),
});

// GET /api/leagues/:leagueId/tournaments
// GET /api/leagues/:leagueId/tournaments?status=active
tournamentsRouter.get(
  "/",
  async (req: Request, res: Response): Promise<void> => {
    const { leagueId } = req.params;
    const { status } = req.query;

    try {
      let query = db.collection(
        `leagues/${leagueId}/tournaments`,
      ) as FirebaseFirestore.Query;
      if (status) {
        query = query
          .where("status", "==", status)
          .orderBy("startDate", "desc");
      } else {
        query = query.orderBy("startDate", "desc");
      }
      const snap = await query.get();
      const tournaments = snap.docs.map((d) => ({
        id: d.id,
        ...serializeDoc(d.data()),
      }));
      res.json(tournaments);
    } catch {
      res.status(500).json({ error: "Failed to fetch tournaments" });
    }
  },
);

// GET /api/leagues/:leagueId/tournaments/:tId
tournamentsRouter.get(
  "/:tId",
  async (req: Request, res: Response): Promise<void> => {
    const { leagueId, tId } = req.params;
    try {
      const snap = await db.doc(`leagues/${leagueId}/tournaments/${tId}`).get();
      if (!snap.exists) {
        res.status(404).json({ error: "Tournament not found" });
        return;
      }
      res.json({ id: snap.id, ...serializeDoc(snap.data()!) });
    } catch {
      res.status(500).json({ error: "Failed to fetch tournament" });
    }
  },
);

// POST /api/leagues/:leagueId/tournaments
tournamentsRouter.post(
  "/",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const parse = TournamentSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.flatten() });
      return;
    }

    const { leagueId } = req.params;
    const data = parse.data;

    try {
      const now = admin.firestore.FieldValue.serverTimestamp();
      const docRef = await db
        .collection(`leagues/${leagueId}/tournaments`)
        .add({
          ...data,
          startDate: toTimestamp(data.startDate),
          endDate: toTimestamp(data.endDate),
          matchdayCount: 0,
          createdAt: now,
          updatedAt: now,
        });
      res.status(201).json({ id: docRef.id });
    } catch {
      res.status(500).json({ error: "Failed to create tournament" });
    }
  },
);

// PATCH /api/leagues/:leagueId/tournaments/:tId
tournamentsRouter.patch(
  "/:tId",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const { leagueId, tId } = req.params;
    const parse = TournamentSchema.partial().safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: parse.error.flatten() });
      return;
    }

    const data = parse.data;
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (data.startDate) updateData.startDate = toTimestamp(data.startDate);
    if (data.endDate) updateData.endDate = toTimestamp(data.endDate);

    try {
      await db.doc(`leagues/${leagueId}/tournaments/${tId}`).update(updateData);
      res.json({ id: tId });
    } catch {
      res.status(500).json({ error: "Failed to update tournament" });
    }
  },
);

// DELETE /api/leagues/:leagueId/tournaments/:tId
tournamentsRouter.delete(
  "/:tId",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    const { leagueId, tId } = req.params;
    try {
      await db.doc(`leagues/${leagueId}/tournaments/${tId}`).delete();
      res.status(204).send();
    } catch {
      res.status(500).json({ error: "Failed to delete tournament" });
    }
  },
);
