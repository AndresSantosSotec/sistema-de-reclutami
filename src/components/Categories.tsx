import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, PencilSimple, Trash, Tag } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { JobCategory } from '@/lib/types'

interface CategoriesProps {
  categories: JobCategory[]
  onAddCategory: (category: Omit<JobCategory, 'id' | 'createdAt'>) => void
  onUpdateCategory: (id: string, updates: Partial<JobCategory>) => void
  onDeleteCategory: (id: string) => void
}

export function Categories({ categories, onAddCategory, onUpdateCategory, onDeleteCategory }: CategoriesProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<JobCategory | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    })
    setEditingCategory(null)
  }

  const handleOpenDialog = (category?: JobCategory) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || '',
        isActive: category.isActive
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('El nombre de la categoría es requerido')
      return
    }

    if (editingCategory) {
      onUpdateCategory(editingCategory.id, formData)
      toast.success('Categoría actualizada correctamente')
    } else {
      onAddCategory(formData)
      toast.success('Categoría creada correctamente')
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar la categoría "${name}"?`)) {
      onDeleteCategory(id)
      toast.success('Categoría eliminada')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Categorías de Empleo</h1>
          <p className="text-muted-foreground mt-1">Gestiona las categorías de las ofertas laborales</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus size={20} weight="bold" />
              Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Actualiza la información de la categoría' : 'Crea una nueva categoría para clasificar las ofertas laborales'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Categoría *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Desarrollo de Software"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Descripción opcional de la categoría"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="active">Estado</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.isActive ? 'Activa' : 'Inactiva'}
                  </p>
                </div>
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editingCategory ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Tag size={20} className="text-primary" weight="duotone" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.jobCount || 0} ofertas
                    </p>
                  </div>
                </div>
                <Badge variant={category.isActive ? 'default' : 'secondary'}>
                  {category.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
            </CardHeader>
            {category.description && (
              <CardContent className="pb-3">
                <CardDescription className="text-sm line-clamp-2">
                  {category.description}
                </CardDescription>
              </CardContent>
            )}
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => handleOpenDialog(category)}
                >
                  <PencilSimple size={16} />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(category.id, category.name)}
                >
                  <Trash size={16} />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <Card className="col-span-full py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Tag size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No hay categorías</h3>
              <p className="text-muted-foreground mb-4">
                Crea tu primera categoría para empezar a organizar las ofertas laborales
              </p>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus size={20} weight="bold" />
                Crear Primera Categoría
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
