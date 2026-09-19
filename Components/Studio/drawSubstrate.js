import { contrastInk, shade } from './core/characterSchema';
import { drawCompanion, drawHero } from './drawCharacter';
import { getDefaultSceneForTheme } from './sceneEnvironments';
import { drawEnvironmentScene } from './sceneRenderer';

/**
 * The PRODUCT art, extracted verbatim out of `CanvasEngine`'s `renderCanvas`.
 *
 * A substrate is the blank product and nothing else: the framed poster with its
 * mat and paper stock, the garment silhouette in its colourway, the book spread
 * with its binding and scene. It deliberately does NOT draw the monogram or
 * headline copy, stamps, bleed guides, watermarks or selection chrome — in the
 * workbench those are layers or editor UI, and the editor owns them.
 *
 * Each function paints into a plain (0, 0, width, height) box. The caller has
 * already translated / scaled into artboard space and clipped.
 *
 * Pure module: no React, no hooks, no imports from CanvasEngine.
 */

/** One map, three modes. It used to be declared separately in each branch. */
export const FONT_FAMILIES = {
  serif: "'Cinzel', 'Playfair Display', Georgia, serif",
  sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  display: "'Impact', 'Trebuchet MS', sans-serif",
  cursive: "'Brush Script MT', 'Comic Sans MS', cursive",
};

/** Youth sizing translated into a believable garment scale on the proof. */
export const APPAREL_SIZE_SCALE = {
  'Youth XS': 0.86,
  'Youth S': 0.93,
  'Youth M': 1,
  'Youth L': 1.07,
  'Youth XL': 1.14,
};

/* Reused across frames so the render loop stays allocation-free. */
const HERO_OPTS = { x: 0, y: 0 };
const COMPANION_OPTS = { x: 0, y: 0 };

/* ------------------------------------------------------------------ poster -- */

/**
 * Geometry of the poster's mat and art window. The workbench needs it to place
 * layers inside the print area; `CanvasEngine` needs it to sit its headline
 * block in the same spot it always has.
 */
export function posterArtRect(width, height, config = {}) {
  const { frame = 'oak', orientation = '' } = config;
  const matInset = frame !== 'none' ? 24 : 12;
  const artInset = matInset + 20;
  return {
    matInset,
    artInset,
    artW: width - artInset * 2,
    artH: height - artInset * 2,
    // Orientation is a shopper choice, not something to infer from the canvas
    // box — a portrait proof can be wider than tall.
    isLandscape: orientation ? orientation === 'landscape' : width > height,
  };
}

/**
 * The framed poster: frame, mat board, art-style ground, orb and paper stock.
 * Returns the art rect so the caller does not recompute it.
 */
