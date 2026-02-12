"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserCreated = void 0;
const identity_1 = require("firebase-functions/v2/identity");
const admin_1 = require("../admin");
exports.onUserCreated = (0, identity_1.beforeUserCreated)(async (event) => {
    var _a;
    const user = event.data;
    await admin_1.db.doc(`users/${user.uid}`).set({
        email: user.email || '',
        displayName: user.displayName || ((_a = user.email) === null || _a === void 0 ? void 0 : _a.split('@')[0]) || '',
        role: 'player',
        leagueId: null,
        teamId: null,
        playerId: null,
        createdAt: admin_1.admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin_1.admin.firestore.FieldValue.serverTimestamp(),
    });
});
//# sourceMappingURL=onUserCreated.js.map