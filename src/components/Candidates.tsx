import { useState, useEffect, useMemo, memo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
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
  const [perPage, setPerPage] = useState(50)
  
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          
          {/* Paginación */}
          {pagination.last_page > 1 && (
            <div className="mt-6">
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

      <Sheet open={!!selectedCandidateId} onOpenChange={(open) => !open && setSelectedCandidateId(null)}>
        <SheetContent className="sm:max-w-2xl w-full max-w-full p-0 overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="p-6">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl">Perfil del Candidato</SheetTitle>
                <SheetDescription>
                  Información completa del candidato y sus postulaciones
                </SheetDescription>
              </SheetHeader>
              
              {!selectedCandidateDetail ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Cargando información del candidato...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header con foto y datos básicos */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                          {selectedCandidateDetail.foto_perfil ? (
                            <img 
                              src={selectedCandidateDetail.foto_perfil} 
                              alt={selectedCandidateDetail.nombre}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <User size={40} weight="duotone" className="text-primary" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="text-2xl font-bold">{selectedCandidateDetail.nombre}</h3>
                          {selectedCandidateDetail.profesion && (
                            <p className="text-lg text-muted-foreground">{selectedCandidateDetail.profesion}</p>
                          )}
                          {selectedCandidateDetail.ubicacion && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin size={16} />
                              <span>{selectedCandidateDetail.ubicacion}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información de contacto */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Envelope size={20} />
                        Información de Contacto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Envelope size={18} className="text-muted-foreground" />
                        <span>{selectedCandidateDetail.email}</span>
                      </div>
                      {selectedCandidateDetail.telefono && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone size={18} className="text-muted-foreground" />
                          <span>{selectedCandidateDetail.telefono}</span>
                        </div>
                      )}
                      {selectedCandidateDetail.linkedin && (
                        <div className="flex items-center gap-3 text-sm">
                          <LinkedinLogo size={18} className="text-muted-foreground" />
                          <a 
                            href={selectedCandidateDetail.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline"
                          >
                            Ver perfil de LinkedIn
                          </a>
                        </div>
                      )}
                      {selectedCandidateDetail.portfolio && (
                        <div className="flex items-center gap-3 text-sm">
                          <Globe size={18} className="text-muted-foreground" />
                          <a 
                            href={selectedCandidateDetail.portfolio} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline"
                          >
                            Ver portafolio
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Botón de Banco de Talento */}
                  <Button 
                    onClick={handleAddToTalentBank}
                    disabled={isInTalentBank || addingToTalentBank}
                    className="w-full gap-2"
                    variant={isInTalentBank ? "outline" : "default"}
                  >
                    <StarFour size={18} weight={isInTalentBank ? "fill" : "regular"} />
                    {isInTalentBank ? 'Ya está en el Banco de Talento' : 'Agregar al Banco de Talento'}
                  </Button>

                  <Separator />

                  {/* Biografía */}
                  {selectedCandidateDetail.bio && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText size={20} />
                          Acerca de
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedCandidateDetail.bio}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Experiencia Laboral */}
                  {selectedCandidateDetail.experiencia && selectedCandidateDetail.experiencia.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Briefcase size={20} />
                          Experiencia Laboral
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedCandidateDetail.experiencia.map((exp, index) => (
                          <div key={index} className="border-l-2 border-primary/20 pl-4 space-y-1">
                            <h4 className="font-semibold">{exp.puesto}</h4>
                            <p className="text-sm text-primary">{exp.empresa}</p>
                            <p className="text-xs text-muted-foreground">
                              {exp.fecha_inicio} - {exp.actualmente_trabajando ? 'Presente' : exp.fecha_fin}
                            </p>
                            {exp.descripcion && (
                              <p className="text-sm text-muted-foreground pt-2">{exp.descripcion}</p>
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Educación */}
                  {selectedCandidateDetail.educacion && selectedCandidateDetail.educacion.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <GraduationCap size={20} />
                          Educación
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedCandidateDetail.educacion.map((edu, index) => (
                          <div key={index} className="border-l-2 border-primary/20 pl-4 space-y-1">
                            <h4 className="font-semibold">{edu.titulo}</h4>
                            <p className="text-sm text-primary">{edu.institucion}</p>
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
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Star size={20} />
                          Habilidades
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedCandidateDetail.habilidades.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1">
                              <span className="font-medium">{skill.nombre}</span>
                              {skill.nivel && (
                                <span className="ml-2 text-xs text-muted-foreground">• {skill.nivel}</span>
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
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText size={20} />
                          Currículum Vitae
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{selectedCandidateDetail.cvs[0].nombre_archivo}</p>
                            <p className="text-xs text-muted-foreground">
                              Subido el {new Date(selectedCandidateDetail.cvs[0].fecha_subida).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(selectedCandidateDetail.cvs![0].url, '_blank')}
                          >
                            <DownloadSimple size={16} className="mr-2" />
                            Descargar CV
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tabs de Postulaciones */}
                  <Tabs defaultValue="postulaciones" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="postulaciones">Postulaciones</TabsTrigger>
                      <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
                      <TabsTrigger value="ia">IA</TabsTrigger>
                      <TabsTrigger value="psicometricas">Psicométricas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="postulaciones" className="space-y-4">
                      {selectedCandidateDetail.postulaciones.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          No hay postulaciones registradas
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-3">
                            {selectedCandidateDetail.postulaciones.map(post => (
                              <Card key={post.id}>
                                <CardContent className="pt-4">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-semibold text-lg">{post.oferta?.titulo || 'Oferta sin título'}</h4>
                                        <p className="text-sm text-muted-foreground">{post.oferta?.empresa || 'COOSANJER'}</p>
                                      </div>
                                      <Badge variant="outline">
                                        {post.estado}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar size={16} />
                                      <span>Aplicó el {new Date(post.fecha_postulacion).toLocaleDateString('es-ES', {
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

                    <TabsContent value="evaluaciones" className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Evaluaciones ({evaluations.length})</h4>
                        <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="gap-2">
                              <Plus size={16} />
                              Nueva Evaluación
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-3">
                            {evaluations.map((evaluation) => (
                              <Card key={evaluation.id}>
                                <CardContent className="pt-4">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-3">
                                        {evaluation.type === 'interview' ? (
                                          <VideoCamera size={24} className="text-primary" weight="duotone" />
                                        ) : (
                                          <Clipboard size={24} className="text-primary" weight="duotone" />
                                        )}
                                        <div>
                                          <h4 className="font-semibold">
                                            {evaluation.type === 'interview' ? 'Entrevista' :
                                             evaluation.type === 'technical-test' ? 'Prueba Técnica' :
                                             evaluation.type === 'psychometric' ? 'Prueba Psicológica' : 'Evaluación'}
                                          </h4>
                                          <p className="text-sm text-muted-foreground">
                                            {evaluation.mode === 'virtual' ? 'Virtual' : 
                                             evaluation.mode === 'in-person' ? 'Presencial' : evaluation.mode}
                                          </p>
                                        </div>
                                      </div>
                                      <Badge variant={evaluation.completedAt ? "default" : "outline"}>
                                        {evaluation.completedAt ? (
                                          <span className="flex items-center gap-1">
                                            <CheckCircle size={14} />
                                            Completada
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            Pendiente
                                          </span>
                                        )}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Calendar size={16} />
                                      <span>
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
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <UserCircle size={16} />
                                        <span>Responsable: {evaluation.interviewer}</span>
                                      </div>
                                    )}
                                    {evaluation.observations && (
                                      <p className="text-sm text-muted-foreground pt-2 border-t">
                                        {evaluation.observations}
                                      </p>
                                    )}
                                    {evaluation.result && (
                                      <div className="pt-2 border-t">
                                        <p className="text-sm font-medium mb-1">Resultado:</p>
                                        <p className="text-sm text-muted-foreground">{evaluation.result}</p>
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
                      <div className="text-center py-12">
                        <Brain size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
                        <p className="text-muted-foreground">
                          Análisis con IA no disponible
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Analiza el perfil del candidato con inteligencia artificial
                        </p>
                        <Button className="mt-4" variant="outline">
                          <Brain size={18} className="mr-2" />
                          Analizar Candidato
                        </Button>
                      </div>
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
        </SheetContent>
      </Sheet>
    </div>
  )
}
