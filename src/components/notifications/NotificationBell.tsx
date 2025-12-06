import { useState, useEffect, useCallback } from 'react'
import { Bell, Check, CheckCircle, Trash, Eye, Briefcase, User, TestTube, FileText, Warning, Info } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { myNotificationsService, type MyNotification } from '@/lib/myNotificationsService'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface NotificationBellProps {
  onNavigate?: (view: string) => void
}

export function NotificationBell({ onNavigate }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<MyNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  // Cargar notificaciones
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const result = await myNotificationsService.getNotifications({ per_page: 10 })
      setNotifications(result.data)
      setUnreadCount(result.unread_count)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar solo el contador (para polling)
  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await myNotificationsService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Error al cargar contador:', error)
    }
  }, [])

  // Cargar al montar y hacer polling cada 30 segundos
  useEffect(() => {
    loadNotifications()
    
    const interval = setInterval(loadUnreadCount, 30000) // 30 segundos
    
    return () => clearInterval(interval)
  }, [loadNotifications, loadUnreadCount])

  // Recargar cuando se abre el dropdown
  useEffect(() => {
    if (open) {
      loadNotifications()
    }
  }, [open, loadNotifications])

  // Marcar como leída
  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await myNotificationsService.markAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error al marcar como leída:', error)
    }
  }

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      const result = await myNotificationsService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success(`Se marcaron ${result.marked_count} notificaciones como leídas`)
    } catch (error) {
      toast.error('Error al marcar todas como leídas')
    }
  }

  // Eliminar notificación
  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await myNotificationsService.deleteNotification(id)
      const wasUnread = notifications.find(n => n.id === id)?.read === false
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      toast.error('Error al eliminar notificación')
    }
  }

  // Navegar al hacer click en una notificación
  const handleNotificationClick = async (notification: MyNotification) => {
    // Marcar como leída si no lo está
    if (!notification.read) {
      await myNotificationsService.markAsRead(notification.id)
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    // Navegar según el tipo si hay callback
    if (onNavigate) {
      switch (notification.type) {
        case 'new_application':
          onNavigate('applications')
          break
        case 'candidate_registered':
        case 'test_completed':
        case 'evaluation_completed':
          onNavigate('candidates')
          break
        default:
          break
      }
    }

    setOpen(false)
  }

  // Obtener icono según el tipo
  const getIcon = (type: MyNotification['type']) => {
    switch (type) {
      case 'new_application':
        return <Briefcase size={18} weight="duotone" className="text-blue-600" />
      case 'candidate_registered':
        return <User size={18} weight="duotone" className="text-green-600" />
      case 'test_completed':
        return <TestTube size={18} weight="duotone" className="text-purple-600" />
      case 'evaluation_completed':
        return <FileText size={18} weight="duotone" className="text-orange-600" />
      case 'alert':
        return <Warning size={18} weight="duotone" className="text-red-600" />
      default:
        return <Info size={18} weight="duotone" className="text-gray-600" />
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} weight={unreadCount > 0 ? 'fill' : 'regular'} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-500"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell size={16} />
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} nueva{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleMarkAllAsRead}
            >
              <CheckCircle size={14} className="mr-1" />
              Marcar todas
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[400px]">
          {loading && notifications.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No tienes notificaciones</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-muted/50 ${
                  !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {notification.time_ago || formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            title="Marcar como leída"
                          >
                            <Check size={12} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleDelete(notification.id, e)}
                          title="Eliminar"
                        >
                          <Trash size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="justify-center text-primary cursor-pointer"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('notifications')
                }
                setOpen(false)
              }}
            >
              <Eye size={14} className="mr-2" />
              Ver todas las notificaciones
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
