import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://oportunidadescoosanjer.com.gt/api/v1'

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token')
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }
}

export interface JobOffer {
  id: number
  titulo: string
  empresa: string
  ubicacion: string
  tipo_empleo: 'Tiempo Completo' | 'Medio Tiempo' | 'Freelance' | 'Prácticas' | 'Temporal'
  rango_salarial_min: number | null
  rango_salarial_max: number | null
  descripcion: string
  requisitos: string | null
  categoria_id?: number // Opcional porque puede venir en el objeto categoria
  fecha_publicacion: string
  fecha_limite: string | null
  visibilidad: 'publica' | 'privada' | 'Pública' | 'Privada'
  estado: 'Borrador' | 'Activa' | 'Cerrada' | 'Pausada' | 'En Revisión'
  total_postulantes: number
  categoria?: {
    id: number
    nombre: string
    descripcion?: string | null
  }
  imagenes?: Array<{
    id: number
    url_imagen?: string
    url?: string // El backend puede devolver 'url' en lugar de 'url_imagen'
    descripcion?: string | null
  }>
  habilidades?: Array<{
    id: number
    nombre: string
    categoria?: string | null
    nivel_requerido?: string
    es_obligatoria?: boolean
  }>
  created_at?: string
  updated_at?: string
  createdAt?: string // El backend puede devolver camelCase
  updatedAt?: string // El backend puede devolver camelCase
}

export interface CreateJobOfferData {
  titulo: string
  empresa: string
  ubicacion: string
  tipo_empleo: string
  rango_salarial_min?: number
  rango_salarial_max?: number
  descripcion: string
  requisitos: string
  categoria_id: number
  fecha_publicacion: string
  fecha_limite?: string
  visibilidad: 'publica' | 'privada'
  estado: string
  habilidades?: number[] // IDs de habilidades
}

export const adminJobService = {
  /**
   * Obtener todas las ofertas laborales
   */
  async getAllJobs(filters?: {
    estado?: string
    categoria_id?: number
    search?: string
  }): Promise<JobOffer[]> {
    const params = new URLSearchParams()
    if (filters?.estado) params.append('estado', filters.estado)
    if (filters?.categoria_id) params.append('categoria_id', String(filters.categoria_id))
    if (filters?.search) params.append('search', filters.search)

    const response = await axios.get(
      `${API_URL}/admin/ofertas?${params.toString()}`,
      getAuthHeaders()
    )
    return response.data.data || response.data
  },

  /**
   * Obtener detalle de una oferta laboral
   */
  async getJobDetail(jobId: number): Promise<JobOffer> {
    const response = await axios.get(
      `${API_URL}/admin/ofertas/${jobId}`,
      getAuthHeaders()
    )
    return response.data.data || response.data
  },

  /**
   * Crear nueva oferta laboral
   */
  async createJob(data: CreateJobOfferData): Promise<JobOffer> {
    const response = await axios.post(
      `${API_URL}/admin/ofertas`,
      data,
      getAuthHeaders()
    )
    return response.data.data || response.data
  },

  /**
   * Actualizar oferta laboral
   */
  async updateJob(jobId: number, data: Partial<CreateJobOfferData>): Promise<JobOffer> {
    const response = await axios.put(
      `${API_URL}/admin/ofertas/${jobId}`,
      data,
      getAuthHeaders()
    )
    return response.data.data || response.data
  },

  /**
   * Eliminar oferta laboral
   */
  async deleteJob(jobId: number): Promise<void> {
    await axios.delete(
      `${API_URL}/admin/ofertas/${jobId}`,
      getAuthHeaders()
    )
  },

  /**
   * Subir imagen para oferta laboral
   */
  async uploadImage(jobId: number, imageFile: File, descripcion?: string): Promise<any> {
    const formData = new FormData()
    formData.append('imagen', imageFile)
    if (descripcion) {
      formData.append('descripcion', descripcion)
    }

    const token = localStorage.getItem('admin_token')
    const response = await axios.post(
      `${API_URL}/admin/ofertas/${jobId}/imagenes`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      }
    )
    return response.data
  },

  /**
   * Eliminar imagen de oferta laboral
   */
  async deleteImage(jobId: number, imageId: number): Promise<void> {
    await axios.delete(
      `${API_URL}/admin/ofertas/${jobId}/imagenes/${imageId}`,
      getAuthHeaders()
    )
  },
}
