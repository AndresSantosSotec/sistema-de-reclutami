import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Brain, Sparkle, CheckCircle, WarningCircle, Lightbulb } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { AIAnalysis, Candidate, Application } from '@/lib/types'

  application: Application
  onAnalyze: (candidat

  const [isAnalyzing, s
  const handleAnalyze = async () => {
 

      toast.error('Error al analizar el candidato')
      setIsAnalyzing(false)

  if (!analysis) {
      <Card>
         
              <Brain size={24} className="text-purp
            <div>
              <CardDe
              </CardDescription>
          </div
        <CardContent>
     
   

                <S
            
            
                Anal
            )}
        </CardContent>
    )
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Brain size={24} className="text-purple-600" />
            </div>
            <div>
              <CardTitle>Análisis con IA</CardTitle>
              <CardDescription>
                Análisis generado el {new Date(analysis.analyzedAt).toLocaleDateString('es-ES')}
              </CardDescription>
            </div>
          </div>
          <div className={`text-center p-3 rounded-lg ${getScoreBgColor(analysis.matchScore)}`}>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.matchScore)}`}>
              {analysis.matchScore}%
            </div>
            <div className="text-xs text-muted-foreground">Compatibilidad</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {analysis.skills.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkle size={18} className="text-purple-600" />
              Habilidades Identificadas
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {analysis.experience.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Experiencia Relevante</h4>
            <ul className="space-y-2">
              {analysis.experience.map((exp, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  {exp}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        {analysis.strengths.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700">
              <CheckCircle size={18} />
              Fortalezas
            </h4>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-muted-foreground pl-6">
                  • {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.concerns.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-700">
              <WarningCircle size={18} />
              Áreas de Atención
            </h4>
            <ul className="space-y-2">
              {analysis.concerns.map((concern, idx) => (
                <li key={idx} className="text-sm text-muted-foreground pl-6">
                  • {concern}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700">
            <Lightbulb size={18} />
            Recomendación
          </h4>
          <p className="text-sm text-muted-foreground">
            {analysis.recommendation}
          </p>
        </div>

        <Button 
          variant="outline" 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? 'Analizando...' : 'Re-analizar'}
        </Button>
      </CardContent>
    </Card>
  )
}
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Brain size={24} className="text-purple-600" />
            </div>
            <div>
              <CardTitle>Análisis con IA</CardTitle>
              <CardDescription>
                Análisis generado el {new Date(analysis.analyzedAt).toLocaleDateString('es-ES')}
              </CardDescription>
            </div>
          </div>
          <div className={`text-center p-3 rounded-lg ${getScoreBgColor(analysis.matchScore)}`}>
            <div className={`text-2xl font-bold ${getScoreColor(analysis.matchScore)}`}>
              {analysis.matchScore}%
            </div>
            <div className="text-xs text-muted-foreground">Compatibilidad</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {analysis.skills.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkle size={18} className="text-purple-600" />
              Habilidades Identificadas
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {analysis.experience.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Experiencia Relevante</h4>
            <ul className="space-y-2">
              {analysis.experience.map((exp, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  {exp}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        {analysis.strengths.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700">
              <CheckCircle size={18} />
              Fortalezas
            </h4>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-muted-foreground pl-6">
                  • {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.concerns.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-700">
              <WarningCircle size={18} />
              Áreas de Atención
            </h4>
            <ul className="space-y-2">
              {analysis.concerns.map((concern, idx) => (
                <li key={idx} className="text-sm text-muted-foreground pl-6">
                  • {concern}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700">
            <Lightbulb size={18} />
            Recomendación
          </h4>
          <p className="text-sm text-muted-foreground">
            {analysis.recommendation}
          </p>
        </div>

        <Button 
          variant="outline" 
          onClick={handleAnalyze} 
          disabled={isAnalyzing}
          className="w-full"
        >
          {isAnalyzing ? 'Analizando...' : 'Re-analizar'}
        </Button>
      </CardContent>
    </Card>
  )
}
