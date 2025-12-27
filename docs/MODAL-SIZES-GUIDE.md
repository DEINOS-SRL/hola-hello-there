# Guía de Tamaños de Modales - DNSCloud

Este documento define los tamaños estandarizados para modales en la plataforma DNSCloud.

## Variantes de Tamaño Disponibles

El componente `DialogContent` acepta una prop `size` con las siguientes opciones:

| Tamaño    | Ancho Máximo | Uso Recomendado                                      |
|-----------|--------------|------------------------------------------------------|
| `sm`      | 384px        | Confirmaciones simples, alertas                      |
| `md`      | 448px        | Formularios cortos (1-3 campos)                      |
| `default` | 512px        | Formularios medianos (3-5 campos)                    |
| `lg`      | 720px        | Formularios extensos, listados con selección         |
| `xl`      | 900px        | Formularios complejos, layouts de 2 columnas         |
| `2xl`     | 1100px       | Interfaces con árbol/tree, permisos, configuraciones |
| `full`    | 95vw         | Casos excepcionales (evitar uso frecuente)           |

## Uso

```tsx
import { Dialog, DialogContent } from '@/components/ui/dialog';

// Tamaño por defecto (512px)
<DialogContent>...</DialogContent>

// Tamaño específico
<DialogContent size="lg">...</DialogContent>

// Con clases adicionales
<DialogContent size="xl" className="max-h-[90vh] overflow-hidden">
  ...
</DialogContent>
```

## Asignación por Módulo de Seguridad

### Modales de Seguridad

| Modal                     | Tamaño | Justificación                                |
|---------------------------|--------|----------------------------------------------|
| `UsuarioModal`            | `xl`   | Múltiples campos en 2 columnas               |
| `RolModal`                | `lg`   | Formulario con 3 campos + selector           |
| `EmpresaModal`            | `lg`   | Formulario con 4-5 campos                    |
| `EmpresaModalPro`         | `lg`   | Wizard de 2 pasos                            |
| `AsignarRolesModal`       | `lg`   | Selector de módulo + lista de roles          |
| `UsuarioRolesModal`       | `xl`   | Layout con árbol de secciones                |
| `RolPermisosModal`        | `2xl`  | Árbol de permisos completo                   |
| `VerPermisosModal`        | `lg`   | Listado de permisos (solo lectura)           |
| `EmpresaFuncionalidadesModal` | `2xl` | Árbol de funcionalidades                   |
| `FuncionalidadModal`      | `xl`   | Formulario + árbol de contexto               |
| `ModuloModal`             | `lg`   | Formulario extenso                           |
| `ModuloModalNew`          | `xl`   | Layout de 2 columnas                         |
| `SeccionModal`            | `lg`   | Formulario + árbol de navegación             |
| `RolModalNew`             | `lg`   | Layout de 2 columnas                         |

## Reglas de Diseño

### 1. Inputs con Iconos
Todos los inputs con iconos deben usar:
- Icono: `absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none`
- Input: `className="pl-11"` (padding-left de 44px)

```tsx
<div className="relative">
  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
  <Input placeholder="Nombre" className="pl-11" {...field} />
</div>
```

### 2. Altura Máxima
Para modales con contenido largo, agregar:
```tsx
<DialogContent size="xl" className="max-h-[90vh] overflow-hidden">
```

### 3. Scroll Interno
Si el contenido requiere scroll:
```tsx
<DialogContent size="xl" className="max-h-[90vh] overflow-hidden">
  <DialogHeader>...</DialogHeader>
  <div className="flex-1 overflow-y-auto">
    {/* Contenido scrolleable */}
  </div>
  <DialogFooter>...</DialogFooter>
</DialogContent>
```

## Animaciones

Los modales incluyen animaciones suaves predefinidas:
- **Desktop**: Scale + fade con curva `cubic-bezier(0.16, 1, 0.3, 1)`
- **Mobile**: Slide desde abajo (bottom sheet)

## Consistencia Visual

- Todos los modales usan `DialogHeader` con separador inferior
- Todos los modales usan `DialogFooter` con separador superior
- Botones de acción siempre a la derecha en el footer
- Botón de cancelar siempre con `variant="outline"`
- Botón de confirmar siempre con `variant="default"` (color primario)

---

*Última actualización: Diciembre 2024*
