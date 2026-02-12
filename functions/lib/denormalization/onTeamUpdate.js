"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.propagateTeamChanges = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length)
    admin.initializeApp();
const db = admin.firestore();
exports.propagateTeamChanges = (0, firestore_1.onDocumentUpdated)('leagues/{leagueId}/teams/{teamId}', async (event) => {
    var _a, _b;
    const { leagueId, teamId } = event.params;
    const before = (_a = event.data) === null || _a === void 0 ? void 0 : _a.before.data();
    const after = (_b = event.data) === null || _b === void 0 ? void 0 : _b.after.data();
    if (!before || !after)
        return;
    const nameChanged = before.name !== after.name;
    const logoChanged = before.logo !== after.logo;
    if (!nameChanged && !logoChanged)
        return;
    const batch = db.batch();
    if (nameChanged) {
        const playersSnap = await db
            .collection(`leagues/${leagueId}/players`)
            .where('teamId', '==', teamId)
            .get();
        for (const playerDoc of playersSnap.docs) {
            batch.update(playerDoc.ref, { teamName: after.name });
        }
    }
    const tournamentsSnap = await db
        .collection(`leagues/${leagueId}/tournaments`)
        .get();
    for (const tournamentDoc of tournamentsSnap.docs) {
        const matchesPath = `leagues/${leagueId}/tournaments/${tournamentDoc.id}/matches`;
        const homeSnap = await db
            .collection(matchesPath)
            .where('homeTeamId', '==', teamId)
            .get();
        for (const matchDoc of homeSnap.docs) {
            const updates = {};
            if (nameChanged)
                updates.homeTeamName = after.name;
            if (logoChanged)
                updates.homeTeamLogo = after.logo;
            batch.update(matchDoc.ref, updates);
        }
        const awaySnap = await db
            .collection(matchesPath)
            .where('awayTeamId', '==', teamId)
            .get();
        for (const matchDoc of awaySnap.docs) {
            const updates = {};
            if (nameChanged)
                updates.awayTeamName = after.name;
            if (logoChanged)
                updates.awayTeamLogo = after.logo;
            batch.update(matchDoc.ref, updates);
        }
        const standingRef = db.doc(`leagues/${leagueId}/tournaments/${tournamentDoc.id}/standings/${teamId}`);
        const standingSnap = await standingRef.get();
        if (standingSnap.exists) {
            const updates = {};
            if (nameChanged)
                updates.teamName = after.name;
            if (logoChanged)
                updates.teamLogo = after.logo;
            batch.update(standingRef, updates);
        }
    }
    await batch.commit();
});
//# sourceMappingURL=onTeamUpdate.js.map