export function drawPosterSubstrate(ctx, { width, height, config = {} }) {
  const { artStyle = 'cosmic', frame = 'oak', paper = 'cotton' } = config;

  const rect = posterArtRect(width, height, config);
  const { matInset, artInset, artW, artH, isLandscape } = rect;

  // Outer Frame
  const frameColor =
    frame === 'oak'
      ? '#d4a373'
      : frame === 'black'
        ? '#1e293b'
        : frame === 'white'
          ? '#f8fafc'
          : frame === 'gold'
            ? '#d97706'
            : 'transparent';

  if (frame !== 'none') {
    ctx.fillStyle = frameColor;
    ctx.fillRect(8, 8, width - 16, height - 16);
    ctx.strokeStyle = frame === 'gold' ? '#f59e0b' : 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = frame === 'gold' ? 3 : 2;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    if (frame === 'gold') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(12, 12, width - 24, height - 24);
    }
  }

  // Poster Mat Board
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(matInset, matInset, width - matInset * 2, height - matInset * 2);

  // Artwork Inner Canvas
  const artGrad = ctx.createLinearGradient(
    artInset,
    artInset,
    artInset + artW,
    artInset + artH
  );
  if (artStyle === 'cosmic') {
    artGrad.addColorStop(0, '#0f172a');
    artGrad.addColorStop(0.5, '#312e81');
    artGrad.addColorStop(1, '#0369a1');
  } else if (artStyle === 'sunburst') {
    artGrad.addColorStop(0, '#ea580c');
    artGrad.addColorStop(0.5, '#f59e0b');
    artGrad.addColorStop(1, '#fef08a');
  } else if (artStyle === 'retro') {
    artGrad.addColorStop(0, '#4c1d95');
    artGrad.addColorStop(0.5, '#db2777');
    artGrad.addColorStop(1, '#fbbf24');
  } else if (artStyle === 'botanical') {
    artGrad.addColorStop(0, '#064e3b');
    artGrad.addColorStop(0.5, '#047857');
    artGrad.addColorStop(1, '#6ee7b7');
  } else if (artStyle === 'sunset') {
    artGrad.addColorStop(0, '#831843');
    artGrad.addColorStop(0.5, '#ea580c');
    artGrad.addColorStop(1, '#fde047');
  } else {
    artGrad.addColorStop(0, '#f1f5f9');
    artGrad.addColorStop(1, '#e2e8f0');
  }

  ctx.fillStyle = artGrad;
  ctx.fillRect(artInset, artInset, artW, artH);

  // Sun / Orb Graphic.
  const orbY = isLandscape ? artInset + artH * 0.38 : artInset + 80;
  const orbRadius = isLandscape ? 40 : 50;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(width / 2, orbY, orbRadius, 0, Math.PI * 2);
  ctx.fill();

  // Paper stock: each option has to be visible on the proof, or the
  // upcharge for canvas and luster is selling nothing.
  ctx.save();
  ctx.beginPath();
  if (ctx.rect) ctx.rect(artInset, artInset, artW, artH);
  if (ctx.clip) ctx.clip();
  if (paper === 'canvas') {
    ctx.fillStyle = 'rgba(120, 90, 60, 0.10)';
    ctx.fillRect(artInset, artInset, artW, artH);
    // Woven cross-hatch, one path so the hot loop stays cheap.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gx = artInset; gx < artInset + artW; gx += 5) {
      ctx.moveTo(gx, artInset);
      ctx.lineTo(gx, artInset + artH);
    }
    for (let gy = artInset; gy < artInset + artH; gy += 5) {
      ctx.moveTo(artInset, gy);
      ctx.lineTo(artInset + artW, gy);
    }
    ctx.stroke();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.10)';
    ctx.beginPath();
    for (let gx = artInset + 2; gx < artInset + artW; gx += 5) {
      ctx.moveTo(gx, artInset);
      ctx.lineTo(gx, artInset + artH);
    }
    ctx.stroke();
  } else if (paper === 'luster') {
    const sheen = ctx.createLinearGradient(
      artInset,
      artInset,
      artInset + artW,
      artInset + artH
    );
    sheen.addColorStop(0, 'rgba(255, 255, 255, 0.24)');
    sheen.addColorStop(0.42, 'rgba(255, 255, 255, 0.04)');
    sheen.addColorStop(0.58, 'rgba(255, 255, 255, 0.18)');
    sheen.addColorStop(1, 'rgba(15, 23, 42, 0.16)');
    ctx.fillStyle = sheen;
    ctx.fillRect(artInset, artInset, artW, artH);
  } else {
    // Cotton rag: matte, warm, no specular.
    ctx.fillStyle = 'rgba(252, 243, 226, 0.14)';
    ctx.fillRect(artInset, artInset, artW, artH);
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gy = artInset + 3; gy < artInset + artH; gy += 9) {
      ctx.moveTo(artInset, gy);
      ctx.lineTo(artInset + artW, gy);
    }
    ctx.stroke();
  }
  ctx.restore();

  return rect;
}

/* ----------------------------------------------------------------- apparel -- */

/**
 * The blank garment, in the two phases the monogram sits between: the
 * silhouette goes under it, the woven size tag over it. Call
 * `drawApparelSubstrate` for a blank garment with no copy in between.
 */
export function drawApparelSubstrate(ctx, options) {
  drawApparelGarment(ctx, options);
  drawApparelTag(ctx, options);
}

