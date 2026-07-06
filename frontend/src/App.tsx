import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import PlansModule from './pages/PlansModule';
import PocketModule from './pages/PocketModule';
import ProjectModule from './pages/ProjectModule';
import DisciplineModule from './pages/DisciplineModule';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProtectedLayout from './components/layout/ProtectedLayout';
import { useAuth } from './context/authcontext/useAuth';

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        {/* Protected Routes Group */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plans" element={<PlansModule />} />
            <Route path="/discipline" element={<DisciplineModule />} />
            <Route path="/pocket" element={user ? <PocketModule /> : null} />
            <Route 
              path="/project" 
              element={user ? <ProjectModule currentUser={user} /> : null} 
            />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
        
        {/* Optional fallback catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}