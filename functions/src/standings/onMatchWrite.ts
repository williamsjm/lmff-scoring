import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { admin, db } from '../admin';

interface StandingData {
  teamId: string;
  teamName: string;
  teamLogo: string | null;
  teamColor: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  scoreFor: number;
  scoreAgainst: number;
  scoreDifference: number;
  points: number;
  rank: number;
  lastUpdated: admin.firestore.FieldValue;
}

export const recalculateStandings = onDocumentWritten(
  'leagues/{leagueId}/tournaments/{tournamentId}/matches/{matchId}',
  async (event) => {
    const { leagueId, tournamentId } = event.params;

    const tournamentSnap = await db
      .doc(`leagues/${leagueId}/tournaments/${tournamentId}`)
      .get();
    if (!tournamentSnap.exists) return;

    const tournament = tournamentSnap.data()!;
    const pointsWin = tournament.pointsWin ?? 3;
    const pointsDraw = tournament.pointsDraw ?? 1;
    const pointsLoss = tournament.pointsLoss ?? 0;

    const matchesSnap = await db
      .collection(`leagues/${leagueId}/tournaments/${tournamentId}/matches`)
      .where('status', '==', 'completed')
      .get();

    const teamIds: string[] = tournament.teamIds || [];
    const teamsMap = new Map<string, { name: string; logo: string | null; color: string }>();

    for (const teamId of teamIds) {
      const teamSnap = await db.doc(`leagues/${leagueId}/teams/${teamId}`).get();
      if (teamSnap.exists) {
        const teamData = teamSnap.data()!;
        teamsMap.set(teamId, {
          name: teamData.name,
          logo: teamData.logo || null,
          color: teamData.color || '#000000',
        });
      }
    }

    const standings = new Map<string, StandingData>();
    for (const teamId of teamIds) {
      const team = teamsMap.get(teamId);
      if (team) {
        standings.set(teamId, {
          teamId,
          teamName: team.name,
          teamLogo: team.logo,
          teamColor: team.color,
          played: 0, won: 0, drawn: 0, lost: 0,
          scoreFor: 0, scoreAgainst: 0, scoreDifference: 0,
          points: 0, rank: 0,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }

    for (const matchDoc of matchesSnap.docs) {
      const match = matchDoc.data();
      const home = standings.get(match.homeTeamId);
      const away = standings.get(match.awayTeamId);
      if (!home || !away) continue;

      home.played++; away.played++;
      home.scoreFor += match.homeScore as number;
      home.scoreAgainst += match.awayScore as number;
      away.scoreFor += match.awayScore as number;
      away.scoreAgainst += match.homeScore as number;

      if (match.homeScore > match.awayScore) {
        home.won++; home.points += pointsWin;
        away.lost++; away.points += pointsLoss;
      } else if (match.homeScore < match.awayScore) {
        away.won++; away.points += pointsWin;
        home.lost++; home.points += pointsLoss;
      } else {
        home.drawn++; away.drawn++;
        home.points += pointsDraw; away.points += pointsDraw;
      }
    }

    const sortedStandings = Array.from(standings.values())
      .map((s) => ({ ...s, scoreDifference: s.scoreFor - s.scoreAgainst }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.scoreDifference !== a.scoreDifference) return b.scoreDifference - a.scoreDifference;
        return b.scoreFor - a.scoreFor;
      });

    const batch = db.batch();
    const standingsRef = db.collection(
      `leagues/${leagueId}/tournaments/${tournamentId}/standings`
    );

    sortedStandings.forEach((standing, index) => {
      const docRef = standingsRef.doc(standing.teamId);
      batch.set(docRef, { ...standing, rank: index + 1 });
    });

    await batch.commit();
  }
);
