export interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  name: string
}

export type JobStatus = 'active' | 'closed' | 'draft'

export type JobVisibility = 'public' | 'internal'

export type ContractType = 'full-time' | 'part-time' | 'contract' | 'internship'

export interface JobOffer {
  id: string
  title: string
  description: string
  requirements: string
  location: string
  contractType: ContractType
  deadline: string
  visibility: JobVisibility
  status: JobStatus
  createdAt: string
  updatedAt: string
}

export type CandidateStatus = 
  | 'pending'
  | 'under-review'
  | 'interview-scheduled'
  | 'technical-test'
  | 'hired'
  | 'rejected'

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  linkedin?: string
  resumeUrl?: string
  appliedAt: string
  status: CandidateStatus
  currentJobId?: string
}

export interface Application {
  id: string
  candidateId: string
  jobId: string
  appliedAt: string
  status: CandidateStatus
  notes?: string
}

export type EvaluationType = 'interview' | 'technical-test' | 'other'

export type EvaluationMode = 'in-person' | 'virtual' | 'phone'

export interface Evaluation {
  id: string
  applicationId: string
  candidateId: string
  type: EvaluationType
  mode?: EvaluationMode
  scheduledDate?: string
  scheduledTime?: string
  interviewer?: string
  result?: string
  observations?: string
  createdAt: string
  completedAt?: string
}

export interface StatusChange {
  id: string
  candidateId: string
  applicationId: string
  fromStatus: CandidateStatus
  toStatus: CandidateStatus
  changedAt: string
  changedBy: string
  notes?: string
}

export interface Notification {
  id: string
  candidateId: string
  subject: string
  message: string
  sentAt: string
  sentBy: string
  type: 'automatic' | 'manual'
}

export interface DashboardMetrics {
  totalApplications: number
  activeJobs: number
  pendingInterviews: number
  candidatesHired: number
  applicationsByStatus: Record<CandidateStatus, number>
  recentApplications: number
}
