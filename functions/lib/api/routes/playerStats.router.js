"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerStatsAggregateRouter = exports.playerStatsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const admin_1 = require("../../admin");
const authenticate_1 = require("../middleware/authenticate");
const requireAdmin_1 = require("../middleware/requireAdmin");
const serialization_1 = require("../utils/serialization");
// Match-scoped: /api/leagues/:leagueId/tournaments/:tId/matches/:matchId/player-stats
exports.playerStatsRouter = (0, express_1.Router)({ mergeParams: true });
// Tournament-scoped: /api/leagues/:leagueId/tournaments/:tId/player-stats/aggregate
exports.playerStatsAggregateRouter = (0, express_1.Router)({ mergeParams: true });
const StatFields = {
    passCompletions: zod_1.z.number().int().min(0).default(0),
    passIncomplete: zod_1.z.number().int().min(0).default(0),
    rushes: zod_1.z.number().int().min(0).default(0),
    tdPassing: zod_1.z.number().int().min(0).default(0),
    receptions: zod_1.z.number().int().min(0).default(0),
    tdReceiving: zod_1.z.number().int().min(0).default(0),
    flagPulls: zod_1.z.number().int().min(0).default(0),
    sacks: zod_1.z.number().int().min(0).default(0),
    interceptions: zod_1.z.number().int().min(0).default(0),
    passesBlocked: zod_1.z.number().int().min(0).default(0),
    tdDefensive: zod_1.z.number().int().min(0).default(0),
};
const PlayerStatSchema = zod_1.z.object({
    playerId: zod_1.z.string().min(1),
    ...StatFields,
});
const PlayerStatPatchSchema = zod_1.z.object(StatFields).partial();
// GET /api/leagues/:leagueId/tournaments/:tId/matches/:matchId/player-stats
exports.playerStatsRouter.get('/', async (req, res) => {
    const { leagueId, tId, matchId } = req.params;
    try {
        const snap = await admin_1.db
            .collection(`leagues/${leagueId}/tournaments/${tId}/matches/${matchId}/playerStats`)
            .orderBy('playerName', 'asc')
            .get();
        const stats = snap.docs.map((d) => ({ id: d.id, ...(0, serialization_1.serializeDoc)(d.data()) }));
        res.json(stats);
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to fetch player stats' });
    }
});
// POST /api/leagues/:leagueId/tournaments/:tId/matches/:matchId/player-stats
exports.playerStatsRouter.post('/', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const parse = PlayerStatSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    const { leagueId, tId, matchId } = req.params;
    const { playerId, ...statData } = parse.data;
    try {
        const playerSnap = await admin_1.db.doc(`leagues/${leagueId}/players/${playerId}`).get();
        if (!playerSnap.exists) {
            res.status(404).json({ error: 'Player not found' });
            return;
        }
        const player = playerSnap.data();
        const now = admin_1.admin.firestore.FieldValue.serverTimestamp();
        const docRef = await admin_1.db
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
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to create player stat' });
    }
});
// PATCH /api/leagues/:leagueId/tournaments/:tId/matches/:matchId/player-stats/:statId
exports.playerStatsRouter.patch('/:statId', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const parse = PlayerStatPatchSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    const { leagueId, tId, matchId, statId } = req.params;
    try {
        const ref = admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}/matches/${matchId}/playerStats/${statId}`);
        const snap = await ref.get();
        if (!snap.exists) {
            res.status(404).json({ error: 'Stat not found' });
            return;
        }
        await ref.update({
            ...parse.data,
            updatedAt: admin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        res.json({ id: statId });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to update player stat' });
    }
});
// DELETE /api/leagues/:leagueId/tournaments/:tId/matches/:matchId/player-stats/:statId
exports.playerStatsRouter.delete('/:statId', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const { leagueId, tId, matchId, statId } = req.params;
    try {
        const ref = admin_1.db.doc(`leagues/${leagueId}/tournaments/${tId}/matches/${matchId}/playerStats/${statId}`);
        const snap = await ref.get();
        if (!snap.exists) {
            res.status(404).json({ error: 'Stat not found' });
            return;
        }
        await ref.delete();
        res.status(204).send();
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to delete player stat' });
    }
});
// GET /api/leagues/:leagueId/tournaments/:tId/player-stats/aggregate
exports.playerStatsAggregateRouter.get('/', async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    const { leagueId, tId } = req.params;
    try {
        const matchesSnap = await admin_1.db
            .collection(`leagues/${leagueId}/tournaments/${tId}/matches`)
            .get();
        const allStatSnaps = await Promise.all(matchesSnap.docs.map((m) => admin_1.db.collection(`leagues/${leagueId}/tournaments/${tId}/matches/${m.id}/playerStats`).get()));
        const aggregated = new Map();
        for (const snap of allStatSnaps) {
            for (const doc of snap.docs) {
                const d = doc.data();
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
                const entry = aggregated.get(d.playerId);
                entry.passCompletions += (_a = d.passCompletions) !== null && _a !== void 0 ? _a : 0;
                entry.passIncomplete += (_b = d.passIncomplete) !== null && _b !== void 0 ? _b : 0;
                entry.rushes += (_c = d.rushes) !== null && _c !== void 0 ? _c : 0;
                entry.tdPassing += (_d = d.tdPassing) !== null && _d !== void 0 ? _d : 0;
                entry.receptions += (_e = d.receptions) !== null && _e !== void 0 ? _e : 0;
                entry.tdReceiving += (_f = d.tdReceiving) !== null && _f !== void 0 ? _f : 0;
                entry.flagPulls += (_g = d.flagPulls) !== null && _g !== void 0 ? _g : 0;
                entry.sacks += (_h = d.sacks) !== null && _h !== void 0 ? _h : 0;
                entry.interceptions += (_j = d.interceptions) !== null && _j !== void 0 ? _j : 0;
                entry.passesBlocked += (_k = d.passesBlocked) !== null && _k !== void 0 ? _k : 0;
                entry.tdDefensive += (_l = d.tdDefensive) !== null && _l !== void 0 ? _l : 0;
            }
        }
        const result = Array.from(aggregated.values()).sort((a, b) => {
            const totalA = a.tdPassing + a.tdReceiving + a.tdDefensive;
            const totalB = b.tdPassing + b.tdReceiving + b.tdDefensive;
            return totalB - totalA;
        });
        res.json(result);
    }
    catch (_m) {
        res.status(500).json({ error: 'Failed to aggregate player stats' });
    }
});
//# sourceMappingURL=playerStats.router.js.map