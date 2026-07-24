import { Routes, Route } from 'react-router-dom';

import Website from './pages/website/Website';

import Signup from './pages/authentication/Signup';
import Login from './pages/authentication/Login';
import ForgotPassword from './pages/authentication/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';

function App() {
  return( 
  <>

    <Routes>
      <Route path="/" element={<Website />} />

      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>

  </>

);
}

export default App;