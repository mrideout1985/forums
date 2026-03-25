import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { AuthenticationApi } from '~/generated/apis/AuthenticationApi';
import type { AuthResponseModel } from '~/generated/models/AuthResponseModel';
import { createApiConfig } from '~/lib/apiConfig';

interface AuthUser {
  username: string;
  email: string;
  roles: string[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (response: AuthResponseModel) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toAuthUser(response: AuthResponseModel): AuthUser {
  return {
    username: response.username ?? '',
    email: response.email ?? '',
    roles: response.roles ? Array.from(response.roles) : [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const api = new AuthenticationApi(createApiConfig());
    api
      .getCurrentUser()
      .then((response) => setUser(toAuthUser(response)))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback((response: AuthResponseModel) => {
    setUser(toAuthUser(response));
  }, []);

  const signOut = useCallback(() => {
    const api = new AuthenticationApi(createApiConfig());
    api.logout().catch(() => undefined);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
