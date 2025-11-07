import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Envelope, Phone, LinkedinLogo, MagnifyingGlass, Calendar, ClipboardText, Star, DownloadSimple } from '@phosphor-icons/react'
import type { Candidate, Application, Evaluation, StatusChange, JobOffer, AIAnalysis, PsychometricTest, JobCategory } from '@/lib/types'
import { statusLabels, statusColors, formatDate, formatDateTime, evaluationTypeLabels } from '@/lib/constants'
import { AIAnalysisComponent } from './AIAnalysis'
import { PsychometricTests } from './PsychometricTests'
import { ExportData } from './ExportData'

interface CandidatesProps {
  candidates: Candidate[]
  applications: Application[]
  evaluations: Evaluation[]
  statusChanges: StatusChange[]
  jobs: JobOffer[]
  categories: JobCategory[]
  aiAnalyses: AIAnalysis[]
  psychometricTests: PsychometricTest[]
  onAddToTalentBank?: (candidateId: string) => void
  onAnalyzeCandidate: (candidateId: string, applicationId: string) => Promise<void>
  onSendPsychometricTest: (test: Omit<PsychometricTest, 'id' | 'sentAt'>) => void
  onUpdatePsychometricTest: (testId: string, updates: Partial<PsychometricTest>) => void
}

export function Candidates({ 
  candidates, 
  applications, 
  evaluations, 
  statusChanges, 
  jobs, 
  categories,
  aiAnalyses,
  psychometricTests,
  onAddToTalentBank,
  onAnalyzeCandidate,
  onSendPsychometricTest,
  onUpdatePsychometricTest
}: CandidatesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      return !searchTerm || 
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [candidates, searchTerm])

  const candidateHistory = useMemo(() => {
    if (!selectedCandidate) return null

    const candidateApps = applications.filter(a => a.candidateId === selectedCandidate.id)
    const candidateEvals = evaluations.filter(e => e.candidateId === selectedCandidate.id)
    const candidateChanges = statusChanges.filter(sc => sc.candidateId === selectedCandidate.id)

    return {
      applications: candidateApps,
      evaluations: candidateEvals,
      statusChanges: candidateChanges
    }
  }, [selectedCandidate, applications, evaluations, statusChanges])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Candidatos</h1>
        <p className="text-muted-foreground mt-2">
          Base de datos de todos los candidatos
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Todos los Candidatos</CardTitle>
              <CardDescription>
                {filteredCandidates.length} de {candidates.length} candidato{candidates.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar candidatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <ExportData
                candidates={candidates}
                applications={applications}
                jobs={jobs}
                categories={categories}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCandidates.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                {candidates.length === 0 
                  ? 'No hay candidatos registrados aún.' 
                  : 'No se encontraron candidatos con ese criterio de búsqueda.'}
              </div>
            ) : (
              filteredCandidates.map(candidate => {
                const candidateApplications = applications.filter(a => a.candidateId === candidate.id)
                const latestStatus = candidateApplications.length > 0 
                  ? candidateApplications.sort((a, b) => 
                      new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
                    )[0].status
                  : candidate.status

                return (
                  <Card key={candidate.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCandidate(candidate)}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User size={24} weight="duotone" className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
                          <div className="mt-3">
                            <Badge className={statusColors[latestStatus]} variant="outline">
                              {statusLabels[latestStatus]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {candidateApplications.length} postulación{candidateApplications.length !== 1 ? 'es' : ''}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Perfil del Candidato</SheetTitle>
            <SheetDescription>
              Historial completo de interacciones y evaluaciones
            </SheetDescription>
          </SheetHeader>

          {selectedCandidate && candidateHistory && (
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

                <div className="space-y-3 pt-4">
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

              <Separator />

              <Tabs defaultValue="applications" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="applications">Postulaciones</TabsTrigger>
                  <TabsTrigger value="evaluations">Evaluaciones</TabsTrigger>
                  <TabsTrigger value="ai-analysis">IA</TabsTrigger>
                  <TabsTrigger value="psychometric">Psicométricas</TabsTrigger>
                </TabsList>

                <TabsContent value="applications" className="space-y-4 mt-6">
                  <h4 className="font-semibold flex items-center gap-2">
                    <ClipboardText size={18} />
                    Postulaciones ({candidateHistory.applications.length})
                  </h4>
                  {candidateHistory.applications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay postulaciones registradas</p>
                  ) : (
                    <div className="space-y-3">
                      {candidateHistory.applications.map(app => {
                        const job = jobs.find(j => j.id === app.jobId)
                        return (
                          <Card key={app.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                  <p className="font-medium">{job?.title || 'N/A'}</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar size={14} />
                                    {formatDate(app.appliedAt)}
                                  </div>
                                  <Badge className={statusColors[app.status]} variant="outline">
                                    {statusLabels[app.status]}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="evaluations" className="space-y-4 mt-6">
                  <h4 className="font-semibold">Evaluaciones ({candidateHistory.evaluations.length})</h4>
                  {candidateHistory.evaluations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hay evaluaciones registradas</p>
                  ) : (
                    <div className="space-y-3">
                      {candidateHistory.evaluations.map(evaluation => (
                        <Card key={evaluation.id}>
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">
                                  {evaluationTypeLabels[evaluation.type]}
                                </Badge>
                                {evaluation.completedAt ? (
                                  <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                                    Completada
                                  </Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" variant="outline">
                                    Pendiente
                                  </Badge>
                                )}
                              </div>
                              {evaluation.scheduledDate && (
                                <p className="text-sm text-muted-foreground">
                                  {evaluation.scheduledDate} {evaluation.scheduledTime && `- ${evaluation.scheduledTime}`}
                                </p>
                              )}
                              {evaluation.interviewer && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Responsable:</span> {evaluation.interviewer}
                                </p>
                              )}
                              {evaluation.result && (
                                <div className="pt-2 border-t">
                                  <p className="text-sm font-medium">Resultado:</p>
                                  <p className="text-sm text-muted-foreground mt-1">{evaluation.result}</p>
                                </div>
                              )}
                              {evaluation.observations && (
                                <div className="pt-2 border-t">
                                  <p className="text-sm font-medium">Observaciones:</p>
                                  <p className="text-sm text-muted-foreground mt-1">{evaluation.observations}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="ai-analysis" className="mt-6">
                  {candidateHistory.applications.length > 0 ? (
                    <AIAnalysisComponent
                      candidate={selectedCandidate}
                      application={candidateHistory.applications[0]}
                      analysis={aiAnalyses.find(
                        a => a.candidateId === selectedCandidate.id && 
                             a.applicationId === candidateHistory.applications[0].id
                      )}
                      onAnalyze={onAnalyzeCandidate}
                    />
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground text-center py-8">
                          El candidato debe tener al menos una postulación para realizar análisis con IA
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="psychometric" className="mt-6">
                  {candidateHistory.applications.length > 0 ? (
                    <PsychometricTests
                      tests={psychometricTests}
                      candidate={selectedCandidate}
                      application={candidateHistory.applications[0]}
                      onSendTest={onSendPsychometricTest}
                      onUpdateTest={onUpdatePsychometricTest}
                    />
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground text-center py-8">
                          El candidato debe tener al menos una postulación para enviar pruebas psicométricas
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>

              {onAddToTalentBank && (
                <>
                  <Separator />
                  <Button 
                    onClick={() => {
                      onAddToTalentBank(selectedCandidate.id)
                      setSelectedCandidate(null)
                    }}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <Star size={18} weight="duotone" />
                    Agregar al Banco de Talento
                  </Button>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
