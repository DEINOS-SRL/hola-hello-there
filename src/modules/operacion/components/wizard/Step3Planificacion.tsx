import { useEffect, useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, UserCog, Truck, Users, X, Calendar, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useWizardData } from '../../hooks/useMovimientos';
import { movimientosService } from '../../services/movimientosService';
import type { WizardMovimientoData } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Step3Props {
  data: WizardMovimientoData;
  updateData: (updates: Partial<WizardMovimientoData>) => void;
  movimientoId: string | null;
}

type TabKey = 'horario' | 'recursos';

const TABS = [
  { key: 'horario' as TabKey, label: 'Hora Servicio', icon: Clock },
  { key: 'recursos' as TabKey, label: 'Recursos Asignados', icon: Truck },
];

export function Step3Planificacion({ data, updateData, movimientoId }: Step3Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('horario');
  const { equiposEqu, empleados } = useWizardData();
  const isMobile = useIsMobile();
  
  // Supervisores del sistema
  const supervisores = empleados.filter((e: any) => 
    e.cargo?.toLowerCase().includes('supervisor') || 
    e.cargo?.toLowerCase().includes('jefe') ||
    e.cargo?.toLowerCase().includes('encargado')
  );

  // Load existing assignments if editing
  const { data: empleadosAsignados } = useQuery({
    queryKey: ['movimiento-empleados', movimientoId],
    queryFn: () => movimientoId ? movimientosService.getMovimientoEmpleados(movimientoId) : Promise.resolve([]),
    enabled: !!movimientoId,
  });

  const { data: equiposAsignados } = useQuery({
    queryKey: ['movimiento-equipos-equ', movimientoId],
    queryFn: () => movimientoId ? movimientosService.getMovimientoEquiposEqu(movimientoId) : Promise.resolve([]),
    enabled: !!movimientoId,
  });

  // Initialize datetime field with fecha_movimiento and 06:00 time
  useEffect(() => {
    if (data.fecha_movimiento && !data.hora_inicio_programada) {
      const defaultDateTime = `${data.fecha_movimiento}T06:00`;
      updateData({ hora_inicio_programada: defaultDateTime });
    }
  }, [data.fecha_movimiento]);

  useEffect(() => {
    if (empleadosAsignados && empleadosAsignados.length > 0) {
      updateData({ 
        empleados_asignados: empleadosAsignados.map(e => ({
          empleado_id: e.empleado_id,
          rol_asignado: e.rol_asignado
        }))
      });
    }
    if (equiposAsignados && equiposAsignados.length > 0) {
      updateData({ equipos_asignados_equ: equiposAsignados.map(e => e.equipo_id) });
    }
  }, [empleadosAsignados, equiposAsignados]);

  const toggleEquipo = (equipoId: string) => {
    const current = data.equipos_asignados_equ || [];
    if (current.includes(equipoId)) {
      updateData({ equipos_asignados_equ: current.filter(id => id !== equipoId) });
    } else {
      updateData({ equipos_asignados_equ: [...current, equipoId] });
    }
  };

  const toggleEmpleado = (empleadoId: string) => {
    const current = data.empleados_asignados || [];
    const exists = current.find(e => e.empleado_id === empleadoId);
    if (exists) {
      updateData({ empleados_asignados: current.filter(e => e.empleado_id !== empleadoId) });
    } else {
      updateData({ 
        empleados_asignados: [...current, { empleado_id: empleadoId, rol_asignado: 'operario' }]
      });
    }
  };

  const updateEmpleadoRol = (empleadoId: string, rol: string) => {
    const current = data.empleados_asignados || [];
    updateData({
      empleados_asignados: current.map(e => 
        e.empleado_id === empleadoId ? { ...e, rol_asignado: rol } : e
      )
    });
  };

  // Get selected equipment details
  const selectedEquipos = equiposEqu.filter((eq: any) => 
    data.equipos_asignados_equ.includes(eq.id)
  );

  // Get selected employees details
  const selectedEmpleados = empleados.filter((emp: any) =>
    data.empleados_asignados.some(e => e.empleado_id === emp.id)
  );

  // Tab content components
  const HorarioContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          Horario de servicio
        </Label>
        <Input
          type="datetime-local"
          value={data.hora_inicio_programada}
          onChange={(e) => updateData({ hora_inicio_programada: e.target.value })}
          className="w-full max-w-xs"
        />
      </div>
      
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <UserCog className="h-4 w-4 text-primary" />
          Supervisor a Cargo
        </Label>
        <Select value={data.supervisor_id} onValueChange={(v) => updateData({ supervisor_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar supervisor" />
          </SelectTrigger>
          <SelectContent>
            {supervisores.length > 0 ? (
              supervisores.map((sup: any) => (
                <SelectItem key={sup.id} value={sup.id}>
                  {sup.apellido}, {sup.nombre}
                </SelectItem>
              ))
            ) : (
              empleados.map((emp: any) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.apellido}, {emp.nombre}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const RecursosContent = () => {
    const [equipoOpen, setEquipoOpen] = useState(false);
    const [empleadoOpen, setEmpleadoOpen] = useState(false);
    const [equipoSearch, setEquipoSearch] = useState('');
    const [empleadoSearch, setEmpleadoSearch] = useState('');

    const filteredEquipos = useMemo(() => {
      return equiposEqu.filter((eq: any) => 
        !data.equipos_asignados_equ.includes(eq.id) &&
        (eq.codigo?.toLowerCase().includes(equipoSearch.toLowerCase()) ||
         eq.nombre?.toLowerCase().includes(equipoSearch.toLowerCase()) ||
         eq.numero_interno?.toLowerCase().includes(equipoSearch.toLowerCase()))
      );
    }, [equiposEqu, data.equipos_asignados_equ, equipoSearch]);

    const filteredEmpleados = useMemo(() => {
      return empleados.filter((emp: any) => 
        !data.empleados_asignados.some(e => e.empleado_id === emp.id) &&
        (`${emp.apellido} ${emp.nombre}`.toLowerCase().includes(empleadoSearch.toLowerCase()) ||
         emp.legajo?.toLowerCase().includes(empleadoSearch.toLowerCase()))
      );
    }, [empleados, data.empleados_asignados, empleadoSearch]);

    return (
      <div className="space-y-6">
        {/* Equipos Section */}
        <div className="space-y-4">
          {/* Label + Autocomplete en la misma fila */}
          <div className="flex items-center gap-4 flex-wrap">
            <Label className="flex items-center gap-2 text-base font-medium whitespace-nowrap">
              <Truck className="h-4 w-4 text-primary" />
              Equipos
              {data.equipos_asignados_equ.length > 0 && (
                <Badge variant="secondary">{data.equipos_asignados_equ.length}</Badge>
              )}
            </Label>

            {/* Equipment autocomplete */}
            <Popover open={equipoOpen} onOpenChange={setEquipoOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Search className="h-4 w-4" />
                  Añadir equipo
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Buscar equipo..." 
                    value={equipoSearch}
                    onValueChange={setEquipoSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No se encontraron equipos</CommandEmpty>
                    <CommandGroup>
                      {filteredEquipos.slice(0, 10).map((equipo: any) => (
                        <CommandItem
                          key={equipo.id}
                          onSelect={() => {
                            toggleEquipo(equipo.id);
                            setEquipoSearch('');
                          }}
                        >
                          <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">{equipo.codigo}</p>
                            <p className="text-xs text-muted-foreground">{equipo.nombre}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected Equipment Cards */}
          {selectedEquipos.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {selectedEquipos.map((equipo: any) => (
                <Card 
                  key={equipo.id} 
                  className="border-2 border-primary bg-primary/5 relative group"
                >
                  <button
                    onClick={() => toggleEquipo(equipo.id)}
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <CardContent className="p-4 text-center">
                    <div className="w-20 h-16 bg-muted rounded-md flex items-center justify-center mb-2 mx-auto">
                      <Truck className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="font-semibold text-sm">{equipo.codigo}</p>
                    {equipo.numero_interno && (
                      <p className="text-xs text-muted-foreground">Interno: {equipo.numero_interno}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Operarios Section */}
        <div className="space-y-4">
          {/* Label + Autocomplete en la misma fila */}
          <div className="flex items-center gap-4 flex-wrap">
            <Label className="flex items-center gap-2 text-base font-medium whitespace-nowrap">
              <Users className="h-4 w-4 text-primary" />
              Operarios
              {data.empleados_asignados.length > 0 && (
                <Badge variant="secondary">{data.empleados_asignados.length}</Badge>
              )}
            </Label>

            {/* Employee autocomplete */}
            <Popover open={empleadoOpen} onOpenChange={setEmpleadoOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Search className="h-4 w-4" />
                  Añadir operario
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Buscar operario..." 
                    value={empleadoSearch}
                    onValueChange={setEmpleadoSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No se encontraron operarios</CommandEmpty>
                    <CommandGroup>
                      {filteredEmpleados.slice(0, 10).map((empleado: any) => (
                        <CommandItem
                          key={empleado.id}
                          onSelect={() => {
                            toggleEmpleado(empleado.id);
                            setEmpleadoSearch('');
                          }}
                        >
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">{empleado.apellido}, {empleado.nombre}</p>
                            <p className="text-xs text-muted-foreground">{empleado.cargo || empleado.legajo}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Selected Employees Cards */}
          {selectedEmpleados.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {selectedEmpleados.map((empleado: any) => {
                const asignado = data.empleados_asignados.find(e => e.empleado_id === empleado.id);
                return (
                  <Card 
                    key={empleado.id} 
                    className="border-2 border-primary bg-primary/5 relative group"
                  >
                    <button
                      onClick={() => toggleEmpleado(empleado.id)}
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2 mx-auto">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <p className="font-semibold text-sm">{empleado.apellido}</p>
                      <p className="text-xs text-muted-foreground">{empleado.nombre}</p>
                      <Select
                        value={asignado?.rol_asignado || 'operario'}
                        onValueChange={(v) => updateEmpleadoRol(empleado.id, v)}
                      >
                        <SelectTrigger className="mt-2 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operario">Operario</SelectItem>
                          <SelectItem value="lider">Líder</SelectItem>
                          <SelectItem value="conductor">Conductor</SelectItem>
                          <SelectItem value="ayudante">Ayudante</SelectItem>
                          <SelectItem value="apoyo">Apoyo</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Mobile: Card-style tabs
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Mobile Tab Cards */}
        <div className="flex gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <Card
                key={tab.key}
                className={cn(
                  "flex-1 cursor-pointer transition-all",
                  isActive 
                    ? "border-2 border-primary bg-primary/5" 
                    : "border hover:border-primary/50"
                )}
                onClick={() => setActiveTab(tab.key)}
              >
                <CardContent className="p-3 flex flex-col items-center gap-1">
                  <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-muted-foreground")}>
                    {tab.label}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-4">
            {activeTab === 'horario' && <HorarioContent />}
            {activeTab === 'recursos' && <RecursosContent />}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Desktop: Vertical sidebar tabs
  return (
    <div className="flex gap-6 min-h-[400px]">
      {/* Sidebar Tabs */}
      <div className="w-48 flex-shrink-0 border-r pr-4">
        <nav className="space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                  isActive 
                    ? "bg-primary/10 text-primary border-l-2 border-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {activeTab === 'horario' && <HorarioContent />}
        {activeTab === 'recursos' && <RecursosContent />}
      </div>
    </div>
  );
}
