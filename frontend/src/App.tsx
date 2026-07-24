import { Routes, Route } from 'react-router-dom';

import Website from './pages/website/Website';
import Signup from './pages/authentication/Signup';
import Login from './pages/authentication/Login';
import ForgotPassword from './pages/authentication/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import PlansModule from './pages/dashboard/PlansModule';
import PocketModule from './pages/dashboard/PocketModule';
import ProjectModule from './pages/dashboard/ProjectModule';
import DisciplineModule from './pages/dashboard/DisciplineModule';
import Settings from './pages/dashboard/Settings';
import { DashboardPageShell } from './components/dashboard/DashboardPageShell';
import { useAuth } from './context/authcontext/useAuth';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Website />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<DashboardPageShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/plans" element={<PlansModule />} />
        <Route path="/pocket" element={<PocketModule />} />
        <Route path="/project" element={<ProjectModule currentUser={user ?? { id: '', fullName: 'LifeHub User', email: '' }} />} />
        <Route path="/discipline" element={<DisciplineModule />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;