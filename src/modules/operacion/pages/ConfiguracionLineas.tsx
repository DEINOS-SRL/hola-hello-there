import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Loader2, Briefcase, Layers, Tag, Settings2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movimientosService } from '../services/movimientosService';
import type { UnidadNegocio, TipoMovimiento, SubtipoMovimiento, CampoAdicional } from '../types';
import { toast } from 'sonner';
import { movClient } from '../services/movClient';

type ModalType = 'unidad' | 'tipo' | 'subtipo' | null;

export default function ConfiguracionLineas() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('unidades');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: ModalType; id: string } | null>(null);

  // Form states
  const [unidadForm, setUnidadForm] = useState({ nombre: '', descripcion: '' });
  const [tipoForm, setTipoForm] = useState({ nombre: '', descripcion: '', unidad_negocio_id: '' });
  const [subtipoForm, setSubtipoForm] = useState<{ nombre: string; descripcion: string; tipo_movimiento_id: string; campos_adicionales: CampoAdicional[] }>({
    nombre: '', descripcion: '', tipo_movimiento_id: '', campos_adicionales: []
  });
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Queries
  const { data: unidades = [], isLoading: loadingUnidades } = useQuery({
    queryKey: ['unidades_negocio'],
    queryFn: movimientosService.getUnidadesNegocio,
  });

  const { data: tipos = [], isLoading: loadingTipos } = useQuery({
    queryKey: ['tipos_movimiento_all'],
    queryFn: () => movimientosService.getTiposMovimiento(),
  });

  const { data: subtipos = [], isLoading: loadingSubtipos } = useQuery({
    queryKey: ['subtipos_movimiento_all'],
    queryFn: () => movimientosService.getSubtiposMovimiento(),
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async ({ type, data, id }: { type: ModalType; data: any; id?: string }) => {
      let table = '';
      if (type === 'unidad') table = 'unidades_negocio';
      else if (type === 'tipo') table = 'tipos_movimiento';
      else if (type === 'subtipo') table = 'subtipos_movimiento';

      if (id) {
        const { error } = await movClient.from(table).update(data).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await movClient.from(table).insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades_negocio'] });
      queryClient.invalidateQueries({ queryKey: ['tipos_movimiento_all'] });
      queryClient.invalidateQueries({ queryKey: ['subtipos_movimiento_all'] });
      toast.success('Guardado correctamente');
      setModalType(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: ModalType; id: string }) => {
      let table = '';
      if (type === 'unidad') table = 'unidades_negocio';
      else if (type === 'tipo') table = 'tipos_movimiento';
      else if (type === 'subtipo') table = 'subtipos_movimiento';

      const { error } = await movClient.from(table).update({ activo: false }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades_negocio'] });
      queryClient.invalidateQueries({ queryKey: ['tipos_movimiento_all'] });
      queryClient.invalidateQueries({ queryKey: ['subtipos_movimiento_all'] });
      toast.success('Eliminado correctamente');
      setDeleteDialogOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleNewUnidad = () => {
    setSelectedItem(null);
    setUnidadForm({ nombre: '', descripcion: '' });
    setModalType('unidad');
  };

  const handleEditUnidad = (u: UnidadNegocio) => {
    setSelectedItem(u);
    setUnidadForm({ nombre: u.nombre, descripcion: u.descripcion || '' });
    setModalType('unidad');
  };

  const handleNewTipo = () => {
    setSelectedItem(null);
    setTipoForm({ nombre: '', descripcion: '', unidad_negocio_id: '' });
    setModalType('tipo');
  };

  const handleEditTipo = (t: TipoMovimiento) => {
    setSelectedItem(t);
    setTipoForm({ nombre: t.nombre, descripcion: t.descripcion || '', unidad_negocio_id: t.unidad_negocio_id || '' });
    setModalType('tipo');
  };

  const handleNewSubtipo = () => {
    setSelectedItem(null);
    setSubtipoForm({ nombre: '', descripcion: '', tipo_movimiento_id: '', campos_adicionales: [] });
    setModalType('subtipo');
  };

  const handleEditSubtipo = (s: SubtipoMovimiento) => {
    setSelectedItem(s);
    setSubtipoForm({
      nombre: s.nombre,
      descripcion: s.descripcion || '',
      tipo_movimiento_id: s.tipo_movimiento_id || '',
      campos_adicionales: s.campos_adicionales || []
    });
    setModalType('subtipo');
  };

  const handleSave = () => {
    if (modalType === 'unidad') {
      if (!unidadForm.nombre.trim()) { toast.error('Nombre requerido'); return; }
      saveMutation.mutate({ type: 'unidad', data: unidadForm, id: selectedItem?.id });
    } else if (modalType === 'tipo') {
      if (!tipoForm.nombre.trim()) { toast.error('Nombre requerido'); return; }
      saveMutation.mutate({ type: 'tipo', data: tipoForm, id: selectedItem?.id });
    } else if (modalType === 'subtipo') {
      if (!subtipoForm.nombre.trim()) { toast.error('Nombre requerido'); return; }
      saveMutation.mutate({ type: 'subtipo', data: subtipoForm, id: selectedItem?.id });
    }
  };

  const addCampoAdicional = () => {
    setSubtipoForm({
      ...subtipoForm,
      campos_adicionales: [...subtipoForm.campos_adicionales, { key: '', label: '', type: 'text' }]
    });
  };

  const updateCampoAdicional = (index: number, field: keyof CampoAdicional, value: any) => {
    const updated = [...subtipoForm.campos_adicionales];
    updated[index] = { ...updated[index], [field]: value };
    // Auto-generate key from label
    if (field === 'label') {
      updated[index].key = value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    }
    setSubtipoForm({ ...subtipoForm, campos_adicionales: updated });
  };

  const removeCampoAdicional = (index: number) => {
    setSubtipoForm({
      ...subtipoForm,
      campos_adicionales: subtipoForm.campos_adicionales.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Líneas de Servicio</h1>
          <p className="text-muted-foreground">Configura unidades de negocio, tipos y subtipos de movimiento</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="unidades" className="gap-2">
                <Briefcase className="h-4 w-4" />
                Unidades de Negocio
              </TabsTrigger>
              <TabsTrigger value="tipos" className="gap-2">
                <Layers className="h-4 w-4" />
                Tipos
              </TabsTrigger>
              <TabsTrigger value="subtipos" className="gap-2">
                <Tag className="h-4 w-4" />
                Subtipos
              </TabsTrigger>
            </TabsList>

            {/* Unidades de Negocio */}
            <TabsContent value="unidades" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={handleNewUnidad} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Unidad
                </Button>
              </div>
              {loadingUnidades ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unidades.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.nombre}</TableCell>
                        <TableCell className="text-muted-foreground">{u.descripcion || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEditUnidad(u)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { setItemToDelete({ type: 'unidad', id: u.id }); setDeleteDialogOpen(true); }}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Tipos */}
            <TabsContent value="tipos" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={handleNewTipo} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Tipo
                </Button>
              </div>
              {loadingTipos ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Unidad de Negocio</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tipos.map((t) => {
                      const unidad = unidades.find(u => u.id === t.unidad_negocio_id);
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">{t.nombre}</TableCell>
                          <TableCell><Badge variant="outline">{unidad?.nombre || '-'}</Badge></TableCell>
                          <TableCell className="text-muted-foreground">{t.descripcion || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditTipo(t)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => { setItemToDelete({ type: 'tipo', id: t.id }); setDeleteDialogOpen(true); }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Subtipos */}
            <TabsContent value="subtipos" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={handleNewSubtipo} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Subtipo
                </Button>
              </div>
              {loadingSubtipos ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Campos Dinámicos</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subtipos.map((s) => {
                      const tipo = tipos.find(t => t.id === s.tipo_movimiento_id);
                      return (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.nombre}</TableCell>
                          <TableCell><Badge variant="outline">{tipo?.nombre || '-'}</Badge></TableCell>
                          <TableCell>
                            {s.campos_adicionales?.length > 0 ? (
                              <div className="flex gap-1 flex-wrap">
                                {s.campos_adicionales.map((c, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">{c.label}</Badge>
                                ))}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => handleEditSubtipo(s)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" onClick={() => { setItemToDelete({ type: 'subtipo', id: s.id }); setDeleteDialogOpen(true); }}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal Unidad */}
      <Dialog open={modalType === 'unidad'} onOpenChange={() => setModalType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Editar' : 'Nueva'} Unidad de Negocio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input value={unidadForm.nombre} onChange={(e) => setUnidadForm({ ...unidadForm, nombre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={unidadForm.descripcion} onChange={(e) => setUnidadForm({ ...unidadForm, descripcion: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalType(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Tipo */}
      <Dialog open={modalType === 'tipo'} onOpenChange={() => setModalType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Editar' : 'Nuevo'} Tipo de Movimiento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Unidad de Negocio</Label>
              <Select value={tipoForm.unidad_negocio_id} onValueChange={(v) => setTipoForm({ ...tipoForm, unidad_negocio_id: v })}>
                <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                <SelectContent>
                  {unidades.map((u) => <SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input value={tipoForm.nombre} onChange={(e) => setTipoForm({ ...tipoForm, nombre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={tipoForm.descripcion} onChange={(e) => setTipoForm({ ...tipoForm, descripcion: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalType(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Subtipo */}
      <Dialog open={modalType === 'subtipo'} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Editar' : 'Nuevo'} Subtipo de Movimiento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Movimiento</Label>
                <Select value={subtipoForm.tipo_movimiento_id} onValueChange={(v) => setSubtipoForm({ ...subtipoForm, tipo_movimiento_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={subtipoForm.nombre} onChange={(e) => setSubtipoForm({ ...subtipoForm, nombre: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={subtipoForm.descripcion} onChange={(e) => setSubtipoForm({ ...subtipoForm, descripcion: e.target.value })} />
            </div>

            {/* Campos dinámicos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2"><Settings2 className="h-4 w-4" /> Campos Dinámicos</Label>
                <Button variant="outline" size="sm" onClick={addCampoAdicional}><Plus className="h-4 w-4 mr-1" />Agregar Campo</Button>
              </div>
              {subtipoForm.campos_adicionales.map((campo, idx) => (
                <div key={idx} className="flex gap-2 items-start p-3 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input placeholder="Etiqueta" value={campo.label} onChange={(e) => updateCampoAdicional(idx, 'label', e.target.value)} />
                  </div>
                  <div className="w-32">
                    <Select value={campo.type} onValueChange={(v) => updateCampoAdicional(idx, 'type', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="select">Selección</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {campo.type === 'select' && (
                    <div className="flex-1">
                      <Input
                        placeholder="Opciones (separadas por coma)"
                        value={campo.options?.join(', ') || ''}
                        onChange={(e) => updateCampoAdicional(idx, 'options', e.target.value.split(',').map(s => s.trim()))}
                      />
                    </div>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => removeCampoAdicional(idx)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalType(null)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción desactivará el elemento.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete)} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
