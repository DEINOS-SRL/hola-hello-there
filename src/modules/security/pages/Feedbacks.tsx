// Feedbacks page - DNSCloud - Administración de feedbacks
import { useState, useMemo, useRef, useCallback } from 'react';
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
  ZoomIn,
  FileText,
  Calendar,
  AlertTriangle,
  Info,
  Copy,
  Users,
  Eye as EyeIcon,
  EyeOff,
  History,
  Timer,
  UserPlus,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ImageLightbox, useImageLightbox } from '@/components/ui/image-lightbox';
import { useFeedbacks } from '../hooks/useFeedbacks';
import { useFeedbackComentarios } from '../hooks/useFeedbackComentarios';
import { useFeedbackHistorial } from '../hooks/useFeedbackHistorial';
import { useAuth } from '@/contexts/AuthContext';
import { Feedback } from '../services/feedbacksService';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { moduleRegistry } from '@/app/moduleRegistry';

// Labels para módulos
const getModuloLabel = (moduloId: string | null): string => {
  if (!moduloId) return '';
  if (moduloId === 'general') return 'General / Plataforma';
  if (moduloId === 'dashboard') return 'Dashboard';
  if (moduloId === 'otro') return 'Otro / Nueva funcionalidad';
  const modulo = moduleRegistry.find(m => m.moduleId === moduloId);
  return modulo?.name || moduloId;
};

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
    usuariosAsignables,
    isLoading, 
    updateFeedback, 
    respondToFeedback,
    asignarFeedback,
    isUpdating,
    isResponding,
    isAsignando,
    getStatusBadgeVariant,
    getTipoBadgeVariant,
  } = useFeedbacks();

  // Lightbox state
  const lightbox = useImageLightbox();

  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<string>('all');
  const [filterEstado, setFilterEstado] = useState<string>('all');
  const [filterModulo, setFilterModulo] = useState<string>('all');
  const [filterAsignado, setFilterAsignado] = useState<string>('all');
  const [filterSinRespuesta, setFilterSinRespuesta] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [respuesta, setRespuesta] = useState('');
  const [nuevoEstado, setNuevoEstado] = useState<Feedback['estado']>('pendiente');
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [esComentarioInterno, setEsComentarioInterno] = useState(false);
  const [mostrarSoloInternos, setMostrarSoloInternos] = useState(false);
  // Hook de comentarios - se carga solo cuando hay un feedback seleccionado
  const { 
    comentarios, 
    isLoading: isLoadingComentarios, 
    createComentario, 
    isCreating: isCreatingComentario 
  } = useFeedbackComentarios(selectedFeedback?.id || null);

  // Hook de historial - se carga solo cuando hay un feedback seleccionado
  const { 
    historial, 
    isLoading: isLoadingHistorial, 
    createHistorial 
  } = useFeedbackHistorial(selectedFeedback?.id || null);

  // Función para copiar enlace al portapapeles
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
    } catch (err) {
      toast.error('No se pudo copiar el enlace');
    }
  };

  // Función para agregar comentario
  const handleAgregarComentario = () => {
    if (!selectedFeedback || !user || !nuevoComentario.trim()) return;
    
    createComentario({
      feedback_id: selectedFeedback.id,
      usuario_id: user.id,
      usuario_email: user.email,
      usuario_nombre: (user as any).user_metadata?.nombre || user.email,
      mensaje: nuevoComentario.trim(),
      es_interno: esComentarioInterno,
    });
    setNuevoComentario('');
    setEsComentarioInterno(false);
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesSearch = 
      fb.mensaje.toLowerCase().includes(search.toLowerCase()) ||
      fb.usuario_email?.toLowerCase().includes(search.toLowerCase()) ||
      fb.usuario_nombre?.toLowerCase().includes(search.toLowerCase());
    const matchesTipo = filterTipo === 'all' || fb.tipo === filterTipo;
    const matchesEstado = filterEstado === 'all' || fb.estado === filterEstado;
    const matchesModulo = filterModulo === 'all' || fb.modulo_referencia === filterModulo || 
      (filterModulo === 'sin-modulo' && !fb.modulo_referencia);
    const matchesAsignado = filterAsignado === 'all' || 
      (filterAsignado === 'sin-asignar' && !fb.asignado_a) ||
      (filterAsignado === 'mis-asignados' && fb.asignado_a === user?.id) ||
      fb.asignado_a === filterAsignado;
    const matchesSinRespuesta = !filterSinRespuesta || !fb.respuesta;
    return matchesSearch && matchesTipo && matchesEstado && matchesModulo && matchesAsignado && matchesSinRespuesta;
  });

  const stats = useMemo(() => {
    const resueltos = feedbacks.filter(f => f.estado === 'resuelto' || f.estado === 'cerrado');
    
    // Calcular tiempo promedio de resolución
    const tiemposResolucion = resueltos
      .filter(f => f.respondido_at)
      .map(f => {
        const createdAt = new Date(f.created_at).getTime();
        const resolvedAt = new Date(f.respondido_at!).getTime();
        return resolvedAt - createdAt;
      });
    
    const tiempoPromedioMs = tiemposResolucion.length > 0 
      ? tiemposResolucion.reduce((a, b) => a + b, 0) / tiemposResolucion.length 
      : 0;
    
    // Convertir a horas/días
    const tiempoPromedioHoras = tiempoPromedioMs / (1000 * 60 * 60);
    const tiempoPromedioDias = tiempoPromedioHoras / 24;
    
    let tiempoPromedioLabel = 'N/A';
    if (tiempoPromedioMs > 0) {
      if (tiempoPromedioDias >= 1) {
        tiempoPromedioLabel = `${tiempoPromedioDias.toFixed(1)} días`;
      } else {
        tiempoPromedioLabel = `${tiempoPromedioHoras.toFixed(1)} horas`;
      }
    }
    
    return {
      total: feedbacks.length,
      pendientes: feedbacks.filter(f => f.estado === 'pendiente').length,
      enRevision: feedbacks.filter(f => f.estado === 'en_revision').length,
      resueltos: resueltos.length,
      sinRespuesta: feedbacks.filter(f => !f.respuesta).length,
      tiempoPromedioLabel,
      tiempoPromedioHoras,
    };
  }, [feedbacks]);

  // Datos para el gráfico de torta por tipo
  const TIPO_COLORS: Record<string, string> = {
    sugerencia: '#22c55e',
    mejora: '#3b82f6', 
    queja: '#ef4444',
    bug: '#dc2626',
    consulta: '#8b5cf6',
    ayuda: '#06b6d4',
    'acceso-permiso': '#f59e0b',
  };

  const chartDataPorTipo = useMemo(() => {
    const countByTipo = feedbacks.reduce((acc, fb) => {
      acc[fb.tipo] = (acc[fb.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countByTipo)
      .map(([tipo, count]) => ({
        name: tipoLabels[tipo as keyof typeof tipoLabels] || tipo,
        value: count,
        color: TIPO_COLORS[tipo] || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value);
  }, [feedbacks]);

  // Datos para el gráfico de barras por mes (últimos 6 meses)
  const chartDataPorMes = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      
      const count = feedbacks.filter(fb => {
        const fbDate = new Date(fb.created_at);
        return isWithinInterval(fbDate, { start, end });
      }).length;
      
      months.push({
        name: format(monthDate, 'MMM yy', { locale: es }),
        feedbacks: count,
      });
    }
    return months;
  }, [feedbacks]);

  // Referencia para exportar a PDF
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Función para exportar a PDF
  const exportToPDF = async () => {
    if (feedbacks.length === 0) {
      toast.error('No hay feedbacks para exportar');
      return;
    }

    setIsExportingPDF(true);
    toast.info('Generando PDF...');

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let yPosition = margin;

      // Título
      pdf.setFontSize(20);
      pdf.setTextColor(45, 139, 122); // Color primario
      pdf.text('Reporte de Feedbacks', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Fecha del reporte
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generado el ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Estadísticas
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Resumen', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      const statsText = [
        `Total de feedbacks: ${stats.total}`,
        `Pendientes: ${stats.pendientes}`,
        `En revisión: ${stats.enRevision}`,
        `Resueltos: ${stats.resueltos}`,
        `Sin respuesta: ${stats.sinRespuesta}`,
      ];
      statsText.forEach(text => {
        pdf.text(text, margin, yPosition);
        yPosition += 6;
      });
      yPosition += 10;

      // Capturar gráficos como imágenes
      const chartsContainer = document.getElementById('charts-container');
      if (chartsContainer) {
        const canvas = await html2canvas(chartsContainer, { 
          backgroundColor: '#ffffff',
          scale: 2,
        });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        if (yPosition + imgHeight > 280) {
          pdf.addPage();
          yPosition = margin;
        }
        
        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      }

      // Lista de feedbacks
      pdf.addPage();
      yPosition = margin;
      pdf.setFontSize(14);
      pdf.text('Detalle de Feedbacks', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(8);
      filteredFeedbacks.slice(0, 30).forEach((fb, idx) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setTextColor(45, 139, 122);
        pdf.text(`${idx + 1}. ${tipoLabels[fb.tipo]}`, margin, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 5;

        const mensaje = fb.mensaje.length > 100 ? fb.mensaje.substring(0, 100) + '...' : fb.mensaje;
        pdf.text(mensaje, margin + 5, yPosition);
        yPosition += 5;

        pdf.setTextColor(100, 100, 100);
        pdf.text(`Estado: ${estadoLabels[fb.estado]} | ${format(new Date(fb.created_at), 'dd/MM/yyyy')}`, margin + 5, yPosition);
        pdf.setTextColor(0, 0, 0);
        yPosition += 8;
      });

      if (filteredFeedbacks.length > 30) {
        pdf.text(`... y ${filteredFeedbacks.length - 30} feedbacks más`, margin, yPosition);
      }

      pdf.save(`feedbacks_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('PDF exportado correctamente');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error al exportar PDF');
    } finally {
      setIsExportingPDF(false);
    }
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
    
    // Registrar cambio de estado si cambió
    if (nuevoEstado !== selectedFeedback.estado) {
      createHistorial({
        feedback_id: selectedFeedback.id,
        estado_anterior: selectedFeedback.estado,
        estado_nuevo: nuevoEstado,
        usuario_id: user.id,
        usuario_email: user.email,
        usuario_nombre: (user as any).user_metadata?.nombre || user.email,
      });
    }
    
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
    const feedback = feedbacks.find(f => f.id === id);
    if (feedback && feedback.estado !== estado && user) {
      createHistorial({
        feedback_id: id,
        estado_anterior: feedback.estado,
        estado_nuevo: estado,
        usuario_id: user.id,
        usuario_email: user.email,
        usuario_nombre: (user as any).user_metadata?.nombre || user.email,
      });
    }
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
          
          {/* Botón de exportar PDF */}
          <Button 
            variant="outline" 
            onClick={exportToPDF} 
            disabled={feedbacks.length === 0 || isExportingPDF}
          >
            {isExportingPDF ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Exportar PDF
          </Button>

          {/* Botón de exportar CSV */}
          <Button variant="outline" onClick={exportToCSV} disabled={filteredFeedbacks.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
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
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo promedio</p>
                <p className="text-2xl font-bold text-primary">{stats.tiempoPromedioLabel}</p>
              </div>
              <Timer className="h-8 w-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Contenedor para PDF */}
      {feedbacks.length > 0 && (
        <div id="charts-container" className="grid gap-4 md:grid-cols-2">
          {/* Gráfico de distribución por tipo */}
          {chartDataPorTipo.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Distribución por Tipo
                </CardTitle>
                <CardDescription>Cantidad de feedbacks según su categoría</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartDataPorTipo}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {chartDataPorTipo.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`${value} feedbacks`, 'Cantidad']}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        align="center"
                        layout="horizontal"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gráfico de tendencia mensual */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Tendencia Mensual
              </CardTitle>
              <CardDescription>Feedbacks recibidos en los últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataPorMes} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} feedbacks`, 'Cantidad']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar 
                      dataKey="feedbacks" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
            
            {/* Filtro por módulo */}
            <Select value={filterModulo} onValueChange={setFilterModulo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los módulos</SelectItem>
                <SelectItem value="sin-modulo">Sin módulo asignado</SelectItem>
                <SelectItem value="general">General / Plataforma</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                {moduleRegistry.map((m) => (
                  <SelectItem key={m.moduleId} value={m.moduleId}>{m.name}</SelectItem>
                ))}
                <SelectItem value="otro">Otro / Nueva funcionalidad</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro por asignado */}
            <Select value={filterAsignado} onValueChange={setFilterAsignado}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Asignado a" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                <SelectItem value="mis-asignados">Mis asignados</SelectItem>
                {usuariosAsignables.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.nombre} {u.apellido}
                  </SelectItem>
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
                <TableHead>Asignado a</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm flex-1">{feedback.mensaje}</p>
                          {feedback.archivos_adjuntos && feedback.archivos_adjuntos.length > 0 && (
                            <Badge variant="outline" className="gap-1 flex-shrink-0">
                              <Paperclip className="h-3 w-3" />
                              {feedback.archivos_adjuntos.length}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={feedback.asignado_a || 'sin-asignar'}
                          onValueChange={(value) => {
                            const asignadoA = value === 'sin-asignar' ? null : value;
                            if (user) {
                              asignarFeedback({
                                feedbackId: feedback.id,
                                asignadoA,
                                asignadoPor: user.id,
                                empresaId: (user as any).user_metadata?.empresa_id,
                                feedbackTipo: feedback.tipo,
                              });
                            }
                          }}
                          disabled={isAsignando}
                        >
                          <SelectTrigger className="w-[160px] h-8">
                            <SelectValue>
                              {feedback.asignado_a ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
                                    {(() => {
                                      const usr = usuariosAsignables.find(u => u.id === feedback.asignado_a);
                                      if (!usr) return '?';
                                      return `${usr.nombre?.charAt(0) || ''}${usr.apellido?.charAt(0) || ''}`.toUpperCase();
                                    })()}
                                  </div>
                                  <span className="text-sm truncate">
                                    {usuariosAsignables.find(u => u.id === feedback.asignado_a)?.nombre || 'Usuario'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Sin asignar</span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sin-asignar">
                              <span className="text-muted-foreground">Sin asignar</span>
                            </SelectItem>
                            {usuariosAsignables.map((u) => (
                              <SelectItem key={u.id} value={u.id}>
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-semibold text-primary">
                                    {`${u.nombre?.charAt(0) || ''}${u.apellido?.charAt(0) || ''}`.toUpperCase()}
                                  </div>
                                  <span>{u.nombre} {u.apellido}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
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
            <ScrollArea className="flex-1 pr-4 -mr-4">
              <div className="space-y-4 pr-2">
              {/* Módulo de referencia */}
              {selectedFeedback.modulo_referencia && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getModuloLabel(selectedFeedback.modulo_referencia)}
                  </Badge>
                </div>
              )}

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
                      const isImageFile = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                      const imageUrls = selectedFeedback.archivos_adjuntos?.filter(u => 
                        /\.(jpg|jpeg|png|gif|webp)$/i.test(u)
                      ) || [];
                      const imageIndex = imageUrls.indexOf(url);
                      
                      if (isImageFile) {
                        return (
                          <button
                            key={idx}
                            onClick={() => lightbox.openLightbox(imageUrls, imageIndex)}
                            className="group relative h-16 w-16 rounded overflow-hidden border hover:ring-2 ring-primary transition-all"
                          >
                            <img 
                              src={url} 
                              alt={fileName} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.parentElement?.classList.add('bg-destructive/10');
                                const icon = document.createElement('div');
                                icon.innerHTML = '⚠️';
                                icon.className = 'flex items-center justify-center h-full w-full text-xl';
                                target.parentElement?.appendChild(icon);
                              }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                              <ZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        );
                      }
                      
                      return (
                        <div key={idx} className="flex items-center gap-1">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded hover:bg-muted/80 transition-colors"
                            onClick={(e) => {
                              // Mostrar toast de ayuda al hacer clic
                              setTimeout(() => {
                                toast.info(
                                  '¿No se abre el archivo? Puede ser bloqueado por una extensión del navegador (ad blocker, antivirus). Intenta desactivarlas o usa modo incógnito.',
                                  { duration: 8000 }
                                );
                              }, 2000);
                            }}
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate max-w-[100px]">{fileName}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(url)}
                            className="p-1 text-xs bg-muted rounded hover:bg-muted/80 transition-colors"
                            title="Copiar enlace"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {/* Mensaje de ayuda para archivos */}
                  <Alert variant="default" className="mt-2 py-2">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Si no puedes abrir los archivos, puede ser que una extensión del navegador (ad blocker, antivirus) esté bloqueando la descarga. Intenta desactivarlas o usa el modo incógnito.
                    </AlertDescription>
                  </Alert>
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

              {/* Sección de Comentarios/Seguimiento */}
              <div className="space-y-3 border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Comentarios de seguimiento ({comentarios.length})
                  </Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="filtro-internos"
                      checked={mostrarSoloInternos}
                      onCheckedChange={(checked) => setMostrarSoloInternos(checked === true)}
                    />
                    <label 
                      htmlFor="filtro-internos" 
                      className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer"
                    >
                      <EyeOff className="h-3 w-3" />
                      Solo internos
                    </label>
                  </div>
                </div>
                
                {/* Lista de comentarios */}
                <ScrollArea className="max-h-40">
                  {isLoadingComentarios ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : comentarios.filter(c => !mostrarSoloInternos || c.es_interno).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      {mostrarSoloInternos ? 'No hay comentarios internos' : 'No hay comentarios aún'}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {comentarios
                        .filter(c => !mostrarSoloInternos || c.es_interno)
                        .map((comentario) => (
                        <div 
                          key={comentario.id} 
                          className={`p-2 rounded text-sm ${comentario.es_interno ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-muted/50'}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-xs">
                                {comentario.usuario_nombre || comentario.usuario_email || 'Usuario'}
                              </span>
                              {comentario.es_interno && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 gap-1 text-amber-600 border-amber-500/30">
                                  <EyeOff className="h-2.5 w-2.5" />
                                  Interno
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comentario.created_at), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          </div>
                          <p className="text-xs">{comentario.mensaje}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Agregar nuevo comentario */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Agregar comentario..."
                      value={nuevoComentario}
                      onChange={(e) => setNuevoComentario(e.target.value)}
                      className="text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAgregarComentario();
                        }
                      }}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleAgregarComentario}
                      disabled={!nuevoComentario.trim() || isCreatingComentario}
                    >
                      {isCreatingComentario ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="comentario-interno"
                      checked={esComentarioInterno}
                      onCheckedChange={(checked) => setEsComentarioInterno(checked === true)}
                    />
                    <label 
                      htmlFor="comentario-interno" 
                      className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer"
                    >
                      <EyeOff className="h-3 w-3" />
                      Marcar como interno (solo visible para administradores)
                    </label>
                  </div>
                </div>
              </div>

              {/* Historial de cambios de estado */}
              <div className="space-y-3 border rounded-lg p-3">
                <Label className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Historial de estados
                </Label>
                
                <ScrollArea className="max-h-32">
                  {isLoadingHistorial ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : historial.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Sin cambios de estado registrados
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {historial.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                          </span>
                          <span className="font-medium">{item.usuario_nombre || 'Sistema'}</span>
                          <span className="text-muted-foreground">cambió de</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {estadoLabels[item.estado_anterior as keyof typeof estadoLabels] || item.estado_anterior || 'Nuevo'}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {estadoLabels[item.estado_nuevo as keyof typeof estadoLabels] || item.estado_nuevo}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Asignar a usuario */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Asignar a
                </Label>
                <Select 
                  value={selectedFeedback.asignado_a || 'sin-asignar'} 
                  onValueChange={(v) => {
                    if (!user) return;
                    asignarFeedback({
                      feedbackId: selectedFeedback.id,
                      asignadoA: v === 'sin-asignar' ? null : v,
                      asignadoPor: user.id,
                      empresaId: selectedFeedback.empresa_id || undefined,
                      feedbackTipo: tipoLabels[selectedFeedback.tipo],
                    });
                  }}
                  disabled={isAsignando}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sin-asignar">Sin asignar</SelectItem>
                    {usuariosAsignables.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.nombre} {u.apellido} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFeedback.asignado_a && (
                  <p className="text-xs text-muted-foreground">
                    Asignado {selectedFeedback.asignado_at && formatDistanceToNow(new Date(selectedFeedback.asignado_at), { addSuffix: true, locale: es })}
                  </p>
                )}
              </div>

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
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>
          )}

          <DialogFooter className="flex-shrink-0 pt-4">
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

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightbox.images}
        initialIndex={lightbox.index}
        open={lightbox.open}
        onClose={lightbox.closeLightbox}
      />
    </div>
  );
}
