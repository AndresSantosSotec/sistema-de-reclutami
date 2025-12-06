import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

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

export interface AdminCandidate {
  id: number
  nombre: string
  email: string
  telefono: string | null
  fecha_nacimiento: string | null
  dpi: string | null
  direccion: string | null
  ubicacion: string | null
  profesion: string | null
  bio: string | null
  linkedin: string | null
  portfolio: string | null
  foto_perfil: string | null
  total_educaciones: number
  total_experiencias: number
  total_habilidades: number
  total_postulaciones: number
  habilidades?: Array<{
    id: number
    nombre: string
    nivel: string
  }>
  fecha_registro: string
}

export interface AdminCandidateDetail extends Omit<AdminCandidate, 'total_educaciones' | 'total_experiencias' | 'total_habilidades' | 'total_postulaciones'> {
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
  postulaciones: Array<{
    id: number
    oferta: {
      id: number
      titulo: string
      empresa: string
    }
    estado: string
    fecha_postulacion: string
  }>
  cvs: Array<{
    id: number
    nombre_archivo: string
    url: string
    fecha_subida: string
  }>
}

export const adminCandidateService = {
  /**
   * Obtener todos los candidatos
   */
  async getAllCandidates(filters?: {
    search?: string
    ubicacion?: string
    profesion?: string
  }): Promise<AdminCandidate[]> {
    try {
      const params = new URLSearchParams()
      
      if (filters?.search) {
        params.append('search', filters.search)
      }
      
      if (filters?.ubicacion) {
        params.append('ubicacion', filters.ubicacion)
      }
      
      if (filters?.profesion) {
        params.append('profesion', filters.profesion)
      }

      const queryString = params.toString()
      const url = `${API_URL}/admin/candidates${queryString ? `?${queryString}` : ''}`
      
      console.log('🌐 [API] GET /admin/candidates', filters)
      const response = await axios.get(url, getAuthHeaders())
      
      console.log('📦 [API] Candidatos recibidos:', response.data.data.length)
      return response.data.data
    } catch (error: any) {
      console.error('❌ [API ERROR] Error al obtener candidatos:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Obtener detalles completos de un candidato
   */
  async getCandidateDetail(id: number): Promise<AdminCandidateDetail> {
    try {
      console.log('🌐 [API] GET /admin/candidates/' + id)
      const response = await axios.get(
        `${API_URL}/admin/candidates/${id}`,
        getAuthHeaders()
      )
      
      console.log('📦 [API] Detalles del candidato recibidos:', response.data.data)
      return response.data.data
    } catch (error: any) {
      console.error('❌ [API ERROR]:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Exportar candidatos a CSV
   */
  async exportCandidates(filters?: {
    search?: string
    ubicacion?: string
    profesion?: string
  }): Promise<Blob> {
    try {
      const params = new URLSearchParams()
      
      if (filters?.search) {
        params.append('search', filters.search)
      }
      
      if (filters?.ubicacion) {
        params.append('ubicacion', filters.ubicacion)
      }
      
      if (filters?.profesion) {
        params.append('profesion', filters.profesion)
      }

      const queryString = params.toString()
      const url = `${API_URL}/admin/candidates/export${queryString ? `?${queryString}` : ''}`
      
      console.log('🌐 [API] GET /admin/candidates/export')
      const response = await axios.get(url, {
        ...getAuthHeaders(),
        responseType: 'blob'
      })
      
      console.log('📦 [API] CSV generado correctamente')
      return response.data
    } catch (error: any) {
      console.error('❌ [API ERROR] Error al exportar candidatos:', error.response?.data || error.message)
      throw error
    }
  }
}
