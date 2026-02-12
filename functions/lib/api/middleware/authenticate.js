"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const admin_1 = require("../../admin");
async function authenticate(req, res, next) {
    var _a, _b;
    const authHeader = req.headers.authorization;
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const decoded = await admin_1.admin.auth().verifyIdToken(token);
        req.user = {
            uid: decoded.uid,
            role: (_a = decoded.role) !== null && _a !== void 0 ? _a : null,
            leagueId: (_b = decoded.leagueId) !== null && _b !== void 0 ? _b : null,
        };
        next();
    }
    catch (_c) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
//# sourceMappingURL=authenticate.js.map