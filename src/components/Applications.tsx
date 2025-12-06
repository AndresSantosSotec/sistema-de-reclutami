import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MagnifyingGlass, FunnelSimple, User, Envelope, Phone, LinkedinLogo, Calendar, CircleNotch, Briefcase, GraduationCap, Star, MapPin, FileText, Globe, Trash } from '@phosphor-icons/react'
import type { Application, CandidateStatus } from '@/lib/types'
import { statusLabels, statusColors, formatDate } from '@/lib/constants'
import { useApplications } from '@/hooks/useApplications'
import { adminApplicationService, AdminApplicationDetail } from '@/lib/adminApplicationService'

export function Applications() {
  const { 
    applications, 
    candidates, 
    jobs, 
    loading, 
    error,
    updateApplicationStatus 
  } = useApplications()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('all')
  const [jobFilter, setJobFilter] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [selectedApplicationDetail, setSelectedApplicationDetail] = useState<AdminApplicationDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [updating, setUpdating] = useState(false)

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const candidate = candidates.find(c => c.id === app.candidateId)
      const job = jobs.find(j => j.id === app.jobId)
      
      const matchesSearch = !searchTerm || 
        candidate?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job?.title.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      const matchesJob = jobFilter === 'all' || app.jobId === jobFilter
      
      return matchesSearch && matchesStatus && matchesJob
    })
  }, [applications, candidates, jobs, searchTerm, statusFilter, jobFilter])

  const selectedCandidate = selectedApplication 
    ? candidates.find(c => c.id === selectedApplication.candidateId)
    : null

  const selectedJob = selectedApplication
    ? jobs.find(j => j.id === selectedApplication.jobId)
    : null

  const handleViewDetails = async (app: Application) => {
    console.log('🔍 [DEBUG] handleViewDetails llamado con:', app)
    setSelectedApplication(app)
    setLoadingDetail(true)
    
    try {
      console.log('📡 [DEBUG] Solicitando detalles para ID:', Number(app.id))
      const detail = await adminApplicationService.getApplicationDetail(Number(app.id))
      console.log('✅ [DEBUG] Detalles recibidos:', detail)
      setSelectedApplicationDetail(detail)
    } catch (error) {
      console.error('❌ [ERROR] Error al cargar detalles:', error)
      toast.error('Error al cargar los detalles de la postulación')
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleCloseSheet = () => {
    setSelectedApplication(null)
    setSelectedApplicationDetail(null)
  }

  const handleStatusChange = async (applicationId: string, newStatus: CandidateStatus) => {
    try {
      setUpdating(true)
      await updateApplicationStatus(applicationId, newStatus)
      
      // Actualizar aplicación seleccionada si es la misma
      if (selectedApplication && selectedApplication.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus })
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar el estado')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta postulación? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      setUpdating(true)
      await adminApplicationService.deleteApplication(Number(applicationId))
      
      // Cerrar el modal si está abierto
      if (selectedApplication?.id === applicationId) {
        handleCloseSheet()
      }
      
      // Recargar la lista
      window.location.reload()
      
      toast.success('Postulación eliminada correctamente')
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar la postulación')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <CircleNotch size={48} className="animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando postulaciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Postulaciones</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona y revisa las candidaturas recibidas
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Todas las Postulaciones</CardTitle>
              <CardDescription>
                {filteredApplications.length} de {applications.length} postulación{applications.length !== 1 ? 'es' : ''}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar candidatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CandidateStatus | 'all')}>
                  <SelectTrigger className="w-40">
                    <FunnelSimple size={16} className="mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Postulado</SelectItem>
                    <SelectItem value="under-review">CV Visto</SelectItem>
                    <SelectItem value="interview-scheduled">En Proceso</SelectItem>
                    <SelectItem value="technical-test">Finalista</SelectItem>
                    <SelectItem value="hired">Contratado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Oferta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {jobs.map(job => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title.length > 20 ? job.title.slice(0, 20) + '...' : job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Vista de tabla para desktop */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidato</TableHead>
                  <TableHead>Oferta</TableHead>
                  <TableHead>Fecha de Aplicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      {applications.length === 0 
                        ? 'No hay postulaciones aún.' 
                        : 'No se encontraron postulaciones con los filtros aplicados.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => {
                    const candidate = candidates.find(c => c.id === app.candidateId)
                    const job = jobs.find(j => j.id === app.jobId)
                    
                    return (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User size={20} weight="duotone" className="text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{candidate?.name || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">{candidate?.email || 'N/A'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{job?.title || 'N/A'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar size={16} />
                            {formatDate(app.appliedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[app.status]} variant="outline">
                            {statusLabels[app.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(app)}
                            >
                              Ver Detalles
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteApplication(app.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
          </div>

          {/* Vista de cards para móvil */}
          <div className="md:hidden space-y-3">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {applications.length === 0 
                  ? 'No hay postulaciones aún.' 
                  : 'No se encontraron postulaciones con los filtros aplicados.'}
              </div>
            ) : (
              filteredApplications.map((app) => {
                const candidate = candidates.find(c => c.id === app.candidateId)
                const job = jobs.find(j => j.id === app.jobId)
                
                return (
                  <Card key={app.id} className="border-border/50">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User size={20} weight="duotone" className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm mb-1">{candidate?.name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground truncate">{candidate?.email || 'N/A'}</div>
                        </div>
                        <Badge className={`${statusColors[app.status]} text-xs flex-shrink-0`} variant="outline">
                          {statusLabels[app.status]}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Briefcase size={14} className="text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{job?.title || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar size={14} className="flex-shrink-0" />
                          {formatDate(app.appliedAt)}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(app)}
                          className="flex-1 text-xs h-8"
                        >
                          Ver Detalles
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteApplication(app.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                        >
                          <Trash size={16} />
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

      <Sheet open={!!selectedApplication} onOpenChange={(open) => !open && handleCloseSheet()}>
        <SheetContent className="sm:max-w-2xl w-full max-w-full p-0 overflow-y-auto">
          <ScrollArea className="h-full">
            <div className="p-6">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl">Detalles de la Postulación</SheetTitle>
                <SheetDescription>
                  Información completa del candidato y su aplicación
                </SheetDescription>
              </SheetHeader>
              
              {loadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <CircleNotch size={48} className="animate-spin text-primary" />
                </div>
              ) : selectedApplicationDetail ? (
                <div className="space-y-6">
                  {/* Header con foto y datos básicos */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                          {selectedApplicationDetail.candidato.foto_perfil ? (
                            <img 
                              src={selectedApplicationDetail.candidato.foto_perfil} 
                              alt={selectedApplicationDetail.candidato.nombre}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            <User size={40} weight="duotone" className="text-primary" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <h3 className="text-2xl font-bold">{selectedApplicationDetail.candidato.nombre}</h3>
                          {selectedApplicationDetail.candidato.profesion && (
                            <p className="text-lg text-muted-foreground">{selectedApplicationDetail.candidato.profesion}</p>
                          )}
                          {selectedApplicationDetail.candidato.ubicacion && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin size={16} />
                              <span>{selectedApplicationDetail.candidato.ubicacion}</span>
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
                        <span>{selectedApplicationDetail.candidato.email}</span>
                      </div>
                      {selectedApplicationDetail.candidato.telefono && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone size={18} className="text-muted-foreground" />
                          <span>{selectedApplicationDetail.candidato.telefono}</span>
                        </div>
                      )}
                      {selectedApplicationDetail.candidato.linkedin && (
                        <div className="flex items-center gap-3 text-sm">
                          <LinkedinLogo size={18} className="text-muted-foreground" />
                          <a 
                            href={selectedApplicationDetail.candidato.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline"
                          >
                            Ver perfil de LinkedIn
                          </a>
                        </div>
                      )}
                      {selectedApplicationDetail.candidato.portfolio && (
                        <div className="flex items-center gap-3 text-sm">
                          <Globe size={18} className="text-muted-foreground" />
                          <a 
                            href={selectedApplicationDetail.candidato.portfolio} 
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

                  {/* Biografía */}
                  {selectedApplicationDetail.candidato.bio && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText size={20} />
                          Acerca de
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedApplicationDetail.candidato.bio}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Experiencia Laboral */}
                  {selectedApplicationDetail.candidato.experiencia && selectedApplicationDetail.candidato.experiencia.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Briefcase size={20} />
                          Experiencia Laboral
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedApplicationDetail.candidato.experiencia.map((exp, index) => (
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
                  {selectedApplicationDetail.candidato.educacion && selectedApplicationDetail.candidato.educacion.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <GraduationCap size={20} />
                          Educación
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedApplicationDetail.candidato.educacion.map((edu, index) => (
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
                  {selectedApplicationDetail.candidato.habilidades && selectedApplicationDetail.candidato.habilidades.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Star size={20} />
                          Habilidades
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplicationDetail.candidato.habilidades.map((skill, index) => (
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

                  {/* Oferta Aplicada */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Oferta Aplicada</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-lg">{selectedApplicationDetail.oferta.titulo}</h4>
                        <p className="text-sm text-muted-foreground">{selectedApplicationDetail.oferta.empresa}</p>
                      </div>
                      {selectedApplicationDetail.oferta.ubicacion && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin size={16} />
                          <span>{selectedApplicationDetail.oferta.ubicacion}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{selectedApplicationDetail.oferta.tipo_empleo}</Badge>
                        {selectedApplicationDetail.oferta.salario_min && selectedApplicationDetail.oferta.salario_max && (
                          <Badge variant="secondary">
                            Q{selectedApplicationDetail.oferta.salario_min.toLocaleString()} - Q{selectedApplicationDetail.oferta.salario_max.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* CV */}
                  {selectedApplicationDetail.cv && (
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
                            <p className="font-medium">{selectedApplicationDetail.cv.nombre_archivo}</p>
                            <p className="text-xs text-muted-foreground">
                              Subido el {new Date(selectedApplicationDetail.cv.fecha_subida).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(selectedApplicationDetail.cv!.url, '_blank')}
                          >
                            <FileText size={16} className="mr-2" />
                            Ver CV
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Separator />

                  {/* Estado de la Postulación */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Estado de la Postulación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Select 
                        value={selectedApplication?.status} 
                        onValueChange={(value) => selectedApplication && handleStatusChange(selectedApplication.id, value as CandidateStatus)}
                        disabled={updating}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Postulado</SelectItem>
                          <SelectItem value="under-review">CV Visto</SelectItem>
                          <SelectItem value="interview-scheduled">En Proceso</SelectItem>
                          <SelectItem value="technical-test">Finalista</SelectItem>
                          <SelectItem value="hired">Contratado</SelectItem>
                          <SelectItem value="rejected">Rechazado</SelectItem>
                        </SelectContent>
                      </Select>
                      {updating && (
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <CircleNotch size={12} className="animate-spin" />
                          Actualizando estado...
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={16} />
                        <span>Aplicó el {formatDate(selectedApplicationDetail.fecha_postulacion)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Observaciones */}
                  {selectedApplicationDetail.observaciones && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notas del Reclutador</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{selectedApplicationDetail.observaciones}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Botón de eliminar */}
                  <Card className="border-destructive/50">
                    <CardContent className="pt-6">
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => selectedApplication && handleDeleteApplication(selectedApplication.id)}
                        disabled={updating}
                      >
                        <Trash size={16} className="mr-2" />
                        Eliminar Postulación
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Esta acción no se puede deshacer
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : selectedCandidate && selectedJob && selectedApplication && (
                <div className="mt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User size={32} weight="duotone" className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedCandidate.name}</h3>
                        <p className="text-sm text-muted-foreground">ID: {selectedCandidate.id.slice(0, 8)}</p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-3 text-sm">
                        <Envelope size={18} className="text-muted-foreground" />
                        <span>{selectedCandidate.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone size={18} className="text-muted-foreground" />
                        <span>{selectedCandidate.phone}</span>
                      </div>
                      {selectedCandidate.linkedin && (
                        <div className="flex items-center gap-3 text-sm">
                          <LinkedinLogo size={18} className="text-muted-foreground" />
                          <a href={selectedCandidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Ver perfil
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium">Oferta Aplicada</h4>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="font-medium">{selectedJob.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{selectedJob.location}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium">Estado de la Postulación</h4>
                    <Select 
                      value={selectedApplication.status} 
                      onValueChange={(value) => handleStatusChange(selectedApplication.id, value as CandidateStatus)}
                      disabled={updating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Postulado</SelectItem>
                        <SelectItem value="under-review">CV Visto</SelectItem>
                        <SelectItem value="interview-scheduled">En Proceso</SelectItem>
                        <SelectItem value="technical-test">Finalista</SelectItem>
                        <SelectItem value="hired">Contratado</SelectItem>
                        <SelectItem value="rejected">Rechazado</SelectItem>
                      </SelectContent>
                    </Select>
                    {updating && (
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <CircleNotch size={12} className="animate-spin" />
                        Actualizando estado...
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Aplicó el {formatDate(selectedApplication.appliedAt)}
                    </p>
                  </div>

                  {selectedApplication.notes && (
                    <div className="space-y-3 pt-4 border-t">
                      <h4 className="font-medium">Notas</h4>
                      <p className="text-sm text-muted-foreground">{selectedApplication.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}