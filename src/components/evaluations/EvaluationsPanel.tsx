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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, ClipboardText, VideoCamera, CheckCircle, Clock, User, 
  MagnifyingGlass, CaretUpDown, Check, Funnel, X, CaretLeft, 
  CaretRight, Calendar, ArrowsClockwise
} from '@phosphor-icons/react'
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
  onRefresh?: () => void
}

const ITEMS_PER_PAGE = 10

export function EvaluationsPanel({ 
  evaluations, 
  applications, 
  candidates, 
  onAddEvaluation, 
  onUpdateEvaluation,
  onRefresh 
}: EvaluationsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [candidateSearchOpen, setCandidateSearchOpen] = useState(false)
  const [candidateSearchTerm, setCandidateSearchTerm] = useState('')
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | EvaluationType>('all')
  const [modeFilter, setModeFilter] = useState<'all' | EvaluationMode>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  
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
        searchText: `${candidate.name} ${candidate.email} ${candidate.id}`.toLowerCase()
      }
    })
  }, [candidates, applications])

  // Filtrar candidatos por término de búsqueda en el formulario
  const filteredFormCandidates = useMemo(() => {
    if (!candidateSearchTerm.trim()) return candidateOptions
    const term = candidateSearchTerm.toLowerCase()
    return candidateOptions.filter(c => c.searchText.includes(term))
  }, [candidateOptions, candidateSearchTerm])

  // ====== FILTRADO Y PAGINACIÓN DE EVALUACIONES ======
  const filteredEvaluations = useMemo(() => {
    let filtered = [...evaluations]
    
    // Filtro por búsqueda (nombre del candidato)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(e => {
        const candidate = candidateMap.get(e.candidateId)
        return candidate?.name.toLowerCase().includes(term) || 
               candidate?.email.toLowerCase().includes(term)
      })
    }
    
    // Filtro por estado
    if (statusFilter === 'pending') {
      filtered = filtered.filter(e => !e.completedAt)
    } else if (statusFilter === 'completed') {
      filtered = filtered.filter(e => e.completedAt)
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
    
    // Ordenar por fecha programada (más recientes primero)
    filtered.sort((a, b) => {
      if (!a.scheduledDate) return 1
      if (!b.scheduledDate) return -1
      return b.scheduledDate.localeCompare(a.scheduledDate)
    })
    
    return filtered
  }, [evaluations, searchTerm, statusFilter, typeFilter, modeFilter, dateFrom, dateTo, candidateMap])

  // Paginación
  const totalPages = Math.ceil(filteredEvaluations.length / ITEMS_PER_PAGE)
  const paginatedEvaluations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredEvaluations.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredEvaluations, currentPage])

  // Resetear página cuando cambian filtros
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  // Estadísticas
  const stats = useMemo(() => ({
    total: evaluations.length,
    pending: evaluations.filter(e => !e.completedAt).length,
    completed: evaluations.filter(e => e.completedAt).length,
    interviews: evaluations.filter(e => e.type === 'interview').length,
    technical: evaluations.filter(e => e.type === 'technical-test').length,
  }), [evaluations])

  // Candidato y postulación seleccionados
  const selectedCandidate = candidates.find(c => c.id === formData.candidateId)

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

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Evaluaciones</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona entrevistas y pruebas técnicas
          </p>
        </div>
        
        <div className="flex gap-2">
          {onRefresh && (
            <Button variant="outline" size="icon" onClick={onRefresh} title="Refrescar">
              <ArrowsClockwise size={18} />
            </Button>
          )}
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
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setStatusFilter('all'); handleFilterChange() }}>
          <CardContent className="pt-4 pb-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className={cn(
          "cursor-pointer hover:shadow-md transition-shadow",
          statusFilter === 'pending' && "ring-2 ring-yellow-500"
        )} onClick={() => { setStatusFilter('pending'); handleFilterChange() }}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-yellow-500" weight="duotone" />
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card className={cn(
          "cursor-pointer hover:shadow-md transition-shadow",
          statusFilter === 'completed' && "ring-2 ring-green-500"
        )} onClick={() => { setStatusFilter('completed'); handleFilterChange() }}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" weight="duotone" />
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </CardContent>
        </Card>
        <Card className={cn(
          "cursor-pointer hover:shadow-md transition-shadow",
          typeFilter === 'interview' && "ring-2 ring-blue-500"
        )} onClick={() => { setTypeFilter(typeFilter === 'interview' ? 'all' : 'interview'); handleFilterChange() }}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <VideoCamera size={18} className="text-blue-500" weight="duotone" />
              <span className="text-2xl font-bold">{stats.interviews}</span>
            </div>
            <p className="text-xs text-muted-foreground">Entrevistas</p>
          </CardContent>
        </Card>
        <Card className={cn(
          "cursor-pointer hover:shadow-md transition-shadow",
          typeFilter === 'technical-test' && "ring-2 ring-purple-500"
        )} onClick={() => { setTypeFilter(typeFilter === 'technical-test' ? 'all' : 'technical-test'); handleFilterChange() }}>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <ClipboardText size={18} className="text-purple-500" weight="duotone" />
              <span className="text-2xl font-bold">{stats.technical}</span>
            </div>
            <p className="text-xs text-muted-foreground">Pruebas Técnicas</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda y filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4">
            {/* Barra principal */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Buscar por nombre de candidato..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); handleFilterChange() }}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
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
            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-xs">Estado</Label>
                  <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as any); handleFilterChange() }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="completed">Completadas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Tipo</Label>
                  <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v as any); handleFilterChange() }}>
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
                  <Select value={modeFilter} onValueChange={(v) => { setModeFilter(v as any); handleFilterChange() }}>
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
                      placeholder="Desde"
                    />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => { setDateTo(e.target.value); handleFilterChange() }}
                      className="text-xs"
                      placeholder="Hasta"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de evaluaciones */}
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
                <TableHead>Fecha Programada</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEvaluations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    {hasActiveFilters 
                      ? 'No se encontraron evaluaciones con los filtros aplicados'
                      : 'No hay evaluaciones registradas'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEvaluations.map(evaluation => {
                  const candidate = candidateMap.get(evaluation.candidateId)
                  const isPending = !evaluation.completedAt
                  return (
                    <TableRow key={evaluation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{candidate?.name || 'Desconocido'}</div>
                          <div className="text-xs text-muted-foreground">{candidate?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {evaluation.type === 'interview' ? (
                            <VideoCamera size={14} />
                          ) : (
                            <ClipboardText size={14} />
                          )}
                          {evaluationTypeLabels[evaluation.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {evaluation.mode ? evaluationModeLabels[evaluation.mode] : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-muted-foreground" />
                          {evaluation.scheduledDate || 'No programada'}
                          {evaluation.scheduledTime && (
                            <span className="text-muted-foreground">
                              {evaluation.scheduledTime}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {evaluation.interviewer || '-'}
                      </TableCell>
                      <TableCell>
                        {isPending ? (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" variant="outline">
                            <Clock size={12} className="mr-1" />
                            Pendiente
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                            <CheckCircle size={12} className="mr-1" />
                            Completada
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPending && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleComplete(evaluation.id)}
                          >
                            Completar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <CaretLeft size={16} />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <CaretRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
