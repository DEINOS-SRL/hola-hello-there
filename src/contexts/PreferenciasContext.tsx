import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { usePreferencias } from '@/hooks/usePreferencias';
import { PreferenciasUsuario } from '@/services/preferenciasService';
import { useAuth } from '@/contexts/AuthContext';

interface PreferenciasContextType {
  preferencias: PreferenciasUsuario | undefined;
  isLoading: boolean;
  updatePreferencias: (updates: Partial<PreferenciasUsuario>) => void;
  formatDate: (date: Date | string, style?: 'short' | 'long' | 'full') => string;
  formatDateTime: (date: Date | string) => string;
  formatRelativeTime: (date: Date | string) => string;
}

const PreferenciasContext = createContext<PreferenciasContextType | undefined>(undefined);

// Mapeo de formatos de fecha
const dateFormats: Record<string, Intl.DateTimeFormatOptions> = {
  'dd/MM/yyyy': { day: '2-digit', month: '2-digit', year: 'numeric' },
  'MM/dd/yyyy': { month: '2-digit', day: '2-digit', year: 'numeric' },
  'yyyy-MM-dd': { year: 'numeric', month: '2-digit', day: '2-digit' },
};

// Mapeo de idiomas a locales
const localeMap: Record<string, string> = {
  'es': 'es-AR',
  'en': 'en-US',
  'pt': 'pt-BR',
};

export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { preferencias, isLoading, updatePreferencias } = usePreferencias();
  const { setTheme } = useTheme();

  // Aplicar tema cuando cambian las preferencias
  useEffect(() => {
    if (preferencias?.tema && isAuthenticated) {
      setTheme(preferencias.tema);
    }
  }, [preferencias?.tema, isAuthenticated, setTheme]);

  // Obtener locale basado en idioma
  const getLocale = () => {
    return localeMap[preferencias?.idioma || 'es'] || 'es-AR';
  };

  // Formatear fecha según preferencias
  const formatDate = (date: Date | string, style: 'short' | 'long' | 'full' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '-';

    const locale = getLocale();

    if (style === 'short') {
      const formatKey = preferencias?.formato_fecha || 'dd/MM/yyyy';
      const options = dateFormats[formatKey] || dateFormats['dd/MM/yyyy'];
      return dateObj.toLocaleDateString(locale, options);
    }

    if (style === 'long') {
      return dateObj.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }

    // full
    return dateObj.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Formatear fecha y hora
  const formatDateTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '-';

    const locale = getLocale();
    
    return dateObj.toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatear tiempo relativo
  const formatRelativeTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '-';

    const locale = getLocale();
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffSecs < 60) return rtf.format(-diffSecs, 'second');
    if (diffMins < 60) return rtf.format(-diffMins, 'minute');
    if (diffHours < 24) return rtf.format(-diffHours, 'hour');
    if (diffDays < 30) return rtf.format(-diffDays, 'day');
    
    return formatDate(dateObj, 'short');
  };

  return (
    <PreferenciasContext.Provider
      value={{
        preferencias,
        isLoading,
        updatePreferencias,
        formatDate,
        formatDateTime,
        formatRelativeTime,
      }}
    >
      {children}
    </PreferenciasContext.Provider>
  );
}

export function usePreferenciasGlobal() {
  const context = useContext(PreferenciasContext);
  if (context === undefined) {
    // Retornar valores por defecto si no hay contexto (usuario no logueado)
    return {
      preferencias: undefined,
      isLoading: false,
      updatePreferencias: () => {},
      formatDate: (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('es-AR');
      },
      formatDateTime: (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleString('es-AR');
      },
      formatRelativeTime: (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('es-AR');
      },
    };
  }
  return context;
}
