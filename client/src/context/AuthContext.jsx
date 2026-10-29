import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './auth-context';
import { authService } from '../services/auth.service';
import { tokenStorage } from '../services/api';

const USER_STORAGE_KEY = 'datastraw_agent_user';

/**
 * Token Persistence Trade-off Documentation:
 * Storing JWT tokens in localStorage allows persistent authentication across page refreshes
 * and browser tabs without requiring complex HTTP-only cookie proxying in development.
 * Trade-off: Tokens stored in localStorage can be accessed by scripts running on the page,
 * making XSS mitigation critical. For production banking/enterprise environments, HTTP-only,
 * Secure, SameSite cookies with CSRF defense are recommended.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStorage.get());
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const logout = useCallback(() => {
    tokenStorage.remove();
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      // Storage unavailable
    }
    setToken(null);
    setUser(null);
  }, []);

  // Listen for 401 unauthorized events from the API client
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('datastraw:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('datastraw:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response?.token && response?.user) {
        tokenStorage.set(response.token);
        try {
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
        } catch {
          // Storage unavailable
        }
        setToken(response.token);
        setUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error(response?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.register({ name, email, password });
      return response;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
