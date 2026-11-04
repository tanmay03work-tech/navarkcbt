import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, role, user } = useAuth();
  const location = useLocation();

  // 1. Guard against unauthenticated visitors: redirect straight to /login
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname + location.search,
          message: 'Please sign in with your institution credentials to access this area.',
        }}
      />
    );
  }

  // 2. Guard against role mismatch: redirect to /unauthorized
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role as UserRole)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from: location.pathname,
          currentRole: role,
          requiredRoles: allowedRoles,
        }}
      />
    );
  }

  // 3. Authorized access granted
  return children ? <>{children}</> : <Outlet />;
};

