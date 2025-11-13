import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { adminApplicationService, AdminApplication } from '@/lib/adminApplicationService'
import type { Application, Candidate, JobOffer, CandidateStatus, JobStatus, ContractType, JobVisibility } from '@/lib/types'

// Hook para gestionar la lógica de las postulaciones del panel de admin
export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobs, setJobs] = useState<JobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Mapear datos del backend (AdminApplication) al formato del frontend (Application, Candidate, JobOffer)
  const mapBackendToFrontend = useCallback((backendApps: AdminApplication[]): {
    mappedApplications: Application[]
    mappedCandidates: Candidate[]
    mappedJobs: JobOffer[]
  } => {
    const mappedApplications: Application[] = []
    const mappedCandidates: Candidate[] = []
    const mappedJobs: JobOffer[] = []
    const candidateIds = new Set<number>()
    const jobIds = new Set<number>()

    backendApps.forEach((app) => {
      // 🔍 DEBUG: Validar datos de cada aplicación
      console.log('📋 [DEBUG] Procesando app:', {
        id: app.id,
        candidato_id: app.candidato?.id,
        oferta_id: app.oferta?.id,
        tiene_candidato: !!app.candidato,
        tiene_oferta: !!app.oferta
      })

      // ✅ Validar que existan candidato y oferta antes de mapear
      if (!app.candidato) {
        console.warn('⚠️ [WARNING] Aplicación sin candidato:', app.id)
        return
      }

      if (!app.oferta) {
        console.warn('⚠️ [WARNING] Aplicación sin oferta:', app.id)
        return
      }

      // Mapear la postulación
      mappedApplications.push({
        id: app.id.toString(),
        candidateId: app.candidato.id.toString(),
        jobId: app.oferta.id.toString(),
        status: adminApplicationService.mapEstadoToStatus(app.estado) as CandidateStatus,
        appliedAt: app.fecha_postulacion,
        notes: app.observaciones || undefined,
      })

      // Mapear el candidato (evitando duplicados)
      if (!candidateIds.has(app.candidato.id)) {
        candidateIds.add(app.candidato.id)
        mappedCandidates.push({
          id: app.candidato.id.toString(),
          name: app.candidato.nombre,
          email: app.candidato.email,
          phone: app.candidato.telefono || '',
          avatar: app.candidato.foto_perfil || undefined,
          linkedin: app.candidato.linkedin || undefined,
          portfolio: app.candidato.portfolio || undefined,
          resume: app.cv?.url || undefined,
        })
      }

      // Mapear la oferta de trabajo (evitando duplicados)
      if (!jobIds.has(app.oferta.id)) {
        jobIds.add(app.oferta.id)
        mappedJobs.push({
          id: app.oferta.id.toString(),
          title: app.oferta.titulo,
          company: app.oferta.empresa,
          location: app.oferta.ubicacion,
          type: app.oferta.tipo_empleo,
          description: '', // Se puede cargar después si se necesita
          requirements: '', // Se puede cargar después si se necesita
          deadline: '', // Se puede agregar si está disponible
          createdAt: new Date().toISOString(), // Valor por defecto
          status: 'active' as JobStatus, // Valor por defecto
          contractType: 'full-time' as ContractType, // Valor por defecto basado en tipo_empleo
          visibility: 'public' as JobVisibility, // Valor por defecto
        })
      }
    })

    console.log('✅ [DEBUG] Mapeo completado:', {
      aplicaciones: mappedApplications.length,
      candidatos: mappedCandidates.length,
      ofertas: mappedJobs.length
    })

    return { mappedApplications, mappedCandidates, mappedJobs }
  }, [])

  // Cargar postulaciones desde el backend
  const fetchApplications = useCallback(async (filters?: {
    estado?: string
    oferta_id?: number
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      const backendApps = await adminApplicationService.getAllApplications(filters)
      
      // 🔍 DEBUG: Ver qué devuelve el backend
      console.log('📋 [DEBUG] Respuesta del backend:', backendApps)
      console.log('📋 [DEBUG] Total de aplicaciones:', backendApps.length)
      
      if (backendApps.length > 0) {
        console.log('📋 [DEBUG] Primera aplicación:', backendApps[0])
      }
      
      const { mappedApplications, mappedCandidates, mappedJobs } = mapBackendToFrontend(backendApps)
      
      setApplications(mappedApplications)
      setCandidates(mappedCandidates)
      setJobs(mappedJobs)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cargar las postulaciones'
      console.error('❌ [ERROR] Error al cargar postulaciones:', err)
      console.error('❌ [ERROR] Detalles:', err.response?.data)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [mapBackendToFrontend])

  // Actualizar el estado de una postulación
  const updateApplicationStatus = useCallback(async (
    applicationId: string,
    newStatus: CandidateStatus,
    observaciones?: string
  ) => {
    try {
      // Convertir el ID a número para el backend
      const id = Number(applicationId)
      if (isNaN(id)) {
        throw new Error('ID de aplicación inválido')
      }

      const estado = adminApplicationService.mapStatusToEstado(newStatus)
      
      await adminApplicationService.updateApplicationStatus(id, estado, observaciones)
      
      // Actualizar el estado local para reflejar el cambio en la UI
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status: newStatus, notes: observaciones }
            : app
        )
      )
      
      toast.success('Estado de la postulación actualizado correctamente.')
      return true
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al actualizar el estado'
      console.error('Error al actualizar estado:', err)
      toast.error(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Cargar las postulaciones al montar el componente
  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  return {
    applications,
    candidates,
    jobs,
    loading,
    error,
    fetchApplications,
    updateApplicationStatus,
  }
}