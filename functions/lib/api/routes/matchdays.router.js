"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchdaysRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const admin_1 = require("../../admin");
const authenticate_1 = require("../middleware/authenticate");
const requireAdmin_1 = require("../middleware/requireAdmin");
const serialization_1 = require("../utils/serialization");
exports.matchdaysRouter = (0, express_1.Router)({ mergeParams: true });
const MatchdaySchema = zod_1.z.object({
    number: zod_1.z.number().int().positive(),
    label: zod_1.z.string().min(1),
    date: zod_1.z.string().min(1),
    status: zod_1.z.enum(['upcoming', 'in_progress', 'completed']).optional().default('upcoming'),
});
// GET /api/leagues/:leagueId/tournaments/:tId/matchdays
exports.matchdaysRouter.get('/', async (req, res) => {
    const { leagueId, tId } = req.params;
    try {
        const snap = await admin_1.db
            .collection(`leagues/${leagueId}/tournaments/${tId}/matchdays`)
            .orderBy('number', 'asc')
            .get();
        const matchdays = snap.docs.map((d) => ({ id: d.id, ...(0, serialization_1.serializeDoc)(d.data()) }));
        res.json(matchdays);
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to fetch matchdays' });
    }
});
// POST /api/leagues/:leagueId/tournaments/:tId/matchdays
exports.matchdaysRouter.post('/', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const parse = MatchdaySchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    const { leagueId, tId } = req.params;
    const data = parse.data;
    try {
        const now = admin_1.admin.firestore.FieldValue.serverTimestamp();
        const batch = admin_1.db.batch();
        const mdRef = admin_1.db.collection(`leagues/${leagueId}/tournaments/${tId}/matchdays`).doc();
        batch.set(mdRef, {
            ...data,
            date: (0, serialization_1.toTimestamp)(data.date),
            matchCount: 0,
            completedMatchCount: 0,
            createdAt: now,
            updatedAt: now,
        });
        const tournamentRef = admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}`);
        batch.update(tournamentRef, {
            matchdayCount: admin_1.admin.firestore.FieldValue.increment(1),
        });
        await batch.commit();
        res.status(201).json({ id: mdRef.id });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to create matchday' });
    }
});
// PATCH /api/leagues/:leagueId/tournaments/:tId/matchdays/:mdId
exports.matchdaysRouter.patch('/:mdId', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const { leagueId, tId, mdId } = req.params;
    const parse = MatchdaySchema.partial().safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    const updateData = {
        ...parse.data,
        updatedAt: admin_1.admin.firestore.FieldValue.serverTimestamp(),
    };
    if (parse.data.date)
        updateData.date = (0, serialization_1.toTimestamp)(parse.data.date);
    try {
        await admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}/matchdays/${mdId}`).update(updateData);
        res.json({ id: mdId });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to update matchday' });
    }
});
// DELETE /api/leagues/:leagueId/tournaments/:tId/matchdays/:mdId
exports.matchdaysRouter.delete('/:mdId', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const { leagueId, tId, mdId } = req.params;
    try {
        const batch = admin_1.db.batch();
        batch.delete(admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}/matchdays/${mdId}`));
        batch.update(admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}`), {
            matchdayCount: admin_1.admin.firestore.FieldValue.increment(-1),
        });
        await batch.commit();
        res.status(204).send();
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to delete matchday' });
    }
});
//# sourceMappingURL=matchdays.router.js.map