"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const admin_1 = require("../../admin");
const authenticate_1 = require("../middleware/authenticate");
const requireAdmin_1 = require("../middleware/requireAdmin");
const serialization_1 = require("../utils/serialization");
exports.matchesRouter = (0, express_1.Router)({ mergeParams: true });
const MatchSchema = zod_1.z.object({
    matchdayId: zod_1.z.string().min(1),
    matchdayNumber: zod_1.z.number().int().positive(),
    homeTeamId: zod_1.z.string().min(1),
    awayTeamId: zod_1.z.string().min(1),
    date: zod_1.z.string().min(1),
    time: zod_1.z.string().optional().default(''),
    venue: zod_1.z.string().optional().default(''),
});
const ScoreSchema = zod_1.z.object({
    homeScore: zod_1.z.number().int().nonnegative(),
    awayScore: zod_1.z.number().int().nonnegative(),
});
const ScoresBatchSchema = zod_1.z.object({
    matchdayId: zod_1.z.string().min(1),
    scores: zod_1.z.array(zod_1.z.object({
        matchId: zod_1.z.string().min(1),
        homeScore: zod_1.z.number().int().nonnegative(),
        awayScore: zod_1.z.number().int().nonnegative(),
    })),
});
// GET /api/leagues/:leagueId/tournaments/:tId/matches
// GET /api/leagues/:leagueId/tournaments/:tId/matches?matchdayId=...
exports.matchesRouter.get('/', async (req, res) => {
    const { leagueId, tId } = req.params;
    const { matchdayId } = req.query;
    try {
        let query = admin_1.db.collection(`leagues/${leagueId}/tournaments/${tId}/matches`);
        if (matchdayId) {
            query = query.where('matchdayId', '==', matchdayId).orderBy('date', 'asc');
        }
        else {
            query = query.orderBy('date', 'asc');
        }
        const snap = await query.get();
        const matches = snap.docs.map((d) => ({ id: d.id, ...(0, serialization_1.serializeDoc)(d.data()) }));
        res.json(matches);
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});
// POST /api/leagues/:leagueId/tournaments/:tId/matches
exports.matchesRouter.post('/', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    var _a, _b;
    const parse = MatchSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    const { leagueId, tId } = req.params;
    const data = parse.data;
    try {
        const [homeSnap, awaySnap] = await Promise.all([
            admin_1.db.doc(`leagues/${leagueId}/teams/${data.homeTeamId}`).get(),
            admin_1.db.doc(`leagues/${leagueId}/teams/${data.awayTeamId}`).get(),
        ]);
        if (!homeSnap.exists || !awaySnap.exists) {
            res.status(400).json({ error: 'One or both teams not found' });
            return;
        }
        const homeTeam = homeSnap.data();
        const awayTeam = awaySnap.data();
        const now = admin_1.admin.firestore.FieldValue.serverTimestamp();
        const batch = admin_1.db.batch();
        const matchRef = admin_1.db.collection(`leagues/${leagueId}/tournaments/${tId}/matches`).doc();
        batch.set(matchRef, {
            matchdayId: data.matchdayId,
            matchdayNumber: data.matchdayNumber,
            homeTeamId: data.homeTeamId,
            homeTeamName: homeTeam.name,
            homeTeamLogo: (_a = homeTeam.logo) !== null && _a !== void 0 ? _a : null,
            awayTeamId: data.awayTeamId,
            awayTeamName: awayTeam.name,
            awayTeamLogo: (_b = awayTeam.logo) !== null && _b !== void 0 ? _b : null,
            homeScore: null,
            awayScore: null,
            date: (0, serialization_1.toTimestamp)(data.date),
            time: data.time,
            venue: data.venue,
            status: 'scheduled',
            createdAt: now,
            updatedAt: now,
        });
        const matchdayRef = admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}/matchdays/${data.matchdayId}`);
        batch.update(matchdayRef, {
            matchCount: admin_1.admin.firestore.FieldValue.increment(1),
        });
        await batch.commit();
        res.status(201).json({ id: matchRef.id });
    }
    catch (_c) {
        res.status(500).json({ error: 'Failed to create match' });
    }
});
// PATCH /api/leagues/:leagueId/tournaments/:tId/matches/scores-batch
// IMPORTANT: this must be declared BEFORE /:matchId/score
exports.matchesRouter.patch('/scores-batch', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const parse = ScoresBatchSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    const { leagueId, tId } = req.params;
    const { matchdayId, scores } = parse.data;
    try {
        const now = admin_1.admin.firestore.FieldValue.serverTimestamp();
        const batch = admin_1.db.batch();
        let newCompletedCount = 0;
        for (const score of scores) {
            const matchRef = admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}/matches/${score.matchId}`);
            const matchSnap = await matchRef.get();
            const wasCompleted = matchSnap.exists && matchSnap.data().status === 'completed';
            batch.update(matchRef, {
                homeScore: score.homeScore,
                awayScore: score.awayScore,
                status: 'completed',
                updatedAt: now,
            });
            if (!wasCompleted)
                newCompletedCount++;
        }
        if (newCompletedCount > 0) {
            const matchdayRef = admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}/matchdays/${matchdayId}`);
            batch.update(matchdayRef, {
                completedMatchCount: admin_1.admin.firestore.FieldValue.increment(newCompletedCount),
                updatedAt: now,
            });
        }
        await batch.commit();
        res.json({ updated: scores.length, newlyCompleted: newCompletedCount });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to update scores' });
    }
});
// PATCH /api/leagues/:leagueId/tournaments/:tId/matches/:matchId/score
exports.matchesRouter.patch('/:matchId/score', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const { leagueId, tId, matchId } = req.params;
    const parse = ScoreSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    try {
        await admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}/matches/${matchId}`).update({
            homeScore: parse.data.homeScore,
            awayScore: parse.data.awayScore,
            status: 'completed',
            updatedAt: admin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        res.json({ id: matchId });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to update score' });
    }
});
// DELETE /api/leagues/:leagueId/tournaments/:tId/matches/:matchId
exports.matchesRouter.delete('/:matchId', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const { leagueId, tId, matchId } = req.params;
    try {
        const matchSnap = await admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}/matches/${matchId}`).get();
        if (!matchSnap.exists) {
            res.status(404).json({ error: 'Match not found' });
            return;
        }
        const matchdayId = matchSnap.data().matchdayId;
        const batch = admin_1.db.batch();
        batch.delete(admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}/matches/${matchId}`));
        batch.update(admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}/matchdays/${matchdayId}`), {
            matchCount: admin_1.admin.firestore.FieldValue.increment(-1),
        });
        await batch.commit();
        res.status(204).send();
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to delete match' });
    }
});
//# sourceMappingURL=matches.router.js.map