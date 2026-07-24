import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import ProtectedLayout from '../layout/ProtectedLayout';

interface DashboardPageShellProps {
  children?: ReactNode;
}

export function DashboardPageShell({ children }: DashboardPageShellProps) {
  return (
    <ProtectedRoute>
      <ProtectedLayout>
        {children ?? <Outlet />}
      </ProtectedLayout>
    </ProtectedRoute>
  );
}
