import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, PencilSimple, Trash, Eye, EyeSlash, Calendar } from '@phosphor-icons/react'
import type { JobOffer, ContractType, JobVisibility, JobStatus, JobCategory } from '@/lib/types'
import { contractTypeLabels, jobStatusLabels, formatDate, daysUntilDeadline } from '@/lib/constants'
import { toast } from 'sonner'

interface JobsProps {
  jobs: JobOffer[]
  categories: JobCategory[]
  onAddJob: (job: Omit<JobOffer, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateJob: (id: string, job: Partial<JobOffer>) => void
  onDeleteJob: (id: string) => void
}

export function Jobs({ jobs, categories, onAddJob, onUpdateJob, onDeleteJob }: JobsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<JobOffer | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    description: '',
    requirements: '',
    location: '',
    contractType: 'full-time' as ContractType,
    deadline: '',
    visibility: 'public' as JobVisibility,
    status: 'active' as JobStatus
  })

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
        deadline: job.deadline,
        visibility: job.visibility,
        status: job.status
      })
    } else {
      setEditingJob(null)
      setFormData({
        title: '',
        categoryId: '',
        description: '',
        requirements: '',
        location: '',
        contractType: 'full-time',
        deadline: '',
        visibility: 'public',
        status: 'active'
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.deadline) {
      toast.error('Por favor completa los campos requeridos')
      return
    }

    if (editingJob) {
      onUpdateJob(editingJob.id, formData)
      toast.success('Oferta actualizada correctamente')
    } else {
      onAddJob(formData)
      toast.success('Oferta creada correctamente')
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
                    value={formData.categoryId} 
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger id="categoryId">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.isActive).map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
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
                      <SelectItem value="closed">Cerrada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

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
          <CardTitle>Todas las Ofertas</CardTitle>
          <CardDescription>
            {jobs.length} oferta{jobs.length !== 1 ? 's' : ''} registrada{jobs.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Límite</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No hay ofertas laborales. Crea la primera oferta.
                  </TableCell>
                </TableRow>
              ) : (
                jobs.map((job) => {
                  const daysLeft = daysUntilDeadline(job.deadline)
                  const isExpiring = daysLeft <= 7 && daysLeft > 0
                  const isExpired = daysLeft < 0
                  const category = categories.find(c => c.id === job.categoryId)

                  return (
                    <TableRow key={job.id}>
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
        </CardContent>
      </Card>
    </div>
  )
}
