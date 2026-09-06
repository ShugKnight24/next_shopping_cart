import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './CanvasEngine.module.css';

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

  // Draw sticker vector primitives on Canvas 2D
  const drawSticker = useCallback((ctx, sticker) => {
    ctx.save();
    ctx.translate(sticker.x, sticker.y);
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
      } = config;

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
        // Decorative Golden Arc
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
        ctx.font = 'bold 26px serif';
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
        ctx.fillText('STARRING ' + childName.toUpperCase(), width / 2, 335);

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
        // Left Page: Paper White
        ctx.fillStyle = '#fffdfa';
        ctx.fillRect(24, 24, width / 2 - 28, height - 48);

        // Right Page: Paper White
        ctx.fillRect(width / 2 + 4, 24, width / 2 - 28, height - 48);

        // Left Page Decorative Crest
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 14px serif';
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
        ctx.font = 'italic 13px serif';
        ctx.fillText(`Presented with honor to`, width / 4 + 10, 165);
        ctx.font = 'bold 18px serif';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(childName, width / 4 + 10, 200);

        // Right Page: Dedication Note
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('SPECIAL DEDICATION', (3 * width) / 4 - 10, 90);

        ctx.fillStyle = '#334155';
        ctx.font = 'italic 13px serif';
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
        // Two-page open book
        ctx.fillStyle = '#fffdfa';
        ctx.fillRect(24, 24, width / 2 - 28, height - 48);
        ctx.fillRect(width / 2 + 4, 24, width / 2 - 28, height - 48);

        // Story Prose
        const chapterNum = activePage - 1;
        ctx.fillStyle = '#b45309';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`CHAPTER ${chapterNum}`, 44, 64);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 16px serif';
        const chapterTitle =
          chapterNum === 1
            ? `${childName}'s Journey Begins`
            : chapterNum === 2
            ? `The Secret of the Starlight Compass`
            : `The Grand Victory Celebration`;
        ctx.fillText(chapterTitle, 44, 90);

        ctx.fillStyle = '#334155';
        ctx.font = '12px serif';
        const chapterLines =
          chapterNum === 1
            ? [
                `The morning sun peered into ${childName}'s window.`,
                `Today wasn't an ordinary morning in the neighborhood.`,
                `A tiny brass courier bot rolled up with a golden parcel.`,
                `"Wake up, ${childName}!" chimed Leo The Story Lion.`,
                `"The galaxy needs someone bold enough to lead the expedition!"`,
              ]
            : chapterNum === 2
            ? [
                `Higher and higher they climbed above the velvet clouds.`,
                `${childName} reached out a steady hand to hold the compass.`,
                `The glowing constellation aligned directly with their path.`,
                `"I knew you had it in you!" cheered Leo with a joyful roar.`,
                `Together, there was no mystery they could not conquer.`,
              ]
            : [
                `The entire kingdom gathered to celebrate ${childName}'s triumph.`,
                `A crown of starlight was placed gently upon their head.`,
                `"Never forget this moment," whispered Carty and Leo warmly.`,
                `Because in every heart that dares to dream,`,
                `a magnificent adventure is always waiting to be written.`,
              ];

        let lineY = 125;
        chapterLines.forEach((l) => {
          ctx.fillText(l, 44, lineY);
          lineY += 24;
        });

        // Right Page Illustration Stage
        const illGrad = ctx.createLinearGradient(width / 2 + 16, 44, width - 44, height - 60);
        illGrad.addColorStop(0, '#eff6ff');
        illGrad.addColorStop(1, '#fef3c7');
        ctx.fillStyle = illGrad;
        ctx.fillRect(width / 2 + 16, 44, width / 2 - 48, height - 88);

        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('★ ILLUSTRATION STAGE ★', (3 * width) / 4 - 8, 80);

        ctx.fillStyle = '#64748b';
        ctx.font = '11px sans-serif';
        ctx.fillText(`Scene ${chapterNum}: ${childName} & Friends`, (3 * width) / 4 - 8, 105);
        ctx.fillText('Tap to stamp custom sticker badges below!', (3 * width) / 4 - 8, 125);

        // Page Number
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px sans-serif';
        ctx.fillText(`Page ${activePage * 2 - 1}`, width / 4, height - 40);
        ctx.fillText(`Page ${activePage * 2}`, (3 * width) / 4, height - 40);
      }
    } else if (mode === 'poster') {
      // Custom Framed Poster Engine
      const {
        headline = 'REACH FOR THE STARS',
        subquote = 'Dream bigger, explore further, and shine bright.',
        artStyle = 'cosmic',
        frame = 'oak',
      } = config;

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
        // Minimal
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
      ctx.fillStyle = artStyle === 'minimal' ? '#0f172a' : '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(headline.toUpperCase(), width / 2, artInset + artH - 70);

      ctx.fillStyle = artStyle === 'minimal' ? '#475569' : 'rgba(255, 255, 255, 0.85)';
      ctx.font = '12px sans-serif';
      ctx.fillText(subquote, width / 2, artInset + artH - 42);

      ctx.font = '10px sans-serif';
      ctx.fillStyle = artStyle === 'minimal' ? '#94a3b8' : 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('CUSTOM GALLERY PRINT • ARCHIVAL EDITION', width / 2, artInset + artH - 22);
    } else if (mode === 'apparel') {
      // Kids' Apparel & Shoes Engine
      const {
        garment = 'hoodie',
        color = '#1e293b',
        monogram = 'NOAH',
      } = config;

      // Clean Background Studio Stage
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Garment Shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
      ctx.beginPath();
      ctx.ellipse(width / 2, height - 40, 110, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      if (garment === 'hoodie' || garment === 'tee') {
        // Garment Silhouette
        ctx.fillStyle = color;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;

        ctx.beginPath();
        // Neckline
        ctx.moveTo(width / 2 - 34, 70);
        ctx.quadraticCurveTo(width / 2, 85, width / 2 + 34, 70);
        // Right shoulder
        ctx.lineTo(width / 2 + 100, 110);
        // Right sleeve
        ctx.lineTo(width / 2 + 135, 175);
        ctx.lineTo(width / 2 + 95, 195);
        ctx.lineTo(width / 2 + 75, 150);
        // Right torso
        ctx.lineTo(width / 2 + 70, height - 70);
        // Hem
        ctx.lineTo(width / 2 - 70, height - 70);
        // Left torso
        ctx.lineTo(width / 2 - 75, 150);
        // Left sleeve
        ctx.lineTo(width / 2 - 95, 195);
        ctx.lineTo(width / 2 - 135, 175);
        // Left shoulder
        ctx.lineTo(width / 2 - 100, 110);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Collar Ribbing
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(width / 2, 70, 34, 12, 0, 0, Math.PI);
        ctx.fill();

        // Monogram Embroidery Text on Chest
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
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

        // Monogram on Heel Collar
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(monogram.toUpperCase(), width / 2 - 65, height / 2 - 15);
      }
    }

    // Render Draggable Stickers Layer
    stickers.forEach((s) => {
      drawSticker(ctx, s);
    });
  }, [width, height, mode, config, stickers, drawSticker]);

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

    // Check if clicked an existing sticker to drag
    const clickedSticker = [...stickers].reverse().find((s) => {
      const dist = Math.hypot(s.x - x, s.y - y);
      return dist <= 24 * (s.scale || 1);
    });

    if (clickedSticker) {
      isDraggingRef.current = true;
      dragTargetRef.current = clickedSticker.id;
    } else if (selectedSticker) {
      // Stamp new sticker
      const newSticker = {
        id: `stamp-${Date.now()}`,
        type: selectedSticker,
        x,
        y,
        scale: 1.2,
      };
      onUpdateStickers([...stickers, newSticker]);
    } else if (onCanvasClick) {
      onCanvasClick(x, y);
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
