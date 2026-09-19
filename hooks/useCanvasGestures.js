import { useCallback, useEffect, useRef, useState } from 'react';
import { createDesignId } from '../Components/Studio/core/designDoc';

/** Half-extent of a stamp's artwork at scale 1, matching the 48x48 design box
 *  `drawStamp` renders into. */
const STAMP_HALF_EXTENT = 24;

/**
 * Is the point inside the stamp's own box, accounting for its rotation?
 *
 * The previous test was `Math.hypot(...) <= 28 * scale` — a circle, which
 * ignored rotation entirely and matched no stamp's actual artwork. Wide stamps
 * (the speech bubble, the rainbow) were grabbable well outside their art and
 * dead at their own corners. Invert the stamp's transform and test the point
 * against an axis-aligned box in its local space instead.
 *
 * `flipX` is deliberately not applied: the box is centred and symmetric, so a
 * horizontal flip cannot change whether a point falls inside it.
 */
const hitTestStamp = (sticker, x, y) => {
  const scale = sticker.scale || 1;
  const dx = x - sticker.x;
  const dy = y - sticker.y;

  const radians = ((sticker.rotation || 0) * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const localX = (dx * cos + dy * sin) / scale;
  const localY = (-dx * sin + dy * cos) / scale;

  return (
    Math.abs(localX) <= STAMP_HALF_EXTENT &&
    Math.abs(localY) <= STAMP_HALF_EXTENT
  );
};

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
  const grabOffsetRef = useRef({ x: 0, y: 0 });

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
        .find((s) => hitTestStamp(s, x, y));

      if (clickedSticker) {
        isDraggingRef.current = true;
        dragTargetRef.current = clickedSticker.id;
        // Keep the grab point under the cursor. Without this, grabbing a stamp
        // anywhere but dead centre teleports it so its centre snaps to the
        // pointer on the first move.
        grabOffsetRef.current = {
          x: clickedSticker.x - x,
          y: clickedSticker.y - y,
        };
        setActiveStickerId(clickedSticker.id);
      } else if (selectedSticker) {
        // Stamp new sticker - commits immediately
        const newSticker = {
          id: createDesignId('stamp'),
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
        const { x: offsetX, y: offsetY } = grabOffsetRef.current;
        const updated = currentStickersRef.current.map((s) =>
          s.id === dragTargetRef.current
            ? { ...s, x: x + offsetX, y: y + offsetY }
            : s
        );
        currentStickersRef.current = updated;
        // Live coordinate update without committing intermediate frames to undo history stack
        onUpdateStickers(updated, { commit: false });
      } else {
        // Same test as the click path. It previously used a fixed radius of 24
        // that ignored scale, so the hover cursor disagreed with what a click
        // would actually pick up.
        const hover = [...currentStickersRef.current]
          .reverse()
          .find((s) => hitTestStamp(s, x, y));
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
    grabOffsetRef.current = { x: 0, y: 0 };
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
