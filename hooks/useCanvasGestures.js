import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useCanvasGestures
 * Unified mouse and touch gesture hook for interactive HTML5 Canvas.
 * Handles drag interactions, sticker stamping, hover detection,
 * and buffers drag frames so history is only committed on release.
 */
export function useCanvasGestures({
  canvasRef,
  stickers = [],
  selectedSticker = null,
  onUpdateStickers = () => {},
  onCanvasClick = null,
}) {
  const [activeStickerId, setActiveStickerId] = useState(null);
  const [hoveredStickerId, setHoveredStickerId] = useState(null);

  const isDraggingRef = useRef(false);
  const dragTargetRef = useRef(null);
  const hasMovedRef = useRef(false);
  const currentStickersRef = useRef(stickers);

  useEffect(() => {
    currentStickersRef.current = stickers;
  }, [stickers]);

  // Helper to extract canvas-relative x, y from mouse or touch event
  const getCanvasCoords = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX =
        e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      const clientY =
        e.touches && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    [canvasRef]
  );

  const handlePointerDown = useCallback(
    (e) => {
      const { x, y } = getCanvasCoords(e);
      hasMovedRef.current = false;

      // Check if clicked an existing sticker (from top of stack down)
      const clickedSticker = [...currentStickersRef.current]
        .reverse()
        .find((s) => {
          const dist = Math.hypot(s.x - x, y - s.y);
          return dist <= 28 * (s.scale || 1);
        });

      if (clickedSticker) {
        isDraggingRef.current = true;
        dragTargetRef.current = clickedSticker.id;
        setActiveStickerId(clickedSticker.id);
      } else if (selectedSticker) {
        // Stamp new sticker - commits immediately
        const newSticker = {
          id: `stamp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: selectedSticker,
          x,
          y,
          scale: 1.2,
          rotation: 0,
        };
        const updated = [...currentStickersRef.current, newSticker];
        currentStickersRef.current = updated;
        onUpdateStickers(updated, { commit: true });
        setActiveStickerId(newSticker.id);
      } else {
        setActiveStickerId(null);
        if (onCanvasClick) {
          onCanvasClick(x, y);
        }
      }
    },
    [getCanvasCoords, selectedSticker, onUpdateStickers, onCanvasClick]
  );

  const handlePointerMove = useCallback(
    (e) => {
      const { x, y } = getCanvasCoords(e);

      if (isDraggingRef.current && dragTargetRef.current) {
        hasMovedRef.current = true;
        // Prevent screen scrolling while dragging stickers on mobile touch
        if (e.cancelable && e.type && e.type.startsWith('touch')) {
          e.preventDefault();
        }
        const updated = currentStickersRef.current.map((s) =>
          s.id === dragTargetRef.current ? { ...s, x, y } : s
        );
        currentStickersRef.current = updated;
        // Live coordinate update without committing intermediate frames to undo history stack
        onUpdateStickers(updated, { commit: false });
      } else {
        const hover = currentStickersRef.current.find(
          (s) => Math.hypot(s.x - x, s.y - y) <= 24
        );
        setHoveredStickerId(hover ? hover.id : null);
      }
    },
    [getCanvasCoords, onUpdateStickers]
  );

  const handlePointerUp = useCallback(() => {
    if (isDraggingRef.current && hasMovedRef.current) {
      // Commit final position to undo history once gesture completes
      onUpdateStickers(currentStickersRef.current, { commit: true });
    }
    isDraggingRef.current = false;
    dragTargetRef.current = null;
    hasMovedRef.current = false;
  }, [onUpdateStickers]);

  return {
    activeStickerId,
    setActiveStickerId,
    hoveredStickerId,
    handlers: {
      onMouseDown: handlePointerDown,
      onMouseMove: handlePointerMove,
      onMouseUp: handlePointerUp,
      onMouseLeave: handlePointerUp,
      onTouchStart: handlePointerDown,
      onTouchMove: handlePointerMove,
      onTouchEnd: handlePointerUp,
      onTouchCancel: handlePointerUp,
    },
  };
}
