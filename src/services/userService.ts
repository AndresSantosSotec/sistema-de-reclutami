import api from '@/lib/api';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'recruiter_admin' | 'viewer' | 'custom';
  phone?: string;
  is_active: boolean;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'recruiter_admin' | 'viewer' | 'custom';
  phone?: string;
  is_active?: boolean;
  permissions?: UserPermission[];
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'super_admin' | 'admin' | 'recruiter_admin' | 'viewer' | 'custom';
  phone?: string;
  is_active?: boolean;
  permissions?: UserPermission[];
}

export interface UserPermission {
  permission_key: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface Module {
  key: string;
  label: string;
  description: string;
  icon: string;
}

export interface RolePermissions {
  [role: string]: {
    all?: boolean;
    [view: string]: boolean | undefined;
  };
}

const userService = {
  // Listar usuarios
  async getUsers(filters?: { role?: string; is_active?: boolean }): Promise<AdminUser[]> {
    const response = await api.get('/admin/users', {
      params: filters,
    });
    return response.data.data;
  },

  // Crear usuario
  async createUser(data: CreateUserData): Promise<AdminUser> {
    const response = await api.post('/admin/users', data);
    return response.data.data;
  },

  // Actualizar usuario
  async updateUser(id: number, data: UpdateUserData): Promise<void> {
    await api.put(`/admin/users/${id}`, data);
  },

  // Eliminar usuario
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },

  // Obtener permisos por rol
  async getPermissions(): Promise<RolePermissions> {
    const response = await api.get('/admin/users/permissions');
    return response.data.data;
  },

  // Obtener módulos disponibles
  async getAvailableModules(): Promise<Module[]> {
    const response = await api.get('/admin/users/modules');
    return response.data.data;
  },

  // Obtener permisos de un usuario específico
  async getUserPermissions(userId: number): Promise<UserPermission[]> {
    const response = await api.get(`/admin/users/${userId}/permissions`);
    const permissionsObj = response.data.data;
    
    // Convertir objeto a array de permisos
    return Object.entries(permissionsObj).map(([key, value]: [string, any]) => ({
      permission_key: key,
      can_view: value.can_view || false,
      can_create: value.can_create || false,
      can_edit: value.can_edit || false,
      can_delete: value.can_delete || false,
    }));
  },

  // Actualizar permisos de un usuario
  async updateUserPermissions(userId: number, permissions: UserPermission[]): Promise<void> {
    await api.put(`/admin/users/${userId}/permissions`, { permissions });
  },

  // Copiar permisos de un usuario a otros
  async copyPermissions(fromUserId: number, toUserIds: number[]): Promise<void> {
    await api.post('/admin/users/copy-permissions', {
      from_user_id: fromUserId,
      to_user_ids: toUserIds,
    });
  },

  // Obtener usuarios que pueden servir como plantilla
  async getTemplateUsers(): Promise<Array<{id: number; name: string; email: string; permissions_count: number}>> {
    const response = await api.get('/admin/users/templates');
    return response.data.data;
  },
};

export default userService;

// Helper functions para usar directamente
export const getUserPermissions = (userId: number) => userService.getUserPermissions(userId);
export const getAvailableModules = () => userService.getAvailableModules();
export const updateUserPermissions = (userId: number, permissions: UserPermission[]) => 
  userService.updateUserPermissions(userId, permissions);
