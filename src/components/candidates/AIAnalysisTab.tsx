import { useState } from 'react'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Brain,
  CheckCircle,
  Lightning,
  Target,
  FileText,
  DownloadSimple,
  Briefcase,
  Star,
  Warning,
  SpinnerGap,
  Trophy,
  TrendUp,
  Sparkle,
  Clock,
  Bell,
  XCircle,
  FilePdf
} from '@phosphor-icons/react'
import { aiAnalysisService, type AIAnalysisResult, type JobMatch, type ExpiringJob } from '@/lib/aiAnalysisService'

interface AIAnalysisTabProps {
  candidateId: number
  candidateName: string
}

export function AIAnalysisTab({ candidateId, candidateName }: AIAnalysisTabProps) {
  const [loading, setLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await aiAnalysisService.analyzeCandidate(candidateId)
      setAnalysisResult(result)
      toast.success('Análisis completado exitosamente')
    } catch (err: any) {
      console.error('Error en análisis IA:', err)
      const errorMessage = err.message || 'Error al realizar el análisis con IA'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-blue-600 dark:text-blue-400'
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'outline'
  }

  const getRecommendationBadgeVariant = (rec: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (rec) {
      case 'Altamente Recomendado':
        return 'default'
      case 'Recomendado':
        return 'secondary'
      case 'Considerar':
        return 'outline'
      case 'No Recomendado':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critica':
        return 'bg-red-500 text-white'
      case 'alta':
        return 'bg-orange-500 text-white'
      case 'media':
        return 'bg-yellow-500 text-black'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const handleExportReport = () => {
    if (!analysisResult) return

    try {
      // Crear documento PDF con configuración profesional
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const marginLeft = 15
      const marginRight = 15
      const contentWidth = pageWidth - marginLeft - marginRight
      let y = 0

      // Paleta de colores profesional
      const colors = {
        primary: [25, 60, 95] as [number, number, number],      // Azul oscuro corporativo
        secondary: [70, 130, 180] as [number, number, number],  // Azul steel
        accent: [0, 128, 128] as [number, number, number],      // Teal
        success: [40, 167, 69] as [number, number, number],     // Verde
        warning: [255, 193, 7] as [number, number, number],     // Amarillo
        danger: [220, 53, 69] as [number, number, number],      // Rojo
        dark: [33, 37, 41] as [number, number, number],         // Gris oscuro
        muted: [108, 117, 125] as [number, number, number],     // Gris
        light: [248, 249, 250] as [number, number, number],     // Gris muy claro
        white: [255, 255, 255] as [number, number, number]
      }

      // Función para verificar espacio y agregar página
      const ensureSpace = (needed: number): void => {
        if (y + needed > pageHeight - 20) {
          doc.addPage()
          y = 20
        }
      }

      // Función para dibujar línea separadora elegante
      const drawSeparator = (yPos: number, style: 'full' | 'partial' = 'full'): void => {
        doc.setDrawColor(...colors.secondary)
        doc.setLineWidth(0.3)
        const startX = style === 'full' ? marginLeft : marginLeft + 20
        const endX = style === 'full' ? pageWidth - marginRight : pageWidth - marginRight - 20
        doc.line(startX, yPos, endX, yPos)
      }

      // Función para título de sección
      const drawSectionTitle = (title: string, icon?: string): number => {
        ensureSpace(20)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(...colors.primary)
        const displayTitle = icon ? `${icon}  ${title}` : title
        doc.text(displayTitle.toUpperCase(), marginLeft, y)
        y += 2
        drawSeparator(y)
        y += 6
        return y
      }

      // ══════════════════════════════════════════════════════════════════
      // ENCABEZADO PROFESIONAL
      // ══════════════════════════════════════════════════════════════════
      
      // Barra superior
      doc.setFillColor(...colors.primary)
      doc.rect(0, 0, pageWidth, 3, 'F')
      
      // Logo/Título empresa
      y = 18
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...colors.muted)
      doc.text('COOSANJER', marginLeft, y)
      
      // Fecha
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.text(new Date().toLocaleDateString('es-GT', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }), pageWidth - marginRight, y, { align: 'right' })
      
      y += 8
      
      // Título principal
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(18)
      doc.setTextColor(...colors.dark)
      doc.text('Informe de Evaluación', marginLeft, y)
      
      y += 7
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.setTextColor(...colors.secondary)
      doc.text('Análisis de Candidato con Inteligencia Artificial', marginLeft, y)
      
      y += 12
      drawSeparator(y, 'full')
      y += 10

      // ══════════════════════════════════════════════════════════════════
      // INFORMACIÓN DEL CANDIDATO + PUNTUACIÓN (En una fila)
      // ══════════════════════════════════════════════════════════════════
      
      const infoBoxHeight = 32
      const scoreBoxWidth = 50
      const infoBoxWidth = contentWidth - scoreBoxWidth - 5
      
      // Caja de información del candidato
      doc.setFillColor(...colors.light)
      doc.roundedRect(marginLeft, y, infoBoxWidth, infoBoxHeight, 2, 2, 'F')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...colors.dark)
      doc.text('CANDIDATO', marginLeft + 5, y + 7)
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text(candidateName, marginLeft + 5, y + 15)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...colors.muted)
      doc.text(`ID: ${candidateId}  |  Nivel: ${analysisResult.nivel_experiencia}`, marginLeft + 5, y + 22)

      // Caja de puntuación
      const scoreBoxX = marginLeft + infoBoxWidth + 5
      const score = analysisResult.puntuacion_general
      let scoreColor = colors.danger
      let scoreLabel = 'Bajo'
      if (score >= 80) { scoreColor = colors.success; scoreLabel = 'Excelente' }
      else if (score >= 60) { scoreColor = colors.secondary; scoreLabel = 'Bueno' }
      else if (score >= 40) { scoreColor = colors.warning; scoreLabel = 'Regular' }

      doc.setFillColor(...scoreColor)
      doc.roundedRect(scoreBoxX, y, scoreBoxWidth, infoBoxHeight, 2, 2, 'F')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(22)
      doc.setTextColor(...colors.white)
      doc.text(`${score}`, scoreBoxX + scoreBoxWidth/2, y + 15, { align: 'center' })
      
      doc.setFontSize(8)
      doc.text('PUNTOS', scoreBoxX + scoreBoxWidth/2, y + 21, { align: 'center' })
      
      doc.setFontSize(9)
      doc.text(scoreLabel.toUpperCase(), scoreBoxX + scoreBoxWidth/2, y + 28, { align: 'center' })

      y += infoBoxHeight + 12

      // ══════════════════════════════════════════════════════════════════
      // ALERTA DE OFERTAS POR VENCER (si aplica)
      // ══════════════════════════════════════════════════════════════════
      
      if (analysisResult.ofertas_por_vencer && analysisResult.ofertas_por_vencer.length > 0) {
        const alertHeight = 8 + analysisResult.ofertas_por_vencer.length * 5
        doc.setFillColor(255, 248, 225)
        doc.setDrawColor(...colors.warning)
        doc.setLineWidth(0.5)
        doc.roundedRect(marginLeft, y, contentWidth, alertHeight, 2, 2, 'FD')
        
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        doc.setTextColor(...colors.warning)
        doc.text('ATENCIÓN: Ofertas próximas a vencer', marginLeft + 3, y + 5)
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...colors.dark)
        analysisResult.ofertas_por_vencer.forEach((oferta, i) => {
          doc.text(`• ${oferta.titulo} - ${oferta.dias_restantes} días restantes`, marginLeft + 3, y + 10 + (i * 5))
        })
        
        y += alertHeight + 8
      }

      // ══════════════════════════════════════════════════════════════════
      // RESUMEN EJECUTIVO
      // ══════════════════════════════════════════════════════════════════
      
      drawSectionTitle('Resumen Ejecutivo')
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(...colors.dark)
      const resumenLines = doc.splitTextToSize(analysisResult.resumen_ejecutivo, contentWidth)
      resumenLines.forEach((line: string) => {
        ensureSpace(5)
        doc.text(line, marginLeft, y)
        y += 4.5
      })
      y += 8

      // ══════════════════════════════════════════════════════════════════
      // FORTALEZAS Y ÁREAS DE MEJORA (Dos columnas)
      // ══════════════════════════════════════════════════════════════════
      
      ensureSpace(50)
      drawSectionTitle('Análisis de Competencias')
      
      const colWidth = (contentWidth - 6) / 2
      const startY = y
      
      // Columna Fortalezas
      doc.setFillColor(232, 245, 233) // Verde muy claro
      doc.roundedRect(marginLeft, y, colWidth, 8, 1, 1, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...colors.success)
      doc.text('FORTALEZAS', marginLeft + colWidth/2, y + 5.5, { align: 'center' })
      
      // Columna Áreas de Mejora
      doc.setFillColor(255, 243, 224) // Naranja muy claro
      doc.roundedRect(marginLeft + colWidth + 6, y, colWidth, 8, 1, 1, 'F')
      doc.setTextColor(230, 126, 34)
      doc.text('ÁREAS DE MEJORA', marginLeft + colWidth + 6 + colWidth/2, y + 5.5, { align: 'center' })
      
      y += 12
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...colors.dark)
      
      const maxItems = Math.max(analysisResult.fortalezas.length, analysisResult.areas_mejora.length)
      for (let i = 0; i < maxItems; i++) {
        ensureSpace(6)
        if (analysisResult.fortalezas[i]) {
          const lines = doc.splitTextToSize(`• ${analysisResult.fortalezas[i]}`, colWidth - 4)
          lines.forEach((line: string, li: number) => {
            doc.text(line, marginLeft + 2, y + (li * 4))
          })
        }
        if (analysisResult.areas_mejora[i]) {
          const lines = doc.splitTextToSize(`• ${analysisResult.areas_mejora[i]}`, colWidth - 4)
          lines.forEach((line: string, li: number) => {
            doc.text(line, marginLeft + colWidth + 8, y + (li * 4))
          })
        }
        y += 6
      }
      y += 6

      // ══════════════════════════════════════════════════════════════════
      // HABILIDADES DESTACADAS (En línea con badges)
      // ══════════════════════════════════════════════════════════════════
      
      ensureSpace(30)
      drawSectionTitle('Habilidades Destacadas')
      
      let xPos = marginLeft
      const badgeHeight = 6
      const badgePadding = 3
      
      doc.setFontSize(7)
      analysisResult.habilidades_destacadas.forEach((hab) => {
        const textWidth = doc.getTextWidth(hab) + badgePadding * 2
        
        if (xPos + textWidth > pageWidth - marginRight) {
          xPos = marginLeft
          y += badgeHeight + 3
          ensureSpace(badgeHeight + 3)
        }
        
        doc.setFillColor(...colors.light)
        doc.setDrawColor(...colors.secondary)
        doc.setLineWidth(0.2)
        doc.roundedRect(xPos, y - 4, textWidth, badgeHeight, 1, 1, 'FD')
        
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...colors.dark)
        doc.text(hab, xPos + badgePadding, y)
        
        xPos += textWidth + 3
      })
      y += 12

      // ══════════════════════════════════════════════════════════════════
      // COMPATIBILIDAD CON POSICIONES (Tabla profesional)
      // ══════════════════════════════════════════════════════════════════
      
      if (analysisResult.job_matches.length > 0) {
        ensureSpace(40)
        drawSectionTitle('Compatibilidad con Posiciones (Ordenado por habilidades compatibles)')

        autoTable(doc, {
          startY: y,
          head: [['#', 'Posición', 'Skills', 'Match', 'Evaluación']],
          body: analysisResult.job_matches.map((job, idx) => [
            `${idx + 1}`,
            job.job_titulo,
            job.habilidades_coincidentes !== undefined && job.total_habilidades_requeridas !== undefined 
              ? `${job.habilidades_coincidentes}/${job.total_habilidades_requeridas}`
              : '-',
            `${job.compatibilidad}%`,
            job.recomendacion
          ]),
          theme: 'plain',
          styles: {
            fontSize: 8,
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          headStyles: { 
            fillColor: colors.primary,
            textColor: colors.white,
            fontStyle: 'bold',
            fontSize: 8
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: { 
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 55 }, 
            2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
            3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }, 
            4: { cellWidth: 40 }
          },
          margin: { left: marginLeft, right: marginRight },
          didParseCell: (data) => {
            if (data.column.index === 3 && data.section === 'body') {
              const value = parseInt(data.cell.raw as string)
              if (value >= 80) data.cell.styles.textColor = colors.success
              else if (value >= 60) data.cell.styles.textColor = colors.secondary
              else if (value >= 40) data.cell.styles.textColor = [200, 150, 0]
              else data.cell.styles.textColor = colors.danger
            }
          }
        })

        y = (doc as any).lastAutoTable.finalY + 10
      }

      // ══════════════════════════════════════════════════════════════════
      // RECOMENDACIONES DE DESARROLLO
      // ══════════════════════════════════════════════════════════════════
      
      ensureSpace(40)
      drawSectionTitle('Plan de Desarrollo Sugerido')
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...colors.dark)
      
      analysisResult.recomendaciones_desarrollo.forEach((rec, i) => {
        ensureSpace(10)
        
        // Número circular
        doc.setFillColor(...colors.secondary)
        doc.circle(marginLeft + 3, y - 1, 3, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.setTextColor(...colors.white)
        doc.text(`${i + 1}`, marginLeft + 3, y + 0.5, { align: 'center' })
        
        // Texto de recomendación
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(...colors.dark)
        const recLines = doc.splitTextToSize(rec, contentWidth - 12)
        recLines.forEach((line: string, li: number) => {
          doc.text(line, marginLeft + 10, y + (li * 4))
        })
        y += Math.max(recLines.length * 4, 6) + 2
      })
      y += 6

      // ══════════════════════════════════════════════════════════════════
      // CONCLUSIÓN / RECOMENDACIÓN FINAL
      // ══════════════════════════════════════════════════════════════════
      
      ensureSpace(35)
      
      // Caja destacada
      doc.setFillColor(240, 248, 255) // Azul muy claro
      doc.setDrawColor(...colors.primary)
      doc.setLineWidth(0.5)
      const conclusionHeight = 28
      doc.roundedRect(marginLeft, y, contentWidth, conclusionHeight, 2, 2, 'FD')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...colors.primary)
      doc.text('CONCLUSIÓN', marginLeft + 5, y + 7)
      
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...colors.dark)
      const conclusionLines = doc.splitTextToSize(analysisResult.recomendacion_final, contentWidth - 10)
      conclusionLines.slice(0, 3).forEach((line: string, i: number) => {
        doc.text(line, marginLeft + 5, y + 13 + (i * 4))
      })

      // ══════════════════════════════════════════════════════════════════
      // PIE DE PÁGINA EN TODAS LAS PÁGINAS
      // ══════════════════════════════════════════════════════════════════
      
      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        
        // Línea separadora
        doc.setDrawColor(...colors.light)
        doc.setLineWidth(0.3)
        doc.line(marginLeft, pageHeight - 12, pageWidth - marginRight, pageHeight - 12)
        
        // Texto pie de página
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(...colors.muted)
        doc.text('Sistema de Reclutamiento COOSANJER', marginLeft, pageHeight - 7)
        doc.text(`Página ${i} de ${totalPages}`, pageWidth - marginRight, pageHeight - 7, { align: 'right' })
        
        // Indicador de confidencialidad
        doc.setFontSize(6)
        doc.text('Documento confidencial - Generado con IA', pageWidth / 2, pageHeight - 7, { align: 'center' })
      }

      // Guardar PDF
      const fileName = `Evaluacion_${candidateName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      toast.success('Informe PDF generado exitosamente')
    } catch (err) {
      console.error('Error al generar PDF:', err)
      toast.error('Error al generar el informe PDF')
    }
  }

  // Estado inicial - sin análisis
  if (!analysisResult && !loading) {
    return (
      <div className="text-center py-12">
        <Brain size={64} className="mx-auto text-primary mb-4" weight="duotone" />
        <h3 className="text-lg font-semibold mb-2">Análisis con Inteligencia Artificial</h3>
        <p className="text-muted-foreground max-w-md mx-auto mb-2">
          Utiliza IA avanzada para analizar el perfil del candidato, identificar fortalezas 
          y encontrar las posiciones más compatibles.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          El análisis incluye compatibilidad con plazas disponibles y recomendaciones para gerencia.
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm max-w-md mx-auto">
            <Warning size={16} className="inline mr-2" />
            {error}
          </div>
        )}
        <Button onClick={handleAnalyze} size="lg" className="gap-2">
          <Brain size={20} weight="fill" />
          Analizar Candidato
        </Button>
      </div>
    )
  }

  // Estado de carga
  if (loading) {
    return (
      <div className="text-center py-12">
        <SpinnerGap size={64} className="mx-auto text-primary mb-4 animate-spin" />
        <h3 className="text-lg font-semibold mb-2">Analizando Candidato...</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          La inteligencia artificial está procesando el perfil de {candidateName}.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Esto puede tomar unos segundos...
        </p>
      </div>
    )
  }

  // Guard para TypeScript - si llegamos aquí, analysisResult no es null
  if (!analysisResult) {
    return null
  }

  // Resultado del análisis
  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-6">
        {/* Header con puntuación general */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Brain size={24} className="text-primary" weight="duotone" />
                </div>
                <div>
                  <CardTitle className="text-lg">Análisis de IA Completado</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Sparkle size={14} className="text-primary" />
                    Nivel: {analysisResult.nivel_experiencia}
                  </CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getScoreColor(analysisResult.puntuacion_general)}`}>
                  {analysisResult.puntuacion_general}
                </div>
                <div className="text-xs text-muted-foreground">Puntuación General</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mt-2">
              <Progress 
                value={analysisResult.puntuacion_general} 
                className="h-2 flex-1"
              />
              <Badge variant={getScoreBadgeVariant(analysisResult.puntuacion_general)}>
                {analysisResult.puntuacion_general >= 80 ? 'Excelente' :
                 analysisResult.puntuacion_general >= 60 ? 'Bueno' :
                 analysisResult.puntuacion_general >= 40 ? 'Regular' : 'Bajo'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Alerta de Ofertas por Vencer */}
        {analysisResult.ofertas_por_vencer && analysisResult.ofertas_por_vencer.length > 0 && (
          <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <Bell size={18} className="text-orange-600" />
            <AlertTitle className="text-orange-700 dark:text-orange-400">
              Ofertas Próximas a Vencer
            </AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                {analysisResult.ofertas_por_vencer.map((oferta) => (
                  <div key={oferta.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded border">
                    <div>
                      <span className="font-medium text-sm">{oferta.titulo}</span>
                      <span className="text-xs text-muted-foreground ml-2">({oferta.empresa})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-muted-foreground" />
                      <span className="text-xs">{oferta.dias_restantes} día(s)</span>
                      <Badge className={getUrgencyColor(oferta.urgencia)} variant="secondary">
                        {oferta.urgencia === 'critica' ? 'URGENTE' : 
                         oferta.urgencia === 'alta' ? 'Pronto' : 'Esta semana'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Resumen Ejecutivo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              Resumen Ejecutivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysisResult.resumen_ejecutivo}
            </p>
          </CardContent>
        </Card>

        {/* Habilidades Destacadas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy size={18} className="text-primary" />
              Habilidades Destacadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysisResult.habilidades_destacadas.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fortalezas y Áreas de Mejora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fortalezas */}
          <Card className="border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle size={18} weight="fill" />
                Fortalezas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.fortalezas.map((fortaleza, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Star size={14} className="text-green-500 mt-0.5 flex-shrink-0" weight="fill" />
                    <span>{fortaleza}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Áreas de Mejora */}
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <TrendUp size={18} weight="fill" />
                Áreas de Mejora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisResult.areas_mejora.map((area, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Lightning size={14} className="text-orange-500 mt-0.5 flex-shrink-0" weight="fill" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recomendaciones de Desarrollo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target size={18} className="text-primary" />
              Recomendaciones de Desarrollo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysisResult.recomendaciones_desarrollo.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="bg-primary/10 text-primary text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Match con Posiciones */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase size={18} className="text-primary" />
                Compatibilidad con Posiciones
              </CardTitle>
              <Badge variant="outline">
                {analysisResult.job_matches.length} posiciones analizadas
              </Badge>
            </div>
            <CardDescription>
              Plazas disponibles ordenadas por compatibilidad con el candidato
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysisResult.job_matches.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Briefcase size={32} className="mx-auto mb-2 opacity-50" />
                <p>No hay posiciones disponibles para analizar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analysisResult.job_matches.map((job, index) => (
                  <div 
                    key={job.job_id} 
                    className={`p-4 rounded-lg border ${
                      index === 0 ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          {index === 0 && (
                            <Badge className="bg-primary text-primary-foreground text-xs">
                              Mejor Match
                            </Badge>
                          )}
                          <h4 className="font-semibold">{job.job_titulo}</h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getRecommendationBadgeVariant(job.recomendacion)}>
                            {job.recomendacion}
                          </Badge>
                          {job.habilidades_coincidentes !== undefined && job.total_habilidades_requeridas !== undefined && (
                            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700">
                              <Target size={12} className="mr-1" />
                              {job.habilidades_coincidentes}/{job.total_habilidades_requeridas} habilidades
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${getScoreColor(job.compatibilidad)}`}>
                          {job.compatibilidad}%
                        </div>
                        <div className="text-xs text-muted-foreground">Compatibilidad</div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={job.compatibilidad} 
                      className="h-1.5 mb-3"
                    />

                    {/* Habilidades que tiene vs las que le faltan */}
                    {(job.habilidades_match && job.habilidades_match.length > 0) || (job.habilidades_faltantes && job.habilidades_faltantes.length > 0) ? (
                      <div className="mb-3 p-2 bg-muted/30 rounded">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
                              <CheckCircle size={12} weight="fill" />
                              Habilidades que posee:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {job.habilidades_match && job.habilidades_match.length > 0 ? (
                                job.habilidades_match.slice(0, 4).map((skill, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                    {skill}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
                              )}
                              {job.habilidades_match && job.habilidades_match.length > 4 && (
                                <Badge variant="outline" className="text-xs">+{job.habilidades_match.length - 4}</Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1 flex items-center gap-1">
                              <XCircle size={12} weight="fill" />
                              Habilidades faltantes:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {job.habilidades_faltantes && job.habilidades_faltantes.length > 0 ? (
                                job.habilidades_faltantes.slice(0, 4).map((skill, i) => (
                                  <Badge key={i} variant="outline" className="text-xs border-red-300 dark:border-red-700 text-red-600 dark:text-red-400">
                                    {skill}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-green-600">Todas cubiertas</span>
                              )}
                              {job.habilidades_faltantes && job.habilidades_faltantes.length > 4 && (
                                <Badge variant="outline" className="text-xs">+{job.habilidades_faltantes.length - 4}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                          Razones de Match:
                        </p>
                        <ul className="space-y-1">
                          {job.razones_match.slice(0, 3).map((razon, i) => (
                            <li key={i} className="text-xs flex items-start gap-1">
                              <CheckCircle size={12} className="text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{razon}</span>
                            </li>
                          ))}
                          {job.razones_match.length > 3 && (
                            <li className="text-xs text-muted-foreground">
                              +{job.razones_match.length - 3} más
                            </li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
                          Áreas a Desarrollar:
                        </p>
                        {job.gaps.length > 0 ? (
                          <ul className="space-y-1">
                            {job.gaps.slice(0, 3).map((gap, i) => (
                              <li key={i} className="text-xs flex items-start gap-1">
                                <Warning size={12} className="text-orange-500 mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{gap}</span>
                              </li>
                            ))}
                            {job.gaps.length > 3 && (
                              <li className="text-xs text-muted-foreground">
                                +{job.gaps.length - 3} más
                              </li>
                            )}
                          </ul>
                        ) : (
                          <span className="text-xs text-muted-foreground">Ninguna</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recomendación Final */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkle size={18} className="text-primary" weight="fill" />
              Recomendación Final para Gerencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed font-medium">
              {analysisResult.recomendacion_final}
            </p>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex gap-3 justify-end pt-2 pb-4">
          <Button variant="outline" onClick={handleAnalyze} className="gap-2">
            <Brain size={16} />
            Volver a Analizar
          </Button>
          <Button onClick={handleExportReport} className="gap-2 bg-red-600 hover:bg-red-700">
            <FilePdf size={16} weight="fill" />
            Exportar PDF
          </Button>
        </div>
      </div>
    </ScrollArea>
  )
}
