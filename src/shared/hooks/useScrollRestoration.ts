import { RefObject, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Preserva/restaura scrollTop de un contenedor (no del window) usando sessionStorage.
 * Útil para layouts con scroll interno (main/sidebar) para evitar saltos al navegar.
 * 
 * @param enabled - Si false, no guarda ni restaura scroll (respeta preferencia de usuario)
 * @param debug - Si true, loguea scrollTop antes/después para diagnóstico
 */
export function useScrollRestoration(
  ref: RefObject<HTMLElement>,
  storageKey: string,
  restoreDeps: unknown[] = [],
  options: { enabled?: boolean; debug?: boolean } = {},
) {
  const { enabled = true, debug = false } = options;
  const rafId = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const raw = sessionStorage.getItem(storageKey);
    const beforeTop = el.scrollTop;

    if (raw == null) {
      if (debug) {
        console.debug(`[ScrollRestoration] ${storageKey}: no saved value, current=${beforeTop}`);
      }
      return;
    }

    const top = Number(raw);
    if (!Number.isFinite(top)) return;

    el.scrollTop = top;

    if (debug) {
      console.debug(`[ScrollRestoration] ${storageKey}: restored ${beforeTop} → ${top}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, restoreDeps);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const onScroll = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        const currentTop = el.scrollTop;
        sessionStorage.setItem(storageKey, String(currentTop));
        if (debug) {
          console.debug(`[ScrollRestoration] ${storageKey}: saved scrollTop=${currentTop}`);
        }
      });
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [ref, storageKey, enabled, debug]);
}

