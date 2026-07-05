import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/authcontext/useAuth'; // Adjust path

export default function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();

  console.log("🔒 Protected Route State:", { isAuthenticated, isBootstrapping });

  // 1. Prevent screen flickering/redirects while verifying the user session on startup
  if (isBootstrapping) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50">
        <div className="text-zinc-500 animate-pulse text-sm">Loading your session...</div>
      </div>
    );
  }

  // 2. If not authenticated, kick them back to the Home/Login screen
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 3. If authenticated, render the child route component
  return <Outlet />;
}