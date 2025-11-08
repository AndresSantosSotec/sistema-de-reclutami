import { useState, useEffect } from 'react'
import { Jobs } from '@/components/Jobs'
import { JobImageManager } from '@/components/JobImageManager'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getJobOffers, createJobOffer, updateJobOffer, deleteJobOffer, uploadJobImage } from '@/lib/services/jobService'
import { getCategories } from '@/lib/services/categoryService'
import type { JobOffer as BackendJobOffer } from '@/lib/services/jobService'
import type { JobCategory } from '@/lib/types'
import type { JobOffer, ContractType, JobVisibility, JobStatus } from '@/lib/types'

// Mapeo de tipos de empleo
const contractTypeMap: Record<string, ContractType> = {
  'Full Time': 'full-time',
  'Part Time': 'part-time',
  'Temporal': 'contract',
  'Freelance': 'contract',
  'Prácticas': 'internship',
}

const reverseContractTypeMap: Record<ContractType, string> = {
  'full-time': 'Full Time',
  'part-time': 'Part Time',
  'contract': 'Temporal',
  'internship': 'Prácticas',
}

const statusMap: Record<string, JobStatus> = {
  'Activa': 'active',
  'Cerrada': 'closed',
  'En Revisión': 'draft',
}

const reverseStatusMap: Record<JobStatus, string> = {
  'active': 'Activa',
  'closed': 'Cerrada',
  'draft': 'En Revisión',
  'filled': 'Cerrada',
}

const visibilityMap: Record<string, JobVisibility> = {
  'Pública': 'public',
  'Privada': 'internal',
}

const reverseVisibilityMap: Record<JobVisibility, string> = {
  'public': 'Pública',
  'internal': 'Privada',
}

