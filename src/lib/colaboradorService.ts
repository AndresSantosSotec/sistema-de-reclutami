import api from './api';

// Tipos
export interface Colaborador {
  id: number;
  postulante_id: number;
  codigo_empleado: string | null;
  departamento: string | null;
  puesto_actual: string | null;
  fecha_ingreso: string | null;
  estado: 'activo' | 'inactivo' | 'suspendido';
  notas: string | null;
  created_at: string;
  updated_at: string;
  postulante: {
    id_postulante: number;
    nombre_completo: string;
    telefono: string | null;
    profesion: string | null;
    user: {
      id: number;
      email: string;
    } | null;
  };
  registrado_por: {
    id: number;
    name: string;
  } | null;
}

export interface PostulanteDisponible {
  id: number;
  nombre: string;
  email: string | null;
  telefono: string | null;
  profesion: string | null;
}

export interface ColaboradorFormData {
  postulante_id: number;
  codigo_empleado?: string;
  departamento?: string;
  puesto_actual?: string;
  fecha_ingreso?: string;
  estado?: 'activo' | 'inactivo' | 'suspendido';
  notas?: string;
}

export interface ColaboradoresResponse {
  success: boolean;
  data: Colaborador[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface EstadisticasColaboradores {
  total: number;
  activos: number;
  inactivos: number;
  suspendidos: number;
  por_departamento: { departamento: string; total: number }[];
}

// Servicio
class ColaboradorService {
  /**
   * Obtener lista de colaboradores con filtros y paginación
   */
  async getColaboradores(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    estado?: string;
    departamento?: string;
  }): Promise<ColaboradoresResponse> {
    const response = await api.get('/admin/colaboradores', { params });
    return response.data;
  }

  /**
   * Obtener postulantes disponibles (que no son colaboradores)
   */
  async getPostulantesDisponibles(search?: string): Promise<PostulanteDisponible[]> {
    const response = await api.get('/admin/colaboradores/postulantes-disponibles', {
      params: { search }
    });
    return response.data.data;
  }

  /**
   * Crear nuevo colaborador
   */
  async crearColaborador(data: ColaboradorFormData): Promise<Colaborador> {
    const response = await api.post('/admin/colaboradores', data);
    return response.data.data;
  }

  /**
   * Obtener un colaborador por ID
   */
  async getColaborador(id: number): Promise<Colaborador> {
    const response = await api.get(`/admin/colaboradores/${id}`);
    return response.data.data;
  }

  /**
   * Actualizar colaborador
   */
  async actualizarColaborador(id: number, data: Partial<ColaboradorFormData>): Promise<Colaborador> {
    const response = await api.put(`/admin/colaboradores/${id}`, data);
    return response.data.data;
  }

  /**
   * Eliminar colaborador
   */
  async eliminarColaborador(id: number): Promise<void> {
    await api.delete(`/admin/colaboradores/${id}`);
  }

  /**
   * Cambiar estado de colaborador
   */
  async cambiarEstado(id: number, estado: 'activo' | 'inactivo' | 'suspendido'): Promise<Colaborador> {
    const response = await api.put(`/admin/colaboradores/${id}/estado`, { estado });
    return response.data.data;
  }

  /**
   * Obtener lista de departamentos únicos
   */
  async getDepartamentos(): Promise<string[]> {
    const response = await api.get('/admin/colaboradores/departamentos');
    return response.data.data;
  }

  /**
   * Obtener estadísticas de colaboradores
   */
  async getEstadisticas(): Promise<EstadisticasColaboradores> {
    const response = await api.get('/admin/colaboradores/estadisticas');
    return response.data.data;
  }
}

export const colaboradorService = new ColaboradorService();
export default colaboradorService;