/** Phase one: backdrop, contact shadow, silhouette, colourway and accent trim. */
export function drawApparelGarment(ctx, { width, height, config = {} }) {
  const {
    garment = 'hoodie',
    color = '#1e293b',
    placement = 'chest',
    size = 'Youth M',
    accentColor = '#f8fafc',
  } = config;

  const garmentScale = APPAREL_SIZE_SCALE[size] ?? 1;
  const shadowColor = shade(color, -0.3);
  const isBack = placement === 'back';
  const cx = width / 2;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, width, height);

  // Garment Shadow
  ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
  ctx.beginPath();
  ctx.ellipse(cx, height - 40, 110 * garmentScale, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Youth sizing scales the whole silhouette about the canvas centre, so
  // every landmark below keeps its original coordinates.
  ctx.save();
  ctx.translate(cx, height / 2);
  ctx.scale(garmentScale, garmentScale);
  ctx.translate(-cx, -height / 2);

  if (garment === 'hoodie' || garment === 'tee') {
    if (garment === 'hoodie' && isBack) {
      // Back view: the hood reads as a solid lump above the yoke.
      ctx.fillStyle = shadowColor;
      ctx.beginPath();
      ctx.ellipse(cx, 66, 44, 26, 0, Math.PI, 0, true);
      ctx.fill();
    }

    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    if (isBack) {
      // A back neckline is shallow and rides high.
      ctx.moveTo(cx - 34, 72);
      ctx.quadraticCurveTo(cx, 78, cx + 34, 72);
    } else {
      ctx.moveTo(cx - 34, 70);
      ctx.quadraticCurveTo(cx, 85, cx + 34, 70);
    }
    ctx.lineTo(cx + 100, 110);
    ctx.lineTo(cx + 135, 175);
    ctx.lineTo(cx + 95, 195);
    ctx.lineTo(cx + 75, 150);
    ctx.lineTo(cx + 70, height - 70);
    ctx.lineTo(cx - 70, height - 70);
    ctx.lineTo(cx - 75, 150);
    ctx.lineTo(cx - 95, 195);
    ctx.lineTo(cx - 135, 175);
    ctx.lineTo(cx - 100, 110);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Collar ribbing
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    if (isBack) {
      ctx.ellipse(cx, 72, 34, 6, 0, 0, Math.PI);
    } else {
      ctx.ellipse(cx, 70, 34, 12, 0, 0, Math.PI);
    }
    ctx.fill();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(cx, isBack ? 72 : 70, 30, isBack ? 4 : 9, 0, 0, Math.PI);
    ctx.fill();

    // Cuffs and hem take the accent colour.
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.moveTo(cx + 135, 175);
    ctx.lineTo(cx + 95, 195);
    ctx.lineTo(cx + 90, 183);
    ctx.lineTo(cx + 130, 163);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 135, 175);
    ctx.lineTo(cx - 95, 195);
    ctx.lineTo(cx - 90, 183);
    ctx.lineTo(cx - 130, 163);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(cx - 70, height - 82, 140, 12);

    ctx.strokeStyle = shadowColor;
    ctx.lineWidth = 1.5;
    if (isBack) {
      // Centre-back seam plus the shoulder yoke — the back's tell.
      ctx.beginPath();
      ctx.moveTo(cx, 80);
      ctx.lineTo(cx, height - 82);
      ctx.moveTo(cx - 92, 104);
      ctx.quadraticCurveTo(cx, 124, cx + 92, 104);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(cx - 74, 120);
      ctx.lineTo(cx - 70, height - 82);
      ctx.moveTo(cx + 74, 120);
      ctx.lineTo(cx + 70, height - 82);
      ctx.stroke();

      if (garment === 'hoodie') {
        // Kangaroo pocket + drawstrings, front only.
        ctx.fillStyle = shadowColor;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(cx - 52, height - 152, 104, 52, 10);
        } else {
          ctx.rect(cx - 52, height - 152, 104, 52);
        }
        ctx.fill();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 12, 82);
        ctx.lineTo(cx - 16, 124);
        ctx.moveTo(cx + 12, 82);
        ctx.lineTo(cx + 16, 124);
        ctx.stroke();
      }
    }
  } else if (garment === 'jacket') {
    // Varsity Bomber Jacket
    ctx.fillStyle = accentColor;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(cx - 34, 70);
    ctx.lineTo(cx + 34, 70);
    ctx.lineTo(cx + 100, 110);
    ctx.lineTo(cx + 135, 185);
    ctx.lineTo(cx + 95, 200);
    ctx.lineTo(cx + 75, 150);
    ctx.lineTo(cx - 75, 150);
    ctx.lineTo(cx - 95, 200);
    ctx.lineTo(cx - 135, 185);
    ctx.lineTo(cx - 100, 110);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - 36, 75);
    ctx.lineTo(cx + 36, 75);
    ctx.lineTo(cx + 70, 140);
    ctx.lineTo(cx + 66, height - 70);
    ctx.lineTo(cx - 66, height - 70);
    ctx.lineTo(cx - 70, 140);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Striped ribbed collar, cuffs and hem
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    ctx.ellipse(cx, 75, 36, 12, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillRect(cx - 66, height - 82, 132, 12);
    ctx.fillStyle = shadowColor;
    ctx.fillRect(cx - 66, height - 78, 132, 4);

    if (!isBack) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx, 85);
      ctx.lineTo(cx, height - 72);
      ctx.stroke();

      for (let snapY = 100; snapY <= height - 85; snapY += 28) {
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(cx, snapY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = shadowColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 62, 104);
      ctx.quadraticCurveTo(cx, 122, cx + 62, 104);
      ctx.stroke();
    }
  } else {
    // Kicks Silhouette
    const midY = height / 2;
    ctx.fillStyle = color;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(cx - 110, midY + 10);
    ctx.lineTo(cx - 110, midY - 40);
    ctx.lineTo(cx - 20, midY - 45);
    ctx.lineTo(cx + 30, midY - 10);
    ctx.lineTo(cx + 110, midY + 15);
    ctx.lineTo(cx + 115, midY + 45);
    ctx.lineTo(cx - 110, midY + 45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Heel tab and toe cap in the accent colour
    ctx.fillStyle = accentColor;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(cx - 116, midY - 44, 22, 34, 6);
    else ctx.rect(cx - 116, midY - 44, 22, 34);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 92, midY + 20, 30, 22, -0.18, Math.PI, 0);
    ctx.fill();

    // Laces
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < 4; i += 1) {
      const lx = cx - 60 + i * 24;
      ctx.moveTo(lx, midY - 36 + i * 6);
      ctx.lineTo(lx + 20, midY - 22 + i * 6);
      ctx.moveTo(lx + 20, midY - 36 + i * 6);
      ctx.lineTo(lx, midY - 22 + i * 6);
    }
    ctx.stroke();
    ctx.lineCap = 'butt';

    // White Midsole
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cx - 115, midY + 35, 235, 22);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 115, midY + 35, 235, 22);
  }

  ctx.restore();
}

