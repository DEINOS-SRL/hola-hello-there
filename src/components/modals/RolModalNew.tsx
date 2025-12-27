import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Shield, Building2, Folder, Users } from 'lucide-react';
import { segClient } from '@/modules/security/services/segClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const rolSchema = z.object({
  empresa_id: z.string().uuid('Seleccione una empresa'),
  seccion_id: z.string().uuid('Seleccione una sección'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
});

type RolFormData = z.infer<typeof rolSchema>;

interface RolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol?: any;
  onSuccess: () => void;
}

export function RolModalNew({ open, onOpenChange, rol, onSuccess }: RolModalProps) {
  const { toast } = useToast();
  const isEditing = !!rol;
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [secciones, setSecciones] = useState<any[]>([]);
  const [rolesExistentes, setRolesExistentes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RolFormData>({
    resolver: zodResolver(rolSchema),
    defaultValues: {
      empresa_id: '',
      seccion_id: '',
      nombre: '',
      descripcion: '',
    },
  });

  const watchedValues = watch();
  const selectedEmpresa = watchedValues.empresa_id;
  const selectedSeccion = watchedValues.seccion_id;

  useEffect(() => {
    const loadEmpresasYSecciones = async () => {
      if (!open) return;
      
      try {
        setLoadingData(true);
        
        const [empresasResult, seccionesResult] = await Promise.all([
          segClient.from('empresas').select('id, nombre').order('nombre'),
          segClient.from('secciones').select('id, codigo, nombre').order('orden, nombre')
        ]);

        if (empresasResult.error) throw empresasResult.error;
        if (seccionesResult.error) throw seccionesResult.error;

        setEmpresas(empresasResult.data || []);
        setSecciones(seccionesResult.data || []);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos',
          variant: 'destructive',
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadEmpresasYSecciones();
  }, [open, toast]);

  useEffect(() => {
    if (rol) {
      reset({
        empresa_id: rol.empresa_id,
        seccion_id: rol.seccion_id,
        nombre: rol.nombre,
        descripcion: rol.descripcion || '',
      });
    } else {
      reset({
        empresa_id: '',
        seccion_id: '',
        nombre: '',
        descripcion: '',
      });
    }
  }, [rol, reset]);

  useEffect(() => {
    const loadRolesExistentes = async () => {
      if (!selectedEmpresa || !selectedSeccion) {
        setRolesExistentes([]);
        return;
      }
      
      try {
        setLoadingRoles(true);
        
        const { data, error } = await segClient
          .from('roles')
          .select(`
            id, 
            nombre, 
            descripcion,
            usuario_roles!inner(count)
          `)
          .eq('empresa_id', selectedEmpresa)
          .eq('seccion_id', selectedSeccion)
          .order('nombre');

        if (error) throw error;
        setRolesExistentes(data || []);
      } catch (error: any) {
        console.error('Error loading roles:', error);
        setRolesExistentes([]);
      } finally {
        setLoadingRoles(false);
      }
    };

    loadRolesExistentes();
  }, [selectedEmpresa, selectedSeccion]);

  const onSubmit = async (data: RolFormData) => {
    try {
      if (isEditing) {
        const { error } = await segClient
          .from('roles')
          .update({
            nombre: data.nombre,
            descripcion: data.descripcion,
          })
          .eq('id', rol.id);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Rol actualizado correctamente' });
      } else {
        const { error } = await segClient
          .from('roles')
          .insert([data]);

        if (error) throw error;
        toast({ title: 'Éxito', description: 'Rol creado correctamente' });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el rol',
        variant: 'destructive',
      });
    }
  };

  const getRolesPredefinidos = () => {
    const empresaSeleccionada = empresas.find(e => e.id === selectedEmpresa);
    const seccionSeleccionada = secciones.find(s => s.id === selectedSeccion);
    
    if (!seccionSeleccionada) return [];

    const prefijo = seccionSeleccionada.codigo.toUpperCase();
    return [
      {
        nombre: `Administrador ${seccionSeleccionada.nombre}`,
        descripcion: `Control total sobre el módulo de ${seccionSeleccionada.nombre}. Puede realizar todas las operaciones y gestionar usuarios.`
      },
      {
        nombre: `Supervisor ${seccionSeleccionada.nombre}`,
        descripcion: `Supervisión y aprobación en ${seccionSeleccionada.nombre}. Puede ver, editar y aprobar operaciones.`
      },
      {
        nombre: `Operario ${seccionSeleccionada.nombre}`,
        descripcion: `Operaciones básicas en ${seccionSeleccionada.nombre}. Puede ver y crear registros, pero no aprobar.`
      },
      {
        nombre: `Visor ${seccionSeleccionada.nombre}`,
        descripcion: `Solo lectura en ${seccionSeleccionada.nombre}. Puede ver información pero no modificar.`
      },
    ];
  };

  const aplicarRolPredefinido = (rolPredefinido: any) => {
    setValue('nombre', rolPredefinido.nombre);
    setValue('descripcion', rolPredefinido.descripcion);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            {isEditing ? 'Editar Rol' : 'Nuevo Rol'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Modifica los datos del rol' : 'Completa los datos para crear un nuevo rol por sección'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-y-auto max-h-[65vh]">
          <div className="space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="empresa_id">Empresa *</Label>
                <Select
                  value={watchedValues.empresa_id}
                  onValueChange={(value) => setValue('empresa_id', value)}
                  disabled={isEditing || loadingData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {empresa.nombre}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.empresa_id && <p className="text-xs text-destructive">{errors.empresa_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="seccion_id">Sección *</Label>
                <Select
                  value={watchedValues.seccion_id}
                  onValueChange={(value) => setValue('seccion_id', value)}
                  disabled={isEditing || loadingData}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {secciones.map((seccion) => (
                      <SelectItem key={seccion.id} value={seccion.id}>
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-blue-500" />
                          <div className="flex flex-col">
                            <span>{seccion.nombre}</span>
                            <span className="text-xs text-muted-foreground font-mono">
                              {seccion.codigo}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.seccion_id && <p className="text-xs text-destructive">{errors.seccion_id.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Rol *</Label>
                <Input id="nombre" {...register('nombre')} placeholder="ej: Administrador RRHH" />
                {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea 
                  id="descripcion" 
                  {...register('descripcion')} 
                  placeholder="Descripción del rol y sus responsabilidades"
                  rows={3}
                />
              </div>

              {selectedEmpresa && selectedSeccion && !isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Roles Predefinidos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {getRolesPredefinidos().map((rolPredefinido, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        className="w-full justify-start h-auto p-3"
                        onClick={() => aplicarRolPredefinido(rolPredefinido)}
                      >
                        <div className="text-left">
                          <div className="font-medium">{rolPredefinido.nombre}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {rolPredefinido.descripcion}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Guardar cambios' : 'Crear rol'}
                </Button>
              </DialogFooter>
            </form>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Roles Existentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!selectedEmpresa || !selectedSeccion ? (
                  <p className="text-sm text-muted-foreground">
                    Selecciona una empresa y sección para ver los roles existentes
                  </p>
                ) : loadingRoles ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : rolesExistentes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No hay roles creados para esta empresa y sección
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {rolesExistentes.map((rolExistente) => (
                      <div 
                        key={rolExistente.id} 
                        className={`border rounded p-3 ${
                          rolExistente.id === rol?.id ? 'border-primary bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{rolExistente.nombre}</h4>
                            {rolExistente.descripcion && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {rolExistente.descripcion}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {rolExistente.usuario_roles?.[0]?.count || 0} usuarios
                          </Badge>
                        </div>
                        {rolExistente.id === rol?.id && (
                          <Badge variant="default" className="text-xs mt-2">
                            Editando
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}