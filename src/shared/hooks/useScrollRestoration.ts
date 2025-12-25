import { RefObject, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Preserva/restaura scrollTop de un contenedor (no del window) usando sessionStorage.
 * Útil para layouts con scroll interno (main/sidebar) para evitar saltos al navegar.
 */
export function useScrollRestoration(
  ref: RefObject<HTMLElement>,
  storageKey: string,
  restoreDeps: unknown[] = [],
) {
  const rafId = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const raw = sessionStorage.getItem(storageKey);
    if (raw == null) return;

    const top = Number(raw);
    if (!Number.isFinite(top)) return;

    el.scrollTop = top;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, restoreDeps);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        sessionStorage.setItem(storageKey, String(el.scrollTop));
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [ref, storageKey]);
}
