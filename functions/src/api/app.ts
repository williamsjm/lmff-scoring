import express from 'express';
import cors from 'cors';
import { teamsRouter } from './routes/teams.router';
import { playersRouter } from './routes/players.router';
import { tournamentsRouter } from './routes/tournaments.router';
import { matchdaysRouter } from './routes/matchdays.router';
import { matchesRouter } from './routes/matches.router';
import { standingsRouter } from './routes/standings.router';
import { usersRouter } from './routes/users.router';

export function createApp(): express.Application {
  const app = express();

  app.use(cors({ origin: true }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/leagues/:leagueId/teams', teamsRouter);
  app.use('/api/leagues/:leagueId/players', playersRouter);
  app.use('/api/leagues/:leagueId/tournaments', tournamentsRouter);
  app.use('/api/leagues/:leagueId/tournaments/:tId/matchdays', matchdaysRouter);
  app.use('/api/leagues/:leagueId/tournaments/:tId/matches', matchesRouter);
  app.use('/api/leagues/:leagueId/tournaments/:tId/standings', standingsRouter);
  app.use('/api/users', usersRouter);

  return app;
}
