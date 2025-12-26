import { useState } from 'react';
import { BookOpen, Search, ChevronRight, FileText, Video, Book, HelpCircle, Code, Users, Settings, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

// Contenido de documentación en Markdown
const documentationContent = {
  'inicio': `# Bienvenido a DNSCloud

DNSCloud es una plataforma corporativa modular diseñada para gestionar todos los aspectos de tu empresa desde un solo lugar.

## Características principales

- **Arquitectura Modular**: Cada módulo es independiente y puede activarse según las necesidades de tu empresa
- **Control de Acceso Basado en Roles (RBAC)**: Sistema de permisos granular para máxima seguridad
- **Multi-empresa**: Soporte para múltiples empresas en una sola instancia
- **Interfaz Moderna**: Diseño responsive y accesible
- **Tiempo Real**: Actualizaciones en tiempo real para una experiencia fluida

## Módulos disponibles

### Seguridad
Gestión de usuarios, roles, permisos y empresas. Base del sistema de seguridad.

### Recursos Humanos
Gestión de empleados, asistencias, permisos y licencias.

### Equipos
Inventario y gestión de equipos y recursos.

### Operación
Gestión de movimientos, servicios y operaciones.

### Habilitaciones
Control de habilitaciones y certificaciones.

### Conocimiento
Base de conocimiento y documentación corporativa.

### Comercial
Gestión comercial y ventas.
`,
  'guia-inicio': `# Guía de Inicio Rápido

## Primeros pasos

### 1. Acceder al Dashboard

Una vez que inicies sesión, serás redirigido al Dashboard principal donde podrás ver:

- Estadísticas generales de la plataforma
- Actividad reciente
- Accesos rápidos a funciones comunes

### 2. Navegación

- **Sidebar izquierdo**: Menú principal con todos los módulos disponibles
- **Header superior**: Búsqueda global, notificaciones y perfil de usuario
- **Breadcrumbs**: Navegación contextual en la parte superior del contenido

### 3. Favoritos

Puedes marcar módulos o secciones como favoritos para acceso rápido:

1. Haz clic en el icono de estrella junto a cualquier módulo
2. Los favoritos aparecerán en la sección "Favoritos" del sidebar
3. Puedes reordenarlos arrastrando y soltando

### 4. Búsqueda

Usa la barra de búsqueda en el header para buscar rápidamente:

- Módulos
- Funciones
- Configuraciones

Atajo de teclado: \`Ctrl+K\` (o \`Cmd+K\` en Mac)
`,
  'usuarios': `# Gestión de Usuarios

## Crear un nuevo usuario

1. Navega a **Configuración > Administración > Usuarios**
2. Haz clic en el botón **"Nuevo Usuario"**
3. Completa el formulario:
   - Nombre y apellido
   - Email (será el usuario de login)
   - DNI (opcional)
   - Teléfono y dirección (opcionales)
   - Empresa a la que pertenece
   - Estado (activo/inactivo)
4. Haz clic en **"Guardar"**

## Asignar roles

1. Selecciona un usuario de la lista
2. Haz clic en **"Asignar Roles"**
3. Selecciona los roles que deseas asignar
4. Los permisos se aplicarán automáticamente según los roles seleccionados

## Editar usuario

1. Haz clic en el usuario que deseas editar
2. Modifica los campos necesarios
3. Guarda los cambios

## Desactivar usuario

1. Abre el usuario que deseas desactivar
2. Cambia el estado a **"Inactivo"**
3. El usuario no podrá iniciar sesión pero sus datos se mantendrán
`,
  'roles-permisos': `# Roles y Permisos

## Sistema de permisos

DNSCloud utiliza un sistema de permisos granular basado en la estructura:

\`<módulo>.<recurso>.<acción>\`

### Ejemplos:
- \`seguridad.usuarios.crear\`
- \`rrhh.empleados.editar\`
- \`operacion.movimientos.ver\`

## Crear un rol

1. Ve a **Configuración > Administración > Roles**
2. Haz clic en **"Nuevo Rol"**
3. Completa:
   - Nombre del rol
   - Descripción
   - Empresa (opcional, para roles específicos de empresa)
4. Asigna permisos seleccionando de la lista disponible
5. Guarda el rol

## Asignar permisos

Los permisos se organizan por módulo. Puedes:

- Seleccionar permisos individuales
- Usar permisos comodín (ej: \`seguridad.*.*\` para todos los permisos de seguridad)

## Roles predefinidos

- **Administrador**: Acceso completo a todos los módulos
- **Usuario**: Acceso básico según permisos asignados
`,
  'movimientos': `# Gestión de Movimientos

## Crear un movimiento

1. Navega a **Operación > Movimientos**
2. Haz clic en **"Nuevo Movimiento"**
3. Completa el wizard de 5 pasos:

### Paso 1: Datos Generales y Cliente
- Selecciona la unidad de negocio
- Elige el tipo de movimiento
- Selecciona el subtipo
- Busca o crea un cliente

### Paso 2: Recursos y Equipos
- Selecciona los equipos necesarios
- Asigna recursos a la operación

### Paso 3: Fechas y Horarios
- Define fecha de inicio
- Establece fecha de fin
- Configura horarios si es necesario

### Paso 4: Detalles Adicionales
- Agrega observaciones
- Adjunta documentos si es necesario

### Paso 5: Revisión
- Revisa toda la información
- Confirma y guarda el movimiento

## Filtrar movimientos

Usa los filtros en la parte superior para buscar por:
- Estado
- Tipo
- Cliente
- Fecha
- Unidad de negocio

## Editar movimiento

1. Haz clic en el movimiento que deseas editar
2. Se abrirá el mismo wizard con los datos precargados
3. Modifica los campos necesarios
4. Guarda los cambios
`,
  'configuracion': `# Configuración de la Plataforma

## Preferencias de Usuario

Accede a **Configuración > Preferencias** para personalizar:

- **Notificaciones**: Email, push, desktop
- **Idioma**: Español (por defecto)
- **Zona horaria**: America/Buenos_Aires
- **Formato de fecha**: dd/MM/yyyy
- **Densidad de UI**: Comfortable, compact, spacious
- **Tema**: Claro, oscuro o sistema

## Configuración de Empresa

En **Configuración > Empresa actual** puedes:

- Ver y editar datos de la empresa
- Configurar horarios de atención
- Gestionar servicios ofrecidos
- Configurar webhooks (si aplica)

## Administración

Solo disponible para administradores:

- **Usuarios**: Gestión completa de usuarios
- **Roles**: Crear y gestionar roles
- **Permisos**: Ver todos los permisos disponibles
- **Empresas**: Gestionar empresas del sistema
- **Feedbacks**: Revisar y gestionar feedbacks de usuarios
`,
  'troubleshooting': `# Solución de Problemas

## No puedo iniciar sesión

1. Verifica que tu email y contraseña sean correctos
2. Asegúrate de que tu cuenta esté activa
3. Contacta al administrador si el problema persiste

## No veo un módulo

1. Verifica que tengas permisos para acceder al módulo
2. Confirma que el módulo esté activo en tu empresa
3. Contacta al administrador para solicitar acceso

## Error al guardar datos

1. Verifica que todos los campos requeridos estén completos
2. Revisa que tengas permisos de escritura
3. Intenta recargar la página
4. Si el problema persiste, contacta al soporte

## La página no carga

1. Verifica tu conexión a internet
2. Intenta recargar la página (Ctrl+R o Cmd+R)
3. Limpia la caché del navegador
4. Intenta en modo incógnito

## Preguntas frecuentes

### ¿Cómo cambio mi contraseña?
Ve a **Perfil > Seguridad** y actualiza tu contraseña.

### ¿Cómo agrego un favorito?
Haz clic en el icono de estrella junto al módulo o sección.

### ¿Cómo busco algo rápidamente?
Usa la barra de búsqueda en el header o presiona \`Ctrl+K\` (o \`Cmd+K\` en Mac).
`
};

const docSections = [
  { id: 'inicio', title: 'Inicio', icon: BookOpen, category: 'general' },
  { id: 'guia-inicio', title: 'Guía de Inicio', icon: FileText, category: 'guia' },
  { id: 'usuarios', title: 'Usuarios', icon: Users, category: 'administracion' },
  { id: 'roles-permisos', title: 'Roles y Permisos', icon: Shield, category: 'administracion' },
  { id: 'movimientos', title: 'Movimientos', icon: Settings, category: 'operacion' },
  { id: 'configuracion', title: 'Configuración', icon: Settings, category: 'configuracion' },
  { id: 'troubleshooting', title: 'Solución de Problemas', icon: HelpCircle, category: 'soporte' },
];

const categories = [
  { id: 'general', name: 'General' },
  { id: 'guia', name: 'Guías' },
  { id: 'administracion', name: 'Administración' },
  { id: 'operacion', name: 'Operación' },
  { id: 'configuracion', name: 'Configuración' },
  { id: 'soporte', name: 'Soporte' },
];

export default function Documentacion() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string>('inicio');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredDocs = docSections.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      documentationContent[doc.id as keyof typeof documentationContent]?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentContent = documentationContent[selectedDoc as keyof typeof documentationContent] || '';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          Documentación
        </h1>
        <p className="text-muted-foreground mt-2">
          Guías, tutoriales y manuales de uso de la plataforma DNSCloud
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar de navegación */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="p-4 space-y-2">
                  {/* Filtro por categoría */}
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      <TabsTrigger value="guia">Guías</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Lista de documentos */}
                  {categories.map(category => {
                    const categoryDocs = filteredDocs.filter(doc => doc.category === category.id);
                    if (categoryDocs.length === 0 && selectedCategory !== 'all') return null;
                    
                    return (
                      <div key={category.id} className="space-y-1">
                        {selectedCategory === 'all' && (
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                            {category.name}
                          </h3>
                        )}
                        {categoryDocs.map(doc => {
                          const Icon = doc.icon;
                          return (
                            <button
                              key={doc.id}
                              onClick={() => setSelectedDoc(doc.id)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left",
                                selectedDoc === doc.id
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
                              )}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{doc.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const selectedSection = docSections.find(d => d.id === selectedDoc);
                  if (selectedSection) {
                    const Icon = selectedSection.icon;
                    return (
                      <>
                        <Icon className="h-5 w-5 text-primary" />
                        {selectedSection.title}
                      </>
                    );
                  }
                  return 'Documentación';
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-300px)] pr-4">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-3">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2">{children}</h3>,
                      p: ({ children }) => <p className="mb-4 text-foreground/80">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="ml-4">{children}</li>,
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                        ) : (
                          <code className={className}>{children}</code>
                        );
                      },
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {currentContent}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

