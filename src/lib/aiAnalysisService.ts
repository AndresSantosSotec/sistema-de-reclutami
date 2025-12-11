import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token')
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }
}

export interface ExpiringJob {
  id: number
  titulo: string
  empresa: string
  fecha_limite: string
  dias_restantes: number
  urgencia: 'critica' | 'alta' | 'media'
}

export interface JobMatch {
  job_id: number
  job_titulo: string
  compatibilidad: number
  total_habilidades_requeridas?: number
  habilidades_coincidentes?: number
  habilidades_match?: string[]
  habilidades_faltantes?: string[]
  razones_match: string[]
  gaps: string[]
  recomendacion: 'Altamente Recomendado' | 'Recomendado' | 'Considerar' | 'No Recomendado'
}

export interface AIAnalysisResult {
  resumen_ejecutivo: string
  puntuacion_general: number
  fortalezas: string[]
  areas_mejora: string[]
  habilidades_destacadas: string[]
  nivel_experiencia: 'Junior' | 'Semi-Senior' | 'Senior' | 'Executive'
  job_matches: JobMatch[]
  recomendaciones_desarrollo: string[]
  recomendacion_final: string
  ofertas_por_vencer?: ExpiringJob[]
}

export interface AIAnalysisResponse {
  success: boolean
  data: AIAnalysisResult
  cached: boolean
  analyzed_at?: string
  message?: string
}

export const aiAnalysisService = {
  /**
   * Analizar candidato con IA
   * Genera un nuevo análisis o retorna el cacheado
   */
  async analyzeCandidate(candidateId: number, forceRefresh = false): Promise<AIAnalysisResult> {
    try {
      // console.log('🤖 [AIAnalysis] Analizando candidato:', candidateId, { forceRefresh })
      
      const response = await axios.post<AIAnalysisResponse>(
        `${API_URL}/admin/candidates/${candidateId}/ai-analyze`,
        { force_refresh: forceRefresh },
        {
          ...getAuthHeaders(),
          timeout: 120000 // 2 minutos para análisis de IA
        }
      )

      if (!response.data.success) {
        throw new Error(response.data.message || 'Error al analizar candidato')
      }

      // console.log('✅ [AIAnalysis] Análisis completado:', {
      //   cached: response.data.cached,
      //   score: response.data.data.puntuacion_general,
      //   matches: response.data.data.job_matches.length
      // })

      return response.data.data
    } catch (error: any) {
      console.error('❌ [AIAnalysis] Error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || 'Error al analizar el candidato con IA')
    }
  },

  /**
   * Obtener análisis guardado (sin regenerar)
   */
  async getStoredAnalysis(candidateId: number): Promise<AIAnalysisResult | null> {
    try {
      const response = await axios.get<AIAnalysisResponse>(
        `${API_URL}/admin/candidates/${candidateId}/ai-analysis`,
        getAuthHeaders()
      )

      if (!response.data.success) {
        return null
      }

      return response.data.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      console.error('❌ [AIAnalysis] Error al obtener análisis:', error.message)
      return null
    }
  },

  /**
   * Limpiar caché del análisis
   */
  async clearAnalysis(candidateId: number): Promise<void> {
    try {
      await axios.delete(
        `${API_URL}/admin/candidates/${candidateId}/ai-analysis`,
        getAuthHeaders()
      )
      // console.log('🗑️ [AIAnalysis] Caché limpiado para candidato:', candidateId)
    } catch (error: any) {
      console.error('❌ [AIAnalysis] Error al limpiar caché:', error.message)
    }
  },

  /**
   * Obtener color del badge según recomendación
   */
  getRecommendationColor(recomendacion: string): string {
    switch (recomendacion) {
      case 'Altamente Recomendado':
        return 'bg-green-500'
      case 'Recomendado':
        return 'bg-blue-500'
      case 'Considerar':
        return 'bg-yellow-500'
      case 'No Recomendado':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  },

  /**
   * Obtener color de barra de progreso según puntuación
   */
  getScoreColor(score: number): string {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  },

  /**
   * Obtener badge de nivel de experiencia
   */
  getExperienceLevelVariant(level: string): 'default' | 'secondary' | 'outline' | 'destructive' {
    switch (level) {
      case 'Executive':
        return 'default'
      case 'Senior':
        return 'default'
      case 'Semi-Senior':
        return 'secondary'
      case 'Junior':
        return 'outline'
      default:
        return 'outline'
    }
  }
}

export default aiAnalysisService
