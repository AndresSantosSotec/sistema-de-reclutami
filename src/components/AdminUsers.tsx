import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, PencilSimple, Trash, CheckCircle, XCircle } from '@phosphor-icons/react'
import type { AdminUser, AdminRole } from '@/lib/types'
import { adminRoleLabels, formatDateTime } from '@/lib/constants'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { motion } from 'framer-motion'

interface AdminUsersProps {
  users: AdminUser[]
  onAddUser: (user: Omit<AdminUser, 'id' | 'createdAt'>) => void
  onUpdateUser: (id: string, updates: Partial<AdminUser>) => void
  onDeleteUser: (id: string) => void
}

export function AdminUsers({ users, onAddUser, onUpdateUser, onDeleteUser }: AdminUsersProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'recruiter' as AdminRole,
    isActive: true
  })

  const handleOpenDialog = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        role: 'recruiter',
        isActive: true
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.role) {
      toast.error('Por favor completa todos los campos')
      return
    }

    if (editingUser) {
      onUpdateUser(editingUser.id, formData)
      toast.success('Usuario actualizado exitosamente')
    } else {
      onAddUser(formData)
      toast.success('Usuario creado exitosamente')
    }
    
    handleCloseDialog()
  }

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${name}?`)) {
      onDeleteUser(id)
      toast.success('Usuario eliminado')
    }
  }

  const handleToggleStatus = (user: AdminUser) => {
    onUpdateUser(user.id, { isActive: !user.isActive })
    toast.success(user.isActive ? 'Usuario desactivado' : 'Usuario activado')
  }

  const roleColors: Record<AdminRole, string> = {
    'administrator': 'bg-purple-100 text-purple-800 border-purple-200',
    'recruiter': 'bg-blue-100 text-blue-800 border-blue-200',
    'evaluator': 'bg-teal-100 text-teal-800 border-teal-200'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Usuarios del Sistema</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de accesos y permisos del equipo
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus size={20} weight="bold" />
              Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Modifica la información del usuario' : 'Agrega un nuevo miembro al equipo de reclutamiento'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="juan@coosajer.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: AdminRole) => setFormData(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">Administrador</SelectItem>
                    <SelectItem value="recruiter">Reclutador</SelectItem>
                    <SelectItem value="evaluator">Evaluador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.role === 'administrator' && 'Acceso completo al sistema'}
                  {formData.role === 'recruiter' && 'Gestión de ofertas y postulaciones'}
                  {formData.role === 'evaluator' && 'Evaluación de candidatos'}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Usuario Activo</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipo de Reclutamiento</CardTitle>
          <CardDescription>
            {users.length} {users.length === 1 ? 'usuario registrado' : 'usuarios registrados'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay usuarios registrados</p>
              <Button onClick={() => handleOpenDialog()} className="mt-4 gap-2">
                <Plus size={20} />
                Agregar Primer Usuario
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Último Acceso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, idx) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleColors[user.role]}>
                          {adminRoleLabels[user.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.isActive ? (
                            <>
                              <CheckCircle size={16} weight="fill" className="text-success" />
                              <span className="text-sm text-success">Activo</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={16} weight="fill" className="text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Inactivo</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {user.lastLogin ? formatDateTime(user.lastLogin) : 'Nunca'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(user)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {user.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(user)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <PencilSimple size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id, user.name)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          >
                            <Trash size={18} />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}