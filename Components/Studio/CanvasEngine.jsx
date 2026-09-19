import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import styles from './CanvasEngine.module.css';
import {
  contrastInk,
  normalizeAvatar,
  normalizeCompanion,
  shade,
  SPECIES_ALIASES,
} from './core/characterSchema';
import { drawCompanion, drawHero } from './drawCharacter';
import { getDefaultSceneForTheme } from './sceneEnvironments';
import { drawEnvironmentScene } from './sceneRenderer';
import { DuplicateIcon, FlipHorizontalIcon, TrashIcon } from './StudioSVGs';

/** One map, three modes. It used to be declared separately in each branch. */
const FONT_FAMILIES = {
  serif: "'Cinzel', 'Playfair Display', Georgia, serif",
  sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  display: "'Impact', 'Trebuchet MS', sans-serif",
  cursive: "'Brush Script MT', 'Comic Sans MS', cursive",
};

/** Catalog names, used only when the companion carries no name of its own. */
const CO_STAR_NAMES = {
  finley: 'Finley The Starlight Fox',
  luna: 'Luna The Cosmic Shepherd',
  leo: 'Leo The Story Lion',
  penny: 'Princess Penny',
  dexter: 'Dexter The Dino Explorer',
  carty: 'Carty The Courier',
  sparky: 'Sparky The Sneaker Hound',
};

/** Youth sizing translated into a believable garment scale on the proof. */
const APPAREL_SIZE_SCALE = {
  'Youth XS': 0.86,
  'Youth S': 0.93,
  'Youth M': 1,
  'Youth L': 1.07,
  'Youth XL': 1.14,
};

/** Selection chrome geometry, shared by the painter and the hit test. */
const GRIP_HALF = 24;
const GRIP_SIZE = 3.5;
const KNOB_OFFSET = -34;
const KNOB_RADIUS = 5;

/**
 * Anti-Theft Dual-Side Security Watermarks
 * Prevents AI upscaling and unauthorized taking of custom artwork.
 * Draws subtle angled security ribbons and official preview seals on both left and right spreads/quadrants.
 */
