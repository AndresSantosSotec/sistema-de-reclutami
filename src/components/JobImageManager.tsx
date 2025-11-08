import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { X, Upload, Image as ImageIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { uploadJobImage, deleteJobImage } from '@/lib/services/jobService'

interface JobImage {
  id: string
  url: string
  descripcion?: string
}

interface JobImageManagerProps {
  jobId: string
  images: JobImage[]
  onImagesChange: () => void
}

export function JobImageManager({ jobId, images, onImagesChange }: JobImageManagerProps) {
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageDescription, setImageDescription] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño (2MB máximo)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no debe superar 2MB')
      return
    }

    // Validar formato
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validFormats.includes(file.type)) {
      toast.error('Formato no válido. Usa JPG, PNG o WEBP')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecciona una imagen primero')
      return
    }

    try {
      setUploading(true)
      await uploadJobImage(jobId, selectedFile, imageDescription)
      toast.success('Imagen subida exitosamente')
      setSelectedFile(null)
      setImageDescription('')
      onImagesChange()
    } catch (error: any) {
      console.error('Error al subir imagen:', error)
      toast.error(error.response?.data?.message || 'Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm('¿Eliminar esta imagen?')) return

    try {
      await deleteJobImage(jobId, imageId)
      toast.success('Imagen eliminada')
      onImagesChange()
    } catch (error: any) {
      console.error('Error al eliminar imagen:', error)
      toast.error(error.response?.data?.message || 'Error al eliminar la imagen')
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Imágenes de la Oferta</Label>
        <p className="text-sm text-muted-foreground">
          Sube imágenes ilustrativas del puesto (máx 2MB, JPG/PNG/WEBP)
        </p>
      </div>

      {/* Galería de imágenes existentes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="relative overflow-hidden">
              <CardContent className="p-2">
                <img
                  src={image.url}
                  alt={image.descripcion || 'Imagen de la oferta'}
                  className="w-full h-32 object-cover rounded-md"
                />
                {image.descripcion && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {image.descripcion}
                  </p>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-3 right-3 h-6 w-6 p-0"
                  onClick={() => handleDelete(image.id)}
                >
                  <X size={14} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Formulario de carga */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-file">Seleccionar Imagen</Label>
            <Input
              id="image-file"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Archivo: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-description">Descripción (opcional)</Label>
            <Input
              id="image-description"
              placeholder="Ej: Oficinas del equipo"
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              disabled={uploading}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={16} weight="bold" />
                Subir Imagen
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {images.length === 0 && !selectedFile && (
        <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
          <ImageIcon size={48} className="text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No hay imágenes. Sube la primera imagen para esta oferta.
          </p>
        </div>
      )}
    </div>
  )
}
