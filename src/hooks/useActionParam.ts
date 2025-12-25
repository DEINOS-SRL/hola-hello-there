import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

type ActionType = 'new' | 'edit' | string;

interface UseActionParamOptions {
  onAction?: (action: ActionType, id?: string) => void;
  clearOnAction?: boolean;
}

/**
 * Hook para detectar y manejar el parámetro ?action=new en la URL
 * Útil para abrir modales automáticamente desde búsqueda rápida o enlaces externos
 * 
 * @example
 * const { action, clearAction } = useActionParam({
 *   onAction: (action) => {
 *     if (action === 'new') setModalOpen(true);
 *   }
 * });
 */
export function useActionParam(options: UseActionParamOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { onAction, clearOnAction = true } = options;

  const action = searchParams.get('action') as ActionType | null;
  const actionId = searchParams.get('id');

  const clearAction = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('action');
    newParams.delete('id');
    setSearchParams(newParams, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (action && onAction) {
      // Pequeño delay para asegurar que el componente esté montado
      const timer = setTimeout(() => {
        onAction(action, actionId || undefined);
        if (clearOnAction) {
          clearAction();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [action, actionId, onAction, clearOnAction, clearAction]);

  return {
    action,
    actionId,
    clearAction,
    hasAction: !!action,
  };
}