function drawDualWatermarks(ctx, width, height, mode, activePage) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const watermarkText =
    'CART COMMERCE • PROOF / PREVIEW ONLY • DO NOT REPRODUCE';

  if (mode === 'storybook' && activePage >= 1) {
    // 2-Page Book Spread: Dual Watermarks on Left Page AND Right Page
    const leftCenterX = width / 4;
    const rightCenterX = (3 * width) / 4;
    const centerY = height / 2;

    // --- Left Page Watermark ---
    ctx.save();
    ctx.beginPath();
    if (ctx.rect) ctx.rect(24, 24, width / 2 - 28, height - 48);
    if (ctx.clip) ctx.clip();

    ctx.translate(leftCenterX, centerY);
    ctx.rotate(-0.45); // ~26 degree angle

    ctx.fillStyle = 'rgba(100, 116, 139, 0.16)';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';

    // Repeating diagonal lines
    for (let offset = -150; offset <= 150; offset += 50) {
      ctx.fillText(watermarkText, 0, offset);
    }

    // Centered Left Protected Proof Stamp
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillText('PROTECTED PROOF', 0, 0);
    ctx.restore();

    // --- Right Page Watermark ---
    ctx.save();
    ctx.beginPath();
    if (ctx.rect) ctx.rect(width / 2 + 4, 24, width / 2 - 28, height - 48);
    if (ctx.clip) ctx.clip();

    ctx.translate(rightCenterX, centerY);
    ctx.rotate(-0.45);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';

    for (let offset = -150; offset <= 150; offset += 50) {
      ctx.fillText(watermarkText, 0, offset);
    }

    // Centered Right Protected Proof Stamp
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 9px system-ui, sans-serif';
    ctx.fillText('PROTECTED PROOF', 0, 0);
    ctx.restore();
  } else {
    // Single page (Cover, Poster, Apparel): Watermarks on Left & Right Quadrants
    const leftCenterX = width * 0.28;
    const rightCenterX = width * 0.72;
    const centerY = height / 2;

    // Left Quadrant
    ctx.save();
    ctx.translate(leftCenterX, centerY);
    ctx.rotate(-0.4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    for (let offset = -130; offset <= 130; offset += 55) {
      ctx.fillText(watermarkText, 0, offset);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 8px system-ui, sans-serif';
    ctx.fillText('SAMPLE ONLY', 0, 0);
    ctx.restore();

    // Right Quadrant
    ctx.save();
    ctx.translate(rightCenterX, centerY);
    ctx.rotate(-0.4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    for (let offset = -130; offset <= 130; offset += 55) {
      ctx.fillText(watermarkText, 0, offset);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = 'bold 8px system-ui, sans-serif';
    ctx.fillText('SAMPLE ONLY', 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * High-performance HTML5 Canvas 2D + SVG composite engine.
 * Renders print-ready proof previews for Storybooks, Framed Posters, and Kids' Apparel.
 * Zero external binary dependencies (no node-canvas, 100% SSR safe).
 */
export function CanvasEngine({
  width = 540,
  height = 420,
  mode = 'storybook',
  config = {},
  selectedSticker = null,
  stickers = [],
  onUpdateStickers = () => {},
  onCanvasClick = null,
  className = '',
  isAnimated = true,
  canvasRef: forwardedCanvasRef = null,
  exportOptions = null,
}) {
  const canvasRef = useRef(null);
  const timeRef = useRef(0);
  // Grip/knob drag state lives in a ref: it changes every pointer frame and
  // must not re-render the component.
  const transformDragRef = useRef(null);
  // Reused across frames so the render loop stays allocation-free.
  const heroOptsRef = useRef({ x: 0, y: 0 });
  const companionOptsRef = useRef({ x: 0, y: 0 });

  const watermark = exportOptions?.watermark ?? true;

  // Studios need the real element for toDataURL thumbnails, but the internal
  // ref must keep working for the render loop and the gesture hook.
  const attachCanvas = useCallback(
    (node) => {
      canvasRef.current = node;
      if (forwardedCanvasRef) forwardedCanvasRef.current = node;
    },
    [forwardedCanvasRef]
  );

  // Gesture handling for mouse and touch interactions
  const {
    activeStickerId,
    setActiveStickerId,
    hoveredStickerId,
    handlers: gestureHandlers,
  } = useCanvasGestures({
    canvasRef,
    stickers,
    selectedSticker,
    onUpdateStickers,
    onCanvasClick,
  });

  // Normalized once per config change rather than once per animation frame —
  // `normalizeAvatar`/`normalizeCompanion` allocate, and this runs inside rAF.
  const heroAvatar = useMemo(
    () => normalizeAvatar(config.avatar),
    [config.avatar]
  );

  const heroCompanion = useMemo(() => {
    const source = config.companion;
    const resolved = normalizeCompanion(source);
    if (!source?.species && config.mascotCoStar) {
      resolved.species =
        SPECIES_ALIASES[config.mascotCoStar] ?? config.mascotCoStar;
    }
    if (!source?.name) {
      const catalog = CO_STAR_NAMES[resolved.species] ?? CO_STAR_NAMES.leo;
      resolved.name = catalog.split(' ')[0];
    }
    return resolved;
  }, [config.companion, config.mascotCoStar]);

  // Draw sticker vector primitives on Canvas 2D
  const drawSticker = useCallback((ctx, sticker, isSelected = false) => {
    ctx.save();
    ctx.translate(sticker.x, sticker.y);
    if (sticker.rotation) {
      ctx.rotate((sticker.rotation * Math.PI) / 180);
    }
    const sx = (sticker.scale || 1) * (sticker.flipX ? -1 : 1);
    const sy = sticker.scale || 1;
    ctx.scale(sx, sy);

    switch (sticker.type) {
      case 'mascot_luna': {
        // Luna The Cosmic Shepherd Astronaut Mascot Sticker
        // Astronaut spacesuit
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-16, 4, 32, 22, 6);
        ctx.fill();
        ctx.stroke();

        // Navy suit shoulder pads & chest trim
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-16, 6, 5, 12);
        ctx.fillRect(11, 6, 5, 12);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-6, 8, 12, 3);

        // Gold collar star badge
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 15, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Anatolian curled astronaut tail
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(14, 18, 7, 0, Math.PI * 1.5, true);
        ctx.stroke();
        ctx.lineCap = 'butt';

        // Shepherd Head & Muzzle
        ctx.fillStyle = '#e5a95d'; // Warm Anatolian fawn fur
        ctx.beginPath();
        ctx.arc(0, -5, 14, 0, Math.PI * 2);
        ctx.fill();

        // Dark charcoal muzzle mask
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.ellipse(0, -2, 7, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Distinctive pink nose leather blaze
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.ellipse(0, -4, 2, 1.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose tip & mouth
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(0, -3, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Loving amber eyes
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(-4.5, -8, 1.8, 0, Math.PI * 2);
        ctx.arc(4.5, -8, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4, -8.5, 0.7, 0, Math.PI * 2);
        ctx.arc(5, -8.5, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Anatolian folded drop ears
        ctx.fillStyle = '#b47834';
        ctx.beginPath();
        ctx.ellipse(-13, -8, 4, 7, -0.3, 0, Math.PI * 2);
        ctx.ellipse(13, -8, 4, 7, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Cosmic glass bubble helmet
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -5, 18, 0, Math.PI * 2);
        ctx.stroke();

        // Helmet shine reflection
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -5, 16, -2.4, -1.4);
        ctx.stroke();
        break;
      }
      case 'mascot_finley': {
        // Finley The Starlight Fox Mascot Sticker
        // Celestial bushy tail with snowy white tip
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(14, 10, 8, 15, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(17, 2, 5, 0, Math.PI * 2);
        ctx.fill();

        // Amber body
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.roundRect(-10, 4, 20, 18, 6);
        ctx.fill();

        // Cream chest ruff
        ctx.fillStyle = '#fff7ed';
        ctx.beginPath();
        ctx.ellipse(0, 10, 6, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Flowing celestial sky-blue scarf with gold stars
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(-12, 1, 24, 7, 3.5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(6, 6);
        ctx.lineTo(13, 17);
        ctx.lineTo(7, 18);
        ctx.lineTo(2, 7);
        ctx.closePath();
        ctx.fill();

        // Scarf golden star pins
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-5, 4.5, 1.2, 0, Math.PI * 2);
        ctx.arc(2, 4.5, 1.2, 0, Math.PI * 2);
        ctx.arc(9, 12, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Large pointed fennec ears
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.moveTo(-12, -8);
        ctx.lineTo(-18, -26);
        ctx.lineTo(-4, -12);
        ctx.closePath();
        ctx.moveTo(12, -8);
        ctx.lineTo(18, -26);
        ctx.lineTo(4, -12);
        ctx.closePath();
        ctx.fill();

        // Ear interior cream fluff
        ctx.fillStyle = '#fff7ed';
        ctx.beginPath();
        ctx.moveTo(-11, -9);
        ctx.lineTo(-16, -22);
        ctx.lineTo(-5, -12);
        ctx.closePath();
        ctx.moveTo(11, -9);
        ctx.lineTo(16, -22);
        ctx.lineTo(5, -12);
        ctx.closePath();
        ctx.fill();

        // Fox Head
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(0, -7, 13, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cheeks white fluff
        ctx.fillStyle = '#fff7ed';
        ctx.beginPath();
        ctx.ellipse(-8, -4, 5, 4, -0.2, 0, Math.PI * 2);
        ctx.ellipse(8, -4, 5, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Muzzle & tiny dark nose
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(0, -4, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Soulful celestial eyes
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(-4.5, -9, 1.6, 2.2, 0, 0, Math.PI * 2);
        ctx.ellipse(4.5, -9, 1.6, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-4, -9.5, 0.8, 0, Math.PI * 2);
        ctx.arc(5, -9.5, 0.8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'mascot_leo': {
        // Leo The Story Lion Mascot Sticker
        // Fluffy sunburst mane
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
          const angle = (i * Math.PI) / 6;
          const r = 21;
          ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          const rInner = 16;
          const nextAngle = angle + Math.PI / 12;
          ctx.lineTo(
            Math.cos(nextAngle) * rInner,
            Math.sin(nextAngle) * rInner
          );
        }
        ctx.closePath();
        ctx.fill();

        // Golden Lion Face
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 1, 13, 0, Math.PI * 2);
        ctx.fill();

        // Round lion ears
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(-11, -9, 4, 0, Math.PI * 2);
        ctx.arc(11, -9, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-11, -9, 2, 0, Math.PI * 2);
        ctx.arc(11, -9, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tilted red artist beret
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(-4, -13, 10, 4.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-6, -18, 1.5, 3); // Beret stem

        // Lion muzzle & nose
        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.ellipse(0, 5, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(0, 3, 2.2, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cute smiling mouth
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(-2, 6, 2, 0.2, Math.PI * 0.9);
        ctx.arc(2, 6, 2, 0.1, Math.PI * 0.8);
        ctx.stroke();

        // Eyes
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(-4.5, 0, 1.8, 0, Math.PI * 2);
        ctx.arc(4.5, 0, 1.8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'mascot_penny': {
        // Princess Penny Fairytale Mascot Sticker
        // Blonde curls
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(-10, -3, 7, 0, Math.PI * 2);
        ctx.arc(10, -3, 7, 0, Math.PI * 2);
        ctx.arc(0, -6, 12, 0, Math.PI * 2);
        ctx.fill();

        // Face
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        // Rosy blush cheeks
        ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
        ctx.beginPath();
        ctx.arc(-5.5, 3, 2.2, 0, Math.PI * 2);
        ctx.arc(5.5, 3, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Royal Tiara
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-9, -7);
        ctx.lineTo(-5, -14);
        ctx.lineTo(0, -9);
        ctx.lineTo(5, -14);
        ctx.lineTo(9, -7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Tiara Ruby
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -10, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Purple eyes & sweet smile
        ctx.fillStyle = '#4c1d95';
        ctx.beginPath();
        ctx.arc(-3.5, 0, 1.4, 0, Math.PI * 2);
        ctx.arc(3.5, 0, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#db2777';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 3.5, 2.5, 0.1, Math.PI - 0.1);
        ctx.stroke();

        // Magic starlight sparkles around tiara
        ctx.fillStyle = '#fbcfe8';
        ctx.beginPath();
        ctx.arc(-14, -12, 1.5, 0, Math.PI * 2);
        ctx.arc(14, -12, 1.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'mascot_dexter': {
        // Dexter The Dino Explorer Mascot Sticker
        // Green dino body & tail
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(-12, 2, 24, 18, 6);
        ctx.fill();

        // Spikes on back
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.moveTo(10, 4);
        ctx.lineTo(16, 7);
        ctx.lineTo(10, 10);
        ctx.moveTo(10, 12);
        ctx.lineTo(17, 15);
        ctx.lineTo(10, 18);
        ctx.fill();

        // Dino head
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.ellipse(0, -6, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Lighter snout
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.ellipse(0, -3, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nostrils & eyes
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.arc(-2, -4, 1, 0, Math.PI * 2);
        ctx.arc(2, -4, 1, 0, Math.PI * 2);
        ctx.arc(-4.5, -9, 1.8, 0, Math.PI * 2);
        ctx.arc(4.5, -9, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-4, -9.5, 0.7, 0, Math.PI * 2);
        ctx.arc(5, -9.5, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Safari Explorer Hat
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(0, -13, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(-7, -19, 14, 8, [5, 5, 0, 0]);
        ctx.fill();

        // Hat band
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-7, -15, 14, 2);
        break;
      }
      case 'mascot_carty': {
        // Carty The Courier Bot Mascot Sticker
        // Head Chassis
        ctx.fillStyle = '#cbd5e1';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-14, -10, 28, 22, 6);
        ctx.fill();
        ctx.stroke();

        // Antenna with glowing beacon
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(0, -18);
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, -19, 3, 0, Math.PI * 2);
        ctx.fill();

        // Dark Visor
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-10, -6, 20, 12, 3);
        ctx.fill();

        // Glowing Cyan Eyes
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(-4.5, 0, 2.2, 0, Math.PI * 2);
        ctx.arc(4.5, 0, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Ear bolts
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-17, -4, 3, 8);
        ctx.fillRect(14, -4, 3, 8);
        break;
      }
      case 'mascot_sparky': {
        // Sparky The Sneaker Hound Mascot Sticker
        // Hound Head
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Floppy ears
        ctx.fillStyle = '#c2410c';
        ctx.beginPath();
        ctx.ellipse(-12, 1, 4, 7, -0.3, 0, Math.PI * 2);
        ctx.ellipse(12, 1, 4, 7, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Backwards Red Cap
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, -4, 12, Math.PI, 0, false);
        ctx.fill();
        ctx.fillRect(-8, -13, 16, 3);

        // Dark Sunglasses
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-10, -3, 9, 6, 2);
        ctx.roundRect(1, -3, 9, 6, 2);
        ctx.fill();

        // Sunglass shine
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-8, -1);
        ctx.lineTo(-3, -1);
        ctx.moveTo(3, -1);
        ctx.lineTo(8, -1);
        ctx.stroke();

        // Muzzle & nose
        ctx.fillStyle = '#ffedd5';
        ctx.beginPath();
        ctx.ellipse(0, 5, 5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(0, 3.5, 1.6, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'badge_hero': {
        // Story Hero Star Shield Badge
        ctx.fillStyle = '#1e40af';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-18, -18);
        ctx.lineTo(18, -18);
        ctx.lineTo(18, 4);
        ctx.quadraticCurveTo(18, 20, 0, 26);
        ctx.quadraticCurveTo(-18, 20, -18, 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Center 5-Point Star
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(
            Math.cos(((18 + i * 72) * Math.PI) / 180) * 9,
            -3 - Math.sin(((18 + i * 72) * Math.PI) / 180) * 9
          );
          ctx.lineTo(
            Math.cos(((54 + i * 72) * Math.PI) / 180) * 4,
            -3 - Math.sin(((54 + i * 72) * Math.PI) / 180) * 4
          );
        }
        ctx.closePath();
        ctx.fill();

        // "HERO" Banner
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-14, 8, 28, 9);
        ctx.fillStyle = '#1e40af';
        ctx.font = 'bold 7px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HERO', 0, 15);
        break;
      }
      case 'badge_brave': {
        // Brave Heart Crest Badge
        // Golden laurels
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-14, 0, 12, 0.4, 2.7);
        ctx.arc(14, 0, 12, 0.4, 2.7, true);
        ctx.stroke();

        // Heart
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-6, -2, 6, Math.PI, 0, false);
        ctx.arc(6, -2, 6, Math.PI, 0, false);
        ctx.lineTo(0, 14);
        ctx.closePath();
        ctx.fill();

        // Mini gold crown on heart
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(-7, -5);
        ctx.lineTo(-8, -12);
        ctx.lineTo(-3, -8);
        ctx.lineTo(0, -14);
        ctx.lineTo(3, -8);
        ctx.lineTo(8, -12);
        ctx.lineTo(7, -5);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'badge_starlight': {
        // Starlight Constellation Medallion
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner glowing starlight ring
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.stroke();

        // 8-Point Compass Star
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const r = i % 2 === 0 ? 12 : 4;
          const a = (i * Math.PI) / 4;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();

        // Central cyan gem
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'badge_certified': {
        // Official Archival Seal Badge with ribbons
        // Ribbon tails
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(-8, 12);
        ctx.lineTo(-12, 26);
        ctx.lineTo(-6, 22);
        ctx.lineTo(0, 26);
        ctx.lineTo(-3, 14);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(8, 12);
        ctx.lineTo(12, 26);
        ctx.lineTo(6, 22);
        ctx.lineTo(0, 26);
        ctx.lineTo(3, 14);
        ctx.fill();

        // Serrated Gold Medallion
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 16; i++) {
          const angle = (i * Math.PI) / 8;
          const r = i % 2 === 0 ? 19 : 16;
          ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner seal circle
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef3c7';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PROOF', 0, 2);
        break;
      }
      case 'badge_dino_scout': {
        // Dino Scout Explorer Badge
        ctx.fillStyle = '#064e3b';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          ctx.lineTo(Math.cos(angle) * 19, Math.sin(angle) * 19);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3-Toed Dino Footprint
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(0, 2, 4.5, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(-5, -6, 2.5, 4.5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(0, -8, 2.5, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(5, -6, 2.5, 4.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'bubble': {
        // Interactive Storybook Speech Bubble
        const text = sticker.text || 'Adventure time!';
        ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
        const textWidth = ctx.measureText ? ctx.measureText(text).width : 60;
        const bWidth = Math.max(70, textWidth + 24);
        const bHeight = 32;

        // Draw bubble body
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-bWidth / 2, -bHeight / 2 - 4, bWidth, bHeight, 10);
        ctx.fill();
        ctx.stroke();

        // Speech pointer tail
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-10, bHeight / 2 - 4);
        ctx.lineTo(-18, bHeight / 2 + 10);
        ctx.lineTo(-2, bHeight / 2 - 4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Patch inner tail seam
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, bHeight / 2 - 6, 9, 3);

        // Draw Speech Bubble Text
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (sticker.flipX) {
          ctx.save();
          ctx.scale(-1, 1);
          ctx.fillText(text, 0, -4);
          ctx.restore();
        } else {
          ctx.fillText(text, 0, -4);
        }
        break;
      }
      case 'rose': {
        // Antoine de Saint-Exupéry's Celestial Rose Under Glass
        // Mahogany base
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(0, 16, 16, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glass cloche dome
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -2, 13, Math.PI, 0, false);
        ctx.lineTo(13, 16);
        ctx.lineTo(-13, 16);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Rose stem & leaves
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 14);
        ctx.quadraticCurveTo(2, 6, 0, 0);
        ctx.stroke();
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(-4, 6, 3, 1.5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(4, 8, 3, 1.5, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Crimson Rose Blossom
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(0, -2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-2, -3, 3.5, 0, Math.PI * 2);
        ctx.arc(2, -3, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Fallen petal
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.ellipse(6, 15, 2.5, 1.2, 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'compass': {
        // Antique Explorer Brass Compass
        ctx.fillStyle = '#fef3c7';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Top ring loop
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -21, 4, 0, Math.PI * 2);
        ctx.stroke();

        // Compass Rose Cardinal Lines
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(0, 14);
        ctx.moveTo(-14, 0);
        ctx.lineTo(14, 0);
        ctx.stroke();

        // North needle (Red) & South needle (Silver)
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-3, 0);
        ctx.lineTo(0, -14);
        ctx.lineTo(3, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-3, 0);
        ctx.lineTo(0, 14);
        ctx.lineTo(3, 0);
        ctx.closePath();
        ctx.fill();

        // Center Brass Rivet
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'magic_wand': {
        // Fairytale Magic Wand
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-14, 14);
        ctx.lineTo(8, -8);
        ctx.stroke();
        ctx.lineCap = 'butt';

        // Starlight Tip
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(
            8 + Math.cos(((18 + i * 72) * Math.PI) / 180) * 10,
            -8 - Math.sin(((18 + i * 72) * Math.PI) / 180) * 10
          );
          ctx.lineTo(
            8 + Math.cos(((54 + i * 72) * Math.PI) / 180) * 4.5,
            -8 - Math.sin(((54 + i * 72) * Math.PI) / 180) * 4.5
          );
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Magic burst sparkles
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(19, -15, 1.8, 0, Math.PI * 2);
        ctx.arc(17, -2, 1.4, 0, Math.PI * 2);
        ctx.arc(2, -18, 1.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'treasure_chest': {
        // Heirloom Treasure Chest
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-16, -2, 32, 18, 4);
        ctx.fill();
        ctx.stroke();

        // Chest Lid Curved
        ctx.beginPath();
        ctx.arc(0, -2, 16, Math.PI, 0, false);
        ctx.fill();
        ctx.stroke();

        // Glowing treasure inside lid
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(0, -2, 13, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sparkling Jewels
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-5, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(4, -2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Golden clasp & keyhole
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-3, 3, 6, 7);
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.arc(0, 6, 1, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'planet': {
        // Cosmic Ringed Planet (Saturn)
        // Planet Sphere
        const pGrad = ctx.createLinearGradient(-12, -12, 12, 12);
        pGrad.addColorStop(0, '#7c3aed');
        pGrad.addColorStop(0.5, '#ec4899');
        pGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();

        // Planetary Rings
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 24, 6, -0.4, 0, Math.PI * 2);
        ctx.stroke();

        // Little Orbiting Moon
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(17, -11, 2.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'star': {
        // Gold foil star
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(
            Math.cos(((18 + i * 72) * Math.PI) / 180) * 18,
            -Math.sin(((18 + i * 72) * Math.PI) / 180) * 18
          );
          ctx.lineTo(
            Math.cos(((54 + i * 72) * Math.PI) / 180) * 8,
            -Math.sin(((54 + i * 72) * Math.PI) / 180) * 8
          );
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'crown': {
        // Royal Crown
        ctx.fillStyle = '#fbbf24';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, 10);
        ctx.lineTo(-20, -10);
        ctx.lineTo(-8, -2);
        ctx.lineTo(0, -16);
        ctx.lineTo(8, -2);
        ctx.lineTo(20, -10);
        ctx.lineTo(18, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Gems
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -16, 2.5, 0, Math.PI * 2);
        ctx.arc(-20, -10, 2.5, 0, Math.PI * 2);
        ctx.arc(20, -10, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'rocket': {
        // Space Rocket
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -22);
        ctx.quadraticCurveTo(12, -10, 12, 10);
        ctx.lineTo(-12, 10);
        ctx.quadraticCurveTo(-12, -10, 0, -22);
        ctx.fill();
        ctx.stroke();

        // Fins
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-12, 4);
        ctx.lineTo(-20, 14);
        ctx.lineTo(-12, 12);
        ctx.closePath();
        ctx.moveTo(12, 4);
        ctx.lineTo(20, 14);
        ctx.lineTo(12, 12);
        ctx.closePath();
        ctx.fill();

        // Porthole
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, -4, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'sneaker': {
        // Sneaker Stamp
        ctx.fillStyle = '#dc2626';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-18, 8);
        ctx.lineTo(-18, -4);
        ctx.lineTo(-4, -6);
        ctx.lineTo(8, 2);
        ctx.lineTo(20, 8);
        ctx.lineTo(20, 14);
        ctx.lineTo(-18, 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Sole
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-18, 10, 38, 4);
        break;
      }
      case 'sparkle': {
        // Magic twinkle
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.quadraticCurveTo(0, 0, 16, 0);
        ctx.quadraticCurveTo(0, 0, 0, 16);
        ctx.quadraticCurveTo(0, 0, -16, 0);
        ctx.quadraticCurveTo(0, 0, 0, -16);
        ctx.fill();
        break;
      }
      case 'castle': {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-12, -4, 24, 18);
        ctx.fillStyle = '#475569';
        ctx.fillRect(-15, -12, 8, 26);
        ctx.fillRect(7, -12, 8, 26);
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(-15, -12);
        ctx.lineTo(-11, -20);
        ctx.lineTo(-7, -12);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(7, -12);
        ctx.lineTo(11, -20);
        ctx.lineTo(15, -12);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-4, 4, 8, 10);
        break;
      }
      case 'spaceship': {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(-3, 14);
        ctx.lineTo(0, 22);
        ctx.lineTo(3, 14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(-8, 6);
        ctx.lineTo(-16, 15);
        ctx.lineTo(-6, 14);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(8, 6);
        ctx.lineTo(16, 15);
        ctx.lineTo(6, 14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.quadraticCurveTo(-8, -4, -8, 14);
        ctx.lineTo(8, 14);
        ctx.quadraticCurveTo(8, -4, 0, -18);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, -2, 4.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'crystal': {
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.moveTo(0, -18);
        ctx.lineTo(8, -6);
        ctx.lineTo(5, 16);
        ctx.lineTo(-5, 16);
        ctx.lineTo(-8, -6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.moveTo(-8, -6);
        ctx.lineTo(-15, 0);
        ctx.lineTo(-10, 14);
        ctx.lineTo(-5, 16);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.moveTo(8, -6);
        ctx.lineTo(15, 0);
        ctx.lineTo(10, 14);
        ctx.lineTo(5, 16);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'mushroom': {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(-5, 2, 10, 14);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 2, 16, Math.PI, 0, false);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-6, -4, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(6, -5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -8, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'rainbow': {
        const rCols = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
        rCols.forEach((col, idx) => {
          ctx.strokeStyle = col;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 14, 18 - idx * 2.8, Math.PI, 0, false);
          ctx.stroke();
        });
        break;
      }
      case 'dragon_egg': {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#a7f3d0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-6, -4);
        ctx.quadraticCurveTo(0, 0, 6, -4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-8, 3);
        ctx.quadraticCurveTo(0, 7, 8, 3);
        ctx.stroke();
        break;
      }
      case 'heart':
      default: {
        // Heart Badge
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(-6, -4, 7, Math.PI, 0, false);
        ctx.arc(6, -4, 7, Math.PI, 0, false);
        ctx.lineTo(0, 14);
        ctx.closePath();
        ctx.fill();
        break;
      }
    }

    // Draw selection bounding box if active
    if (isSelected) {
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      if (ctx.setLineDash) ctx.setLineDash([4, 3]);
      ctx.strokeRect(-24, -24, 48, 48);
      if (ctx.setLineDash) ctx.setLineDash([]);

      // Corner resize grips — draggable, see `hitTransformHandle`.
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i += 1) {
        const cx = i === 0 || i === 3 ? -GRIP_HALF : GRIP_HALF;
        const cy = i < 2 ? -GRIP_HALF : GRIP_HALF;
        ctx.fillRect(
          cx - GRIP_SIZE,
          cy - GRIP_SIZE,
          GRIP_SIZE * 2,
          GRIP_SIZE * 2
        );
        ctx.strokeRect(
          cx - GRIP_SIZE,
          cy - GRIP_SIZE,
          GRIP_SIZE * 2,
          GRIP_SIZE * 2
        );
      }

      // Rotation stem & knob — draggable.
      ctx.beginPath();
      ctx.moveTo(0, -GRIP_HALF);
      ctx.lineTo(0, KNOB_OFFSET);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, KNOB_OFFSET, KNOB_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }, []);

  // Main Render Routine
  const renderCanvas = useCallback(
    (time = 0) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr =
        typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      ctx.clearRect(0, 0, width, height);

      if (mode === 'storybook') {
        const {
          childName = 'Adventurer',
          theme = 'space',
          sceneId = '',
          timeOfDay = 'midnight',
          weatherEffect = 'none',
          spreadLayout = 'framed',
          activePage = 0,
          dedication = 'Stay curious, brave, and kind.',
          fontFamily = 'serif',
          textColor = '#334155',
          chapterProse = {},
          showBleed = false,
        } = config;
        const activeSceneId = sceneId || getDefaultSceneForTheme(theme);
        const avatar = heroAvatar;
        const companion = heroCompanion;

        const activeFont = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.serif;

        // A shopper-supplied companion name wins over the catalog title.
        const coStarLabel =
          config.companion?.name ||
          CO_STAR_NAMES[companion.species] ||
          CO_STAR_NAMES.leo;

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

          // Hero Name Typography
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold 26px ${activeFont}`;
          ctx.textAlign = 'center';
          ctx.fillText(`${childName.toUpperCase()}'S`, width / 2, 250);

          // Story Title Typography
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 20px sans-serif';
          const titleText =
            theme === 'space'
              ? 'COSMIC GALAXY QUEST'
              : theme === 'magic'
                ? 'ENCHANTED KINGDOM'
                : theme === 'sneaker'
                  ? 'SNEAKERHEAD ODYSSEY'
                  : 'DINOSAUR WONDER';
          ctx.fillText(titleText, width / 2, 280);

          // Subtitle & Edition
          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px sans-serif';
          ctx.fillText('A Personalized Heirloom Keepsake Book', width / 2, 310);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillText(
            `STARRING ${childName.toUpperCase()} & ${coStarLabel.toUpperCase()}`,
            width / 2,
            335
          );

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
            ctx.lineTo(
              width / 2 + Math.cos(a) * rOut,
              140 + Math.sin(a) * rOut
            );
            const aIn = a + Math.PI / 5;
            const rIn = 5.5;
            ctx.lineTo(
              width / 2 + Math.cos(aIn) * rIn,
              140 + Math.sin(aIn) * rIn
            );
          }
          ctx.closePath();
          ctx.fill();
        } else if (activePage === 1) {
          // Page 1: Official Dedication Page
          ctx.fillStyle = '#fffdfa';
          ctx.fillRect(24, 24, width / 2 - 28, height - 48);
          ctx.fillRect(width / 2 + 4, 24, width / 2 - 28, height - 48);

          // Left Page Decorative Crest
          ctx.fillStyle = '#1e293b';
          ctx.font = `bold 14px ${activeFont}`;
          ctx.textAlign = 'center';
          ctx.fillText('OFFICIAL CERTIFICATE', width / 4 + 10, 90);
          ctx.font = '11px sans-serif';
          ctx.fillStyle = '#64748b';
          ctx.fillText('OF EXTRAORDINARY BRAVERY', width / 4 + 10, 110);

          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(50, 130);
          ctx.lineTo(width / 2 - 30, 130);
          ctx.stroke();

          ctx.fillStyle = '#0f172a';
          ctx.font = `italic 13px ${activeFont}`;
          ctx.fillText(`Presented with honor to`, width / 4 + 10, 165);
          ctx.font = `bold 18px ${activeFont}`;
          ctx.fillStyle = '#2563eb';
          ctx.fillText(childName, width / 4 + 10, 200);

          // Right Page: Dedication Note
          ctx.fillStyle = '#0f172a';
          ctx.font = `bold 13px ${activeFont}`;
          ctx.textAlign = 'center';
          ctx.fillText('SPECIAL DEDICATION', (3 * width) / 4 - 10, 90);

          ctx.fillStyle = textColor;
          ctx.font = `italic 13px ${activeFont}`;
          const words = dedication.split(' ');
          let line = '';
          let y = 140;
          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > width / 2 - 70 && n > 0) {
              ctx.fillText(line, (3 * width) / 4 - 10, y);
              line = words[n] + ' ';
              y += 24;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line, (3 * width) / 4 - 10, y);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px sans-serif';
          ctx.fillText(
            'Printed on FSC Archival Paper • Page 1',
            (3 * width) / 4 - 10,
            height - 42
          );
        } else {
          // Chapter Pages (2, 3, 4...)
          const chapterNum = activePage - 1;
          const customChapter = chapterProse && chapterProse[chapterNum];
          const defaultTitle =
            chapterNum === 1
              ? `${childName}'s Journey Begins`
              : chapterNum === 2
                ? `The Secret of the Starlight Compass`
                : `The Grand Victory Celebration`;
          const chapterTitle = customChapter?.title || defaultTitle;
          const defaultLines =
            chapterNum === 1
              ? [
                  `The morning sun peered into ${childName}'s window.`,
                  `Today wasn't an ordinary morning in the neighborhood.`,
                  `A golden letter arrived with an urgent royal seal.`,
                  `"Wake up, ${childName}!" chimed ${coStarLabel}.`,
                  `"The adventure needs someone bold enough to lead!"`,
                ]
              : chapterNum === 2
                ? [
                    `Higher and higher they climbed above the velvet clouds.`,
                    `${childName} reached out a steady hand to hold the compass.`,
                    `The glowing constellation aligned directly with their path.`,
                    `"I knew you had it in you!" cheered ${coStarLabel} with joy.`,
                    `Together, there was no mystery they could not conquer.`,
                  ]
                : [
                    `The entire kingdom gathered to celebrate ${childName}'s triumph.`,
                    `A crown of starlight was placed gently upon their head.`,
                    `"Never forget this moment," whispered ${coStarLabel} warmly.`,
                    `Because in every heart that dares to dream,`,
                    `a magnificent adventure is always waiting to be written.`,
                  ];
          const chapterLines = customChapter?.lines || defaultLines;

          const isPanoramic = spreadLayout === 'panoramic';

          if (isPanoramic) {
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
            const cardX = 36;
            const cardY = 36;
            const cardW = width / 2 - 56;
            const cardH = height - 72;

            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(cardX, cardY, cardW, cardH, 10);
            else ctx.rect(cardX, cardY, cardW, cardH);
            ctx.fill();
            ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Prose typography on frosted card
            ctx.fillStyle = '#b45309';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`CHAPTER ${chapterNum}`, cardX + 16, cardY + 28);

            ctx.fillStyle = '#0f172a';
            ctx.font = `bold 16px ${activeFont}`;
            ctx.fillText(chapterTitle, cardX + 16, cardY + 52);

            // Illuminated Drop-Cap
            const firstLine = chapterLines[0] || '';
            const initialChar = firstLine.slice(0, 1).toUpperCase();
            const restFirstLine = firstLine.slice(1);

            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(cardX + 16, cardY + 66, 26, 26, 4);
            else ctx.rect(cardX + 16, cardY + 66, 26, 26);
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.fillStyle = '#fbbf24';
            ctx.font = `bold 18px ${activeFont}`;
            ctx.textAlign = 'center';
            ctx.fillText(initialChar, cardX + 29, cardY + 85);

            ctx.fillStyle = textColor;
            ctx.font = `12px ${activeFont}`;
            ctx.textAlign = 'left';
            ctx.fillText(restFirstLine, cardX + 48, cardY + 83);

            let lineY = cardY + 108;
            for (let i = 1; i < chapterLines.length; i++) {
              ctx.fillText(chapterLines[i], cardX + 16, lineY);
              lineY += 22;
            }
            ctx.restore();
          } else {
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
            const leftCurv = ctx.createLinearGradient(
              width / 2 - 28,
              24,
              24,
              24
            );
            leftCurv.addColorStop(0, 'rgba(15, 23, 42, 0.12)');
            leftCurv.addColorStop(0.18, 'rgba(15, 23, 42, 0.03)');
            leftCurv.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = leftCurv;
            ctx.fillRect(24, 24, width / 2 - 28, height - 48);

            const rightCurv = ctx.createLinearGradient(
              width / 2 + 4,
              24,
              width - 24,
              24
            );
            rightCurv.addColorStop(0, 'rgba(15, 23, 42, 0.12)');
            rightCurv.addColorStop(0.18, 'rgba(15, 23, 42, 0.03)');
            rightCurv.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = rightCurv;
            ctx.fillRect(width / 2 + 4, 24, width / 2 - 28, height - 48);

            // Story Prose on Left Page
            ctx.fillStyle = '#b45309';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`CHAPTER ${chapterNum}`, 44, 64);

            ctx.fillStyle = '#0f172a';
            ctx.font = `bold 16px ${activeFont}`;
            ctx.fillText(chapterTitle, 44, 90);

            // Ornamental star filigree line
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(44, 102);
            ctx.lineTo(width / 2 - 44, 102);
            ctx.stroke();

            // Illuminated Royal Drop-Cap
            const firstLine = chapterLines[0] || '';
            const initialChar = firstLine.slice(0, 1).toUpperCase();
            const restFirstLine = firstLine.slice(1);

            ctx.fillStyle = '#1e1b4b';
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(44, 114, 26, 26, 4);
            else ctx.rect(44, 114, 26, 26);
            ctx.fill();
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.fillStyle = '#fbbf24';
            ctx.font = `bold 18px ${activeFont}`;
            ctx.textAlign = 'center';
            ctx.fillText(initialChar, 57, 133);

            ctx.fillStyle = textColor;
            ctx.font = `12px ${activeFont}`;
            ctx.textAlign = 'left';
            ctx.fillText(restFirstLine, 76, 131);

            let lineY = 153;
            for (let i = 1; i < chapterLines.length; i++) {
              ctx.fillText(chapterLines[i], 44, lineY);
              lineY += 22;
            }

            // Right Page Framed Illustration Stage with Hyper-Realistic Scene
            const stageX = width / 2 + 16;
            const stageY = 44;
            const stageW = width / 2 - 48;
            const stageH = height - 88;

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

          // Positions for Hero Avatar and Companion Mascot
          const stageX = isPanoramic ? 24 : width / 2 + 16;
          const stageW = isPanoramic ? width - 48 : width / 2 - 48;
          const stageY = isPanoramic ? 24 : 44;
          const stageH = isPanoramic ? height - 48 : height - 88;

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
          const heroOpts = heroOptsRef.current;
          heroOpts.x = heroX;
          heroOpts.y = heroY;
          drawHero(ctx, avatar, heroOpts);

          const companionOpts = companionOptsRef.current;
          companionOpts.x = coStarX;
          companionOpts.y = coStarY;
          drawCompanion(ctx, companion, companionOpts);

          // Stage Title Banner
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            `${childName} & ${coStarLabel.split(' ')[0]}`,
            stageX + stageW / 2,
            stageY + stageH - 14
          );

          // Page Numbers
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px sans-serif';
          ctx.fillText(`Page ${activePage * 2 - 1}`, width / 4, height - 40);
          ctx.fillText(`Page ${activePage * 2}`, (3 * width) / 4, height - 40);
        }

        // PRINT BLEED GUIDES OVERLAY (If enabled)
        if (showBleed) {
          ctx.save();
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.lineWidth = 1;
          if (ctx.setLineDash) ctx.setLineDash([4, 4]);
          ctx.strokeRect(10, 10, width - 20, height - 20);

          ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)';
          ctx.strokeRect(22, 22, width - 44, height - 44);
          if (ctx.setLineDash) ctx.setLineDash([]);

          // Technical registration marks
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          const rLen = 12;
          // Top-left
          ctx.beginPath();
          ctx.moveTo(10, 10 - rLen);
          ctx.lineTo(10, 10);
          ctx.lineTo(10 - rLen, 10);
          // Top-right
          ctx.moveTo(width - 10, 10 - rLen);
          ctx.lineTo(width - 10, 10);
          ctx.lineTo(width - 10 + rLen, 10);
          // Bottom-left
          ctx.moveTo(10, height - 10 + rLen);
          ctx.lineTo(10, height - 10);
          ctx.lineTo(10 - rLen, height - 10);
          // Bottom-right
          ctx.moveTo(width - 10, height - 10 + rLen);
          ctx.lineTo(width - 10, height - 10);
          ctx.lineTo(width - 10 + rLen, height - 10);
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('[---] 3MM BLEED CUT LINE', 14, 8);
          ctx.fillStyle = '#10b981';
          ctx.fillText('SAFE ARTWORK ZONE', 26, 20);
          ctx.restore();
        }
      } else if (mode === 'poster') {
        // Custom Framed Poster Engine
        const {
          headline = 'REACH FOR THE STARS',
          subquote = 'Dream bigger, explore further, and shine bright.',
          artStyle = 'cosmic',
          frame = 'oak',
          fontFamily = 'sans',
          textColor = '#ffffff',
          paper = 'cotton',
          orientation = '',
          showBleed = false,
        } = config;

        const activeFont = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.sans;

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
          ctx.strokeStyle =
            frame === 'gold' ? '#f59e0b' : 'rgba(0, 0, 0, 0.15)';
          ctx.lineWidth = frame === 'gold' ? 3 : 2;
          ctx.strokeRect(8, 8, width - 16, height - 16);

          if (frame === 'gold') {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(12, 12, width - 24, height - 24);
          }
        }

        // Poster Mat Board
        const matInset = frame !== 'none' ? 24 : 12;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(
          matInset,
          matInset,
          width - matInset * 2,
          height - matInset * 2
        );

        // Artwork Inner Canvas
        const artInset = matInset + 20;
        const artW = width - artInset * 2;
        const artH = height - artInset * 2;

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

        // Sun / Orb Graphic. Orientation is a shopper choice, not something to
        // infer from the canvas box — a portrait proof can be wider than tall.
        const isLandscape = orientation
          ? orientation === 'landscape'
          : width > height;
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

        // Poster Typography
        const isMinimal = artStyle === 'minimal';
        const ink = isMinimal ? '#0f172a' : textColor || '#ffffff';
        ctx.fillStyle = ink;
        const headlineSize = isLandscape ? 20 : 24;
        ctx.font = `bold ${headlineSize}px ${activeFont}`;
        ctx.textAlign = 'center';
        const headlineY = isLandscape
          ? artInset + artH - 56
          : artInset + artH - 70;
        ctx.fillText(headline.toUpperCase(), width / 2, headlineY);

        // Sub-copy and footer derive from the chosen ink rather than assuming
        // white, so `textColor` is honoured across the whole block.
        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = isMinimal ? '#475569' : ink;
        ctx.font = `12px ${activeFont}`;
        const subquoteY = isLandscape
          ? artInset + artH - 34
          : artInset + artH - 42;
        ctx.fillText(subquote, width / 2, subquoteY);

        ctx.globalAlpha = 0.6;
        ctx.font = '10px sans-serif';
        ctx.fillStyle = isMinimal ? '#94a3b8' : ink;
        const footerY = isLandscape
          ? artInset + artH - 16
          : artInset + artH - 22;
        ctx.fillText(
          'CUSTOM GALLERY PRINT • ARCHIVAL EDITION',
          width / 2,
          footerY
        );
        ctx.restore();

        if (showBleed) {
          ctx.save();
          ctx.strokeStyle = '#ef4444';
          if (ctx.setLineDash) ctx.setLineDash([4, 4]);
          ctx.strokeRect(6, 6, width - 12, height - 12);
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('[---] BLEED MARGIN', 10, 16);
          ctx.restore();
        }
      } else if (mode === 'apparel') {
        // Kids' Apparel & Shoes Engine
        const {
          garment = 'hoodie',
          color = '#1e293b',
          monogram = 'NOAH',
          placement = 'chest',
          fontFamily = 'sans',
          size = 'Youth M',
          accentColor = '#f8fafc',
          textScale = 1,
          showBleed = false,
        } = config;

        const activeFont = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.sans;
        const garmentScale = APPAREL_SIZE_SCALE[size] ?? 1;
        const stitch = contrastInk(color);
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

          // Woven size tag
          ctx.fillStyle = '#f8fafc';
          if (isBack) {
            ctx.fillRect(cx - 18, 84, 36, 14);
            ctx.fillStyle = '#334155';
            ctx.font = 'bold 8px sans-serif';
            ctx.fillText(size.replace('Youth ', 'Y'), cx, 94);
          } else {
            ctx.fillRect(cx - 88, height - 96, 36, 14);
            ctx.fillStyle = '#334155';
            ctx.font = 'bold 8px sans-serif';
            ctx.fillText(size.replace('Youth ', 'Y'), cx - 70, height - 86);
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

          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(cx + 34, height - 96, 34, 14);
          ctx.fillStyle = '#334155';
          ctx.font = 'bold 8px sans-serif';
          ctx.fillText(size.replace('Youth ', 'Y'), cx + 51, height - 86);
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

          // Placement is real on kicks too: side panel or heel tab.
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

          ctx.fillStyle = '#334155';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText(size.replace('Youth ', 'Y'), cx + 96, midY + 50);
        }

        ctx.restore();

        // Apparel gets the same bleed guide the poster already had.
        if (showBleed) {
          ctx.save();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          if (ctx.setLineDash) ctx.setLineDash([4, 4]);
          ctx.strokeRect(6, 6, width - 12, height - 12);
          ctx.strokeStyle = '#10b981';
          ctx.strokeRect(20, 20, width - 40, height - 40);
          if (ctx.setLineDash) ctx.setLineDash([]);
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('[---] BLEED MARGIN', 10, 16);
          ctx.fillStyle = '#10b981';
          ctx.fillText('PRINTABLE GARMENT ZONE', 24, 30);
          ctx.restore();
        }
      }

      // Render Draggable Stickers Layer
      stickers.forEach((s) => {
        drawSticker(ctx, s, s.id === activeStickerId);
      });

      // Anti-theft watermarks belong on the downloadable proof, but they poison
      // a cart or saved-design thumbnail with a diagonal PROOF ribbon — so the
      // caller opts out via `exportOptions`.
      if (watermark) {
        drawDualWatermarks(ctx, width, height, mode, config?.activePage ?? 0);
      }
    },
    [
      width,
      height,
      mode,
      config,
      stickers,
      activeStickerId,
      drawSticker,
      watermark,
      heroAvatar,
      heroCompanion,
    ]
  );

  useEffect(() => {
    let animId;
    let lastTime =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    let isMounted = true;

    const loop = (currentTime) => {
      if (!isMounted) return;
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      timeRef.current += dt;
      renderCanvas(timeRef.current);
      if (isAnimated) {
        animId = requestAnimationFrame(loop);
      }
    };

    // Synchronous initial paint for instant rendering and Vitest test runner
    renderCanvas(timeRef.current);

    if (
      isAnimated &&
      typeof window !== 'undefined' &&
      window.requestAnimationFrame
    ) {
      animId = requestAnimationFrame(loop);
    }

    return () => {
      isMounted = false;
      if (
        animId &&
        typeof window !== 'undefined' &&
        window.cancelAnimationFrame
      ) {
        cancelAnimationFrame(animId);
      }
    };
  }, [renderCanvas, isAnimated]);

  // Sticker manipulation helpers
  const handleRotateActive = (deltaDegrees) => {
    if (!activeStickerId) return;
    onUpdateStickers(
      stickers.map((s) =>
        s.id === activeStickerId
          ? { ...s, rotation: ((s.rotation || 0) + deltaDegrees) % 360 }
          : s
      )
    );
  };

  const handleScaleActive = (deltaScale) => {
    if (!activeStickerId) return;
    onUpdateStickers(
      stickers.map((s) =>
        s.id === activeStickerId
          ? {
              ...s,
              scale: Math.max(
                0.4,
                Math.min(3, ((s.scale || 1) + deltaScale).toFixed(2) * 1)
              ),
            }
          : s
      )
    );
  };

  const handleFlipActive = () => {
    if (!activeStickerId) return;
    onUpdateStickers(
      stickers.map((s) =>
        s.id === activeStickerId ? { ...s, flipX: !s.flipX } : s
      )
    );
  };

  const handleDuplicateActive = () => {
    if (!activeStickerId) return;
    const target = stickers.find((s) => s.id === activeStickerId);
    if (!target) return;
    const duplicated = {
      ...target,
      id: `stamp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      x: Math.min(width - 40, target.x + 24),
      y: Math.min(height - 40, target.y + 24),
    };
    onUpdateStickers([...stickers, duplicated]);
    setActiveStickerId(duplicated.id);
  };

  const handleLayerActive = useCallback(
    (direction) => {
      if (!activeStickerId) return;
      const idx = stickers.findIndex((s) => s.id === activeStickerId);
      if (idx === -1) return;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= stickers.length) return;
      const updated = [...stickers];
      const [moved] = updated.splice(idx, 1);
      updated.splice(targetIdx, 0, moved);
      onUpdateStickers(updated);
    },
    [activeStickerId, stickers, onUpdateStickers]
  );

  const handleDeleteActive = useCallback(() => {
    if (!activeStickerId) return;
    onUpdateStickers(stickers.filter((s) => s.id !== activeStickerId));
    setActiveStickerId(null);
  }, [activeStickerId, stickers, onUpdateStickers, setActiveStickerId]);

  const handleNudgeActive = useCallback(
    (dx, dy) => {
      if (!activeStickerId) return;
      onUpdateStickers(
        stickers.map((s) =>
          s.id === activeStickerId
            ? {
                ...s,
                x: Math.max(0, Math.min(width, s.x + dx)),
                y: Math.max(0, Math.min(height, s.y + dy)),
              }
            : s
        ),
        { commit: true }
      );
    },
    [activeStickerId, stickers, onUpdateStickers, width, height]
  );

  // Keyboard accessibility & hotkeys for selected stamp
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!activeStickerId) return;
      // Do not intercept typing inside form inputs
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteActive();
      } else if (e.key === 'Escape') {
        setActiveStickerId(null);
      } else if (e.key === '[') {
        e.preventDefault();
        handleLayerActive(-1);
      } else if (e.key === ']') {
        e.preventDefault();
        handleLayerActive(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNudgeActive(e.shiftKey ? -10 : -1, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNudgeActive(e.shiftKey ? 10 : 1, 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleNudgeActive(0, e.shiftKey ? -10 : -1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNudgeActive(0, e.shiftKey ? 10 : 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeStickerId,
    handleDeleteActive,
    handleLayerActive,
    handleNudgeActive,
    setActiveStickerId,
  ]);

  /* ---- Direct manipulation from the selection chrome ------------------- */

  const pointFromEvent = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches?.[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    if (clientX === undefined || clientY === undefined) return null;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  /**
   * The grips and the rotation knob used to be decoration. Hit-testing them
   * means undoing the sticker's own transform: translate, then rotate, then
   * scale (with `flipX` mirroring the x axis).
   */
  const hitTransformHandle = useCallback((sticker, x, y) => {
    const scale = sticker.scale || 1;
    const rad = ((sticker.rotation || 0) * Math.PI) / 180;
    const dx = x - sticker.x;
    const dy = y - sticker.y;
    const lx = (dx * Math.cos(rad) + dy * Math.sin(rad)) / scale;
    const ly = (-dx * Math.sin(rad) + dy * Math.cos(rad)) / scale;
    const px = sticker.flipX ? -lx : lx;
    const tol = 8 / scale;

    if (Math.hypot(px, ly - KNOB_OFFSET) <= KNOB_RADIUS + tol) return 'rotate';
    for (let i = 0; i < 4; i += 1) {
      const gx = i === 0 || i === 3 ? -GRIP_HALF : GRIP_HALF;
      const gy = i < 2 ? -GRIP_HALF : GRIP_HALF;
      if (
        Math.abs(px - gx) <= GRIP_SIZE + tol &&
        Math.abs(ly - gy) <= GRIP_SIZE + tol
      ) {
        return 'resize';
      }
    }
    return null;
  }, []);

  const beginTransformDrag = useCallback(
    (e) => {
      if (!activeStickerId) return false;
      const point = pointFromEvent(e);
      if (!point) return false;
      const sticker = stickers.find((s) => s.id === activeStickerId);
      if (!sticker) return false;
      const handle = hitTransformHandle(sticker, point.x, point.y);
      if (!handle) return false;

      transformDragRef.current = {
        handle,
        id: sticker.id,
        startScale: sticker.scale || 1,
        startRotation: sticker.rotation || 0,
        startDist: Math.hypot(point.x - sticker.x, point.y - sticker.y) || 1,
        startAngle: Math.atan2(point.y - sticker.y, point.x - sticker.x),
        latest: null,
      };
      return true;
    },
    [activeStickerId, stickers, pointFromEvent, hitTransformHandle]
  );

  const updateTransformDrag = useCallback(
    (e) => {
      const drag = transformDragRef.current;
      if (!drag) return false;
      const point = pointFromEvent(e);
      if (!point) return true;
      const sticker = stickers.find((s) => s.id === drag.id);
      if (!sticker) return true;

      let patchScale = sticker.scale || 1;
      let patchRotation = sticker.rotation || 0;

      if (drag.handle === 'resize') {
        const dist = Math.hypot(point.x - sticker.x, point.y - sticker.y);
        patchScale = Math.max(
          0.4,
          Math.min(3, (drag.startScale * dist) / drag.startDist)
        );
      } else {
        const angle = Math.atan2(point.y - sticker.y, point.x - sticker.x);
        patchRotation =
          (drag.startRotation +
            ((angle - drag.startAngle) * 180) / Math.PI +
            360) %
          360;
      }

      const updated = stickers.map((s) =>
        s.id === drag.id
          ? { ...s, scale: patchScale, rotation: patchRotation }
          : s
      );
      drag.latest = updated;
      // Intermediate frames stay out of undo history, same as a position drag.
      onUpdateStickers(updated, { commit: false });
      return true;
    },
    [stickers, pointFromEvent, onUpdateStickers]
  );

  const endTransformDrag = useCallback(() => {
    const drag = transformDragRef.current;
    if (!drag) return false;
    transformDragRef.current = null;
    if (drag.latest) onUpdateStickers(drag.latest, { commit: true });
    return true;
  }, [onUpdateStickers]);

  const canvasHandlers = useMemo(
    () => ({
      onMouseDown: (e) => {
        if (beginTransformDrag(e)) return;
        gestureHandlers.onMouseDown(e);
      },
      onMouseMove: (e) => {
        if (updateTransformDrag(e)) return;
        gestureHandlers.onMouseMove(e);
      },
      onMouseUp: (e) => {
        if (endTransformDrag()) return;
        gestureHandlers.onMouseUp(e);
      },
      onMouseLeave: (e) => {
        if (endTransformDrag()) return;
        gestureHandlers.onMouseLeave(e);
      },
      onTouchStart: (e) => {
        if (beginTransformDrag(e)) return;
        gestureHandlers.onTouchStart(e);
      },
      onTouchMove: (e) => {
        if (updateTransformDrag(e)) return;
        gestureHandlers.onTouchMove(e);
      },
      onTouchEnd: (e) => {
        if (endTransformDrag()) return;
        gestureHandlers.onTouchEnd(e);
      },
      onTouchCancel: (e) => {
        if (endTransformDrag()) return;
        gestureHandlers.onTouchCancel(e);
      },
    }),
    [gestureHandlers, beginTransformDrag, updateTransformDrag, endTransformDrag]
  );

  const stampCount = stickers.length;
  const canvasLabel = useMemo(() => {
    const stamps = `${stampCount} decorative ${
      stampCount === 1 ? 'stamp' : 'stamps'
    } placed`;

    if (mode === 'poster') {
      return `Poster proof preview. Headline "${config.headline ?? ''}", ${
        config.artStyle ?? 'cosmic'
      } artwork, ${config.frame ?? 'oak'} frame, ${
        config.paper ?? 'cotton'
      } paper, ${config.orientation ?? 'portrait'} orientation. ${stamps}.`;
    }
    if (mode === 'apparel') {
      return `Apparel proof preview. ${config.garment ?? 'hoodie'} in size ${
        config.size ?? 'Youth M'
      }, monogram "${config.monogram ?? ''}" at ${
        config.placement ?? 'chest'
      } placement. ${stamps}.`;
    }
    const page = config.activePage ?? 0;
    return `Storybook proof preview. ${
      page === 0 ? 'Cover' : `Spread ${page}`
    } for ${config.childName ?? 'your hero'} with ${heroCompanion.name}, ${
      config.theme ?? 'space'
    } theme. ${stamps}.`;
  }, [mode, config, heroCompanion, stampCount]);

  // High-Res Proof Download
  const handleDownloadProof = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const link = document.createElement('a');
      link.download = `${mode}-300dpi-proof-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // In SSR or sandboxed environments
    }
  };

  return (
    <div className={`${styles.canvasWrapper} ${className}`}>
      <canvas
        ref={attachCanvas}
        style={{ width: `${width}px`, height: `${height}px` }}
        role="img"
        aria-label={canvasLabel}
        tabIndex={0}
        {...canvasHandlers}
        className={`${styles.interactiveCanvas} ${
          hoveredStickerId
            ? styles.cursorMove
            : selectedSticker
              ? styles.cursorStamp
              : ''
        }`}
      />

      {/* Layer Transformation Bar if an item is selected */}
      {activeStickerId && (
        <div
          className={styles.layerToolbar}
          role="toolbar"
          aria-label="Stamp layer controls"
        >
          <span className={styles.toolbarLabel}>Layer:</span>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={handleFlipActive}
            title="Mirror / Flip Horizontal"
            aria-label="Flip stamp horizontally"
          >
            <FlipHorizontalIcon size={12} />
            <span>Flip</span>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => handleRotateActive(-15)}
            title="Rotate Left 15°"
            aria-label="Rotate stamp left"
          >
            <span>-15°</span>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => handleRotateActive(15)}
            title="Rotate Right 15°"
            aria-label="Rotate stamp right"
          >
            <span>+15°</span>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => handleScaleActive(-0.15)}
            title="Smaller"
            aria-label="Make stamp smaller"
          >
            <span>-</span>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => handleScaleActive(0.15)}
            title="Larger"
            aria-label="Make stamp larger"
          >
            <span>+</span>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => handleLayerActive(1)}
            title="Bring Forward"
            aria-label="Bring layer forward"
          >
            <span>Up</span>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => handleLayerActive(-1)}
            title="Send Backward"
            aria-label="Send layer backward"
          >
            <span>Down</span>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={handleDuplicateActive}
            title="Duplicate Stamp"
            aria-label="Duplicate stamp"
          >
            <DuplicateIcon size={12} />
            <span>Clone</span>
          </button>
          <button
            type="button"
            className={`${styles.toolBtn} ${styles.deleteBtn}`}
            onClick={handleDeleteActive}
            title="Delete Selected Stamp"
            aria-label="Delete selected stamp"
          >
            <TrashIcon size={12} />
            <span>Remove</span>
          </button>
        </div>
      )}

      {/* Proof Action Overlay */}
      <div className={styles.proofActionsRow}>
        <button
          type="button"
          className={styles.proofExportBtn}
          onClick={handleDownloadProof}
          title="Export 300-DPI Print Proof"
          aria-label="Download print-ready proof"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>300-DPI Proof Export</span>
        </button>
      </div>
    </div>
  );
}

CanvasEngine.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  mode: PropTypes.oneOf(['storybook', 'poster', 'apparel']),
  config: PropTypes.object,
  selectedSticker: PropTypes.string,
  stickers: PropTypes.array,
  onUpdateStickers: PropTypes.func,
  onCanvasClick: PropTypes.func,
  className: PropTypes.string,
  isAnimated: PropTypes.bool,
  canvasRef: PropTypes.shape({ current: PropTypes.any }),
  exportOptions: PropTypes.shape({ watermark: PropTypes.bool }),
};
