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
  TalentBankCandidate
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
            onAddToTalentBank={handleAddToTalentBank}
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
      </Layout>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App