import { useState, useCallback } from 'react'
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
import type { 
  JobOffer, 
  Application, 
  Candidate, 
  Evaluation, 
  StatusChange, 
  Notification,
  CandidateStatus 
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
        type: 'automatic'
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
      sentAt: new Date().toISOString()
    }
    setNotifications(currentNotifications => [...(currentNotifications || []), newNotification])
  }, [setNotifications])

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" />
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
          />
        )}
        {currentView === 'notifications' && (
          <Notifications
            notifications={notifications || []}
            candidates={candidates || []}
            onSendNotification={handleSendNotification}
          />
        )}
      </Layout>
      <Toaster position="top-right" />
    </>
  )
}

export default App