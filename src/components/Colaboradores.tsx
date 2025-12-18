import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, Search, UserCheck, Building2, Calendar, 
  MoreVertical, Pencil, Trash2, Eye, Users, 
  CheckCircle, XCircle, AlertCircle 
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import colaboradorService, { 
  Colaborador, 
  PostulanteDisponible, 
  ColaboradorFormData,
  EstadisticasColaboradores 
} from '@/lib/colaboradorService';

export default function Colaboradores() {
  // Estados
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [departamentoFiltro, setDepartamentoFiltro] = useState('todos');
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasColaboradores | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Modal de agregar/editar
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [formData, setFormData] = useState<ColaboradorFormData>({
    postulante_id: 0,
    codigo_empleado: '',
    departamento: '',
    puesto_actual: '',
    fecha_ingreso: '',
    estado: 'activo',
    notas: '',
  });
  
  // Búsqueda de postulantes
  const [postulantesDisponibles, setPostulantesDisponibles] = useState<PostulanteDisponible[]>([]);
  const [searchPostulante, setSearchPostulante] = useState('');
  const [selectedPostulante, setSelectedPostulante] = useState<PostulanteDisponible | null>(null);
  const [loadingPostulantes, setLoadingPostulantes] = useState(false);

  // Modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [colaboradorToDelete, setColaboradorToDelete] = useState<Colaborador | null>(null);

  // Cargar colaboradores
  const loadColaboradores = useCallback(async () => {
    try {
      setLoading(true);
      const response = await colaboradorService.getColaboradores({
        page: currentPage,
        per_page: 10,
        search: searchTerm,
        estado: estadoFiltro !== 'todos' ? estadoFiltro : undefined,
        departamento: departamentoFiltro !== 'todos' ? departamentoFiltro : undefined,
      });
      setColaboradores(response.data);
      setTotalPages(response.meta.last_page);
      setTotal(response.meta.total);
    } catch (error) {
      toast.error('Error al cargar colaboradores');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, estadoFiltro, departamentoFiltro]);

  // Cargar departamentos y estadísticas
  const loadAuxData = async () => {
    try {
      const [deps, stats] = await Promise.all([
        colaboradorService.getDepartamentos(),
        colaboradorService.getEstadisticas(),
      ]);
      setDepartamentos(deps);
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error cargando datos auxiliares:', error);
    }
  };

  useEffect(() => {
    loadColaboradores();
  }, [loadColaboradores]);

  useEffect(() => {
    loadAuxData();
  }, []);

  // Buscar postulantes disponibles
  const buscarPostulantes = async (search: string) => {
    if (search.length < 2) {
      setPostulantesDisponibles([]);
      return;
    }
    try {
      setLoadingPostulantes(true);
      const data = await colaboradorService.getPostulantesDisponibles(search);
      setPostulantesDisponibles(data);
    } catch (error) {
      console.error('Error buscando postulantes:', error);
    } finally {
      setLoadingPostulantes(false);
    }
  };

  // Debounce para búsqueda de postulantes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchPostulante && !editingColaborador) {
        buscarPostulantes(searchPostulante);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchPostulante, editingColaborador]);

  // Guardar colaborador
  const handleSave = async () => {
    try {
      if (!editingColaborador && !selectedPostulante) {
        toast.error('Selecciona un postulante');
        return;
      }

      const dataToSend: ColaboradorFormData = {
        ...formData,
        postulante_id: editingColaborador ? editingColaborador.postulante_id : selectedPostulante!.id,
      };

      if (editingColaborador) {
        await colaboradorService.actualizarColaborador(editingColaborador.id, dataToSend);
        toast.success('Colaborador actualizado');
      } else {
        await colaboradorService.crearColaborador(dataToSend);
        toast.success('Colaborador registrado');
      }

      setShowAddModal(false);
      resetForm();
      loadColaboradores();
      loadAuxData();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al guardar colaborador';
      toast.error(message);
    }
  };

  // Eliminar colaborador
  const handleDelete = async () => {
    if (!colaboradorToDelete) return;
    try {
      await colaboradorService.eliminarColaborador(colaboradorToDelete.id);
      toast.success('Colaborador eliminado');
      setShowDeleteModal(false);
      setColaboradorToDelete(null);
      loadColaboradores();
      loadAuxData();
    } catch (error) {
      toast.error('Error al eliminar colaborador');
    }
  };

  // Cambiar estado
  const handleCambiarEstado = async (id: number, estado: 'activo' | 'inactivo' | 'suspendido') => {
    try {
      await colaboradorService.cambiarEstado(id, estado);
      toast.success('Estado actualizado');
      loadColaboradores();
      loadAuxData();
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      postulante_id: 0,
      codigo_empleado: '',
      departamento: '',
      puesto_actual: '',
      fecha_ingreso: '',
      estado: 'activo',
      notas: '',
    });
    setSelectedPostulante(null);
    setSearchPostulante('');
    setPostulantesDisponibles([]);
    setEditingColaborador(null);
  };

  // Abrir modal de edición
  const openEditModal = (colaborador: Colaborador) => {
    setEditingColaborador(colaborador);
    setFormData({
      postulante_id: colaborador.postulante_id,
      codigo_empleado: colaborador.codigo_empleado || '',
      departamento: colaborador.departamento || '',
      puesto_actual: colaborador.puesto_actual || '',
      fecha_ingreso: colaborador.fecha_ingreso || '',
      estado: colaborador.estado,
      notas: colaborador.notas || '',
    });
    setShowAddModal(true);
  };

  // Obtener color del badge según estado
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Activo</Badge>;
      case 'inactivo':
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Inactivo</Badge>;
      case 'suspendido':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Suspendido</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Colaboradores</p>
                <p className="text-2xl font-bold">{estadisticas?.total || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas?.activos || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactivos</p>
                <p className="text-2xl font-bold text-gray-500">{estadisticas?.inactivos || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suspendidos</p>
                <p className="text-2xl font-bold text-red-600">{estadisticas?.suspendidos || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y acciones */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Colaboradores Internos
              </CardTitle>
              <CardDescription>
                Empleados que pueden ver ofertas con visibilidad interna
              </CardDescription>
            </div>
            <Dialog open={showAddModal} onOpenChange={(open) => {
              setShowAddModal(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Colaborador
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingColaborador ? 'Editar Colaborador' : 'Registrar Colaborador Interno'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingColaborador 
                      ? 'Modifica la información del colaborador'
                      : 'Busca un postulante registrado y márcalo como colaborador interno'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Búsqueda de postulante (solo al crear) */}
                  {!editingColaborador && (
                    <div className="space-y-2">
                      <Label>Buscar Postulante *</Label>
                      <Input
                        placeholder="Buscar por nombre o email..."
                        value={searchPostulante}
                        onChange={(e) => setSearchPostulante(e.target.value)}
                      />
                      {loadingPostulantes && <p className="text-sm text-muted-foreground">Buscando...</p>}
                      {postulantesDisponibles.length > 0 && (
                        <div className="border rounded-md max-h-40 overflow-y-auto">
                          {postulantesDisponibles.map((p) => (
                            <div
                              key={p.id}
                              className={`p-2 cursor-pointer hover:bg-accent ${selectedPostulante?.id === p.id ? 'bg-accent' : ''}`}
                              onClick={() => {
                                setSelectedPostulante(p);
                                setSearchPostulante(p.nombre);
                                setPostulantesDisponibles([]);
                              }}
                            >
                              <p className="font-medium">{p.nombre}</p>
                              <p className="text-sm text-muted-foreground">{p.email}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {selectedPostulante && (
                        <Badge variant="outline" className="mt-2">
                          Seleccionado: {selectedPostulante.nombre}
                        </Badge>
                      )}
                    </div>
                  )}

                  {editingColaborador && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="font-medium">{editingColaborador.postulante.nombre_completo}</p>
                      <p className="text-sm text-muted-foreground">{editingColaborador.postulante.user?.email}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Código de Empleado</Label>
                      <Input
                        placeholder="EMP-001"
                        value={formData.codigo_empleado}
                        onChange={(e) => setFormData({ ...formData, codigo_empleado: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Departamento</Label>
                      <Input
                        placeholder="Recursos Humanos"
                        value={formData.departamento}
                        onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Puesto Actual</Label>
                      <Input
                        placeholder="Analista"
                        value={formData.puesto_actual}
                        onChange={(e) => setFormData({ ...formData, puesto_actual: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha de Ingreso</Label>
                      <Input
                        type="date"
                        value={formData.fecha_ingreso}
                        onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value: 'activo' | 'inactivo' | 'suspendido') => 
                        setFormData({ ...formData, estado: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                        <SelectItem value="suspendido">Suspendido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notas</Label>
                    <Textarea
                      placeholder="Notas adicionales..."
                      value={formData.notas}
                      onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave}>
                    {editingColaborador ? 'Guardar Cambios' : 'Registrar Colaborador'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o código..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={estadoFiltro} onValueChange={(v) => { setEstadoFiltro(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
                <SelectItem value="suspendido">Suspendidos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departamentoFiltro} onValueChange={(v) => { setDepartamentoFiltro(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los departamentos</SelectItem>
                {departamentos.map((dep) => (
                  <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : colaboradores.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay colaboradores registrados</p>
              <p className="text-sm text-muted-foreground">Agrega postulantes como colaboradores internos</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Puesto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Ingreso</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colaboradores.map((col) => (
                    <TableRow key={col.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{col.postulante.nombre_completo}</p>
                          <p className="text-sm text-muted-foreground">{col.postulante.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{col.codigo_empleado || '-'}</TableCell>
                      <TableCell>
                        {col.departamento ? (
                          <Badge variant="outline">
                            <Building2 className="w-3 h-3 mr-1" />
                            {col.departamento}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{col.puesto_actual || '-'}</TableCell>
                      <TableCell>{getEstadoBadge(col.estado)}</TableCell>
                      <TableCell>
                        {col.fecha_ingreso ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(col.fecha_ingreso).toLocaleDateString()}
                          </span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(col)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {col.estado !== 'activo' && (
                              <DropdownMenuItem onClick={() => handleCambiarEstado(col.id, 'activo')}>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                Marcar como Activo
                              </DropdownMenuItem>
                            )}
                            {col.estado !== 'inactivo' && (
                              <DropdownMenuItem onClick={() => handleCambiarEstado(col.id, 'inactivo')}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Marcar como Inactivo
                              </DropdownMenuItem>
                            )}
                            {col.estado !== 'suspendido' && (
                              <DropdownMenuItem onClick={() => handleCambiarEstado(col.id, 'suspendido')}>
                                <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                                Suspender
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setColaboradorToDelete(col);
                                setShowDeleteModal(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {colaboradores.length} de {total} colaboradores
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmación de eliminación */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a {colaboradorToDelete?.postulante.nombre_completo} de los colaboradores internos?
              Esta acción no elimina al postulante, solo su estado como colaborador.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

