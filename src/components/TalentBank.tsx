import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Users, MagnifyingGlass, EnvelopeSimple, Phone, Briefcase, GraduationCap, Star, Sparkle, PaperPlaneTilt, ClockCounterClockwise, CheckCircle, XCircle, Eye, Clock } from '@phosphor-icons/react'
import { formatDate } from '@/lib/constants'
import { talentBankService } from '@/lib/talentBankService'
import { toast } from 'sonner'
import type { TalentBankCandidate, JobOffer } from '@/lib/types'
import { SuggestedJobsHistoryDialog } from './talent-bank/SuggestedJobsHistory'

interface TalentBankProps {
  talentBankCandidates: TalentBankCandidate[]
  jobs: JobOffer[]
  onSuggestJob: (candidateId: string, jobId: string) => void
  onUpdateNotes: (candidateId: string, notes: string) => void
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
}

export function TalentBank({ talentBankCandidates, jobs, onSuggestJob, onUpdateNotes }: TalentBankProps) {
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

  // 🔍 DEBUG: Log de datos recibidos
  useEffect(() => {
    console.log('📊 [TalentBank] Componente renderizado:', {
      totalCandidates: talentBankCandidates.length,
      candidates: talentBankCandidates.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email
      }))
    })
  }, [talentBankCandidates])

  const filteredCandidates = talentBankCandidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
          created_at: s.fecha
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

  const handleOpenDialog = (candidate: TalentBankCandidate) => {
    setSelectedCandidate(candidate)
    setNotes(candidate.notes || '')
    setSuggestionNotes('')
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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
          {talentBankCandidates.length} candidatos
        </Badge>
      </div>

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          placeholder="Buscar por nombre, correo o habilidades..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => handleOpenDialog(candidate)}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={candidate.avatar} alt={candidate.name} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {getInitials(candidate.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{candidate.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <EnvelopeSimple size={14} />
                    <span className="truncate">{candidate.email}</span>
                  </div>
                  {candidate.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone size={14} />
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {candidate.skills && candidate.skills.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Habilidades</p>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 4).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{candidate.skills.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Agregado: {formatDate(candidate.addedToTalentBank)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCandidates.length === 0 && (
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

      <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
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
                    <DialogDescription className="space-y-1 mt-2">
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
                    </DialogDescription>
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
                                <div className="text-xs text-muted-foreground text-center py-2 border-t">
                                  Sugerida el {formatDate(suggestion.created_at)}
                                  {suggestion.estado === 'aplicado' && (
                                    <span className="text-green-600 ml-1">• ¡El candidato aplicó!</span>
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
