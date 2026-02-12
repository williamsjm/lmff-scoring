"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
function requireAdmin(req, res, next) {
    var _a;
    const { role, leagueId } = (_a = req.user) !== null && _a !== void 0 ? _a : {};
    if (role !== 'admin' && role !== 'super_admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    if (role === 'admin' && req.params.leagueId && leagueId !== req.params.leagueId) {
        res.status(403).json({ error: 'Not authorized for this league' });
        return;
    }
    next();
}
//# sourceMappingURL=requireAdmin.js.map