/** Phase two: the woven size tag, which is stitched over the print. */
export function drawApparelTag(ctx, { width, height, config = {} }) {
  const { garment = 'hoodie', placement = 'chest', size = 'Youth M' } = config;

  const garmentScale = APPAREL_SIZE_SCALE[size] ?? 1;
  const isBack = placement === 'back';
  const cx = width / 2;
  const label = size.replace('Youth ', 'Y');

  ctx.save();
  ctx.translate(cx, height / 2);
  ctx.scale(garmentScale, garmentScale);
  ctx.translate(-cx, -height / 2);

  ctx.textAlign = 'center';

  if (garment === 'hoodie' || garment === 'tee') {
    ctx.fillStyle = '#f8fafc';
    if (isBack) {
      ctx.fillRect(cx - 18, 84, 36, 14);
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText(label, cx, 94);
    } else {
      ctx.fillRect(cx - 88, height - 96, 36, 14);
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText(label, cx - 70, height - 86);
    }
  } else if (garment === 'jacket') {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx + 34, height - 96, 34, 14);
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText(label, cx + 51, height - 86);
  } else {
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(label, cx + 96, height / 2 + 50);
  }

  ctx.restore();
}

/**
 * The embroidered monogram that used to sit inside the garment branches.
 *
 * It is NOT part of the substrate — the workbench renders it as a text layer
 * instead — but `CanvasEngine` still needs it to paint the legacy studios
 * unchanged, so it ships here rather than being rewritten at the call site.
 * Drawn in the same garment-scaled space as the silhouette.
 */
