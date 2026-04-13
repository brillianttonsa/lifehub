'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import api from './api';

type User = {
  id: string;
  email: string;
  fullName: string;
};

type Workspace = {
  id: string;
  name: string;
  type: string;
  ownerUserId: string;
};

type WorkspaceMembership = {
  role: string;
  workspace: Workspace;
};

type AuthContextType = {
  user: User | null;
  workspaces: WorkspaceMembership[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  selectWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceMembership[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshWorkspaces = useCallback(async () => {
    try {
      const response = await api.getWorkspaces();
      if (response.success) {
        setWorkspaces(response.data);
        
        // Auto-select workspace if not already selected
        const savedWorkspaceId = api.getWorkspaceId();
        if (savedWorkspaceId) {
          const found = response.data.find(
            (m) => m.workspace.id === savedWorkspaceId
          );
          if (found) {
            setCurrentWorkspace(found.workspace);
          }
        } else if (response.data.length > 0) {
          const defaultWorkspace = response.data[0].workspace;
          api.setWorkspaceId(defaultWorkspace.id);
          setCurrentWorkspace(defaultWorkspace);
        }
      }
    } catch {
      // Failed to fetch workspaces
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (api.isAuthenticated()) {
        await refreshWorkspaces();
        // Set mock user data for demo
        setUser({ id: 'user-1', email: 'demo@lifehub.app', fullName: 'Demo User' });
      }
      setIsLoading(false);
    };

    initAuth();
  }, [refreshWorkspaces]);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.success) {
      setUser({ id: 'user-1', email, fullName: 'Demo User' });
      await refreshWorkspaces();
      router.push('/dashboard');
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    const response = await api.register(email, password, fullName);
    if (response.success) {
      // Auto login after registration
      await login(email, password);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setWorkspaces([]);
    setCurrentWorkspace(null);
    router.push('/login');
  };

  const selectWorkspace = (workspaceId: string) => {
    const found = workspaces.find((m) => m.workspace.id === workspaceId);
    if (found) {
      api.setWorkspaceId(workspaceId);
      setCurrentWorkspace(found.workspace);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        currentWorkspace,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        selectWorkspace,
        refreshWorkspaces,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
