import { useState, useEffect, useMemo, memo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination'
import { 
  User, 
  Envelope, 
  Phone, 
  LinkedinLogo, 
  MagnifyingGlass, 
  Briefcase, 
  GraduationCap, 
  Star, 
  MapPin, 
  DownloadSimple,
  BriefcaseMetal,
  FilePdf,
  FileXls,
  StarFour,
  Brain,
  Clipboard,
  Globe,
  FileText,
  Calendar,
  Plus,
  Funnel,
  CheckCircle,
  Clock,
  VideoCamera,
  UserCircle,
  Link as LinkIcon,
  ArrowSquareOut
} from '@phosphor-icons/react'
import { useCandidates } from '@/hooks/useCandidates'
import { adminCandidateService, type AdminCandidateDetail } from '@/lib/adminCandidateService'
import { talentBankService } from '@/lib/talentBankService'
import evalationService from '@/lib/evalationService'
import type { Evaluation } from '@/lib/types'
import { CandidateCard } from './candidates/CandidateCard'
import { PsychometricTestSection } from './candidates/PsychometricTestSection'
import { AIAnalysisTab } from './candidates/AIAnalysisTab'

export function Candidates() {
  const { candidates, loading, fetchCandidates, exportCandidates, pagination } = useCandidates()
  
  // Estado de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    ubicacion: '',
    profesion: '',
    fecha_desde: '',
    fecha_hasta: '',
    min_experiencia: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  
  // Estado del candidato seleccionado
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null)
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<AdminCandidateDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInTalentBank, setIsInTalentBank] = useState(false)
  const [addingToTalentBank, setAddingToTalentBank] = useState(false)
  
  // Estado de evaluaciones
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loadingEvaluations, setLoadingEvaluations] = useState(false)
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false)
  const [evaluationForm, setEvaluationForm] = useState({
    tipo_evaluacion: 'Entrevista',
    modalidad: 'Virtual',
    fecha: '',
    hora: '',
    responsable: '',
    observaciones: ''
  })
  
  // Estado de eliminación
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Cargar candidatos con filtros y paginación
  useEffect(() => {
    fetchCandidates({
      search: searchTerm || undefined,
      ubicacion: filters.ubicacion || undefined,
      profesion: filters.profesion || undefined,
      fecha_desde: filters.fecha_desde || undefined,
      fecha_hasta: filters.fecha_hasta || undefined,
      min_experiencia: filters.min_experiencia ? parseFloat(filters.min_experiencia) : undefined,
      page: currentPage,
      per_page: perPage
    })
  }, [fetchCandidates, searchTerm, filters, currentPage, perPage])

  // Cargar evaluaciones cuando se selecciona un candidato
  useEffect(() => {
    if (selectedCandidateId) {
      loadEvaluations()
    } else {
      setEvaluations([])
    }
  }, [selectedCandidateId])

  // Cargar evaluaciones del candidato
  const loadEvaluations = async () => {
    if (!selectedCandidateId) return
    
    try {
      setLoadingEvaluations(true)
      const evaluaciones = await evalationService.getEvaluations({ postulante_id: selectedCandidateId })
      setEvaluations(evaluaciones)
    } catch (error) {
      console.error('Error al cargar evaluaciones:', error)
      toast.error('Error al cargar las evaluaciones')
    } finally {
      setLoadingEvaluations(false)
    }
  }

  // Crear nueva evaluación
  const handleCreateEvaluation = async () => {
    if (!selectedCandidateId) return
    
    if (!evaluationForm.fecha || !evaluationForm.hora) {
      toast.error('Debes seleccionar fecha y hora para la evaluación')
      return
    }

    try {
      await evalationService.createEvaluation({
        postulante_id: selectedCandidateId,
        tipo_evaluacion: evaluationForm.tipo_evaluacion,
        modalidad: evaluationForm.modalidad,
        fecha: evaluationForm.fecha,
        hora: evaluationForm.hora,
        responsable: evaluationForm.responsable || undefined,
        observaciones: evaluationForm.observaciones || undefined
      })
      
      toast.success('Evaluación creada exitosamente')
      setShowEvaluationDialog(false)
      setEvaluationForm({
        tipo_evaluacion: 'Entrevista',
        modalidad: 'Virtual',
        fecha: '',
        hora: '',
        responsable: '',
        observaciones: ''
      })
      await loadEvaluations()
    } catch (error: any) {
      console.error('Error al crear evaluación:', error)
      toast.error(error.response?.data?.message || 'Error al crear la evaluación')
    }
  }

  const filteredCandidates = candidates // Ya viene filtrado del backend con paginación

  const handleViewDetails = async (candidateId: string) => {
    const candidateIdNum = parseInt(candidateId)
    setSelectedCandidateId(candidateIdNum)
    setSelectedCandidateDetail(null)
    setIsInTalentBank(false)
    setEvaluations([])
    
    try {
      const [detail, inTalentBank] = await Promise.all([
        adminCandidateService.getCandidateDetail(candidateIdNum),
        talentBankService.checkCandidate(candidateIdNum)
      ])
      setSelectedCandidateDetail(detail)
      setIsInTalentBank(inTalentBank)
      // Las evaluaciones se cargarán automáticamente por el useEffect
    } catch (error) {
      console.error('Error al cargar detalle del candidato:', error)
      toast.error('Error al cargar la información del candidato')
      setSelectedCandidateId(null)
    }
  }

  const handleAddToTalentBank = async () => {
    if (!selectedCandidateId) return
    
    setAddingToTalentBank(true)
    try {
      await talentBankService.add({
        id_postulante: selectedCandidateId,
        prioridad: 'media'
      })
      setIsInTalentBank(true)
      toast.success('Candidato agregado al Banco de Talento')
    } catch (error: any) {
      console.error('Error al agregar al banco de talento:', error)
      if (error.response?.status === 422) {
        toast.error('Este candidato ya está en el Banco de Talento')
      } else {
        toast.error('Error al agregar al Banco de Talento')
      }
    } finally {
      setAddingToTalentBank(false)
    }
  }

  const handleExportExcel = () => {
    exportCandidates('excel', {
      search: searchTerm || undefined,
      ubicacion: filters.ubicacion || undefined,
      profesion: filters.profesion || undefined,
      fecha_desde: filters.fecha_desde || undefined,
      fecha_hasta: filters.fecha_hasta || undefined,
      min_experiencia: filters.min_experiencia ? parseFloat(filters.min_experiencia) : undefined
    })
  }

  const handleExportPdf = () => {
    exportCandidates('pdf', {
      search: searchTerm || undefined,
      ubicacion: filters.ubicacion || undefined,
      profesion: filters.profesion || undefined,
      fecha_desde: filters.fecha_desde || undefined,
      fecha_hasta: filters.fecha_hasta || undefined,
      min_experiencia: filters.min_experiencia ? parseFloat(filters.min_experiencia) : undefined
    })
  }

  const handleExportCsv = () => {
    exportCandidates('csv', {
      search: searchTerm || undefined,
      ubicacion: filters.ubicacion || undefined,
      profesion: filters.profesion || undefined,
      fecha_desde: filters.fecha_desde || undefined,
      fecha_hasta: filters.fecha_hasta || undefined,
      min_experiencia: filters.min_experiencia ? parseFloat(filters.min_experiencia) : undefined
    })
  }

  const handleDeleteCandidate = async () => {
    if (!selectedCandidateId || !selectedCandidateDetail) return
    
    setDeleting(true)
    try {
      await adminCandidateService.deleteCandidate(selectedCandidateId)
      toast.success(`Candidato "${selectedCandidateDetail.nombre}" eliminado exitosamente`)
      setShowDeleteDialog(false)
      setSelectedCandidateId(null)
      setSelectedCandidateDetail(null)
      // Recargar la lista de candidatos
      fetchCandidates({
        search: searchTerm || undefined,
        ubicacion: filters.ubicacion || undefined,
        profesion: filters.profesion || undefined,
        fecha_desde: filters.fecha_desde || undefined,
        fecha_hasta: filters.fecha_hasta || undefined,
        min_experiencia: filters.min_experiencia ? parseFloat(filters.min_experiencia) : undefined,
        page: currentPage,
        per_page: perPage
      })
    } catch (error: any) {
      console.error('Error al eliminar candidato:', error)
      toast.error(error.response?.data?.message || 'Error al eliminar el candidato')
    } finally {
      setDeleting(false)
    }
  }

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      ubicacion: '',
      profesion: '',
      fecha_desde: '',
      fecha_hasta: '',
      min_experiencia: ''
    })
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Cargando candidatos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Candidatos</h1>
        <p className="text-muted-foreground mt-2">
          Base de datos de todos los candidatos
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Todos los Candidatos</CardTitle>
                <CardDescription>
                  {pagination.total > 0 
                    ? `Mostrando ${candidates.length} de ${pagination.total} candidato${pagination.total !== 1 ? 's' : ''} (Página ${pagination.current_page} de ${pagination.last_page})`
                    : '0 candidatos'}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar candidatos..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setCurrentPage(1) // Reset a primera página al buscar
                    }}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Button 
                  onClick={() => setShowFilters(!showFilters)} 
                  variant="outline" 
                  className="gap-2"
                >
                  <Funnel size={18} />
                  Filtros
                </Button>
                <Button onClick={handleExportCsv} variant="outline" className="gap-2">
                  <FileXls size={18} />
                  CSV
                </Button>
                <Button onClick={handleExportExcel} variant="outline" className="gap-2">
                  <FileXls size={18} />
                  Excel
                </Button>
                <Button onClick={handleExportPdf} variant="outline" className="gap-2">
                  <FilePdf size={18} />
                  PDF
                </Button>
              </div>
            </div>
            
            {/* Panel de Filtros Avanzados */}
            {showFilters && (
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Ubicación</Label>
                      <Input
                        placeholder="Ej: Guatemala, Antigua..."
                        value={filters.ubicacion}
                        onChange={(e) => {
                          setFilters({ ...filters, ubicacion: e.target.value })
                          setCurrentPage(1)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Profesión</Label>
                      <Input
                        placeholder="Ej: Desarrollador, Diseñador..."
                        value={filters.profesion}
                        onChange={(e) => {
                          setFilters({ ...filters, profesion: e.target.value })
                          setCurrentPage(1)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha desde</Label>
                      <Input
                        type="date"
                        value={filters.fecha_desde}
                        onChange={(e) => {
                          setFilters({ ...filters, fecha_desde: e.target.value })
                          setCurrentPage(1)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha hasta</Label>
                      <Input
                        type="date"
                        value={filters.fecha_hasta}
                        onChange={(e) => {
                          setFilters({ ...filters, fecha_hasta: e.target.value })
                          setCurrentPage(1)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Experiencia mínima (años)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="Ej: 2, 3.5..."
                        value={filters.min_experiencia}
                        onChange={(e) => {
                          setFilters({ ...filters, min_experiencia: e.target.value })
                          setCurrentPage(1)
                        }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={handleClearFilters} size="sm">
                      Limpiar Filtros
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCandidates.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {candidates.length === 0 
                  ? 'No hay candidatos registrados aún.' 
                  : 'No se encontraron candidatos con ese criterio de búsqueda.'}
              </div>
            ) : (
              filteredCandidates.map(candidate => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onClick={handleViewDetails}
                />
              ))
            )}
          </div>
          
          {/* Paginación Mejorada */}
          {pagination.last_page > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
              {/* Selector de items por página */}
              <div className="flex items-center gap-2">
                <Label htmlFor="items-per-page" className="text-sm text-muted-foreground whitespace-nowrap">
                  Mostrar:
                </Label>
                <Select value={String(perPage)} onValueChange={(value) => { setPerPage(Number(value)); setCurrentPage(1) }}>
                  <SelectTrigger id="items-per-page" className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  por página
                </span>
              </div>

              {/* Información de paginación */}
              <div className="text-sm text-muted-foreground">
                Mostrando <span className="font-semibold text-foreground">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> - <span className="font-semibold text-foreground">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> de <span className="font-semibold text-foreground">{pagination.total}</span> candidatos
              </div>

              {/* Controles de paginación */}
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                          onClick={() => setCurrentPage(pageNum)}
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
                      onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
                      className={pagination.current_page === pagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedCandidateId} onOpenChange={(open) => !open && setSelectedCandidateId(null)}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-[90vw] max-h-[85vh] sm:max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl">Perfil del Candidato</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Información completa del candidato y sus postulaciones
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto">
            <div>
              
              {!selectedCandidateDetail ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Cargando información del candidato...</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* Header con foto y datos básicos */}
                  <Card>
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                          {selectedCandidateDetail.foto_perfil ? (
                            <img 
                              src={selectedCandidateDetail.foto_perfil} 
                              alt={selectedCandidateDetail.nombre}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <User size={32} weight="duotone" className="text-primary sm:w-10 sm:h-10" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                          <h3 className="text-xl sm:text-2xl font-bold truncate">{selectedCandidateDetail.nombre}</h3>
                          {selectedCandidateDetail.profesion && (
                            <p className="text-base sm:text-lg text-muted-foreground truncate">{selectedCandidateDetail.profesion}</p>
                          )}
                          {selectedCandidateDetail.ubicacion && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                              <MapPin size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
                              <span className="truncate">{selectedCandidateDetail.ubicacion}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información de contacto */}
                  <Card>
                    <CardHeader className="pb-3 sm:pb-6">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                        <Envelope size={18} className="sm:w-5 sm:h-5" />
                        <span>Información de Contacto</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5 sm:space-y-3 pt-0">
                      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <Envelope size={16} className="text-muted-foreground flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                        <span className="truncate break-all">{selectedCandidateDetail.email}</span>
                      </div>
                      {selectedCandidateDetail.telefono && (
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <Phone size={16} className="text-muted-foreground flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                          <span className="truncate">{selectedCandidateDetail.telefono}</span>
                        </div>
                      )}
                      {selectedCandidateDetail.linkedin && (
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <LinkedinLogo size={16} className="text-muted-foreground flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                          <a 
                            href={selectedCandidateDetail.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline truncate"
                          >
                            Ver perfil de LinkedIn
                          </a>
                        </div>
                      )}
                      {selectedCandidateDetail.portfolio && (
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                          <Globe size={16} className="text-muted-foreground flex-shrink-0 sm:w-[18px] sm:h-[18px]" />
                          <a 
                            href={selectedCandidateDetail.portfolio} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline truncate"
                          >
                            Ver portafolio
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleAddToTalentBank}
                      disabled={isInTalentBank || addingToTalentBank}
                      className="flex-1 gap-1.5 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
                      variant={isInTalentBank ? "outline" : "default"}
                    >
                      <StarFour size={14} weight={isInTalentBank ? "fill" : "regular"} className="sm:w-4 sm:h-4" />
                      <span className="truncate">{isInTalentBank ? 'En Banco de Talento' : 'Agregar a Banco'}</span>
                    </Button>
                    <Button 
                      onClick={() => setShowDeleteDialog(true)}
                      variant="destructive"
                      className="gap-1.5 sm:gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 256 256" className="sm:w-4 sm:h-4">
                        <path fill="currentColor" d="M216 48h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16M96 40a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm96 168H64V64h128Zm-80-104v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0m48 0v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0"/>
                      </svg>
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </div>

                  <Separator />

                  {/* Biografía */}
                  {selectedCandidateDetail.bio && (
                    <Card>
                      <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                          <FileText size={18} className="sm:w-5 sm:h-5" />
                          <span>Acerca de</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                          {selectedCandidateDetail.bio}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Experiencia Laboral */}
                  {selectedCandidateDetail.experiencia && selectedCandidateDetail.experiencia.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-4">
                        <CardTitle className="text-sm sm:text-base flex items-center gap-1.5 sm:gap-2">
                          <Briefcase size={16} className="sm:w-4 sm:h-4" />
                          <span>Experiencia Laboral</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-3 pt-0 pb-3 sm:pb-4">
                        {selectedCandidateDetail.experiencia.map((exp, index) => (
                          <div key={index} className="border-l-2 border-primary/20 pl-2 sm:pl-3 space-y-0.5 sm:space-y-1">
                            <h4 className="font-semibold text-xs sm:text-sm truncate">{exp.puesto}</h4>
                            <p className="text-xs text-primary truncate">{exp.empresa}</p>
                            <p className="text-xs text-muted-foreground">
                              {exp.fecha_inicio} - {exp.actualmente_trabajando ? 'Presente' : exp.fecha_fin}
                            </p>
                            {exp.descripcion && (
                              <p className="text-xs text-muted-foreground pt-1 sm:pt-2 break-words">{exp.descripcion}</p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Educación */}
                  {selectedCandidateDetail.educacion && selectedCandidateDetail.educacion.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-4">
                        <CardTitle className="text-sm sm:text-base flex items-center gap-1.5 sm:gap-2">
                          <GraduationCap size={16} className="sm:w-4 sm:h-4" />
                          <span>Educación</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-3 pt-0 pb-3 sm:pb-4">
                        {selectedCandidateDetail.educacion.map((edu, index) => (
                          <div key={index} className="border-l-2 border-primary/20 pl-2 sm:pl-3 space-y-0.5 sm:space-y-1">
                            <h4 className="font-semibold text-xs sm:text-sm truncate">{edu.titulo}</h4>
                            <p className="text-xs text-primary truncate">{edu.institucion}</p>
                            <p className="text-xs text-muted-foreground">
                              {edu.nivel} • {edu.fecha_inicio} - {edu.en_curso ? 'En curso' : edu.fecha_fin}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Habilidades */}
                  {selectedCandidateDetail.habilidades && selectedCandidateDetail.habilidades.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-4">
                        <CardTitle className="text-sm sm:text-base flex items-center gap-1.5 sm:gap-2">
                          <Star size={16} className="sm:w-4 sm:h-4" />
                          <span>Habilidades</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-3 sm:pb-4">
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                          {selectedCandidateDetail.habilidades.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="px-1.5 sm:px-2 py-0.5 text-xs">
                              <span className="font-medium truncate">{skill.nombre}</span>
                              {skill.nivel && (
                                <span className="ml-1 sm:ml-1.5 text-xs text-muted-foreground">• {skill.nivel}</span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Separator />

                  {/* CV */}
                  {selectedCandidateDetail.cvs && selectedCandidateDetail.cvs.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-4">
                        <CardTitle className="text-sm sm:text-base flex items-center gap-1.5 sm:gap-2">
                          <FileText size={16} className="sm:w-4 sm:h-4" />
                          <span>Currículum Vitae</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 pb-3 sm:pb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs sm:text-sm truncate">{selectedCandidateDetail.cvs[0].nombre_archivo}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Subido el {new Date(selectedCandidateDetail.cvs[0].fecha_subida).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(selectedCandidateDetail.cvs![0].url, '_blank')}
                            className="w-full sm:w-auto text-xs py-1 sm:py-1.5"
                          >
                            <DownloadSimple size={12} className="mr-1.5 sm:w-3.5 sm:h-3.5" />
                            <span>Descargar CV</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tabs de Postulaciones */}
                  <Tabs defaultValue="postulaciones" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 h-auto p-0.5 sm:p-1">
                      <TabsTrigger value="postulaciones" className="text-[10px] sm:text-xs px-1 sm:px-2 py-1 sm:py-1.5">
                        <span className="truncate">Postulaciones</span>
                      </TabsTrigger>
                      <TabsTrigger value="evaluaciones" className="text-[10px] sm:text-xs px-1 sm:px-2 py-1 sm:py-1.5">
                        <span className="truncate">Evaluaciones</span>
                      </TabsTrigger>
                      <TabsTrigger value="ia" className="text-[10px] sm:text-xs px-1 sm:px-2 py-1 sm:py-1.5">
                        <span className="truncate">IA</span>
                      </TabsTrigger>
                      <TabsTrigger value="psicometricas" className="text-[10px] sm:text-xs px-1 sm:px-2 py-1 sm:py-1.5">
                        <span className="truncate">Psicométricas</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="postulaciones" className="space-y-2 sm:space-y-3 mt-2 sm:mt-3">
                      {selectedCandidateDetail.postulaciones.length === 0 ? (
                        <div className="text-center py-4 sm:py-6 text-muted-foreground text-xs sm:text-sm">
                          No hay postulaciones registradas
                        </div>
                      ) : (
                        <ScrollArea className="h-[200px] sm:h-[250px] pr-2">
                          <div className="space-y-2 sm:space-y-3">
                            {selectedCandidateDetail.postulaciones.map(post => (
                              <Card key={post.id}>
                                <CardContent className="pt-3 sm:pt-4">
                                  <div className="space-y-2 sm:space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-base sm:text-lg truncate">{post.oferta?.titulo || 'Oferta sin título'}</h4>
                                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{post.oferta?.empresa || 'COOSANJER'}</p>
                                      </div>
                                      <Badge variant="outline" className="text-xs flex-shrink-0">
                                        <span className="truncate max-w-[80px] sm:max-w-none">{post.estado}</span>
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                      <Calendar size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
                                      <span className="truncate">Aplicó el {new Date(post.fecha_postulacion).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>

                    <TabsContent value="evaluaciones" className="space-y-2 sm:space-y-3 mt-2 sm:mt-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <h4 className="font-semibold text-sm sm:text-base">Evaluaciones ({evaluations.length})</h4>
                        <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-2 w-full sm:w-auto text-xs sm:text-sm">
                              <Plus size={14} className="sm:w-4 sm:h-4" />
                              <span>Nueva Evaluación</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Nueva Evaluación</DialogTitle>
                              <DialogDescription>
                                Crea una nueva evaluación o entrevista para este candidato
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Tipo de Evaluación</Label>
                                  <Select
                                    value={evaluationForm.tipo_evaluacion}
                                    onValueChange={(value) => setEvaluationForm({ ...evaluationForm, tipo_evaluacion: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Entrevista">Entrevista</SelectItem>
                                      <SelectItem value="Prueba Técnica">Prueba Técnica</SelectItem>
                                      <SelectItem value="Prueba Psicológica">Prueba Psicológica</SelectItem>
                                      <SelectItem value="Otro">Otro</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Modalidad</Label>
                                  <Select
                                    value={evaluationForm.modalidad}
                                    onValueChange={(value) => setEvaluationForm({ ...evaluationForm, modalidad: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Virtual">Virtual</SelectItem>
                                      <SelectItem value="Presencial">Presencial</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Fecha</Label>
                                  <Input
                                    type="date"
                                    value={evaluationForm.fecha}
                                    onChange={(e) => setEvaluationForm({ ...evaluationForm, fecha: e.target.value })}
                                    min={new Date().toISOString().split('T')[0]}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Hora</Label>
                                  <Input
                                    type="time"
                                    value={evaluationForm.hora}
                                    onChange={(e) => setEvaluationForm({ ...evaluationForm, hora: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Responsable (Opcional)</Label>
                                <Input
                                  placeholder="Nombre del entrevistador"
                                  value={evaluationForm.responsable}
                                  onChange={(e) => setEvaluationForm({ ...evaluationForm, responsable: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Observaciones (Opcional)</Label>
                                <Textarea
                                  placeholder="Notas adicionales sobre la evaluación"
                                  value={evaluationForm.observaciones}
                                  onChange={(e) => setEvaluationForm({ ...evaluationForm, observaciones: e.target.value })}
                                  rows={4}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowEvaluationDialog(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleCreateEvaluation}>
                                Crear Evaluación
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      {loadingEvaluations ? (
                        <div className="text-center py-8 text-muted-foreground">
                          Cargando evaluaciones...
                        </div>
                      ) : evaluations.length === 0 ? (
                        <div className="text-center py-12">
                          <Clipboard size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
                          <p className="text-muted-foreground">
                            No hay evaluaciones registradas para este candidato
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Las evaluaciones de entrevistas y procesos aparecerán aquí
                          </p>
                        </div>
                      ) : (
                        <ScrollArea className="h-[200px] sm:h-[250px] pr-2">
                          <div className="space-y-1.5 sm:space-y-2">
                            {evaluations.map((evaluation) => (
                              <Card key={evaluation.id}>
                                <CardContent className="pt-2 sm:pt-3 pb-2 sm:pb-3">
                                  <div className="space-y-2 sm:space-y-3">
                                    <div className="flex justify-between items-start gap-2">
                                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                        {evaluation.type === 'interview' ? (
                                          <VideoCamera size={20} className="text-primary flex-shrink-0 sm:w-6 sm:h-6" weight="duotone" />
                                        ) : (
                                          <Clipboard size={20} className="text-primary flex-shrink-0 sm:w-6 sm:h-6" weight="duotone" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-semibold text-sm sm:text-base truncate">
                                            {evaluation.type === 'interview' ? 'Entrevista' :
                                             evaluation.type === 'technical-test' ? 'Prueba Técnica' :
                                             evaluation.type === 'psychometric' ? 'Prueba Psicológica' : 'Evaluación'}
                                          </h4>
                                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                            {evaluation.mode === 'virtual' ? 'Virtual' : 
                                             evaluation.mode === 'in-person' ? 'Presencial' : evaluation.mode}
                                          </p>
                                        </div>
                                      </div>
                                      <Badge variant={evaluation.completedAt ? "default" : "outline"} className="text-xs flex-shrink-0">
                                        {evaluation.completedAt ? (
                                          <span className="flex items-center gap-1">
                                            <CheckCircle size={12} className="sm:w-3.5 sm:h-3.5" />
                                            <span className="hidden sm:inline">Completada</span>
                                            <span className="sm:hidden">OK</span>
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1">
                                            <Clock size={12} className="sm:w-3.5 sm:h-3.5" />
                                            <span className="hidden sm:inline">Pendiente</span>
                                            <span className="sm:hidden">Pend.</span>
                                          </span>
                                        )}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                      <Calendar size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
                                      <span className="truncate">
                                        {evaluation.scheduledDate && new Date(evaluation.scheduledDate).toLocaleDateString('es-ES', {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                        {evaluation.scheduledTime && ` a las ${evaluation.scheduledTime}`}
                                      </span>
                                    </div>
                                    {evaluation.interviewer && (
                                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                        <UserCircle size={14} className="flex-shrink-0 sm:w-4 sm:h-4" />
                                        <span className="truncate">Responsable: {evaluation.interviewer}</span>
                                      </div>
                                    )}
                                    {evaluation.observations && (
                                      <p className="text-xs sm:text-sm text-muted-foreground pt-2 border-t break-words">
                                        {evaluation.observations}
                                      </p>
                                    )}
                                    {evaluation.result && (
                                      <div className="pt-2 border-t">
                                        <p className="text-xs sm:text-sm font-medium mb-1">Resultado:</p>
                                        <p className="text-xs sm:text-sm text-muted-foreground break-words">{evaluation.result}</p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>

                    <TabsContent value="ia" className="space-y-4">
                      <AIAnalysisTab 
                        candidateId={selectedCandidateDetail.id}
                        candidateName={selectedCandidateDetail.nombre}
                      />
                    </TabsContent>

                    <TabsContent value="psicometricas" className="space-y-4">
                      <PsychometricTestSection
                        candidateId={selectedCandidateDetail.id}
                        jobOfferId={selectedCandidateDetail.postulaciones?.[0]?.id}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                <path d="M236.8 188.09L149.35 36.22a24.76 24.76 0 0 0-42.7 0L19.2 188.09a23.51 23.51 0 0 0 0 23.72A24.35 24.35 0 0 0 40.55 224h174.9a24.35 24.35 0 0 0 21.33-12.19a23.51 23.51 0 0 0 .02-23.72M120 104a8 8 0 0 1 16 0v40a8 8 0 0 1-16 0Zm8 88a12 12 0 1 1 12-12a12 12 0 0 1-12 12"/>
              </svg>
              ¿Eliminar candidato?
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>Estás a punto de eliminar permanentemente a:</p>
              <div className="bg-muted p-3 rounded-md">
                <p className="font-semibold">{selectedCandidateDetail?.nombre}</p>
                <p className="text-sm text-muted-foreground">{selectedCandidateDetail?.email}</p>
              </div>
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md space-y-2">
                <p className="font-semibold text-destructive text-sm">Esta acción eliminará:</p>
                <ul className="text-xs space-y-1 ml-4 list-disc text-foreground/80">
                  <li>Cuenta de usuario del candidato</li>
                  <li>Información personal y de contacto</li>
                  <li>Educación y experiencia laboral</li>
                  <li>Habilidades y referencias</li>
                  <li>Todas las postulaciones a ofertas</li>
                  <li>CVs y documentos adjuntos</li>
                  <li>Evaluaciones y pruebas psicométricas</li>
                  <li>Registro en Banco de Talento (si aplica)</li>
                  <li>Alertas de empleo y favoritos</li>
                  <li>Notificaciones asociadas</li>
                </ul>
              </div>
              <p className="text-sm font-semibold text-destructive">⚠️ Esta acción NO se puede deshacer.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCandidate}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Eliminando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
                    <path d="M216 48h-40v-8a24 24 0 0 0-24-24h-48a24 24 0 0 0-24 24v8H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16M96 40a8 8 0 0 1 8-8h48a8 8 0 0 1 8 8v8H96Zm96 168H64V64h128Zm-80-104v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0m48 0v64a8 8 0 0 1-16 0v-64a8 8 0 0 1 16 0"/>
                  </svg>
                  Sí, eliminar permanentemente
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
