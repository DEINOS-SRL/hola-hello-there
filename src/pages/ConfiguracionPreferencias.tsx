import { Sliders, Palette, Globe, Clock, Languages } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ConfiguracionPreferencias() {
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
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Tema</Label>
                <p className="text-sm text-muted-foreground">Selecciona el modo de color</p>
              </div>
              <ThemeToggle />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="density" className="font-medium">Densidad de la interfaz</Label>
              <p className="text-sm text-muted-foreground mb-2">Ajusta el espaciado entre elementos</p>
              <Select defaultValue="comfortable">
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
              <Select defaultValue="es">
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
              <Select defaultValue="america-buenos_aires">
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Seleccionar zona horaria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="america-buenos_aires">América/Buenos Aires (GMT-3)</SelectItem>
                  <SelectItem value="america-santiago">América/Santiago (GMT-3)</SelectItem>
                  <SelectItem value="america-bogota">América/Bogotá (GMT-5)</SelectItem>
                  <SelectItem value="america-mexico_city">América/Ciudad de México (GMT-6)</SelectItem>
                  <SelectItem value="europe-madrid">Europa/Madrid (GMT+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="dateFormat" className="font-medium">Formato de fecha</Label>
              <Select defaultValue="dd-mm-yyyy">
                <SelectTrigger id="dateFormat">
                  <SelectValue placeholder="Seleccionar formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd-mm-yyyy">DD/MM/AAAA</SelectItem>
                  <SelectItem value="mm-dd-yyyy">MM/DD/AAAA</SelectItem>
                  <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
