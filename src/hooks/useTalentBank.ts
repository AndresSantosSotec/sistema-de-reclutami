import { useState, useEffect, useCallback, useRef } from 'react'
import { talentBankService, TalentBankEntry } from '@/lib/talentBankService'

interface UseTalentBankFilters {
  prioridad?: 'baja' | 'media' | 'alta'
  disponible?: boolean
  search?: string
}

export function useTalentBank(initialFilters?: UseTalentBankFilters) {
  const [talentBank, setTalentBank] = useState<TalentBankEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 50,
    current_page: 1,
    last_page: 1
  })
  const isLoadingRef = useRef(false)

  const fetchTalentBank = useCallback(async (filters?: UseTalentBankFilters & {
    page?: number
    per_page?: number
    search?: string
  }) => {
    // Evitar llamadas duplicadas
    if (isLoadingRef.current) {
      // console.log('⏳ [useTalentBank] Ya hay una carga en progreso, ignorando...')
      return
    }

    // Verificar que hay token antes de hacer la petición
    const token = localStorage.getItem('admin_token')
    if (!token) {
      // console.log('⏳ [useTalentBank] No hay token, esperando autenticación...')
      setLoading(false)
      setTalentBank([])
      return
    }

    isLoadingRef.current = true
    setLoading(true)
    setError(null)
    
    try {
      // console.log('🔄 [useTalentBank] Cargando banco de talento...', filters)
      const response = await talentBankService.getAll(filters)
      // console.log('✅ [useTalentBank] Datos recibidos:', response.data?.length || 0, 'de', response.total, 'candidatos')
      setTalentBank(response.data || [])
      setPagination({
        total: response.total,
        per_page: response.per_page,
        current_page: response.current_page,
        last_page: response.last_page
      })
    } catch (err: any) {
      console.error('❌ [useTalentBank] Error:', err.message)
      // Si es error de autenticación, limpiar datos
      if (err.response?.status === 401) {
        setTalentBank([])
      }
      setError(err.response?.data?.message || err.message || 'Error al cargar banco de talento')
    } finally {
      setLoading(false)
      isLoadingRef.current = false
    }
  }, [])

  // Cargar datos inicialmente solo si hay token
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      fetchTalentBank(initialFilters)
    } else {
      setLoading(false)
    }
  }, []) // Solo al montar

  const addToTalentBank = useCallback(async (data: {
    id_postulante: number
    notas?: string
    habilidades_destacadas?: string[]
    prioridad?: 'baja' | 'media' | 'alta'
  }) => {
    try {
      const newEntry = await talentBankService.add(data)
      setTalentBank(prev => [...prev, newEntry])
      return newEntry
    } catch (err: any) {
      console.error('Error al agregar al banco de talento:', err)
      throw err
    }
  }, [])

  const updateTalentBank = useCallback(async (id: number, data: {
    notas?: string
    habilidades_destacadas?: string[]
    puestos_sugeridos?: number[]
    prioridad?: 'baja' | 'media' | 'alta'
    disponible?: boolean
    puntuacion_evaluacion?: number
  }) => {
    try {
      const updated = await talentBankService.update(id, data)
      setTalentBank(prev => prev.map(entry => entry.id === id ? updated : entry))
      return updated
    } catch (err: any) {
      console.error('Error al actualizar banco de talento:', err)
      throw err
    }
  }, [])

  const removeFromTalentBank = useCallback(async (id: number) => {
    try {
      await talentBankService.remove(id)
      setTalentBank(prev => prev.filter(entry => entry.id !== id))
    } catch (err: any) {
      console.error('Error al eliminar del banco de talento:', err)
      throw err
    }
  }, [])

  const checkCandidate = useCallback(async (candidateId: number) => {
    try {
      return await talentBankService.checkCandidate(candidateId)
    } catch (err: any) {
      console.error('Error al verificar candidato:', err)
      return false
    }
  }, [])

  // Función de refetch que siempre recarga
  const refetch = useCallback(async (filters?: UseTalentBankFilters) => {
    // console.log('🔄 [useTalentBank] Refetch solicitado')
    await fetchTalentBank(filters)
  }, [fetchTalentBank])

  return {
    talentBank,
    loading,
    error,
    pagination,
    fetchTalentBank,
    refetch,
    addToTalentBank,
    updateTalentBank,
    removeFromTalentBank,
    checkCandidate,
  }
}
