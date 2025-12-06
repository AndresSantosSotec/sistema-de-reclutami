import axios from 'axios'

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

export interface JobCategory {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
  total_ofertas?: number
  created_at: string
  updated_at: string
}

export interface CreateCategoryData {
  nombre: string
  descripcion?: string
  activo?: boolean
}

export const categoryService = {
  /**
   * Obtener todas las categorías
   */
  async getAllCategories(): Promise<JobCategory[]> {
    const response = await axios.get(
      `${API_URL}/admin/categorias`,
      getAuthHeaders()
    )
    return response.data.data || response.data
  },

  /**
   * Crear nueva categoría
   */
  async createCategory(data: CreateCategoryData): Promise<JobCategory> {
    const response = await axios.post(
      `${API_URL}/admin/categorias`,
      data,
      getAuthHeaders()
    )
    return response.data.data || response.data
  },

  /**
   * Actualizar categoría
   */
  async updateCategory(categoryId: number, data: Partial<CreateCategoryData>): Promise<JobCategory> {
    const response = await axios.put(
      `${API_URL}/admin/categorias/${categoryId}`,
      data,
      getAuthHeaders()
    )
    return response.data.data || response.data
  },

  /**
   * Eliminar categoría
   */
  async deleteCategory(categoryId: number): Promise<void> {
    await axios.delete(
      `${API_URL}/admin/categorias/${categoryId}`,
      getAuthHeaders()
    )
  },
}
