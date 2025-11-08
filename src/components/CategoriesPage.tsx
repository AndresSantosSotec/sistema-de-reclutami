import { useState, useEffect } from 'react'
import { Categories } from '@/components/Categories'
import { toast } from 'sonner'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/services/categoryService'
import type { JobCategory } from '@/lib/types'

export function CategoriesPage() {
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await getCategories()
      
      // Transformar al formato esperado por el componente
      const transformed = data.map(cat => ({
        id: cat.id,
        name: cat.nombre,
        nombre: cat.nombre,
        description: cat.descripcion,
        descripcion: cat.descripcion,
        isActive: cat.estado,
        estado: cat.estado,
        jobCount: cat.jobCount || 0,
        createdAt: cat.createdAt,
      }))
      
      setCategories(transformed)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      toast.error('Error al cargar las categorías')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (categoryData: Omit<JobCategory, 'id' | 'createdAt'>) => {
    try {
      await createCategory({
        nombre: categoryData.nombre || categoryData.name || '',
        descripcion: categoryData.descripcion || categoryData.description,
        estado: categoryData.estado ?? categoryData.isActive ?? true,
      })
      await loadCategories()
    } catch (error: any) {
      console.error('Error al crear categoría:', error)
      toast.error(error.response?.data?.message || 'Error al crear la categoría')
      throw error
    }
  }

  const handleUpdateCategory = async (id: string, updates: Partial<JobCategory>) => {
    try {
      await updateCategory(id, {
        nombre: updates.nombre || updates.name,
        descripcion: updates.descripcion || updates.description,
        estado: updates.estado ?? updates.isActive,
      })
      await loadCategories()
    } catch (error: any) {
      console.error('Error al actualizar categoría:', error)
      toast.error(error.response?.data?.message || 'Error al actualizar la categoría')
      throw error
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)
      await loadCategories()
    } catch (error: any) {
      console.error('Error al eliminar categoría:', error)
      toast.error(error.response?.data?.message || 'Error al eliminar la categoría')
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Categories
      categories={categories}
      onAddCategory={handleAddCategory}
      onUpdateCategory={handleUpdateCategory}
      onDeleteCategory={handleDeleteCategory}
    />
  )
}
