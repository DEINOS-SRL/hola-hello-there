import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfigParteDiario, useHasSubmittedParteToday } from '../hooks/useConfigPartes';
import { useAuth } from '@/contexts/AuthContext';

export function ParteDiarioReminder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: config } = useConfigParteDiario();
  const { data: hasSubmitted } = useHasSubmittedParteToday();
  const [showReminder, setShowReminder] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkShouldShowReminder = useCallback(() => {
    if (!user || !config || hasSubmitted || dismissed) {
      return false;
    }

    if (!config.recordatorio_activo) {
      return false;
    }

    // Parse hora_recordatorio (format: "HH:mm:ss")
    const [hours, minutes] = config.hora_recordatorio.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);

    // Show if current time is past reminder time
    return now >= reminderTime;
  }, [user, config, hasSubmitted, dismissed]);

  useEffect(() => {
    const shouldShow = checkShouldShowReminder();
    setShowReminder(shouldShow);

    // Check every minute
    const interval = setInterval(() => {
      const shouldShow = checkShouldShowReminder();
      setShowReminder(shouldShow);
    }, 60000);

    return () => clearInterval(interval);
  }, [checkShouldShowReminder]);

  // Reset dismissed state at midnight
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeout = setTimeout(() => {
      setDismissed(false);
    }, msUntilMidnight);

    return () => clearTimeout(timeout);
  }, [dismissed]);

  const handleGoToParte = () => {
    navigate('/rrhh/partes-diarios?action=nuevo');
    setShowReminder(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowReminder(false);
  };

  if (!showReminder) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-card border shadow-lg rounded-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10 shrink-0">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">Recordatorio</h4>
            <p className="text-sm text-muted-foreground mt-1">
              No olvidés completar tu parte diario de hoy.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Button size="sm" onClick={handleGoToParte}>
                Completar ahora
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Más tarde
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1 mt-3 pt-2 border-t text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            Recordatorio configurado a las {config?.hora_recordatorio?.slice(0, 5) || '18:00'}
          </span>
        </div>
      </div>
    </div>
  );
}
