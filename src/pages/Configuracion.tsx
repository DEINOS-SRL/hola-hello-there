import { Moon, Sun, Monitor, Palette, Bell, Shield, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/ThemeProvider";

const themeOptions = [
  { value: "light", label: "Claro", icon: Sun, description: "Tema claro para uso diurno" },
  { value: "dark", label: "Oscuro", icon: Moon, description: "Tema oscuro para reducir fatiga visual" },
  { value: "system", label: "Sistema", icon: Monitor, description: "Usa la preferencia del sistema" },
] as const;

export default function Configuracion() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu experiencia en la plataforma</p>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Apariencia</CardTitle>
          </div>
          <CardDescription>
            Personaliza cómo se ve la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base">Tema</Label>
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Label
                    key={option.value}
                    htmlFor={option.value}
                    className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/50 ${
                      theme === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.value}
                      className="sr-only"
                    />
                    <div className={`p-3 rounded-full ${
                      theme === option.value ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        theme === option.value ? "text-primary" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notificaciones</CardTitle>
          </div>
          <CardDescription>
            Configura cómo recibir alertas y notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notificaciones por email</Label>
              <p className="text-sm text-muted-foreground">
                Recibe actualizaciones importantes en tu correo
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notificaciones en la app</Label>
              <p className="text-sm text-muted-foreground">
                Muestra alertas dentro de la aplicación
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Sonidos</Label>
              <p className="text-sm text-muted-foreground">
                Reproduce sonidos para eventos importantes
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Privacidad</CardTitle>
          </div>
          <CardDescription>
            Controla tu privacidad y datos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Mostrar estado en línea</Label>
              <p className="text-sm text-muted-foreground">
                Otros usuarios pueden ver cuando estás conectado
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Historial de actividad</Label>
              <p className="text-sm text-muted-foreground">
                Guardar registro de tus acciones en el sistema
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
