"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const admin_1 = require("../../admin");
const authenticate_1 = require("../middleware/authenticate");
const requireAdmin_1 = require("../middleware/requireAdmin");
const serialization_1 = require("../utils/serialization");
exports.teamsRouter = (0, express_1.Router)({ mergeParams: true });
const TeamSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    color: zod_1.z.string().min(1),
    logo: zod_1.z.string().nullable().optional(),
});
// GET /api/leagues/:leagueId/teams
// GET /api/leagues/:leagueId/teams?ids=a,b,c
exports.teamsRouter.get('/', async (req, res) => {
    const { leagueId } = req.params;
    const idsParam = req.query.ids;
    try {
        let docs;
        if (idsParam) {
            const ids = idsParam.split(',').filter(Boolean);
            if (ids.length === 0) {
                res.json([]);
                return;
            }
            const chunks = [];
            for (let i = 0; i < ids.length; i += 30)
                chunks.push(ids.slice(i, i + 30));
            const results = [];
            for (const chunk of chunks) {
                const snap = await admin_1.db
                    .collection(`leagues/${leagueId}/teams`)
                    .where(admin_1.admin.firestore.FieldPath.documentId(), 'in', chunk)
                    .get();
                results.push(...snap.docs);
            }
            docs = results;
        }
        else {
            const snap = await admin_1.db
                .collection(`leagues/${leagueId}/teams`)
                .orderBy('name', 'asc')
                .get();
            docs = snap.docs;
        }
        const teams = docs.map((d) => ({ id: d.id, ...(0, serialization_1.serializeDoc)(d.data()) }));
        res.json(teams);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});
// GET /api/leagues/:leagueId/teams/:teamId
exports.teamsRouter.get('/:teamId', async (req, res) => {
    const { leagueId, teamId } = req.params;
    try {
        const snap = await admin_1.db.doc(`leagues/${leagueId}/teams/${teamId}`).get();
        if (!snap.exists) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        res.json({ id: snap.id, ...(0, serialization_1.serializeDoc)(snap.data()) });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to fetch team' });
    }
});
// POST /api/leagues/:leagueId/teams
exports.teamsRouter.post('/', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    var _a;
    const parse = TeamSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    const { leagueId } = req.params;
    try {
        const now = admin_1.admin.firestore.FieldValue.serverTimestamp();
        const docRef = await admin_1.db.collection(`leagues/${leagueId}/teams`).add({
            ...parse.data,
            logo: (_a = parse.data.logo) !== null && _a !== void 0 ? _a : null,
            playerCount: 0,
            createdAt: now,
            updatedAt: now,
        });
        res.status(201).json({ id: docRef.id });
    }
    catch (_b) {
        res.status(500).json({ error: 'Failed to create team' });
    }
});
// PATCH /api/leagues/:leagueId/teams/:teamId
exports.teamsRouter.patch('/:teamId', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const { leagueId, teamId } = req.params;
    const parse = TeamSchema.partial().safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    try {
        await admin_1.db.doc(`leagues/${leagueId}/teams/${teamId}`).update({
            ...parse.data,
            updatedAt: admin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        res.json({ id: teamId });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to update team' });
    }
});
// DELETE /api/leagues/:leagueId/teams/:teamId
exports.teamsRouter.delete('/:teamId', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const { leagueId, teamId } = req.params;
    try {
        await admin_1.db.doc(`leagues/${leagueId}/teams/${teamId}`).delete();
        res.status(204).send();
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to delete team' });
    }
});
//# sourceMappingURL=teams.router.js.map