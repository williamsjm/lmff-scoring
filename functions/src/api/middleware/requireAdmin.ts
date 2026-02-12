import { Request, Response, NextFunction } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const { role, leagueId } = req.user ?? {};

  if (role !== 'admin' && role !== 'super_admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  if (role === 'admin' && req.params.leagueId && leagueId !== req.params.leagueId) {
    res.status(403).json({ error: 'Not authorized for this league' });
    return;
  }

  next();
}
