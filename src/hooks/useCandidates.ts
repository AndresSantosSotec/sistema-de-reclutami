import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { adminCandidateService, AdminCandidate } from '@/lib/adminCandidateService'
import { mapBackendCandidateToFrontend } from '@/lib/dataMappers'
import type { Candidate as FrontendCandidate } from '@/lib/types'

export function useCandidates() {
  const [candidates, setCandidates] = useState<FrontendCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar candidatos desde el backend
  const fetchCandidates = useCallback(async (filters?: {
    search?: string
    ubicacion?: string
    profesion?: string
  }) => {
    // Verificar token antes de hacer petición
    const token = localStorage.getItem('admin_token')
    if (!token) {
      console.log('⏳ [useCandidates] No hay token, esperando autenticación...')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 [useCandidates] Cargando candidatos...')
      const backendCandidates = await adminCandidateService.getAllCandidates(filters)
      console.log('✅ [useCandidates] Candidatos cargados:', backendCandidates.length)
      
      // Mapear a formato frontend
      const mappedCandidates = backendCandidates.map(mapBackendCandidateToFrontend)
      setCandidates(mappedCandidates)
    } catch (err: any) {
      console.error('❌ [useCandidates] Error:', err.message)
      if (err.response?.status !== 401) {
        const errorMessage = err.response?.data?.message || 'Error al cargar los candidatos'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Exportar candidatos
  const exportCandidates = useCallback(async (filters?: {
    search?: string
    ubicacion?: string
    profesion?: string
  }) => {
    try {
      toast.info('Generando archivo CSV...')
      
      const blob = await adminCandidateService.exportCandidates(filters)
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `candidatos_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Candidatos exportados correctamente')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al exportar candidatos'
      console.error('❌ [ERROR] Error al exportar:', err)
      toast.error(errorMessage)
    }
  }, [])

  // Cargar candidatos al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      fetchCandidates()
    } else {
      setLoading(false)
    }
  }, []) // Solo al montar

  return {
    candidates,
    loading,
    error,
    fetchCandidates,
    refetch: fetchCandidates, // Agregar alias para refetch
    exportCandidates,
  }
}
