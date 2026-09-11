import { useEffect, useRef } from 'react';

/**
 * Declarative click-outside hook.
 *
 * Replaces imperative document.querySelector calls with a type-safe,
 * accessible React ref-based event containment.
 *
 * @param {Function} handler - Callback triggered when pointer events occur outside ref
 * @param {boolean} [active=true] - Whether the listener is currently engaged
 * @returns {import('react').RefObject<HTMLElement>}
 */
export function useClickOutside(handler, active = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;

    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      if (typeof handler === 'function') {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler, active]);

  return ref;
}
