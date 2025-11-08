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
import { Plus, PencilSimple, Trash, Check, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Skill } from '@/lib/services/skillService'

interface SkillsProps {
  skills: Skill[]
  onAddSkill: (skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>) => void
  onUpdateSkill: (id: string, skill: Partial<Skill>) => void
  onDeleteSkill: (id: string) => void
}

const categories = [
  'Programación',
  'DevOps',
  'Bases de Datos',
  'Backend',
  'Frontend',
  'Diseño',
  'Análisis de Datos',
  'Ciencia de Datos',
  'Seguridad',
  'Soft Skills',
  'Marketing',
  'Ventas',
  'Recursos Humanos',
  'Administración',
  'Contabilidad',
  'Ingeniería',
  'Educación',
  'Salud',
  'Construcción',
  'Idiomas',
]

export function Skills({ skills, onAddSkill, onUpdateSkill, onDeleteSkill }: SkillsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    activa: true,
  })

  const handleOpenDialog = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill)
      setFormData({
        nombre: skill.nombre,
        descripcion: skill.descripcion || '',
        categoria: skill.categoria || '',
        activa: skill.activa,
      })
    } else {
      setEditingSkill(null)
      setFormData({
        nombre: '',
        descripcion: '',
        categoria: '',
        activa: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre) {
      toast.error('El nombre es requerido')
      return
    }

    if (editingSkill) {
      onUpdateSkill(editingSkill.id, formData)
      toast.success('Habilidad actualizada')
    } else {
      onAddSkill(formData)
      toast.success('Habilidad creada')
    }

    setIsDialogOpen(false)
  }

  const handleDelete = (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la habilidad "${nombre}"?`)) {
      onDeleteSkill(id)
      toast.success('Habilidad eliminada')
    }
  }

  const filteredSkills = skills.filter(skill => {
    const matchesCategory = filterCategory === 'all' || skill.categoria === filterCategory
    const matchesSearch = skill.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const skillsByCategory = filteredSkills.reduce((acc, skill) => {
    const cat = skill.categoria || 'Sin categoría'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {} as Record<string, Skill[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Habilidades</h2>
          <p className="text-muted-foreground">
            {skills.length} habilidad{skills.length !== 1 ? 'es' : ''} registrada{skills.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus size={18} weight="bold" />
              Nueva Habilidad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSkill ? 'Editar Habilidad' : 'Nueva Habilidad'}</DialogTitle>
              <DialogDescription>
                {editingSkill ? 'Modifica los detalles de la habilidad' : 'Agrega una nueva habilidad al sistema'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Python, Liderazgo, Marketing Digital"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value })}
                >
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Breve descripción de la habilidad..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activa"
                  checked={formData.activa}
                  onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="activa" className="cursor-pointer">Activa</Label>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSkill ? 'Guardar Cambios' : 'Crear Habilidad'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busca y filtra habilidades</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {Object.entries(skillsByCategory).map(([categoria, categorySkills]) => (
          <Card key={categoria}>
            <CardHeader>
              <CardTitle className="text-xl">
                {categoria}
                <Badge variant="secondary" className="ml-2">
                  {categorySkills.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-24">Estado</TableHead>
                    <TableHead className="w-32 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorySkills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell className="font-medium">{skill.nombre}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {skill.descripcion || '—'}
                      </TableCell>
                      <TableCell>
                        {skill.activa ? (
                          <Badge variant="default" className="gap-1">
                            <Check size={14} weight="bold" />
                            Activa
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <X size={14} weight="bold" />
                            Inactiva
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(skill)}
                          >
                            <PencilSimple size={16} weight="bold" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(skill.id, skill.nombre)}
                          >
                            <Trash size={16} weight="bold" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No se encontraron habilidades con los filtros aplicados
          </CardContent>
        </Card>
      )}
    </div>
  )
}
