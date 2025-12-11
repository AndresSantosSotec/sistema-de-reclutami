import axios from 'axios'
import type { TalentBankCandidate } from './types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token')
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }
}

export interface TalentBankEntry {
  id: number
  postulante: {
    id: number
    nombre: string
    correo: string
    telefono: string | null
    profesion: string | null
    ubicacion: string | null
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
  }
  notas: string | null
  habilidades_destacadas: string[] | null
  puestos_sugeridos: number[] | null
  prioridad: 'baja' | 'media' | 'alta'
  disponible: boolean
  puntuacion_evaluacion: number | null
  fecha_agregado: string
}

/**
 * Mapea TalentBankEntry del backend a TalentBankCandidate del frontend
 */
export function mapTalentBankEntryToCandidate(entry: TalentBankEntry): TalentBankCandidate | null {
  try {
    // Validar que existe el postulante
    if (!entry.postulante) {
      console.warn('⚠️ [talentBankService] Entry sin postulante:', entry.id)
      return null
    }

    const postulante = entry.postulante
    
    // Usar habilidades del postulante, o habilidades destacadas si no hay
    const skills = postulante.habilidades?.map((h: any) => {
      if (typeof h === 'string') return h
      return h.nombre || h
    }).filter(Boolean) || entry.habilidades_destacadas || []
    
    return {
      id: postulante.id.toString(),
      name: postulante.nombre || 'Sin nombre',
      email: postulante.correo || '',
      phone: postulante.telefono || '',
      avatar: postulante.foto_perfil || undefined,
      skills: Array.isArray(skills) ? skills : [],
      profileCompleteness: 0,
      addedToTalentBank: entry.fecha_agregado,
      notes: entry.notas || undefined,
      suggestedJobs: entry.puestos_sugeridos?.map(id => id.toString()) || [],
      matchingSkills: [],
      workExperience: [],
      education: [],
    }
  } catch (error) {
    console.error('❌ [talentBankService] Error al mapear entry:', entry, error)
    return null
  }
}

export const talentBankService = {
  /**
   * Obtener todos los candidatos del banco de talento con paginación
   */
  async getAll(filters?: {
    prioridad?: 'baja' | 'media' | 'alta'
    disponible?: boolean
    search?: string
    page?: number
    per_page?: number
  }): Promise<{
    data: TalentBankEntry[]
    total: number
    per_page: number
    current_page: number
    last_page: number
  }> {
    const params = new URLSearchParams()
    if (filters?.prioridad) params.append('prioridad', filters.prioridad)
    if (filters?.disponible !== undefined) params.append('disponible', String(filters.disponible))
    if (filters?.search) params.append('search', filters.search)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())

    // console.log('🔄 [talentBankService] Obteniendo banco de talento:', {
    //   url: `${API_URL}/admin/talent-bank`,
    //   params: params.toString(),
    //   filters
    // })

    const response = await axios.get(
      `${API_URL}/admin/talent-bank?${params.toString()}`,
      getAuthHeaders()
    )

    // console.log('✅ [talentBankService] Respuesta recibida:', {
    //   success: response.data.success,
    //   count: response.data.data?.length || 0,
    //   total: response.data.total,
    //   current_page: response.data.current_page,
    //   last_page: response.data.last_page
    // })

    return {
      data: response.data.data || [],
      total: response.data.total || 0,
      per_page: response.data.per_page || 50,
      current_page: response.data.current_page || 1,
      last_page: response.data.last_page || 1
    }
  },

  /**
   * Agregar candidato al banco de talento
   */
  async add(data: {
    id_postulante: number
    notas?: string
    habilidades_destacadas?: string[]
    prioridad?: 'baja' | 'media' | 'alta'
  }): Promise<TalentBankEntry> {
    const response = await axios.post(
      `${API_URL}/admin/talent-bank`,
      data,
      getAuthHeaders()
    )
    return response.data.data
  },

  /**
   * Actualizar información del candidato en banco de talento
   */
  async update(id: number, data: {
    notas?: string
    habilidades_destacadas?: string[]
    puestos_sugeridos?: number[]
    prioridad?: 'baja' | 'media' | 'alta'
    disponible?: boolean
    puntuacion_evaluacion?: number
  }): Promise<TalentBankEntry> {
    const response = await axios.put(
      `${API_URL}/admin/talent-bank/${id}`,
      data,
      getAuthHeaders()
    )
    return response.data.data
  },

  /**
   * Eliminar candidato del banco de talento
   */
  async remove(id: number): Promise<void> {
    await axios.delete(
      `${API_URL}/admin/talent-bank/${id}`,
      getAuthHeaders()
    )
  },

  /**
   * Verificar si un candidato está en el banco de talento
   */
  async checkCandidate(candidateId: number): Promise<boolean> {
    const response = await axios.get(
      `${API_URL}/admin/talent-bank/check/${candidateId}`,
      getAuthHeaders()
    )
    return response.data.en_banco_talento
  },

  /**
   * Sugerir candidatos del banco de talento para una oferta laboral
   * basado en coincidencia de habilidades
   */
  async suggestForJob(jobId: number): Promise<{
    data: Array<{
      id: number
      id_postulante: number
      nombre: string
      correo: string
      telefono: string | null
      profesion: string | null
      ubicacion: string | null
      foto_perfil: string | null
      notas: string | null
      prioridad: 'baja' | 'media' | 'alta'
      puntuacion_evaluacion: number | null
      habilidades: Array<{
        id: number
        nombre: string
        nivel: string | null
      }>
      educacion: Array<any>
      experiencia: Array<any>
      coincidencias: number
      porcentaje_match: number
      habilidades_coincidentes: Array<{
        id: number
        nombre: string
      }>
    }>
    total: number
    oferta: {
      id: number
      titulo: string
      total_habilidades: number
    }
  }> {
    const response = await axios.get(
      `${API_URL}/admin/talent-bank/suggest-for-job/${jobId}`,
      getAuthHeaders()
    )
    return response.data
  },

  /**
   * Sugerir una vacante específica a un candidato
   * Crea notificación interna y envía email
   */
  async suggestJobToCandidate(data: {
    postulante_id: number
    job_id: number
    notas?: string
    enviar_email?: boolean
  }): Promise<{
    suggestion_id: number
    notificacion_enviada: boolean
    email_enviado: boolean
  }> {
    const response = await axios.post(
      `${API_URL}/admin/talent-bank/suggest-job`,
      data,
      getAuthHeaders()
    )
    return response.data.data
  },

  /**
   * Obtener vacantes sugeridas a un candidato
   */
  async getSuggestedJobsForCandidate(postulanteId: number): Promise<Array<{
    id: number
    job: {
      id: number
      titulo: string
      empresa: string
      ubicacion: string
      tipo_empleo: string
    }
    notas: string | null
    estado: string
    sugerido_por: string | null
    notificacion_enviada: boolean
    email_enviado: boolean
    fecha: string
  }>> {
    const response = await axios.get(
      `${API_URL}/admin/talent-bank/suggested-jobs/${postulanteId}`,
      getAuthHeaders()
    )
    return response.data.data
  }
}
