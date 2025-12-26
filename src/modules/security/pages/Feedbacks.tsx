import { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Loader2, 
  Eye, 
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bug,
  Lightbulb,
  HelpCircle,
  ShieldAlert,
  MessageCircle,
  Sparkles,
  MessageSquareOff,
  Download,
  Paperclip,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFeedbacks } from '../hooks/useFeedbacks';
import { useAuth } from '@/contexts/AuthContext';
import { Feedback } from '../services/feedbacksService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const tipoLabels: Record<Feedback['tipo'], string> = {
  sugerencia: 'Sugerencia',
  mejora: 'Mejora (feature)',
  queja: 'Queja',
  bug: 'Bug',
  consulta: 'Consulta',
  ayuda: 'Ayuda',
  'acceso-permiso': 'Acceso/Permiso',
};

const estadoLabels: Record<Feedback['estado'], string> = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
};

const tipoIcons: Record<Feedback['tipo'], typeof MessageSquare> = {
  sugerencia: Lightbulb,
  mejora: Sparkles,
  queja: AlertCircle,
  bug: Bug,
  consulta: HelpCircle,
  ayuda: MessageCircle,
  'acceso-permiso': ShieldAlert,
};

export default function Feedbacks() {
  const { user } = useAuth();
  const { 
    feedbacks, 
    isLoading, 
    updateFeedback, 
    respondToFeedback, 
    isUpdating,
    isResponding,
    getStatusBadgeVariant,
    getTipoBadgeVariant,
  } = useFeedbacks();

  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterSinRespuesta, setFilterSinRespuesta] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [respuesta, setRespuesta] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState<Feedback['estado']>('pendiente');
  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSearch = 
      fb.mensaje.toLowerCase().includes(search.toLowerCase()) ||
      fb.usuario_email?.toLowerCase().includes(search.toLowerCase()) ||
      fb.usuario_nombre?.toLowerCase().includes(search.toLowerCase());
    const matchesTipo = filterTipo === 'all' || fb.tipo === filterTipo;
    const matchesEstado = filterEstado === 'all' || fb.estado === filterEstado;
    const matchesSinRespuesta = !filterSinRespuesta || !fb.respuesta;
    return matchesSearch && matchesTipo && matchesEstado && matchesSinRespuesta;
  });

  const stats = {
    total: feedbacks.length,
    pendientes: feedbacks.filter(f => f.estado === 'pendiente').length,
    enRevision: feedbacks.filter(f => f.estado === 'en_revision').length,
    resueltos: feedbacks.filter(f => f.estado === 'resuelto').length,
    sinRespuesta: feedbacks.filter(f => !f.respuesta).length,
  };

  // Función para exportar a CSV
  const exportToCSV = () => {
    if (filteredFeedbacks.length === 0) {
      toast.error('No hay feedbacks para exportar');
      return;
    }

    const headers = ['Tipo', 'Usuario', 'Email', 'Mensaje', 'Estado', 'Respuesta', 'Fecha'];
    const rows = filteredFeedbacks.map(fb => [
      tipoLabels[fb.tipo],
      fb.usuario_nombre || 'Sin nombre',
      fb.usuario_email || '',
      `"${fb.mensaje.replace(/"/g, '""')}"`,
      estadoLabels[fb.estado],
      fb.respuesta ? `"${fb.respuesta.replace(/"/g, '""')}"` : '',
      new Date(fb.created_at).toLocaleDateString('es-AR'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedbacks_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Exportados ${filteredFeedbacks.length} feedbacks`);
  };

  const handleOpenDetail = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setRespuesta(feedback.respuesta || '');
    setNuevoEstado(feedback.estado);
  };

  const handleResponder = () => {
    if (!selectedFeedback || !user) return;
    
    if (respuesta.trim()) {
      respondToFeedback({
        id: selectedFeedback.id,
        respuesta: respuesta.trim(),
        respondidoPor: user.id,
      });
    } else {
      updateFeedback({
        id: selectedFeedback.id,
        input: { estado: nuevoEstado },
      });
    }
    setSelectedFeedback(null);
    setRespuesta('');
  };

  const handleCambiarEstado = (id: string, estado: Feedback['estado']) => {
    updateFeedback({ id, input: { estado } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Feedbacks</h1>
            <p className="text-muted-foreground">
              Gestiona las sugerencias, reportes y consultas de los usuarios
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Contador de pendientes destacado */}
          {stats.pendientes > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-pulse-soft">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                {stats.pendientes} {stats.pendientes === 1 ? 'pendiente' : 'pendientes'}
              </span>
            </div>
          )}
          
          {/* Botón de exportar CSV */}
          <Button variant="outline" onClick={exportToCSV} disabled={filteredFeedbacks.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-amber-500">{stats.pendientes}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En revisión</p>
                <p className="text-2xl font-bold text-blue-500">{stats.enRevision}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resueltos</p>
                <p className="text-2xl font-bold text-green-500">{stats.resueltos}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por mensaje, email o nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(tipoLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEstado} onValueChange={setFilterEstado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(estadoLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Filtro rápido: Sin respuesta */}
            <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-background">
              <Switch
                id="sin-respuesta"
                checked={filterSinRespuesta}
                onCheckedChange={setFilterSinRespuesta}
              />
              <label 
                htmlFor="sin-respuesta" 
                className="text-sm font-medium cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquareOff className="h-4 w-4 text-muted-foreground" />
                Sin respuesta
                {stats.sinRespuesta > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {stats.sinRespuesta}
                  </Badge>
                )}
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead className="max-w-[300px]">Mensaje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No se encontraron feedbacks
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeedbacks.map((feedback) => {
                  const TipoIcon = tipoIcons[feedback.tipo];
                  return (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <Badge variant={getTipoBadgeVariant(feedback.tipo) as any} className="gap-1">
                          <TipoIcon className="h-3 w-3" />
                          {tipoLabels[feedback.tipo]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{feedback.usuario_nombre || 'Sin nombre'}</p>
                          <p className="text-xs text-muted-foreground">{feedback.usuario_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <p className="truncate text-sm">{feedback.mensaje}</p>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={feedback.estado}
                          onValueChange={(value) => handleCambiarEstado(feedback.id, value as Feedback['estado'])}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(estadoLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(feedback.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(feedback)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFeedback && (
                <>
                  {(() => {
                    const TipoIcon = tipoIcons[selectedFeedback.tipo];
                    return <TipoIcon className="h-5 w-5 text-primary" />;
                  })()}
                  {tipoLabels[selectedFeedback?.tipo || 'consulta']}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              De: {selectedFeedback?.usuario_nombre || selectedFeedback?.usuario_email || 'Usuario'}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              {/* Mensaje original */}
              <div className="space-y-2">
                <Label>Mensaje</Label>
                <div className="p-3 bg-muted rounded-lg text-sm">
                  {selectedFeedback.mensaje}
                </div>
                <p className="text-xs text-muted-foreground">
                  Enviado {formatDistanceToNow(new Date(selectedFeedback.created_at), { 
                    addSuffix: true, 
                    locale: es 
                  })}
                </p>
              </div>

              {/* Archivos adjuntos */}
              {selectedFeedback.archivos_adjuntos && selectedFeedback.archivos_adjuntos.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Paperclip className="h-4 w-4" />
                    Archivos adjuntos ({selectedFeedback.archivos_adjuntos.length})
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedFeedback.archivos_adjuntos.map((url, idx) => {
                      const fileName = url.split('/').pop() || `archivo-${idx + 1}`;
                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded hover:bg-muted/80 transition-colors"
                        >
                          {isImage ? (
                            <img src={url} alt={fileName} className="h-8 w-8 object-cover rounded" />
                          ) : (
                            <ExternalLink className="h-3 w-3" />
                          )}
                          <span className="truncate max-w-[100px]">{fileName}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Respuesta existente */}
              {selectedFeedback.respuesta && (
                <div className="space-y-2">
                  <Label>Respuesta anterior</Label>
                  <div className="p-3 bg-primary/10 rounded-lg text-sm border-l-4 border-primary">
                    {selectedFeedback.respuesta}
                  </div>
                </div>
              )}

              {/* Estado */}
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={nuevoEstado} onValueChange={(v) => setNuevoEstado(v as Feedback['estado'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(estadoLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nueva respuesta */}
              <div className="space-y-2">
                <Label>Respuesta (opcional)</Label>
                <Textarea
                  placeholder="Escribe una respuesta para el usuario..."
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFeedback(null)}>
              Cancelar
            </Button>
            <Button onClick={handleResponder} disabled={isResponding || isUpdating}>
              {(isResponding || isUpdating) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
