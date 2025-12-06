import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { adminCandidateService, AdminCandidate } from '@/lib/adminCandidateService'
import { mapBackendCandidateToFrontend } from '@/lib/dataMappers'
import type { Candidate as FrontendCandidate } from '@/lib/types'

export function useCandidates() {
  const [candidates, setCandidates] = useState<FrontendCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 50,
    current_page: 1,
    last_page: 1
  })

  // Cargar candidatos desde el backend con paginación
  const fetchCandidates = useCallback(async (filters?: {
    search?: string
    ubicacion?: string
    profesion?: string
    habilidad_id?: number
    fecha_desde?: string
    fecha_hasta?: string
    min_experiencia?: number
    page?: number
    per_page?: number
  }) => {
    // Verificar token antes de hacer petición
    const token = localStorage.getItem('admin_token')
    if (!token) {
      console.log('⏳ [useCandidates] No hay token, esperando autenticación...')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 [useCandidates] Cargando candidatos...', filters)
      const response = await adminCandidateService.getAllCandidates(filters)
      console.log('✅ [useCandidates] Candidatos cargados:', response.data.length, 'de', response.total)
      
      // Mapear a formato frontend
      const mappedCandidates = response.data.map(mapBackendCandidateToFrontend)
      setCandidates(mappedCandidates)
      setPagination({
        total: response.total,
        per_page: response.per_page,
        current_page: response.current_page,
        last_page: response.last_page
      })
    } catch (err: any) {
      console.error('❌ [useCandidates] Error:', err.message)
      if (err.response?.status !== 401) {
        const errorMessage = err.response?.data?.message || 'Error al cargar los candidatos'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Exportar candidatos
  const exportCandidates = useCallback(async (format: 'csv' | 'excel' | 'pdf', filters?: {
    search?: string
    ubicacion?: string
    profesion?: string
    habilidad_id?: number
    fecha_desde?: string
    fecha_hasta?: string
    min_experiencia?: number
  }) => {
    try {
      const formatNames = {
        csv: 'CSV',
        excel: 'Excel',
        pdf: 'PDF'
      }
      toast.info(`Generando archivo ${formatNames[format]}...`)
      
      const blob = await adminCandidateService.exportCandidates(format, filters)
      
      if (format === 'pdf') {
        // Para PDF, el backend retorna HTML, así que lo abrimos en una nueva ventana
        try {
          const htmlContent = await blob.text()
          
          // Crear un blob URL para el HTML
          const htmlBlob = new Blob([htmlContent], { type: 'text/html; charset=utf-8' })
          const htmlUrl = window.URL.createObjectURL(htmlBlob)
          
          // Abrir en nueva ventana usando blob URL
          const newWindow = window.open(htmlUrl, '_blank')
          
          if (newWindow) {
            // Esperar a que cargue y luego mostrar opción de imprimir
            setTimeout(() => {
              try {
                newWindow.print()
                toast.success('PDF generado. Usa "Guardar como PDF" en el diálogo de impresión.')
              } catch (printError) {
                console.error('Error al imprimir:', printError)
                toast.info('Ventana abierta. Usa Ctrl+P o Cmd+P para imprimir y guardar como PDF.')
              }
            }, 1000)
            
            // Limpiar URL después de un tiempo
            setTimeout(() => {
              window.URL.revokeObjectURL(htmlUrl)
            }, 5000)
          } else {
            // Si no se puede abrir, descargar como HTML
            const link = document.createElement('a')
            link.href = htmlUrl
            link.download = `candidatos_${new Date().toISOString().split('T')[0]}.html`
            link.click()
            window.URL.revokeObjectURL(htmlUrl)
            toast.info('Se descargó como HTML. Ábrelo en tu navegador y usa "Imprimir" > "Guardar como PDF"')
          }
        } catch (error) {
          console.error('Error al procesar PDF:', error)
          toast.error('Error al generar el PDF. Intenta nuevamente.')
        }
      } else {
        // Para Excel y CSV, descargar normalmente
        const mimeTypes = {
          csv: 'text/csv;charset=utf-8;',
          excel: 'application/vnd.ms-excel'
        }
        
        // Crear un nuevo Blob con el tipo MIME correcto
        const typedBlob = new Blob([blob], { type: mimeTypes[format] })
        
        // Crear enlace de descarga
        const url = window.URL.createObjectURL(typedBlob)
        const link = document.createElement('a')
        link.href = url
        const extension = format === 'excel' ? 'xls' : 'csv'
        link.download = `candidatos_${new Date().toISOString().split('T')[0]}.${extension}`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        
        // Limpiar después de un delay
        setTimeout(() => {
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        }, 100)
        
        toast.success(`Candidatos exportados correctamente (${formatNames[format]})`)
      }
    } catch (err: any) {
      console.error('❌ [ERROR] Error al exportar:', err)
      
      // Si el error es un blob (puede contener un mensaje de error del servidor)
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text()
          const errorData = JSON.parse(text)
          toast.error(errorData.message || 'Error al exportar candidatos')
        } catch {
          toast.error('Error al generar el archivo. Verifica que el servidor esté funcionando correctamente.')
        }
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Error al exportar candidatos'
        toast.error(errorMessage)
      }
    }
  }, [])

  // Cargar candidatos al montar el componente
  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      fetchCandidates()
    } else {
      setLoading(false)
    }
  }, []) // Solo al montar

  return {
    candidates,
    loading,
    error,
    pagination,
    fetchCandidates,
    refetch: fetchCandidates, // Agregar alias para refetch
    exportCandidates,
  }
}
