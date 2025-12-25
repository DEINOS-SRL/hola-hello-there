import { Bell, Mail, MessageSquare, Smartphone, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

export default function ConfiguracionNotificaciones() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    desktopNotifications: true,
    newMessages: true,
    taskUpdates: true,
    systemAlerts: true,
    weeklyDigest: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Bell className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-muted-foreground">
            Configura cómo y cuándo recibir alertas
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Canales de notificación */}
        <Card>
          <CardHeader>
            <CardTitle>Canales de notificación</CardTitle>
            <CardDescription>Elige cómo quieres recibir las notificaciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="email" className="font-medium">Correo electrónico</Label>
                  <p className="text-sm text-muted-foreground">Recibir notificaciones por email</p>
                </div>
              </div>
              <Switch 
                id="email" 
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="push" className="font-medium">Notificaciones push</Label>
                  <p className="text-sm text-muted-foreground">En tu dispositivo móvil</p>
                </div>
              </div>
              <Switch 
                id="push" 
                checked={settings.pushNotifications}
                onCheckedChange={() => handleToggle('pushNotifications')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="desktop" className="font-medium">Escritorio</Label>
                  <p className="text-sm text-muted-foreground">Notificaciones del navegador</p>
                </div>
              </div>
              <Switch 
                id="desktop" 
                checked={settings.desktopNotifications}
                onCheckedChange={() => handleToggle('desktopNotifications')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tipos de alertas */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de alertas</CardTitle>
            <CardDescription>Selecciona qué notificaciones quieres recibir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="messages" className="font-medium">Nuevos mensajes</Label>
                  <p className="text-sm text-muted-foreground">Cuando recibes un mensaje</p>
                </div>
              </div>
              <Switch 
                id="messages" 
                checked={settings.newMessages}
                onCheckedChange={() => handleToggle('newMessages')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tasks" className="font-medium">Actualizaciones de tareas</Label>
                <p className="text-sm text-muted-foreground">Cambios en tus tareas asignadas</p>
              </div>
              <Switch 
                id="tasks" 
                checked={settings.taskUpdates}
                onCheckedChange={() => handleToggle('taskUpdates')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="system" className="font-medium">Alertas del sistema</Label>
                <p className="text-sm text-muted-foreground">Avisos importantes de la plataforma</p>
              </div>
              <Switch 
                id="system" 
                checked={settings.systemAlerts}
                onCheckedChange={() => handleToggle('systemAlerts')}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="digest" className="font-medium">Resumen semanal</Label>
                <p className="text-sm text-muted-foreground">Recibe un resumen cada semana</p>
              </div>
              <Switch 
                id="digest" 
                checked={settings.weeklyDigest}
                onCheckedChange={() => handleToggle('weeklyDigest')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
