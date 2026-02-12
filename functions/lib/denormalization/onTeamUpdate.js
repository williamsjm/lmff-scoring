"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.propagateTeamChanges = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin_1 = require("../admin");
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
    const batch = admin_1.db.batch();
    if (nameChanged) {
        const playersSnap = await admin_1.db
            .collection(`leagues/${leagueId}/players`)
            .where('teamId', '==', teamId)
            .get();
        for (const playerDoc of playersSnap.docs) {
            batch.update(playerDoc.ref, { teamName: after.name });
        }
    }
    const tournamentsSnap = await admin_1.db
        .collection(`leagues/${leagueId}/tournaments`)
        .get();
    for (const tournamentDoc of tournamentsSnap.docs) {
        const matchesPath = `leagues/${leagueId}/tournaments/${tournamentDoc.id}/matches`;
        const homeSnap = await admin_1.db
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
        const awaySnap = await admin_1.db
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
        const standingRef = admin_1.db.doc(`leagues/${leagueId}/tournaments/${tournamentDoc.id}/standings/${teamId}`);
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