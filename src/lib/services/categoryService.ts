import api from '../api'

export interface JobCategory {
  id: string
  nombre: string
  descripcion?: string
  estado: boolean
  jobCount: number
  createdAt: string
  updatedAt?: string
}

export interface CreateCategoryData {
  nombre: string
  descripcion?: string
  estado?: boolean
}

export interface UpdateCategoryData {
  nombre?: string
  descripcion?: string
  estado?: boolean
}

/**
 * Listar todas las categorías (requiere auth admin)
 */
export const getCategories = async (activasOnly = false) => {
  const params = activasOnly ? { activas: 'true' } : {}
  const response = await api.get('/admin/categorias', { params })
  return response.data.data as JobCategory[]
}

/**
 * Crear nueva categoría (requiere auth admin)
 */
export const createCategory = async (data: CreateCategoryData) => {
  const response = await api.post('/admin/categorias', data)
  return response.data
}

/**
 * Actualizar categoría (requiere auth admin)
 */
export const updateCategory = async (id: string, data: UpdateCategoryData) => {
  const response = await api.put(`/admin/categorias/${id}`, data)
  return response.data
}

/**
 * Eliminar categoría (requiere auth admin)
 */
export const deleteCategory = async (id: string) => {
  const response = await api.delete(`/admin/categorias/${id}`)
  return response.data
}
