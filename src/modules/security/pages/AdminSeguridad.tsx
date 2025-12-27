import { useState } from 'react';
import { 
  Shield, 
  Building2, 
  Users, 
  FolderTree, 
  Package, 
  Zap, 
  UserCheck, 
  ShieldCheck, 
  ToggleLeft,
  Plus,
  Settings,
  Search,
  Filter
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Import all the modals
import { EmpresaModal } from '@/components/modals/EmpresaModal';
import { PerfilUsuarioModal } from '@/components/modals/PerfilUsuarioModal';
import { EmpresaUsuarioModal } from '@/components/modals/EmpresaUsuarioModal';
import { SeccionModal } from '@/components/modals/SeccionModal';
import { ModuloModalNew } from '@/components/modals/ModuloModalNew';
import { FuncionalidadModal } from '@/components/modals/FuncionalidadModal';
import { RolModalNew } from '@/components/modals/RolModalNew';
import { UsuarioRolesModal } from '@/components/modals/UsuarioRolesModal';
import { RolPermisosModal } from '@/components/modals/RolPermisosModal';
import { EmpresaFuncionalidadesModal } from '@/components/modals/EmpresaFuncionalidadesModal';

export function AdminSeguridad() {
  const [activeTab, setActiveTab] = useState('empresas');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [empresaModalOpen, setEmpresaModalOpen] = useState(false);
  const [perfilUsuarioModalOpen, setPerfilUsuarioModalOpen] = useState(false);
  const [empresaUsuarioModalOpen, setEmpresaUsuarioModalOpen] = useState(false);
  const [seccionModalOpen, setSeccionModalOpen] = useState(false);
  const [moduloModalOpen, setModuloModalOpen] = useState(false);
  const [funcionalidadModalOpen, setFuncionalidadModalOpen] = useState(false);
  const [rolModalOpen, setRolModalOpen] = useState(false);
  const [usuarioRolesModalOpen, setUsuarioRolesModalOpen] = useState(false);
  const [rolPermisosModalOpen, setRolPermisosModalOpen] = useState(false);
  const [empresaFuncionalidadesModalOpen, setEmpresaFuncionalidadesModalOpen] = useState(false);

  const refreshData = () => {
    // This would trigger a refresh of the data in the parent component
    console.log('Refreshing data...');
  };

  const securitySections = [
    {
      id: 'empresas',
      title: 'Gestión de Empresas',
      description: 'Administra las empresas del sistema multi-tenant',
      icon: Building2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      actions: [
        {
          label: 'Nueva Empresa',
          action: () => setEmpresaModalOpen(true),
          icon: Plus
        }
      ],
      stats: '12 empresas activas'
    },
    {
      id: 'usuarios',
      title: 'Gestión de Usuarios',
      description: 'Administra perfiles de usuarios y asignaciones',
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      actions: [
        {
          label: 'Nuevo Perfil',
          action: () => setPerfilUsuarioModalOpen(true),
          icon: Plus
        },
        {
          label: 'Asignar Usuario',
          action: () => setEmpresaUsuarioModalOpen(true),
          icon: UserCheck
        }
      ],
      stats: '156 usuarios registrados'
    },
    {
      id: 'catalogo',
      title: 'Catálogo Global',
      description: 'Estructura jerárquica del sistema (Secciones → Módulos → Funcionalidades)',
      icon: FolderTree,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      actions: [
        {
          label: 'Nueva Sección',
          action: () => setSeccionModalOpen(true),
          icon: FolderTree
        },
        {
          label: 'Nuevo Módulo',
          action: () => setModuloModalOpen(true),
          icon: Package
        },
        {
          label: 'Nueva Funcionalidad',
          action: () => setFuncionalidadModalOpen(true),
          icon: Zap
        }
      ],
      stats: '8 secciones, 32 módulos, 128 funcionalidades'
    },
    {
      id: 'roles',
      title: 'Gestión de Roles',
      description: 'Roles por empresa y sección con asignación a usuarios',
      icon: Shield,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      actions: [
        {
          label: 'Nuevo Rol',
          action: () => setRolModalOpen(true),
          icon: Shield
        },
        {
          label: 'Asignar Roles',
          action: () => setUsuarioRolesModalOpen(true),
          icon: UserCheck
        }
      ],
      stats: '45 roles configurados'
    },
    {
      id: 'permisos',
      title: 'Matriz de Permisos',
      description: 'Control granular de permisos por rol y funcionalidad',
      icon: ShieldCheck,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      actions: [
        {
          label: 'Configurar Permisos',
          action: () => setRolPermisosModalOpen(true),
          icon: ShieldCheck
        }
      ],
      stats: '1,250 permisos configurados'
    },
    {
      id: 'features',
      title: 'Feature Flags',
      description: 'Habilita/deshabilita funcionalidades por empresa',
      icon: ToggleLeft,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      actions: [
        {
          label: 'Configurar Features',
          action: () => setEmpresaFuncionalidadesModalOpen(true),
          icon: ToggleLeft
        }
      ],
      stats: '85% funcionalidades habilitadas promedio'
    }
  ];

  const filteredSections = securitySections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Administración de Seguridad
          </h1>
          <p className="text-muted-foreground">
            Sistema RBAC multi-tenant con control granular por sección
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar sección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configuración
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card key={section.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${section.bgColor}`}>
                    <IconComponent className={`h-5 w-5 ${section.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {section.stats}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription className="text-sm">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {section.actions.map((action, index) => {
                  const ActionIcon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={action.action}
                      className="w-full justify-start"
                    >
                      <ActionIcon className="h-4 w-4 mr-2" />
                      {action.label}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Arquitectura del Sistema de Seguridad
          </CardTitle>
          <CardDescription>
            Entendimiento del modelo RBAC por sección implementado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Estructura Jerárquica</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="font-medium">Empresa (Tenant)</div>
                    <div className="text-muted-foreground text-xs">Nivel superior de aislamiento</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg ml-4">
                  <FolderTree className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="font-medium">Sección</div>
                    <div className="text-muted-foreground text-xs">Ámbito principal para roles (ej: RRHH, Operación)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg ml-8">
                  <Package className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium">Módulo</div>
                    <div className="text-muted-foreground text-xs">Agrupación funcional (ej: Empleados, Asistencia)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg ml-12">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="font-medium">Funcionalidad</div>
                    <div className="text-muted-foreground text-xs">Acción específica con permisos granulares</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Flujo de Permisos</h4>
              <div className="space-y-3 text-sm">
                <div className="p-3 border rounded-lg bg-muted/20">
                  <div className="font-medium mb-2">Para ejecutar una funcionalidad:</div>
                  <ol className="space-y-1 text-xs text-muted-foreground">
                    <li>1. Usuario debe ser miembro de la empresa</li>
                    <li>2. Funcionalidad debe estar habilitada para la empresa</li>
                    <li>3. Usuario debe tener un rol en la sección correspondiente</li>
                    <li>4. Ese rol debe tener permiso para la funcionalidad</li>
                  </ol>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 border rounded text-center">
                    <Shield className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                    <div className="font-medium text-xs">Roles por Sección</div>
                  </div>
                  <div className="p-2 border rounded text-center">
                    <ToggleLeft className="h-4 w-4 mx-auto mb-1 text-indigo-500" />
                    <div className="font-medium text-xs">Feature Flags</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Modals */}
      <EmpresaModal
        open={empresaModalOpen}
        onOpenChange={setEmpresaModalOpen}
        onSuccess={refreshData}
      />
      
      <PerfilUsuarioModal
        open={perfilUsuarioModalOpen}
        onOpenChange={setPerfilUsuarioModalOpen}
        onSuccess={refreshData}
      />
      
      <EmpresaUsuarioModal
        open={empresaUsuarioModalOpen}
        onOpenChange={setEmpresaUsuarioModalOpen}
        onSuccess={refreshData}
      />
      
      <SeccionModal
        open={seccionModalOpen}
        onOpenChange={setSeccionModalOpen}
        onSuccess={refreshData}
      />
      
      <ModuloModalNew
        open={moduloModalOpen}
        onOpenChange={setModuloModalOpen}
        onSuccess={refreshData}
      />
      
      <FuncionalidadModal
        open={funcionalidadModalOpen}
        onOpenChange={setFuncionalidadModalOpen}
        onSuccess={refreshData}
      />
      
      <RolModalNew
        open={rolModalOpen}
        onOpenChange={setRolModalOpen}
        onSuccess={refreshData}
      />
      
      <UsuarioRolesModal
        open={usuarioRolesModalOpen}
        onOpenChange={setUsuarioRolesModalOpen}
        onSuccess={refreshData}
      />
      
      <RolPermisosModal
        open={rolPermisosModalOpen}
        onOpenChange={setRolPermisosModalOpen}
        onSuccess={refreshData}
      />
      
      <EmpresaFuncionalidadesModal
        open={empresaFuncionalidadesModalOpen}
        onOpenChange={setEmpresaFuncionalidadesModalOpen}
        onSuccess={refreshData}
      />
    </div>
  );
}