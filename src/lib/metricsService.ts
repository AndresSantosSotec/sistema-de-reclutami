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

export interface MetricsData {
  overview: {
    total_applications: number
    active_jobs: number
    total_candidates: number
    hired_candidates: number
    talent_bank_candidates: number
    pending_applications: number
    in_process_applications: number
  }
  applications: {
    total: number
    by_status: Record<string, number>
    average_per_day: number
    this_month: number
    last_month: number
  }
  jobs: {
    total_published: number
    active: number
    closed: number
    average_applications_per_job: number
    jobs_with_no_applications: number
  }
  candidates: {
    total: number
    new_in_period: number
    with_experience: number
    with_education: number
    with_skills: number
    average_applications_per_candidate: number
  }
  time_to_hire: {
    average_days: number
    min_days: number
    max_days: number
    median_days: number
    total_hired: number
  }
  top_jobs: Array<{
    job_id: number
    title: string
    company: string
    location: string
    category: string
    applications_count: number
  }>
  top_categories: Array<{
    id: number
    nombre: string
    total: number
  }>
  conversion_rates: {
    to_cv_viewed: number
    to_in_process: number
    to_finalist: number
    to_hired: number
    rejection_rate: number
  }
  applications_by_month: Array<{
    month: string
    month_name: string
    count: number
  }>
  applications_by_status: Array<{
    status: string
    count: number
  }>
  hiring_trends: Array<{
    date: string
    count: number
  }>
  geographic_distribution: Array<{
    location: string
    count: number
  }>
}

export interface MetricsResponse {
  success: boolean
  data: MetricsData
  period: {
    start: string
    end: string
    months: number
  }
}

export const metricsService = {
  /**
   * Obtener tipos de reportes disponibles
   */
  async getReportTypes(): Promise<Record<string, string>> {
    const defaultTypes = {
      resumen: 'Resumen Ejecutivo',
      detallado: 'Reporte Detallado',
      ejecutivo: 'Reporte Ejecutivo',
    }
    
    try {
      const url = `${API_URL}/admin/metrics/report-types`
      const response = await axios.get<{ success: boolean; data: any }>(url, getAuthHeaders())
      
      if (!response.data.success) {
        return defaultTypes
      }
      
      const data = response.data.data
      
      // Si el backend devuelve formato anidado {pdf: {...}}, extraer pdf
      if (data && typeof data === 'object') {
        if ('pdf' in data && typeof data.pdf === 'object') {
          return data.pdf as Record<string, string>
        }
        // Si es formato plano {resumen: '...', detallado: '...'}, devolverlo directamente
        if ('resumen' in data || 'detallado' in data || 'ejecutivo' in data) {
          return data as Record<string, string>
        }
      }
      
      return defaultTypes
    } catch (error: any) {
      // No lanzar error, retornar tipos por defecto
      console.warn('⚠️ [MetricsService] No se pudieron cargar tipos de reportes, usando valores por defecto')
      return defaultTypes
    }
  },

  /**
   * Obtener todas las métricas
   */
  async getMetrics(
    months: number = 6,
    startDate?: string,
    endDate?: string
  ): Promise<MetricsData> {
    try {
      const params = new URLSearchParams()
      
      if (startDate && endDate) {
        params.append('start_date', startDate)
        params.append('end_date', endDate)
      } else if (months !== 6) {
        params.append('months', months.toString())
      }

      const queryString = params.toString()
      const url = `${API_URL}/admin/metrics${queryString ? `?${queryString}` : ''}`

      // console.log('📊 [MetricsService] Obteniendo métricas...', { months, startDate, endDate })
      const response = await axios.get<MetricsResponse>(url, getAuthHeaders())

      if (!response.data.success) {
        throw new Error('Error al obtener métricas')
      }

      // console.log('✅ [MetricsService] Métricas recibidas:', response.data.data)
      return response.data.data
    } catch (error: any) {
      console.error('❌ [MetricsService] Error al obtener métricas:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Exportar reporte de métricas
   */
  async exportReport(
    format: 'pdf' | 'excel',
    months: number = 6,
    startDate?: string,
    endDate?: string,
    options?: {
      overview?: boolean
      applications?: boolean
      jobs?: boolean
      candidates?: boolean
      timeToHire?: boolean
      topJobs?: boolean
      topCategories?: boolean
      conversionRates?: boolean
      applicationsByMonth?: boolean
      applicationsByStatus?: boolean
      geographicDistribution?: boolean
      hiringTrends?: boolean
    },
    reportType?: string
  ): Promise<Blob> {
    try {
      const params = new URLSearchParams()
      params.append('format', format)
      
      if (reportType) {
        params.append('type', reportType)
      }
      
      if (startDate && endDate) {
        params.append('start_date', startDate)
        params.append('end_date', endDate)
      } else if (months !== 6) {
        params.append('months', months.toString())
      }

      // Agregar opciones del reporte si se proporcionan (solo para Excel)
      if (format === 'excel' && options) {
        Object.entries(options).forEach(([key, value]) => {
          if (value !== undefined) {
            params.append(`options[${key}]`, value ? '1' : '0')
          }
        })
      }

      const url = `${API_URL}/admin/metrics/export?${params.toString()}`

      // console.log('📥 [MetricsService] Exportando reporte...', { format, months, startDate, endDate })
      const response = await axios.get(url, {
        ...getAuthHeaders(),
        responseType: 'blob', // Ambos formatos son binarios
        timeout: 120000 // 120 segundos para archivos grandes
      })

      // Verificar que la respuesta sea un blob válido
      if (!response.data || !(response.data instanceof Blob)) {
        throw new Error('La respuesta no es un archivo válido')
      }

      // Establecer el tipo MIME correcto según el formato
      const mimeType = format === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.ms-excel'
      
      const blob = new Blob([response.data], { type: mimeType })
      // console.log('📦 [MetricsService] Archivo generado correctamente:', format, 'Size:', blob.size, 'bytes')
      return blob
    } catch (error: any) {
      console.error('❌ [MetricsService] Error al exportar reporte:', error.response?.data || error.message)
      throw error
    }
  },
}

