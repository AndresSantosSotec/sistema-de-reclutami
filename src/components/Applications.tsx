import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { MagnifyingGlass, FunnelSimple, User, Envelope, Phone, LinkedinLogo, Calendar } from '@phosphor-icons/react'
import type { Application, Candidate, JobOffer, CandidateStatus } from '@/lib/types'
import { statusLabels, statusColors, formatDate } from '@/lib/constants'

interface ApplicationsProps {
  applications: Application[]
  candidates: Candidate[]
  jobs: JobOffer[]
  onStatusChange: (applicationId: string, newStatus: CandidateStatus) => void
}

export function Applications({ applications, candidates, jobs, onStatusChange }: ApplicationsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('all')
  const [jobFilter, setJobFilter] = useState<string>('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)

  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const candidate = candidates.find(c => c.id === app.candidateId)
      const job = jobs.find(j => j.id === app.jobId)
      
      const matchesSearch = !searchTerm || 
        candidate?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job?.title.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      const matchesJob = jobFilter === 'all' || app.jobId === jobFilter
      
      return matchesSearch && matchesStatus && matchesJob
    })
  }, [applications, candidates, jobs, searchTerm, statusFilter, jobFilter])

  const selectedCandidate = selectedApplication 
    ? candidates.find(c => c.id === selectedApplication.candidateId)
    : null

  const selectedJob = selectedApplication
    ? jobs.find(j => j.id === selectedApplication.jobId)
    : null

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
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CandidateStatus | 'all')}>
                  <SelectTrigger className="w-40">
                    <FunnelSimple size={16} className="mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="under-review">En Revisión</SelectItem>
                    <SelectItem value="interview-scheduled">Entrevista</SelectItem>
                    <SelectItem value="technical-test">Prueba Técnica</SelectItem>
                    <SelectItem value="hired">Contratado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={jobFilter} onValueChange={setJobFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Oferta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {jobs.map(job => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title.length > 20 ? job.title.slice(0, 20) + '...' : job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    {applications.length === 0 
                      ? 'No hay postulaciones aún.' 
                      : 'No se encontraron postulaciones con los filtros aplicados.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((app) => {
                  const candidate = candidates.find(c => c.id === app.candidateId)
                  const job = jobs.find(j => j.id === app.jobId)
                  
                  return (
                    <TableRow key={app.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User size={20} weight="duotone" className="text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{candidate?.name || 'N/A'}</div>
                            <div className="text-sm text-muted-foreground">{candidate?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{job?.title || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar size={16} />
                          {formatDate(app.appliedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[app.status]} variant="outline">
                          {statusLabels[app.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedApplication(app)}
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
        </CardContent>
      </Card>

      <Sheet open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalles de la Postulación</SheetTitle>
            <SheetDescription>
              Información completa del candidato y su aplicación
            </SheetDescription>
          </SheetHeader>
          
          {selectedCandidate && selectedJob && selectedApplication && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={32} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedCandidate.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {selectedCandidate.id.slice(0, 8)}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <Envelope size={18} className="text-muted-foreground" />
                    <span>{selectedCandidate.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={18} className="text-muted-foreground" />
                    <span>{selectedCandidate.phone}</span>
                  </div>
                  {selectedCandidate.linkedin && (
                    <div className="flex items-center gap-3 text-sm">
                      <LinkedinLogo size={18} className="text-muted-foreground" />
                      <a href={selectedCandidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Ver perfil
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Oferta Aplicada</h4>
                <Card>
                  <CardContent className="pt-6">
                    <p className="font-medium">{selectedJob.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{selectedJob.location}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Estado de la Postulación</h4>
                <Select 
                  value={selectedApplication.status} 
                  onValueChange={(value) => {
                    onStatusChange(selectedApplication.id, value as CandidateStatus)
                    setSelectedApplication({ ...selectedApplication, status: value as CandidateStatus })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="under-review">En Revisión</SelectItem>
                    <SelectItem value="interview-scheduled">Entrevista Programada</SelectItem>
                    <SelectItem value="technical-test">Prueba Técnica</SelectItem>
                    <SelectItem value="hired">Contratado</SelectItem>
                    <SelectItem value="rejected">Rechazado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Aplicó el {formatDate(selectedApplication.appliedAt)}
                </p>
              </div>

              {selectedApplication.notes && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Notas</h4>
                  <p className="text-sm text-muted-foreground">{selectedApplication.notes}</p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
