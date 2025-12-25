import { Sliders, Palette, Globe, Clock, Languages, Loader2, Sun, Moon, Monitor, MousePointer2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { usePreferencias } from '@/hooks/usePreferencias';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ConfiguracionPreferencias() {
  const { preferencias, isLoading, updatePreferencias, isSaving } = usePreferencias();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    updatePreferencias({ tema: newTheme });
  };

  if (isLoading) {
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
                  <MousePointer2 className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="preservar-scroll" className="font-medium">Preservar posición de scroll</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Mantiene la posición del scroll al navegar entre páginas
                </p>
              </div>
              <Switch
                id="preservar-scroll"
                checked={preferencias?.preservar_scroll ?? true}
                onCheckedChange={(checked) => updatePreferencias({ preservar_scroll: checked })}
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
      </div>
    </div>
  );
}
