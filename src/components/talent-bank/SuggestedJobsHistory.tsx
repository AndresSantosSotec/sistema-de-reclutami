import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Briefcase, CheckCircle, XCircle, Clock, Eye, 
  Calendar, User, EnvelopeSimple, ArrowSquareOut
} from '@phosphor-icons/react'
import { talentBankService } from '@/lib/talentBankService'
import { formatDate } from '@/lib/constants'

interface SuggestedJobHistory {
  id: number
  job: {
    id: number
    titulo: string
    empresa: string
    ubicacion: string
    tipo_empleo: string
  } | null
  notas: string | null
  estado: 'pendiente' | 'visto' | 'aplicado' | 'descartado'
  sugerido_por: string | null
  notificacion_enviada: boolean
  email_enviado: boolean
  fecha: string
}

interface SuggestedJobsHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateId: number
  candidateName: string
}

export function SuggestedJobsHistoryDialog({
  open,
  onOpenChange,
  candidateId,
  candidateName
}: SuggestedJobsHistoryDialogProps) {
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<SuggestedJobHistory[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && candidateId) {
      loadHistory()
    }
  }, [open, candidateId])

  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await talentBankService.getSuggestedJobsForCandidate(candidateId)
      setHistory(data as SuggestedJobHistory[])
    } catch (err: any) {
      console.error('Error cargando historial:', err)
      setError(err.response?.data?.message || 'Error al cargar historial de sugerencias')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case 'aplicado':
        return {
          label: 'Aplicó',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200',
          description: 'El candidato aplicó a esta vacante'
        }
      case 'descartado':
        return {
          label: 'Descartado',
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-200',
          description: 'El candidato descartó esta vacante'
        }
      case 'visto':
        return {
          label: 'Visto',
          icon: Eye,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          description: 'El candidato vio la sugerencia'
        }
      default:
        return {
          label: 'Pendiente',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          description: 'Esperando respuesta del candidato'
        }
    }
  }

  const stats = {
    total: history.length,
    pending: history.filter(h => h.estado === 'pendiente' || h.estado === 'visto').length,
    applied: history.filter(h => h.estado === 'aplicado').length,
    discarded: history.filter(h => h.estado === 'descartado').length,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase size={20} weight="duotone" />
            Historial de Vacantes Sugeridas
          </DialogTitle>
          <DialogDescription>
            Vacantes sugeridas a <strong>{candidateName}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-green-600">{stats.applied}</div>
              <p className="text-xs text-muted-foreground">Aplicó</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-xl font-bold text-red-600">{stats.discarded}</div>
              <p className="text-xs text-muted-foreground">Descartados</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircle size={48} className="mx-auto text-destructive mb-2" />
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={loadHistory} className="mt-4">
              Reintentar
            </Button>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/20">
            <Briefcase size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold">Sin sugerencias</h3>
            <p className="text-sm text-muted-foreground mt-1">
              No se han sugerido vacantes a este candidato
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const statusConfig = getStatusConfig(item.estado)
              const StatusIcon = statusConfig.icon
              
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold truncate">
                            {item.job?.titulo || 'Vacante eliminada'}
                          </h4>
                          <Badge variant="outline" className={statusConfig.className}>
                            <StatusIcon size={12} className="mr-1" weight="bold" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        
                        {item.job && (
                          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-2">
                            <span>{item.job.ubicacion}</span>
                            <span>•</span>
                            <span className="capitalize">{item.job.tipo_empleo}</span>
                          </div>
                        )}

                        {item.notas && (
                          <p className="text-sm bg-muted/50 p-2 rounded mt-2 italic">
                            "{item.notas}"
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-3 pt-2 border-t">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            Sugerida: {formatDate(item.fecha)}
                          </div>
                          {item.sugerido_por && (
                            <div className="flex items-center gap-1">
                              <User size={12} />
                              Por: {item.sugerido_por}
                            </div>
                          )}
                          {item.email_enviado && (
                            <div className="flex items-center gap-1 text-green-600">
                              <EnvelopeSimple size={12} weight="fill" />
                              Email enviado
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook para verificar si una vacante ya fue sugerida a un candidato
 */
export function useSuggestedJobsCheck(candidateId: number | null) {
  const [suggestedJobIds, setSuggestedJobIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (candidateId) {
      loadSuggestedJobs()
    } else {
      setSuggestedJobIds(new Set())
    }
  }, [candidateId])

  const loadSuggestedJobs = async () => {
    if (!candidateId) return
    setLoading(true)
    try {
      const data = await talentBankService.getSuggestedJobsForCandidate(candidateId)
      const ids = new Set(data.map((s: any) => s.job?.id).filter(Boolean))
      setSuggestedJobIds(ids)
    } catch (err) {
      console.error('Error cargando sugerencias:', err)
    } finally {
      setLoading(false)
    }
  }

  const isJobSuggested = (jobId: number) => suggestedJobIds.has(jobId)
  
  const getJobSuggestionStatus = (jobId: number, history: SuggestedJobHistory[]) => {
    const suggestion = history.find(s => s.job?.id === jobId)
    return suggestion?.estado || null
  }

  const refresh = () => loadSuggestedJobs()

  return { suggestedJobIds, isJobSuggested, loading, refresh }
}
