import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Users from '@/components/Users';
import userService, { AdminUser, CreateUserData, UpdateUserData } from '@/services/userService';

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al cargar usuarios';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (data: CreateUserData) => {
    try {
      await userService.createUser(data);
      toast.success('Usuario creado exitosamente');
      await loadUsers();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al crear usuario';
      toast.error(message);
      throw error;
    }
  };

  const handleUpdateUser = async (id: number, data: UpdateUserData) => {
    try {
      await userService.updateUser(id, data);
      toast.success('Usuario actualizado exitosamente');
      await loadUsers();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al actualizar usuario';
      toast.error(message);
      throw error;
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await userService.deleteUser(id);
      toast.success('Usuario eliminado correctamente');
      await loadUsers();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al eliminar usuario';
      toast.error(message);
      throw error;
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await userService.updateUser(id, { is_active: isActive });
      toast.success(isActive ? 'Usuario activado' : 'Usuario desactivado');
      await loadUsers();
    } catch (error: any) {
      const message = error.response?.data?.message || 'No tienes permisos para cambiar el estado de usuarios';
      toast.error(message);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Users
      users={users}
      onAddUser={handleAddUser}
      onUpdateUser={handleUpdateUser}
      onDeleteUser={handleDeleteUser}
      onToggleActive={handleToggleActive}
    />
  );
}
