import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import styles from './CanvasEngine.module.css';
import {
  normalizeAvatar,
  normalizeCompanion,
  SPECIES_ALIASES,
} from './core/characterSchema';
import { drawStamp } from './drawStamp';
import {
  bookStageRect,
  drawApparelGarment,
  drawApparelMonogram,
  drawApparelTag,
  drawBookPages,
  drawBookStage,
  drawPosterSubstrate,
  FONT_FAMILIES,
} from './drawSubstrate';
import { DuplicateIcon, FlipHorizontalIcon, TrashIcon } from './StudioSVGs';

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

/**
 * Stamps are authored in a 48-unit box — the same box the selection chrome
 * frames. `sticker.scale` multiplies on top of it, as it always has.
 */
const STAMP_SIZE = 48;

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

  // Reused per sticker per frame so the render loop stays allocation-free.
  const stampOptsRef = useRef({
    type: 'heart',
    size: STAMP_SIZE,
    tint: null,
    flipX: false,
    text: null,
  });

  // Place a stamp from the shared vector library, then the editor's own chrome.
  const drawSticker = useCallback((ctx, sticker, isSelected = false) => {
    ctx.save();
    ctx.translate(sticker.x, sticker.y);
    if (sticker.rotation) {
      ctx.rotate((sticker.rotation * Math.PI) / 180);
    }
    const scale = sticker.scale || 1;
    ctx.scale(scale, scale);

    // The mirror lives inside `drawStamp` so a bubble caption stays readable.
    // The selection chrome below is x-symmetric, so it does not care.
    const opts = stampOptsRef.current;
    opts.type = sticker.type;
    opts.size = STAMP_SIZE;
    opts.tint = sticker.tint ?? null;
    opts.flipX = Boolean(sticker.flipX);
    opts.text = sticker.text ?? null;
    drawStamp(ctx, opts);

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
          activePage = 0,
          dedication = 'Stay curious, brave, and kind.',
          fontFamily = 'serif',
          textColor = '#334155',
          chapterProse = {},
          showBleed = false,
        } = config;
        const companion = heroCompanion;

        const activeFont = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.serif;

        // A shopper-supplied companion name wins over the catalog title.
        const coStarLabel =
          config.companion?.name ||
          CO_STAR_NAMES[companion.species] ||
          CO_STAR_NAMES.leo;

        // The bound book comes in two phases: the pages the copy is printed
        // on, then the emblem, stage and cast that sit on top of it.
        drawBookPages(ctx, { width, height, config, time });

        if (activePage === 0) {
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

          drawBookStage(ctx, { width, height, config, time });
        } else if (activePage === 1) {
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

          // The substrate drew the card and the stage; the prose sits on top of
          // them, in the same geometry.
          const { isPanoramic, stageX, stageY, stageW, stageH, cardX, cardY } =
            bookStageRect(width, height, config);

          // Illuminated Royal Drop-Cap opens every chapter.
          const firstLine = chapterLines[0] || '';
          const initialChar = firstLine.slice(0, 1).toUpperCase();
          const restFirstLine = firstLine.slice(1);

          if (isPanoramic) {
            // Prose typography on frosted card
            ctx.save();
            ctx.fillStyle = '#b45309';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(`CHAPTER ${chapterNum}`, cardX + 16, cardY + 28);

            ctx.fillStyle = '#0f172a';
            ctx.font = `bold 16px ${activeFont}`;
            ctx.fillText(chapterTitle, cardX + 16, cardY + 52);

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
          }

          // The illustration stage trims any prose that overruns the gutter,
          // exactly as it did when this lived inline.
          drawBookStage(ctx, {
            width,
            height,
            config,
            time,
            avatar: heroAvatar,
            companion,
          });

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
          fontFamily = 'sans',
          textColor = '#ffffff',
          showBleed = false,
        } = config;

        const activeFont = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.sans;

        // Frame, mat, art ground and paper stock — the blank print.
        const { artInset, artH, isLandscape } = drawPosterSubstrate(ctx, {
          width,
          height,
          config,
        });

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
        const { showBleed = false } = config;

        // The blank garment, the embroidery it carries, then the woven tag
        // that is stitched over the print.
        drawApparelGarment(ctx, { width, height, config });
        drawApparelMonogram(ctx, { width, height, config });
        drawApparelTag(ctx, { width, height, config });

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
