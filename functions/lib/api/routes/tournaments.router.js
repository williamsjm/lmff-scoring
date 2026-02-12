"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tournamentsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const admin_1 = require("../../admin");
const authenticate_1 = require("../middleware/authenticate");
const requireAdmin_1 = require("../middleware/requireAdmin");
const serialization_1 = require("../utils/serialization");
exports.tournamentsRouter = (0, express_1.Router)({ mergeParams: true });
const TournamentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    status: zod_1.z.enum(['active', 'finished', 'upcoming']),
    startDate: zod_1.z.string().min(1),
    endDate: zod_1.z.string().min(1),
    teamIds: zod_1.z.array(zod_1.z.string()).optional().default([]),
    pointsWin: zod_1.z.number().int().nonnegative().optional().default(3),
    pointsDraw: zod_1.z.number().int().nonnegative().optional().default(1),
    pointsLoss: zod_1.z.number().int().nonnegative().optional().default(0),
});
// GET /api/leagues/:leagueId/tournaments
// GET /api/leagues/:leagueId/tournaments?status=active
exports.tournamentsRouter.get('/', async (req, res) => {
    const { leagueId } = req.params;
    const { status } = req.query;
    try {
        let query = admin_1.db.collection(`leagues/${leagueId}/tournaments`);
        if (status) {
            query = query.where('status', '==', status).orderBy('startDate', 'desc');
        }
        else {
            query = query.orderBy('startDate', 'desc');
        }
        const snap = await query.get();
        const tournaments = snap.docs.map((d) => ({ id: d.id, ...(0, serialization_1.serializeDoc)(d.data()) }));
        res.json(tournaments);
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
});
// GET /api/leagues/:leagueId/tournaments/:tId
exports.tournamentsRouter.get('/:tId', async (req, res) => {
    const { leagueId, tId } = req.params;
    try {
        const snap = await admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}`).get();
        if (!snap.exists) {
            res.status(404).json({ error: 'Tournament not found' });
            return;
        }
        res.json({ id: snap.id, ...(0, serialization_1.serializeDoc)(snap.data()) });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to fetch tournament' });
    }
});
// POST /api/leagues/:leagueId/tournaments
exports.tournamentsRouter.post('/', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const parse = TournamentSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    const { leagueId } = req.params;
    const data = parse.data;
    try {
        const now = admin_1.admin.firestore.FieldValue.serverTimestamp();
        const docRef = await admin_1.db.collection(`leagues/${leagueId}/tournaments`).add({
            ...data,
            startDate: (0, serialization_1.toTimestamp)(data.startDate),
            endDate: (0, serialization_1.toTimestamp)(data.endDate),
            matchdayCount: 0,
            createdAt: now,
            updatedAt: now,
        });
        res.status(201).json({ id: docRef.id });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to create tournament' });
    }
});
// PATCH /api/leagues/:leagueId/tournaments/:tId
exports.tournamentsRouter.patch('/:tId', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const { leagueId, tId } = req.params;
    const parse = TournamentSchema.partial().safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    const data = parse.data;
    const updateData = {
        ...data,
        updatedAt: admin_1.admin.firestore.FieldValue.serverTimestamp(),
    };
    if (data.startDate)
        updateData.startDate = (0, serialization_1.toTimestamp)(data.startDate);
    if (data.endDate)
        updateData.endDate = (0, serialization_1.toTimestamp)(data.endDate);
    try {
        await admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}`).update(updateData);
        res.json({ id: tId });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to update tournament' });
    }
});
// DELETE /api/leagues/:leagueId/tournaments/:tId
exports.tournamentsRouter.delete('/:tId', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const { leagueId, tId } = req.params;
    try {
        await admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}`).delete();
        res.status(204).send();
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to delete tournament' });
    }
});
//# sourceMappingURL=tournaments.router.js.map