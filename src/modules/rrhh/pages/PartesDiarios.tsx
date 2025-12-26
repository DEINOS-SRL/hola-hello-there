import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Plus, Eye, Trash2, FileText, Lightbulb, AlertTriangle, AlertCircle, 
  MessageSquare, Clock, Calendar, Filter, Search, ChevronDown, 
  ListTodo, Activity, TrendingUp, MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ParteDiarioModal } from '../components/ParteDiarioModal';
import { ParteDiarioDetailModal } from '../components/ParteDiarioDetailModal';
import { usePartesDiarios, useDeleteParteDiario, useNovedadesStats } from '../hooks/usePartesDiarios';
import { ESTADO_ANIMO_LABELS, TIPO_NOVEDAD_LABELS, type TipoNovedad, type ParteDiarioConNovedades, type ParteNovedad } from '../types/partesDiarios';
import { useAuth } from '@/contexts/AuthContext';

type DateFilter = 'all' | 'today' | 'yesterday' | 'week' | 'month';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const empleadoId = user?.id || '';

  // Handle ?action=nuevo query param
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'nuevo') {
      setCreateModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Filter partes
  const filteredPartes = useMemo(() => {
    if (!partes) return [];
    
    return partes.filter((parte) => {
      // Date filter
      const fecha = new Date(parte.fecha);
      if (dateFilter === 'today' && !isToday(fecha)) return false;
      if (dateFilter === 'yesterday' && !isYesterday(fecha)) return false;
      if (dateFilter === 'week' && !isThisWeek(fecha, { weekStartsOn: 1 })) return false;
      if (dateFilter === 'month' && !isThisMonth(fecha)) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesObservaciones = parte.observaciones_adicionales?.toLowerCase().includes(query);
        const matchesNovedades = parte.novedades?.some(n => n.descripcion.toLowerCase().includes(query));
        const matchesActividades = parte.actividades?.some(a => a.descripcion.toLowerCase().includes(query));
        if (!matchesObservaciones && !matchesNovedades && !matchesActividades) return false;
      }
      
      return true;
    });
  }, [partes, dateFilter, searchQuery]);

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

  const getDateLabel = (fecha: string) => {
    const date = new Date(fecha);
    if (isToday(date)) return 'Hoy';
    if (isYesterday(date)) return 'Ayer';
    return format(date, "EEE d MMM", { locale: es });
  };

  const getNovedadesByType = (novedades: ParteNovedad[] | undefined) => {
    const counts: Partial<Record<TipoNovedad, number>> = {};
    novedades?.forEach(n => {
      counts[n.tipo] = (counts[n.tipo] || 0) + 1;
    });
    return counts;
  };

  const dateFilterLabels: Record<DateFilter, string> = {
    all: 'Todos',
    today: 'Hoy',
    yesterday: 'Ayer',
    week: 'Esta semana',
    month: 'Este mes',
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Partes Diarios</h1>
          <p className="text-muted-foreground text-sm">
            Registro de actividades y novedades del equipo
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} size="lg" className="shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Parte
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{partes?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Total Partes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full -mr-10 -mt-10" />
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats?.total || 0}</div>
                <p className="text-xs text-muted-foreground">Novedades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {Object.entries(TIPO_NOVEDAD_LABELS).slice(0, 3).map(([tipo, { label, color }]) => {
          const Icon = novedadIconMap[tipo as TipoNovedad];
          return (
            <Card key={tipo} className="relative overflow-hidden">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {stats?.porTipo?.[tipo] || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">{label}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Table Card */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-muted-foreground" />
              Historial de Partes
              {filteredPartes.length > 0 && (
                <Badge variant="secondary" className="ml-2 font-normal">
                  {filteredPartes.length} registro{filteredPartes.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px] h-9"
                />
              </div>
              
              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
                <SelectTrigger className="w-[140px] h-9">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(dateFilterLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !filteredPartes?.length ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-medium text-lg mb-1">
                {searchQuery || dateFilter !== 'all' ? 'Sin resultados' : 'No hay partes diarios'}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {searchQuery || dateFilter !== 'all' 
                  ? 'Intenta con otros filtros de búsqueda' 
                  : 'Comienza registrando tu primer parte diario'}
              </p>
              {!searchQuery && dateFilter === 'all' && (
                <Button onClick={() => setCreateModalOpen(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer parte
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[140px] border-r font-semibold text-foreground py-3">
                      Fecha
                    </TableHead>
                    <TableHead className="w-[80px] border-r text-center font-semibold text-foreground py-3">
                      Ánimo
                    </TableHead>
                    <TableHead className="w-[100px] border-r text-center font-semibold text-foreground py-3">
                      Actividades
                    </TableHead>
                    <TableHead className="border-r font-semibold text-foreground py-3">
                      Novedades
                    </TableHead>
                    <TableHead className="font-semibold text-foreground py-3">
                      Observaciones
                    </TableHead>
                    <TableHead className="w-[50px] border-l"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartes.map((parte, idx) => {
                    const novedadesCounts = getNovedadesByType(parte.novedades || []);
                    const actividadesCount = parte.actividades?.length || 0;
                    const animoData = ESTADO_ANIMO_LABELS[parte.estado_animo];
                    const isEven = idx % 2 === 0;
                    
                    return (
                      <TableRow 
                        key={parte.id} 
                        className={`group cursor-pointer transition-colors ${
                          isEven ? 'bg-background' : 'bg-muted/20'
                        } hover:bg-primary/5`}
                        onClick={() => handleViewDetail(parte.id)}
                      >
                        {/* Fecha */}
                        <TableCell className="border-r py-2.5 font-mono">
                          <div className="flex flex-col leading-tight">
                            <span className="font-semibold text-sm">{getDateLabel(parte.fecha)}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {format(new Date(parte.fecha), "dd/MM/yyyy", { locale: es })}
                            </span>
                          </div>
                        </TableCell>
                        
                        {/* Ánimo */}
                        <TableCell className="border-r text-center py-2.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xl cursor-default">{animoData?.emoji}</span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-xs">{animoData?.label}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        
                        {/* Actividades */}
                        <TableCell className="border-r text-center py-2.5 font-mono">
                          {actividadesCount > 0 ? (
                            <span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded bg-primary/10 text-primary font-semibold text-sm">
                              {actividadesCount}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        
                        {/* Novedades */}
                        <TableCell className="border-r py-2.5">
                          {Object.keys(novedadesCounts).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(novedadesCounts).map(([tipo, count]) => {
                                const Icon = novedadIconMap[tipo as TipoNovedad];
                                const config = TIPO_NOVEDAD_LABELS[tipo as TipoNovedad];
                                return (
                                  <Tooltip key={tipo}>
                                    <TooltipTrigger asChild>
                                      <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-medium ${config.color}`}>
                                        <Icon className="h-3 w-3" />
                                        <span>{count}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                      <p className="text-xs">{count} {config.label}{count !== 1 ? 's' : ''}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        
                        {/* Observaciones */}
                        <TableCell className="py-2.5 max-w-[200px]">
                          {parte.observaciones_adicionales ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-xs text-muted-foreground truncate cursor-default">
                                  {parte.observaciones_adicionales}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[300px]">
                                <p className="text-xs whitespace-pre-wrap">{parte.observaciones_adicionales}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                        
                        {/* Acciones */}
                        <TableCell className="border-l py-2.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(parte.id);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalle
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(parte.id);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick access tip */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/30 border border-dashed text-sm">
        <TrendingUp className="h-4 w-4 text-primary shrink-0" />
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground">Tip:</span> Accede directamente al formulario con{' '}
          <code className="bg-background border px-1.5 py-0.5 rounded text-xs font-mono">
            /rrhh/partes-diarios?action=nuevo
          </code>
        </span>
      </div>

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
              Esta acción no se puede deshacer. Se eliminarán también todas las novedades y actividades asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
