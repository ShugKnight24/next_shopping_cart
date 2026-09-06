import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './CanvasEngine.module.css';

/**
 * Anti-Theft Dual-Side Security Watermarks
 * Prevents AI upscaling and unauthorized taking of custom artwork.
 * Draws subtle angled security ribbons and official preview seals on both left and right spreads/quadrants.
 */
function drawDualWatermarks(ctx, width, height, mode, activePage) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const watermarkText = 'CART COMMERCE • PROOF / PREVIEW ONLY • DO NOT REPRODUCE';

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
}) {
  const canvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragTargetRef = useRef(null);
  const [hoveredStickerId, setHoveredStickerId] = useState(null);

  // Selected sticker layer state
  const [activeStickerId, setActiveStickerId] = useState(null);

  // Draw sticker vector primitives on Canvas 2D
  const drawSticker = useCallback((ctx, sticker, isSelected = false) => {
    ctx.save();
    ctx.translate(sticker.x, sticker.y);
    if (sticker.rotation) {
      ctx.rotate((sticker.rotation * Math.PI) / 180);
    }
    ctx.scale(sticker.scale || 1, sticker.scale || 1);

    switch (sticker.type) {
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

      // Corner anchor grips
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 1.5;
      [
        [-24, -24],
        [24, -24],
        [24, 24],
        [-24, 24],
      ].forEach(([cx, cy]) => {
        ctx.fillRect(cx - 3, cy - 3, 6, 6);
        ctx.strokeRect(cx - 3, cy - 3, 6, 6);
      });

      // Rotation stem & anchor
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(0, -34);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, -34, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }, []);

  // Main Render Routine
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2;
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
        avatar = {
          skin: '#fbd38d',
          hair: '#4a2c11',
          outfit: '#2563eb',
          accessory: 'cape',
        },
        mascotCoStar = 'leo',
        showBleed = false,
      } = config;

      // Font Family mapping
      const fontFamilies = {
        serif: "'Cinzel', 'Playfair Display', Georgia, serif",
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "'Impact', 'Trebuchet MS', sans-serif",
        cursive: "'Brush Script MT', 'Comic Sans MS', cursive",
      };
      const activeFont = fontFamilies[fontFamily] || fontFamilies.serif;

      // Mascot co-star name lookup
      const coStarNames = {
        finley: 'Finley The Starlight Fox',
        luna: 'Luna The Cosmic Shepherd',
        leo: 'Leo The Story Lion',
        penny: 'Princess Penny',
        dexter: 'Dexter The Dino Explorer',
        carty: 'Carty The Courier',
        sparky: 'Sparky The Sneaker Hound',
      };
      const coStarLabel = coStarNames[mascotCoStar] || 'Finley The Starlight Fox';

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

      // Hardcover Backing
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(14, 14, width - 28, height - 28, 14);
      ctx.fill();

      // Gold Foil Border Trim
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Book Spine Crease
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(width / 2 - 3, 14, 6, height - 28);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(width / 2 - 1, 14, 2, height - 28);

      if (activePage === 0) {
        // Front Cover View
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
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('★', width / 2, 146);
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
        ctx.fillText('Printed on FSC Archival Paper • Page 1', (3 * width) / 4 - 10, height - 42);
      } else {
        // Chapter Pages (2, 3, 4)
        ctx.fillStyle = '#fffdfa';
        ctx.fillRect(24, 24, width / 2 - 28, height - 48);
        ctx.fillRect(width / 2 + 4, 24, width / 2 - 28, height - 48);

        // Story Prose
        const chapterNum = activePage - 1;
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`CHAPTER ${chapterNum}`, 44, 64);

        const customChapter = chapterProse && chapterProse[chapterNum];
        const defaultTitle =
          chapterNum === 1
            ? `${childName}'s Journey Begins`
            : chapterNum === 2
            ? `The Secret of the Starlight Compass`
            : `The Grand Victory Celebration`;
        const chapterTitle = customChapter?.title || defaultTitle;

        ctx.fillStyle = '#0f172a';
        ctx.font = `bold 16px ${activeFont}`;
        ctx.fillText(chapterTitle, 44, 90);

        ctx.fillStyle = textColor;
        ctx.font = `12px ${activeFont}`;
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

        let lineY = 125;
        chapterLines.forEach((l) => {
          ctx.fillText(l, 44, lineY);
          lineY += 24;
        });

        // Right Page Illustration Stage
        const stageX = width / 2 + 16;
        const stageY = 44;
        const stageW = width / 2 - 48;
        const stageH = height - 88;

        const illGrad = ctx.createLinearGradient(stageX, stageY, stageX + stageW, stageY + stageH);
        if (theme === 'space') {
          illGrad.addColorStop(0, '#0f172a');
          illGrad.addColorStop(1, '#1e1b4b');
        } else if (theme === 'magic') {
          illGrad.addColorStop(0, '#4c1d95');
          illGrad.addColorStop(1, '#831843');
        } else if (theme === 'sneaker') {
          illGrad.addColorStop(0, '#1e1b4b');
          illGrad.addColorStop(1, '#b91c1c');
        } else {
          illGrad.addColorStop(0, '#064e3b');
          illGrad.addColorStop(1, '#065f46');
        }
        ctx.fillStyle = illGrad;
        ctx.beginPath();
        ctx.roundRect(stageX, stageY, stageW, stageH, 8);
        ctx.fill();

        // Twinkling background stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        [
          [stageX + 25, stageY + 20, 1.5],
          [stageX + stageW - 30, stageY + 35, 2],
          [stageX + 50, stageY + 70, 1],
          [stageX + stageW - 60, stageY + 80, 1.8],
          [stageX + 40, stageY + stageH - 50, 1.5],
        ].forEach(([sx, sy, sr]) => {
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        });

        // DRAW HERO AVATAR (Left character on illustration stage)
        const heroX = stageX + stageW * 0.35;
        const heroY = stageY + stageH * 0.65;

        // Optional Cape behind
        if (avatar.accessory === 'cape') {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(heroX - 8, heroY - 10);
          ctx.lineTo(heroX - 24, heroY + 28);
          ctx.lineTo(heroX, heroY + 22);
          ctx.lineTo(heroX + 10, heroY - 10);
          ctx.closePath();
          ctx.fill();
        }

        // Body / Outfit
        ctx.fillStyle = avatar.outfit || '#2563eb';
        ctx.beginPath();
        ctx.roundRect(heroX - 12, heroY - 10, 24, 30, 6);
        ctx.fill();

        // Head
        ctx.fillStyle = avatar.skin || '#fbd38d';
        ctx.beginPath();
        ctx.arc(heroX, heroY - 22, 14, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = avatar.hair || '#4a2c11';
        ctx.beginPath();
        ctx.arc(heroX, heroY - 26, 14, Math.PI, 0, false);
        ctx.fill();

        // Eyes & Smile
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(heroX - 4, heroY - 22, 1.8, 0, Math.PI * 2);
        ctx.arc(heroX + 4, heroY - 22, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(heroX, heroY - 18, 4, 0.1 * Math.PI, 0.9 * Math.PI, false);
        ctx.stroke();

        // Accessory: Helmet or Crown or Glasses
        if (avatar.accessory === 'astronaut_helmet') {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(heroX, heroY - 22, 17, 0, Math.PI * 2);
          ctx.stroke();
        } else if (avatar.accessory === 'crown') {
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(heroX - 10, heroY - 36);
          ctx.lineTo(heroX - 6, -30 + heroY);
          ctx.lineTo(heroX, heroY - 38);
          ctx.lineTo(heroX + 6, -30 + heroY);
          ctx.lineTo(heroX + 10, heroY - 36);
          ctx.lineTo(heroX + 8, heroY - 28);
          ctx.lineTo(heroX - 8, heroY - 28);
          ctx.closePath();
          ctx.fill();
        } else if (avatar.accessory === 'glasses') {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(heroX - 8, heroY - 25, 6, 5);
          ctx.strokeRect(heroX + 2, heroY - 25, 6, 5);
          ctx.beginPath();
          ctx.moveTo(heroX - 2, heroY - 23);
          ctx.lineTo(heroX + 2, heroY - 23);
          ctx.stroke();
        }

        // DRAW MASCOT CO-STAR (Right character on illustration stage)
        const coStarX = stageX + stageW * 0.68;
        const coStarY = stageY + stageH * 0.65;

        if (mascotCoStar === 'finley') {
          // Finley The Starlight Fox (The Little Prince homage)
          // Bushy fox tail curving up with snowy white tip
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.moveTo(coStarX - 10, coStarY + 14);
          ctx.quadraticCurveTo(coStarX - 32, coStarY + 12, coStarX - 28, coStarY - 8);
          ctx.quadraticCurveTo(coStarX - 20, coStarY + 2, coStarX - 8, coStarY + 8);
          ctx.closePath();
          ctx.fill();
          // Snowy white tail tip
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(coStarX - 28, coStarY - 8);
          ctx.quadraticCurveTo(coStarX - 32, coStarY + 2, coStarX - 24, coStarY - 2);
          ctx.closePath();
          ctx.fill();

          // Amber body
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(coStarX - 12, coStarY - 8, 24, 30, 8);
          else ctx.rect(coStarX - 12, coStarY - 8, 24, 30);
          ctx.fill();

          // Cream chest ruff
          ctx.fillStyle = '#fff7ed';
          ctx.beginPath();
          ctx.ellipse(coStarX, coStarY + 6, 7, 10, 0, 0, Math.PI * 2);
          ctx.fill();

          // Pointed Desert Fox Ears
          ctx.fillStyle = '#c2410c';
          ctx.beginPath();
          ctx.moveTo(coStarX - 14, coStarY - 20);
          ctx.lineTo(coStarX - 18, coStarY - 36);
          ctx.lineTo(coStarX - 4, coStarY - 24);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#ffedd5';
          ctx.beginPath();
          ctx.moveTo(coStarX - 13, coStarY - 22);
          ctx.lineTo(coStarX - 16, coStarY - 33);
          ctx.lineTo(coStarX - 6, coStarY - 24);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#c2410c';
          ctx.beginPath();
          ctx.moveTo(coStarX + 14, coStarY - 20);
          ctx.lineTo(coStarX + 18, coStarY - 36);
          ctx.lineTo(coStarX + 4, coStarY - 24);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#ffedd5';
          ctx.beginPath();
          ctx.moveTo(coStarX + 13, coStarY - 22);
          ctx.lineTo(coStarX + 16, coStarY - 33);
          ctx.lineTo(coStarX + 6, coStarY - 24);
          ctx.closePath();
          ctx.fill();

          // Fox Head
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(coStarX, coStarY - 20, 13, 0, Math.PI * 2);
          ctx.fill();

          // Cream Cheeks
          ctx.fillStyle = '#fff7ed';
          ctx.beginPath();
          ctx.ellipse(coStarX, coStarY - 17, 9, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Inquisitive Soulful Amber Eyes
          ctx.fillStyle = '#431407';
          ctx.beginPath();
          ctx.arc(coStarX - 4, coStarY - 21, 1.8, 0, Math.PI * 2);
          ctx.arc(coStarX + 4, coStarY - 21, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(coStarX - 4, coStarY - 21, 0.8, 0, Math.PI * 2);
          ctx.arc(coStarX + 4, coStarY - 21, 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Button nose
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.arc(coStarX, coStarY - 16, 1.6, 0, Math.PI * 2);
          ctx.fill();

          // Flowing Celestial Scarf (The Little Prince homage)
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(coStarX - 10, coStarY - 10, 20, 6, 3);
          else ctx.rect(coStarX - 10, coStarY - 10, 20, 6);
          ctx.fill();
          // Scarf fluttering tails
          ctx.beginPath();
          ctx.moveTo(coStarX + 8, coStarY - 8);
          ctx.quadraticCurveTo(coStarX + 22, coStarY - 4, coStarX + 26, coStarY + 12);
          ctx.lineTo(coStarX + 18, coStarY + 8);
          ctx.closePath();
          ctx.fill();
          // Gold star on scarf
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(coStarX + 18, coStarY + 4, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (mascotCoStar === 'luna') {
          // Luna The Cosmic Anatolian Shepherd in Spacesuit
          // Curled Tail in Spacesuit
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(coStarX - 16, coStarY + 12, 10, 0.2 * Math.PI, 1.4 * Math.PI);
          ctx.stroke();
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(coStarX - 22, coStarY + 4, 3, 0, Math.PI * 2);
          ctx.fill();

          // White Spacesuit Body
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.roundRect(coStarX - 14, coStarY - 8, 28, 30, 8);
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Navy Spacesuit Collar
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(coStarX - 12, coStarY - 12, 24, 6, 2);
          ctx.fill();

          // Gold Name Patch: "LUNA"
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(coStarX - 10, coStarY + 6, 20, 8);
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1;
          ctx.strokeRect(coStarX - 10, coStarY + 6, 20, 8);
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 6px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('LUNA', coStarX, coStarY + 12.5);

          // Anatolian Folded Drop Ears
          ctx.fillStyle = '#713f12';
          ctx.beginPath();
          ctx.moveTo(coStarX - 12, coStarY - 26);
          ctx.lineTo(coStarX - 18, coStarY - 14);
          ctx.lineTo(coStarX - 8, coStarY - 18);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(coStarX + 12, coStarY - 26);
          ctx.lineTo(coStarX + 18, coStarY - 14);
          ctx.lineTo(coStarX + 8, coStarY - 18);
          ctx.closePath();
          ctx.fill();

          // Golden Fawn Head
          ctx.fillStyle = '#e5a95d';
          ctx.beginPath();
          ctx.arc(coStarX, coStarY - 22, 14, 0, Math.PI * 2);
          ctx.fill();

          // Anatolian Black Mask
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.ellipse(coStarX, coStarY - 18, 9, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Soulful Eyes
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(coStarX - 4, coStarY - 23, 1.8, 0, Math.PI * 2);
          ctx.arc(coStarX + 4, coStarY - 23, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(coStarX - 4, coStarY - 23, 1, 0, Math.PI * 2);
          ctx.arc(coStarX + 4, coStarY - 23, 1, 0, Math.PI * 2);
          ctx.fill();

          // Nose Leather
          ctx.fillStyle = '#09090b';
          ctx.beginPath();
          ctx.ellipse(coStarX, coStarY - 17, 3, 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Signature Pink Nose Blaze
          ctx.fillStyle = '#fca5a5';
          ctx.beginPath();
          ctx.ellipse(coStarX, coStarY - 18.5, 2, 0.8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Spacesuit Visor Ring
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(coStarX, coStarY - 22, 17, 0, Math.PI * 2);
          ctx.stroke();
        } else if (mascotCoStar === 'penny') {
          // Princess Penny
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.moveTo(coStarX, coStarY - 10);
          ctx.lineTo(coStarX - 16, coStarY + 22);
          ctx.lineTo(coStarX + 16, coStarY + 22);
          ctx.closePath();
          ctx.fill();
          // Head
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(coStarX, coStarY - 22, 12, 0, Math.PI * 2);
          ctx.fill();
          // Tiara
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(coStarX - 8, coStarY - 32, 16, 4);
          // Wand
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(coStarX + 10, coStarY - 5);
          ctx.lineTo(coStarX + 20, coStarY - 22);
          ctx.stroke();
        } else if (mascotCoStar === 'dexter') {
          // Dexter The Dino Explorer - High Quality Illustration
          // Curved Dino Tail with Back Spikes
          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.moveTo(coStarX + 8, coStarY + 16);
          ctx.quadraticCurveTo(coStarX + 28, coStarY + 14, coStarX + 32, coStarY - 4);
          ctx.lineTo(coStarX + 16, coStarY + 22);
          ctx.closePath();
          ctx.fill();

          // Amber Back Spikes
          ctx.fillStyle = '#f59e0b';
          [
            [coStarX + 6, coStarY - 4],
            [coStarX + 12, coStarY + 4],
            [coStarX + 20, coStarY + 8],
            [coStarX + 27, coStarY + 4],
          ].forEach(([sx, sy]) => {
            ctx.beginPath();
            ctx.moveTo(sx - 3, sy);
            ctx.lineTo(sx, sy - 6);
            ctx.lineTo(sx + 3, sy);
            ctx.closePath();
            ctx.fill();
          });

          // Emerald Dino Body
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.roundRect(coStarX - 16, coStarY - 8, 30, 32, 10);
          ctx.fill();

          // Mint Belly Patch
          ctx.fillStyle = '#6ee7b7';
          ctx.beginPath();
          ctx.ellipse(coStarX - 4, coStarY + 10, 8, 12, 0, 0, Math.PI * 2);
          ctx.fill();

          // Dino Head & Snout
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.ellipse(coStarX - 4, coStarY - 20, 15, 12, -0.1, 0, Math.PI * 2);
          ctx.fill();

          // Snout
          ctx.fillStyle = '#34d399';
          ctx.beginPath();
          ctx.ellipse(coStarX - 12, coStarY - 17, 8, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Friendly Smile with Teeth
          ctx.strokeStyle = '#064e3b';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(coStarX - 10, coStarY - 16, 5, 0.1 * Math.PI, 0.8 * Math.PI);
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(coStarX - 12, coStarY - 14);
          ctx.lineTo(coStarX - 10, coStarY - 11);
          ctx.lineTo(coStarX - 8, coStarY - 14);
          ctx.closePath();
          ctx.fill();

          // Curious Eye
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(coStarX - 2, coStarY - 23, 4.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#064e3b';
          ctx.beginPath();
          ctx.arc(coStarX - 2, coStarY - 23, 2.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(coStarX - 3, coStarY - 24, 1, 0, Math.PI * 2);
          ctx.fill();

          // Safari Explorer Hat
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.ellipse(coStarX - 4, coStarY - 30, 18, 4, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(coStarX - 4, coStarY - 30, 10, Math.PI, 0, false);
          ctx.fill();
          // Compass Badge on Hat
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(coStarX - 4, coStarY - 33, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (mascotCoStar === 'carty') {
          // Carty Courier
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.roundRect(coStarX - 14, coStarY - 12, 28, 28, 6);
          ctx.fill();
          // Cyan visor
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(coStarX - 10, coStarY - 6, 20, 6);
          // Antenna
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(coStarX, coStarY - 12);
          ctx.lineTo(coStarX, coStarY - 24);
          ctx.stroke();
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(coStarX, coStarY - 24, 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Leo Lion Cub
          ctx.fillStyle = '#f59e0b';
          // Mane
          ctx.beginPath();
          ctx.arc(coStarX, coStarY - 14, 18, 0, Math.PI * 2);
          ctx.fill();
          // Head
          ctx.fillStyle = '#fcd34d';
          ctx.beginPath();
          ctx.arc(coStarX, coStarY - 14, 12, 0, Math.PI * 2);
          ctx.fill();
          // Ears
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(coStarX - 10, coStarY - 24, 5, 0, Math.PI * 2);
          ctx.arc(coStarX + 10, coStarY - 24, 5, 0, Math.PI * 2);
          ctx.fill();
          // Smile
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(coStarX, coStarY - 12, 2, 0, Math.PI * 2);
          ctx.fill();
        }

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
        ctx.fillText('✂ 3MM BLEED CUT LINE', 14, 8);
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
        showBleed = false,
      } = config;

      const fontFamilies = {
        serif: "'Cinzel', 'Playfair Display', Georgia, serif",
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "'Impact', 'Trebuchet MS', sans-serif",
        cursive: "'Brush Script MT', 'Comic Sans MS', cursive",
      };
      const activeFont = fontFamilies[fontFamily] || fontFamilies.sans;

      // Outer Frame
      const frameColor =
        frame === 'oak'
          ? '#d4a373'
          : frame === 'black'
          ? '#1e293b'
          : frame === 'white'
          ? '#f8fafc'
          : 'transparent';

      if (frame !== 'none') {
        ctx.fillStyle = frameColor;
        ctx.fillRect(8, 8, width - 16, height - 16);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, width - 16, height - 16);
      }

      // Poster Mat Board
      const matInset = frame !== 'none' ? 24 : 12;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(matInset, matInset, width - matInset * 2, height - matInset * 2);

      // Artwork Inner Canvas
      const artInset = matInset + 20;
      const artW = width - artInset * 2;
      const artH = height - artInset * 2;

      const artGrad = ctx.createLinearGradient(artInset, artInset, artInset + artW, artInset + artH);
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
      } else {
        artGrad.addColorStop(0, '#f1f5f9');
        artGrad.addColorStop(1, '#e2e8f0');
      }

      ctx.fillStyle = artGrad;
      ctx.fillRect(artInset, artInset, artW, artH);

      // Sun / Orb Graphic
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(width / 2, artInset + 80, 50, 0, Math.PI * 2);
      ctx.fill();

      // Poster Typography
      ctx.fillStyle = artStyle === 'minimal' ? '#0f172a' : textColor || '#ffffff';
      ctx.font = `bold 24px ${activeFont}`;
      ctx.textAlign = 'center';
      ctx.fillText(headline.toUpperCase(), width / 2, artInset + artH - 70);

      ctx.fillStyle = artStyle === 'minimal' ? '#475569' : 'rgba(255, 255, 255, 0.85)';
      ctx.font = `12px ${activeFont}`;
      ctx.fillText(subquote, width / 2, artInset + artH - 42);

      ctx.font = '10px sans-serif';
      ctx.fillStyle = artStyle === 'minimal' ? '#94a3b8' : 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('CUSTOM GALLERY PRINT • ARCHIVAL EDITION', width / 2, artInset + artH - 22);

      if (showBleed) {
        ctx.save();
        ctx.strokeStyle = '#ef4444';
        if (ctx.setLineDash) ctx.setLineDash([4, 4]);
        ctx.strokeRect(6, 6, width - 12, height - 12);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('✂ BLEED MARGIN', 10, 16);
        ctx.restore();
      }
    } else if (mode === 'apparel') {
      // Kids' Apparel & Shoes Engine
      const {
        garment = 'hoodie',
        color = '#1e293b',
        monogram = 'NOAH',
        fontFamily = 'sans',
      } = config;

      const fontFamilies = {
        serif: "'Cinzel', 'Playfair Display', Georgia, serif",
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "'Impact', 'Trebuchet MS', sans-serif",
        cursive: "'Brush Script MT', 'Comic Sans MS', cursive",
      };
      const activeFont = fontFamilies[fontFamily] || fontFamilies.sans;

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Garment Shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
      ctx.beginPath();
      ctx.ellipse(width / 2, height - 40, 110, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      if (garment === 'hoodie' || garment === 'tee') {
        ctx.fillStyle = color;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(width / 2 - 34, 70);
        ctx.quadraticCurveTo(width / 2, 85, width / 2 + 34, 70);
        ctx.lineTo(width / 2 + 100, 110);
        ctx.lineTo(width / 2 + 135, 175);
        ctx.lineTo(width / 2 + 95, 195);
        ctx.lineTo(width / 2 + 75, 150);
        ctx.lineTo(width / 2 + 70, height - 70);
        ctx.lineTo(width / 2 - 70, height - 70);
        ctx.lineTo(width / 2 - 75, 150);
        ctx.lineTo(width / 2 - 95, 195);
        ctx.lineTo(width / 2 - 135, 175);
        ctx.lineTo(width / 2 - 100, 110);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(width / 2, 70, 34, 12, 0, 0, Math.PI);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 18px ${activeFont}`;
        ctx.textAlign = 'center';
        ctx.fillText(monogram.toUpperCase(), width / 2, 170);

        ctx.font = '9px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillText('AUTHENTIC EMBROIDERY', width / 2, 186);
      } else {
        // Kicks Silhouette
        ctx.fillStyle = color;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(width / 2 - 110, height / 2 + 10);
        ctx.lineTo(width / 2 - 110, height / 2 - 40);
        ctx.lineTo(width / 2 - 20, height / 2 - 45);
        ctx.lineTo(width / 2 + 30, height / 2 - 10);
        ctx.lineTo(width / 2 + 110, height / 2 + 15);
        ctx.lineTo(width / 2 + 115, height / 2 + 45);
        ctx.lineTo(width / 2 - 110, height / 2 + 45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // White Midsole
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(width / 2 - 115, height / 2 + 35, 235, 22);
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(width / 2 - 115, height / 2 + 35, 235, 22);

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 14px ${activeFont}`;
        ctx.textAlign = 'center';
        ctx.fillText(monogram.toUpperCase(), width / 2 - 65, height / 2 - 15);
      }
    }

    // Render Draggable Stickers Layer
    stickers.forEach((s) => {
      drawSticker(ctx, s, s.id === activeStickerId);
    });

    // Anti-Theft Dual-Side Security Watermarks (prevents upscaling & unauthorized copying)
    drawDualWatermarks(ctx, width, height, mode, config?.activePage ?? 0);
  }, [width, height, mode, config, stickers, activeStickerId, drawSticker]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle canvas clicks for stamping or dragging
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicked an existing sticker to select and drag
    const clickedSticker = [...stickers].reverse().find((s) => {
      const dist = Math.hypot(s.x - x, s.y - y);
      return dist <= 28 * (s.scale || 1);
    });

    if (clickedSticker) {
      isDraggingRef.current = true;
      dragTargetRef.current = clickedSticker.id;
      setActiveStickerId(clickedSticker.id);
    } else if (selectedSticker) {
      // Stamp new sticker
      const newSticker = {
        id: `stamp-${Date.now()}`,
        type: selectedSticker,
        x,
        y,
        scale: 1.2,
        rotation: 0,
      };
      onUpdateStickers([...stickers, newSticker]);
      setActiveStickerId(newSticker.id);
    } else {
      setActiveStickerId(null);
      if (onCanvasClick) {
        onCanvasClick(x, y);
      }
    }
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDraggingRef.current && dragTargetRef.current) {
      const updated = stickers.map((s) =>
        s.id === dragTargetRef.current ? { ...s, x, y } : s
      );
      onUpdateStickers(updated);
    } else {
      const hover = stickers.find((s) => Math.hypot(s.x - x, s.y - y) <= 24);
      setHoveredStickerId(hover ? hover.id : null);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    dragTargetRef.current = null;
  };

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
              scale: Math.max(0.5, Math.min(2.5, (s.scale || 1) + deltaScale)),
            }
          : s
      )
    );
  };

  const handleDeleteActive = () => {
    if (!activeStickerId) return;
    onUpdateStickers(stickers.filter((s) => s.id !== activeStickerId));
    setActiveStickerId(null);
  };

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
        ref={canvasRef}
        style={{ width: `${width}px`, height: `${height}px` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`${styles.interactiveCanvas} ${
          hoveredStickerId ? styles.cursorMove : selectedSticker ? styles.cursorStamp : ''
        }`}
      />

      {/* Layer Transformation Bar if an item is selected */}
      {activeStickerId && (
        <div className={styles.layerToolbar} role="toolbar" aria-label="Stamp layer controls">
          <span className={styles.toolbarLabel}>Selected Layer:</span>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => handleRotateActive(-15)}
            title="Rotate Left 15°"
            aria-label="Rotate stamp left"
          >
            ↺ -15°
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => handleRotateActive(15)}
            title="Rotate Right 15°"
            aria-label="Rotate stamp right"
          >
            ↻ +15°
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => handleScaleActive(-0.2)}
            title="Smaller"
            aria-label="Make stamp smaller"
          >
            A-
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => handleScaleActive(0.2)}
            title="Larger"
            aria-label="Make stamp larger"
          >
            A+
          </button>
          <button
            type="button"
            className={`${styles.toolBtn} ${styles.deleteBtn}`}
            onClick={handleDeleteActive}
            title="Delete Selected Stamp"
            aria-label="Delete selected stamp"
          >
            ✕ Remove
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
};
