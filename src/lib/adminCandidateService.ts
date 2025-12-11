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
    id: number
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
   * Obtener todos los candidatos con paginación
   */
  async getAllCandidates(filters?: {
    search?: string
    ubicacion?: string
    profesion?: string
    habilidad_id?: number
    fecha_desde?: string
    fecha_hasta?: string
    min_experiencia?: number
    page?: number
    per_page?: number
  }): Promise<{
    data: AdminCandidate[]
    total: number
    per_page: number
    current_page: number
    last_page: number
  }> {
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

      if (filters?.habilidad_id) {
        params.append('habilidad_id', filters.habilidad_id.toString())
      }

      if (filters?.fecha_desde) {
        params.append('fecha_desde', filters.fecha_desde)
      }

      if (filters?.fecha_hasta) {
        params.append('fecha_hasta', filters.fecha_hasta)
      }

      if (filters?.min_experiencia !== undefined && filters.min_experiencia > 0) {
        params.append('min_experiencia', filters.min_experiencia.toString())
      }

      if (filters?.page) {
        params.append('page', filters.page.toString())
      }

      if (filters?.per_page) {
        params.append('per_page', filters.per_page.toString())
      }

      const queryString = params.toString()
      const url = `${API_URL}/admin/candidates${queryString ? `?${queryString}` : ''}`
      
      // console.log('🌐 [API] GET /admin/candidates', filters)
      const response = await axios.get(url, getAuthHeaders())
      
      // console.log('📦 [API] Candidatos recibidos:', response.data.data.length, 'de', response.data.total)
      return {
        data: response.data.data,
        total: response.data.total || response.data.data.length,
        per_page: response.data.per_page || 50,
        current_page: response.data.current_page || 1,
        last_page: response.data.last_page || 1
      }
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
      // console.log('🌐 [API] GET /admin/candidates/' + id)
      const response = await axios.get(
        `${API_URL}/admin/candidates/${id}`,
        getAuthHeaders()
      )
      
      // console.log('📦 [API] Detalles del candidato recibidos:', response.data.data)
      return response.data.data
    } catch (error: any) {
      console.error('❌ [API ERROR]:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Exportar candidatos (CSV, Excel o PDF)
   */
  async exportCandidates(format: 'csv' | 'excel' | 'pdf', filters?: {
    search?: string
    ubicacion?: string
    profesion?: string
    habilidad_id?: number
    fecha_desde?: string
    fecha_hasta?: string
    min_experiencia?: number
  }): Promise<Blob> {
    try {
      const params = new URLSearchParams()
      params.append('format', format)
      
      if (filters?.search) {
        params.append('search', filters.search)
      }
      
      if (filters?.ubicacion) {
        params.append('ubicacion', filters.ubicacion)
      }
      
      if (filters?.profesion) {
        params.append('profesion', filters.profesion)
      }

      if (filters?.habilidad_id) {
        params.append('habilidad_id', filters.habilidad_id.toString())
      }

      if (filters?.fecha_desde) {
        params.append('fecha_desde', filters.fecha_desde)
      }

      if (filters?.fecha_hasta) {
        params.append('fecha_hasta', filters.fecha_hasta)
      }

      if (filters?.min_experiencia !== undefined && filters.min_experiencia > 0) {
        params.append('min_experiencia', filters.min_experiencia.toString())
      }

      const queryString = params.toString()
      const url = `${API_URL}/admin/candidates/export?${queryString}`
      
      // console.log('🌐 [API] GET /admin/candidates/export', format, url)
      const response = await axios.get(url, {
        ...getAuthHeaders(),
        responseType: format === 'pdf' ? 'text' : 'blob', // PDF es HTML, otros son binarios
        timeout: 120000 // 120 segundos para archivos grandes
      })
      
      // Para PDF, retornar el texto HTML directamente
      if (format === 'pdf') {
        // console.log('📦 [API] HTML generado correctamente para PDF')
        return new Blob([response.data], { type: 'text/html; charset=utf-8' })
      }
      
      // Verificar que la respuesta sea un blob válido para Excel/CSV
      if (!response.data || !(response.data instanceof Blob)) {
        throw new Error('La respuesta no es un archivo válido')
      }
      
      // console.log('📦 [API] Archivo generado correctamente:', format, 'Size:', response.data.size, 'bytes')
      return response.data
    } catch (error: any) {
      console.error('❌ [API ERROR] Error al exportar candidatos:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Analizar compatibilidad de candidato (SIN IA - solo matching de habilidades)
   */
  async analyzeCompatibility(candidateId: number, applicationId?: string, jobId?: number): Promise<{
    success: boolean
    data: {
      candidate_id: number
      application_id?: string
      job_id?: number
      skills: string[]
      experience: string[]
      matchScore: number
      strengths: string[]
      concerns: string[]
      recommendation: string
      matched_skills: string[]
      missing_skills: string[]
      total_required_skills: number
      matched_count: number
      analyzed_at: string
    }
  }> {
    try {
      const url = `${API_URL}/admin/candidates/${candidateId}/analyze`
      const response = await axios.post(url, {
        application_id: applicationId,
        job_id: jobId
      }, getAuthHeaders())

      return response.data
    } catch (error: any) {
      console.error('❌ [API ERROR] Error al analizar candidato:', error.response?.data || error.message)
      throw error
    }
  }
}
