import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  ChartBar, 
  TrendUp, 
  Users, 
  Clock, 
  CheckCircle, 
  Target, 
  Calendar,
  FilePdf,
  FileXls,
  MapPin,
  Briefcase,
  Star,
  Gear
} from '@phosphor-icons/react'
import { metricsService, type MetricsData } from '@/lib/metricsService'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type TimeRange = '3' | '6' | '12' | 'custom'

interface ReportOptions {
  overview: boolean
  applications: boolean
  jobs: boolean
  candidates: boolean
  timeToHire: boolean
  topJobs: boolean
  topCategories: boolean
  conversionRates: boolean
  applicationsByMonth: boolean
  applicationsByStatus: boolean
  geographicDistribution: boolean
  hiringTrends: boolean
}

export function Metrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('6')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null)
  const [showExcelOptions, setShowExcelOptions] = useState(false)
  const [showReportTypeDialog, setShowReportTypeDialog] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState<string>('resumen')
  const [availableReportTypes, setAvailableReportTypes] = useState<Record<string, string>>({})
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    overview: true,
    applications: true,
    jobs: true,
    candidates: true,
    timeToHire: true,
    topJobs: true,
    topCategories: true,
    conversionRates: true,
    applicationsByMonth: true,
    applicationsByStatus: true,
    geographicDistribution: true,
    hiringTrends: true,
  })

  // Cargar tipos de reportes disponibles
  useEffect(() => {
    const loadReportTypes = async () => {
      try {
        const types = await metricsService.getReportTypes()
        setAvailableReportTypes(types)
      } catch (error) {
        console.error('Error al cargar tipos de reportes:', error)
        // Valores por defecto - no mostrar error al usuario
        setAvailableReportTypes({
          resumen: 'Resumen Ejecutivo',
          detallado: 'Reporte Detallado',
          ejecutivo: 'Reporte Ejecutivo',
        })
      }
    }
    loadReportTypes()
  }, [])

  // Cargar métricas del backend
  useEffect(() => {
    loadMetrics()
  }, [timeRange, startDate, endDate])

  const loadMetrics = useCallback(async () => {
    // Si es rango personalizado pero faltan fechas, no cargar
    if (timeRange === 'custom' && (!startDate || !endDate)) {
      return
    }
    
    setLoading(true)
    try {
      const months = timeRange === 'custom' ? 0 : parseInt(timeRange)
      const start = timeRange === 'custom' ? startDate : undefined
      const end = timeRange === 'custom' ? endDate : undefined
      
      const data = await metricsService.getMetrics(months, start, end)
      setMetrics(data)
    } catch (error: any) {
      console.error('Error al cargar métricas:', error)
      toast.error('Error al cargar las métricas. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }, [timeRange, startDate, endDate])

  // Función para exportar reportes
  const handleExportReport = useCallback(async (format: 'pdf' | 'excel', options?: ReportOptions, reportType?: string) => {
    setExporting(format)
    try {
      const formatNames = {
        pdf: 'PDF',
        excel: 'Excel'
      }
      
      const months = timeRange === 'custom' ? 0 : parseInt(timeRange)
      const start = timeRange === 'custom' ? startDate : undefined
      const end = timeRange === 'custom' ? endDate : undefined
      const type = reportType || selectedReportType
      
      toast.info(`Generando reporte ${formatNames[format]} (${availableReportTypes[type] || type})...`)
      const blob = await metricsService.exportReport(format, months, start, end, options, type)

      // Descargar el archivo directamente
      if (!blob || blob.size === 0) {
        throw new Error('El archivo exportado está vacío o es inválido.')
      }

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const extension = format === 'pdf' ? 'pdf' : 'xls'
      link.download = `reporte_metricas_${new Date().toISOString().split('T')[0]}.${extension}`
      link.click()
      window.URL.revokeObjectURL(url)
      toast.success(`Reporte ${formatNames[format]} generado y descargado correctamente`)
    } catch (error: any) {
      console.error('Error al exportar reporte:', error)
      toast.error(error.message || 'Error al generar el reporte. Intenta nuevamente.')
    } finally {
      setExporting(null)
    }
  }, [timeRange, startDate, endDate])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando métricas...</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No se pudieron cargar las métricas</p>
        <Button onClick={loadMetrics} className="mt-4">
          Reintentar
        </Button>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Postulaciones',
      value: metrics.overview.total_applications.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'En el período seleccionado'
    },
    {
      title: 'Ofertas Activas',
      value: metrics.overview.active_jobs.toLocaleString(),
      icon: Briefcase,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Vacantes disponibles'
    },
    {
      title: 'Total Candidatos',
      value: metrics.overview.total_candidates.toLocaleString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'En la base de datos'
    },
    {
      title: 'Tiempo Promedio de Contratación',
      value: `${Math.round(metrics.time_to_hire.average_days)}d`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Días desde aplicación hasta contratación'
    },
    {
      title: 'Candidatos Contratados',
      value: metrics.overview.hired_candidates.toLocaleString(),
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'En el período seleccionado'
    },
    {
      title: 'Banco de Talento',
      value: metrics.overview.talent_bank_candidates.toLocaleString(),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Candidatos destacados'
    },
    {
      title: 'Tasa de Conversión',
      value: `${metrics.conversion_rates.to_hired.toFixed(1)}%`,
      icon: Target,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Postulaciones que resultan en contratación'
    },
    {
      title: 'Promedio por Día',
      value: metrics.applications.average_per_day.toFixed(1),
      icon: TrendUp,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      description: 'Postulaciones diarias promedio'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header con selector de período y botones de exportación */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Métricas y Reportes</h1>
            <p className="text-muted-foreground mt-2">
              Indicadores clave de rendimiento del proceso de reclutamiento
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={showExcelOptions} onOpenChange={setShowExcelOptions}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={!!exporting}
                >
                  <FileXls size={18} />
                  {exporting === 'excel' ? 'Generando...' : 'Excel'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Gear size={20} />
                    Opciones del Reporte Excel
                  </DialogTitle>
                  <DialogDescription>
                    Selecciona qué información deseas incluir en el reporte Excel
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="overview"
                      checked={reportOptions.overview}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, overview: !!checked })
                      }
                    />
                    <Label htmlFor="overview" className="cursor-pointer">
                      Resumen General
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="applications"
                      checked={reportOptions.applications}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, applications: !!checked })
                      }
                    />
                    <Label htmlFor="applications" className="cursor-pointer">
                      Métricas de Postulaciones
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="jobs"
                      checked={reportOptions.jobs}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, jobs: !!checked })
                      }
                    />
                    <Label htmlFor="jobs" className="cursor-pointer">
                      Métricas de Ofertas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="candidates"
                      checked={reportOptions.candidates}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, candidates: !!checked })
                      }
                    />
                    <Label htmlFor="candidates" className="cursor-pointer">
                      Métricas de Candidatos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="timeToHire"
                      checked={reportOptions.timeToHire}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, timeToHire: !!checked })
                      }
                    />
                    <Label htmlFor="timeToHire" className="cursor-pointer">
                      Tiempo de Contratación
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="topJobs"
                      checked={reportOptions.topJobs}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, topJobs: !!checked })
                      }
                    />
                    <Label htmlFor="topJobs" className="cursor-pointer">
                      Top Ofertas
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="topCategories"
                      checked={reportOptions.topCategories}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, topCategories: !!checked })
                      }
                    />
                    <Label htmlFor="topCategories" className="cursor-pointer">
                      Top Categorías
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="conversionRates"
                      checked={reportOptions.conversionRates}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, conversionRates: !!checked })
                      }
                    />
                    <Label htmlFor="conversionRates" className="cursor-pointer">
                      Tasas de Conversión
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="applicationsByMonth"
                      checked={reportOptions.applicationsByMonth}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, applicationsByMonth: !!checked })
                      }
                    />
                    <Label htmlFor="applicationsByMonth" className="cursor-pointer">
                      Postulaciones por Mes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="applicationsByStatus"
                      checked={reportOptions.applicationsByStatus}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, applicationsByStatus: !!checked })
                      }
                    />
                    <Label htmlFor="applicationsByStatus" className="cursor-pointer">
                      Postulaciones por Estado
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="geographicDistribution"
                      checked={reportOptions.geographicDistribution}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, geographicDistribution: !!checked })
                      }
                    />
                    <Label htmlFor="geographicDistribution" className="cursor-pointer">
                      Distribución Geográfica
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hiringTrends"
                      checked={reportOptions.hiringTrends}
                      onCheckedChange={(checked) =>
                        setReportOptions({ ...reportOptions, hiringTrends: !!checked })
                      }
                    />
                    <Label htmlFor="hiringTrends" className="cursor-pointer">
                      Tendencias de Contratación
                    </Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowExcelOptions(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      setShowExcelOptions(false)
                      handleExportReport('excel', reportOptions, 'resumen')
                    }}
                    disabled={!!exporting}
                  >
                    Generar Reporte
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={showReportTypeDialog} onOpenChange={setShowReportTypeDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={!!exporting}
                >
                  <FilePdf size={18} />
                  {exporting === 'pdf' ? 'Generando...' : 'PDF'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FilePdf size={20} />
                    Seleccionar Tipo de Reporte PDF
                  </DialogTitle>
                  <DialogDescription>
                    Elige el tipo de reporte que deseas generar
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-4">
                  {Object.entries(availableReportTypes).map(([key, label]) => (
                    <div
                      key={key}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedReportType === key
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-accent'
                      }`}
                      onClick={() => setSelectedReportType(key)}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedReportType === key
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {selectedReportType === key && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                      <Label className="cursor-pointer flex-1">{label}</Label>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowReportTypeDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => {
                      setShowReportTypeDialog(false)
                      handleExportReport('pdf', undefined, selectedReportType)
                    }}
                    disabled={!!exporting}
                  >
                    Generar Reporte
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Filtros de fecha y temporalidad */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar size={20} />
              Filtros de Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="timeRange">Temporalidad</Label>
                <Select 
                  value={timeRange} 
                  onValueChange={(value) => {
                    const newTimeRange = value as TimeRange
                    setTimeRange(newTimeRange)
                    if (newTimeRange !== 'custom') {
                      setStartDate('')
                      setEndDate('')
                    }
                  }}
                >
                  <SelectTrigger id="timeRange" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Últimos 3 meses</SelectItem>
                    <SelectItem value="6">Últimos 6 meses</SelectItem>
                    <SelectItem value="12">Últimos 12 meses</SelectItem>
                    <SelectItem value="custom">Rango personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {timeRange === 'custom' && (
                <>
                  <div className="flex-1">
                    <Label htmlFor="startDate">Fecha Inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={endDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="endDate">Fecha Fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </>
              )}
            </div>
            {timeRange === 'custom' && (!startDate || !endDate) && (
              <p className="text-sm text-muted-foreground mt-2">
                Selecciona ambas fechas para aplicar el filtro personalizado. Las métricas se cargarán automáticamente cuando ambas fechas estén seleccionadas.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tarjetas de métricas principales */}
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

      {/* Gráficos y visualizaciones */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Postulaciones por Mes</CardTitle>
            <CardDescription>
              {timeRange === 'custom' 
                ? `${startDate && endDate ? `${new Date(startDate).toLocaleDateString('es-ES')} - ${new Date(endDate).toLocaleDateString('es-ES')}` : 'Período personalizado'}`
                : `Últimos ${timeRange} meses`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.applications_by_month.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay datos para mostrar
                </p>
              ) : (
                metrics.applications_by_month.map((item, idx) => {
                  const maxCount = Math.max(...metrics.applications_by_month.map(m => m.count))
                  const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.month_name}</span>
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
                })
              )}
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
              {metrics.applications_by_status.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay datos para mostrar
                </p>
              ) : (
                metrics.applications_by_status.map((item, idx) => {
                  const total = metrics.applications_by_status.reduce((sum, s) => sum + s.count, 0)
                  const percentage = total > 0 ? (item.count / total) * 100 : 0
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
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Ofertas y Categorías */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plazas Más Solicitadas</CardTitle>
            <CardDescription>Top 10 vacantes con más postulaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.top_jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay datos suficientes para mostrar
                </p>
              ) : (
                metrics.top_jobs.map((job, idx) => {
                  const maxCount = Math.max(...metrics.top_jobs.map(j => j.applications_count))
                  const percentage = maxCount > 0 ? (job.applications_count / maxCount) * 100 : 0
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="font-bold text-muted-foreground">#{idx + 1}</span>
                          <span className="font-medium truncate">{job.title}</span>
                        </div>
                        <span className="text-muted-foreground whitespace-nowrap ml-2">
                          {job.applications_count} aplicaciones
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Briefcase size={12} />
                        <span className="truncate">{job.company}</span>
                        {job.location && (
                          <>
                            <span>•</span>
                            <MapPin size={12} />
                            <span className="truncate">{job.location}</span>
                          </>
                        )}
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
            <CardTitle>Categorías Más Solicitadas</CardTitle>
            <CardDescription>Top 10 categorías con más postulaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.top_categories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay datos suficientes para mostrar
                </p>
              ) : (
                metrics.top_categories.map((category, idx) => {
                  const maxCount = Math.max(...metrics.top_categories.map(c => c.total))
                  const percentage = maxCount > 0 ? (category.total / maxCount) * 100 : 0
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-muted-foreground">#{idx + 1}</span>
                          <span className="font-medium">{category.nombre}</span>
                        </div>
                        <span className="text-muted-foreground">{category.total} postulaciones</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-accent to-primary h-3 rounded-full transition-all"
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
      </div>

      {/* Tasas de Conversión y Tiempo de Contratación */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasas de Conversión</CardTitle>
            <CardDescription>Eficiencia del proceso de selección</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Postulado → CV Visto</span>
                  <span className="text-xl font-bold text-blue-600">
                    {metrics.conversion_rates.to_cv_viewed.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(metrics.conversion_rates.to_cv_viewed, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Postulado → En Proceso</span>
                  <span className="text-xl font-bold text-purple-600">
                    {metrics.conversion_rates.to_in_process.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className="bg-purple-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(metrics.conversion_rates.to_in_process, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Postulado → Finalista</span>
                  <span className="text-xl font-bold text-indigo-600">
                    {metrics.conversion_rates.to_finalist.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className="bg-indigo-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(metrics.conversion_rates.to_finalist, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Postulado → Contratado</span>
                  <span className="text-xl font-bold text-green-600">
                    {metrics.conversion_rates.to_hired.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(metrics.conversion_rates.to_hired, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tasa de Rechazo</span>
                  <span className="text-xl font-bold text-red-600">
                    {metrics.conversion_rates.rejection_rate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(metrics.conversion_rates.rejection_rate, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tiempo de Contratación</CardTitle>
            <CardDescription>Estadísticas de tiempo desde aplicación hasta contratación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-muted-foreground">Promedio</div>
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(metrics.time_to_hire.average_days)} días
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xs text-muted-foreground">Mínimo</div>
                  <div className="text-xl font-bold text-purple-600">
                    {metrics.time_to_hire.min_days} días
                  </div>
                </div>
                <div className="text-center p-3 bg-indigo-50 rounded-lg">
                  <div className="text-xs text-muted-foreground">Mediana</div>
                  <div className="text-xl font-bold text-indigo-600">
                    {Math.round(metrics.time_to_hire.median_days)} días
                  </div>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded-lg">
                  <div className="text-xs text-muted-foreground">Máximo</div>
                  <div className="text-xl font-bold text-pink-600">
                    {metrics.time_to_hire.max_days} días
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Total de contrataciones analizadas: <strong>{metrics.time_to_hire.total_hired}</strong>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución Geográfica */}
      {metrics.geographic_distribution && metrics.geographic_distribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribución Geográfica</CardTitle>
            <CardDescription>Top 10 ubicaciones de candidatos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {metrics.geographic_distribution.map((item, idx) => (
                <div key={idx} className="p-4 border rounded-lg text-center">
                  <MapPin size={24} className="mx-auto mb-2 text-primary" />
                  <div className="text-sm font-medium">{item.location}</div>
                  <div className="text-2xl font-bold text-primary mt-1">{item.count}</div>
                  <div className="text-xs text-muted-foreground">candidatos</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sección de Exportación de Reportes */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBar size={24} />
            Generar Reportes
          </CardTitle>
          <CardDescription>
            Descarga reportes completos de métricas en diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">Reporte en Excel</p>
              <p className="text-xs text-muted-foreground">
                Incluye múltiples hojas con resumen general, top ofertas, postulaciones por mes y más
              </p>
              <Button
                onClick={() => handleExportReport('excel', undefined, 'resumen')}
                variant="outline"
                className="w-full gap-2"
                disabled={!!exporting}
              >
                <FileXls size={18} />
                {exporting === 'excel' ? 'Generando Excel...' : 'Descargar Reporte Excel'}
              </Button>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">Reporte en PDF</p>
              <p className="text-xs text-muted-foreground">
                Reporte ejecutivo en formato PDF para directivos
              </p>
              <Button
                onClick={() => setShowReportTypeDialog(true)}
                variant="outline"
                className="w-full gap-2"
                disabled={!!exporting}
              >
                <FilePdf size={18} />
                {exporting === 'pdf' ? 'Generando PDF...' : 'Descargar Reporte PDF'}
              </Button>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Período del reporte:</strong>{' '}
              {timeRange === 'custom' && startDate && endDate
                ? `${new Date(startDate).toLocaleDateString('es-ES')} - ${new Date(endDate).toLocaleDateString('es-ES')}`
                : `Últimos ${timeRange} meses`
              } ({new Date().toLocaleDateString('es-ES')})
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
