import api from '../api'

export interface Skill {
  id: string
  nombre: string
  descripcion?: string
  categoria?: string
  nivel?: string
  activa: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateSkillData {
  nombre: string
  descripcion?: string
  categoria?: string
  nivel?: string
  activa?: boolean
}

export interface UpdateSkillData {
  nombre?: string
  descripcion?: string
  categoria?: string
  nivel?: string
  activa?: boolean
}

/**
 * Listar todas las habilidades
 */
export const getSkills = async (params?: {
  categoria?: string
  solo_activas?: boolean
}) => {
  const response = await api.get('/habilidades', { params })
  return response.data.data as Skill[]
}

/**
 * Crear nueva habilidad
 */
export const createSkill = async (data: CreateSkillData) => {
  const response = await api.post('/admin/habilidades', data)
  return response.data
}

/**
 * Actualizar habilidad
 */
export const updateSkill = async (id: string, data: UpdateSkillData) => {
  const response = await api.put(`/admin/habilidades/${id}`, data)
  return response.data
}

/**
 * Eliminar habilidad
 */
export const deleteSkill = async (id: string) => {
  const response = await api.delete(`/admin/habilidades/${id}`)
  return response.data
}

export const skillService = {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
}
