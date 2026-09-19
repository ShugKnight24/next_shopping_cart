import { drawStamp } from '../drawStamp';
import { handlePositions, rotationHandlePosition } from './layerModel';

/**
 * Paints the layer stack onto a canvas already transformed into artboard space.
 *
 * The caller sets up device-pixel-ratio, zoom and pan; everything here works in
 * artboard units, so the same function serves the on-screen viewport, the
 * template thumbnails and the full-resolution export.
 */

export const FONT_STACKS = {
  sans: "600 {size}px ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  serif: "600 {size}px Georgia, 'Iowan Old Style', 'Times New Roman', serif",
  display:
    "800 {size}px 'Helvetica Neue', Helvetica, Arial Black, Arial, sans-serif",
  cursive: "600 {size}px 'Snell Roundhand', 'Brush Script MT', cursive",
  mono: "600 {size}px ui-monospace, 'SF Mono', Menlo, monospace",
};

const fontFor = (layer) => {
  const stack = FONT_STACKS[layer.fontFamily] ?? FONT_STACKS.sans;
  return stack
    .replace('{size}', String(layer.fontSize))
    .replace(/^\d+ /, `${layer.fontWeight ?? 600} `);
};

const applyCase = (text, transform) => {
  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  return text;
};

/**
 * Greedy word wrap to a pixel width. Returns the lines rather than drawing, so
 * the same measurement drives both painting and the auto-height the inspector
 * shows. Falls back to one line when `measureText` is unavailable (jsdom).
 */
export const wrapText = (ctx, text, maxWidth) => {
  if (!text) return [''];
  if (typeof ctx.measureText !== 'function') return text.split('\n');

  const lines = [];

  text.split('\n').forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push('');
      return;
    }

    let current = words[0];

    for (let i = 1; i < words.length; i += 1) {
      const candidate = `${current} ${words[i]}`;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        lines.push(current);
        current = words[i];
      }
    }

    lines.push(current);
  });

  return lines;
};

/* ----------------------------------------------------------- per type -- */

/**
 * Shrink a text layer's size until its wrapped block fits its box.
 *
 * A template is authored against one font stack and rendered against whatever
 * the browser actually resolves, so a headline that fit the designer's screen
 * can overrun the artboard here — a single word wider than the box cannot be
 * wrapped at all, and greedy wrapping happily runs it off both edges. Auto-fit
 * makes every template safe regardless of which face the browser picked, and it
 * is what a shopper expects from a text frame on a product they are buying.
 */
const fitFontSize = (ctx, layer) => {
  const content = applyCase(layer.text ?? '', layer.textTransform);
  if (!content || typeof ctx.measureText !== 'function') return layer.fontSize;

  const spacing = layer.letterSpacing ?? 0;
  const ratio = layer.lineHeight ?? 1.16;

  const overflows = (size) => {
    ctx.font = fontFor({ ...layer, fontSize: size });
    const lines = wrapText(ctx, content, layer.width);

    const widest = lines.reduce((max, line) => {
      const width =
        ctx.measureText(line).width +
        spacing * Math.max(0, [...line].length - 1);
      return Math.max(max, width);
    }, 0);

    return widest > layer.width || lines.length * size * ratio > layer.height;
  };

  if (!overflows(layer.fontSize)) return layer.fontSize;

  // Coarse-to-fine rather than a per-pixel walk: at most ~12 measure passes.
  let low = 6;
  let high = layer.fontSize;

  for (let i = 0; i < 12 && high - low > 0.5; i += 1) {
    const mid = (low + high) / 2;
    if (overflows(mid)) high = mid;
    else low = mid;
  }

  return Math.max(6, low);
};

const paintText = (ctx, layer) => {
  const fontSize = fitFontSize(ctx, layer);
  const fitted = fontSize === layer.fontSize ? layer : { ...layer, fontSize };

  ctx.font = fontFor(fitted);
  ctx.fillStyle = layer.color;
  ctx.textBaseline = 'middle';
  ctx.textAlign = layer.align ?? 'center';

  const content = applyCase(layer.text ?? '', layer.textTransform);
  const lines = wrapText(ctx, content, layer.width);
  const lineHeight = fontSize * (layer.lineHeight ?? 1.16);

  // Vertically centre the block inside the layer box.
  const startY = -((lines.length - 1) * lineHeight) / 2;

  const anchorX =
    layer.align === 'left'
      ? -layer.width / 2
      : layer.align === 'right'
        ? layer.width / 2
        : 0;

  const tracking = layer.letterSpacing ?? 0;

  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;

    if (!tracking) {
      ctx.fillText(line, anchorX, y);
      return;
    }

    // Canvas has no letterSpacing in every engine we support, so lay the
    // glyphs out by hand when tracking is non-zero.
    drawTrackedLine(ctx, line, anchorX, y, tracking, layer.align);
  });
};

