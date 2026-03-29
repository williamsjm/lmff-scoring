"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaguesRouter = void 0;
const express_1 = require("express");
const admin_1 = require("../../admin");
const serialization_1 = require("../utils/serialization");
exports.leaguesRouter = (0, express_1.Router)();
// GET /api/leagues
exports.leaguesRouter.get('/', async (_req, res) => {
    try {
        const snap = await admin_1.db.collection('leagues').orderBy('name', 'asc').get();
        const leagues = snap.docs.map((d) => ({ id: d.id, ...(0, serialization_1.serializeDoc)(d.data()) }));
        res.json(leagues);
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to fetch leagues' });
    }
});
//# sourceMappingURL=leagues.router.js.map