import type { JobOffer as BackendJobOffer } from '@/lib/adminJobService'
import type { JobOffer as FrontendJobOffer, JobCategory as FrontendJobCategory, JobStatus } from '@/lib/types'
import type { JobCategory as BackendJobCategory } from '@/lib/categoryService'
import type { AdminCandidate } from '@/lib/adminCandidateService'
import type { Candidate } from '@/lib/types'

/**
 * Mapea oferta laboral del backend al formato frontend
 */
export function mapBackendJobToFrontend(backendJob: BackendJobOffer): FrontendJobOffer {
  // Mapear estado
  let status: JobStatus = 'draft'
  if (backendJob.estado === 'Activa') status = 'active'
  else if (backendJob.estado === 'Cerrada') status = 'closed'
  else if (backendJob.estado === 'Pausada') status = 'draft'

  // Extraer categoria_id: puede venir directamente o dentro del objeto categoria
  const categoriaId = backendJob.categoria_id || backendJob.categoria?.id
  
  // Manejar fecha_limite: puede ser null, string vacío, o string con fecha
  const deadline = backendJob.fecha_limite || ''

  // Manejar visibilidad: convertir a formato frontend
  // JobVisibility es 'public' | 'internal'
  // El backend puede devolver 'Pública', 'Privada', 'publica', 'privada'
  let visibility: 'public' | 'internal' = 'public'
  const visibilidadLower = String(backendJob.visibilidad || '').toLowerCase()
  if (visibilidadLower === 'privada') {
    visibility = 'internal'
  }

  // Manejar imagenes: el backend puede devolver 'url' en lugar de 'url_imagen'
  const images = backendJob.imagenes?.map(img => ({
    id: img.id.toString(),
    url: (img as any).url || img.url_imagen,
    descripcion: img.descripcion || undefined,
  }))

  return {
    id: backendJob.id.toString(),
    title: backendJob.titulo,
    company: backendJob.empresa,
    location: backendJob.ubicacion,
    type: backendJob.tipo_empleo as any,
    salaryMin: backendJob.rango_salarial_min || undefined,
    salaryMax: backendJob.rango_salarial_max || undefined,
    description: backendJob.descripcion,
    requirements: backendJob.requisitos || '',
    categoryId: categoriaId ? categoriaId.toString() : '',
    status,
    visibility,
    deadline,
    contractType: 'full-time' as any,
    createdAt: backendJob.created_at || (backendJob as any).createdAt || new Date().toISOString(),
    updatedAt: backendJob.updated_at || (backendJob as any).updatedAt || new Date().toISOString(),
    skills: backendJob.habilidades?.map(h => ({
      id: h.id.toString(),
      nombre: h.nombre,
      categoria: h.categoria || undefined,
    })),
    images,
  }
}

/**
 * Mapea categoría del backend al formato frontend
 */
export function mapBackendCategoryToFrontend(backendCategory: BackendJobCategory): FrontendJobCategory {
  return {
    id: backendCategory.id.toString(),
    name: backendCategory.nombre,
    nombre: backendCategory.nombre,
    description: backendCategory.descripcion || undefined,
    descripcion: backendCategory.descripcion || undefined,
    isActive: backendCategory.activo,
    estado: backendCategory.activo,
    jobCount: backendCategory.total_ofertas || 0,
    createdAt: backendCategory.created_at,
    updatedAt: backendCategory.updated_at,
  }
}

/**
 * Mapea candidato del backend al formato frontend
 */
export function mapBackendCandidateToFrontend(backendCandidate: AdminCandidate): Candidate {
  return {
    id: backendCandidate.id.toString(),
    name: backendCandidate.nombre,
    email: backendCandidate.email,
    phone: backendCandidate.telefono || '',
    linkedin: backendCandidate.linkedin || undefined,
    portfolio: backendCandidate.portfolio || undefined,
    resume: undefined, // Los CVs se cargan en detalle
    avatar: backendCandidate.foto_perfil || undefined,
    workExperience: [], // Se carga en detalle
    education: [], // Se carga en detalle
    skills: backendCandidate.habilidades?.map(h => h.nombre) || [],
    profileCompleteness: 0, // Calcular si es necesario
  }
}
