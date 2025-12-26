import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Eye, Trash2, FileText, Lightbulb, AlertTriangle, AlertCircle, MessageSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ParteDiarioModal } from '../components/ParteDiarioModal';
import { ParteDiarioDetailModal } from '../components/ParteDiarioDetailModal';
import { usePartesDiarios, useDeleteParteDiario, useNovedadesStats } from '../hooks/usePartesDiarios';
import { ESTADO_ANIMO_LABELS, TIPO_NOVEDAD_LABELS, type TipoNovedad } from '../types/partesDiarios';
import { useAuth } from '@/contexts/AuthContext';

export default function PartesDiarios() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: partes, isLoading } = usePartesDiarios();
  const { data: stats } = useNovedadesStats();
  const deleteMutation = useDeleteParteDiario();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedParteId, setSelectedParteId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // TODO: Get empleado_id from user context or profile
  const empleadoId = user?.id || '';

  // Handle ?action=nuevo query param
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'nuevo') {
      setCreateModalOpen(true);
      // Remove action param after opening modal
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleViewDetail = (id: string) => {
    setSelectedParteId(id);
    setDetailModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const novedadIconMap: Record<TipoNovedad, typeof Lightbulb> = {
    mejora: Lightbulb,
    reclamo: AlertTriangle,
    incidente: AlertCircle,
    observacion: MessageSquare,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Partes Diarios</h1>
          <p className="text-muted-foreground">
            Registro diario de actividades y novedades del equipo
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Parte
        </Button>
      </div>

      {/* Quick access link info */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-3 flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div className="text-sm">
            <span className="font-medium">Acceso rápido:</span>{' '}
            <code className="bg-background px-2 py-0.5 rounded text-xs">
              /rrhh/partes-diarios?action=nuevo
            </code>
            <span className="text-muted-foreground ml-2">
              Abre directamente el formulario de nuevo parte
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{partes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total Partes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Novedades</p>
          </CardContent>
        </Card>
        {Object.entries(TIPO_NOVEDAD_LABELS).slice(0, 3).map(([tipo, { label, color }]) => {
          const Icon = novedadIconMap[tipo as TipoNovedad];
          return (
            <Card key={tipo}>
              <CardContent className="pt-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xl font-bold">
                    {stats?.porTipo?.[tipo] || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">{label}s</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Historial de Partes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !partes?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay partes diarios registrados</p>
              <Button
                variant="link"
                onClick={() => setCreateModalOpen(true)}
              >
                Crear el primer parte
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Actividades</TableHead>
                  <TableHead className="text-center">Ánimo</TableHead>
                  <TableHead className="text-center">Novedades</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partes.map((parte) => (
                  <TableRow key={parte.id}>
                    <TableCell className="font-medium">
                      {format(new Date(parte.fecha), "d 'de' MMMM", { locale: es })}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {parte.actividades_realizadas}
                    </TableCell>
                    <TableCell className="text-center text-2xl">
                      {ESTADO_ANIMO_LABELS[parte.estado_animo]?.emoji}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        Ver detalle
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(parte.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(parte.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ParteDiarioModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        empleadoId={empleadoId}
      />

      {selectedParteId && (
        <ParteDiarioDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          parteId={selectedParteId}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar parte diario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también todas las novedades asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
