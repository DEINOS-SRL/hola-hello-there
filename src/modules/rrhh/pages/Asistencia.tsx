import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Clock, 
  Calendar, 
  UserCheck, 
  UserX, 
  FileText,
  Plus,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { rrhhClient } from '../services/rrhhClient';
import { RegistrarAsistenciaModal } from '../components/RegistrarAsistenciaModal';
import { HorarioModal } from '../components/HorarioModal';
import type { Asistencia, Permiso, Horario, TipoAsistencia, EstadoPermiso } from '../types/asistencia';

const tipoAsistenciaConfig: Record<TipoAsistencia, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  normal: { label: 'Normal', variant: 'default' },
  tardanza: { label: 'Tardanza', variant: 'secondary' },
  falta: { label: 'Falta', variant: 'destructive' },
  permiso: { label: 'Permiso', variant: 'outline' },
  vacaciones: { label: 'Vacaciones', variant: 'outline' },
  licencia: { label: 'Licencia', variant: 'outline' },
};

const estadoPermisoConfig: Record<EstadoPermiso, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendiente: { label: 'Pendiente', variant: 'secondary' },
  aprobado: { label: 'Aprobado', variant: 'default' },
  rechazado: { label: 'Rechazado', variant: 'destructive' },
  cancelado: { label: 'Cancelado', variant: 'outline' },
};

export default function AsistenciaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('registros');
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [showHorarioModal, setShowHorarioModal] = useState(false);

  // Fetch asistencias del día
  const { data: asistencias = [], isLoading: loadingAsistencias } = useQuery({
    queryKey: ['asistencias', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await rrhhClient
        .from('asistencias')
        .select('*')
        .eq('fecha', format(selectedDate, 'yyyy-MM-dd'))
        .order('hora_entrada', { ascending: true });
      
      if (error) throw error;
      return data as Asistencia[];
    },
  });

  // Fetch permisos pendientes
  const { data: permisos = [], isLoading: loadingPermisos } = useQuery({
    queryKey: ['permisos'],
    queryFn: async () => {
      const { data, error } = await rrhhClient
        .from('permisos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as Permiso[];
    },
  });

  // Fetch horarios
  const { data: horarios = [], isLoading: loadingHorarios } = useQuery({
    queryKey: ['horarios'],
    queryFn: async () => {
      const { data, error } = await rrhhClient
        .from('horarios')
        .select('*')
        .eq('activo', true)
        .order('nombre');
      
      if (error) throw error;
      return data as Horario[];
    },
  });

  // Estadísticas del día
  const stats = {
    presentes: asistencias.filter(a => a.tipo === 'normal' && a.hora_entrada).length,
    tardanzas: asistencias.filter(a => a.tipo === 'tardanza').length,
    faltas: asistencias.filter(a => a.tipo === 'falta').length,
    permisosPendientes: permisos.filter(p => p.estado === 'pendiente').length,
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Asistencia</h1>
            <p className="text-muted-foreground">Control de horarios, asistencia y permisos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" onClick={() => setShowRegistrarModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Registrar
          </Button>
        </div>
      </div>

      {/* Modal para registrar asistencia */}
      <RegistrarAsistenciaModal
        open={showRegistrarModal}
        onOpenChange={setShowRegistrarModal}
        selectedDate={selectedDate}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Presentes</CardDescription>
            <CardTitle className="text-3xl text-primary">{stats.presentes}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCheck className="h-4 w-4" />
              <span>Asistencia normal</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tardanzas</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.tardanzas}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Llegadas tarde</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Faltas</CardDescription>
            <CardTitle className="text-3xl text-destructive">{stats.faltas}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserX className="h-4 w-4" />
              <span>Sin asistencia</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Permisos Pendientes</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.permisosPendientes}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Por aprobar</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </span>
        </div>
        <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="registros">Registros del Día</TabsTrigger>
          <TabsTrigger value="permisos">
            Permisos
            {stats.permisosPendientes > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {stats.permisosPendientes}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="horarios">Horarios</TabsTrigger>
        </TabsList>

        <TabsContent value="registros" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Registros de Asistencia</CardTitle>
              <CardDescription>
                {asistencias.length} registros para {format(selectedDate, "d 'de' MMMM", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAsistencias ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : asistencias.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay registros de asistencia para este día</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowRegistrarModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar registro
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead>Salida</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asistencias.map((asistencia) => (
                      <TableRow key={asistencia.id}>
                        <TableCell className="font-medium">
                          {asistencia.empleado_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          {asistencia.hora_entrada 
                            ? format(new Date(asistencia.hora_entrada), 'HH:mm')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {asistencia.hora_salida 
                            ? format(new Date(asistencia.hora_salida), 'HH:mm')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tipoAsistenciaConfig[asistencia.tipo].variant}>
                            {tipoAsistenciaConfig[asistencia.tipo].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {asistencia.observaciones || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permisos" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Permisos y Licencias</CardTitle>
                <CardDescription>Solicitudes de permisos de los empleados</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nueva solicitud
              </Button>
            </CardHeader>
            <CardContent>
              {loadingPermisos ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : permisos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay solicitudes de permisos</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha Inicio</TableHead>
                      <TableHead>Fecha Fin</TableHead>
                      <TableHead>Días</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permisos.map((permiso) => (
                      <TableRow key={permiso.id}>
                        <TableCell className="font-medium">
                          {permiso.empleado_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="capitalize">
                          {permiso.tipo.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(permiso.fecha_inicio), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(permiso.fecha_fin), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{permiso.dias_totales}</TableCell>
                        <TableCell>
                          <Badge variant={estadoPermisoConfig[permiso.estado].variant}>
                            {estadoPermisoConfig[permiso.estado].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {permiso.estado === 'pendiente' && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                                Aprobar
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                Rechazar
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="horarios" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Horarios de Trabajo</CardTitle>
                <CardDescription>Configuración de horarios laborales</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowHorarioModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo horario
              </Button>
            </CardHeader>
            <CardContent>
              {loadingHorarios ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : horarios.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay horarios configurados</p>
                  <Button variant="outline" className="mt-4" onClick={() => setShowHorarioModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primer horario
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead>Salida</TableHead>
                      <TableHead>Tolerancia</TableHead>
                      <TableHead>Días Laborables</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {horarios.map((horario) => (
                      <TableRow key={horario.id}>
                        <TableCell className="font-medium">{horario.nombre}</TableCell>
                        <TableCell>{horario.hora_entrada}</TableCell>
                        <TableCell>{horario.hora_salida}</TableCell>
                        <TableCell>{horario.tolerancia_minutos} min</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {horario.dias_laborables.map((dia) => (
                              <Badge key={dia} variant="outline" className="text-xs capitalize">
                                {dia.slice(0, 3)}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para crear horario */}
      <HorarioModal
        open={showHorarioModal}
        onOpenChange={setShowHorarioModal}
      />
    </div>
  );
}
