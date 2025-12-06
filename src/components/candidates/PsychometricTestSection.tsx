import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Brain, Link as LinkIcon, CheckCircle, Clock, ExternalLink, Plus, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { psychometricTestService } from '@/lib/psychometricTestService';
import type { PsychometricTest } from '@/lib/types';

interface PsychometricTestSectionProps {
  candidateId: number;
  jobOfferId?: number;
  onTestsChange?: () => void;
}

export function PsychometricTestSection({
  candidateId,
  jobOfferId,
  onTestsChange
}: PsychometricTestSectionProps) {
  const [tests, setTests] = useState<PsychometricTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [testUrl, setTestUrl] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; testId: number | null }>({ open: false, testId: null });

  const statusConfig = {
    pending: { label: 'Pendiente', color: 'bg-yellow-500', textColor: 'text-yellow-700 dark:text-yellow-300', bgLight: 'bg-yellow-500/10', icon: <Clock className="w-4 h-4" /> },
    sent: { label: 'Enviado', color: 'bg-blue-500', textColor: 'text-blue-700 dark:text-blue-300', bgLight: 'bg-blue-500/10', icon: <Clock className="w-4 h-4" /> },
    completed: { label: 'Completado', color: 'bg-green-500', textColor: 'text-green-700 dark:text-green-300', bgLight: 'bg-green-500/10', icon: <CheckCircle className="w-4 h-4" /> },
    expired: { label: 'Expirado', color: 'bg-red-500', textColor: 'text-red-700 dark:text-red-300', bgLight: 'bg-red-500/10', icon: <AlertCircle className="w-4 h-4" /> },
  };

  // Cargar todas las pruebas del candidato
  const loadTests = async () => {
    try {
      setIsLoading(true);
      const data = await psychometricTestService.getAllTestsByCandidateId(candidateId);
      setTests(data);
    } catch (error) {
      console.error('Error loading tests:', error);
      setTests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (candidateId) {
      loadTests();
    }
  }, [candidateId]);

  const handleSendTest = async () => {
    if (!testUrl) {
      toast.error('Por favor ingresa un enlace válido');
      return;
    }

    try {
      setIsSending(true);
      const newTest = await psychometricTestService.sendTest({
        postulante_id: candidateId,
        job_offer_id: jobOfferId,
        test_link: testUrl
      });
      
      setTests(prev => [newTest, ...prev]);
      toast.success('Prueba psicométrica enviada correctamente');
      setIsDialogOpen(false);
      setTestUrl('');
      onTestsChange?.();
    } catch (error: any) {
      console.error('Error sending test:', error);
      toast.error(error.response?.data?.message || 'Error al enviar la prueba psicométrica');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteTest = async () => {
    if (!deleteConfirm.testId) return;

    try {
      setIsDeleting(deleteConfirm.testId);
      await psychometricTestService.deleteTest(deleteConfirm.testId);
      setTests(prev => prev.filter(t => t.id !== deleteConfirm.testId));
      toast.success('Prueba eliminada correctamente');
      onTestsChange?.();
    } catch (error: any) {
      console.error('Error deleting test:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar la prueba');
    } finally {
      setIsDeleting(null);
      setDeleteConfirm({ open: false, testId: null });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatus = (status: string) => statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cargando pruebas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Pruebas Psicométricas</CardTitle>
            {tests.length > 0 && (
              <Badge variant="secondary" className="ml-2">{tests.length}</Badge>
            )}
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva Prueba
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar prueba psicométrica</DialogTitle>
                <DialogDescription>
                  Ingresa el enlace de la prueba psicométrica que se enviará al candidato.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="testUrl">Enlace de la prueba</Label>
                  <Input
                    id="testUrl"
                    placeholder="https://ejemplo.com/prueba-psicometrica"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    El candidato será notificado automáticamente por correo electrónico.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSending}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSendTest}
                  disabled={!testUrl || isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar prueba'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {tests.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">No se han enviado pruebas psicométricas a este candidato.</p>
            <p className="text-sm text-muted-foreground mt-1">Haz clic en "Nueva Prueba" para enviar una.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test) => {
              const status = getStatus(test.status);
              return (
                <div
                  key={test.id}
                  className={`p-4 rounded-lg border ${status.bgLight} border-opacity-50`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {status.icon}
                        <Badge className={`${status.color} text-white`}>
                          {status.label}
                        </Badge>
                        {test.job_offer && (
                          <span className="text-xs text-muted-foreground">
                            • {test.job_offer.titulo}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <LinkIcon className="w-4 h-4 text-muted-foreground" />
                        <a 
                          href={test.test_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 truncate max-w-[300px]"
                        >
                          Enlace a la prueba <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Enviada: {formatDate(test.sent_at)}</span>
                        {test.completed_at && (
                          <span>Completada: {formatDate(test.completed_at)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          navigator.clipboard.writeText(test.test_link);
                          toast.success('Enlace copiado al portapapeles');
                        }}
                        title="Copiar enlace"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteConfirm({ open: true, testId: test.id })}
                        disabled={isDeleting === test.id}
                        title="Eliminar prueba"
                      >
                        {isDeleting === test.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Confirmación de eliminación */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, testId: open ? deleteConfirm.testId : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar prueba psicométrica?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La prueba será eliminada permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting !== null}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTest}
              disabled={isDeleting !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting !== null ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
