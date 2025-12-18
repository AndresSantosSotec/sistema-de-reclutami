import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://oportunidadescoosanjer.com.gt/api/v1'
// Configurar axios con el token del admin
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token')
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }
}

export interface AdminApplication {
  id: number
  candidato: {
    id: number
    nombre: string
    email: string
    telefono: string | null
    foto_perfil: string | null
    profesion: string | null
    ubicacion: string | null
    linkedin: string | null
    portfolio: string | null
  }
  oferta: {
    id: number
    titulo: string
    empresa: string
    ubicacion: string
    tipo_empleo: string
  }
  cv: {
    id: number
    nombre_archivo: string
    url: string
    formato: string
    fecha_subida: string
  } | null
  estado: 'Postulado' | 'CV Visto' | 'En Proceso' | 'Finalista' | 'Contratado' | 'Rechazado'
  fecha_postulacion: string
  observaciones: string | null
}

export interface AdminApplicationDetail extends AdminApplication {
  candidato: AdminApplication['candidato'] & {
    bio: string | null
    educacion: Array<{
      institucion: string
      titulo: string
      nivel: string
      fecha_inicio: string
      fecha_fin: string | null
      en_curso: boolean
    }>
    experiencia: Array<{
      empresa: string
      puesto: string
      descripcion: string | null
      fecha_inicio: string
      fecha_fin: string | null
      actualmente_trabajando: boolean
    }>
    habilidades: Array<{
      nombre: string
      nivel: string
    }>
    referencias: Array<{
      nombre: string
      empresa: string | null
      puesto: string | null
      telefono: string | null
      email: string | null
    }>
  }
  oferta: AdminApplication['oferta'] & {
    descripcion: string
    salario_min: number | null
    salario_max: number | null
    categoria: string
    habilidades_requeridas: Array<{
      nombre: string
      nivel_requerido: string
      es_obligatoria: boolean
    }>
  }
}

export const adminApplicationService = {
  /**
   * Obtener todas las postulaciones
   */
  async getAllApplications(filters?: {
    estado?: string
    oferta_id?: number
  }): Promise<AdminApplication[]> {
    try {
      const params = new URLSearchParams()
      
      if (filters?.estado) {
        params.append('estado', filters.estado)
      }
      
      if (filters?.oferta_id) {
        params.append('oferta_id', filters.oferta_id.toString())
      }

      const queryString = params.toString()
      const url = `${API_URL}/admin/applications${queryString ? `?${queryString}` : ''}`
      
      const response = await axios.get(url, getAuthHeaders())
      
      return response.data.data
    } catch (error: any) {
      console.error('Error al obtener postulaciones:', error)
      throw error
    }
  },

  /**
   * Obtener detalles de una postulación específica
   */
  async getApplicationDetail(id: number): Promise<AdminApplicationDetail> {
    try {
      // console.log('🌐 [API] GET /admin/applications/' + id)
      const response = await axios.get(
        `${API_URL}/admin/applications/${id}`,
        getAuthHeaders()
      )
      
      // console.log('📦 [API] Respuesta:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('❌ [API ERROR]:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Actualizar estado de una postulación
   */
  async updateApplicationStatus(
    id: number,
    estado: AdminApplication['estado'],
    observaciones?: string
  ): Promise<void> {
    try {
      await axios.put(
        `${API_URL}/admin/applications/${id}/status`,
        { estado, observaciones },
        getAuthHeaders()
      )
    } catch (error: any) {
      console.error('Error al actualizar estado:', error)
      throw error
    }
  },

  /**
   * Eliminar una postulación
   */
  async deleteApplication(id: number): Promise<void> {
    try {
      await axios.delete(
        `${API_URL}/admin/applications/${id}`,
        getAuthHeaders()
      )
    } catch (error: any) {
      console.error('Error al eliminar postulación:', error)
      throw error
    }
  },

  /**
   * Mapear estados del backend a los del frontend
   */
  mapEstadoToStatus(estado: string): string {
    const mapping: Record<string, string> = {
      'Postulado': 'pending',
      'CV Visto': 'under-review',
      'En Proceso': 'interview-scheduled',
      'Finalista': 'technical-test',
      'Contratado': 'hired',
      'Rechazado': 'rejected'
    }
    
    return mapping[estado] || 'pending'
  },

  /**
   * Mapear estados del frontend a los del backend
   */
  mapStatusToEstado(status: string): AdminApplication['estado'] {
    const mapping: Record<string, AdminApplication['estado']> = {
      'pending': 'Postulado',
      'under-review': 'CV Visto',
      'interview-scheduled': 'En Proceso',
      'technical-test': 'Finalista',
      'hired': 'Contratado',
      'rejected': 'Rechazado'
    }
    
    return mapping[status] || 'Postulado'
  }
}
