import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

export const getStandingsByMatchday = onCall(async (request) => {
  const { leagueId, tournamentId, matchdayNumber } = request.data;

  if (!leagueId || !tournamentId || matchdayNumber === undefined) {
    throw new HttpsError('invalid-argument', 'Missing required parameters');
  }

  const tournamentSnap = await db
    .doc(`leagues/${leagueId}/tournaments/${tournamentId}`)
    .get();
  if (!tournamentSnap.exists) {
    throw new HttpsError('not-found', 'Tournament not found');
  }

  const tournament = tournamentSnap.data()!;
  const pointsWin = tournament.pointsWin ?? 3;
  const pointsDraw = tournament.pointsDraw ?? 1;
  const pointsLoss = tournament.pointsLoss ?? 0;
  const teamIds: string[] = tournament.teamIds || [];

  const matchesSnap = await db
    .collection(`leagues/${leagueId}/tournaments/${tournamentId}/matches`)
    .where('status', '==', 'completed')
    .where('matchdayNumber', '<=', matchdayNumber)
    .get();

  const teamsMap = new Map<string, { name: string; logo: string | null; color: string }>();
  for (const teamId of teamIds) {
    const teamSnap = await db.doc(`leagues/${leagueId}/teams/${teamId}`).get();
    if (teamSnap.exists) {
      const d = teamSnap.data()!;
      teamsMap.set(teamId, { name: d.name, logo: d.logo || null, color: d.color || '#000000' });
    }
  }

  const standings = new Map<string, {
    teamId: string; teamName: string; teamLogo: string | null; teamColor: string;
    played: number; won: number; drawn: number; lost: number;
    scoreFor: number; scoreAgainst: number; scoreDifference: number;
    points: number; rank: number;
  }>();

  for (const teamId of teamIds) {
    const team = teamsMap.get(teamId);
    if (team) {
      standings.set(teamId, {
        teamId, teamName: team.name, teamLogo: team.logo, teamColor: team.color,
        played: 0, won: 0, drawn: 0, lost: 0,
        scoreFor: 0, scoreAgainst: 0, scoreDifference: 0,
        points: 0, rank: 0,
      });
    }
  }

  for (const matchDoc of matchesSnap.docs) {
    const match = matchDoc.data();
    const home = standings.get(match.homeTeamId);
    const away = standings.get(match.awayTeamId);
    if (!home || !away) continue;

    home.played++; away.played++;
    home.scoreFor += match.homeScore;
    home.scoreAgainst += match.awayScore;
    away.scoreFor += match.awayScore;
    away.scoreAgainst += match.homeScore;

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

  return Array.from(standings.values())
    .map(s => ({ ...s, scoreDifference: s.scoreFor - s.scoreAgainst }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.scoreDifference !== a.scoreDifference) return b.scoreDifference - a.scoreDifference;
      return b.scoreFor - a.scoreFor;
    })
    .map((s, i) => ({ ...s, rank: i + 1 }));
});