export function drawApparelMonogram(ctx, { width, height, config = {} }) {
  const {
    garment = 'hoodie',
    color = '#1e293b',
    monogram = 'NOAH',
    placement = 'chest',
    fontFamily = 'sans',
    size = 'Youth M',
    accentColor = '#f8fafc',
    textScale = 1,
  } = config;

  const activeFont = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.sans;
  const garmentScale = APPAREL_SIZE_SCALE[size] ?? 1;
  const stitch = contrastInk(color);
  const isBack = placement === 'back';
  const cx = width / 2;

  ctx.save();
  ctx.translate(cx, height / 2);
  ctx.scale(garmentScale, garmentScale);
  ctx.translate(-cx, -height / 2);

  if (garment === 'hoodie' || garment === 'tee') {
    // Embroidery placement zones
    let embroiderX = cx;
    let embroiderY = 170;
    let fontSize = 18;
    if (placement === 'pocket') {
      embroiderX = cx - 46;
      embroiderY = 132;
      fontSize = 12;
    } else if (isBack) {
      embroiderY = 190;
      fontSize = 26;
    }

    ctx.fillStyle = stitch;
    ctx.font = `bold ${fontSize * textScale}px ${activeFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(monogram.toUpperCase(), embroiderX, embroiderY);

    ctx.font = `${9 * textScale}px sans-serif`;
    ctx.globalAlpha = 0.75;
    ctx.fillText('AUTHENTIC EMBROIDERY', embroiderX, embroiderY + 16);
    ctx.globalAlpha = 1;
  } else if (garment === 'jacket') {
    // Varsity Monogram honours all three placements.
    let embroiderX = cx;
    let embroiderY = 200;
    let fontSize = 28;
    if (placement === 'chest') {
      embroiderX = cx - 30;
      embroiderY = 128;
      fontSize = 16;
    } else if (placement === 'pocket') {
      embroiderX = cx - 40;
      embroiderY = 118;
      fontSize = 11;
    }

    ctx.fillStyle = stitch;
    ctx.font = `bold ${fontSize * textScale}px ${activeFont}`;
    ctx.textAlign = 'center';
    ctx.fillText(monogram.toUpperCase(), embroiderX, embroiderY);
  } else {
    // Placement is real on kicks too: side panel or heel tab.
    const midY = height / 2;
    ctx.textAlign = 'center';
    if (isBack) {
      ctx.save();
      ctx.translate(cx - 105, midY - 27);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = contrastInk(accentColor);
      ctx.font = `bold ${10 * textScale}px ${activeFont}`;
      ctx.fillText(monogram.toUpperCase().slice(0, 8), 0, 0);
      ctx.restore();
    } else {
      ctx.fillStyle = stitch;
      ctx.font = `bold ${14 * textScale}px ${activeFont}`;
      ctx.fillText(monogram.toUpperCase(), cx - 45, midY - 12);
    }
  }

  ctx.restore();
}

/* -------------------------------------------------------------------- book -- */

/**
 * Geometry of the illustration stage on a chapter spread, and of the frosted
 * prose card in the panoramic layout. The caller needs both to sit its prose
 * and its stage banner where they have always been.
 */
export function bookStageRect(width, height, config = {}) {
  const { spreadLayout = 'framed' } = config;
  const isPanoramic = spreadLayout === 'panoramic';
  return {
    isPanoramic,
    stageX: isPanoramic ? 24 : width / 2 + 16,
    stageY: isPanoramic ? 24 : 44,
    stageW: isPanoramic ? width - 48 : width / 2 - 48,
    stageH: isPanoramic ? height - 48 : height - 88,
    cardX: 36,
    cardY: 36,
    cardW: width / 2 - 56,
    cardH: height - 72,
  };
}

/**
 * The book substrate comes in two phases because the product art sits on BOTH
 * sides of the copy: pages and card go under the prose, the illustration stage
 * and the cast go over it (a long prose line really does run under the stage,
 * and the stage is what trims it). Call `drawBookPages` first, then the text,
 * then `drawBookStage` — or `drawBookSubstrate` for a blank book with no copy
 * in between, which is what the workbench wants.
 *
 * `avatar` and `companion` are the already-normalized character records from
 * `core/characterSchema`; pass them to stage the hero and co-star on a chapter
 * spread, or leave them out for an empty stage. No prose, no titles, no page
 * numbers — those are text layers.
 */
export function drawBookSubstrate(ctx, options) {
  drawBookPages(ctx, options);
  drawBookStage(ctx, options);
}

/** Phase one: hardcover, binding and the page stock the copy is printed on. */
export function drawBookPages(
  ctx,
  { width, height, config = {}, time = 0 } = {}
) {
  const {
    theme = 'space',
    sceneId = '',
    timeOfDay = 'midnight',
    weatherEffect = 'none',
    spreadLayout = 'framed',
    activePage = 0,
  } = config;
  const activeSceneId = sceneId || getDefaultSceneForTheme(theme);

  // Book Outer Hardcover Spread
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  if (theme === 'space') {
    gradient.addColorStop(0, '#090d16');
    gradient.addColorStop(0.5, '#1e1b4b');
    gradient.addColorStop(1, '#0f172a');
  } else if (theme === 'magic') {
    gradient.addColorStop(0, '#311042');
    gradient.addColorStop(0.5, '#581c87');
    gradient.addColorStop(1, '#1e1b4b');
  } else if (theme === 'sneaker') {
    gradient.addColorStop(0, '#7f1d1d');
    gradient.addColorStop(0.5, '#991b1b');
    gradient.addColorStop(1, '#450a0a');
  } else {
    // Dino
    gradient.addColorStop(0, '#064e3b');
    gradient.addColorStop(0.5, '#065f46');
    gradient.addColorStop(1, '#022c22');
  }

  // Hardcover Backing with Outer 3D Soft Drop Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.35)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(14, 14, width - 28, height - 28, 14);
  else ctx.rect(14, 14, width - 28, height - 28);
  ctx.fill();
  ctx.restore();

  // Gold Foil Border Trim
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Physical Bound Page Edge Lines along bottom and right (simulates 32 archival pages)
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(22, height - 15);
  ctx.lineTo(width - 22, height - 15);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.25)';
  ctx.beginPath();
  ctx.moveTo(24, height - 17);
  ctx.lineTo(width - 24, height - 17);
  ctx.stroke();

  // Book Spine Center Valley Crease
  const spineGrad = ctx.createLinearGradient(
    width / 2 - 10,
    14,
    width / 2 + 10,
    14
  );
  spineGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  spineGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.32)');
  spineGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = spineGrad;
  ctx.fillRect(width / 2 - 10, 14, 20, height - 28);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.fillRect(width / 2 - 2, 14, 1.5, height - 28);
  ctx.fillRect(width / 2 + 0.5, 14, 1.5, height - 28);

  // Silk Gold Bookmark Ribbon draping from top spine
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(width / 2 - 4, 14);
  ctx.lineTo(width / 2 + 4, 14);
  ctx.lineTo(width / 2 + 5, 80);
  ctx.lineTo(width / 2, 72);
  ctx.lineTo(width / 2 - 5, 80);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  if (activePage === 0) {
    // Front Cover View: Glowing environment backdrop under gold foil
    drawEnvironmentScene(ctx, {
      sceneId: activeSceneId,
      stageX: 18,
      stageY: 18,
      stageW: width - 36,
      stageH: height - 36,
      time,
      theme,
      timeOfDay: 'midnight',
      weatherEffect: 'stars',
      isFullBleed: true,
    });

    // Translucent luxury dark leather vignette overlay
    const coverVignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      40,
      width / 2,
      height / 2,
      width * 0.55
    );
    coverVignette.addColorStop(0, 'rgba(15, 23, 42, 0.65)');
    coverVignette.addColorStop(1, 'rgba(15, 23, 42, 0.88)');
    ctx.fillStyle = coverVignette;
    ctx.fillRect(18, 18, width - 36, height - 36);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(width / 2, 140, 75, 0, Math.PI * 2);
    ctx.stroke();

    // Inner glowing orb
    const orbGrad = ctx.createRadialGradient(
      width / 2,
      140,
      10,
      width / 2,
      140,
      75
    );
    orbGrad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    orbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(width / 2, 140, 75, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (activePage === 1) {
    // Page 1: Official Dedication Page stock
    ctx.fillStyle = '#fffdfa';
    ctx.fillRect(24, 24, width / 2 - 28, height - 48);
    ctx.fillRect(width / 2 + 4, 24, width / 2 - 28, height - 48);
    return;
  }

  // Chapter Pages (2, 3, 4...)
  if (spreadLayout === 'panoramic') {
    // Panoramic Double-Page Spread: Full-bleed environment scene across both pages
    drawEnvironmentScene(ctx, {
      sceneId: activeSceneId,
      stageX: 24,
      stageY: 24,
      stageW: width - 48,
      stageH: height - 48,
      time,
      theme,
      timeOfDay,
      weatherEffect,
      isFullBleed: true,
    });

    // Frosted Vellum Prose Card on Left Page
    const { cardX, cardY, cardW, cardH } = bookStageRect(width, height, config);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, 10);
    else ctx.rect(cardX, cardY, cardW, cardH);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Classic Left Ivory Archival Page + Right Framed Illustration Window
  ctx.fillStyle = '#fcfbf7';
  ctx.fillRect(24, 24, width / 2 - 28, height - 48);
  ctx.fillRect(width / 2 + 4, 24, width / 2 - 28, height - 48);

  // Page borders
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, width / 2 - 28, height - 48);
  ctx.strokeRect(width / 2 + 4, 24, width / 2 - 28, height - 48);

  // Page curvature shading towards gutter spine
  const leftCurv = ctx.createLinearGradient(width / 2 - 28, 24, 24, 24);
  leftCurv.addColorStop(0, 'rgba(15, 23, 42, 0.12)');
  leftCurv.addColorStop(0.18, 'rgba(15, 23, 42, 0.03)');
  leftCurv.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = leftCurv;
  ctx.fillRect(24, 24, width / 2 - 28, height - 48);

  const rightCurv = ctx.createLinearGradient(width / 2 + 4, 24, width - 24, 24);
  rightCurv.addColorStop(0, 'rgba(15, 23, 42, 0.12)');
  rightCurv.addColorStop(0.18, 'rgba(15, 23, 42, 0.03)');
  rightCurv.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = rightCurv;
  ctx.fillRect(width / 2 + 4, 24, width / 2 - 28, height - 48);
}

/**
 * Phase two: the product art that sits ON TOP of the copy — the cover emblem,
 * the framed illustration stage, and the cast standing in it.
 */
export function drawBookStage(
  ctx,
  { width, height, config = {}, time = 0, avatar = null, companion = null } = {}
) {
  const {
    theme = 'space',
    sceneId = '',
    timeOfDay = 'midnight',
    weatherEffect = 'none',
    activePage = 0,
  } = config;

  if (activePage === 0) {
    // Cover Emblem Icon
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(width / 2, 140, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
      const rOut = 12;
      ctx.lineTo(width / 2 + Math.cos(a) * rOut, 140 + Math.sin(a) * rOut);
      const aIn = a + Math.PI / 5;
      const rIn = 5.5;
      ctx.lineTo(width / 2 + Math.cos(aIn) * rIn, 140 + Math.sin(aIn) * rIn);
    }
    ctx.closePath();
    ctx.fill();
    return;
  }

  if (activePage === 1) return;

  const activeSceneId = sceneId || getDefaultSceneForTheme(theme);
  const { isPanoramic, stageX, stageY, stageW, stageH } = bookStageRect(
    width,
    height,
    config
  );

  if (!isPanoramic) {
    // Right Page Framed Illustration Stage with Hyper-Realistic Scene
    drawEnvironmentScene(ctx, {
      sceneId: activeSceneId,
      stageX,
      stageY,
      stageW,
      stageH,
      time,
      theme,
      timeOfDay,
      weatherEffect,
      isFullBleed: false,
    });

    // Gold frame border around illustration stage
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(stageX, stageY, stageW, stageH, 8);
    else ctx.rect(stageX, stageY, stageW, stageH);
    ctx.stroke();
  }

  if (!avatar && !companion) return;

  // Positions for Hero Avatar and Companion Mascot
  const heroX = isPanoramic ? width * 0.62 : stageX + stageW * 0.35;
  const heroY = isPanoramic ? height * 0.7 : stageY + stageH * 0.65;
  const coStarX = isPanoramic ? width * 0.8 : stageX + stageW * 0.68;
  const coStarY = isPanoramic ? height * 0.7 : stageY + stageH * 0.65;

  // Ambient contact shadows grounding characters in scene
  ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
  ctx.beginPath();
  ctx.ellipse(heroX, heroY + 22, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(coStarX, coStarY + 22, 18, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hero and companion come from `drawCharacter`, which is the only
  // renderer that honours every option in `core/characterSchema`.
  if (avatar) {
    HERO_OPTS.x = heroX;
    HERO_OPTS.y = heroY;
    drawHero(ctx, avatar, HERO_OPTS);
  }

  if (companion) {
    COMPANION_OPTS.x = coStarX;
    COMPANION_OPTS.y = coStarY;
    drawCompanion(ctx, companion, COMPANION_OPTS);
  }
}
