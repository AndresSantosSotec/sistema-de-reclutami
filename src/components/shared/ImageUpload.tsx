import { useCallback, useState } from 'react'
import { Camera, X, Image as ImageIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  currentImage?: string
  aspectRatio?: 'square' | 'banner'
  label?: string
  className?: string
}

export function ImageUpload({ 
  onImageSelect, 
  currentImage,
  aspectRatio = 'banner',
  label = 'Subir imagen',
  className 
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)

  const maxSize = 5 * 1024 * 1024

  const validateImage = (file: File): boolean => {
    if (file.size > maxSize) {
      toast.error(`La imagen es demasiado grande. Máximo ${(maxSize / 1024 / 1024).toFixed(1)}MB`)
      return false
    }
    
    const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Formato no permitido. Usa JPG, PNG o WebP')
      return false
    }
    
    return true
  }

  const handleFile = (file: File) => {
    if (validateImage(file)) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
        onImageSelect(file)
        toast.success('Imagen cargada exitosamente')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFile(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
  }

  const aspectClasses = aspectRatio === 'square' 
    ? 'aspect-square' 
    : 'aspect-[2/1]'

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-xl overflow-hidden transition-all duration-200 cursor-pointer relative',
          aspectClasses,
          isDragging 
            ? 'border-primary bg-primary/5 scale-[0.98]' 
            : 'border-border hover:border-primary/50'
        )}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp"
          onChange={handleFileInput}
          className="hidden"
          id="image-upload"
        />
        
        {preview ? (
          <div className="relative w-full h-full group">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={handleRemove}
                className="p-3 bg-destructive rounded-full hover:scale-110 transition-transform"
              >
                <X size={24} weight="bold" className="text-destructive-foreground" />
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor="image-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center p-8 bg-muted/30">
            <Camera size={40} className="text-muted-foreground mb-3" weight="duotone" />
            <p className="text-sm font-medium mb-1">{label}</p>
            <p className="text-xs text-muted-foreground text-center">
              Arrastra una imagen o haz clic
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              JPG, PNG o WebP • Máximo 5MB
            </p>
          </label>
        )}
      </div>
    </div>
  )
}