export function JobsPage() {
  const [jobs, setJobs] = useState<JobOffer[]>([])
  const [categories, setCategories] = useState<JobCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJobForImages, setSelectedJobForImages] = useState<BackendJobOffer | null>(null)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [jobsData, categoriesData] = await Promise.all([
        getJobOffers(),
        getCategories()
      ])

      console.log('📊 Total ofertas recibidas del backend:', jobsData.length)
      console.log('📊 Ofertas:', jobsData)

      // Transformar jobs al formato del componente
      const transformedJobs = jobsData.map((job: BackendJobOffer) => {
        console.log('🔍 Job del backend:', job.id, job.titulo)
        console.log('  📸 Imágenes:', job.imagenes)
        console.log('  💡 Habilidades:', job.habilidades)
        
        return {
          id: job.id,
          title: job.titulo,
          categoryId: job.categoria?.id,
          description: job.descripcion,
          requirements: job.requisitos || '',
          location: job.ubicacion || '',
          contractType: contractTypeMap[job.tipo_empleo] || 'full-time',
          salaryMin: job.rango_salarial_min,
          salaryMax: job.rango_salarial_max,
          deadline: job.fecha_limite || '',
          visibility: visibilityMap[job.visibilidad] || 'public',
          status: statusMap[job.estado] || 'active',
          imageUrl: job.imagenes && job.imagenes.length > 0 ? job.imagenes[0].url : undefined,
          images: job.imagenes,
          skills: job.habilidades,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        }
      })

      // Transformar categorías
      const transformedCategories = categoriesData.map(cat => ({
        id: cat.id,
        name: cat.nombre,
        nombre: cat.nombre,
        description: cat.descripcion,
        descripcion: cat.descripcion,
        isActive: cat.estado,
        estado: cat.estado,
        jobCount: cat.jobCount || 0,
        createdAt: cat.createdAt,
      }))

      setJobs(transformedJobs)
      setCategories(transformedCategories)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar las ofertas')
    } finally {
      setLoading(false)
    }
  }

  const handleAddJob = async (jobData: Omit<JobOffer, 'id' | 'createdAt' | 'updatedAt'>, image?: File, skillIds?: string[]) => {
    try {
      console.log('🔍 Datos recibidos en handleAddJob:', jobData)
      console.log('🔍 categoryId:', jobData.categoryId, 'tipo:', typeof jobData.categoryId)
      console.log('🎯 Skills IDs recibidos:', skillIds)
      
      const dataToSend = {
        titulo: jobData.title,
        empresa: 'Coosanjer', // Valor por defecto
        descripcion: jobData.description,
        requisitos: jobData.requirements || undefined,
        ubicacion: jobData.location || undefined,
        tipo_empleo: reverseContractTypeMap[jobData.contractType],
        rango_salarial_min: jobData.salaryMin || undefined,
        rango_salarial_max: jobData.salaryMax || undefined,
        fecha_limite: jobData.deadline || undefined,
        visibilidad: reverseVisibilityMap[jobData.visibility],
        estado: reverseStatusMap[jobData.status],
        categoria_id: jobData.categoryId ? parseInt(jobData.categoryId) : undefined,
        habilidades_ids: skillIds || [],
      }
      
      console.log('📤 Datos a enviar al backend:', dataToSend)
      console.log('📤 Habilidades a guardar:', skillIds)
      console.log('📤 JSON.stringify:', JSON.stringify(dataToSend, null, 2))
      
      const response = await createJobOffer(dataToSend)
      console.log('✅ Respuesta del backend:', response)
      
      const offerId = response.data?.id
      console.log('🆔 ID de oferta creada:', offerId)
      
      // Si se proporcionó una imagen, subirla automáticamente
      if (image && offerId) {
        try {
          await uploadJobImage(offerId, image)
          toast.success('Oferta creada e imagen subida exitosamente')
        } catch (error) {
          console.error('Error al subir imagen:', error)
          toast.warning('Oferta creada pero hubo un error al subir la imagen')
        }
      } else {
        toast.success('Oferta creada exitosamente')
      }
      
      await loadData()
    } catch (error: any) {
      console.error('❌ Error al crear oferta:', error)
      console.error('📋 Respuesta del servidor:', error.response?.data)
      
      // Mostrar errores de validación específicos
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        console.error('🔍 Errores de validación:', errors)
        console.table(errors) // Mostrar en tabla para mejor visualización
        
        // Traducir errores comunes
        const errorTranslations: Record<string, string> = {
          'validation.after': 'debe ser una fecha futura',
          'validation.after_or_equal': 'debe ser hoy o una fecha futura',
          'validation.required': 'es requerido',
          'validation.string': 'debe ser texto',
          'validation.numeric': 'debe ser un número',
          'validation.exists': 'no existe',
        }
        
        const errorMessages = Object.entries(errors)
          .map(([field, messages]) => {
            const fieldTranslation: Record<string, string> = {
              'fecha_limite': 'Fecha límite',
              'titulo': 'Título',
              'descripcion': 'Descripción',
              'tipo_empleo': 'Tipo de empleo',
              'visibilidad': 'Visibilidad',
              'estado': 'Estado',
            }
            
            const translatedMessages = (messages as string[]).map(msg => 
              errorTranslations[msg] || msg
            ).join(', ')
            
            return `${fieldTranslation[field] || field}: ${translatedMessages}`
          })
          .join(' | ')
        
        toast.error(`Errores: ${errorMessages}`)
      } else {
        toast.error(error.response?.data?.message || 'Error al crear la oferta')
      }
      throw error
    }
  }

  const handleUpdateJob = async (id: string, updates: Partial<JobOffer>, skillIds?: string[]) => {
    try {
      await updateJobOffer(id, {
        titulo: updates.title,
        descripcion: updates.description,
        requisitos: updates.requirements,
        ubicacion: updates.location,
        tipo_empleo: updates.contractType ? reverseContractTypeMap[updates.contractType] : undefined,
        rango_salarial_min: updates.salaryMin || undefined,
        rango_salarial_max: updates.salaryMax || undefined,
        fecha_limite: updates.deadline,
        visibilidad: updates.visibility ? reverseVisibilityMap[updates.visibility] : undefined,
        estado: updates.status ? reverseStatusMap[updates.status] : undefined,
        categoria_id: updates.categoryId ? parseInt(updates.categoryId) : undefined,
        habilidades_ids: skillIds || [],
      })
      await loadData()
    } catch (error: any) {
      console.error('Error al actualizar oferta:', error)
      toast.error(error.response?.data?.message || 'Error al actualizar la oferta')
      throw error
    }
  }

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteJobOffer(id)
      await loadData()
    } catch (error: any) {
      console.error('Error al eliminar oferta:', error)
      toast.error(error.response?.data?.message || 'Error al eliminar la oferta')
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <Jobs
        jobs={jobs}
        categories={categories}
        onAddJob={handleAddJob}
        onUpdateJob={handleUpdateJob}
        onDeleteJob={handleDeleteJob}
      />

      {/* Diálogo para gestionar imágenes */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Gestionar Imágenes - {selectedJobForImages?.titulo}
            </DialogTitle>
          </DialogHeader>
          {selectedJobForImages && (
            <JobImageManager
              jobId={selectedJobForImages.id}
              images={selectedJobForImages.imagenes || []}
              onImagesChange={async () => {
                const updated = await getJobOffers()
                const job = updated.find((j: BackendJobOffer) => j.id === selectedJobForImages.id)
                if (job) {
                  setSelectedJobForImages(job)
                }
                await loadData()
              }}
            />
          )}
          <div className="flex justify-end pt-4">
            <Button onClick={() => setImageDialogOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
