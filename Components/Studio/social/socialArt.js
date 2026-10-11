/**
 * The social post's own art: colour themes, backdrops and the substrate that
 * paints them. A post is a digital product, so the "substrate" is the post's
 * background; everything on it is ordinary workbench layers.
 *
 * Pure module: no React.
 */

import { drawEnvironmentScene } from '../sceneRenderer';

export const SOCIAL_FORMATS = [
  {
    id: 'square',
    name: 'Square post',
    sub: 'Instagram · Facebook',
    ratio: 1,
    exportWidth: 1080,
  },
  {
    id: 'story',
    name: 'Story',
    sub: 'Stories · Reels · TikTok',
    ratio: 9 / 16,
    exportWidth: 1080,
  },
  {
    id: 'pin',
    name: 'Pin',
    sub: 'Pinterest',
    ratio: 2 / 3,
    exportWidth: 1000,
  },
  {
    id: 'flyer',
    name: 'Flier',
    sub: 'Print or post',
    ratio: 3 / 4,
    exportWidth: 1200,
  },
  {
    id: 'banner',
    name: 'Banner',
    sub: 'X · LinkedIn',
    ratio: 16 / 9,
    exportWidth: 1200,
  },
];

export const formatById = (id) =>
  SOCIAL_FORMATS.find((f) => f.id === id) ?? SOCIAL_FORMATS[0];

/** bg → edge is the backdrop gradient; accent is the brand pop; text reads on bg. */
export const SOCIAL_THEMES = [
  {
    id: 'obsidian',
    name: 'Midnight gold',
    bg: '#0b1020',
    edge: '#1b2547',
    accent: '#e8b44c',
    text: '#ffffff',
  },
  {
    id: 'cream',
    name: 'Alabaster',
    bg: '#fbf7ee',
    edge: '#efe4cc',
    accent: '#1b2547',
    text: '#141a2e',
  },
  {
    id: 'sunny',
    name: 'Sunny day',
    bg: '#fff1c9',
    edge: '#ffd27a',
    accent: '#e8553e',
    text: '#3a2414',
  },
  {
    id: 'bubblegum',
    name: 'Bubblegum',
    bg: '#ffe4f1',
    edge: '#ffb8d9',
    accent: '#c2266b',
    text: '#3d0f24',
  },
  {
    id: 'mint',
    name: 'Fresh mint',
    bg: '#e3fbf2',
    edge: '#a9ecd3',
    accent: '#0d8a63',
    text: '#0c3326',
  },
  {
    id: 'cobalt',
    name: 'Electric cobalt',
    bg: '#06122e',
    edge: '#0f3a8a',
    accent: '#5cc8ff',
    text: '#ffffff',
  },
  {
    id: 'crimson',
    name: 'Crimson heat',
    bg: '#1c0508',
    edge: '#5c0d16',
    accent: '#ff5a4f',
    text: '#ffffff',
  },
  {
    id: 'volt',
    name: 'Volt',
    bg: '#07090f',
    edge: '#16202b',
    accent: '#b6f24a',
    text: '#ffffff',
  },
];

export const themeById = (id) =>
  SOCIAL_THEMES.find((t) => t.id === id) ?? SOCIAL_THEMES[0];

const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
};

/**
 * Named colour roles a layer can carry (`colorRole`, `fillRole`), so a new
 * theme repaints the words and badges it chose and nothing else.
 */
export const socialPalette = (themeId) => {
  const t = themeById(themeId);
  return {
    bg: t.bg,
    text: t.text,
    accent: t.accent,
    // Words that sit on the accent colour.
    ink: lum(t.accent) > 0.55 ? '#141a2e' : '#ffffff',
    soft: lum(t.bg) > 0.5 ? 'rgba(20, 26, 46, 0.62)' : 'rgba(255,255,255,0.72)',
  };
};

export const BACKDROPS = [
  { id: 'glow', name: 'Glow' },
  { id: 'rays', name: 'Sunrays' },
  { id: 'confetti', name: 'Confetti' },
  { id: 'dots', name: 'Polka dots' },
  { id: 'spotlight', name: 'Spotlight' },
  { id: 'plain', name: 'Plain' },
];

/** Deterministic scatter so the backdrop never shimmers between paints. */
const scatter = (count, seed = 7) => {
  let x = seed;
  const next = () => {
    x = (x * 16807) % 2147483647;
    return x / 2147483647;
  };
  return Array.from({ length: count }, () => [next(), next(), next()]);
};
const CONFETTI = scatter(70, 11);

const alpha = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export function drawSocialSubstrate(ctx, { width, height, config = {} }) {
  const {
    theme = 'obsidian',
    backdrop = 'glow',
    sceneId = null,
    timeOfDay = 'day',
  } = config;
  const t = themeById(theme);

  if (sceneId) {
    drawEnvironmentScene(ctx, {
      sceneId,
      stageX: 0,
      stageY: 0,
      stageW: width,
      stageH: height,
      timeOfDay,
      weatherEffect: 'none',
      isFullBleed: true,
    });
    return;
  }

  const ground = ctx.createLinearGradient(0, 0, width * 0.4, height);
  ground.addColorStop(0, t.bg);
  ground.addColorStop(1, t.edge);
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, width, height);

  const long = Math.max(width, height);
  const cx = width / 2;

  if (backdrop === 'glow' || backdrop === 'spotlight') {
    const cy = backdrop === 'spotlight' ? height * 0.42 : height * 0.3;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, long * 0.6);
    glow.addColorStop(
      0,
      alpha(t.accent, backdrop === 'spotlight' ? 0.42 : 0.3)
    );
    glow.addColorStop(1, alpha(t.accent, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    if (backdrop === 'spotlight') {
      // A soft floor for a product to stand on.
      const floor = ctx.createRadialGradient(
        cx,
        height * 0.74,
        0,
        cx,
        height * 0.74,
        width * 0.5
      );
      floor.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
      floor.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.save();
      ctx.translate(0, height * 0.74);
      ctx.scale(1, 0.18);
      ctx.translate(0, -height * 0.74);
      ctx.fillStyle = floor;
      ctx.fillRect(0, 0, width, height * 2);
      ctx.restore();
    }
  } else if (backdrop === 'rays') {
    const cy = height * 0.42;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = alpha(t.accent, 0.16);
    const rays = 18;
    for (let i = 0; i < rays; i += 1) {
      const a = (i / rays) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, long, a, a + Math.PI / rays);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  } else if (backdrop === 'confetti') {
    const colors = [t.accent, '#ffd25e', '#5cc8ff', '#ff7aa8', '#7be0a6'];
    CONFETTI.forEach(([u, v, w], i) => {
      ctx.save();
      ctx.translate(u * width, v * height);
      ctx.rotate(w * Math.PI);
      ctx.fillStyle = alpha(colors[i % colors.length], 0.85);
      const s = long * (0.008 + w * 0.01);
      if (i % 3 === 0) {
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
        ctx.fill();
      } else ctx.fillRect(-s, -s * 0.35, s * 2, s * 0.7);
      ctx.restore();
    });
  } else if (backdrop === 'dots') {
    const step = long / 14;
    ctx.fillStyle = alpha(t.accent, 0.14);
    for (let y = step / 2, row = 0; y < height + step; y += step, row += 1)
      for (let x = row % 2 ? step : step / 2; x < width + step; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, step * 0.16, 0, Math.PI * 2);
        ctx.fill();
      }
  }

  // A whisper of vignette pulls the eye in on every backdrop.
  const vignette = ctx.createRadialGradient(
    cx,
    height / 2,
    long * 0.3,
    cx,
    height / 2,
    long * 0.8
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}
