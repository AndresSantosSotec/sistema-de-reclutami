import { useState, useCallback, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Toaster } from 'sonner'
import { Login } from './components/Login'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { Jobs } from './components/Jobs'
import { Applications } from './components/Applications'
import { Evaluations } from './components/Evaluations'
import { Candidates } from './components/Candidates'
import { Notifications } from './components/Notifications'
import { AdminUsers } from './components/AdminUsers'
import { Categories } from './components/Categories'
import { TalentBank } from './components/TalentBank'
import { Metrics } from './components/Metrics'
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
  const [currentView, setCurrentView] = useState('dashboard')
  const [currentUser, setCurrentUser] = useState<string>('')

  const [jobs, setJobs] = useKV<JobOffer[]>('jobs', [])
  const [applications, setApplications] = useKV<Application[]>('applications', [])
  const [candidates, setCandidates] = useKV<Candidate[]>('candidates', [])
  const [evaluations, setEvaluations] = useKV<Evaluation[]>('evaluations', [])
  const [statusChanges, setStatusChanges] = useKV<StatusChange[]>('statusChanges', [])
  const [notifications, setNotifications] = useKV<Notification[]>('notifications', [])
  const [adminUsers, setAdminUsers] = useKV<AdminUser[]>('adminUsers', [])
  const [categories, setCategories] = useKV<JobCategory[]>('categories', [
    { id: 'cat-1', name: 'Desarrollo de Software', description: 'Posiciones relacionadas con programación y desarrollo', isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-2', name: 'Diseño', description: 'Diseño gráfico, UX/UI y diseño web', isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-3', name: 'Marketing', description: 'Marketing digital, contenido y estrategia', isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-4', name: 'Ventas', description: 'Posiciones comerciales y de ventas', isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-5', name: 'Recursos Humanos', description: 'Gestión de talento y recursos humanos', isActive: true, createdAt: new Date().toISOString() },
    { id: 'cat-6', name: 'Administración', description: 'Gestión administrativa y operativa', isActive: true, createdAt: new Date().toISOString() },
  ])
  const [talentBank, setTalentBank] = useKV<TalentBankCandidate[]>('talentBank', [])
  const [aiAnalyses, setAiAnalyses] = useKV<AIAnalysis[]>('aiAnalyses', [])
  const [psychometricTests, setPsychometricTests] = useKV<PsychometricTest[]>('psychometricTests', [])

  const categoriesWithJobCount = useMemo(() => {
    return (categories || []).map(category => ({
      ...category,
      jobCount: (jobs || []).filter(job => job.categoryId === category.id).length
    }))
  }, [categories, jobs])

  const handleLogin = useCallback((email: string) => {
    setIsAuthenticated(true)
    setCurrentUser(email)
  }, [])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    setCurrentUser('')
    setCurrentView('dashboard')
  }, [])

  const handleAddJob = useCallback((job: Omit<JobOffer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newJob: JobOffer = {
      ...job,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setJobs(currentJobs => [...(currentJobs || []), newJob])
  }, [setJobs])

  const handleUpdateJob = useCallback((id: string, updates: Partial<JobOffer>) => {
    setJobs(currentJobs =>
      (currentJobs || []).map(job =>
        job.id === id ? { ...job, ...updates, updatedAt: new Date().toISOString() } : job
      )
    )
  }, [setJobs])

  const handleDeleteJob = useCallback((id: string) => {
    setJobs(currentJobs => (currentJobs || []).filter(job => job.id !== id))
  }, [setJobs])

  const handleStatusChange = useCallback((applicationId: string, newStatus: CandidateStatus) => {
    setApplications(currentApplications => {
      const apps = currentApplications || []
      const app = apps.find(a => a.id === applicationId)
      if (!app) return apps

      const statusChange: StatusChange = {
        id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        candidateId: app.candidateId,
        applicationId: app.id,
        fromStatus: app.status,
        toStatus: newStatus,
        changedAt: new Date().toISOString(),
        changedBy: currentUser
      }

      setStatusChanges(currentChanges => [...(currentChanges || []), statusChange])

      const autoNotification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        candidateId: app.candidateId,
        subject: 'Actualización de tu postulación',
        message: `El estado de tu postulación ha cambiado a: ${newStatus}`,
        sentAt: new Date().toISOString(),
        sentBy: 'Sistema Automático',
        type: 'automatic',
        read: false
      }

      setNotifications(currentNotifications => [...(currentNotifications || []), autoNotification])

      return apps.map(a =>
        a.id === applicationId ? { ...a, status: newStatus } : a
      )
    })

    toast.success('Estado actualizado y notificación enviada al candidato')
  }, [currentUser, setApplications, setStatusChanges, setNotifications])

  const handleAddEvaluation = useCallback((evaluation: Omit<Evaluation, 'id' | 'createdAt'>) => {
    const newEvaluation: Evaluation = {
      ...evaluation,
      id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    setEvaluations(currentEvaluations => [...(currentEvaluations || []), newEvaluation])
  }, [setEvaluations])

  const handleUpdateEvaluation = useCallback((id: string, updates: Partial<Evaluation>) => {
    setEvaluations(currentEvaluations =>
      (currentEvaluations || []).map(evaluation =>
        evaluation.id === id ? { ...evaluation, ...updates } : evaluation
      )
    )
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

  const handleAddCategory = useCallback((category: Omit<JobCategory, 'id' | 'createdAt'>) => {
    const newCategory: JobCategory = {
      ...category,
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    setCategories(currentCategories => [...(currentCategories || []), newCategory])
  }, [setCategories])

  const handleUpdateCategory = useCallback((id: string, updates: Partial<JobCategory>) => {
    setCategories(currentCategories =>
      (currentCategories || []).map(category =>
        category.id === id ? { ...category, ...updates } : category
      )
    )
  }, [setCategories])

  const handleDeleteCategory = useCallback((id: string) => {
    setCategories(currentCategories => (currentCategories || []).filter(category => category.id !== id))
  }, [setCategories])

  const handleAddToTalentBank = useCallback((candidateId: string) => {
    const candidate = (candidates || []).find(c => c.id === candidateId)
    if (!candidate) return

    const talentCandidate: TalentBankCandidate = {
      ...candidate,
      addedToTalentBank: new Date().toISOString(),
      suggestedJobs: [],
      matchingSkills: []
    }

    setTalentBank(currentTalentBank => {
      const exists = (currentTalentBank || []).find(c => c.id === candidateId)
      if (exists) {
        toast.info('Este candidato ya está en el banco de talento')
        return currentTalentBank || []
      }
      toast.success('Candidato agregado al banco de talento')
      return [...(currentTalentBank || []), talentCandidate]
    })
  }, [candidates, setTalentBank])

  const handleSuggestJob = useCallback((candidateId: string, jobId: string) => {
    setTalentBank(currentTalentBank =>
      (currentTalentBank || []).map(candidate => {
        if (candidate.id === candidateId) {
          const suggestedJobs = candidate.suggestedJobs || []
          if (!suggestedJobs.includes(jobId)) {
            toast.success('Vacante sugerida al candidato')
            return { ...candidate, suggestedJobs: [...suggestedJobs, jobId] }
          }
        }
        return candidate
      })
    )
  }, [setTalentBank])

  const handleUpdateTalentBankNotes = useCallback((candidateId: string, notes: string) => {
    setTalentBank(currentTalentBank =>
      (currentTalentBank || []).map(candidate =>
        candidate.id === candidateId ? { ...candidate, notes } : candidate
      )
    )
    toast.success('Notas actualizadas')
  }, [setTalentBank])

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

    const prompt = spark.llmPrompt`
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
      const response = await spark.llm(prompt, 'gpt-4o', true)
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
          <Jobs
            jobs={jobs || []}
            categories={categoriesWithJobCount}
            onAddJob={handleAddJob}
            onUpdateJob={handleUpdateJob}
            onDeleteJob={handleDeleteJob}
          />
        )}
        {currentView === 'applications' && (
          <Applications
            applications={applications || []}
            candidates={candidates || []}
            jobs={jobs || []}
            onStatusChange={handleStatusChange}
          />
        )}
        {currentView === 'evaluations' && (
          <Evaluations
            evaluations={evaluations || []}
            applications={applications || []}
            candidates={candidates || []}
            onAddEvaluation={handleAddEvaluation}
            onUpdateEvaluation={handleUpdateEvaluation}
          />
        )}
        {currentView === 'candidates' && (
          <Candidates
            candidates={candidates || []}
            applications={applications || []}
            evaluations={evaluations || []}
            statusChanges={statusChanges || []}
            jobs={jobs || []}
            categories={categoriesWithJobCount}
            aiAnalyses={aiAnalyses || []}
            psychometricTests={psychometricTests || []}
            onAddToTalentBank={handleAddToTalentBank}
            onAnalyzeCandidate={handleAnalyzeCandidate}
            onSendPsychometricTest={handleSendPsychometricTest}
            onUpdatePsychometricTest={handleUpdatePsychometricTest}
          />
        )}
        {currentView === 'talent-bank' && (
          <TalentBank
            talentBankCandidates={talentBank || []}
            jobs={jobs || []}
            onSuggestJob={handleSuggestJob}
            onUpdateNotes={handleUpdateTalentBankNotes}
          />
        )}
        {currentView === 'notifications' && (
          <Notifications
            notifications={notifications || []}
            candidates={candidates || []}
            onSendNotification={handleSendNotification}
          />
        )}
        {currentView === 'categories' && (
          <Categories
            categories={categoriesWithJobCount}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}
        {currentView === 'users' && (
          <AdminUsers
            users={adminUsers || []}
            onAddUser={handleAddAdminUser}
            onUpdateUser={handleUpdateAdminUser}
            onDeleteUser={handleDeleteAdminUser}
          />
        )}
        {currentView === 'metrics' && (
          <Metrics
            applications={applications || []}
            jobs={jobs || []}
          />
        )}
      </Layout>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App