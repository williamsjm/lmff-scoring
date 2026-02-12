"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const teams_router_1 = require("./routes/teams.router");
const players_router_1 = require("./routes/players.router");
const tournaments_router_1 = require("./routes/tournaments.router");
const matchdays_router_1 = require("./routes/matchdays.router");
const matches_router_1 = require("./routes/matches.router");
const standings_router_1 = require("./routes/standings.router");
const users_router_1 = require("./routes/users.router");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: true }));
    app.use(express_1.default.json());
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok' });
    });
    app.use('/api/leagues/:leagueId/teams', teams_router_1.teamsRouter);
    app.use('/api/leagues/:leagueId/players', players_router_1.playersRouter);
    app.use('/api/leagues/:leagueId/tournaments', tournaments_router_1.tournamentsRouter);
    app.use('/api/leagues/:leagueId/tournaments/:tId/matchdays', matchdays_router_1.matchdaysRouter);
    app.use('/api/leagues/:leagueId/tournaments/:tId/matches', matches_router_1.matchesRouter);
    app.use('/api/leagues/:leagueId/tournaments/:tId/standings', standings_router_1.standingsRouter);
    app.use('/api/users', users_router_1.usersRouter);
    return app;
}
//# sourceMappingURL=app.js.map