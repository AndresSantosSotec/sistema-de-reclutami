import axios from "axios";

// Consistente con otros servicios: usar la misma base URL
const API_URL = import.meta.env.VITE_API_URL || 'https://oportunidadescoosanjer.com.gt/api/v1';

// Configurar axios con el token del admin
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token')
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  }
}

// Tipos del backend
export interface BackendEvaluation {
  id: number
  postulante_id: number
  postulante: {
    id: number
    nombre: string
    email: string | null
  }
  tipo_evaluacion: 'Entrevista' | 'Prueba Técnica' | 'Prueba Psicológica' | 'Otro'
  modalidad: 'Virtual' | 'Presencial'
  fecha: string
  hora: string
  responsable: string | null
  observaciones: string | null
  resultado: string | null
  completada: boolean
  created_at: string
  updated_at: string
}

export interface EvaluationCreateData {
  postulante_id: number
  aplicacion_id?: number
  tipo_evaluacion: 'Entrevista' | 'Prueba Técnica' | 'Prueba Psicológica' | 'Otro'
  modalidad: 'Virtual' | 'Presencial'
  fecha: string
  hora: string
  responsable?: string
  observaciones?: string
}

export interface EvaluationUpdateData {
  tipo_evaluacion?: 'Entrevista' | 'Prueba Técnica' | 'Prueba Psicológica' | 'Otro'
  modalidad?: 'Virtual' | 'Presencial'
  fecha?: string
  hora?: string
  responsable?: string
  observaciones?: string
  resultado?: string
}

// Mapear tipo de evaluación frontend -> backend
const mapTypeToBackend = (type: string): 'Entrevista' | 'Prueba Técnica' | 'Prueba Psicológica' | 'Otro' => {
  const mapping: Record<string, 'Entrevista' | 'Prueba Técnica' | 'Prueba Psicológica' | 'Otro'> = {
    'interview': 'Entrevista',
    'technical-test': 'Prueba Técnica',
    'psychometric-test': 'Prueba Psicológica',
    'other': 'Otro',
  }
  return mapping[type] || 'Otro'
}

// Mapear modalidad frontend -> backend
const mapModeToBackend = (mode: string): 'Virtual' | 'Presencial' => {
  return mode === 'virtual' ? 'Virtual' : 'Presencial'
}

// Mapear evaluación backend -> frontend
const mapBackendToFrontend = (backend: BackendEvaluation) => {
  // Mapear tipo de vuelta
  let type: 'interview' | 'technical-test' | 'psychometric-test' | 'other' = 'other'
  if (backend.tipo_evaluacion === 'Entrevista') type = 'interview'
  else if (backend.tipo_evaluacion === 'Prueba Técnica') type = 'technical-test'
  else if (backend.tipo_evaluacion === 'Prueba Psicológica') type = 'psychometric-test'

  // Mapear modalidad
  let mode: 'virtual' | 'in-person' | 'phone' = 'virtual'
  if (backend.modalidad === 'Virtual') mode = 'virtual'
  else if (backend.modalidad === 'Presencial') mode = 'in-person'

  return {
    id: backend.id.toString(),
    applicationId: '', // Se puede obtener de la aplicación si está disponible
    candidateId: backend.postulante_id.toString(),
    type,
    mode,
    scheduledDate: backend.fecha,
    scheduledTime: backend.hora,
    interviewer: backend.responsable || undefined,
    result: backend.resultado || undefined,
    observations: backend.observaciones || undefined,
    createdAt: backend.created_at,
    completedAt: backend.completada ? backend.updated_at : undefined,
  }
}

const evalationService = {
  // Listar evaluaciones
  async getEvaluations(filters?: { postulante_id?: number }): Promise<any[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.postulante_id) {
        params.append('postulante_id', filters.postulante_id.toString())
      }
      
      const queryString = params.toString()
      const url = `${API_URL}/admin/evaluations${queryString ? `?${queryString}` : ''}`
      
      const response = await axios.get(url, getAuthHeaders())
      const backendEvaluations: BackendEvaluation[] = response.data.data || []
      return backendEvaluations.map(mapBackendToFrontend)
    } catch (error: any) {
      console.error('Error al obtener evaluaciones:', error)
      throw error
    }
  },

  async createEvaluation(data: {
    postulante_id: number
    aplicacion_id?: number
    tipo_evaluacion: string
    modalidad: string
    fecha: string
    hora: string
    responsable?: string
    observaciones?: string
  }): Promise<any> {
    try {
      const backendData: EvaluationCreateData = {
        postulante_id: data.postulante_id,
        aplicacion_id: data.aplicacion_id,
        tipo_evaluacion: mapTypeToBackend(data.tipo_evaluacion),
        modalidad: mapModeToBackend(data.modalidad) as 'Virtual' | 'Presencial',
        fecha: data.fecha,
        hora: data.hora,
        responsable: data.responsable,
        observaciones: data.observaciones,
      }

      const url = `${API_URL}/admin/evaluations`
      const headers = getAuthHeaders()
      
      // console.log('🔄 [evalationService] Creando evaluación:', {
      //   url: url,
      //   baseURL: API_URL,
      //   endpoint: '/admin/evaluations',
      //   fullURL: url,
      //   hasAuthToken: !!localStorage.getItem('admin_token'),
      //   data: backendData,
      //   headers: {
      //     hasAuthorization: !!headers.headers.Authorization,
      //     contentType: headers.headers['Content-Type']
      //   }
      // })

      const response = await axios.post(url, backendData, headers)
      
      // console.log('✅ [evalationService] Respuesta del servidor:', response.data)
      
      if (response.data.success && response.data.data) {
        // Recargar las evaluaciones para obtener la lista actualizada
        return response.data.data
      }
      
      return response.data
    } catch (error: any) {
      console.error('❌ [evalationService] Error al crear evaluación:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
      })
      throw error
    }
  },

  async updateEvaluation(id: number, data: Partial<EvaluationUpdateData>): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/admin/evaluations/${id}`, data, getAuthHeaders())
      return response.data.data || response.data
    } catch (error: any) {
      console.error('Error al actualizar evaluación:', error)
      throw error
    }
  },

  async deleteEvaluation(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/admin/evaluations/${id}`, getAuthHeaders())
    } catch (error: any) {
      console.error('Error al eliminar evaluación:', error)
      throw error
    }
  }
}

export default evalationService