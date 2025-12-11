import { ReactNode, useMemo, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { House, Briefcase, UserList, ClipboardText, Bell, SignOut, User, Users, Tag, Star, ChartBar, Images, Lightbulb, Moon, Sun } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { getUserPermissions, type UserPermission } from '@/services/userService'
import { NotificationBell } from './notifications/NotificationBell'
import { useTheme } from '@/hooks/useTheme'

interface LayoutProps {
  children: ReactNode
  currentView: string
  onNavigate: (view: string) => void
  onLogout: () => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: House, permission: 'dashboard' },
  { id: 'jobs', label: 'Ofertas', icon: Briefcase, permission: 'jobs' },
  { id: 'applications', label: 'Postulaciones', icon: UserList, permission: 'applications' },
  { id: 'evaluations', label: 'Evaluaciones', icon: ClipboardText, permission: 'evaluations' },
  { id: 'candidates', label: 'Candidatos', icon: User, permission: 'candidates' },
  { id: 'talent-bank', label: 'Banco de Talento', icon: Star, permission: 'talent-bank' },
  { id: 'notifications', label: 'Notificaciones', icon: Bell, permission: 'notifications' },
  { id: 'gallery', label: 'Galería', icon: Images, permission: 'gallery' },
  { id: 'metrics', label: 'Métricas', icon: ChartBar, permission: 'metrics' },
  { id: 'categories', label: 'Categorías', icon: Tag, permission: 'categories' },
  { id: 'skills', label: 'Habilidades', icon: Lightbulb, permission: 'skills' },
  { id: 'users', label: 'Usuarios', icon: Users, permission: 'users' }
]

// Definir permisos por rol
const rolePermissions: Record<string, Record<string, boolean>> = {
  super_admin: {
    all: true, // Super Admin tiene acceso a todo
  },
  admin: {
    dashboard: true,
    jobs: true,
    applications: true,
    evaluations: true,
    candidates: true,
    'talent-bank': true,
    notifications: true,
    gallery: true,
    metrics: true,
    categories: true,
    skills: true,
    users: false, // Admin NO puede gestionar usuarios
  },
  recruiter_admin: {
    dashboard: true,
    jobs: true,
    applications: true,
    evaluations: true,
    candidates: true,
    'talent-bank': true,
    notifications: true,
    gallery: false,
    metrics: true,
    categories: false,
    skills: false,
    users: false,
  },
  viewer: {
    dashboard: true,
    jobs: true,
    applications: true,
    evaluations: true,
    candidates: true,
    'talent-bank': true,
    notifications: true,
    gallery: false,
    metrics: true,
    categories: false,
    skills: false,
    users: false,
  },
}

