import { useState, useEffect, useCallback } from 'react'
import { categoryService, type JobCategory as BackendJobCategory, type CreateCategoryData } from '@/lib/categoryService'
import { mapBackendCategoryToFrontend } from '@/lib/dataMappers'
import type { JobCategory as FrontendJobCategory } from '@/lib/types'

export function useCategories() {
  const [categories, setCategories] = useState<FrontendJobCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    // Verificar token antes de hacer petición
    const token = localStorage.getItem('admin_token')
    if (!token) {
      console.log('⏳ [useCategories] No hay token, esperando autenticación...')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      console.log('🔄 [useCategories] Cargando categorías...')
      const data = await categoryService.getAllCategories()
      const mappedCategories = data.map(mapBackendCategoryToFrontend)
      console.log('✅ [useCategories] Categorías cargadas:', mappedCategories.length)
      setCategories(mappedCategories)
    } catch (err: any) {
      console.error('❌ [useCategories] Error:', err.message)
      if (err.response?.status !== 401) {
        setError(err.message || 'Error al cargar categorías')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      fetchCategories()
    } else {
      setLoading(false)
    }
  }, []) // Solo al montar

  const createCategory = useCallback(async (data: CreateCategoryData) => {
    try {
      const newCategory = await categoryService.createCategory(data)
      const mapped = mapBackendCategoryToFrontend(newCategory)
      setCategories(prev => [mapped, ...prev])
      return mapped
    } catch (err: any) {
      console.error('Error al crear categoría:', err)
      throw err
    }
  }, [])

  const updateCategory = useCallback(async (categoryId: number, data: Partial<CreateCategoryData>) => {
    try {
      const updated = await categoryService.updateCategory(categoryId, data)
      const mapped = mapBackendCategoryToFrontend(updated)
      setCategories(prev => prev.map(cat => cat.id === categoryId.toString() ? mapped : cat))
      return mapped
    } catch (err: any) {
      console.error('Error al actualizar categoría:', err)
      throw err
    }
  }, [])

  const deleteCategory = useCallback(async (categoryId: number) => {
    try {
      await categoryService.deleteCategory(categoryId)
      setCategories(prev => prev.filter(cat => cat.id !== categoryId.toString()))
    } catch (err: any) {
      console.error('Error al eliminar categoría:', err)
      throw err
    }
  }, [])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
