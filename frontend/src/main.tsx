import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import App from './App'
import { ThemeProvider } from './context/themecontext/ThemeContext'
import { AuthProvider } from './context/authcontext/AuthContext'
import { ToastProvider } from './context/toastcontext/ToastContext'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <ThemeProvider>
        <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ToastProvider>
  </StrictMode>,
)