export function Layout({ children, currentView, onNavigate, onLogout }: LayoutProps) {
  // Obtener rol del usuario desde localStorage
  const currentUser = useMemo(() => {
    const userStr = localStorage.getItem('admin_user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
    return null
  }, [])

  const userRole = currentUser?.role || 'viewer'
  const [customPermissions, setCustomPermissions] = useState<Record<string, UserPermission>>({})
  const [loadingPermissions, setLoadingPermissions] = useState(false)

  // Cargar permisos personalizados si el usuario tiene rol 'custom'
  useEffect(() => {
    const loadCustomPermissions = async () => {
      if (currentUser?.role === 'custom' && currentUser?.id) {
        setLoadingPermissions(true)
        try {
          const permissions = await getUserPermissions(currentUser.id)
          const permissionsMap: Record<string, UserPermission> = {}
          permissions.forEach(p => {
            permissionsMap[p.permission_key] = p
          })
          setCustomPermissions(permissionsMap)
        } catch (error) {
          // Silenciosamente manejar el error para no exponer información sensible
        } finally {
          setLoadingPermissions(false)
        }
      }
    }

    loadCustomPermissions()
  }, [currentUser?.role, currentUser?.id])

  // Función helper para verificar permisos
  const hasPermission = (role: string, permission: string): boolean => {
    // Si el usuario tiene rol 'custom', validar sus permisos personalizados
    if (role === 'custom') {
      const perm = customPermissions[permission]
      // Usuario debe tener al menos permiso de visualización
      return perm?.can_view === true
    }

    // Para roles predefinidos, usar la lógica anterior
    const permissions = rolePermissions[role]
    if (!permissions) return false
    if (permissions.all) return true
    return permissions[permission] === true
  }

  // Filtrar navItems según permisos
  const filteredNavItems = useMemo(() => {
    // Si es custom y aún está cargando, no mostrar nada
    if (userRole === 'custom' && loadingPermissions) {
      return []
    }
    return navItems.filter(item => hasPermission(userRole, item.permission))
  }, [userRole, customPermissions, loadingPermissions])

  // Redirigir automáticamente si el usuario no tiene permiso para la vista actual
  useEffect(() => {
    if (!loadingPermissions && filteredNavItems.length > 0) {
      const hasCurrentViewPermission = filteredNavItems.some(item => item.id === currentView)
      if (!hasCurrentViewPermission) {
        // Redirigir al primer módulo disponible
        onNavigate(filteredNavItems[0].id)
      }
    }
  }, [loadingPermissions, filteredNavItems, currentView, onNavigate])

  // Componente para toggle de tema
  const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme()
    
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="h-9 w-9"
        title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {theme === 'dark' ? (
          <Sun size={18} className="text-yellow-500" />
        ) : (
          <Moon size={18} className="text-blue-500" />
        )}
      </Button>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex md:w-64 md:flex-col bg-card border-r border-border">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-md">
              <Briefcase size={20} weight="duotone" className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Oportunidades Coosanjer</h2>
              <p className="text-xs text-muted-foreground">Panel Administrativo</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <nav className="flex-1 p-4 space-y-1">
          {loadingPermissions && userRole === 'custom' ? (
            // Skeleton mientras se cargan permisos
            <>
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="text-xs text-muted-foreground text-center mt-4 animate-pulse">
                Cargando permisos...
              </div>
            </>
          ) : (
            filteredNavItems.map(item => (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3 transition-all duration-200',
                  currentView === item.id && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary shadow-sm'
                )}
                onClick={() => onNavigate(item.id)}
              >
                <item.icon size={20} weight={currentView === item.id ? 'fill' : 'regular'} />
                {item.label}
              </Button>
            ))
          )}
        </nav>

        <Separator />
        
        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onLogout}
          >
            <SignOut size={20} />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header para desktop - con notificaciones */}
        <header className="hidden md:flex bg-card border-b border-border px-6 py-3 items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {filteredNavItems.find(item => item.id === currentView)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationBell onNavigate={onNavigate} />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-muted-foreground" />
              <span className="text-muted-foreground">{currentUser?.name || 'Usuario'}</span>
            </div>
          </div>
        </header>

        {/* Header móvil */}
        <header className="md:hidden bg-card border-b border-border p-3 sm:p-4 sticky top-0 z-40">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <Briefcase size={16} weight="duotone" className="text-primary-foreground" />
              </div>
              <h2 className="font-semibold text-sm sm:text-base truncate">Oportunidades Coosanjer</h2>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <ThemeToggle />
              <NotificationBell onNavigate={onNavigate} />
              <Button variant="ghost" size="sm" onClick={onLogout} className="h-8 w-8 p-0">
                <SignOut size={18} />
              </Button>
            </div>
          </div>
        </header>

        <div className="md:hidden border-b border-border bg-card sticky top-[57px] z-30 shadow-sm">
          <div className="flex overflow-x-auto p-2 gap-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {loadingPermissions && userRole === 'custom' ? (
              // Skeleton para móvil
              <>
                <Skeleton className="h-9 w-20 flex-shrink-0" />
                <Skeleton className="h-9 w-20 flex-shrink-0" />
                <Skeleton className="h-9 w-20 flex-shrink-0" />
                <Skeleton className="h-9 w-20 flex-shrink-0" />
              </>
            ) : (
              filteredNavItems.map(item => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn(
                    'flex-shrink-0 gap-1.5 h-9 px-3 text-xs sm:text-sm',
                    currentView === item.id && 'bg-primary/10 text-primary font-medium'
                  )}
                  onClick={() => onNavigate(item.id)}
                >
                  <item.icon size={16} weight={currentView === item.id ? 'fill' : 'regular'} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Button>
              ))
            )}
          </div>
        </div>

        <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
