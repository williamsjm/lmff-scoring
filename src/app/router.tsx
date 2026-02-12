import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';

// Public pages (lazy loaded)
const HomePage = lazy(() => import('../pages/public/HomePage'));
const StandingsPage = lazy(() => import('../pages/public/StandingsPage'));
const ResultsPage = lazy(() => import('../pages/public/ResultsPage'));

// Admin pages (lazy loaded)
const LoginPage = lazy(() => import('../pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'));
const TeamsPage = lazy(() => import('../pages/admin/TeamsPage'));
const PlayersPage = lazy(() => import('../pages/admin/PlayersPage'));
const TournamentsPage = lazy(() => import('../pages/admin/TournamentsPage'));
const MatchdaysPage = lazy(() => import('../pages/admin/MatchdaysPage'));
const MatchResultsPage = lazy(() => import('../pages/admin/MatchResultsPage'));

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/standings" element={<StandingsPage />} />
          <Route path="/standings/:tournamentId" element={<StandingsPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/results/:tournamentId" element={<ResultsPage />} />
          <Route path="/results/:tournamentId/:matchdayId" element={<ResultsPage />} />
        </Route>

        {/* Admin login (no layout) */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin routes (protected) */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/tournaments" element={<TournamentsPage />} />
          <Route path="/admin/tournaments/:id/matchdays" element={<MatchdaysPage />} />
          <Route path="/admin/tournaments/:id/matchdays/:mdId/results" element={<MatchResultsPage />} />
          <Route path="/admin/teams" element={<TeamsPage />} />
          <Route path="/admin/players" element={<PlayersPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
