# APPLICATIONS.TSX - CÓDIGO COMPLETO PARA COPIAR

**INSTRUCCIONES:**
1. Abre `src/components/Applications.tsx`
2. Selecciona TODO el contenido (Ctrl+A)
3. Elimínalo
4. Copia el código de abajo y pégalo en el archivo

---

## CÓDIGO COMPLETO:

```typescript
import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { MagnifyingGlass, FunnelSimple, User, Envelope, Phone, LinkedinLogo, Calendar, Download, Spinner } from '@phosphor-icons/react'
import { adminApplicationService, type AdminApplication, type AdminApplicationDetail } from '@/lib/adminApplicationService'
import { toast } from 'sonner'

// Mapeo de estados del backend (español) al frontend (inglés)
const estadoToStatus: Record<string, string> = {
  'Postulado': 'pending',
  'CV Visto': 'under-review',
  'En Proceso': 'interview-scheduled',
  'Finalista': 'technical-test',
  'Contratado': 'hired',
  'Rechazado': 'rejected'
}

const statusColors: Record<string, string> = {
  'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'under-review': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'interview-scheduled': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'technical-test': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'hired': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function Applications() {
  const [applications, setApplications] = useState<AdminApplication[]>([])
  const [selectedDetail, setSelectedDetail] = useState<AdminApplicationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [estadoFilter, setEstadoFilter] = useState<string>('all')
  const [jobFilter, setJobFilter] = useState<string>('all')
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Estado del selector
  const [newEstado, setNewEstado] = useState<AdminApplication['estado']>('Postulado')
  const [observaciones, setObservaciones] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Cargar postulaciones del backend
  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setIsLoading(true)
      const data = await adminApplicationService.getAllApplications()
      setApplications(data)
    } catch (error: any) {
      console.error('Error al cargar postulaciones:', error)
      toast.error('Error al cargar las postulaciones', {
        description: error.response?.data?.message || 'Verifica tu conexión'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar postulaciones
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = !searchTerm || 
        app.candidato.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidato.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.oferta.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesEstado = estadoFilter === 'all' || app.estado === estadoFilter
      const matchesJob = jobFilter === 'all' || app.oferta.id.toString() === jobFilter
      
      return matchesSearch && matchesEstado && matchesJob
    })
  }, [applications, searchTerm, estadoFilter, jobFilter])

  // Paginación
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)
  const paginatedApplications = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredApplications.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredApplications, currentPage])

  // Obtener ofertas únicas para el filtro
  const uniqueJobs = useMemo(() => {
    const jobsMap = new Map<number, { id: number; titulo: string }>()
    applications.forEach(app => {
      if (!jobsMap.has(app.oferta.id)) {
        jobsMap.set(app.oferta.id, app.oferta)
      }
    })
    return Array.from(jobsMap.values())
  }, [applications])

  // Ver detalles de una postulación
  const handleViewDetails = async (applicationId: number) => {
    try {
      setIsLoadingDetail(true)
      const detail = await adminApplicationService.getApplicationDetail(applicationId)
      setSelectedDetail(detail)
      setNewEstado(detail.estado)
      setObservaciones(detail.observaciones || '')
    } catch (error: any) {
      console.error('Error al cargar detalles:', error)
      toast.error('Error al cargar los detalles', {
        description: error.response?.data?.message || 'Intenta de nuevo'
      })
    } finally {
      setIsLoadingDetail(false)
    }
  }

  // Actualizar estado de postulación
  const handleStatusChange = async () => {
    if (!selectedDetail) return
    
    try {
      setIsSaving(true)
      await adminApplicationService.updateApplicationStatus(
        selectedDetail.id,
        newEstado,
        observaciones || undefined
      )
      
      // Actualizar en la lista local
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedDetail.id 
            ? { ...app, estado: newEstado, observaciones: observaciones || null }
            : app
        )
      )
      
      // Actualizar el detalle seleccionado
      setSelectedDetail(prev => 
        prev ? { ...prev, estado: newEstado, observaciones: observaciones || null } : null
      )
      
      toast.success('Estado actualizado correctamente')
    } catch (error: any) {
      console.error('Error al actualizar estado:', error)
      toast.error('Error al actualizar el estado', {
        description: error.response?.data?.message || 'Intenta de nuevo'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Descargar CV
  const handleDownloadCV = (cv: AdminApplication['cv']) => {
    if (cv && cv.url) {
      window.open(cv.url, '_blank')
    } else {
      toast.error('CV no disponible')
    }
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
                <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                  <SelectTrigger className="w-40">
                    <FunnelSimple size={16} className="mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Postulado">Postulado</SelectItem>
                    <SelectItem value="CV Visto">CV Visto</SelectItem>
                    <SelectItem value="En Proceso">En Proceso</SelectItem>
                    <SelectItem value="Finalista">Finalista</SelectItem>
                    <SelectItem value="Contratado">Contratado</SelectItem>
                    <SelectItem value="Rechazado">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Oferta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {uniqueJobs.map(job => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        {job.titulo.length > 20 ? job.titulo.slice(0, 20) + '...' : job.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size={32} className="animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Cargando postulaciones...</span>
            </div>
          ) : (
            <>
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
                  {paginatedApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        {applications.length === 0 
                          ? 'No hay postulaciones aún.' 
                          : 'No se encontraron postulaciones con los filtros aplicados.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedApplications.map((app) => {
                      const status = estadoToStatus[app.estado] || 'pending'
                      
                      return (
                        <TableRow key={app.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {app.candidato.foto_perfil ? (
                                <img 
                                  src={app.candidato.foto_perfil} 
                                  alt={app.candidato.nombre}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User size={20} weight="duotone" className="text-primary" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{app.candidato.nombre}</div>
                                <div className="text-sm text-muted-foreground">{app.candidato.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{app.oferta.titulo}</div>
                            <div className="text-sm text-muted-foreground">{app.oferta.empresa}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar size={16} />
                              {formatDate(app.fecha_postulacion)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[status]} variant="outline">
                              {app.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(app.id)}
                            >
                              Ver Detalles
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Sheet de detalles */}
      <Sheet open={!!selectedDetail} onOpenChange={(open) => !open && setSelectedDetail(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalles de la Postulación</SheetTitle>
            <SheetDescription>
              Información completa del candidato y su aplicación
            </SheetDescription>
          </SheetHeader>
          
          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size={32} className="animate-spin text-primary" />
            </div>
          ) : selectedDetail && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {selectedDetail.candidato.foto_perfil ? (
                    <img 
                      src={selectedDetail.candidato.foto_perfil} 
                      alt={selectedDetail.candidato.nombre}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={32} weight="duotone" className="text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold">{selectedDetail.candidato.nombre}</h3>
                    <p className="text-sm text-muted-foreground">{selectedDetail.candidato.profesion || 'Sin profesión especificada'}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <Envelope size={18} className="text-muted-foreground" />
                    <span>{selectedDetail.candidato.email}</span>
                  </div>
                  {selectedDetail.candidato.telefono && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone size={18} className="text-muted-foreground" />
                      <span>{selectedDetail.candidato.telefono}</span>
                    </div>
                  )}
                  {selectedDetail.candidato.linkedin && (
                    <div className="flex items-center gap-3 text-sm">
                      <LinkedinLogo size={18} className="text-muted-foreground" />
                      <a href={selectedDetail.candidato.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Ver perfil
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* CV */}
              {selectedDetail.cv && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Currículum Vitae</h4>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleDownloadCV(selectedDetail.cv)}
                  >
                    <Download size={16} className="mr-2" />
                    Descargar {selectedDetail.cv.nombre_archivo}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Subido el {formatDate(selectedDetail.cv.fecha_subida)}
                  </p>
                </div>
              )}

              {/* Oferta */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Oferta Aplicada</h4>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-medium">{selectedDetail.oferta.titulo}</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedDetail.oferta.empresa}</p>
                    <p className="text-sm text-muted-foreground">{selectedDetail.oferta.ubicacion}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Estado */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Estado de la Postulación</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Select value={newEstado} onValueChange={(value) => setNewEstado(value as AdminApplication['estado'])}>
                      <SelectTrigger id="estado">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Postulado">Postulado</SelectItem>
                        <SelectItem value="CV Visto">CV Visto</SelectItem>
                        <SelectItem value="En Proceso">En Proceso</SelectItem>
                        <SelectItem value="Finalista">Finalista</SelectItem>
                        <SelectItem value="Contratado">Contratado</SelectItem>
                        <SelectItem value="Rechazado">Rechazado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <Textarea
                      id="observaciones"
                      placeholder="Agrega comentarios sobre esta postulación..."
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleStatusChange}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Spinner size={16} className="mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Aplicó el {formatDate(selectedDetail.fecha_postulacion)}
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
```

---

## ¿QUÉ HACE ESTE CÓDIGO?

1. **Carga automática del backend**: Al montar el componente llama a `loadApplications()`
2. **Paginación de 10 items**: Variable `itemsPerPage = 10`
3. **Filtros en español**: Estados como "Postulado", "CV Visto", etc.
4. **Muestra fotos de perfil**: Si el candidato tiene `foto_perfil` la muestra, sino muestra avatar
5. **Descarga de CV**: Botón que abre el CV en nueva pestaña con `window.open(cv.url)`
6. **Actualización de estado**: Con textarea para observaciones
7. **Loading states**: Spinners mientras carga datos

## DESPUÉS DE COPIAR:

1. Guarda el archivo (Ctrl+S)
2. Verifica que no haya errores en la consola
3. El componente ya no recibe props, todo viene del backend
