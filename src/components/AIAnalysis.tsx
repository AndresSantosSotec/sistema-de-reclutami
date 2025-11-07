import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, Sparkle, CheckCircle, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AIAnalysis, Candidate, Application } from '@/lib/types'

interface AIAnalysisProps {
  candidate: Candidate
  application: Application
  analysis?: AIAnalysis
  onAnalyze: (candidateId: string, applicationId: string) => Promise<void>
}

export function AIAnalysisComponent({ candidate, application, analysis, onAnalyze }: AIAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      await onAnalyze(candidate.id, application.id)
      toast.success('Análisis completado exitosamente')
    } catch (error) {
      toast.error('Error al analizar el candidato')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Brain size={24} className="text-purple-600" />
            </div>
            <div>
              <CardTitle>Análisis con IA</CardTitle>
              <CardDescription>
                Analiza el perfil del candidato con inteligencia artificial
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Sparkle className="mr-2 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Brain className="mr-2" />
                Analizar Candidato
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100">
            <Brain size={24} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <CardTitle>Análisis con IA</CardTitle>
            <CardDescription>Resultado del análisis automático</CardDescription>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{analysis.matchScore}</div>
            <div className="text-xs text-muted-foreground">Compatibilidad</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600" />
            Fortalezas
          </h4>
          <ul className="space-y-1 text-sm">
            {analysis.strengths.map((strength, idx) => (
              <li key={idx} className="text-muted-foreground">• {strength}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Warning size={18} className="text-amber-600" />
            Áreas de Atención
          </h4>
          <ul className="space-y-1 text-sm">
            {analysis.concerns.map((concern, idx) => (
              <li key={idx} className="text-muted-foreground">• {concern}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Habilidades Identificadas</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.skills.map((skill, idx) => (
              <Badge key={idx} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Recomendación</h4>
          <p className="text-sm text-muted-foreground">{analysis.recommendation}</p>
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          variant="outline"
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Sparkle className="mr-2 animate-spin" />
              Re-analizando...
            </>
          ) : (
            <>
              <Brain className="mr-2" />
              Re-analizar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
