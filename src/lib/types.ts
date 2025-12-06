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

export interface JobCategory {
  id: string
  nombre?: string
  name?: string
  descripcion?: string
  description?: string
  estado?: boolean
  isActive?: boolean
  jobCount?: number
  createdAt?: string
  updatedAt?: string
}

export type JobStatus = 'active' | 'closed' | 'draft' | 'filled'

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
  id: string;
  title: string;
  company: string;
  type: string;
  categoryId?: string;
  description: string;
  requirements: string;
  location: string;
  contractType: ContractType
  salaryMin?: number
  salaryMax?: number
  deadline: string
  visibility: JobVisibility
  status: JobStatus
  imageUrl?: string
  images?: Array<{ id: string; url: string; descripcion?: string }>
  skills?: Array<{ id: string; nombre: string; categoria?: string }>
  customQuestions?: CustomQuestion[]
  createdAt: string
  updatedAt?: string
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
  id:string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  current: boolean
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  linkedin?: string;
  portfolio?: string;
  resume?: string;
  avatar?: string;
  workExperience?: WorkExperience[]
  education?: Education[]
  skills?: string[]
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

export interface TalentBankCandidate extends Candidate {
  addedToTalentBank: string
  suggestedJobs?: string[]
  matchingSkills?: string[]
  notes?: string
  location?: string
  profession?: string
}

export type PermissionModule = 
  | 'dashboard'
  | 'jobs'
  | 'applications'
  | 'evaluations'
  | 'candidates'
  | 'notifications'
  | 'users'
  | 'categories'
  | 'talent-bank'

export interface RolePermissions {
  [key: string]: PermissionModule[]
}

export interface AdminUserWithPermissions extends AdminUser {
  permissions?: PermissionModule[]
}

export interface NotificationTemplate {
  id: string
  name: string
  subject: string
  message: string
  category: 'status-change' | 'interview' | 'general'
  createdAt: string
}

export interface InternalNote {
  id: string
  applicationId: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
}

export interface AIAnalysis {
  id: string
  candidateId: string
  applicationId: string
  cvText: string
  skills: string[]
  experience: string[]
  matchScore: number
  strengths: string[]
  concerns: string[]
  recommendation: string
  analyzedAt: string
}

export interface PsychometricTest {
  id: number
  postulante_id: number
  job_offer_id?: number
  test_link: string
  sent_at?: string
  completed_at?: string
  results_link?: string
  status: 'pending' | 'sent' | 'completed' | 'expired'
  created_at?: string
  updated_at?: string
  // Propiedades adicionales para UI
  job_offer?: {
    id: number
    titulo: string
    empresa: string
  }
}

export interface RecruitmentMetrics {
  totalApplications: number
  applicationsByMonth: { month: string; count: number }[]
  applicationsByStatus: { status: string; count: number }[]
  topJobs: { jobTitle: string; applicationCount: number }[]
  averageTimeToHire: number
  conversionRates: {
    pendingToInterview: number
    interviewToHired: number
  }
  trafficSources?: { source: string; count: number }[]
}

export interface ExportFilters {
  status?: CandidateStatus[]
  jobIds?: string[]
  dateFrom?: string
  dateTo?: string
  skills?: string[]
  minExperience?: number
  categories?: string[]
}
