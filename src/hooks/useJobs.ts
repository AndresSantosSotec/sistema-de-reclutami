import { useState, useEffect, useCallback } from 'react'
import { adminJobService, type JobOffer as BackendJobOffer, type CreateJobOfferData } from '@/lib/adminJobService'
import { mapBackendJobToFrontend } from '@/lib/dataMappers'
import type { JobOffer as FrontendJobOffer } from '@/lib/types'

interface UseJobsFilters {
  estado?: string
  categoria_id?: number
  search?: string
}

export function useJobs(initialFilters?: UseJobsFilters) {
  const [jobs, setJobs] = useState<FrontendJobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobs = useCallback(async (filters?: UseJobsFilters) => {
    // Verificar token antes de hacer petición
    const token = localStorage.getItem('admin_token')
    if (!token) {
      // console.log('⏳ [useJobs] No hay token, esperando autenticación...')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // console.log('🔄 [useJobs] Cargando ofertas laborales...')
      const data = await adminJobService.getAllJobs(filters)
      // console.log('✅ [useJobs] Datos recibidos:', data?.length || 0, 'ofertas')
      
      if (data && Array.isArray(data) && data.length > 0) {
        const mappedJobs = data.map(mapBackendJobToFrontend)
        setJobs(mappedJobs)
      } else {
        setJobs([])
      }
    } catch (err: any) {
      console.error('❌ [useJobs] Error:', err.message)
      if (err.response?.status !== 401) {
        setError(err.message || 'Error al cargar ofertas laborales')
      }
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      fetchJobs(initialFilters)
    } else {
      setLoading(false)
    }
  }, []) // Solo al montar

  const createJob = useCallback(async (data: CreateJobOfferData) => {
    try {
      const newJob = await adminJobService.createJob(data)
      const mapped = mapBackendJobToFrontend(newJob)
      setJobs(prev => [mapped, ...prev])
      return mapped
    } catch (err: any) {
      console.error('Error al crear oferta laboral:', err)
      throw err
    }
  }, [])

  const updateJob = useCallback(async (jobId: number, data: Partial<CreateJobOfferData>) => {
    try {
      const updated = await adminJobService.updateJob(jobId, data)
      const mapped = mapBackendJobToFrontend(updated)
      setJobs(prev => prev.map(job => job.id === jobId.toString() ? mapped : job))
      return mapped
    } catch (err: any) {
      console.error('Error al actualizar oferta laboral:', err)
      throw err
    }
  }, [])

  const deleteJob = useCallback(async (jobId: number) => {
    try {
      await adminJobService.deleteJob(jobId)
      setJobs(prev => prev.filter(job => job.id !== jobId.toString()))
    } catch (err: any) {
      console.error('Error al eliminar oferta laboral:', err)
      throw err
    }
  }, [])

  const getJobDetail = useCallback(async (jobId: number) => {
    try {
      return await adminJobService.getJobDetail(jobId)
    } catch (err: any) {
      console.error('Error al obtener detalle de oferta:', err)
      throw err
    }
  }, [])

  const uploadJobImage = useCallback(async (jobId: number, imageFile: File, descripcion?: string) => {
    try {
      const result = await adminJobService.uploadImage(jobId, imageFile, descripcion)
      // Recargar el job para obtener la imagen actualizada
      await fetchJobs(initialFilters)
      return result
    } catch (err: any) {
      console.error('Error al subir imagen:', err)
      throw err
    }
  }, [fetchJobs, initialFilters])

  const deleteJobImage = useCallback(async (jobId: number, imageId: number) => {
    try {
      await adminJobService.deleteImage(jobId, imageId)
      // Recargar el job para reflejar la eliminación
      await fetchJobs(initialFilters)
    } catch (err: any) {
      console.error('Error al eliminar imagen:', err)
      throw err
    }
  }, [fetchJobs, initialFilters])

  return {
    jobs,
    loading,
    error,
    refetch: fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    getJobDetail,
    uploadJobImage,
    deleteJobImage,
  }
}
