import { useState, useEffect, useCallback } from 'react';
import { adminAuthService, AdminUser, LoginCredentials } from '../lib/adminAuthService';

interface UseAdminAuthReturn {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: Omit<LoginCredentials, 'user_type'>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar usuario al montar el componente
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = adminAuthService.getToken();
        if (token) {
          const userData = await adminAuthService.me();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error al cargar usuario admin:', err);
        adminAuthService.clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (credentials: Omit<LoginCredentials, 'user_type'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await adminAuthService.login({
        ...credentials,
        user_type: 'admin',
      });
      if (response.user) {
        setUser(response.user);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await adminAuthService.logout();
      setUser(null);
    } catch (err: any) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const userData = await adminAuthService.me();
      setUser(userData);
    } catch (err: any) {
      setError(err.message);
      adminAuthService.clearAuth();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    clearError,
  };
}
