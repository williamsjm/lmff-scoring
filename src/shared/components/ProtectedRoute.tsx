import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../features/auth/context/AuthContext';
import { ROUTES } from '../constants/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = true,
}) => {
  const { user, loading } = useAuthContext();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to={ROUTES.ADMIN_LOGIN} state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};
