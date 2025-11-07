import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartBar, TrendUp, Users, Clock, CheckCircle, Target, Calendar } from '@phosphor-icons/react'
import type { Application, JobOffer, RecruitmentMetrics } from '@/lib/types'
import { statusLabels } from '@/lib/constants'

interface MetricsProps {
  applications: Application[]
  jobs: JobOffer[]
}

export function Metrics({ applications, jobs }: MetricsProps) {
  const metrics = useMemo<RecruitmentMetrics>(() => {
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

    const applicationsByMonth = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const monthStr = month.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })
      const count = applications.filter(app => {
        const appDate = new Date(app.appliedAt)
        return appDate.getMonth() === month.getMonth() && appDate.getFullYear() === month.getFullYear()
      }).length
      return { month: monthStr, count }
    })

    const applicationsByStatus = Object.entries(
      applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    ).map(([status, count]) => ({
      status: statusLabels[status as keyof typeof statusLabels] || status,
      count
    }))

    const jobApplicationCounts = applications.reduce((acc, app) => {
      acc[app.jobId] = (acc[app.jobId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topJobs = Object.entries(jobApplicationCounts)
      .map(([jobId, count]) => ({
        jobTitle: jobs.find(j => j.id === jobId)?.title || 'Desconocido',
        applicationCount: count
      }))
      .sort((a, b) => b.applicationCount - a.applicationCount)
      .slice(0, 5)

    const hiredApplications = applications.filter(app => app.status === 'hired')
    const avgTimeToHire = hiredApplications.length > 0
      ? hiredApplications.reduce((sum, app) => {
          const appliedDate = new Date(app.appliedAt).getTime()
          const hiredDate = now.getTime()
          const daysDiff = (hiredDate - appliedDate) / (1000 * 60 * 60 * 24)
          return sum + daysDiff
        }, 0) / hiredApplications.length
      : 0

    const pendingCount = applications.filter(app => app.status === 'pending').length
    const interviewCount = applications.filter(app => app.status === 'interview-scheduled').length
    const hiredCount = hiredApplications.length

    const conversionRates = {
      pendingToInterview: pendingCount > 0 ? (interviewCount / pendingCount) * 100 : 0,
      interviewToHired: interviewCount > 0 ? (hiredCount / interviewCount) * 100 : 0
    }

    return {
      totalApplications: applications.length,
      applicationsByMonth,
      applicationsByStatus,
      topJobs,
      averageTimeToHire: Math.round(avgTimeToHire),
      conversionRates
    }
  }, [applications, jobs])

  const statCards = [
    {
      title: 'Total Postulaciones',
      value: metrics.totalApplications,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Todas las aplicaciones recibidas'
    },
    {
      title: 'Tiempo Promedio de Contratación',
      value: `${metrics.averageTimeToHire}d`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Días desde aplicación hasta contratación'
    },
    {
      title: 'Tasa de Conversión',
      value: `${metrics.conversionRates.interviewToHired.toFixed(1)}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Entrevistas que resultan en contratación'
    },
    {
      title: 'Ofertas Activas',
      value: jobs.filter(j => j.status === 'active').length,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Vacantes actualmente disponibles'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Métricas y Reportes</h1>
        <p className="text-muted-foreground mt-2">
          Indicadores clave de rendimiento del proceso de reclutamiento
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Postulaciones por Mes</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.applicationsByMonth.map((item, idx) => {
                const maxCount = Math.max(...metrics.applicationsByMonth.map(m => m.count))
                const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize">{item.month}</span>
                      <span className="text-muted-foreground">{item.count} aplicaciones</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Postulaciones</CardTitle>
            <CardDescription>Distribución por etapa del proceso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.applicationsByStatus.map((item, idx) => {
                const percentage = metrics.totalApplications > 0 
                  ? (item.count / metrics.totalApplications) * 100 
                  : 0
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.status}</span>
                      <span className="text-muted-foreground">
                        {item.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plazas Más Solicitadas</CardTitle>
          <CardDescription>Top 5 vacantes con más postulaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topJobs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay datos suficientes para mostrar
              </p>
            ) : (
              metrics.topJobs.map((job, idx) => {
                const maxCount = Math.max(...metrics.topJobs.map(j => j.applicationCount))
                const percentage = maxCount > 0 ? (job.applicationCount / maxCount) * 100 : 0
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-muted-foreground">#{idx + 1}</span>
                        <span className="font-medium">{job.jobTitle}</span>
                      </div>
                      <span className="text-muted-foreground">{job.applicationCount} aplicaciones</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasas de Conversión</CardTitle>
          <CardDescription>Eficiencia del proceso de selección</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Pendiente → Entrevista</span>
                <span className="text-2xl font-bold text-blue-600">
                  {metrics.conversionRates.pendingToInterview.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all"
                  style={{ width: `${metrics.conversionRates.pendingToInterview}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Entrevista → Contratado</span>
                <span className="text-2xl font-bold text-green-600">
                  {metrics.conversionRates.interviewToHired.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${metrics.conversionRates.interviewToHired}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