const drawTrackedLine = (ctx, line, anchorX, y, tracking, align) => {
  const chars = [...line];
  const width =
    chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0) +
    tracking * Math.max(0, chars.length - 1);

  let x =
    align === 'left'
      ? anchorX
      : align === 'right'
        ? anchorX - width
        : anchorX - width / 2;

  const previousAlign = ctx.textAlign;
  ctx.textAlign = 'left';

  chars.forEach((ch) => {
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + tracking;
  });

  ctx.textAlign = previousAlign;
};

const paintShape = (ctx, layer) => {
  const w = layer.width;
  const h = layer.height;

  ctx.beginPath();

  if (layer.shape === 'ellipse') {
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (layer.shape === 'line') {
    ctx.moveTo(-w / 2, 0);
    ctx.lineTo(w / 2, 0);
  } else {
    roundRect(ctx, -w / 2, -h / 2, w, h, layer.radius ?? 0);
  }

  if (layer.shape !== 'line' && layer.fill) {
    ctx.fillStyle = layer.fill;
    ctx.fill();
  }

  if (layer.strokeWidth > 0 && layer.stroke) {
    ctx.strokeStyle = layer.stroke;
    ctx.lineWidth = layer.strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
};

const paintImage = (ctx, layer, imageFor) => {
  const image = layer.src ? imageFor?.(layer.src) : null;
  const w = layer.width;
  const h = layer.height;

  ctx.beginPath();
  roundRect(ctx, -w / 2, -h / 2, w, h, layer.radius ?? 0);
  ctx.save();
  ctx.clip();

  if (!image) {
    // Placeholder while the decode is in flight, or when it failed. Silence
    // here would read as a broken layer.
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1);
    ctx.restore();
    return;
  }

  const scale =
    layer.fit === 'contain'
      ? Math.min(w / image.width, h / image.height)
      : Math.max(w / image.width, h / image.height);

  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.drawImage(image, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
};

const paintArt = (ctx, layer) => {
  drawStamp(ctx, {
    type: layer.art,
    size: Math.min(layer.width, layer.height),
    tint: layer.tint,
    flipX: layer.flipX,
    text: layer.text ?? null,
  });
};

const PAINTERS = {
  text: paintText,
  shape: paintShape,
  art: paintArt,
};

/* -------------------------------------------------------------- stack -- */

export const paintLayers = (
  ctx,
  {
    layers = [],
    imageFor = null,
    selection = null,
    guides = null,
    artboard,
    scale = 1,
  }
) => {
  layers.forEach((layer) => {
    if (!layer.visible) return;

    ctx.save();
    ctx.globalAlpha = layer.opacity ?? 1;
    ctx.translate(layer.x, layer.y);
    if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);
    if (layer.flipX) ctx.scale(-1, 1);

    if (layer.type === 'image') paintImage(ctx, layer, imageFor);
    else (PAINTERS[layer.type] ?? paintShape)(ctx, layer);

    ctx.restore();
  });

  if (guides?.length) paintGuides(ctx, guides, artboard, scale);
  if (selection) paintSelection(ctx, selection, scale);
};

/** Editor chrome. Line widths divide by `scale` so they stay 1px on screen at
 *  any zoom — a selection box that thickens as you zoom in looks amateur. */
const paintSelection = (ctx, layer, scale) => {
  const px = 1 / scale;

  ctx.save();
  ctx.translate(layer.x, layer.y);
  if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);

  ctx.strokeStyle = '#57a8ff';
  ctx.lineWidth = 1.5 * px;
  ctx.strokeRect(
    -layer.width / 2,
    -layer.height / 2,
    layer.width,
    layer.height
  );
  ctx.restore();

  if (layer.locked) return;

  const size = 7 * px;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#57a8ff';
  ctx.lineWidth = 1.5 * px;

  handlePositions(layer).forEach((handle) => {
    ctx.beginPath();
    ctx.rect(handle.x - size / 2, handle.y - size / 2, size, size);
    ctx.fill();
    ctx.stroke();
  });

  const knob = rotationHandlePosition(layer, 26 * px);
  ctx.beginPath();
  ctx.arc(knob.x, knob.y, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
};

const paintGuides = (ctx, guides, artboard, scale) => {
  ctx.save();
  ctx.strokeStyle = '#ff4d8d';
  ctx.lineWidth = 1 / scale;
  ctx.setLineDash([4 / scale, 4 / scale]);

  guides.forEach(({ axis, at }) => {
    ctx.beginPath();
    if (axis === 'v') {
      ctx.moveTo(at, 0);
      ctx.lineTo(at, artboard.height);
    } else {
      ctx.moveTo(0, at);
      ctx.lineTo(artboard.width, at);
    }
    ctx.stroke();
  });

  ctx.setLineDash([]);
  ctx.restore();
};

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);

  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
    return;
  }

  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
