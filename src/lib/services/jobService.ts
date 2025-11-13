import api from '../api'

export interface JobOffer {
  id: string
  titulo: string
  empresa: string
  ubicacion?: string
  tipo_empleo: string
  rango_salarial_min?: number
  rango_salarial_max?: number
  descripcion: string
  requisitos?: string
  categoria?: {
    id: string
    nombre: string
  }
  fecha_publicacion: string
  fecha_limite?: string
  visibilidad: string
  estado: string
  total_postulantes: number
  imagenes: Array<{
    id: string
    url: string
    descripcion?: string
  }>
  habilidades?: Array<{
    id: string
    nombre: string
    categoria?: string
    nivel_requerido?: string
    es_obligatoria?: boolean
  }>
  days_until_deadline?: number
  is_expired: boolean
  createdAt: string
  updatedAt?: string
}

export interface CreateJobOfferData {
  titulo: string
  empresa?: string
  ubicacion?: string
  tipo_empleo: string
  rango_salarial_min?: number
  rango_salarial_max?: number
  descripcion: string
  requisitos?: string
  categoria_id?: number
  fecha_limite?: string
  visibilidad: string
  estado: string
  habilidades_ids?: string[]
}

export interface UpdateJobOfferData {
  titulo?: string
  empresa?: string
  ubicacion?: string
  tipo_empleo?: string
  rango_salarial_min?: number
  rango_salarial_max?: number
  descripcion?: string
  requisitos?: string
  categoria_id?: number
  fecha_limite?: string
  visibilidad?: string
  estado?: string
  habilidades_ids?: string[]
}

/**
 * Listar todas las ofertas (admin)
 */
export const getJobOffers = async (filters?: {
  categoria_id?: string
  estado?: string
  tipo_empleo?: string
  visibilidad?: string
}) => {
  const response = await api.get('/admin/ofertas', { params: filters })
  return response.data.data as JobOffer[]
}

/**
 * Obtener una oferta específica (admin)
 */
export const getJobOffer = async (id: string) => {
  const response = await api.get(`/admin/ofertas/${id}`)
  return response.data.data as JobOffer
}

/**
 * Crear nueva oferta (requiere auth admin)
 */
export const createJobOffer = async (data: CreateJobOfferData) => {
  const response = await api.post('/admin/ofertas', data)
  return response.data
}

/**
 * Actualizar oferta (requiere auth admin)
 */
export const updateJobOffer = async (id: string, data: UpdateJobOfferData) => {
  const response = await api.put(`/admin/ofertas/${id}`, data)
  return response.data
}

/**
 * Eliminar oferta (requiere auth admin)
 */
export const deleteJobOffer = async (id: string) => {
  const response = await api.delete(`/admin/ofertas/${id}`)
  return response.data
}

/**
 * Subir imagen a oferta (requiere auth admin)
 */
export const uploadJobImage = async (offerId: string, file: File, descripcion?: string) => {
  const formData = new FormData()
  formData.append('imagen', file)
  if (descripcion) {
    formData.append('descripcion', descripcion)
  }

  const response = await api.post(`/admin/ofertas/${offerId}/imagenes`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

/**
 * Eliminar imagen de oferta (requiere auth admin)
 */
export const deleteJobImage = async (offerId: string, imageId: string) => {
  const response = await api.delete(`/admin/ofertas/${offerId}/imagenes/${imageId}`)
  return response.data
}
