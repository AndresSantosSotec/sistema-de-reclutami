import { useState, useEffect, useMemo, memo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination'
import { Users, MagnifyingGlass, EnvelopeSimple, Phone, Briefcase, GraduationCap, Star, Sparkle, PaperPlaneTilt, ClockCounterClockwise, CheckCircle, XCircle, Eye, Clock, Funnel, Info, CaretDown, CaretUp, Calendar, User } from '@phosphor-icons/react'
import { formatDate } from '@/lib/constants'
import { talentBankService } from '@/lib/talentBankService'
import { toast } from 'sonner'
import type { TalentBankCandidate, JobOffer } from '@/lib/types'
import { SuggestedJobsHistoryDialog } from './talent-bank/SuggestedJobsHistory'
import { TalentBankCard } from './talent-bank/TalentBankCard'

interface TalentBankProps {
  talentBankCandidates: TalentBankCandidate[]
  jobs: JobOffer[]
  onSuggestJob: (candidateId: string, jobId: string) => void
  onUpdateNotes: (candidateId: string, notes: string) => void
  pagination?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
  onPageChange?: (page: number, perPage: number) => void
  loading?: boolean
}

interface MatchedJob {
  id: number
  title: string
  location: string
  coincidencias: number
  porcentaje_match: number
  habilidades_coincidentes: Array<{
    id: number
    nombre: string
  }>
}

interface SuggestedJobInfo {
  job_id: number
  estado: 'pendiente' | 'visto' | 'aplicado' | 'descartado'
  created_at: string
  email_enviado?: boolean
  notificacion_enviada?: boolean
  notas?: string | null
  sugerido_por?: string | null
}

export function TalentBank({ 
  talentBankCandidates, 
  jobs, 
  onSuggestJob, 
  onUpdateNotes,
  pagination: externalPagination,
  onPageChange,
  loading: externalLoading = false
}: TalentBankProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<TalentBankCandidate | null>(null)
  const [notes, setNotes] = useState('')
  const [matchedJobs, setMatchedJobs] = useState<MatchedJob[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [suggestingJob, setSuggestingJob] = useState<number | null>(null)
  const [sendEmail, setSendEmail] = useState(true)
  const [suggestionNotes, setSuggestionNotes] = useState('')
  
  // Historial de sugerencias
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [suggestedJobs, setSuggestedJobs] = useState<SuggestedJobInfo[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [showMoreInfo, setShowMoreInfo] = useState(false)

  // Paginación: usar la del backend si está disponible, sino local
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(50)
  
  // Si hay paginación externa, usar esa
  const pagination = externalPagination || {
    total: talentBankCandidates.length,
    per_page: perPage,
    current_page: currentPage,
    last_page: Math.ceil(talentBankCandidates.length / perPage)
  }

  // Optimizar filtrado con useMemo (solo si no hay paginación del backend)
  const filteredCandidates = useMemo(() => {
    // Si hay paginación del backend, los candidatos ya vienen filtrados
    if (externalPagination) {
      return talentBankCandidates
    }
    
    // Si no hay paginación del backend, filtrar localmente
    if (!searchTerm.trim()) {
      return talentBankCandidates
    }
    
    const searchLower = searchTerm.toLowerCase()
    return talentBankCandidates.filter(candidate =>
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower) ||
      candidate.skills?.some(skill => skill.toLowerCase().includes(searchLower))
    )
  }, [talentBankCandidates, searchTerm, externalPagination])

  // Paginación de candidatos filtrados (solo si no hay paginación del backend)
  const paginatedCandidates = useMemo(() => {
    if (externalPagination) {
      // Si hay paginación del backend, usar todos los candidatos recibidos
      return filteredCandidates
    }
    
    // Paginación local
    const startIndex = (currentPage - 1) * perPage
    const endIndex = startIndex + perPage
    return filteredCandidates.slice(startIndex, endIndex)
  }, [filteredCandidates, currentPage, perPage, externalPagination])

  // Resetear página cuando cambia el filtro
  useEffect(() => {
    if (onPageChange) {
      // Si hay callback de cambio de página, notificar al padre
      onPageChange(1, perPage)
    } else {
      setCurrentPage(1)
    }
  }, [searchTerm, onPageChange, perPage])

  useEffect(() => {
    const loadMatchedJobs = async () => {
      if (!selectedCandidate) {
        setMatchedJobs([])
        return
      }

      setLoadingMatches(true)
      try {
        // Cargar trabajos coincidentes para cada trabajo activo
        const activeJobs = jobs.filter(job => job.status === 'active')
        const matches: MatchedJob[] = []

        for (const job of activeJobs) {
          try {
            // Convertir job.id a number si es string
            const jobId = typeof job.id === 'string' ? parseInt(job.id) : job.id
            const result = await talentBankService.suggestForJob(jobId)
            
            // Buscar si el candidato seleccionado está en los resultados
            const candidateId = typeof selectedCandidate.id === 'string' 
              ? parseInt(selectedCandidate.id) 
              : selectedCandidate.id
            
            const match = result.data.find(c => c.id_postulante === candidateId)
            
            if (match && match.coincidencias > 0) {
              matches.push({
                id: job.id as any,
                title: job.title,
                location: job.location,
                coincidencias: match.coincidencias,
                porcentaje_match: match.porcentaje_match,
                habilidades_coincidentes: match.habilidades_coincidentes
              })
            }
          } catch (error) {
            console.error(`Error al verificar coincidencias para job ${job.id}:`, error)
          }
        }

        // Ordenar por mayor porcentaje de coincidencia
        matches.sort((a, b) => b.porcentaje_match - a.porcentaje_match)
        setMatchedJobs(matches)
      } catch (error) {
        console.error('Error al cargar trabajos coincidentes:', error)
        setMatchedJobs([])
      } finally {
        setLoadingMatches(false)
      }
    }

    loadMatchedJobs()
  }, [selectedCandidate, jobs])

  // Cargar sugerencias previas del candidato seleccionado
  useEffect(() => {
    const loadSuggestedJobs = async () => {
      if (!selectedCandidate) {
        setSuggestedJobs([])
        return
      }

      setLoadingSuggestions(true)
      try {
        const candidateId = typeof selectedCandidate.id === 'string' 
          ? parseInt(selectedCandidate.id) 
          : selectedCandidate.id as any
        
        const data = await talentBankService.getSuggestedJobsForCandidate(candidateId)
        setSuggestedJobs(data.map((s: any) => ({
          job_id: s.job?.id,
          estado: s.estado,
          created_at: s.fecha,
          email_enviado: s.email_enviado || false,
          notificacion_enviada: s.notificacion_enviada || false,
          notas: s.notas || null,
          sugerido_por: s.sugerido_por || null
        })))
      } catch (error) {
        console.error('Error al cargar sugerencias:', error)
        setSuggestedJobs([])
      } finally {
        setLoadingSuggestions(false)
      }
    }

    loadSuggestedJobs()
  }, [selectedCandidate])

  // Verificar si una vacante ya fue sugerida y su estado
  const getJobSuggestionStatus = (jobId: number) => {
    return suggestedJobs.find(s => s.job_id === jobId)
  }

  // Helper para obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleOpenDialog = (candidate: TalentBankCandidate) => {
    setSelectedCandidate(candidate)
    setNotes(candidate.notes || '')
    setSuggestionNotes('')
    setShowMoreInfo(false) // Resetear la sección de más información
  }

  const handleSuggestJobWithNotification = async (jobId: number) => {
    if (!selectedCandidate) return
    
    // Verificar si ya fue sugerida
    const existing = getJobSuggestionStatus(jobId)
    if (existing) {
      toast.error(`Esta vacante ya fue sugerida (Estado: ${existing.estado})`)
      return
    }
    
    setSuggestingJob(jobId)
    try {
      const postulanteId = typeof selectedCandidate.id === 'string' 
        ? parseInt(selectedCandidate.id) 
        : selectedCandidate.id as any
      
      const result = await talentBankService.suggestJobToCandidate({
        postulante_id: postulanteId,
        job_id: jobId,
        notas: suggestionNotes || undefined,
        enviar_email: sendEmail
      })
      
      // Notificar éxito
      if (result.notificacion_enviada && result.email_enviado) {
        toast.success('Vacante sugerida con notificación interna y email')
      } else if (result.notificacion_enviada) {
        toast.success('Vacante sugerida con notificación interna')
      } else {
        toast.success('Vacante sugerida exitosamente')
      }
      
      // Actualizar lista de sugerencias localmente
      setSuggestedJobs(prev => [...prev, {
        job_id: jobId,
        estado: 'pendiente',
        created_at: new Date().toISOString()
      }])
      
      // Llamar al callback original para actualizar estado local si es necesario
      onSuggestJob(selectedCandidate.id, jobId.toString())
    } catch (error: any) {
      console.error('Error al sugerir vacante:', error)
      toast.error(error.response?.data?.message || 'Error al sugerir la vacante')
    } finally {
      setSuggestingJob(null)
    }
  }

  const handleSaveNotes = () => {
    if (selectedCandidate) {
      onUpdateNotes(selectedCandidate.id, notes)
      setSelectedCandidate(null)
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Banco de Talento</h1>
          <p className="text-muted-foreground mt-1">
            Candidatos destacados guardados para futuras oportunidades
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {pagination.total} {searchTerm ? 'resultados' : 'candidatos'}
          {pagination.last_page > 1 && ` (Página ${pagination.current_page} de ${pagination.last_page})`}
        </Badge>
      </div>

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          placeholder="Buscar por nombre, correo o habilidades..."
          value={searchTerm}
          onChange={(e) => {
            const newValue = e.target.value
            setSearchTerm(newValue)
            // Si hay paginación del backend, notificar cambio de búsqueda después de un delay
            if (onPageChange && externalPagination) {
              // Resetear a página 1 cuando cambia la búsqueda
              setTimeout(() => {
                onPageChange(1, pagination.per_page)
              }, 500)
            }
          }}
          className="pl-10"
        />
      </div>
      
      {externalLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Cargando candidatos...</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedCandidates.map((candidate) => (
          <TalentBankCard
            key={candidate.id}
            candidate={candidate}
            onClick={handleOpenDialog}
          />
        ))}

        {paginatedCandidates.length === 0 && (
          <Card className="col-span-full py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No se encontraron candidatos' : 'No hay candidatos en el banco de talento'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Los candidatos destacados se guardarán aquí para futuras oportunidades'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Paginación optimizada - usar paginación del backend si está disponible */}
      {pagination.last_page > 1 && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => {
                    const newPage = Math.max(1, pagination.current_page - 1)
                    if (onPageChange) {
                      onPageChange(newPage, pagination.per_page)
                    } else {
                      setCurrentPage(newPage)
                    }
                  }}
                  className={pagination.current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                let pageNum: number
                if (pagination.last_page <= 5) {
                  pageNum = i + 1
                } else if (pagination.current_page <= 3) {
                  pageNum = i + 1
                } else if (pagination.current_page >= pagination.last_page - 2) {
                  pageNum = pagination.last_page - 4 + i
                } else {
                  pageNum = pagination.current_page - 2 + i
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => {
                        if (onPageChange) {
                          onPageChange(pageNum, pagination.per_page)
                        } else {
                          setCurrentPage(pageNum)
                        }
                      }}
                      isActive={pagination.current_page === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              
              {pagination.last_page > 5 && pagination.current_page < pagination.last_page - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => {
                    const newPage = Math.min(pagination.last_page, pagination.current_page + 1)
                    if (onPageChange) {
                      onPageChange(newPage, pagination.per_page)
                    } else {
                      setCurrentPage(newPage)
                    }
                  }}
                  className={pagination.current_page === pagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <div className="text-center text-sm text-muted-foreground mt-2">
            Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de {pagination.total} candidatos
          </div>
        </div>
      )}

      <Dialog open={!!selectedCandidate} onOpenChange={(open) => {
        if (!open) {
          setSelectedCandidate(null)
          setShowMoreInfo(false) // Resetear al cerrar
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedCandidate && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={selectedCandidate.avatar} alt={selectedCandidate.name} />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      {getInitials(selectedCandidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedCandidate.name}</DialogTitle>
                    <div className="space-y-1 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <EnvelopeSimple size={16} />
                        <span>{selectedCandidate.email}</span>
                      </div>
                      {selectedCandidate.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={16} />
                          <span>{selectedCandidate.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {selectedCandidate.workExperience && selectedCandidate.workExperience.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase size={20} className="text-primary" weight="duotone" />
                      <h3 className="font-semibold">Experiencia Laboral</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedCandidate.workExperience.map((exp) => (
                        <div key={exp.id} className="pl-4 border-l-2 border-primary/20">
                          <h4 className="font-medium">{exp.position}</h4>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(exp.startDate)} - {exp.current ? 'Actual' : formatDate(exp.endDate || '')}
                          </p>
                          {exp.description && (
                            <p className="text-sm mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCandidate.education && selectedCandidate.education.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap size={20} className="text-primary" weight="duotone" />
                      <h3 className="font-semibold">Educación</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedCandidate.education.map((edu) => (
                        <div key={edu.id} className="pl-4 border-l-2 border-primary/20">
                          <h4 className="font-medium">{edu.degree} en {edu.field}</h4>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(edu.startDate)} - {edu.current ? 'En curso' : formatDate(edu.endDate || '')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Star size={20} className="text-primary" weight="duotone" />
                      <h3 className="font-semibold">Habilidades</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sección de Más Información */}
                <div className="border rounded-lg">
                  <button
                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Info size={20} className="text-primary" weight="duotone" />
                      <h3 className="font-semibold">Más Información</h3>
                    </div>
                    {showMoreInfo ? (
                      <CaretUp size={20} className="text-muted-foreground" />
                    ) : (
                      <CaretDown size={20} className="text-muted-foreground" />
                    )}
                  </button>
                  
                  {showMoreInfo && (
                    <div className="p-4 space-y-4 border-t bg-muted/20">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Agregado al Banco</p>
                          <p className="text-sm font-medium">
                            {formatDate(selectedCandidate.addedToTalentBank)}
                          </p>
                        </div>
                        {selectedCandidate.location && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Ubicación</p>
                            <p className="text-sm font-medium">{selectedCandidate.location}</p>
                          </div>
                        )}
                        {selectedCandidate.profession && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Profesión</p>
                            <p className="text-sm font-medium">{selectedCandidate.profession}</p>
                          </div>
                        )}
                        {selectedCandidate.phone && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                            <p className="text-sm font-medium">{selectedCandidate.phone}</p>
                          </div>
                        )}
                      </div>
                      
                      {selectedCandidate.notes && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Notas Actuales</p>
                          <p className="text-sm bg-background p-2 rounded border">
                            {selectedCandidate.notes || 'Sin notas'}
                          </p>
                        </div>
                      )}
                      
                      {suggestedJobs.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Vacantes Sugeridas</p>
                          <p className="text-sm font-medium">
                            {suggestedJobs.length} vacante{suggestedJobs.length > 1 ? 's' : ''} sugerida{suggestedJobs.length > 1 ? 's' : ''}
                          </p>
                          <div className="mt-2 space-y-1">
                            {suggestedJobs.map((s, idx) => {
                              const job = matchedJobs.find(j => j.id === s.job_id)
                              if (!job) return null
                              return (
                                <div key={idx} className="text-xs bg-background p-2 rounded border flex items-center justify-between">
                                  <span className="truncate">{job.title}</span>
                                  <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                                    {s.estado}
                                  </Badge>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Notas Internas</h3>
                  <Textarea
                    placeholder="Agrega notas sobre este candidato..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkle size={20} className="text-primary" weight="duotone" />
                      <h3 className="font-semibold">Vacantes Recomendadas</h3>
                      {(loadingMatches || loadingSuggestions) && (
                        <Badge variant="secondary" className="text-xs">Cargando...</Badge>
                      )}
                    </div>
                    {/* Botón para ver historial */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHistoryDialogOpen(true)}
                      className="gap-1"
                    >
                      <ClockCounterClockwise size={14} />
                      Ver historial ({suggestedJobs.length})
                    </Button>
                  </div>
                  
                  {!loadingMatches && matchedJobs.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-3">
                        Encontramos {matchedJobs.length} vacante{matchedJobs.length > 1 ? 's' : ''} que coincide{matchedJobs.length > 1 ? 'n' : ''} con las habilidades del candidato
                      </p>
                      
                      {/* Opciones de notificación */}
                      <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg mb-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="send-email" 
                            checked={sendEmail}
                            onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                          />
                          <Label htmlFor="send-email" className="text-sm cursor-pointer">
                            Enviar notificación por email
                          </Label>
                        </div>
                      </div>
                      
                      {/* Nota opcional para la sugerencia */}
                      <div className="mb-3">
                        <Input
                          placeholder="Nota para el candidato (opcional)..."
                          value={suggestionNotes}
                          onChange={(e) => setSuggestionNotes(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {matchedJobs.map((job) => {
                          const suggestion = getJobSuggestionStatus(job.id)
                          const isSuggested = !!suggestion
                          
                          // Determinar el estado visual
                          const getStatusBadge = () => {
                            if (!suggestion) return null
                            switch (suggestion.estado) {
                              case 'aplicado':
                                return (
                                  <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
                                    <CheckCircle size={12} weight="bold" />
                                    Aplicó
                                  </Badge>
                                )
                              case 'descartado':
                                return (
                                  <Badge className="bg-red-100 text-red-800 border-red-200 gap-1">
                                    <XCircle size={12} weight="bold" />
                                    Descartado
                                  </Badge>
                                )
                              case 'visto':
                                return (
                                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1">
                                    <Eye size={12} weight="bold" />
                                    Visto
                                  </Badge>
                                )
                              default:
                                return (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 gap-1">
                                    <Clock size={12} weight="bold" />
                                    Pendiente
                                  </Badge>
                                )
                            }
                          }
                          
                          return (
                            <div 
                              key={job.id} 
                              className={`border rounded-lg p-3 transition-colors ${
                                isSuggested 
                                  ? 'bg-muted/30 border-dashed' 
                                  : 'hover:bg-accent/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium truncate">{job.title}</h4>
                                  <p className="text-sm text-muted-foreground">{job.location}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <Badge variant="default" className="shrink-0">
                                    {job.porcentaje_match}% match
                                  </Badge>
                                  {getStatusBadge()}
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mb-2">
                                {job.habilidades_coincidentes.map((skill) => (
                                  <Badge key={skill.id} variant="secondary" className="text-xs">
                                    {skill.nombre}
                                  </Badge>
                                ))}
                              </div>
                              
                              {isSuggested ? (
                                <div className="space-y-2 pt-2 border-t">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Calendar size={12} />
                                      <span>Sugerida el {formatDate(suggestion.created_at)}</span>
                                    </div>
                                    {suggestion.email_enviado && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 gap-1">
                                        <EnvelopeSimple size={10} weight="fill" />
                                        Email enviado
                                      </Badge>
                                    )}
                                  </div>
                                  {suggestion.notas && (
                                    <div className="text-xs bg-muted/50 p-2 rounded italic">
                                      <strong>Nota:</strong> {suggestion.notas}
                                    </div>
                                  )}
                                  {suggestion.sugerido_por && (
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                      <User size={12} />
                                      Sugerido por: {suggestion.sugerido_por}
                                    </div>
                                  )}
                                  {suggestion.estado === 'aplicado' && (
                                    <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                                      <CheckCircle size={12} weight="fill" />
                                      ¡El candidato aplicó a esta vacante!
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  disabled={suggestingJob === job.id}
                                  onClick={() => handleSuggestJobWithNotification(job.id)}
                                >
                                  {suggestingJob === job.id ? (
                                    <>Enviando...</>
                                  ) : (
                                    <>
                                      <PaperPlaneTilt size={14} className="mr-2" />
                                      Sugerir vacante{sendEmail ? ' + Email' : ''}
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : !loadingMatches ? (
                    <div className="text-center py-8 border rounded-lg bg-muted/20">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Briefcase size={24} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        No hay vacantes activas que coincidan con las habilidades de este candidato
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedCandidate(null)}>
                    Cerrar
                  </Button>
                  <Button className="flex-1" onClick={handleSaveNotes}>
                    Guardar Notas
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de historial de sugerencias */}
      {selectedCandidate && (
        <SuggestedJobsHistoryDialog
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          candidateId={typeof selectedCandidate.id === 'string' ? parseInt(selectedCandidate.id) : selectedCandidate.id as any}
          candidateName={selectedCandidate.name}
        />
      )}
    </div>
  )
}
