import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, MessageSquare, AlertCircle, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { usePreferenciasGlobal } from '@/contexts/PreferenciasContext';
import { segClient } from '@/modules/security/services/segClient';
import { 
  fetchNotificaciones, 
  marcarComoLeida, 
  marcarTodasComoLeidas,
  type Notificacion 
} from '@/modules/security/services/notificacionesService';
import { useToast } from '@/hooks/use-toast';

const notificationIcons = {
  info: Info,
  success: Check,
  warning: AlertCircle,
  message: MessageSquare,
};

const notificationColors = {
  info: 'text-blue-500 bg-blue-500/10',
  success: 'text-green-500 bg-green-500/10',
  warning: 'text-amber-500 bg-amber-500/10',
  message: 'text-primary bg-primary/10',
};

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notificacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { formatRelativeTime } = usePreferenciasGlobal();

  const unreadCount = notifications.filter(n => !n.leida).length;

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchNotificaciones();
      setNotifications(data);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Error al cargar notificaciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar notificaciones iniciales y suscribirse a cambios en tiempo real
  useEffect(() => {
    loadNotifications();

    // Suscribirse a cambios en tiempo real
    const channel = segClient
      .channel('notificaciones-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'seg',
          table: 'notificaciones',
        },
        (payload) => {
          console.log('Nueva notificación recibida:', payload);
          const newNotification = payload.new as Notificacion;
          
          // Agregar la nueva notificación al principio
          setNotifications(prev => [newNotification, ...prev].slice(0, 20));
          
          // Mostrar toast de nueva notificación
          toast({
            title: newNotification.titulo,
            description: newNotification.mensaje,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'seg',
          table: 'notificaciones',
        },
        (payload) => {
          console.log('Notificación actualizada:', payload);
          const updatedNotification = payload.new as Notificacion;
          
          // Actualizar la notificación en el estado
          setNotifications(prev =>
            prev.map(n => (n.id === updatedNotification.id ? updatedNotification : n))
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'seg',
          table: 'notificaciones',
        },
        (payload) => {
          console.log('Notificación eliminada:', payload);
          const deletedId = (payload.old as Notificacion).id;
          
          // Eliminar la notificación del estado
          setNotifications(prev => prev.filter(n => n.id !== deletedId));
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      console.log('Removing realtime channel');
      segClient.removeChannel(channel);
    };
  }, [loadNotifications, toast]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await marcarComoLeida(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await marcarTodasComoLeidas();
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-popover">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            Notificaciones
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" title="Tiempo real activo" />
          </span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary hover:text-primary/80"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como leídas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-destructive text-sm">
              {error}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No tienes notificaciones
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = notificationIcons[notification.tipo] || Info;
              const colorClass = notificationColors[notification.tipo] || notificationColors.info;
              
              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                    !notification.leida ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm leading-none ${!notification.leida ? 'font-medium' : ''}`}>
                      {notification.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.mensaje}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.leida && (
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 animate-pulse" />
                  )}
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="justify-center text-primary cursor-pointer"
          onClick={loadNotifications}
        >
          Actualizar notificaciones
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
