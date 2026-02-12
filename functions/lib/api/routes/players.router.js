"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playersRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const admin_1 = require("../../admin");
const authenticate_1 = require("../middleware/authenticate");
const requireAdmin_1 = require("../middleware/requireAdmin");
const serialization_1 = require("../utils/serialization");
exports.playersRouter = (0, express_1.Router)({ mergeParams: true });
const PlayerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    number: zod_1.z.number().int().nonnegative(),
    position: zod_1.z.string().min(1),
    teamId: zod_1.z.string().min(1),
});
// GET /api/leagues/:leagueId/players
// GET /api/leagues/:leagueId/players?teamId=...
exports.playersRouter.get('/', async (req, res) => {
    const { leagueId } = req.params;
    const { teamId } = req.query;
    try {
        let query = admin_1.db.collection(`leagues/${leagueId}/players`);
        if (teamId) {
            query = query.where('teamId', '==', teamId).orderBy('number', 'asc');
        }
        else {
            query = query.orderBy('name', 'asc');
        }
        const snap = await query.get();
        const players = snap.docs.map((d) => ({ id: d.id, ...(0, serialization_1.serializeDoc)(d.data()) }));
        res.json(players);
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to fetch players' });
    }
});
// GET /api/leagues/:leagueId/players/:playerId
exports.playersRouter.get('/:playerId', async (req, res) => {
    const { leagueId, playerId } = req.params;
    try {
        const snap = await admin_1.db.doc(`leagues/${leagueId}/players/${playerId}`).get();
        if (!snap.exists) {
            res.status(404).json({ error: 'Player not found' });
            return;
        }
        res.json({ id: snap.id, ...(0, serialization_1.serializeDoc)(snap.data()) });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to fetch player' });
    }
});
// POST /api/leagues/:leagueId/players
exports.playersRouter.post('/', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const parse = PlayerSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    const { leagueId } = req.params;
    const { teamId } = parse.data;
    try {
        const teamSnap = await admin_1.db.doc(`leagues/${leagueId}/teams/${teamId}`).get();
        if (!teamSnap.exists) {
            res.status(400).json({ error: 'Team not found' });
            return;
        }
        const teamName = teamSnap.data().name;
        const now = admin_1.admin.firestore.FieldValue.serverTimestamp();
        const batch = admin_1.db.batch();
        const playerRef = admin_1.db.collection(`leagues/${leagueId}/players`).doc();
        batch.set(playerRef, {
            ...parse.data,
            teamName,
            userId: null,
            createdAt: now,
            updatedAt: now,
        });
        const teamRef = admin_1.db.doc(`leagues/${leagueId}/teams/${teamId}`);
        batch.update(teamRef, { playerCount: admin_1.admin.firestore.FieldValue.increment(1) });
        await batch.commit();
        res.status(201).json({ id: playerRef.id });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to create player' });
    }
});
// PATCH /api/leagues/:leagueId/players/:playerId
exports.playersRouter.patch('/:playerId', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const { leagueId, playerId } = req.params;
    const parse = PlayerSchema.partial().safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    try {
        const updateData = {
            ...parse.data,
            updatedAt: admin_1.admin.firestore.FieldValue.serverTimestamp(),
        };
        if (parse.data.teamId) {
            const teamSnap = await admin_1.db.doc(`leagues/${leagueId}/teams/${parse.data.teamId}`).get();
            if (teamSnap.exists) {
                updateData.teamName = teamSnap.data().name;
            }
        }
        await admin_1.db.doc(`leagues/${leagueId}/players/${playerId}`).update(updateData);
        res.json({ id: playerId });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to update player' });
    }
});
// DELETE /api/leagues/:leagueId/players/:playerId
exports.playersRouter.delete('/:playerId', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const { leagueId, playerId } = req.params;
    try {
        const playerSnap = await admin_1.db.doc(`leagues/${leagueId}/players/${playerId}`).get();
        if (!playerSnap.exists) {
            res.status(404).json({ error: 'Player not found' });
            return;
        }
        const teamId = playerSnap.data().teamId;
        const batch = admin_1.db.batch();
        batch.delete(admin_1.db.doc(`leagues/${leagueId}/players/${playerId}`));
        batch.update(admin_1.db.doc(`leagues/${leagueId}/teams/${teamId}`), {
            playerCount: admin_1.admin.firestore.FieldValue.increment(-1),
        });
        await batch.commit();
        res.status(204).send();
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to delete player' });
    }
});
//# sourceMappingURL=players.router.js.map