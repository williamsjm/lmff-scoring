"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const admin_1 = require("../../admin");
const authenticate_1 = require("../middleware/authenticate");
const requireAdmin_1 = require("../middleware/requireAdmin");
exports.usersRouter = (0, express_1.Router)();
const SetRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['admin', 'captain', 'player']),
    leagueId: zod_1.z.string().optional().nullable(),
});
// POST /api/users/:uid/role
exports.usersRouter.post('/:uid/role', authenticate_1.authenticate, requireAdmin_1.requireAdmin, async (req, res) => {
    const uid = req.params.uid;
    const parse = SetRoleSchema.safeParse(req.body);
    if (!parse.success) {
        res.status(400).json({ error: parse.error.flatten() });
        return;
    }
    const { role, leagueId } = parse.data;
    try {
        await admin_1.admin.auth().setCustomUserClaims(uid, { role, leagueId: leagueId !== null && leagueId !== void 0 ? leagueId : null });
        await admin_1.db.doc(`users/${uid}`).update({
            role,
            leagueId: leagueId !== null && leagueId !== void 0 ? leagueId : null,
            updatedAt: admin_1.admin.firestore.FieldValue.serverTimestamp(),
        });
        res.json({ success: true });
    }
    catch (_a) {
        res.status(500).json({ error: 'Failed to set user role' });
    }
});
//# sourceMappingURL=users.router.js.map