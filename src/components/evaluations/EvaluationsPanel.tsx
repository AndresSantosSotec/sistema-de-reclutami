import { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Plus, ClipboardText, VideoCamera, CheckCircle, Clock, User, 
  MagnifyingGlass, CaretUpDown, Check, Funnel, X, CaretLeft, 
  CaretRight, Calendar, ArrowsClockwise, Eye, List, SquaresFour,
  Phone, MapPin, Note, CalendarBlank, Timer, Warning, FileText, Trash
} from '@phosphor-icons/react'
import type { Evaluation, EvaluationType, EvaluationMode, Application, Candidate } from '@/lib/types'
import { evaluationTypeLabels, evaluationModeLabels, formatDateTime } from '@/lib/constants'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface EvaluationsProps {
  evaluations: Evaluation[]
  applications: Application[]
  candidates: Candidate[]
  onAddEvaluation: (evaluation: Omit<Evaluation, 'id' | 'createdAt'>) => void
  onUpdateEvaluation: (id: string, evaluation: Partial<Evaluation>) => void
  onDeleteEvaluation: (id: string) => void
  onRefresh?: () => void
}

type ViewMode = 'table' | 'cards'

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export function EvaluationsPanel({ 
  evaluations, 
  applications, 
  candidates, 
  onAddEvaluation, 
  onUpdateEvaluation,
  onDeleteEvaluation,
  onRefresh 
}: EvaluationsProps) {
  // Estados principales
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [candidateSearchOpen, setCandidateSearchOpen] = useState(false)
  const [candidateSearchTerm, setCandidateSearchTerm] = useState('')
  
  // Vista y visualización
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Panel de detalles
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null)
  const [detailSheetOpen, setDetailSheetOpen] = useState(false)
  
  // Diálogo de completar evaluación
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [evaluationToComplete, setEvaluationToComplete] = useState<Evaluation | null>(null)
  const [completeResult, setCompleteResult] = useState('')
  const [completeObservations, setCompleteObservations] = useState('')
  
  // Diálogo de eliminar evaluación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [evaluationToDelete, setEvaluationToDelete] = useState<Evaluation | null>(null)
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'today' | 'upcoming'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | EvaluationType>('all')
  const [modeFilter, setModeFilter] = useState<'all' | EvaluationMode>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  
  // Formulario de nueva evaluación
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

  // Mapear candidatos con nombre para búsqueda rápida
  const candidateMap = useMemo(() => {
    const map = new Map<string, Candidate>()
    candidates.forEach(c => map.set(c.id, c))
    return map
  }, [candidates])

  // Combinar candidatos con sus postulaciones para búsqueda
  const candidateOptions = useMemo(() => {
    return candidates.map(candidate => {
      const candidateApplications = applications.filter(app => app.candidateId === candidate.id)
      return {
        ...candidate,
        applications: candidateApplications,
        searchText: `${candidate.name || ''} ${candidate.email || ''} ${candidate.id || ''}`.toLowerCase()
      }
    })
  }, [candidates, applications])

  // Filtrar candidatos por término de búsqueda en el formulario
  const filteredFormCandidates = useMemo(() => {
    if (!candidateSearchTerm.trim()) return candidateOptions
    const term = candidateSearchTerm.toLowerCase()
    return candidateOptions.filter(c => c.searchText.includes(term))
  }, [candidateOptions, candidateSearchTerm])

  // Obtener fecha de hoy para comparaciones
  const today = useMemo(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  }, [])

  // ====== FILTRADO Y PAGINACIÓN DE EVALUACIONES ======
  const filteredEvaluations = useMemo(() => {
    let filtered = [...evaluations]
    
    // Filtro por búsqueda (nombre del candidato)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(e => {
        const candidate = candidateMap.get(e.candidateId)
        return candidate?.name?.toLowerCase().includes(term) || 
               candidate?.email?.toLowerCase().includes(term) ||
               e.interviewer?.toLowerCase().includes(term)
      })
    }
    
    // Filtro por estado
    switch (statusFilter) {
      case 'pending':
        filtered = filtered.filter(e => !e.completedAt)
        break
      case 'completed':
        filtered = filtered.filter(e => e.completedAt)
        break
      case 'today':
        filtered = filtered.filter(e => e.scheduledDate === today && !e.completedAt)
        break
      case 'upcoming':
        filtered = filtered.filter(e => e.scheduledDate && e.scheduledDate > today && !e.completedAt)
        break
    }
    
    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(e => e.type === typeFilter)
    }
    
    // Filtro por modalidad
    if (modeFilter !== 'all') {
      filtered = filtered.filter(e => e.mode === modeFilter)
    }
    
    // Filtro por fecha desde
    if (dateFrom) {
      filtered = filtered.filter(e => e.scheduledDate && e.scheduledDate >= dateFrom)
    }
    
    // Filtro por fecha hasta
    if (dateTo) {
      filtered = filtered.filter(e => e.scheduledDate && e.scheduledDate <= dateTo)
    }
    
    // Ordenar por fecha programada (más próximas primero para pendientes)
    filtered.sort((a, b) => {
      // Pendientes primero
      if (!a.completedAt && b.completedAt) return -1
      if (a.completedAt && !b.completedAt) return 1
      
      // Por fecha
      if (!a.scheduledDate) return 1
      if (!b.scheduledDate) return -1
      
      // Pendientes: próximas primero
      if (!a.completedAt) {
        return a.scheduledDate.localeCompare(b.scheduledDate)
      }
      // Completadas: más recientes primero
      return b.scheduledDate.localeCompare(a.scheduledDate)
    })
    
    return filtered
  }, [evaluations, searchTerm, statusFilter, typeFilter, modeFilter, dateFrom, dateTo, candidateMap, today])

  // Paginación
  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage)
  const paginatedEvaluations = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredEvaluations.slice(start, start + itemsPerPage)
  }, [filteredEvaluations, currentPage, itemsPerPage])

  // Resetear página cuando cambian filtros
  const handleFilterChange = useCallback(() => {
    setCurrentPage(1)
  }, [])

  // Estadísticas mejoradas
  const stats = useMemo(() => {
    const todayEvals = evaluations.filter(e => e.scheduledDate === today && !e.completedAt)
    const upcomingEvals = evaluations.filter(e => e.scheduledDate && e.scheduledDate > today && !e.completedAt)
    const overdueEvals = evaluations.filter(e => e.scheduledDate && e.scheduledDate < today && !e.completedAt)
    
    return {
      total: evaluations.length,
      pending: evaluations.filter(e => !e.completedAt).length,
      completed: evaluations.filter(e => e.completedAt).length,
      today: todayEvals.length,
      upcoming: upcomingEvals.length,
      overdue: overdueEvals.length,
      interviews: evaluations.filter(e => e.type === 'interview').length,
      technical: evaluations.filter(e => e.type === 'technical-test').length,
    }
  }, [evaluations, today])

  // Candidato y postulación seleccionados
  const selectedCandidate = candidates.find(c => c.id === formData.candidateId)

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return // Prevenir doble envío
    
    if (!formData.candidateId) {
      toast.error('Selecciona un candidato')
      return
    }

    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Debes seleccionar fecha y hora')
      return
    }

    try {
      setIsSubmitting(true)
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
      toast.success('Evaluación programada exitosamente')
    } catch {
      // El error ya se maneja en App.tsx
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCompleteDialog = (evaluation: Evaluation) => {
    setEvaluationToComplete(evaluation)
    setCompleteResult('')
    setCompleteObservations(evaluation.observations || '')
    setCompleteDialogOpen(true)
  }

  const handleComplete = async () => {
    if (!evaluationToComplete) return
    if (isCompleting) return // Prevenir doble envío
    
    if (!completeResult.trim()) {
      toast.error('Debes ingresar un resultado')
      return
    }

    try {
      setIsCompleting(true)
      await onUpdateEvaluation(evaluationToComplete.id, {
        result: completeResult,
        observations: completeObservations,
        completedAt: new Date().toISOString()
      })
      
      setCompleteDialogOpen(false)
      setEvaluationToComplete(null)
      toast.success('Evaluación completada exitosamente')
    } catch {
      // Error manejado externamente
    } finally {
      setIsCompleting(false)
    }
  }

  const openDetailSheet = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation)
    setDetailSheetOpen(true)
  }

  const openDeleteDialog = (evaluation: Evaluation) => {
    setEvaluationToDelete(evaluation)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!evaluationToDelete) return
    if (isDeleting) return
    
    try {
      setIsDeleting(true)
      await onDeleteEvaluation(evaluationToDelete.id)
      setDeleteDialogOpen(false)
      setEvaluationToDelete(null)
      toast.success('Evaluación eliminada exitosamente')
    } catch {
      // Error manejado externamente
    } finally {
      setIsDeleting(false)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setTypeFilter('all')
    setModeFilter('all')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || 
                           modeFilter !== 'all' || dateFrom || dateTo

  // Helpers para renderizado
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getStatusBadge = (evaluation: Evaluation) => {
    if (evaluation.completedAt) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
          <CheckCircle size={12} className="mr-1" weight="fill" />
          Completada
        </Badge>
      )
    }
    
    if (evaluation.scheduledDate) {
      if (evaluation.scheduledDate < today) {
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
            <Warning size={12} className="mr-1" weight="fill" />
            Vencida
          </Badge>
        )
      }
      if (evaluation.scheduledDate === today) {
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 animate-pulse" variant="outline">
            <Clock size={12} className="mr-1" weight="fill" />
            Hoy
          </Badge>
        )
      }
    }
    
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" variant="outline">
        <Clock size={12} className="mr-1" />
        Pendiente
      </Badge>
    )
  }

  const getTypeBadge = (type: EvaluationType) => {
    const configs: Record<string, { icon: typeof VideoCamera; className: string }> = {
      interview: { icon: VideoCamera, className: 'bg-blue-50 text-blue-700 border-blue-200' },
      'technical-test': { icon: ClipboardText, className: 'bg-purple-50 text-purple-700 border-purple-200' },
      other: { icon: FileText, className: 'bg-gray-50 text-gray-700 border-gray-200' }
    }
    const config = configs[type] || configs.other
    const Icon = config.icon
    
    return (
      <Badge variant="outline" className={cn("gap-1", config.className)}>
        <Icon size={14} weight="duotone" />
        {evaluationTypeLabels[type]}
      </Badge>
    )
  }

  // Componente de Card para vista de tarjetas
  const EvaluationCard = ({ evaluation }: { evaluation: Evaluation }) => {
    const candidate = candidateMap.get(evaluation.candidateId)
    const isOverdue = evaluation.scheduledDate && evaluation.scheduledDate < today && !evaluation.completedAt
    const isToday = evaluation.scheduledDate === today && !evaluation.completedAt
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        layout
      >
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-lg border-l-4",
            evaluation.completedAt && "border-l-green-500 bg-green-50/30",
            isToday && "border-l-blue-500 bg-blue-50/30",
            isOverdue && "border-l-red-500 bg-red-50/30",
            !evaluation.completedAt && !isToday && !isOverdue && "border-l-yellow-500"
          )}
          onClick={() => openDetailSheet(evaluation)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={candidate?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {candidate ? getInitials(candidate.name) : '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{candidate?.name || 'Desconocido'}</h4>
                  <p className="text-xs text-muted-foreground">{candidate?.email}</p>
                </div>
              </div>
              {getStatusBadge(evaluation)}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                {getTypeBadge(evaluation.type)}
                {evaluation.mode && (
                  <span className="text-xs text-muted-foreground capitalize">
                    {evaluationModeLabels[evaluation.mode]}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                {evaluation.scheduledDate && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar size={14} />
                    <span>{evaluation.scheduledDate}</span>
                  </div>
                )}
                {evaluation.scheduledTime && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Timer size={14} />
                    <span>{evaluation.scheduledTime}</span>
                  </div>
                )}
              </div>
              
              {evaluation.interviewer && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                  <User size={12} />
                  <span>Responsable: {evaluation.interviewer}</span>
                </div>
              )}
            </div>
            
            {!evaluation.completedAt && (
              <div className="mt-3 pt-3 border-t flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    openCompleteDialog(evaluation)
                  }}
                >
                  <CheckCircle size={14} className="mr-2" />
                  Completar
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDeleteDialog(evaluation)
                  }}
                >
                  <Trash size={14} />
                </Button>
              </div>
            )}
            {evaluation.completedAt && (
              <div className="mt-3 pt-3 border-t">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    openDeleteDialog(evaluation)
                  }}
                >
                  <Trash size={14} className="mr-2" />
                  Eliminar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Evaluaciones</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona entrevistas y pruebas técnicas de candidatos
          </p>
        </div>
        
        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={onRefresh} title="Refrescar datos">
              <ArrowsClockwise size={18} />
            </Button>
          )}
          
          {/* Selector de vista */}
          <div className="flex border rounded-lg">
            <Button 
              variant={viewMode === 'table' ? 'default' : 'ghost'} 
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode('table')}
            >
              <List size={18} />
            </Button>
            <Button 
              variant={viewMode === 'cards' ? 'default' : 'ghost'} 
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode('cards')}
            >
              <SquaresFour size={18} />
            </Button>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={18} weight="bold" />
                Nueva Evaluación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Programar Nueva Evaluación</DialogTitle>
                <DialogDescription>
                  Agenda una entrevista o prueba técnica para un candidato
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
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {getInitials(selectedCandidate.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-left">
                              <span className="font-medium">{selectedCandidate.name}</span>
                              <span className="text-xs text-muted-foreground">{selectedCandidate.email}</span>
                            </div>
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
                            {filteredFormCandidates.slice(0, 10).map((candidate) => (
                              <CommandItem
                                key={candidate.id}
                                value={candidate.searchText}
                                onSelect={() => {
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

                {/* Selector de Postulación */}
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
                    <Label htmlFor="type">Tipo de Evaluación *</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({ ...formData, type: value as EvaluationType })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interview">
                          <div className="flex items-center gap-2">
                            <VideoCamera size={16} />
                            Entrevista
                          </div>
                        </SelectItem>
                        <SelectItem value="technical-test">
                          <div className="flex items-center gap-2">
                            <ClipboardText size={16} />
                            Prueba Técnica
                          </div>
                        </SelectItem>
                        <SelectItem value="other">
                          <div className="flex items-center gap-2">
                            <FileText size={16} />
                            Otra
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mode">Modalidad *</Label>
                    <Select 
                      value={formData.mode} 
                      onValueChange={(value) => setFormData({ ...formData, mode: value as EvaluationMode })}
                    >
                      <SelectTrigger id="mode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="virtual">
                          <div className="flex items-center gap-2">
                            <VideoCamera size={16} />
                            Virtual
                          </div>
                        </SelectItem>
                        <SelectItem value="in-person">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            Presencial
                          </div>
                        </SelectItem>
                        <SelectItem value="phone">
                          <div className="flex items-center gap-2">
                            <Phone size={16} />
                            Telefónica
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      min={today}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora *</Label>
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
                    placeholder="Nombre del responsable de la evaluación"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observaciones</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Notas o instrucciones adicionales..."
                    rows={3}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <ArrowsClockwise size={16} className="mr-2 animate-spin" />
                        Programando...
                      </>
                    ) : (
                      <>
                        <Calendar size={16} className="mr-2" />
                        Programar Evaluación
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            statusFilter === 'all' && "ring-2 ring-primary"
          )}
          onClick={() => { setStatusFilter('all'); handleFilterChange() }}
        >
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            statusFilter === 'today' && "ring-2 ring-blue-500"
          )}
          onClick={() => { setStatusFilter('today'); handleFilterChange() }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarBlank size={18} className="text-blue-500" weight="duotone" />
              <span className="text-2xl font-bold">{stats.today}</span>
            </div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>
        
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            statusFilter === 'upcoming' && "ring-2 ring-indigo-500"
          )}
          onClick={() => { setStatusFilter('upcoming'); handleFilterChange() }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500" weight="duotone" />
              <span className="text-2xl font-bold">{stats.upcoming}</span>
            </div>
            <p className="text-xs text-muted-foreground">Próximas</p>
          </CardContent>
        </Card>
        
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            statusFilter === 'pending' && "ring-2 ring-yellow-500"
          )}
          onClick={() => { setStatusFilter('pending'); handleFilterChange() }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-yellow-500" weight="duotone" />
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            statusFilter === 'completed' && "ring-2 ring-green-500"
          )}
          onClick={() => { setStatusFilter('completed'); handleFilterChange() }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" weight="duotone" />
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </CardContent>
        </Card>
        
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            typeFilter === 'interview' && "ring-2 ring-blue-500"
          )}
          onClick={() => { setTypeFilter(typeFilter === 'interview' ? 'all' : 'interview'); handleFilterChange() }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <VideoCamera size={18} className="text-blue-500" weight="duotone" />
              <span className="text-2xl font-bold">{stats.interviews}</span>
            </div>
            <p className="text-xs text-muted-foreground">Entrevistas</p>
          </CardContent>
        </Card>
        
        <Card 
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            typeFilter === 'technical-test' && "ring-2 ring-purple-500"
          )}
          onClick={() => { setTypeFilter(typeFilter === 'technical-test' ? 'all' : 'technical-test'); handleFilterChange() }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ClipboardText size={18} className="text-purple-500" weight="duotone" />
              <span className="text-2xl font-bold">{stats.technical}</span>
            </div>
            <p className="text-xs text-muted-foreground">Pruebas</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de evaluaciones vencidas */}
      {stats.overdue > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <Warning size={24} className="text-red-500" weight="duotone" />
            <div>
              <p className="font-medium text-red-800">
                {stats.overdue} evaluación(es) vencida(s)
              </p>
              <p className="text-sm text-red-600">
                Hay evaluaciones programadas en fechas pasadas que no se han completado
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Barra principal */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Buscar por candidato o responsable..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); handleFilterChange() }}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1) }}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_PER_PAGE_OPTIONS.map(n => (
                      <SelectItem key={n} value={String(n)}>{n} / pág</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant={showFilters ? "default" : "outline"} 
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Funnel size={18} />
                  Filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 px-1.5">!</Badge>
                  )}
                </Button>
                {hasActiveFilters && (
                  <Button variant="ghost" onClick={clearFilters} className="gap-2">
                    <X size={18} />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>
            
            {/* Panel de filtros expandible */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label className="text-xs">Estado</Label>
                      <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as typeof statusFilter); handleFilterChange() }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="today">Hoy</SelectItem>
                          <SelectItem value="upcoming">Próximas</SelectItem>
                          <SelectItem value="pending">Pendientes</SelectItem>
                          <SelectItem value="completed">Completadas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Tipo</Label>
                      <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as typeof typeFilter); handleFilterChange() }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="interview">Entrevista</SelectItem>
                          <SelectItem value="technical-test">Prueba Técnica</SelectItem>
                          <SelectItem value="other">Otra</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Modalidad</Label>
                      <Select value={modeFilter} onValueChange={(v) => { setModeFilter(v as typeof modeFilter); handleFilterChange() }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas</SelectItem>
                          <SelectItem value="virtual">Virtual</SelectItem>
                          <SelectItem value="in-person">Presencial</SelectItem>
                          <SelectItem value="phone">Telefónica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Rango de fechas</Label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => { setDateFrom(e.target.value); handleFilterChange() }}
                          className="text-xs"
                        />
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => { setDateTo(e.target.value); handleFilterChange() }}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Vista de contenido */}
      {viewMode === 'table' ? (
        // Vista de tabla
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Evaluaciones</CardTitle>
                <CardDescription>
                  Mostrando {paginatedEvaluations.length} de {filteredEvaluations.length} evaluaciones
                  {filteredEvaluations.length !== evaluations.length && ` (filtrado de ${evaluations.length} total)`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Modalidad</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEvaluations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardText size={48} className="text-muted-foreground/50" />
                        <p>{hasActiveFilters 
                          ? 'No se encontraron evaluaciones con los filtros aplicados'
                          : 'No hay evaluaciones registradas'}</p>
                        {!hasActiveFilters && (
                          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                            <Plus size={16} className="mr-2" />
                            Crear primera evaluación
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEvaluations.map(evaluation => {
                    const candidate = candidateMap.get(evaluation.candidateId)
                    return (
                      <TableRow 
                        key={evaluation.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => openDetailSheet(evaluation)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={candidate?.avatar} />
                              <AvatarFallback className="text-xs">
                                {candidate ? getInitials(candidate.name) : '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{candidate?.name || 'Desconocido'}</div>
                              <div className="text-xs text-muted-foreground">{candidate?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(evaluation.type)}</TableCell>
                        <TableCell>
                          {evaluation.mode ? evaluationModeLabels[evaluation.mode] : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{evaluation.scheduledDate || 'No programada'}</span>
                            {evaluation.scheduledTime && (
                              <span className="text-xs text-muted-foreground">
                                {evaluation.scheduledTime}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{evaluation.interviewer || '-'}</TableCell>
                        <TableCell>{getStatusBadge(evaluation)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDetailSheet(evaluation)
                              }}
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </Button>
                            {!evaluation.completedAt && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openCompleteDialog(evaluation)
                                }}
                                title="Completar evaluación"
                              >
                                <CheckCircle size={16} className="mr-1" />
                                Completar
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                openDeleteDialog(evaluation)
                              }}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              title="Eliminar evaluación"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>

            {/* Paginación - Siempre visible si hay más de una página */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Mostrando <span className="font-semibold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-foreground">{Math.min(currentPage * itemsPerPage, filteredEvaluations.length)}</span> de <span className="font-semibold text-foreground">{filteredEvaluations.length}</span> evaluaciones
                  </p>
                  {filteredEvaluations.length !== evaluations.length && (
                    <Badge variant="secondary" className="text-xs">
                      Filtrado de {evaluations.length} total
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    title="Primera página"
                  >
                    <CaretLeft size={16} className="mr-1" />
                    Primera
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    title="Página anterior"
                  >
                    <CaretLeft size={16} />
                  </Button>
                  <div className="flex items-center gap-2 px-3 text-sm">
                    <span className="text-muted-foreground">Página</span>
                    <span className="font-semibold">{currentPage}</span>
                    <span className="text-muted-foreground">de</span>
                    <span className="font-semibold">{totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    title="Página siguiente"
                  >
                    <CaretRight size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    title="Última página"
                  >
                    Última
                    <CaretRight size={16} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
            {/* Mostrar info de paginación incluso si hay solo una página pero hay filtros */}
            {totalPages === 1 && filteredEvaluations.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Mostrando <span className="font-semibold text-foreground">{filteredEvaluations.length}</span> evaluación(es)
                  {filteredEvaluations.length !== evaluations.length && (
                    <span className="ml-2">de {evaluations.length} total</span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        // Vista de tarjetas
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {paginatedEvaluations.length} de {filteredEvaluations.length} evaluaciones
            </p>
          </div>
          
          {paginatedEvaluations.length === 0 ? (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <ClipboardText size={48} className="text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters 
                    ? 'No se encontraron evaluaciones con los filtros aplicados'
                    : 'No hay evaluaciones registradas'}
                </p>
                {!hasActiveFilters && (
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus size={16} className="mr-2" />
                    Crear primera evaluación
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {paginatedEvaluations.map(evaluation => (
                  <EvaluationCard key={evaluation.id} evaluation={evaluation} />
                ))}
              </AnimatePresence>
            </div>
          )}
          
          {/* Paginación para tarjetas - Mejorada */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Mostrando <span className="font-semibold text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-foreground">{Math.min(currentPage * itemsPerPage, filteredEvaluations.length)}</span> de <span className="font-semibold text-foreground">{filteredEvaluations.length}</span> evaluaciones
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  title="Primera página"
                >
                  <CaretLeft size={16} className="mr-1" />
                  Primera
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  title="Página anterior"
                >
                  <CaretLeft size={16} />
                </Button>
                <div className="flex items-center gap-2 px-3 text-sm">
                  <span className="text-muted-foreground">Página</span>
                  <span className="font-semibold">{currentPage}</span>
                  <span className="text-muted-foreground">de</span>
                  <span className="font-semibold">{totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  title="Página siguiente"
                >
                  <CaretRight size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Última página"
                >
                  Última
                  <CaretRight size={16} className="ml-1" />
                </Button>
              </div>
            </div>
          )}
          {/* Info de paginación para tarjetas cuando hay solo una página */}
          {totalPages === 1 && filteredEvaluations.length > 0 && (
            <div className="flex items-center justify-center mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando <span className="font-semibold text-foreground">{filteredEvaluations.length}</span> evaluación(es)
                {filteredEvaluations.length !== evaluations.length && (
                  <span className="ml-2">de {evaluations.length} total</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sheet de detalles */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          {selectedEvaluation && (() => {
            const candidate = candidateMap.get(selectedEvaluation.candidateId)
            return (
              <>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    {selectedEvaluation.type === 'interview' ? (
                      <VideoCamera size={24} className="text-blue-500" weight="duotone" />
                    ) : (
                      <ClipboardText size={24} className="text-purple-500" weight="duotone" />
                    )}
                    {evaluationTypeLabels[selectedEvaluation.type]}
                  </SheetTitle>
                  <SheetDescription>
                    Detalles completos de la evaluación
                  </SheetDescription>
                </SheetHeader>
                
                <ScrollArea className="h-[calc(100vh-180px)] mt-6">
                  <div className="space-y-6 pr-4">
                    {/* Estado */}
                    <div className="flex justify-center">
                      {getStatusBadge(selectedEvaluation)}
                    </div>
                    
                    {/* Candidato */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <User size={16} />
                          Candidato
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={candidate?.avatar} />
                            <AvatarFallback>
                              {candidate ? getInitials(candidate.name) : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{candidate?.name || 'Desconocido'}</p>
                            <p className="text-sm text-muted-foreground">{candidate?.email}</p>
                            {candidate?.phone && (
                              <p className="text-sm text-muted-foreground">{candidate.phone}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Programación */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Calendar size={16} />
                          Programación
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Fecha</p>
                            <p className="font-medium">{selectedEvaluation.scheduledDate || 'No definida'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Hora</p>
                            <p className="font-medium">{selectedEvaluation.scheduledTime || 'No definida'}</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Tipo</p>
                            <p className="font-medium">{evaluationTypeLabels[selectedEvaluation.type]}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Modalidad</p>
                            <p className="font-medium">
                              {selectedEvaluation.mode ? evaluationModeLabels[selectedEvaluation.mode] : 'No definida'}
                            </p>
                          </div>
                        </div>
                        {selectedEvaluation.interviewer && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-xs text-muted-foreground">Responsable</p>
                              <p className="font-medium">{selectedEvaluation.interviewer}</p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                    
                    {/* Observaciones */}
                    {selectedEvaluation.observations && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Note size={16} />
                            Observaciones
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-wrap">{selectedEvaluation.observations}</p>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Resultado (si completada) */}
                    {selectedEvaluation.completedAt && (
                      <Card className="border-green-200 bg-green-50/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                            <CheckCircle size={16} weight="fill" />
                            Resultado
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-wrap mb-3">
                            {selectedEvaluation.result || 'Sin resultado registrado'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Completada: {formatDateTime(selectedEvaluation.completedAt)}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Acciones */}
                    <div className="flex gap-2">
                      {!selectedEvaluation.completedAt && (
                        <Button 
                          className="flex-1" 
                          onClick={() => {
                            setDetailSheetOpen(false)
                            openCompleteDialog(selectedEvaluation)
                          }}
                        >
                          <CheckCircle size={18} className="mr-2" />
                          Completar Evaluación
                        </Button>
                      )}
                      <Button 
                        variant="outline"
                        className={cn(
                          selectedEvaluation.completedAt ? "w-full" : "flex-1",
                          "text-destructive hover:text-destructive hover:bg-destructive/10"
                        )}
                        onClick={() => {
                          setDetailSheetOpen(false)
                          openDeleteDialog(selectedEvaluation)
                        }}
                      >
                        <Trash size={18} className="mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
              </>
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* Diálogo para completar evaluación */}
      <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              Completar Evaluación
            </DialogTitle>
            <DialogDescription>
              {evaluationToComplete && (
                <>
                  {evaluationTypeLabels[evaluationToComplete.type]} - {' '}
                  {candidateMap.get(evaluationToComplete.candidateId)?.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="result">Resultado de la Evaluación *</Label>
              <Textarea
                id="result"
                value={completeResult}
                onChange={(e) => setCompleteResult(e.target.value)}
                placeholder="Describe el resultado de la evaluación, desempeño del candidato, decisión tomada..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="final-observations">Observaciones Adicionales</Label>
              <Textarea
                id="final-observations"
                value={completeObservations}
                onChange={(e) => setCompleteObservations(e.target.value)}
                placeholder="Notas adicionales, recomendaciones, próximos pasos..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteDialogOpen(false)} disabled={isCompleting}>
              Cancelar
            </Button>
            <Button onClick={handleComplete} disabled={isCompleting}>
              {isCompleting ? (
                <>
                  <ArrowsClockwise size={16} className="mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle size={16} className="mr-2" />
                  Marcar como Completada
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para eliminar evaluación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash size={20} className="text-destructive" />
              Eliminar Evaluación
            </DialogTitle>
            <DialogDescription>
              {evaluationToDelete && (
                <>
                  ¿Estás seguro de que deseas eliminar esta evaluación?
                  <br />
                  <span className="font-semibold mt-2 block">
                    {evaluationTypeLabels[evaluationToDelete.type]} - {candidateMap.get(evaluationToDelete.candidateId)?.name}
                  </span>
                  {evaluationToDelete.scheduledDate && (
                    <span className="text-sm text-muted-foreground block mt-1">
                      Programada para: {evaluationToDelete.scheduledDate} {evaluationToDelete.scheduledTime && `a las ${evaluationToDelete.scheduledTime}`}
                    </span>
                  )}
                  <span className="text-sm text-destructive font-medium block mt-2">
                    Esta acción no se puede deshacer.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <ArrowsClockwise size={16} className="mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash size={16} className="mr-2" />
                  Eliminar Evaluación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
