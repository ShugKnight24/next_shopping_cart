import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './CanvasViewport.module.css';
import {
  handlePositions,
  layerAt,
  moveLayer,
  resizeLayer,
  rotationHandlePosition,
  snapPosition,
} from './layerModel';
import { paintLayers } from './renderLayers';

const HANDLE_GRAB = 9;

/**
 * The canvas field: a zoomable, pannable viewport with the artboard floating in
 * the middle.
 *
 * The substrate — the product itself — is drawn by the route via
 * `drawSubstrate`, so the viewport stays product-agnostic. Everything above it
 * is the shared layer stack.
 */
export const CanvasViewport = ({
  workbench,
  artboard,
  drawSubstrate,
  imageFor = null,
  onFitRequest = null,
  ariaLabel = 'Design canvas',
}) => {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  const [guides, setGuides] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [cursor, setCursor] = useState('default');

  const drag = useRef(null);
  const spaceHeld = useRef(false);

  const { layers, selection, zoom, pan } = workbench;

  /* ------------------------------------------------ size + paint loop -- */

  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = wrapRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setViewport({ width: Math.round(width), height: Math.round(height) });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Fit once, as soon as we know how much room we have.
  const hasFitted = useRef(false);
  useEffect(() => {
    if (hasFitted.current || !viewport.width || !viewport.height) return;
    hasFitted.current = true;
    workbench.fit(viewport);
    onFitRequest?.(viewport);
  }, [viewport, workbench, onFitRequest]);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !viewport.width) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = Math.round(viewport.width * dpr);
    canvas.height = Math.round(viewport.height * dpr);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, viewport.width, viewport.height);

    const originX = viewport.width / 2 - (artboard.width * zoom) / 2 + pan.x;
    const originY = viewport.height / 2 - (artboard.height * zoom) / 2 + pan.y;

    ctx.save();
    ctx.translate(originX, originY);
    ctx.scale(zoom, zoom);

    // Paper shadow, drawn in screen terms so it does not scale into a blur.
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 40 / zoom;
    ctx.shadowOffsetY = 18 / zoom;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, artboard.width, artboard.height);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, artboard.width, artboard.height);
    ctx.clip();

    drawSubstrate?.(ctx, artboard);
    paintLayers(ctx, {
      layers,
      artboard,
      imageFor,
      selection: null,
      guides: null,
      scale: zoom,
    });

    ctx.restore();

    // Selection chrome sits outside the clip so handles on the artboard edge
    // are still grabbable.
    paintLayers(ctx, {
      layers: [],
      artboard,
      selection,
      guides,
      scale: zoom,
    });

    ctx.restore();
  }, [
    viewport,
    artboard,
    zoom,
    pan,
    layers,
    selection,
    guides,
    drawSubstrate,
    imageFor,
  ]);

  useEffect(() => {
    paint();
  }, [paint]);

  /* --------------------------------------------------- coordinate maths -- */

  const toArtboard = useCallback(
    (clientX, clientY) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };

      const originX = rect.width / 2 - (artboard.width * zoom) / 2 + pan.x;
      const originY = rect.height / 2 - (artboard.height * zoom) / 2 + pan.y;

      return {
        x: (clientX - rect.left - originX) / zoom,
        y: (clientY - rect.top - originY) / zoom,
      };
    },
    [artboard, zoom, pan]
  );

  const handleUnder = useCallback(
    (point) => {
      if (!selection || selection.locked) return null;

      const tolerance = HANDLE_GRAB / zoom;

      const rotate = rotationHandlePosition(selection, 26 / zoom);
      if (Math.hypot(rotate.x - point.x, rotate.y - point.y) <= tolerance) {
        return { kind: 'rotate' };
      }

      const found = handlePositions(selection).find(
        (h) => Math.hypot(h.x - point.x, h.y - point.y) <= tolerance
      );

      return found ? { kind: 'resize', handle: found } : null;
    },
    [selection, zoom]
  );

  /* ------------------------------------------------------------ pointer -- */

  const onPointerDown = useCallback(
    (event) => {
      canvasRef.current?.focus();
      const point = toArtboard(event.clientX, event.clientY);

      // Space-drag or middle button pans, like every design tool.
      if (spaceHeld.current || event.button === 1) {
        drag.current = {
          kind: 'pan',
          startX: event.clientX,
          startY: event.clientY,
          originPan: { ...pan },
        };
        setIsPanning(true);
        event.currentTarget.setPointerCapture?.(event.pointerId);
        return;
      }

      if (event.button !== 0) return;

      const onHandle = handleUnder(point);
      if (onHandle) {
        drag.current = {
          ...onHandle,
          layer: selection,
          startPoint: point,
        };
        event.currentTarget.setPointerCapture?.(event.pointerId);
        return;
      }

      const hit = layerAt(layers, point.x, point.y);

      if (!hit) {
        workbench.select(null);
        return;
      }

      workbench.select(hit.id);

      if (hit.locked) return;

      drag.current = {
        kind: 'move',
        layer: hit,
        startPoint: point,
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [toArtboard, handleUnder, layers, selection, pan, workbench]
  );

  const onPointerMove = useCallback(
    (event) => {
      const active = drag.current;
      const point = toArtboard(event.clientX, event.clientY);

      if (!active) {
        // Cursor feedback: resize handles and draggable layers should announce
        // themselves before the click.
        if (spaceHeld.current) setCursor('grab');
        else if (handleUnder(point)) setCursor('pointer');
        else if (layerAt(layers, point.x, point.y)) setCursor('move');
        else setCursor('default');
        return;
      }

      if (active.kind === 'pan') {
        workbench.setPan({
          x: active.originPan.x + (event.clientX - active.startX),
          y: active.originPan.y + (event.clientY - active.startY),
        });
        return;
      }

      const dx = point.x - active.startPoint.x;
      const dy = point.y - active.startPoint.y;

      if (active.kind === 'move') {
        const moved = moveLayer(active.layer, dx, dy);
        const snapped = event.shiftKey
          ? { x: moved.x, y: moved.y, guides: [] }
          : snapPosition(moved, layers, artboard);

        setGuides(snapped.guides);
        workbench.updateLayer(
          active.layer.id,
          { x: snapped.x, y: snapped.y },
          { commit: false }
        );
        return;
      }

      if (active.kind === 'resize') {
        const resized = resizeLayer(active.layer, active.handle, dx, dy);
        workbench.updateLayer(
          active.layer.id,
          {
            x: resized.x,
            y: resized.y,
            width: resized.width,
            height: resized.height,
          },
          { commit: false }
        );
        return;
      }

      if (active.kind === 'rotate') {
        const raw =
          (Math.atan2(point.y - active.layer.y, point.x - active.layer.x) *
            180) /
            Math.PI +
          90;
        // Shift snaps to 15 degrees, the convention everywhere else.
        const rotation = event.shiftKey
          ? Math.round(raw / 15) * 15
          : Math.round(raw);
        workbench.updateLayer(active.layer.id, { rotation }, { commit: false });
      }
    },
    [toArtboard, handleUnder, layers, artboard, workbench]
  );

  const endDrag = useCallback(() => {
    if (drag.current && drag.current.kind !== 'pan') {
      // One history entry per gesture: the live frames went out uncommitted.
      workbench.setLayers((current) => current, { commit: true });
    }

    drag.current = null;
    setGuides(null);
    setIsPanning(false);
  }, [workbench]);

  const onWheel = useCallback(
    (event) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      event.preventDefault();
      workbench.setZoom(
        (current) => current * (event.deltaY < 0 ? 1.08 : 0.926)
      );
    },
    [workbench]
  );

  /* ----------------------------------------------------------- keyboard -- */

  useEffect(() => {
    const down = (event) => {
      if (event.code === 'Space' && !isEditableTarget(event.target)) {
        spaceHeld.current = true;
        setCursor('grab');
        event.preventDefault();
      }
    };

    const up = (event) => {
      if (event.code === 'Space') {
        spaceHeld.current = false;
        setCursor('default');
      }
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const onKeyDown = useCallback(
    (event) => {
      if (!selection || isEditableTarget(event.target)) return;

      const step = event.shiftKey ? 10 : 1;

      const nudges = {
        ArrowLeft: { x: -step },
        ArrowRight: { x: step },
        ArrowUp: { y: -step },
        ArrowDown: { y: step },
      };

      if (nudges[event.key]) {
        event.preventDefault();
        const delta = nudges[event.key];
        workbench.updateLayer(selection.id, (layer) => ({
          x: layer.x + (delta.x ?? 0),
          y: layer.y + (delta.y ?? 0),
        }));
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        workbench.removeLayer(selection.id);
        return;
      }

      if (event.key === 'Escape') {
        workbench.select(null);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        workbench.duplicate(selection.id);
      }
    },
    [selection, workbench]
  );

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ cursor: isPanning ? 'grabbing' : cursor }}
        tabIndex={0}
        role="img"
        aria-label={ariaLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={onWheel}
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

CanvasViewport.propTypes = {
  workbench: PropTypes.object.isRequired,
  artboard: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  drawSubstrate: PropTypes.func,
  imageFor: PropTypes.func,
  onFitRequest: PropTypes.func,
  ariaLabel: PropTypes.string,
};

function isEditableTarget(target) {
  const tag = target?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable;
}
