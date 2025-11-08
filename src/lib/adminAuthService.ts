import api from './api';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  user_type: 'admin';
  role?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  user_type: 'admin';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  expires_in?: number;
  user?: AdminUser;
}

class AdminAuthService {
  /**
   * Login de administrador
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Asegurarse de que el user_type sea 'admin'
      const loginData = { ...credentials, user_type: 'admin' };
      
      const response = await api.post<AuthResponse>('/auth/login', loginData);
      
      // Verificar que el usuario sea admin
      if (response.data.user && response.data.user.user_type !== 'admin') {
        throw new Error('Acceso denegado. Solo usuarios administrativos.');
      }
      
      if (response.data.token) {
        this.setToken(response.data.token);
      }
      
      if (response.data.user) {
        this.setUser(response.data.user);
      }
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Error al iniciar sesión');
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await api.post('/admin/auth/logout');
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Obtener usuario autenticado
   */
  async me(): Promise<AdminUser> {
    try {
      const response = await api.get<{ success: boolean; user: AdminUser }>('/admin/auth/me');
      
      if (response.data.user) {
        this.setUser(response.data.user);
      }
      
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener usuario');
    }
  }

  /**
   * Refrescar token
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await api.post<AuthResponse>('/admin/auth/refresh');
      
      if (response.data.token) {
        this.setToken(response.data.token);
        return response.data.token;
      }
      
      throw new Error('No se recibió token');
    } catch (error: any) {
      this.clearAuth();
      throw new Error(error.response?.data?.message || 'Error al refrescar token');
    }
  }

  /**
   * Guardar token en localStorage
   */
  setToken(token: string): void {
    localStorage.setItem('admin_token', token);
  }

  /**
   * Obtener token de localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  /**
   * Guardar usuario en localStorage
   */
  setUser(user: AdminUser): void {
    localStorage.setItem('admin_user', JSON.stringify(user));
  }

  /**
   * Obtener usuario de localStorage
   */
  getUser(): AdminUser | null {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Limpiar datos de autenticación
   */
  clearAuth(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }
}

export const adminAuthService = new AdminAuthService();
