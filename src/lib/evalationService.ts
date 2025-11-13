import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1/admin';

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

export interface Evaluation {
  id: number
  aplicacion_id: number
  tipo: 'tecnico' | 'psicologico' | 'entrevista'
  modo: 'online' | 'presencial'
  fecha_programada: string
  estado: 'pendiente' | 'completada' | 'cancelada'
  resultados: string | null
}

export interface EvaluationCreateData {
  aplicacion_id: number
  tipo: 'tecnico' | 'psicologico' | 'entrevista'
  modo: 'online' | 'presencial'
  fecha_programada: string
}

const evalationService = {
  // Listar evaluaciones
  async getEvaluations(): Promise<Evaluation[]> {
    const response = await axios.get(`${API_URL}/evaluations`, getAuthHeaders())
    return response.data
  },

  async createEvaluation(data: EvaluationCreateData): Promise<Evaluation> {
    const response = await axios.post(`${API_URL}/evaluations`, data, getAuthHeaders())
    return response.data
  },

  async updateEvaluation(id: number, data: Partial<EvaluationCreateData>): Promise<Evaluation> {
    const response = await axios.put(`${API_URL}/evaluations/${id}`, data, getAuthHeaders())
    return response.data
  },

    async deleteEvaluation(id: number): Promise<void> {
      await axios.delete(`${API_URL}/evaluations/${id}`, getAuthHeaders())
    }
  }
  
  export default evalationService