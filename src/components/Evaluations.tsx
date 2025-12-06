import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, ClipboardText, VideoCamera, CheckCircle, Clock, User, MagnifyingGlass, CaretUpDown, Check } from '@phosphor-icons/react'
import type { Evaluation, EvaluationType, EvaluationMode, Application, Candidate } from '@/lib/types'
import { evaluationTypeLabels, evaluationModeLabels, formatDateTime } from '@/lib/constants'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'



interface EvaluationsProps {
  evaluations: Evaluation[]
  applications: Application[]
  candidates: Candidate[]
  onAddEvaluation: (evaluation: Omit<Evaluation, 'id' | 'createdAt'>) => void
  onUpdateEvaluation: (id: string, evaluation: Partial<Evaluation>) => void
}

export function Evaluations({ evaluations, applications, candidates, onAddEvaluation, onUpdateEvaluation }: EvaluationsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [candidateSearchOpen, setCandidateSearchOpen] = useState(false)
  const [candidateSearchTerm, setCandidateSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    applicationId: '',
    candidateId: '',
    type: 'interview' as EvaluationType,
    mode: 'virtual' as EvaluationMode,
    scheduledDate: '',
    scheduledTime: '',
    interviewer: '',
    result: '',
    observations: ''
  })

  // Combinar candidatos con sus postulaciones para búsqueda
  const candidateOptions = useMemo(() => {
    return candidates.map(candidate => {
      // Encontrar las postulaciones del candidato
      const candidateApplications = applications.filter(app => app.candidateId === candidate.id)
      return {
        ...candidate,
        applications: candidateApplications,
        searchText: `${candidate.name} ${candidate.email} ${candidate.id}`.toLowerCase()
      }
    })
  }, [candidates, applications])

  // Filtrar candidatos por término de búsqueda
  const filteredCandidates = useMemo(() => {
    if (!candidateSearchTerm.trim()) return candidateOptions
    const term = candidateSearchTerm.toLowerCase()
    return candidateOptions.filter(c => c.searchText.includes(term))
  }, [candidateOptions, candidateSearchTerm])

  // Obtener candidato seleccionado
  const selectedCandidate = candidates.find(c => c.id === formData.candidateId)
  const selectedApplication = applications.find(a => a.id === formData.applicationId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.candidateId) {
      toast.error('Selecciona un candidato')
      return
    }

    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Debes seleccionar fecha y hora')
      return
    }

    try {
      await onAddEvaluation(formData)
      setFormData({
        applicationId: '',
        candidateId: '',
        type: 'interview',
        mode: 'virtual',
        scheduledDate: '',
        scheduledTime: '',
        interviewer: '',
        result: '',
        observations: ''
      })
      setCandidateSearchTerm('')
      setIsDialogOpen(false)
    } catch (error) {
      // El error ya se maneja en App.tsx
    }
  }

  const handleComplete = (id: string) => {
    const evaluation = evaluations.find(e => e.id === id)
    if (!evaluation) return

    const result = window.prompt('Ingresa el resultado de la evaluación:')
    if (result !== null) {
      onUpdateEvaluation(id, {
        result,
        completedAt: new Date().toISOString()
      })
      toast.success('Evaluación completada')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Evaluaciones</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona entrevistas y pruebas técnicas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={18} weight="bold" />
              Nueva Evaluación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Programar Evaluación</DialogTitle>
              <DialogDescription>
                Registra una entrevista o prueba técnica
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Buscador de Candidatos */}
              <div className="space-y-2">
                <Label>Buscar Candidato *</Label>
                <Popover open={candidateSearchOpen} onOpenChange={setCandidateSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={candidateSearchOpen}
                      className="w-full justify-between h-auto min-h-[40px] py-2"
                    >
                      {selectedCandidate ? (
                        <div className="flex flex-col items-start text-left">
                          <span className="font-medium">{selectedCandidate.name}</span>
                          <span className="text-xs text-muted-foreground">{selectedCandidate.email}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Buscar por nombre, correo o ID...</span>
                      )}
                      <CaretUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Buscar candidato..." 
                        value={candidateSearchTerm}
                        onValueChange={setCandidateSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>No se encontraron candidatos</CommandEmpty>
                        <CommandGroup heading="Candidatos">
                          {filteredCandidates.slice(0, 10).map((candidate) => (
                            <CommandItem
                              key={candidate.id}
                              value={candidate.searchText}
                              onSelect={() => {
                                // Si tiene postulaciones, seleccionar la primera
                                const firstApp = candidate.applications[0]
                                setFormData({
                                  ...formData,
                                  candidateId: candidate.id,
                                  applicationId: firstApp?.id || ''
                                })
                                setCandidateSearchOpen(false)
                                setCandidateSearchTerm('')
                              }}
                              className="cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.candidateId === candidate.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{candidate.name}</span>
                                  <Badge variant="outline" className="text-xs ml-2">
                                    ID: {candidate.id.slice(0, 8)}
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">{candidate.email}</span>
                                {candidate.applications.length > 0 && (
                                  <span className="text-xs text-primary mt-1">
                                    {candidate.applications.length} postulación(es)
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Selector de Postulación (si el candidato tiene varias) */}
              {selectedCandidate && (candidateOptions.find(c => c.id === selectedCandidate.id)?.applications?.length ?? 0) > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="application">Seleccionar Postulación</Label>
                  <Select 
                    value={formData.applicationId} 
                    onValueChange={(value) => setFormData({ ...formData, applicationId: value })}
                  >
                    <SelectTrigger id="application">
                      <SelectValue placeholder="Selecciona una postulación" />
                    </SelectTrigger>
                    <SelectContent>
                      {candidateOptions.find(c => c.id === selectedCandidate.id)?.applications.map(app => (
                        <SelectItem key={app.id} value={app.id}>
                          Postulación #{app.id.slice(0, 8)} - {app.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Evaluación</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value as EvaluationType })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interview">Entrevista</SelectItem>
                      <SelectItem value="technical-test">Prueba Técnica</SelectItem>
                      <SelectItem value="other">Otra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mode">Modalidad</Label>
                  <Select 
                    value={formData.mode} 
                    onValueChange={(value) => setFormData({ ...formData, mode: value as EvaluationMode })}
                  >
                    <SelectTrigger id="mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="in-person">Presencial</SelectItem>
                      <SelectItem value="phone">Telefónica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interviewer">Responsable / Entrevistador</Label>
                <Input
                  id="interviewer"
                  value={formData.interviewer}
                  onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
                  placeholder="Nombre del responsable"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea
                  id="observations"
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  placeholder="Notas adicionales..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Programar Evaluación
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} weight="duotone" />
              Pendientes
            </CardTitle>
            <CardDescription>
              Evaluaciones por completar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evaluations.filter(e => !e.completedAt).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No hay evaluaciones pendientes
                </p>
              ) : (
                evaluations.filter(e => !e.completedAt).map(evaluation => {
                  const candidate = candidates.find(c => c.id === evaluation.candidateId)
                  return (
                    <Card key={evaluation.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-muted-foreground" />
                              <span className="font-medium">{candidate?.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {evaluation.type === 'interview' ? (
                                <VideoCamera size={16} />
                              ) : (
                                <ClipboardText size={16} />
                              )}
                              <span>{evaluationTypeLabels[evaluation.type]}</span>
                              {evaluation.mode && (
                                <Badge variant="outline" className="text-xs">
                                  {evaluationModeLabels[evaluation.mode]}
                                </Badge>
                              )}
                            </div>
                            {evaluation.scheduledDate && (
                              <p className="text-sm text-muted-foreground">
                                {evaluation.scheduledDate} {evaluation.scheduledTime && `a las ${evaluation.scheduledTime}`}
                              </p>
                            )}
                            {evaluation.interviewer && (
                              <p className="text-xs text-muted-foreground">
                                Responsable: {evaluation.interviewer}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleComplete(evaluation.id)}
                          >
                            Completar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle size={20} weight="duotone" />
              Completadas
            </CardTitle>
            <CardDescription>
              Evaluaciones finalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evaluations.filter(e => e.completedAt).length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No hay evaluaciones completadas
                </p>
              ) : (
                evaluations.filter(e => e.completedAt).map(evaluation => {
                  const candidate = candidates.find(c => c.id === evaluation.candidateId)
                  return (
                    <Card key={evaluation.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-muted-foreground" />
                            <span className="font-medium">{candidate?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {evaluation.type === 'interview' ? (
                              <VideoCamera size={16} />
                            ) : (
                              <ClipboardText size={16} />
                            )}
                            <span>{evaluationTypeLabels[evaluation.type]}</span>
                          </div>
                          {evaluation.result && (
                            <div className="pt-2 border-t">
                              <p className="text-sm font-medium">Resultado:</p>
                              <p className="text-sm text-muted-foreground mt-1">{evaluation.result}</p>
                            </div>
                          )}
                          {evaluation.observations && (
                            <div className="pt-2 border-t">
                              <p className="text-sm font-medium">Observaciones:</p>
                              <p className="text-sm text-muted-foreground mt-1">{evaluation.observations}</p>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground pt-2">
                            Completada: {evaluation.completedAt && formatDateTime(evaluation.completedAt)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial Completo</CardTitle>
          <CardDescription>
            Todas las evaluaciones registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidato</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Fecha Programada</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No hay evaluaciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                evaluations.map(evaluation => {
                  const candidate = candidates.find(c => c.id === evaluation.candidateId)
                  return (
                    <TableRow key={evaluation.id}>
                      <TableCell className="font-medium">{candidate?.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {evaluationTypeLabels[evaluation.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {evaluation.mode ? evaluationModeLabels[evaluation.mode] : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {evaluation.scheduledDate || 'No programada'}
                      </TableCell>
                      <TableCell>
                        {evaluation.completedAt ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                            Completada
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" variant="outline">
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
