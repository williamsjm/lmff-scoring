import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const propagateTeamChanges = onDocumentUpdated(
  'leagues/{leagueId}/teams/{teamId}',
  async (event) => {
    const { leagueId, teamId } = event.params;
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) return;

    const nameChanged = before.name !== after.name;
    const logoChanged = before.logo !== after.logo;

    if (!nameChanged && !logoChanged) return;

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
        const updates: Record<string, string> = {};
        if (nameChanged) updates.homeTeamName = after.name;
        if (logoChanged) updates.homeTeamLogo = after.logo;
        batch.update(matchDoc.ref, updates);
      }

      const awaySnap = await db
        .collection(matchesPath)
        .where('awayTeamId', '==', teamId)
        .get();

      for (const matchDoc of awaySnap.docs) {
        const updates: Record<string, string> = {};
        if (nameChanged) updates.awayTeamName = after.name;
        if (logoChanged) updates.awayTeamLogo = after.logo;
        batch.update(matchDoc.ref, updates);
      }

      const standingRef = db.doc(
        `leagues/${leagueId}/tournaments/${tournamentDoc.id}/standings/${teamId}`
      );
      const standingSnap = await standingRef.get();
      if (standingSnap.exists) {
        const updates: Record<string, string> = {};
        if (nameChanged) updates.teamName = after.name;
        if (logoChanged) updates.teamLogo = after.logo;
        batch.update(standingRef, updates);
      }
    }

    await batch.commit();
  }
);
