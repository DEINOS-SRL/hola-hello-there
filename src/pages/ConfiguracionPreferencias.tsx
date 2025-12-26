import { Sliders, Palette, Globe, Clock, Languages, Loader2, Sun, Moon, Monitor, MousePointer2, Sparkles, Trash2, Volume2, ClipboardList, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { usePreferencias } from '@/hooks/usePreferencias';
import { useConfigParteDiario, useUpsertConfigParteDiario } from '@/modules/rrhh/hooks/useConfigPartes';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ConfiguracionPreferencias() {
  const { preferencias, isLoading, updatePreferencias, isSaving } = usePreferencias();
  const { data: configPartes, isLoading: isLoadingConfig } = useConfigParteDiario();
  const upsertConfigMutation = useUpsertConfigParteDiario();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    updatePreferencias({ tema: newTheme });
  };

  const handleConfigPartesChange = (field: 'recordatorio_activo' | 'hora_recordatorio', value: boolean | string) => {
    upsertConfigMutation.mutate({
      recordatorio_activo: field === 'recordatorio_activo' ? value as boolean : (configPartes?.recordatorio_activo ?? true),
      hora_recordatorio: field === 'hora_recordatorio' ? `${value}:00` : (configPartes?.hora_recordatorio ?? '18:00:00'),
    });
  };

  if (isLoading || isLoadingConfig) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Sliders className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Preferencias</h1>
          <p className="text-muted-foreground">
            Personaliza tu experiencia en la plataforma
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Apariencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Apariencia
            </CardTitle>
            <CardDescription>Personaliza la interfaz visual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="font-medium">Tema</Label>
              <p className="text-sm text-muted-foreground">Selecciona el modo de color</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleThemeChange('light')}
                  disabled={isSaving}
                  className={cn(
                    "flex-1 gap-2",
                    theme === 'light' && "border-primary bg-primary/10"
                  )}
                >
                  <Sun className="h-4 w-4" />
                  Claro
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleThemeChange('dark')}
                  disabled={isSaving}
                  className={cn(
                    "flex-1 gap-2",
                    theme === 'dark' && "border-primary bg-primary/10"
                  )}
                >
                  <Moon className="h-4 w-4" />
                  Oscuro
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleThemeChange('system')}
                  disabled={isSaving}
                  className={cn(
                    "flex-1 gap-2",
                    theme === 'system' && "border-primary bg-primary/10"
                  )}
                >
                  <Monitor className="h-4 w-4" />
                  Auto
                </Button>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="density" className="font-medium">Densidad de la interfaz</Label>
              <p className="text-sm text-muted-foreground mb-2">Ajusta el espaciado entre elementos</p>
              <Select 
                value={preferencias?.densidad_ui || 'comfortable'}
                onValueChange={(value) => updatePreferencias({ densidad_ui: value })}
                disabled={isSaving}
              >
                <SelectTrigger id="density">
                  <SelectValue placeholder="Seleccionar densidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compacto</SelectItem>
                  <SelectItem value="comfortable">Cómodo</SelectItem>
                  <SelectItem value="spacious">Espacioso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="animaciones-reducidas" className="font-medium">Animaciones reducidas</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reduce las animaciones para mejorar el rendimiento
                </p>
              </div>
              <Switch
                id="animaciones-reducidas"
                checked={preferencias?.animaciones_reducidas ?? false}
                onCheckedChange={(checked) => updatePreferencias({ animaciones_reducidas: checked })}
                disabled={isSaving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Regional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Regional
            </CardTitle>
            <CardDescription>Configuración de idioma y zona horaria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="language" className="font-medium">Idioma</Label>
              </div>
              <Select 
                value={preferencias?.idioma || 'es'}
                onValueChange={(value) => updatePreferencias({ idioma: value })}
                disabled={isSaving}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Seleccionar idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="timezone" className="font-medium">Zona horaria</Label>
              </div>
              <Select 
                value={preferencias?.zona_horaria || 'America/Buenos_Aires'}
                onValueChange={(value) => updatePreferencias({ zona_horaria: value })}
                disabled={isSaving}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Seleccionar zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Buenos_Aires">América/Buenos Aires (GMT-3)</SelectItem>
                  <SelectItem value="America/Santiago">América/Santiago (GMT-3)</SelectItem>
                  <SelectItem value="America/Bogota">América/Bogotá (GMT-5)</SelectItem>
                  <SelectItem value="America/Mexico_City">América/Ciudad de México (GMT-6)</SelectItem>
                  <SelectItem value="Europe/Madrid">Europa/Madrid (GMT+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="dateFormat" className="font-medium">Formato de fecha</Label>
              <Select 
                value={preferencias?.formato_fecha || 'dd/MM/yyyy'}
                onValueChange={(value) => updatePreferencias({ formato_fecha: value })}
                disabled={isSaving}
              >
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                  <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Comportamiento */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              Comportamiento
            </CardTitle>
            <CardDescription>Configura cómo se comporta la aplicación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Preservar scroll */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <MousePointer2 className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="preservar-scroll" className="font-medium">Preservar scroll</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Mantiene la posición al navegar
                  </p>
                </div>
                <Switch
                  id="preservar-scroll"
                  checked={preferencias?.preservar_scroll ?? true}
                  onCheckedChange={(checked) => updatePreferencias({ preservar_scroll: checked })}
                  disabled={isSaving}
                />
              </div>

              {/* Confirmar eliminar */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="confirmar-eliminar" className="font-medium">Confirmar al eliminar</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Pide confirmación antes de borrar
                  </p>
                </div>
                <Switch
                  id="confirmar-eliminar"
                  checked={preferencias?.confirmar_eliminar ?? true}
                  onCheckedChange={(checked) => updatePreferencias({ confirmar_eliminar: checked })}
                  disabled={isSaving}
                />
              </div>

              {/* Sonidos de notificación */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="sonidos-notificacion" className="font-medium">Sonidos</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Reproduce sonidos de alerta
                  </p>
                </div>
                <Switch
                  id="sonidos-notificacion"
                  checked={preferencias?.sonidos_notificacion ?? true}
                  onCheckedChange={(checked) => updatePreferencias({ sonidos_notificacion: checked })}
                  disabled={isSaving}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recordatorio Parte Diario */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Recordatorio de Parte Diario
            </CardTitle>
            <CardDescription>Configura cuándo recibir recordatorios para completar tu parte diario</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card flex-1">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="recordatorio-activo" className="font-medium">Recordatorio activo</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Muestra un recordatorio si no completaste el parte
                  </p>
                </div>
                <Switch
                  id="recordatorio-activo"
                  checked={configPartes?.recordatorio_activo ?? true}
                  onCheckedChange={(checked) => handleConfigPartesChange('recordatorio_activo', checked)}
                  disabled={upsertConfigMutation.isPending}
                />
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="hora-recordatorio" className="font-medium">Hora del recordatorio</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    A partir de esta hora se mostrará el aviso
                  </p>
                </div>
                <Input
                  id="hora-recordatorio"
                  type="time"
                  value={configPartes?.hora_recordatorio?.slice(0, 5) || '18:00'}
                  onChange={(e) => handleConfigPartesChange('hora_recordatorio', e.target.value)}
                  disabled={upsertConfigMutation.isPending || !(configPartes?.recordatorio_activo ?? true)}
                  className="w-28"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
