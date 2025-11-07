export interface User {
  id: string
  email: string
  role: 'admin' | 'user'
  name: string
}

export type AdminRole = 'administrator' | 'recruiter' | 'evaluator'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminRole
  isActive: boolean
  createdAt: string
  lastLogin?: string
}

export type JobStatus = 'active' | 'closed' | 'draft'

export type JobVisibility = 'public' | 'internal'

export type ContractType = 'full-time' | 'part-time' | 'contract' | 'internship'

export type QuestionType = 'text' | 'multiple-choice' | 'numeric' | 'single-choice'

export interface QuestionOption {
  id: string
  text: string
}

export interface CustomQuestion {
  id: string
  text: string
  type: QuestionType
  options?: QuestionOption[]
  required: boolean
}

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
  imageUrl?: string
  customQuestions?: CustomQuestion[]
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

export interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate?: string
  current: boolean
  description: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  current: boolean
}

export interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  linkedin?: string
  resumeUrl?: string
  photoUrl?: string
  workExperience?: WorkExperience[]
  education?: Education[]
  skills?: string[]
  appliedAt: string
  status: CandidateStatus
  currentJobId?: string
  profileCompleteness?: number
}

export interface QuestionAnswer {
  questionId: string
  questionText: string
  answer: string | number | string[]
}

export interface Application {
  id: string
  candidateId: string
  jobId: string
  appliedAt: string
  status: CandidateStatus
  notes?: string
  customAnswers?: QuestionAnswer[]
}

export type EvaluationType = 'interview' | 'technical-test' | 'psychometric'

export type EvaluationMode = 'in-person' | 'virtual' | 'phone'

export interface EvaluationScore {
  technical?: number
  attitude?: number
  experience?: number
}

export interface Evaluation {
  id: string
  applicationId: string
  candidateId: string
  type: EvaluationType
  mode?: EvaluationMode
  scheduledDate?: string
  scheduledTime?: string
  interviewer?: string
  evaluatorId?: string
  result?: string
  score?: EvaluationScore
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
  read?: boolean
}

export interface DashboardMetrics {
  totalApplications: number
  activeJobs: number
  pendingInterviews: number
  candidatesHired: number
  applicationsByStatus: Record<CandidateStatus, number>
  recentApplications: number
}
