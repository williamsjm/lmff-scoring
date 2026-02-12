"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStandingsByMatchday = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin_1 = require("../admin");
exports.getStandingsByMatchday = (0, https_1.onCall)(async (request) => {
    var _a, _b, _c;
    const { leagueId, tournamentId, matchdayNumber } = request.data;
    if (!leagueId || !tournamentId || matchdayNumber === undefined) {
        throw new https_1.HttpsError('invalid-argument', 'Missing required parameters');
    }
    const tournamentSnap = await admin_1.db
        .doc(`leagues/${leagueId}/tournaments/${tournamentId}`)
        .get();
    if (!tournamentSnap.exists) {
        throw new https_1.HttpsError('not-found', 'Tournament not found');
    }
    const tournament = tournamentSnap.data();
    const pointsWin = (_a = tournament.pointsWin) !== null && _a !== void 0 ? _a : 3;
    const pointsDraw = (_b = tournament.pointsDraw) !== null && _b !== void 0 ? _b : 1;
    const pointsLoss = (_c = tournament.pointsLoss) !== null && _c !== void 0 ? _c : 0;
    const teamIds = tournament.teamIds || [];
    const matchesSnap = await admin_1.db
        .collection(`leagues/${leagueId}/tournaments/${tournamentId}/matches`)
        .where('status', '==', 'completed')
        .where('matchdayNumber', '<=', matchdayNumber)
        .get();
    const teamsMap = new Map();
    for (const teamId of teamIds) {
        const teamSnap = await admin_1.db.doc(`leagues/${leagueId}/teams/${teamId}`).get();
        if (teamSnap.exists) {
            const d = teamSnap.data();
            teamsMap.set(teamId, { name: d.name, logo: d.logo || null, color: d.color || '#000000' });
        }
    }
    const standings = new Map();
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
        if (!home || !away)
            continue;
        home.played++;
        away.played++;
        home.scoreFor += match.homeScore;
        home.scoreAgainst += match.awayScore;
        away.scoreFor += match.awayScore;
        away.scoreAgainst += match.homeScore;
        if (match.homeScore > match.awayScore) {
            home.won++;
            home.points += pointsWin;
            away.lost++;
            away.points += pointsLoss;
        }
        else if (match.homeScore < match.awayScore) {
            away.won++;
            away.points += pointsWin;
            home.lost++;
            home.points += pointsLoss;
        }
        else {
            home.drawn++;
            away.drawn++;
            home.points += pointsDraw;
            away.points += pointsDraw;
        }
    }
    return Array.from(standings.values())
        .map(s => ({ ...s, scoreDifference: s.scoreFor - s.scoreAgainst }))
        .sort((a, b) => {
        if (b.points !== a.points)
            return b.points - a.points;
        if (b.scoreDifference !== a.scoreDifference)
            return b.scoreDifference - a.scoreDifference;
        return b.scoreFor - a.scoreFor;
    })
        .map((s, i) => ({ ...s, rank: i + 1 }));
});
//# sourceMappingURL=getStandingsByMatchday.js.map