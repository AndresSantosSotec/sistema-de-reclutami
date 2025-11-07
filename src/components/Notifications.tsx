import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Bell, PaperPlaneTilt, Clock, CheckCircle } from '@phosphor-icons/react'
import type { Notification, Candidate } from '@/lib/types'
import { formatDateTime } from '@/lib/constants'
import { toast } from 'sonner'

interface NotificationsProps {
  notifications: Notification[]
  candidates: Candidate[]
  onSendNotification: (notification: Omit<Notification, 'id' | 'sentAt'>) => void
}

export function Notifications({ notifications, candidates, onSendNotification }: NotificationsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    candidateId: '',
    subject: '',
    message: '',
    type: 'manual' as 'automatic' | 'manual'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.candidateId || !formData.subject || !formData.message) {
      toast.error('Por favor completa todos los campos')
      return
    }

    onSendNotification({
      ...formData,
      sentBy: 'admin@empresa.com'
    })
    
    toast.success('Notificación enviada correctamente')
    
    setFormData({
      candidateId: '',
      subject: '',
      message: '',
      type: 'manual'
    })
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Notificaciones</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona la comunicación con los candidatos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PaperPlaneTilt size={18} weight="bold" />
              Nueva Notificación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enviar Notificación</DialogTitle>
              <DialogDescription>
                Envía un mensaje personalizado a un candidato
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="candidate">Destinatario *</Label>
                <Select 
                  value={formData.candidateId} 
                  onValueChange={(value) => setFormData({ ...formData, candidateId: value })}
                >
                  <SelectTrigger id="candidate">
                    <SelectValue placeholder="Selecciona un candidato" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map(candidate => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.name} ({candidate.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Asunto *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Actualización sobre tu postulación"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Escribe tu mensaje aquí..."
                  rows={6}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Enviar Notificación
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
              <Bell size={20} weight="duotone" />
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Enviadas</p>
                  <p className="text-2xl font-semibold">{notifications.length}</p>
                </div>
                <CheckCircle size={32} weight="duotone" className="text-primary" />
              </div>
              <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Notificaciones Manuales</p>
                  <p className="text-2xl font-semibold">
                    {notifications.filter(n => n.type === 'manual').length}
                  </p>
                </div>
                <PaperPlaneTilt size={32} weight="duotone" className="text-accent" />
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Notificaciones Automáticas</p>
                  <p className="text-2xl font-semibold">
                    {notifications.filter(n => n.type === 'automatic').length}
                  </p>
                </div>
                <Clock size={32} weight="duotone" className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} weight="duotone" />
              Recientes
            </CardTitle>
            <CardDescription>
              Últimas notificaciones enviadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  No se han enviado notificaciones
                </p>
              ) : (
                notifications
                  .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                  .slice(0, 5)
                  .map(notification => {
                    const candidate = candidates.find(c => c.id === notification.candidateId)
                    return (
                      <div key={notification.id} className="border-l-2 border-primary pl-3 py-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{notification.subject}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              Para: {candidate?.name}
                            </p>
                          </div>
                          <Badge variant={notification.type === 'manual' ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                            {notification.type === 'manual' ? 'Manual' : 'Auto'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDateTime(notification.sentAt)}
                        </p>
                      </div>
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
            Todas las notificaciones enviadas a candidatos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidato</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha de Envío</TableHead>
                <TableHead>Enviado Por</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No hay notificaciones registradas
                  </TableCell>
                </TableRow>
              ) : (
                notifications
                  .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
                  .map(notification => {
                    const candidate = candidates.find(c => c.id === notification.candidateId)
                    return (
                      <TableRow key={notification.id}>
                        <TableCell className="font-medium">{candidate?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{notification.subject}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {notification.message}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={notification.type === 'manual' ? 'default' : 'secondary'}>
                            {notification.type === 'manual' ? 'Manual' : 'Automática'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDateTime(notification.sentAt)}</TableCell>
                        <TableCell className="text-muted-foreground">{notification.sentBy}</TableCell>
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
