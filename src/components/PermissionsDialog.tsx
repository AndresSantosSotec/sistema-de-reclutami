import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import userService, { Module, UserPermission } from '@/services/userService';
import { Eye, Plus, Pencil, Trash2, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  userName: string;
}

export default function PermissionsDialog({ open, onOpenChange, userId, userName }: PermissionsDialogProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<Record<string, UserPermission>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setError(null);
      setSuccess(false);
      loadData();
    }
  }, [open, userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [modulesData, userPermsArray] = await Promise.all([
        userService.getAvailableModules(),
        userService.getUserPermissions(userId),
      ]);
      
      // Convertir array a objeto para fácil acceso
      const permsObj: Record<string, UserPermission> = {};
      userPermsArray.forEach(perm => {
        permsObj[perm.permission_key] = perm;
      });
      
      setModules(modulesData);
      setPermissions(permsObj);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      setError(error.response?.data?.message || 'Error al cargar permisos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (moduleKey: string, field: keyof UserPermission, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        permission_key: moduleKey,
        can_view: prev[moduleKey]?.can_view || false,
        can_create: prev[moduleKey]?.can_create || false,
        can_edit: prev[moduleKey]?.can_edit || false,
        can_delete: prev[moduleKey]?.can_delete || false,
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const permsArray = Object.values(permissions).filter(p => 
        p.can_view || p.can_create || p.can_edit || p.can_delete
      );
      await userService.updateUserPermissions(userId, permsArray);
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error al actualizar permisos');
    } finally {
      setSaving(false);
    }
  };

  const toggleModule = (moduleKey: string) => {
    const currentPerm = permissions[moduleKey];
    const allEnabled = currentPerm?.can_view && currentPerm?.can_create && currentPerm?.can_edit && currentPerm?.can_delete;
    
    setPermissions(prev => ({
      ...prev,
      [moduleKey]: {
        permission_key: moduleKey,
        can_view: !allEnabled,
        can_create: !allEnabled,
        can_edit: !allEnabled,
        can_delete: !allEnabled,
      },
    }));
  };

  const getPermissionCount = (perm: UserPermission | undefined) => {
    if (!perm) return 0;
    return [perm.can_view, perm.can_create, perm.can_edit, perm.can_delete].filter(Boolean).length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            ⚙️ Configurar Permisos
          </DialogTitle>
          <DialogDescription className="text-base">
            Usuario: <Badge variant="secondary" className="ml-2">{userName}</Badge>
          </DialogDescription>
        </DialogHeader>

        {success && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              ✅ Permisos actualizados exitosamente
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Cargando permisos...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {modules.map((module) => {
              const perm = permissions[module.key];
              const permCount = getPermissionCount(perm);
              const hasAnyPermission = permCount > 0;
              
              return (
                <Card 
                  key={module.key} 
                  className={cn(
                    "transition-all hover:shadow-md",
                    hasAnyPermission && "border-primary/30 bg-primary/5"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Module Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-base">{module.label}</h4>
                          {hasAnyPermission && (
                            <Badge variant="default" className="text-xs">
                              {permCount}/4 permisos
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>

                      {/* Quick Toggle */}
                      <Button
                        type="button"
                        variant={hasAnyPermission ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleModule(module.key)}
                        className="shrink-0"
                      >
                        {hasAnyPermission ? "Quitar Todo" : "Dar Todo"}
                      </Button>
                    </div>

                    {/* Permissions Grid */}
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {/* Ver */}
                      <div className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors",
                        perm?.can_view 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                          : "border-border bg-muted/30"
                      )}>
                        <Eye className={cn(
                          "h-5 w-5",
                          perm?.can_view ? "text-blue-600" : "text-muted-foreground"
                        )} />
                        <span className="text-xs font-medium">Ver</span>
                        <Switch
                          checked={perm?.can_view || false}
                          onCheckedChange={(checked) => handlePermissionChange(module.key, 'can_view', checked)}
                        />
                      </div>

                      {/* Crear */}
                      <div className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors",
                        perm?.can_create 
                          ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                          : "border-border bg-muted/30"
                      )}>
                        <Plus className={cn(
                          "h-5 w-5",
                          perm?.can_create ? "text-green-600" : "text-muted-foreground"
                        )} />
                        <span className="text-xs font-medium">Crear</span>
                        <Switch
                          checked={perm?.can_create || false}
                          onCheckedChange={(checked) => handlePermissionChange(module.key, 'can_create', checked)}
                        />
                      </div>

                      {/* Editar */}
                      <div className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors",
                        perm?.can_edit 
                          ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" 
                          : "border-border bg-muted/30"
                      )}>
                        <Pencil className={cn(
                          "h-5 w-5",
                          perm?.can_edit ? "text-yellow-600" : "text-muted-foreground"
                        )} />
                        <span className="text-xs font-medium">Editar</span>
                        <Switch
                          checked={perm?.can_edit || false}
                          onCheckedChange={(checked) => handlePermissionChange(module.key, 'can_edit', checked)}
                        />
                      </div>

                      {/* Eliminar */}
                      <div className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-colors",
                        perm?.can_delete 
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20" 
                          : "border-border bg-muted/30"
                      )}>
                        <Trash2 className={cn(
                          "h-5 w-5",
                          perm?.can_delete ? "text-red-600" : "text-muted-foreground"
                        )} />
                        <span className="text-xs font-medium">Eliminar</span>
                        <Switch
                          checked={perm?.can_delete || false}
                          onCheckedChange={(checked) => handlePermissionChange(module.key, 'can_delete', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
