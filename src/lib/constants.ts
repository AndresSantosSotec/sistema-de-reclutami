import { CandidateStatus, JobStatus, ContractType, EvaluationType, EvaluationMode, AdminRole } from './types'

export const statusLabels: Record<CandidateStatus, string> = {
  'pending': 'Postulado',
  'under-review': 'CV Visto',
  'interview-scheduled': 'En Proceso',
  'technical-test': 'Finalista',
  'hired': 'Contratado',
  'rejected': 'Rechazado'
}

export const statusColors: Record<CandidateStatus, string> = {
  'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'under-review': 'bg-blue-100 text-blue-800 border-blue-200',
  'interview-scheduled': 'bg-purple-100 text-purple-800 border-purple-200',
  'technical-test': 'bg-orange-100 text-orange-800 border-orange-200',
  'hired': 'bg-green-100 text-green-800 border-green-200',
  'rejected': 'bg-red-100 text-red-800 border-red-200'
}

export const jobStatusLabels: Record<JobStatus, string> = {
  'active': 'Activa',
  'closed': 'Cerrada',
  'draft': 'Borrador',
  'filled': 'Ocupada'
}

export const contractTypeLabels: Record<ContractType, string> = {
  'full-time': 'Tiempo Completo',
  'part-time': 'Medio Tiempo',
  'contract': 'Contrato',
  'internship': 'Pasantía'
}

export const evaluationTypeLabels: Record<EvaluationType, string> = {
  'interview': 'Entrevista',
  'technical-test': 'Prueba Técnica',
  'psychometric': 'Evaluación Psicométrica'
}

export const evaluationModeLabels: Record<EvaluationMode, string> = {
  'in-person': 'Presencial',
  'virtual': 'Virtual',
  'phone': 'Telefónica'
}

export const adminRoleLabels: Record<AdminRole, string> = {
  'administrator': 'Administrador',
  'recruiter': 'Reclutador',
  'evaluator': 'Evaluador'
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function isJobExpired(deadline: string): boolean {
  return new Date(deadline) < new Date()
}

export function daysUntilDeadline(deadline: string): number {
  const diff = new Date(deadline).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
