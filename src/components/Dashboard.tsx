import { useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartBar, Users, CalendarCheck, Briefcase, TrendUp, Clock } from '@phosphor-icons/react'
import type { Application, JobOffer, Evaluation } from '@/lib/types'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatDate, daysUntilDeadline } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'

interface DashboardProps {
  applications: Application[]
  jobs: JobOffer[]
  evaluations: Evaluation[]
}

export function Dashboard({ applications, jobs, evaluations }: DashboardProps) {
  // 🔍 DEBUG: Log de datos recibidos
  useEffect(() => {
    console.log('📊 [Dashboard] Datos recibidos:', {
      jobs: jobs.length,
      applications: applications.length,
      evaluations: evaluations.length,
      jobsActivas: jobs.filter(j => j.status === 'active').length,
      jobsList: jobs.map(j => ({ id: j.id, title: j.title, status: j.status }))
    })
  }, [applications, jobs, evaluations])

  const metrics = useMemo(() => {
    const activeJobs = jobs.filter(j => j.status === 'active').length
    const totalApplications = applications.length
    const pendingInterviews = evaluations.filter(e => !e.completedAt).length
    const hired = applications.filter(a => a.status === 'hired').length
    const recentApps = applications.filter(a => {
      const daysDiff = (new Date().getTime() - new Date(a.appliedAt).getTime()) / (1000 * 60 * 60 * 24)
      return daysDiff <= 7
    }).length

    console.log('📈 [Dashboard] Métricas calculadas:', {
      activeJobs,
      totalApplications,
      pendingInterviews,
      hired,
      recentApps
    })

    return {
      activeJobs,
      totalApplications,
      pendingInterviews,
      hired,
      recentApps
    }
  }, [applications, jobs, evaluations])

  const alerts = useMemo(() => {
    const alerts: Array<{ type: 'warning' | 'info'; message: string }> = []
    
    const expiringJobs = jobs.filter(j => {
      const days = daysUntilDeadline(j.deadline)
      return j.status === 'active' && days <= 7 && days > 0
    })
    
    if (expiringJobs.length > 0) {
      alerts.push({
        type: 'warning',
        message: `${expiringJobs.length} oferta(s) próxima(s) a vencer en los próximos 7 días`
      })
    }

    const pendingReviews = applications.filter(a => a.status === 'pending').length
    if (pendingReviews > 10) {
      alerts.push({
        type: 'info',
        message: `${pendingReviews} postulaciones pendientes de revisión`
      })
    }

    return alerts
  }, [jobs, applications])

  const statCards = [
    {
      title: 'Ofertas Activas',
      value: metrics.activeJobs,
      icon: Briefcase,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Total Postulaciones',
      value: metrics.totalApplications,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Entrevistas Pendientes',
      value: metrics.pendingInterviews,
      icon: CalendarCheck,
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Candidatos Contratados',
      value: metrics.hired,
      icon: ChartBar,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    }
  ]

  const recentApplicationsList = applications
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visión general del proceso de reclutamiento
        </p>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <Alert key={idx} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
              <Clock size={18} weight="duotone" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={20} weight="duotone" className={stat.color} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp size={20} weight="duotone" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                <div className="text-3xl font-semibold text-primary">{metrics.recentApps}</div>
                <div className="text-sm text-muted-foreground">
                  Nuevas postulaciones en los últimos 7 días
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock size={20} weight="duotone" />
              Postulaciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentApplicationsList.length > 0 ? (
                recentApplicationsList.map((app) => (
                  <div key={app.id} className="flex items-center justify-between text-sm border-l-2 border-primary pl-3 py-1">
                    <span className="font-medium">Postulación #{app.id.slice(0, 8)}</span>
                    <Badge variant="outline">{formatDate(app.appliedAt)}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay postulaciones recientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
