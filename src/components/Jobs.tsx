import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { Plus, PencilSimple, Trash, Eye, EyeSlash, Calendar, X, Image as ImageIcon, ImagesSquare } from '@phosphor-icons/react'
import { JobImageManager } from '@/components/JobImageManager'
import type { JobOffer, ContractType, JobVisibility, JobStatus, JobCategory } from '@/lib/types'
import { contractTypeLabels, jobStatusLabels, formatDate, daysUntilDeadline } from '@/lib/constants'
import { toast } from 'sonner'
import { skillService, type Skill } from '@/lib/services/skillService'

interface JobsProps {
  jobs: JobOffer[]
  categories: JobCategory[]
  onAddJob: (job: Omit<JobOffer, 'id' | 'createdAt' | 'updatedAt'>, image?: File, skillIds?: string[]) => void
  onUpdateJob: (id: string, job: Partial<JobOffer>, skillIds?: string[]) => void
  onDeleteJob: (id: string) => void
}

export function Jobs({ jobs, categories, onAddJob, onUpdateJob, onDeleteJob }: JobsProps) {
  // Estados para los filtros
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    contractType: 'all',
    categoryId: 'all',
  })
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10) // Número de elementos por página
  
  // Filtrar trabajos según los filtros
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = filters.searchTerm === '' || 
      job.title?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      job.requirements?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      
    const matchesStatus = filters.status === 'all' || job.status === filters.status
    const matchesContractType = filters.contractType === 'all' || job.contractType === filters.contractType
    const matchesCategory = filters.categoryId === 'all' || job.categoryId === filters.categoryId
    
    return matchesSearch && matchesStatus && matchesContractType && matchesCategory
  })
  
  // Calcular el total de páginas
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage)
  
  // Obtener los trabajos para la página actual
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentJobs = filteredJobs.slice(indexOfFirstItem, indexOfLastItem)
  
  // Cambiar de página
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const nextPage = () => {
    setCurrentPage(prev => {
      const next = Math.min(prev + 1, totalPages)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return next
    })
  }
  
  const prevPage = () => {
    setCurrentPage(prev => {
      const prevPage = Math.max(prev - 1, 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return prevPage
    })
  }
  
  // Manejar cambios en los filtros
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
    setCurrentPage(1) // Resetear a la primera página al cambiar filtros
  }

  // Manejar cambio de items por página
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1) // Resetear a la primera página
  }
  
  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      contractType: 'all',
      categoryId: 'all',
    })
  }
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobOffer | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false)
  
  // Estados para habilidades
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [skillSearchTerm, setSkillSearchTerm] = useState('')
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>('all')
  const [isSkillsDropdownOpen, setIsSkillsDropdownOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    description: '',
    requirements: '',
    location: '',
    contractType: 'full-time' as ContractType,
    salaryMin: '',
    salaryMax: '',
    deadline: '',
    visibility: 'public' as JobVisibility,
    status: 'active' as JobStatus
  })

  // Cargar habilidades al montar el componente
  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      const skills = await skillService.getSkills({ solo_activas: true })
      setAllSkills(skills)
    } catch (error) {
      toast.error('Error al cargar las habilidades')
    }
  }

  // Limpiar URL de vista previa cuando cambia la imagen
  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage)
      setImagePreviewUrl(url)
      
      // Cleanup: liberar memoria cuando el componente se desmonte o cambie la imagen
      return () => URL.revokeObjectURL(url)
    } else {
      setImagePreviewUrl(null)
    }
  }, [selectedImage])

  const handleOpenDialog = (job?: JobOffer) => {
    if (job) {
      setEditingJob(job)
      setFormData({
        title: job.title,
        categoryId: job.categoryId || '',
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        contractType: job.contractType,
        salaryMin: job.salaryMin?.toString() || '',
        salaryMax: job.salaryMax?.toString() || '',
        deadline: job.deadline,
        visibility: job.visibility,
        status: job.status
      })
      // Cargar habilidades si existen
      if (job.skills) {
        setSelectedSkills(job.skills.map(s => s.id))
      }
    } else {
      setEditingJob(null)
      setSelectedImage(null)
      setSelectedSkills([])
      setSkillSearchTerm('')
      setSkillCategoryFilter('all')
      setFormData({
        title: '',
        categoryId: '',
        description: '',
        requirements: '',
        location: '',
        contractType: 'full-time',
        salaryMin: '',
        salaryMax: '',
        deadline: '',
        visibility: 'public',
        status: 'active'
      })
    }
    setIsDialogOpen(true)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setSelectedImage(file)
  }

  // Funciones para manejar habilidades
  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    )
  }

  const removeSkill = (skillId: string) => {
    setSelectedSkills(prev => prev.filter(id => id !== skillId))
  }

  // Obtener categorías únicas de habilidades
  const skillCategories = Array.from(new Set(allSkills.map(s => s.categoria).filter(Boolean)))

  // Filtrar habilidades según búsqueda y categoría
  const filteredSkills = allSkills.filter(skill => {
    const matchesSearch = skill.nombre?.toLowerCase().includes(skillSearchTerm.toLowerCase())
    const matchesCategory = skillCategoryFilter === 'all' || skill.categoria === skillCategoryFilter
    return matchesSearch && matchesCategory && !selectedSkills.includes(skill.id)
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.deadline) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    // Convertir formData a JobOffer format
    const jobDataToSend: Partial<JobOffer> = {
      title: formData.title,
      categoryId: formData.categoryId,
      description: formData.description,
      requirements: formData.requirements,
      location: formData.location,
      contractType: formData.contractType,
      salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
      deadline: formData.deadline,
      visibility: formData.visibility,
      status: formData.status,
    }

    if (editingJob) {
      onUpdateJob(editingJob.id, jobDataToSend, selectedSkills)
      toast.success('Oferta actualizada correctamente')
    } else {
      onAddJob(jobDataToSend as Omit<JobOffer, 'id' | 'createdAt' | 'updatedAt'>, selectedImage || undefined, selectedSkills)
      toast.success('Oferta creada correctamente')
      if (selectedSkills.length > 0) {
        toast.info(`${selectedSkills.length} habilidad(es) asignada(s)`)
      }
    }
    
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la oferta "${title}"?`)) {
      onDeleteJob(id)
      toast.success('Oferta eliminada')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Ofertas Laborales</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las vacantes disponibles
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus size={18} weight="bold" />
              Nueva Oferta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingJob ? 'Editar Oferta' : 'Nueva Oferta Laboral'}</DialogTitle>
              <DialogDescription>
                {editingJob ? 'Modifica los detalles de la oferta' : 'Completa la información de la nueva vacante'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Posición *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ej: Desarrollador Full Stack Senior"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Categoría</Label>
                  <Select 
                    value={formData.categoryId?.toString()} 
                    onValueChange={(value) => {
                      setFormData({ ...formData, categoryId: value })
                    }}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter(c => (c.isActive !== false && c.estado !== false))
                        .map(category => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name || category.nombre || 'Sin nombre'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ej: Madrid, España"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Salario Mínimo (opcional)</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    placeholder="Ej: 5000.50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Salario Máximo (opcional)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    placeholder="Ej: 8000.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractType">Tipo de Contrato</Label>
                  <Select 
                    value={formData.contractType} 
                    onValueChange={(value) => setFormData({ ...formData, contractType: value as ContractType })}
                  >
                    <SelectTrigger id="contractType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Tiempo Completo</SelectItem>
                      <SelectItem value="part-time">Medio Tiempo</SelectItem>
                      <SelectItem value="contract">Contrato</SelectItem>
                      <SelectItem value="internship">Pasantía</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Fecha Límite *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Debe ser hoy o una fecha futura
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe las responsabilidades y el rol..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requisitos</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Lista los requisitos necesarios..."
                  rows={4}
                />
              </div>

              {/* Selector Múltiple de Habilidades */}
              <div className="space-y-3">
                <Label>Habilidades Requeridas</Label>
                
                {/* Habilidades seleccionadas */}
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                    {selectedSkills.map(skillId => {
                      const skill = allSkills.find(s => s.id === skillId)
                      return skill ? (
                        <Badge key={skillId} variant="secondary" className="gap-1 pr-1">
                          {skill.nombre}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeSkill(skillId)}
                          >
                            <X size={12} weight="bold" />
                          </Button>
                        </Badge>
                      ) : null
                    })}
                  </div>
                )}

                {/* Filtros */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Input
                      placeholder="Buscar habilidad..."
                      value={skillSearchTerm}
                      onChange={(e) => setSkillSearchTerm(e.target.value)}
                      onFocus={() => setIsSkillsDropdownOpen(true)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Select 
                      value={skillCategoryFilter} 
                      onValueChange={setSkillCategoryFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las categorías" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {skillCategories.map(cat => (
                          <SelectItem key={cat} value={cat || ''}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Lista de habilidades disponibles */}
                {(isSkillsDropdownOpen || skillSearchTerm || skillCategoryFilter !== 'all') && filteredSkills.length > 0 && (
                  <Card className="max-h-60 overflow-y-auto">
                    <CardContent className="p-2">
                      <div className="space-y-1">
                        {filteredSkills.slice(0, 20).map(skill => (
                          <Button
                            key={skill.id}
                            type="button"
                            variant="ghost"
                            className="w-full justify-start text-sm font-normal"
                            onClick={() => {
                              toggleSkill(skill.id)
                              setSkillSearchTerm('')
                            }}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <span className="flex-1 text-left">{skill.nombre}</span>
                              {skill.categoria && (
                                <Badge variant="outline" className="text-xs">
                                  {skill.categoria}
                                </Badge>
                              )}
                            </div>
                          </Button>
                        ))}
                        {filteredSkills.length > 20 && (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            Mostrando 20 de {filteredSkills.length} resultados. Refina tu búsqueda.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {filteredSkills.length === 0 && (skillSearchTerm || skillCategoryFilter !== 'all') && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No se encontraron habilidades con los filtros aplicados
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Selecciona las habilidades técnicas y soft skills requeridas para esta posición
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibilidad</Label>
                  <Select 
                    value={formData.visibility} 
                    onValueChange={(value) => setFormData({ ...formData, visibility: value as JobVisibility })}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Pública</SelectItem>
                      <SelectItem value="internal">Interna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value as JobStatus })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="draft">Borrador</SelectItem>
                      <SelectItem value="filled">Ocupada</SelectItem>
                      <SelectItem value="closed">Cerrada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Sección de imágenes */}
              {editingJob ? (
                <div className="space-y-2">
                  <Label>Imágenes del Puesto</Label>
                  <div className="flex items-center gap-3">
                    {editingJob.imageUrl && (
                      <img 
                        src={editingJob.imageUrl} 
                        alt="Imagen actual"
                        className="w-16 h-16 rounded object-cover border"
                      />
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsImageManagerOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <ImagesSquare size={18} />
                      Gestionar Imágenes
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Puedes agregar, ver o eliminar imágenes de esta oferta
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="image">Imagen del Puesto (opcional)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageSelect}
                  />
                  {selectedImage && imagePreviewUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">
                          {selectedImage.name} ({(selectedImage.size / 1024).toFixed(0)} KB)
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedImage(null)}
                        >
                          ✕
                        </Button>
                      </div>
                      <div className="border rounded-lg p-2 bg-muted/30">
                        <p className="text-xs font-medium mb-2">Vista previa:</p>
                        <img
                          src={imagePreviewUrl}
                          alt="Vista previa"
                          className="max-h-40 rounded object-cover mx-auto"
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Formatos: JPG, PNG, WEBP. Tamaño máximo: 2MB
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingJob ? 'Guardar Cambios' : 'Crear Oferta'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Todas las Ofertas</CardTitle>
              <CardDescription>
                {filteredJobs.length} oferta{filteredJobs.length !== 1 ? 's' : ''} encontrada{filteredJobs.length !== 1 ? 's' : ''}
                {JSON.stringify(filters) !== JSON.stringify({
                  searchTerm: '',
                  status: 'all',
                  contractType: 'all',
                  categoryId: 'all',
                }) && ' (filtradas)'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={JSON.stringify(filters) === JSON.stringify({
                  searchTerm: '',
                  status: 'all',
                  contractType: 'all',
                  categoryId: 'all',
                })}
              >
                Limpiar filtros
              </Button>
              <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                <Plus size={16} className="mr-2" />
                Nueva Oferta
              </Button>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Buscador */}
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <Input
                  id="search"
                  placeholder="Título, descripción..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                />
              </div>
              
              {/* Filtro por estado */}
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="active">Activas</SelectItem>
                    <SelectItem value="draft">Borradores</SelectItem>
                    <SelectItem value="filled">Ocupadas</SelectItem>
                    <SelectItem value="closed">Cerradas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filtro por tipo de contrato */}
              <div className="space-y-2">
                <Label htmlFor="contractType">Tipo de contrato</Label>
                <Select
                  value={filters.contractType}
                  onValueChange={(value) => handleFilterChange('contractType', value)}
                >
                  <SelectTrigger id="contractType">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {Object.entries(contractTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filtro por categoría */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) => handleFilterChange('categoryId', value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Etiquetas de filtros activos */}
            <div className="flex flex-wrap gap-2">
              {filters.status !== 'all' && (
                <Badge className="flex items-center gap-1">
                  Estado: {jobStatusLabels[filters.status as JobStatus] || filters.status}
                  <button 
                    onClick={() => handleFilterChange('status', 'all')}
                    className="ml-1 rounded-full hover:bg-accent p-0.5"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              )}
              
              {filters.contractType !== 'all' && (
                <Badge className="flex items-center gap-1">
                  Contrato: {contractTypeLabels[filters.contractType as ContractType] || filters.contractType}
                  <button 
                    onClick={() => handleFilterChange('contractType', 'all')}
                    className="ml-1 rounded-full hover:bg-accent p-0.5"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              )}
              
              {filters.categoryId !== 'all' && categories.find(c => c.id === filters.categoryId) && (
                <Badge className="flex items-center gap-1">
                  Categoría: {categories.find(c => c.id === filters.categoryId)?.name}
                  <button 
                    onClick={() => handleFilterChange('categoryId', 'all')}
                    className="ml-1 rounded-full hover:bg-accent p-0.5"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              )}
              
              {filters.searchTerm && (
                <Badge className="flex items-center gap-1">
                  Buscando: "{filters.searchTerm}"
                  <button 
                    onClick={() => handleFilterChange('searchTerm', '')}
                    className="ml-1 rounded-full hover:bg-accent p-0.5"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagen</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Habilidades</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Límite</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                    No hay ofertas laborales para mostrar. Crea la primera oferta o intenta con otros filtros.
                  </TableCell>
                </TableRow>
              ) : (
                currentJobs.map((job) => {
                  const daysLeft = daysUntilDeadline(job.deadline)
                  const isExpiring = daysLeft <= 7 && daysLeft > 0
                  const isExpired = daysLeft < 0
                  const category = categories.find(c => c.id === job.categoryId)

                  return (
                    <TableRow key={job.id}>
                      <TableCell>
                        {job.imageUrl ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button className="w-10 h-10 rounded-md overflow-hidden border border-border hover:opacity-80 transition-opacity">
                                <img 
                                  src={job.imageUrl} 
                                  alt={job.title}
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Imagen de la oferta: {job.title}</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center p-4">
                                <img 
                                  src={job.imageUrl} 
                                  alt={job.title}
                                  className="max-h-[70vh] max-w-full object-contain"
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {job.visibility === 'public' ? (
                            <Eye size={16} className="text-muted-foreground" />
                          ) : (
                            <EyeSlash size={16} className="text-muted-foreground" />
                          )}
                          {job.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {job.skills && job.skills.length > 0 ? (
                            job.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill.id} variant="secondary" className="text-xs">
                                {skill.nombre}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin habilidades</span>
                          )}
                          {job.skills && job.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{job.skills.length - 3} más
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {category ? (
                          <Badge variant="outline" className="text-xs">
                            {category.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sin categoría</span>
                        )}
                      </TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {contractTypeLabels[job.contractType]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={job.status === 'active' ? 'default' : 'secondary'}
                        >
                          {jobStatusLabels[job.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted-foreground" />
                          <span className={isExpired ? 'text-destructive' : isExpiring ? 'text-accent' : ''}>
                            {formatDate(job.deadline)}
                          </span>
                        </div>
                        {isExpiring && (
                          <p className="text-xs text-accent mt-1">Vence en {daysLeft} días</p>
                        )}
                        {isExpired && (
                          <p className="text-xs text-destructive mt-1">Expirada</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(job)}
                          >
                            <PencilSimple size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(job.id, job.title)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
          
          {/* Paginación Mejorada */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Selector de items por página */}
            <div className="flex items-center gap-2">
              <Label htmlFor="items-per-page" className="text-sm text-muted-foreground whitespace-nowrap">
                Mostrar:
              </Label>
              <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger id="items-per-page" className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                por página
              </span>
            </div>

            {/* Información de paginación */}
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{indexOfFirstItem + 1}</span> - <span className="font-semibold text-foreground">{Math.min(indexOfLastItem, filteredJobs.length)}</span> de <span className="font-semibold text-foreground">{filteredJobs.length}</span> ofertas
              {filteredJobs.length !== jobs.length && (
                <span className="ml-1">(filtrado de {jobs.length} total)</span>
              )}
            </div>

            {/* Controles de paginación */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={prevPage} 
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Mostrar páginas cercanas a la actual
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink 
                          onClick={() => paginate(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationLink className="cursor-default">...</PaginationLink>
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={nextPage} 
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diálogo para gestionar imágenes en edición */}
      <Dialog open={isImageManagerOpen} onOpenChange={setIsImageManagerOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Gestionar Imágenes - {editingJob?.title}
            </DialogTitle>
            <DialogDescription>
              Agrega, visualiza o elimina imágenes de esta oferta laboral
            </DialogDescription>
          </DialogHeader>
          {editingJob && (
            <JobImageManager
              jobId={editingJob.id}
              images={editingJob.images || []}
              onImagesChange={() => {
                // Cerrar el diálogo y notificar
                toast.success('Imágenes actualizadas')
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
