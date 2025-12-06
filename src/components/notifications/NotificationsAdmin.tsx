import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  PaperPlaneTilt, 
  Clock, 
  CheckCircle, 
  MagnifyingGlass,
  EnvelopeSimple,
  UsersThree,
  Trash,
  CaretLeft,
  CaretRight,
  Spinner,
  Warning,
  CheckCircle as CheckIcon,
  X,
  FunnelSimple
} from '@phosphor-icons/react'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  adminNotificationService, 
  type AdminNotification, 
  type NotificationCandidate,
  type NotificationStats 
} from '@/lib/adminNotificationService'
import { useDebounce } from '../../hooks/useDebounce'

const NOTIFICATION_TYPES = [
  { value: 'Manual', label: 'Manual', color: 'bg-blue-100 text-blue-800' },
  { value: 'Sistema', label: 'Sistema', color: 'bg-gray-100 text-gray-800' },
  { value: 'Postulación', label: 'Postulación', color: 'bg-green-100 text-green-800' },
  { value: 'Recordatorio', label: 'Recordatorio', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Alerta', label: 'Alerta', color: 'bg-red-100 text-red-800' },
]

const getTypeColor = (tipo: string) => {
  const type = NOTIFICATION_TYPES.find(t => t.value === tipo)
  return type?.color || 'bg-gray-100 text-gray-800'
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function Notifications() {
  // Estados principales
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [candidates, setCandidates] = useState<NotificationCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [sending, setSending] = useState(false)

  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Filtros
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const debouncedSearch = useDebounce(search, 500)

  // Dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  
  // Form data para envío individual
  const [formData, setFormData] = useState({
    postulante_id: 0,
    titulo: '',
    mensaje: '',
    tipo: 'Manual' as const,
    enviar_email: true,
  })

  // Form data para envío masivo
  const [bulkFormData, setBulkFormData] = useState({
    postulante_ids: [] as number[],
    titulo: '',
    mensaje: '',
    tipo: 'Manual' as const,
    enviar_email: true,
  })

  // Búsqueda de candidatos
  const [candidateSearch, setCandidateSearch] = useState('')
  const debouncedCandidateSearch = useDebounce(candidateSearch, 300)

  // Cargar notificaciones
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const response = await adminNotificationService.getNotifications({
        page: currentPage,
        per_page: 15,
        tipo: filterType || undefined,
        search: debouncedSearch || undefined,
      })
      setNotifications(response.data)
      setTotalPages(response.pagination.last_page)
      setTotal(response.pagination.total)
    } catch (error: any) {
      console.error('Error al cargar notificaciones:', error)
      toast.error('Error al cargar notificaciones')
    } finally {
      setLoading(false)
    }
  }, [currentPage, filterType, debouncedSearch])

  // Cargar estadísticas
  const fetchStats = useCallback(async () => {
    try {
      const data = await adminNotificationService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }, [])

  // Cargar candidatos
  const fetchCandidates = useCallback(async (searchTerm?: string) => {
    try {
      setLoadingCandidates(true)
      const data = await adminNotificationService.getCandidates(searchTerm)
      setCandidates(data)
    } catch (error) {
      console.error('Error al cargar candidatos:', error)
      toast.error('Error al cargar candidatos')
    } finally {
      setLoadingCandidates(false)
    }
  }, [])

  // Efectos
  useEffect(() => {
    fetchNotifications()
    fetchStats()
  }, [fetchNotifications, fetchStats])

  useEffect(() => {
    if (isDialogOpen || isBulkDialogOpen) {
      fetchCandidates(debouncedCandidateSearch)
    }
  }, [isDialogOpen, isBulkDialogOpen, debouncedCandidateSearch, fetchCandidates])

  // Enviar notificación individual
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.postulante_id || !formData.titulo || !formData.mensaje) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    try {
      setSending(true)
      const response = await adminNotificationService.sendNotification(formData)
      
      toast.success(response.message, {
        description: response.data.email_sent 
          ? '✅ Email enviado correctamente' 
          : '⚠️ La notificación interna fue creada pero el email no pudo ser enviado',
      })

      setFormData({
        postulante_id: 0,
        titulo: '',
        mensaje: '',
        tipo: 'Manual',
        enviar_email: true,
      })
      setIsDialogOpen(false)
      fetchNotifications()
      fetchStats()
    } catch (error: any) {
      console.error('Error al enviar notificación:', error)
      toast.error(error.response?.data?.message || 'Error al enviar notificación')
    } finally {
      setSending(false)
    }
  }

  // Enviar notificación masiva
  const handleSendBulkNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (bulkFormData.postulante_ids.length === 0 || !bulkFormData.titulo || !bulkFormData.mensaje) {
      toast.error('Por favor completa todos los campos y selecciona al menos un candidato')
      return
    }

    try {
      setSending(true)
      const response = await adminNotificationService.sendBulkNotification(bulkFormData)
      
      toast.success(response.message, {
        description: `📧 ${response.data.emails_enviados} emails enviados de ${response.data.enviados} notificaciones`,
      })

      setBulkFormData({
        postulante_ids: [],
        titulo: '',
        mensaje: '',
        tipo: 'Manual',
        enviar_email: true,
      })
      setIsBulkDialogOpen(false)
      fetchNotifications()
      fetchStats()
    } catch (error: any) {
      console.error('Error al enviar notificaciones masivas:', error)
      toast.error(error.response?.data?.message || 'Error al enviar notificaciones')
    } finally {
      setSending(false)
    }
  }

  // Eliminar notificación
  const handleDeleteNotification = async (id: number) => {
    try {
      await adminNotificationService.deleteNotification(id)
      toast.success('Notificación eliminada')
      fetchNotifications()
      fetchStats()
    } catch (error) {
      toast.error('Error al eliminar notificación')
    }
  }

  // Toggle candidato en selección masiva
  const toggleCandidateSelection = (candidateId: number) => {
    setBulkFormData(prev => ({
      ...prev,
      postulante_ids: prev.postulante_ids.includes(candidateId)
        ? prev.postulante_ids.filter(id => id !== candidateId)
        : [...prev.postulante_ids, candidateId]
    }))
  }

  // Seleccionar/deseleccionar todos
  const toggleAllCandidates = () => {
    if (bulkFormData.postulante_ids.length === candidates.length) {
      setBulkFormData(prev => ({ ...prev, postulante_ids: [] }))
    } else {
      setBulkFormData(prev => ({ ...prev, postulante_ids: candidates.map(c => c.id) }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona la comunicación con los candidatos
          </p>
        </div>
        <div className="flex gap-2">
          {/* Botón Notificación Masiva */}
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <UsersThree size={18} weight="bold" />
                Envío Masivo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UsersThree size={24} weight="duotone" className="text-primary" />
                  Envío Masivo de Notificaciones
                </DialogTitle>
                <DialogDescription>
                  Envía un mensaje a múltiples candidatos a la vez
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendBulkNotification} className="flex-1 overflow-hidden flex flex-col">
                <Tabs defaultValue="recipients" className="flex-1 overflow-hidden flex flex-col">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="recipients">
                      1. Destinatarios ({bulkFormData.postulante_ids.length})
                    </TabsTrigger>
                    <TabsTrigger value="message">2. Mensaje</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="recipients" className="flex-1 overflow-hidden mt-4">
                    <div className="space-y-4 h-full flex flex-col">
                      {/* Búsqueda */}
                      <div className="relative">
                        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                          placeholder="Buscar candidatos..."
                          value={candidateSearch}
                          onChange={(e) => setCandidateSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      
                      {/* Seleccionar todos */}
                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={candidates.length > 0 && bulkFormData.postulante_ids.length === candidates.length}
                            onCheckedChange={toggleAllCandidates}
                          />
                          <span className="text-sm text-muted-foreground">
                            Seleccionar todos ({candidates.length})
                          </span>
                        </div>
                        {bulkFormData.postulante_ids.length > 0 && (
                          <Badge variant="secondary">
                            {bulkFormData.postulante_ids.length} seleccionados
                          </Badge>
                        )}
                      </div>
                      
                      {/* Lista de candidatos */}
                      <ScrollArea className="flex-1 border rounded-lg">
                        {loadingCandidates ? (
                          <div className="p-4 space-y-3">
                            {[...Array(5)].map((_, i) => (
                              <Skeleton key={i} className="h-14 w-full" />
                            ))}
                          </div>
                        ) : candidates.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground">
                            No se encontraron candidatos
                          </div>
                        ) : (
                          <div className="p-2 space-y-1">
                            {candidates.map(candidate => (
                              <label
                                key={candidate.id}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                  bulkFormData.postulante_ids.includes(candidate.id)
                                    ? 'bg-primary/10 border border-primary/20'
                                    : 'hover:bg-accent/50'
                                }`}
                              >
                                <Checkbox
                                  checked={bulkFormData.postulante_ids.includes(candidate.id)}
                                  onCheckedChange={() => toggleCandidateSelection(candidate.id)}
                                />
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={candidate.foto || undefined} />
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {getInitials(candidate.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{candidate.name}</p>
                                  <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="message" className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bulk-tipo">Tipo de Notificación</Label>
                      <Select 
                        value={bulkFormData.tipo} 
                        onValueChange={(value: any) => setBulkFormData({ ...bulkFormData, tipo: value })}
                      >
                        <SelectTrigger id="bulk-tipo">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NOTIFICATION_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bulk-titulo">Título / Asunto *</Label>
                      <Input
                        id="bulk-titulo"
                        value={bulkFormData.titulo}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, titulo: e.target.value })}
                        placeholder="Actualización importante"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bulk-mensaje">Mensaje *</Label>
                      <Textarea
                        id="bulk-mensaje"
                        value={bulkFormData.mensaje}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, mensaje: e.target.value })}
                        placeholder="Escribe tu mensaje aquí..."
                        rows={6}
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg">
                      <Switch
                        id="bulk-email"
                        checked={bulkFormData.enviar_email}
                        onCheckedChange={(checked) => setBulkFormData({ ...bulkFormData, enviar_email: checked })}
                      />
                      <div className="flex-1">
                        <Label htmlFor="bulk-email" className="cursor-pointer flex items-center gap-2">
                          <EnvelopeSimple size={18} />
                          Enviar también por correo electrónico
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Además de la notificación interna, se enviará un email a cada candidato
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <DialogFooter className="mt-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={sending || bulkFormData.postulante_ids.length === 0}
                    className="gap-2"
                  >
                    {sending ? (
                      <>
                        <Spinner className="animate-spin" size={18} />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <PaperPlaneTilt size={18} weight="bold" />
                        Enviar a {bulkFormData.postulante_ids.length} candidatos
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Botón Nueva Notificación */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PaperPlaneTilt size={18} weight="bold" />
                Nueva Notificación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bell size={24} weight="duotone" className="text-primary" />
                  Enviar Notificación
                </DialogTitle>
                <DialogDescription>
                  Envía un mensaje personalizado a un candidato. Se reflejará en su panel de notificaciones.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSendNotification} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="candidate">Destinatario *</Label>
                  <div className="relative mb-2">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                      placeholder="Buscar candidato..."
                      value={candidateSearch}
                      onChange={(e) => setCandidateSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select 
                    value={formData.postulante_id ? String(formData.postulante_id) : undefined} 
                    onValueChange={(value) => setFormData({ ...formData, postulante_id: Number(value) })}
                  >
                    <SelectTrigger id="candidate">
                      <SelectValue placeholder="Selecciona un candidato" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCandidates ? (
                        <div className="p-4 text-center">
                          <Spinner className="animate-spin mx-auto" size={24} />
                        </div>
                      ) : candidates.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                          No se encontraron candidatos
                        </div>
                      ) : (
                        candidates.filter(c => c.id).map(candidate => (
                          <SelectItem key={candidate.id} value={String(candidate.id)}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={candidate.foto || undefined} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(candidate.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{candidate.name}</span>
                              <span className="text-muted-foreground">({candidate.email})</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Notificación</Label>
                    <Select 
                      value={formData.tipo} 
                      onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger id="tipo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {NOTIFICATION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Título / Asunto *</Label>
                    <Input
                      id="subject"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Actualización sobre tu postulación"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje *</Label>
                  <Textarea
                    id="message"
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    placeholder="Escribe tu mensaje aquí..."
                    rows={6}
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-lg">
                  <Switch
                    id="send-email"
                    checked={formData.enviar_email}
                    onCheckedChange={(checked) => setFormData({ ...formData, enviar_email: checked })}
                  />
                  <div className="flex-1">
                    <Label htmlFor="send-email" className="cursor-pointer flex items-center gap-2">
                      <EnvelopeSimple size={18} />
                      Enviar también por correo electrónico
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Además de la notificación interna, se enviará un email al candidato
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={sending} className="gap-2">
                    {sending ? (
                      <>
                        <Spinner className="animate-spin" size={18} />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <PaperPlaneTilt size={18} weight="bold" />
                        Enviar Notificación
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Enviadas</p>
                <p className="text-3xl font-bold">{stats?.total || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell size={24} weight="duotone" className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Últimas 24h</p>
                <p className="text-3xl font-bold">{stats?.ultimas_24h || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Clock size={24} weight="duotone" className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Última Semana</p>
                <p className="text-3xl font-bold">{stats?.ultima_semana || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <PaperPlaneTilt size={24} weight="duotone" className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sin Leer</p>
                <p className="text-3xl font-bold">{stats?.sin_leer || 0}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <Warning size={24} weight="duotone" className="text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Tabla */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Historial de Notificaciones</CardTitle>
              <CardDescription>
                Todas las notificaciones enviadas a candidatos ({total} en total)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Select 
                value={filterType || 'all'} 
                onValueChange={(value) => {
                  setFilterType(value === 'all' ? '' : value)
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <FunnelSimple size={16} className="mr-2" />
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {NOTIFICATION_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
              <h3 className="text-lg font-semibold mb-2">No hay notificaciones</h3>
              <p className="text-muted-foreground">
                {search || filterType 
                  ? 'No se encontraron notificaciones con los filtros aplicados'
                  : 'Aún no has enviado ninguna notificación'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidato</TableHead>
                    <TableHead>Notificación</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {notifications.map((notification, index) => (
                      <motion.tr
                        key={notification.id_notificacion}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.03 }}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {notification.postulante?.user?.name 
                                  ? getInitials(notification.postulante.user.name)
                                  : '??'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {notification.postulante?.user?.name || 'N/A'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {notification.postulante?.user?.email || ''}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[300px]">
                            <p className="font-medium truncate">{notification.titulo}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {notification.mensaje}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(notification.tipo)}>
                            {notification.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {notification.leido ? (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              <CheckIcon size={12} className="mr-1" />
                              Leída
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                              <Clock size={12} className="mr-1" />
                              Pendiente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{format(new Date(notification.created_at), 'dd/MM/yyyy')}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNotification(notification.id_notificacion)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <Trash size={16} />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
