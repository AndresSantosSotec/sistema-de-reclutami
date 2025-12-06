import api from './api'

export interface MyNotification {
  id: number
  type: 'new_application' | 'candidate_registered' | 'test_completed' | 'evaluation_completed' | 'system' | 'alert'
  title: string
  message: string
  read: boolean
  read_at: string | null
  created_at: string
  time_ago: string
  icon: string
  color: string
  metadata: {
    candidate_name?: string
    candidate_email?: string
    job_title?: string
    job_location?: string
    applied_at?: string
    [key: string]: any
  } | null
  postulante?: {
    id: number
    nombre: string
    email: string
  } | null
  oferta?: {
    id: number
    titulo: string
  } | null
}

export interface NotificationStats {
  total: number
  unread: number
  today: number
  by_type: Record<string, number>
}

export interface PaginatedNotifications {
  data: MyNotification[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  unread_count: number
}

class MyNotificationsService {
  private baseUrl = '/admin/my-notifications'

  /**
   * Obtener notificaciones del admin autenticado
   */
  async getNotifications(params?: {
    per_page?: number
    page?: number
    type?: string
  }): Promise<PaginatedNotifications> {
    const response = await api.get<{ success: boolean; data: MyNotification[]; pagination: any; unread_count: number }>(
      this.baseUrl,
      { params }
    )
    return {
      data: response.data.data,
      pagination: response.data.pagination,
      unread_count: response.data.unread_count,
    }
  }

  /**
   * Obtener cantidad de notificaciones no leídas
   */
  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ success: boolean; data: { unread_count: number } }>(
      `${this.baseUrl}/unread-count`
    )
    return response.data.data.unread_count
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  async getStats(): Promise<NotificationStats> {
    const response = await api.get<{ success: boolean; data: NotificationStats }>(
      `${this.baseUrl}/stats`
    )
    return response.data.data
  }

  /**
   * Marcar una notificación como leída
   */
  async markAsRead(id: number): Promise<void> {
    await api.put(`${this.baseUrl}/${id}/read`)
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<{ marked_count: number }> {
    const response = await api.put<{ success: boolean; data: { marked_count: number } }>(
      `${this.baseUrl}/read-all`
    )
    return response.data.data
  }

  /**
   * Eliminar una notificación
   */
  async deleteNotification(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`)
  }

  /**
   * Obtener color CSS según el tipo de notificación
   */
  getTypeColor(type: MyNotification['type']): string {
    const colors: Record<string, string> = {
      new_application: 'bg-blue-100 text-blue-800 border-blue-200',
      candidate_registered: 'bg-green-100 text-green-800 border-green-200',
      test_completed: 'bg-purple-100 text-purple-800 border-purple-200',
      evaluation_completed: 'bg-orange-100 text-orange-800 border-orange-200',
      system: 'bg-gray-100 text-gray-800 border-gray-200',
      alert: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[type] || colors.system
  }

  /**
   * Obtener etiqueta legible del tipo
   */
  getTypeLabel(type: MyNotification['type']): string {
    const labels: Record<string, string> = {
      new_application: 'Nueva Postulación',
      candidate_registered: 'Nuevo Candidato',
      test_completed: 'Prueba Completada',
      evaluation_completed: 'Evaluación Completada',
      system: 'Sistema',
      alert: 'Alerta',
    }
    return labels[type] || 'Notificación'
  }
}

export const myNotificationsService = new MyNotificationsService()
