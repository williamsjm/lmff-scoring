"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUserRole = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../admin");
exports.setUserRole = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    if (!((_b = (_a = request.auth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.role) ||
        (request.auth.token.role !== 'admin' && request.auth.token.role !== 'super_admin')) {
        throw new https_1.HttpsError('permission-denied', 'Only admins can set user roles');
    }
    const { uid, role, leagueId } = request.data;
    if (!uid || !role) {
        throw new https_1.HttpsError('invalid-argument', 'uid and role are required');
    }
    const validRoles = ['admin', 'captain', 'player'];
    if (!validRoles.includes(role)) {
        throw new https_1.HttpsError('invalid-argument', `Invalid role: ${role}`);
    }
    await admin_1.admin.auth().setCustomUserClaims(uid, { role, leagueId: leagueId || null });
    await admin_1.admin.firestore().doc(`users/${uid}`).update({
        role,
        leagueId: leagueId || null,
        updatedAt: admin_1.admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
//# sourceMappingURL=setCustomClaims.js.map