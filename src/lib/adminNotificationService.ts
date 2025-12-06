import api from './api'

export interface NotificationCandidate {
  id: number
  name: string
  email: string
  foto?: string | null
}

export interface AdminNotification {
  id_notificacion: number
  postulante_id: number
  titulo: string
  mensaje: string
  tipo: 'Sistema' | 'Postulación' | 'Recordatorio' | 'Alerta' | 'Manual'
  leido: boolean
  created_at: string
  postulante?: {
    id_postulante: number
    user?: {
      id: number
      name: string
      email: string
    }
  }
}

export interface NotificationStats {
  total: number
  por_tipo: Record<string, number>
  sin_leer: number
  ultimas_24h: number
  ultima_semana: number
}

export interface SendNotificationData {
  postulante_id: number
  titulo: string
  mensaje: string
  tipo?: 'Sistema' | 'Postulación' | 'Recordatorio' | 'Alerta' | 'Manual'
  enviar_email?: boolean
}

export interface SendBulkNotificationData {
  postulante_ids: number[]
  titulo: string
  mensaje: string
  tipo?: 'Sistema' | 'Postulación' | 'Recordatorio' | 'Alerta' | 'Manual'
  enviar_email?: boolean
}

interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface SendNotificationResponse {
  success: boolean
  message: string
  data: {
    notification_id: number
    email_sent: boolean
  }
}

interface BulkSendResponse {
  success: boolean
  message: string
  data: {
    total: number
    enviados: number
    emails_enviados: number
    errores: Array<{ postulante_id: number; error: string }>
  }
}

/**
 * Servicio para gestionar notificaciones desde el panel de admin
 */
class AdminNotificationService {
  private baseUrl = '/admin/notifications'

  /**
   * Obtener todas las notificaciones con filtros y paginación
   */
  async getNotifications(params?: {
    page?: number
    per_page?: number
    tipo?: string
    postulante_id?: number
    search?: string
  }): Promise<PaginatedResponse<AdminNotification>> {
    const response = await api.get<PaginatedResponse<AdminNotification>>(this.baseUrl, { params })
    return response.data
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  async getStats(): Promise<NotificationStats> {
    const response = await api.get<ApiResponse<NotificationStats>>(`${this.baseUrl}/stats`)
    return response.data.data
  }

  /**
   * Obtener lista de candidatos para el selector
   */
  async getCandidates(search?: string): Promise<NotificationCandidate[]> {
    const response = await api.get<ApiResponse<NotificationCandidate[]>>(`${this.baseUrl}/candidates`, {
      params: { search }
    })
    return response.data.data
  }

  /**
   * Enviar notificación personalizada a un candidato
   */
  async sendNotification(data: SendNotificationData): Promise<SendNotificationResponse> {
    const response = await api.post<SendNotificationResponse>(`${this.baseUrl}/send`, data)
    return response.data
  }

  /**
   * Enviar notificación masiva a múltiples candidatos
   */
  async sendBulkNotification(data: SendBulkNotificationData): Promise<BulkSendResponse> {
    const response = await api.post<BulkSendResponse>(`${this.baseUrl}/send-bulk`, data)
    return response.data
  }

  /**
   * Eliminar una notificación
   */
  async deleteNotification(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`)
  }
}

export const adminNotificationService = new AdminNotificationService()
