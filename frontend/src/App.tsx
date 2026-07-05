import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import PlansModule from './pages/PlansModule';
import PocketModule from './pages/PocketModule';     // Create / import these pages
import ProjectModule from './pages/ProjectModule';   // Create / import these pages
// import Settings from './pages/Settings'; // Create / import these pages
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './context/authcontext/useAuth';

export default function App() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />

        {/* Protected Routes Group */}
        <Route element={<ProtectedRoute />}>
          <Route path="/plans" element={<PlansModule />} />
          <Route path="/pocket" element={user ? <PocketModule currentUser={user}/> : null} />
          
          {/* 3. Pass the required props down here safely! */}
          <Route 
            path="/project" 
            element={user ? <ProjectModule currentUser={user} onSignOut={signOut} /> : null} 
          />
        </Route>
        
        {/* Optional fallback catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}