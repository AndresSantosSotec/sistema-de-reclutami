import { useCallback, useState } from 'react'
import { Upload, File, X, CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface FileUploadProps {
  accept?: string
  maxSize?: number
  onFileSelect: (file: File) => void
  currentFile?: string
  label?: string
  className?: string
}

export function FileUpload({ 
  accept = '.pdf,.doc,.docx', 
  maxSize = 5 * 1024 * 1024,
  onFileSelect, 
  currentFile,
  label = 'Subir archivo',
  className 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      toast.error(`El archivo es demasiado grande. Máximo ${(maxSize / 1024 / 1024).toFixed(1)}MB`)
      return false
    }
    
    const acceptedTypes = accept.split(',').map(t => t.trim())
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!acceptedTypes.includes(fileExtension)) {
      toast.error(`Tipo de archivo no permitido. Formatos aceptados: ${accept}`)
      return false
    }
    
    return true
  }

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file)
      onFileSelect(file)
      toast.success('Archivo cargado exitosamente')
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
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

  const handleRemove = () => {
    setSelectedFile(null)
  }

  const displayFileName = selectedFile?.name || currentFile?.split('/').pop() || null

  return (
    <div className={cn('space-y-2', className)}>
      {!displayFileName ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer',
            isDragging 
              ? 'border-primary bg-primary/5 scale-[0.98]' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          )}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer block">
            <Upload size={32} className="mx-auto text-muted-foreground mb-3" weight="duotone" />
            <p className="text-sm font-medium mb-1">{label}</p>
            <p className="text-xs text-muted-foreground">
              Arrastra un archivo aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Formatos: {accept} • Máximo {(maxSize / 1024 / 1024).toFixed(1)}MB
            </p>
          </label>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl">
          <div className="flex items-center justify-center w-10 h-10 bg-success/20 rounded-lg">
            <File size={20} weight="duotone" className="text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{displayFileName}</p>
            {selectedFile && (
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
          <CheckCircle size={20} weight="fill" className="text-success flex-shrink-0" />
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>
      )}
    </div>
  )
}