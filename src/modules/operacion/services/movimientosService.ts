import { movClient } from './movClient';
import type { 
  Movimiento, 
  MovimientoInsert, 
  MovimientoUpdate, 
  Cliente,
  UnidadNegocio,
  TipoMovimiento,
  SubtipoMovimiento,
  RecursoEquipo,
  RecursoOperario,
  MovimientoEquipo,
  MovimientoOperario,
  MovimientoTarea,
  CalificacionOperario,
  EstadoMovimiento
} from '../types';

export const movimientosService = {
  // ============ MOVIMIENTOS ============
  async getAll(): Promise<Movimiento[]> {
    const { data, error } = await movClient
      .from('movimientos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Movimiento | null> {
    const { data, error } = await movClient
      .from('movimientos')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(movimiento: MovimientoInsert): Promise<Movimiento> {
    const { data, error } = await movClient
      .from('movimientos')
      .insert(movimiento)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, movimiento: MovimientoUpdate): Promise<Movimiento> {
    const { data, error } = await movClient
      .from('movimientos')
      .update(movimiento)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await movClient
      .from('movimientos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateEstado(id: string, estado: EstadoMovimiento): Promise<Movimiento> {
    return this.update(id, { estado });
  },

  // ============ CLIENTES ============
  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await movClient
      .from('clientes')
      .select('*')
      .eq('activo', true)
      .order('nombre');
    
    if (error) throw error;
    return data || [];
  },

  async createCliente(cliente: Partial<Cliente>): Promise<Cliente> {
    const { data, error } = await movClient
      .from('clientes')
      .insert(cliente)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============ UNIDADES DE NEGOCIO ============
  async getUnidadesNegocio(): Promise<UnidadNegocio[]> {
    const { data, error } = await movClient
      .from('unidades_negocio')
      .select('*')
      .eq('activo', true)
      .order('orden');
    
    if (error) throw error;
    return data || [];
  },

  async createUnidadNegocio(unidad: Partial<UnidadNegocio>): Promise<UnidadNegocio> {
    const { data, error } = await movClient
      .from('unidades_negocio')
      .insert(unidad)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============ TIPOS DE MOVIMIENTO ============
  async getTiposMovimiento(unidadNegocioId?: string): Promise<TipoMovimiento[]> {
    let query = movClient
      .from('tipos_movimiento')
      .select('*')
      .eq('activo', true)
      .order('orden');
    
    if (unidadNegocioId) {
      query = query.eq('unidad_negocio_id', unidadNegocioId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async createTipoMovimiento(tipo: Partial<TipoMovimiento>): Promise<TipoMovimiento> {
    const { data, error } = await movClient
      .from('tipos_movimiento')
      .insert(tipo)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============ SUBTIPOS DE MOVIMIENTO ============
  async getSubtiposMovimiento(tipoMovimientoId?: string): Promise<SubtipoMovimiento[]> {
    let query = movClient
      .from('subtipos_movimiento')
      .select('*')
      .eq('activo', true)
      .order('orden');
    
    if (tipoMovimientoId) {
      query = query.eq('tipo_movimiento_id', tipoMovimientoId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      campos_adicionales: item.campos_adicionales || []
    }));
  },

  async createSubtipoMovimiento(subtipo: Partial<SubtipoMovimiento>): Promise<SubtipoMovimiento> {
    const { data, error } = await movClient
      .from('subtipos_movimiento')
      .insert(subtipo)
      .select()
      .single();
    
    if (error) throw error;
    return { ...data, campos_adicionales: data.campos_adicionales || [] };
  },

  // ============ RECURSOS EQUIPOS ============
  async getRecursosEquipos(): Promise<RecursoEquipo[]> {
    const { data, error } = await movClient
      .from('recursos_equipos')
      .select('*')
      .eq('activo', true)
      .order('codigo');
    
    if (error) throw error;
    return data || [];
  },

  async createRecursoEquipo(equipo: Partial<RecursoEquipo>): Promise<RecursoEquipo> {
    const { data, error } = await movClient
      .from('recursos_equipos')
      .insert(equipo)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============ RECURSOS OPERARIOS ============
  async getRecursosOperarios(): Promise<RecursoOperario[]> {
    const { data, error } = await movClient
      .from('recursos_operarios')
      .select('*')
      .eq('activo', true)
      .order('apellido');
    
    if (error) throw error;
    return data || [];
  },

  async getSupervisores(): Promise<RecursoOperario[]> {
    const { data, error } = await movClient
      .from('recursos_operarios')
      .select('*')
      .eq('activo', true)
      .eq('rol', 'supervisor')
      .order('apellido');
    
    if (error) throw error;
    return data || [];
  },

  async createRecursoOperario(operario: Partial<RecursoOperario>): Promise<RecursoOperario> {
    const { data, error } = await movClient
      .from('recursos_operarios')
      .insert(operario)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============ MOVIMIENTO EQUIPOS ============
  async getMovimientoEquipos(movimientoId: string): Promise<MovimientoEquipo[]> {
    const { data, error } = await movClient
      .from('movimientos_equipos')
      .select('*, equipo:recursos_equipos(*)')
      .eq('movimiento_id', movimientoId);
    
    if (error) throw error;
    return data || [];
  },

  async assignEquipos(movimientoId: string, equipoIds: string[]): Promise<void> {
    // Primero eliminar asignaciones existentes
    await movClient
      .from('movimientos_equipos')
      .delete()
      .eq('movimiento_id', movimientoId);
    
    // Insertar nuevas asignaciones
    if (equipoIds.length > 0) {
      const { error } = await movClient
        .from('movimientos_equipos')
        .insert(equipoIds.map(equipo_id => ({ movimiento_id: movimientoId, equipo_id })));
      
      if (error) throw error;
    }
  },

  async updateMovimientoEquipo(id: string, data: Partial<MovimientoEquipo>): Promise<void> {
    const { error } = await movClient
      .from('movimientos_equipos')
      .update(data)
      .eq('id', id);
    
    if (error) throw error;
  },

  // ============ MOVIMIENTO OPERARIOS ============
  async getMovimientoOperarios(movimientoId: string): Promise<MovimientoOperario[]> {
    const { data, error } = await movClient
      .from('movimientos_operarios')
      .select('*, operario:recursos_operarios(*)')
      .eq('movimiento_id', movimientoId);
    
    if (error) throw error;
    return data || [];
  },

  async assignOperarios(movimientoId: string, operarios: { operario_id: string; rol_asignado: string }[]): Promise<void> {
    // Primero eliminar asignaciones existentes
    await movClient
      .from('movimientos_operarios')
      .delete()
      .eq('movimiento_id', movimientoId);
    
    // Insertar nuevas asignaciones
    if (operarios.length > 0) {
      const { error } = await movClient
        .from('movimientos_operarios')
        .insert(operarios.map(op => ({ movimiento_id: movimientoId, ...op })));
      
      if (error) throw error;
    }
  },

  // ============ TAREAS ============
  async getMovimientoTareas(movimientoId: string): Promise<MovimientoTarea[]> {
    const { data, error } = await movClient
      .from('movimientos_tareas')
      .select('*')
      .eq('movimiento_id', movimientoId)
      .order('orden');
    
    if (error) throw error;
    return data || [];
  },

  async saveTareas(movimientoId: string, tareas: Partial<MovimientoTarea>[]): Promise<void> {
    // Eliminar tareas existentes
    await movClient
      .from('movimientos_tareas')
      .delete()
      .eq('movimiento_id', movimientoId);
    
    // Insertar nuevas tareas
    if (tareas.length > 0) {
      const { error } = await movClient
        .from('movimientos_tareas')
        .insert(tareas.map((t, idx) => ({ 
          movimiento_id: movimientoId, 
          descripcion: t.descripcion || '',
          hora_inicio: t.hora_inicio,
          hora_fin: t.hora_fin,
          orden: idx,
          completada: t.completada || false,
          observaciones: t.observaciones
        })));
      
      if (error) throw error;
    }
  },

  // ============ CALIFICACIONES ============
  async getCalificaciones(movimientoId: string): Promise<CalificacionOperario[]> {
    const { data, error } = await movClient
      .from('calificaciones_operarios')
      .select('*, operario:recursos_operarios(*)')
      .eq('movimiento_id', movimientoId);
    
    if (error) throw error;
    return data || [];
  },

  async saveCalificaciones(
    movimientoId: string, 
    calificaciones: { operario_id: string; calificacion: number; comentario?: string }[],
    calificadoPor?: string
  ): Promise<void> {
    // Eliminar calificaciones existentes
    await movClient
      .from('calificaciones_operarios')
      .delete()
      .eq('movimiento_id', movimientoId);
    
    // Insertar nuevas calificaciones
    if (calificaciones.length > 0) {
      const { error } = await movClient
        .from('calificaciones_operarios')
        .insert(calificaciones.map(c => ({ 
          movimiento_id: movimientoId,
          operario_id: c.operario_id,
          calificacion: c.calificacion,
          comentario: c.comentario || null,
          calificado_por: calificadoPor
        })));
      
      if (error) throw error;
    }
  }
};
