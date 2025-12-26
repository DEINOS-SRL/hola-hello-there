import { equClient } from './equClient';
import type { Equipo, EquipoFormData, TipoEquipo, Marca, Modelo, TipoEquipoFormData, MarcaFormData, ModeloFormData } from '../types';

// ============= EQUIPOS =============
export const getEquipos = async (): Promise<Equipo[]> => {
  const { data, error } = await equClient
    .from('equipos')
    .select(`
      *,
      tipo_equipo:tipos_equipo(*),
      marca:marcas(*),
      modelo:modelos(*)
    `)
    .eq('activo', true)
    .order('codigo', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getEquipoById = async (id: string): Promise<Equipo | null> => {
  const { data, error } = await equClient
    .from('equipos')
    .select(`
      *,
      tipo_equipo:tipos_equipo(*),
      marca:marcas(*),
      modelo:modelos(*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const createEquipo = async (empresaId: string, formData: EquipoFormData): Promise<Equipo> => {
  const { data, error } = await equClient
    .from('equipos')
    .insert({
      empresa_id: empresaId,
      codigo: formData.codigo,
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      tipo_equipo_id: formData.tipo_equipo_id || null,
      marca_id: formData.marca_id || null,
      modelo_id: formData.modelo_id || null,
      numero_serie: formData.numero_serie || null,
      numero_interno: formData.numero_interno || null,
      anio_fabricacion: formData.anio_fabricacion || null,
      fecha_adquisicion: formData.fecha_adquisicion || null,
      valor_adquisicion: formData.valor_adquisicion || null,
      estado: formData.estado,
      ubicacion: formData.ubicacion || null,
      observaciones: formData.observaciones || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateEquipo = async (id: string, formData: EquipoFormData): Promise<Equipo> => {
  const { data, error } = await equClient
    .from('equipos')
    .update({
      codigo: formData.codigo,
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      tipo_equipo_id: formData.tipo_equipo_id || null,
      marca_id: formData.marca_id || null,
      modelo_id: formData.modelo_id || null,
      numero_serie: formData.numero_serie || null,
      numero_interno: formData.numero_interno || null,
      anio_fabricacion: formData.anio_fabricacion || null,
      fecha_adquisicion: formData.fecha_adquisicion || null,
      valor_adquisicion: formData.valor_adquisicion || null,
      estado: formData.estado,
      ubicacion: formData.ubicacion || null,
      observaciones: formData.observaciones || null,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteEquipo = async (id: string): Promise<void> => {
  const { error } = await equClient
    .from('equipos')
    .update({ activo: false })
    .eq('id', id);

  if (error) throw error;
};

export const getNextCodigoEquipo = async (): Promise<string> => {
  const { data, error } = await equClient
    .from('equipos')
    .select('codigo')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;

  if (!data || data.length === 0) {
    return 'EQ-0001';
  }

  const lastCode = data[0].codigo;
  const match = lastCode.match(/EQ-(\d+)/);
  if (match) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `EQ-${nextNum.toString().padStart(4, '0')}`;
  }

  return 'EQ-0001';
};

// ============= TIPOS DE EQUIPO =============
export const getTiposEquipo = async (): Promise<TipoEquipo[]> => {
  const { data, error } = await equClient
    .from('tipos_equipo')
    .select('*')
    .eq('activo', true)
    .order('nombre');

  if (error) throw error;
  return data || [];
};

export const createTipoEquipo = async (empresaId: string, formData: TipoEquipoFormData): Promise<TipoEquipo> => {
  const { data, error } = await equClient
    .from('tipos_equipo')
    .insert({
      empresa_id: empresaId,
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============= MARCAS =============
export const getMarcas = async (): Promise<Marca[]> => {
  const { data, error } = await equClient
    .from('marcas')
    .select('*')
    .eq('activo', true)
    .order('nombre');

  if (error) throw error;
  return data || [];
};

export const createMarca = async (empresaId: string, formData: MarcaFormData): Promise<Marca> => {
  const { data, error } = await equClient
    .from('marcas')
    .insert({
      empresa_id: empresaId,
      nombre: formData.nombre,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// ============= MODELOS =============
export const getModelos = async (marcaId?: string): Promise<Modelo[]> => {
  let query = equClient
    .from('modelos')
    .select('*, marca:marcas(*)')
    .eq('activo', true);

  if (marcaId) {
    query = query.eq('marca_id', marcaId);
  }

  const { data, error } = await query.order('nombre');

  if (error) throw error;
  return data || [];
};

export const createModelo = async (empresaId: string, formData: ModeloFormData): Promise<Modelo> => {
  const { data, error } = await equClient
    .from('modelos')
    .insert({
      empresa_id: empresaId,
      marca_id: formData.marca_id,
      nombre: formData.nombre,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
