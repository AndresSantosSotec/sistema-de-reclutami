import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { House, Briefcase, UserList, ClipboardText, Bell, SignOut, User } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
  currentView: string
  onNavigate: (view: string) => void
  onLogout: () => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: House },
  { id: 'jobs', label: 'Ofertas', icon: Briefcase },
  { id: 'applications', label: 'Postulaciones', icon: UserList },
  { id: 'evaluations', label: 'Evaluaciones', icon: ClipboardText },
  { id: 'candidates', label: 'Candidatos', icon: User },
  { id: 'notifications', label: 'Notificaciones', icon: Bell }
]

export function Layout({ children, currentView, onNavigate, onLogout }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex md:w-64 md:flex-col bg-card border-r border-border">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Briefcase size={20} weight="duotone" className="text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Panel Admin</h2>
              <p className="text-xs text-muted-foreground">Reclutamiento</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <Button
              key={item.id}
              variant={currentView === item.id ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3',
                currentView === item.id && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
              )}
              onClick={() => onNavigate(item.id)}
            >
              <item.icon size={20} weight={currentView === item.id ? 'fill' : 'regular'} />
              {item.label}
            </Button>
          ))}
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
        <header className="md:hidden bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Briefcase size={16} weight="duotone" className="text-primary-foreground" />
              </div>
              <h2 className="font-semibold">Panel Admin</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              <SignOut size={20} />
            </Button>
          </div>
        </header>

        <div className="md:hidden border-b border-border bg-card">
          <div className="flex overflow-x-auto p-2 gap-1">
            {navItems.map(item => (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'secondary' : 'ghost'}
                size="sm"
                className={cn(
                  'flex-shrink-0 gap-2',
                  currentView === item.id && 'bg-primary/10 text-primary'
                )}
                onClick={() => onNavigate(item.id)}
              >
                <item.icon size={16} weight={currentView === item.id ? 'fill' : 'regular'} />
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
