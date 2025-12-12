import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClipboardText, PaperPlaneRight, CheckCircle, Clock, HourglassHigh } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { PsychometricTest, Candidate, Application } from '@/lib/types'
import { formatDate } from '@/lib/constants'

interface PsychometricTestsProps {
  tests: PsychometricTest[]
  candidate: Candidate
  application: Application
  onSendTest: (test: Omit<PsychometricTest, 'id' | 'sentAt'>) => void
  onUpdateTest: (testId: string, updates: Partial<PsychometricTest>) => void
}

export function PsychometricTests({ 
  tests, 
  candidate, 
  application, 
  onSendTest, 
  onUpdateTest 
}: PsychometricTestsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [testName, setTestName] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [editingTest, setEditingTest] = useState<PsychometricTest | null>(null)
  const [testResults, setTestResults] = useState('')
  const [testScore, setTestScore] = useState('')

  const applicationTests = tests.filter(t => t.postulante_id.toString() === candidate.id)

  const handleSendTest = () => {
    if (!testName.trim()) {
      toast.error('Por favor ingresa el nombre de la prueba')
      return
    }

    const newTest: Omit<PsychometricTest, 'id' | 'sent_at'> = {
      postulante_id: parseInt(candidate.id),
      test_link: externalUrl.trim() || testName.trim(),
      status: 'sent'
    }

    onSendTest(newTest)
    toast.success(`Prueba psicométrica enviada a ${candidate.name}`)
    setTestName('')
    setExternalUrl('')
    setIsDialogOpen(false)
  }

  const handleUpdateTestStatus = (testId: string, status: PsychometricTest['status']) => {
    onUpdateTest(testId, { status })
    
    if (status === 'completed') {
      toast.success('Prueba marcada como completada')
    } else if (status === 'sent') {
      toast.info('Prueba enviada')
    }
  }

  const handleSaveResults = () => {
    if (!editingTest) return

    const updates: Partial<PsychometricTest> = {
      results_link: testResults,
      status: 'completed',
      completed_at: new Date().toISOString()
    }

    onUpdateTest(editingTest.id.toString(), updates)
    toast.success('Resultados guardados exitosamente')
    setEditingTest(null)
    setTestResults('')
    setTestScore('')
  }

  const getStatusIcon = (status: PsychometricTest['status']) => {
    switch (status) {
      case 'sent':
        return <PaperPlaneRight size={16} className="text-blue-600" />
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />
      case 'expired':
        return <HourglassHigh size={16} className="text-red-600" />
      default:
        return <Clock size={16} className="text-gray-600" />
    }
  }

  const getStatusLabel = (status: PsychometricTest['status']) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'sent':
        return 'Enviada'
      case 'completed':
        return 'Completada'
      case 'expired':
        return 'Expirada'
    }
  }

  const getStatusColor = (status: PsychometricTest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <ClipboardText size={24} className="text-orange-600" />
            </div>
            <div>
              <CardTitle>Pruebas Psicométricas</CardTitle>
              <CardDescription>
                Gestiona evaluaciones externas
              </CardDescription>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <PaperPlaneRight className="mr-2" />
                Enviar Prueba
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Prueba Psicométrica</DialogTitle>
                <DialogDescription>
                  El candidato será notificado automáticamente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="test-name">Nombre de la Prueba *</Label>
                  <Input
                    id="test-name"
                    placeholder="Ej: Test de Personalidad 16PF"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="external-url">URL de la Plataforma (opcional)</Label>
                  <Input
                    id="external-url"
                    type="url"
                    placeholder="https://plataforma-pruebas.com/test/12345"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Link a la plataforma externa donde se realizará la prueba
                  </p>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSendTest}>
                    <PaperPlaneRight className="mr-2" />
                    Enviar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {applicationTests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ClipboardText size={48} className="mx-auto mb-3 opacity-20" />
            <p>No se han enviado pruebas psicométricas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicationTests.map((test) => (
              <Card key={test.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {getStatusIcon(test.status)}
                          Prueba Psicométrica #{test.id}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {test.sent_at && `Enviada el ${formatDate(test.sent_at)}`}
                        </p>
                        {test.test_link && (
                          <a
                            href={test.test_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline mt-1 inline-block"
                          >
                            Ver plataforma externa →
                          </a>
                        )}
                      </div>
                      <Badge className={getStatusColor(test.status)}>
                        {getStatusLabel(test.status)}
                      </Badge>
                    </div>

                    {test.status !== 'completed' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingTest(test)
                            setTestResults(test.results_link || '')
                            setTestScore('')
                          }}
                        >
                          Registrar Resultados
                        </Button>
                      </div>
                    )}

                    {test.status === 'completed' && (
                      <div className="bg-green-50 rounded-lg p-4 space-y-2">
                        {test.results_link && (
                          <div>
                            <span className="text-sm font-medium block mb-1">Enlace de resultados:</span>
                            <a
                              href={test.results_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              Ver resultados →
                            </a>
                          </div>
                        )}
                        {test.completed_at && (
                          <p className="text-xs text-muted-foreground">
                            Completada el {formatDate(test.completed_at)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!editingTest} onOpenChange={(open) => !open && setEditingTest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Resultados</DialogTitle>
              <DialogDescription>
                Ingresa los resultados de la prueba psicométrica
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="test-score">Puntuación (opcional)</Label>
                <Input
                  id="test-score"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 85.5"
                  value={testScore}
                  onChange={(e) => setTestScore(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-results">Resultados / Observaciones</Label>
                <Textarea
                  id="test-results"
                  placeholder="Ingresa un resumen de los resultados de la prueba..."
                  rows={6}
                  value={testResults}
                  onChange={(e) => setTestResults(e.target.value)}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setEditingTest(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveResults}>
                  <CheckCircle className="mr-2" />
                  Guardar Resultados
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
