import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../common/Loading';

/**
 * ProtectedRoute Component
 *
 * Protects routes that require authentication.
 *
 * Logic:
 * 1. If loading auth state → show loading spinner
 * 2. If not authenticated → redirect to /login
 * 3. If authenticated but no wedding AND not on /wedding-setup → redirect to /wedding-setup
 * 4. If authenticated with wedding OR on /wedding-setup → render children (Outlet)
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, wedding } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <Loading />;
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but no wedding created yet
  // Allow access to /wedding-setup, but redirect other pages to setup
  if (!wedding && location.pathname !== '/wedding-setup') {
    return <Navigate to="/wedding-setup" replace />;
  }

  // Authenticated with wedding → allow access to all protected routes
  // Or on /wedding-setup page (creating wedding)
  return <Outlet />;
};

export default ProtectedRoute;
