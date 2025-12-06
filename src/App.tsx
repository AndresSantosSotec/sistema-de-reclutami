import { useState, useCallback, useMemo, useEffect } from 'react'
import { Toaster } from 'sonner'
import { Login } from './components/Login'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { JobsPage } from './components/JobsPage'
import { Applications } from './components/Applications'
import { EvaluationsPanel } from './components/evaluations/EvaluationsPanel'
import { Candidates } from './components/Candidates'
import { Notifications } from './components/Notifications'
import { AdminUsers } from './components/AdminUsers'
import { CategoriesPage } from './components/CategoriesPage'
import { SkillsPage } from './components/SkillsPage'
import { TalentBank } from './components/TalentBank'
import { Metrics } from './components/Metrics'
import Gallery from './components/Gallery'
import UsersPage from './pages/UsersPage'
import { adminAuthService } from './lib/adminAuthService'
import { useTalentBank } from './hooks/useTalentBank'
import { useJobs } from './hooks/useJobs'
import { useApplications } from './hooks/useApplications'
import { useCandidates } from './hooks/useCandidates'
import { useCategories } from './hooks/useCategories'
import { mapTalentBankEntryToCandidate } from './lib/talentBankService'
import type { 
  JobOffer, 
  Application, 
  Candidate, 
  Evaluation, 
  StatusChange, 
  Notification,
  CandidateStatus,
  AdminUser,
  JobCategory,
  TalentBankCandidate,
  AIAnalysis,
  PsychometricTest
} from './lib/types'
import { toast } from 'sonner'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authChecked, setAuthChecked] = useState(false) // Nuevo: saber si ya se verificó auth
  const [currentView, setCurrentView] = useState('dashboard')
  const [currentUser, setCurrentUser] = useState<string>('')

  // Hooks reales conectados al backend
  const { jobs, loading: jobsLoading, createJob, updateJob, deleteJob, refetch: refetchJobs } = useJobs()
  const { applications, loading: applicationsLoading, fetchApplications: refetchApplications } = useApplications()
  const { candidates, loading: candidatesLoading, fetchCandidates: refetchCandidates } = useCandidates()
  const { categories, loading: categoriesLoading, createCategory, updateCategory, deleteCategory, refetch: refetchCategories } = useCategories()
  
  // Banco de Talento con backend real
  const { 
    talentBank: talentBankData, 
    loading: talentBankLoading,
    addToTalentBank: addToTalentBankAPI,
    updateTalentBank: updateTalentBankAPI,
    checkCandidate: checkCandidateAPI,
    refetch: refetchTalentBank
  } = useTalentBank()
  
  // Evaluaciones - Conectadas al backend
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [evaluationsLoading, setEvaluationsLoading] = useState(false)
  
  // Datos mock que aún no tienen backend
  const [statusChanges, setStatusChanges] = useState<StatusChange[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [aiAnalyses, setAiAnalyses] = useState<AIAnalysis[]>([])
  const [psychometricTests, setPsychometricTests] = useState<PsychometricTest[]>([])

  // Función para recargar evaluaciones
  const reloadEvaluations = useCallback(async () => {
    try {
      setEvaluationsLoading(true)
      const evalationService = (await import('@/lib/evalationService')).default
      const loadedEvaluations = await evalationService.getEvaluations()
      setEvaluations(loadedEvaluations)
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error)
    } finally {
      setEvaluationsLoading(false)
    }
  }, [])

  // Cargar evaluaciones al autenticarse
  useEffect(() => {
    if (isAuthenticated) {
      reloadEvaluations()
    }
  }, [isAuthenticated, reloadEvaluations])

  // Recargar banco de talento cuando se navega a esa vista
  useEffect(() => {
    if (currentView === 'talent-bank' && isAuthenticated) {
      console.log('📂 [App] Navegando a banco de talento, recargando datos...')
      refetchTalentBank()
    }
  }, [currentView, isAuthenticated, refetchTalentBank])

  const categoriesWithJobCount = useMemo(() => {
    return (categories || []).map(category => ({
      ...category,
      jobCount: (jobs || []).filter(job => job.categoryId === category.id).length
    }))
  }, [categories, jobs])

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = adminAuthService.getToken()
      const user = adminAuthService.getUser()
      
      if (token && user) {
        try {
          // Verificar que el token siga siendo válido
          await adminAuthService.me()
          setIsAuthenticated(true)
          setCurrentUser(user.email)
          console.log('🔑 [App] Autenticación verificada')
        } catch (error) {
          // Token inválido, limpiar autenticación
          console.log('❌ [App] Token inválido, limpiando auth')
          adminAuthService.clearAuth()
          setIsAuthenticated(false)
          setCurrentUser('')
        }
      }
      setAuthChecked(true) // Marcar que ya se verificó
    }
    
    checkAuth()
  }, [])

  // Recargar TODOS los datos cuando se autentica exitosamente
  useEffect(() => {
    if (isAuthenticated && authChecked) {
      console.log('🔄 [App] Autenticado, recargando todos los datos...')
      // Pequeño delay para asegurar que el token está listo
      setTimeout(() => {
        refetchJobs?.()
        refetchApplications?.()
        refetchCandidates?.()
        refetchCategories?.()
        refetchTalentBank?.()
      }, 100)
    }
  }, [isAuthenticated, authChecked])

  const handleLogin = useCallback((email: string, userId: string) => {
    setIsAuthenticated(true)
    setCurrentUser(email)
    // Los datos se recargarán automáticamente por el useEffect de arriba
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await adminAuthService.logout()
    } catch (error) {
      console.error('Error during logout:', error)
    }
    setIsAuthenticated(false)
    setCurrentUser('')
    setCurrentView('dashboard')
  }, [])

  const handleAddJob = useCallback(async (job: Omit<JobOffer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!job.categoryId) {
        toast.error('La categoría es requerida')
        return
      }
      
      await createJob({
        titulo: job.title,
        empresa: job.company,
        ubicacion: job.location,
        tipo_empleo: job.type,
        rango_salarial_min: job.salaryMin,
        rango_salarial_max: job.salaryMax,
        descripcion: job.description,
        requisitos: job.requirements || '',
        categoria_id: typeof job.categoryId === 'string' ? parseInt(job.categoryId) : job.categoryId,
        fecha_publicacion: new Date().toISOString(),
        fecha_limite: job.deadline || undefined,
        visibilidad: 'publica',
        estado: job.status === 'active' ? 'Activa' : job.status === 'closed' ? 'Cerrada' : 'Borrador',
      })
      toast.success('Oferta laboral creada exitosamente')
    } catch (error: any) {
      console.error('Error al crear oferta:', error)
      toast.error(error.message || 'Error al crear oferta laboral')
    }
  }, [createJob])

  const handleUpdateJob = useCallback(async (id: string, updates: Partial<JobOffer>) => {
    try {
      const jobId = typeof id === 'string' ? parseInt(id) : id
      const updateData: any = {}
      
      if (updates.title) updateData.titulo = updates.title
      if (updates.company) updateData.empresa = updates.company
      if (updates.location) updateData.ubicacion = updates.location
      if (updates.type) updateData.tipo_empleo = updates.type
      if (updates.salaryMin !== undefined) updateData.rango_salarial_min = updates.salaryMin
      if (updates.salaryMax !== undefined) updateData.rango_salarial_max = updates.salaryMax
      if (updates.description) updateData.descripcion = updates.description
      if (updates.requirements) updateData.requisitos = updates.requirements
      if (updates.categoryId) updateData.categoria_id = typeof updates.categoryId === 'string' ? parseInt(updates.categoryId) : updates.categoryId
      if (updates.deadline) updateData.fecha_limite = updates.deadline
      if (updates.status) {
        updateData.estado = updates.status === 'active' ? 'Activa' : updates.status === 'closed' ? 'Cerrada' : 'Borrador'
      }
      
      await updateJob(jobId, updateData)
      toast.success('Oferta laboral actualizada')
    } catch (error: any) {
      console.error('Error al actualizar oferta:', error)
      toast.error(error.message || 'Error al actualizar oferta')
    }
  }, [updateJob])

  const handleDeleteJob = useCallback(async (id: string) => {
    try {
      const jobId = typeof id === 'string' ? parseInt(id) : id
      await deleteJob(jobId)
      toast.success('Oferta laboral eliminada')
    } catch (error: any) {
      console.error('Error al eliminar oferta:', error)
      toast.error(error.message || 'Error al eliminar oferta')
    }
  }, [deleteJob])

  const handleStatusChange = useCallback((applicationId: string, newStatus: CandidateStatus) => {
    // TODO: Implementar actualización de estado con API real
    // Por ahora, solo mostrar toast
    toast.success(`Estado actualizado a: ${newStatus}`)
  }, [currentUser])

  const handleAddEvaluation = useCallback(async (evaluation: Omit<Evaluation, 'id' | 'createdAt'>) => {
    try {
      // Obtener el candidato para obtener su postulante_id
      const candidate = candidates.find(c => c.id === evaluation.candidateId)
      if (!candidate) {
        toast.error('Candidato no encontrado')
        return
      }

      // Obtener el postulante_id del candidato
      // El candidato.id ya debería ser el postulante_id en número
      const postulanteId = parseInt(candidate.id)
      
      if (isNaN(postulanteId)) {
        toast.error('ID de postulante inválido')
        return
      }

      // Los tipos ya se mapean en el servicio evalationService

      // Combinar fecha y hora en el formato correcto
      const fechaHora = evaluation.scheduledDate && evaluation.scheduledTime
        ? `${evaluation.scheduledDate}T${evaluation.scheduledTime}`
        : ''

      // Validar que tenemos los datos necesarios
      if (!evaluation.scheduledDate || !evaluation.scheduledTime) {
        toast.error('Debes seleccionar fecha y hora para la evaluación')
        return
      }

      // Importar el servicio de evaluaciones
      const evalationService = (await import('@/lib/evalationService')).default

      console.log('🔄 [App] Creando evaluación con datos:', {
        postulante_id: postulanteId,
        application_id: evaluation.applicationId,
        tipo: evaluation.type,
        modalidad: evaluation.mode,
        fecha: evaluation.scheduledDate,
        hora: evaluation.scheduledTime,
      })

      await evalationService.createEvaluation({
        postulante_id: postulanteId,
        aplicacion_id: evaluation.applicationId ? parseInt(evaluation.applicationId) : undefined,
        tipo_evaluacion: evaluation.type, // El servicio se encarga del mapeo
        modalidad: evaluation.mode || 'virtual', // El servicio se encarga del mapeo
        fecha: evaluation.scheduledDate || new Date().toISOString().split('T')[0],
        hora: evaluation.scheduledTime || '09:00',
        responsable: evaluation.interviewer,
        observaciones: evaluation.observations,
      })

      toast.success('Evaluación creada exitosamente. Se ha enviado una notificación por email al candidato.')
      
      // Recargar evaluaciones
      const updatedEvaluations = await evalationService.getEvaluations()
      setEvaluations(updatedEvaluations)
    } catch (error: any) {
      console.error('Error al crear evaluación:', error)
      toast.error(error.response?.data?.message || 'Error al crear la evaluación')
    }
  }, [candidates, setEvaluations])

  const handleUpdateEvaluation = useCallback(async (id: string, updates: Partial<Evaluation>) => {
    try {
      const evaluationId = parseInt(id)
      if (isNaN(evaluationId)) {
        toast.error('ID de evaluación inválido')
        return
      }

      const evalationService = (await import('@/lib/evalationService')).default
      
      const updateData: any = {}
      if (updates.result) updateData.resultado = updates.result
      if (updates.scheduledDate) updateData.fecha = updates.scheduledDate
      if (updates.scheduledTime) updateData.hora = updates.scheduledTime
      if (updates.interviewer) updateData.responsable = updates.interviewer
      if (updates.observations) updateData.observaciones = updates.observations

      await evalationService.updateEvaluation(evaluationId, updateData)
      
      toast.success('Evaluación actualizada exitosamente')
      
      // Recargar evaluaciones
      const updatedEvaluations = await evalationService.getEvaluations()
      setEvaluations(updatedEvaluations)
    } catch (error: any) {
      console.error('Error al actualizar evaluación:', error)
      toast.error(error.response?.data?.message || 'Error al actualizar la evaluación')
    }
  }, [setEvaluations])

  const handleSendNotification = useCallback((notification: Omit<Notification, 'id' | 'sentAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sentAt: new Date().toISOString(),
      read: false
    }
    setNotifications(currentNotifications => [...(currentNotifications || []), newNotification])
  }, [setNotifications])

  const handleAddAdminUser = useCallback((user: Omit<AdminUser, 'id' | 'createdAt'>) => {
    const newUser: AdminUser = {
      ...user,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    setAdminUsers(currentUsers => [...(currentUsers || []), newUser])
  }, [setAdminUsers])

  const handleUpdateAdminUser = useCallback((id: string, updates: Partial<AdminUser>) => {
    setAdminUsers(currentUsers =>
      (currentUsers || []).map(user =>
        user.id === id ? { ...user, ...updates } : user
      )
    )
  }, [setAdminUsers])

  const handleDeleteAdminUser = useCallback((id: string) => {
    setAdminUsers(currentUsers => (currentUsers || []).filter(user => user.id !== id))
  }, [setAdminUsers])

  const handleAddCategory = useCallback(async (category: Omit<JobCategory, 'id' | 'createdAt'>) => {
    try {
      await createCategory({
        nombre: category.name || category.nombre || '',
        descripcion: category.description || category.descripcion,
        activo: category.isActive ?? true,
      })
      toast.success('Categoría creada exitosamente')
    } catch (error: any) {
      console.error('Error al crear categoría:', error)
      toast.error(error.message || 'Error al crear categoría')
    }
  }, [createCategory])

  const handleUpdateCategory = useCallback(async (id: string, updates: Partial<JobCategory>) => {
    try {
      const categoryId = typeof id === 'string' ? parseInt(id) : id
      const updateData: any = {}
      
      if (updates.name) updateData.nombre = updates.name
      if (updates.nombre) updateData.nombre = updates.nombre
      if (updates.description) updateData.descripcion = updates.description
      if (updates.descripcion) updateData.descripcion = updates.descripcion
      if (updates.isActive !== undefined) updateData.activo = updates.isActive
      
      await updateCategory(categoryId, updateData)
      toast.success('Categoría actualizada')
    } catch (error: any) {
      console.error('Error al actualizar categoría:', error)
      toast.error(error.message || 'Error al actualizar categoría')
    }
  }, [updateCategory])

  const handleDeleteCategory = useCallback(async (id: string) => {
    try {
      const categoryId = typeof id === 'string' ? parseInt(id) : id
      await deleteCategory(categoryId)
      toast.success('Categoría eliminada')
    } catch (error: any) {
      console.error('Error al eliminar categoría:', error)
      toast.error(error.message || 'Error al eliminar categoría')
    }
  }, [deleteCategory])

  const handleAddToTalentBank = useCallback(async (candidateId: string) => {
    try {
      const candidateIdNum = parseInt(candidateId)
      
      // Verificar si ya existe
      const exists = await checkCandidateAPI(candidateIdNum)
      if (exists) {
        toast.error('Este candidato ya está en el Banco de Talento')
        return
      }

      // Agregar al banco de talento
      await addToTalentBankAPI({
        id_postulante: candidateIdNum,
        prioridad: 'media',
      })

      toast.success('Candidato agregado al Banco de Talento')
      refetchTalentBank() // Recargar lista
    } catch (error: any) {
      console.error('Error al agregar al banco de talento:', error)
      toast.error(error.response?.data?.message || 'Error al agregar candidato')
    }
  }, [addToTalentBankAPI, checkCandidateAPI, refetchTalentBank])

  const handleSuggestJob = useCallback(async (candidateId: string, jobId: string) => {
    try {
      // Encontrar el entry en banco de talento
      const entry = talentBankData?.find(e => e.postulante.id.toString() === candidateId)
      if (!entry) {
        toast.error('Candidato no encontrado en banco de talento')
        return
      }

      const jobIdNum = parseInt(jobId)
      const currentSuggestions = entry.puestos_sugeridos || []
      
      // Agregar nuevo puesto si no existe
      if (!currentSuggestions.includes(jobIdNum)) {
        await updateTalentBankAPI(entry.id, {
          puestos_sugeridos: [...currentSuggestions, jobIdNum]
        })
        
        toast.success('Candidato sugerido para la vacante')
        refetchTalentBank()
      } else {
        toast.info('Ya se había sugerido esta vacante')
      }
    } catch (error: any) {
      console.error('Error al sugerir candidato:', error)
      toast.error(error.response?.data?.message || 'Error al sugerir candidato')
    }
  }, [talentBankData, updateTalentBankAPI, refetchTalentBank])

  const handleUpdateTalentBankNotes = useCallback(async (candidateId: string, notes: string) => {
    try {
      // Encontrar el ID del registro en banco_talento (no el id_postulante)
      const entry = talentBankData?.find(e => e.postulante.id.toString() === candidateId)
      if (!entry) {
        toast.error('Candidato no encontrado en banco de talento')
        return
      }

      await updateTalentBankAPI(entry.id, { notas: notes })
      toast.success('Notas actualizadas')
      refetchTalentBank()
    } catch (error: any) {
      console.error('Error al actualizar notas:', error)
      toast.error(error.response?.data?.message || 'Error al actualizar notas')
    }
  }, [talentBankData, updateTalentBankAPI, refetchTalentBank])

  const handleAnalyzeCandidate = useCallback(async (candidateId: string, applicationId: string) => {
    const candidate = (candidates || []).find(c => c.id === candidateId)
    if (!candidate) return

    const cvText = `
      Nombre: ${candidate.name}
      Email: ${candidate.email}
      Habilidades: ${candidate.skills?.join(', ') || 'No especificadas'}
      Experiencia Laboral: ${candidate.workExperience?.map(exp => 
        `${exp.position} en ${exp.company} (${exp.startDate} - ${exp.current ? 'Presente' : exp.endDate})`
      ).join('; ') || 'No especificada'}
      Educación: ${candidate.education?.map(edu => 
        `${edu.degree} en ${edu.field} - ${edu.institution}`
      ).join('; ') || 'No especificada'}
    `

    const promptText = `
      Analiza el siguiente perfil de candidato y proporciona una evaluación detallada:
      
      ${cvText}
      
      Por favor proporciona:
      1. Lista de habilidades técnicas identificadas (máximo 8)
      2. Experiencias laborales más relevantes (máximo 5 puntos)
      3. Puntuación de compatibilidad del 0-100
      4. Fortalezas principales (máximo 5)
      5. Áreas de atención o debilidades (máximo 5)
      6. Recomendación final en una oración

      Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
      {
        "skills": ["habilidad1", "habilidad2"],
        "experience": ["experiencia1", "experiencia2"],
        "matchScore": 85,
        "strengths": ["fortaleza1", "fortaleza2"],
        "concerns": ["concern1", "concern2"],
        "recommendation": "texto de recomendación"
      }
    `

    try {
      const response = await window.spark.llm(promptText, 'gpt-4o', true)
      const analysis = JSON.parse(response)

      const aiAnalysis: AIAnalysis = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        candidateId,
        applicationId,
        cvText,
        skills: analysis.skills || [],
        experience: analysis.experience || [],
        matchScore: analysis.matchScore || 0,
        strengths: analysis.strengths || [],
        concerns: analysis.concerns || [],
        recommendation: analysis.recommendation || 'No se pudo generar recomendación',
        analyzedAt: new Date().toISOString()
      }

      setAiAnalyses(current => {
        const filtered = (current || []).filter(
          a => !(a.candidateId === candidateId && a.applicationId === applicationId)
        )
        return [...filtered, aiAnalysis]
      })
    } catch (error) {
      console.error('Error analyzing candidate:', error)
      throw error
    }
  }, [candidates, setAiAnalyses])

  const handleSendPsychometricTest = useCallback((test: Omit<PsychometricTest, 'id' | 'sentAt'>) => {
    const newTest: PsychometricTest = {
      ...test,
      id: `psy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sentAt: new Date().toISOString()
    }
    setPsychometricTests(current => [...(current || []), newTest])

    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      candidateId: test.candidateId,
      subject: 'Prueba Psicométrica Enviada',
      message: `Se te ha enviado una prueba psicométrica: ${test.testName}${test.externalUrl ? `. Accede aquí: ${test.externalUrl}` : ''}`,
      sentAt: new Date().toISOString(),
      sentBy: currentUser,
      type: 'manual',
      read: false
    }
    setNotifications(current => [...(current || []), notification])
  }, [setPsychometricTests, setNotifications, currentUser])

  const handleUpdatePsychometricTest = useCallback((testId: string, updates: Partial<PsychometricTest>) => {
    setPsychometricTests(current =>
      (current || []).map(test =>
        test.id === testId ? { ...test, ...updates } : test
      )
    )

    if (updates.status === 'completed') {
      const test = (psychometricTests || []).find(t => t.id === testId)
      if (test) {
        const notification: Notification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          candidateId: test.candidateId,
          subject: 'Prueba Psicométrica Completada',
          message: `Tu prueba psicométrica "${test.testName}" ha sido registrada como completada.`,
          sentAt: new Date().toISOString(),
          sentBy: 'Sistema Automático',
          type: 'automatic',
          read: false
        }
        setNotifications(current => [...(current || []), notification])
      }
    }
  }, [setPsychometricTests, psychometricTests, setNotifications])

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" richColors />
      </>
    )
  }

  return (
    <>
      <Layout
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
      >
        {currentView === 'dashboard' && (
          <Dashboard
            applications={applications || []}
            jobs={jobs || []}
            evaluations={evaluations || []}
          />
        )}
        {currentView === 'jobs' && (
          <JobsPage />
        )}
        {currentView === 'applications' && (
          <Applications />
        )}
        {currentView === 'evaluations' && (
          <EvaluationsPanel
            evaluations={evaluations || []}
            applications={applications || []}
            candidates={candidates || []}
            onAddEvaluation={handleAddEvaluation}
            onUpdateEvaluation={handleUpdateEvaluation}
            onRefresh={reloadEvaluations}
          />
        )}
        {currentView === 'candidates' && (
          <Candidates />
        )}
        {currentView === 'talent-bank' && (
          <>
            {talentBankLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando candidatos...</p>
                </div>
              </div>
            ) : (
              <TalentBank
                talentBankCandidates={
                  talentBankData?.map(mapTalentBankEntryToCandidate).filter((c): c is TalentBankCandidate => c !== null) || []
                }
                jobs={jobs || []}
                onSuggestJob={handleSuggestJob}
                onUpdateNotes={handleUpdateTalentBankNotes}
              />
            )}
          </>
        )}
        {currentView === 'notifications' && (
          <Notifications
            notifications={notifications || []}
            candidates={candidates || []}
            onSendNotification={handleSendNotification}
          />
        )}
        {currentView === 'categories' && (
          <CategoriesPage />
        )}
        {currentView === 'users' && (
          <UsersPage />
        )}
        {currentView === 'metrics' && (
          <Metrics
            applications={applications || []}
            jobs={jobs || []}
          />
        )}
        {currentView === 'gallery' && (
          <Gallery />
        )}
        {currentView === 'skills' && (
          <SkillsPage />
        )}
      </Layout>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App