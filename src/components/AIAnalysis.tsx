import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, Sparkle, CheckCircle, Warning
import type { AIAnalysis, Candidate, Application } fr
interface AIAnalysisProps {
  application: Application
  onAnalyze: (candidateId: string, applicationId: string) => Promise<

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
        <CardConte
            <div>
              <CardTitle>Análisis con IA</CardTitle>
              <CardDescription>
                Analiza el perfil del candidato con inteligencia artificial
              </CardDescription>
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


              <WarningCircle size={18} />
            </h4>
              {analysis.concerns.map((concern
                  • {conc
   



          <h4 className="font-semibold mb-2
            Recomendaci
   


          
          disabled
        >
        </Button>
    </Card>
}











































































































