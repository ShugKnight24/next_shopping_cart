import Head from 'next/head';
import Link from 'next/link';
import PropTypes from 'prop-types';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMascot } from '../../context/MascotProvider';
import products from '../../data/products.json';
import {
  CheckCircleIcon,
  ChevronLeft,
  CloseIcon,
  EyeIcon,
  RotateCcwIcon,
  ShareIcon,
  SparklesIcon,
} from '../Icons';
import { useToast } from '../UI/Toast';
import { DesignBar } from './core/DesignBar';
import { createDesignDoc, summarizeDesign } from './core/designDoc';
import { OptionPills, StudioSlider, SwatchRow } from './core/StudioControls';
import {
  useDesignHistory,
  useUndoRedoShortcuts,
} from './core/useDesignHistory';
import { useDesignPersistence } from './core/useDesignPersistence';
import styles from './SocialStudio.module.css';

/* ------------------------------------------------------------- formats -- */

/**
 * `width`/`height` are design units — the coordinate space every layer lives
 * in. `exportWidth` is the real pixel width of the downloaded PNG; the height
 * is derived so the export is the design aspect exactly, and the shopper-facing
 * label is derived from both. Previously the label advertised a resolution the
 * file never had.
 */
const PLATFORM_SPECS = [
  {
    id: 'flyer_print',
    name: 'Promotional Flier',
    aspect: '3:4',
    width: 420,
    height: 560,
    exportWidth: 1200,
    labelPrefix: 'Flyer Poster',
  },
  {
    id: 'instagram_post',
    name: 'Instagram Square',
    aspect: '1:1',
    width: 440,
    height: 440,
    exportWidth: 1080,
    labelPrefix: 'Feed Post',
  },
  {
    id: 'instagram_story',
    name: 'Story & TikTok',
    aspect: '9:16',
    width: 315,
    height: 560,
    exportWidth: 1080,
    labelPrefix: 'Vertical Reel',
  },
  {
    id: 'twitter_x',
    name: 'Twitter / X Banner',
    aspect: '16:9',
    width: 528,
    height: 297,
    exportWidth: 1200,
    labelPrefix: 'Landscape Feed',
  },
  {
    id: 'pinterest_pin',
    name: 'Pinterest Pin',
    aspect: '2:3',
    width: 360,
    height: 540,
    exportWidth: 1000,
    labelPrefix: 'Product Pin',
  },
];

export const PLATFORMS = PLATFORM_SPECS.map((spec) => {
  const exportHeight = Math.round(
    (spec.exportWidth * spec.height) / spec.width
  );
  return {
    ...spec,
    exportHeight,
    label: `${spec.labelPrefix} (${spec.exportWidth}×${exportHeight})`,
  };
});

export const TEMPLATES = [
  {
    id: 'minimal_luxury',
    name: 'Luxury Minimalist',
    badge: 'Editorial',
    desc: 'Understated dark slate elegance, serif typography, and fine gold accents.',
  },
  {
    id: 'hype_drop',
    name: 'Hype Drop Streetwear',
    badge: 'High Energy',
    desc: 'Cyberpunk neon volt accents, industrial tape, and bold drop typography.',
  },
  {
    id: 'flash_sale',
    name: 'Flash Sale & Promo',
    badge: 'Conversion',
    desc: 'Vibrant gradient bursts, discount ribbon, and coupon code callout.',
  },
  {
    id: 'creator_spotlight',
    name: 'Customer Spotlight',
    badge: 'Social Proof',
    desc: '5-star gold ratings, pull quote, and verified customer badge.',
  },
];

export const COLOR_THEMES = [
  {
    id: 'obsidian',
    name: 'Obsidian Midnight',
    bg: '#090d16',
    accent: '#f59e0b',
  },
  {
    id: 'luxe_cream',
    name: 'Alabaster Luxe',
    bg: '#fdfbf7',
    accent: '#0f172a',
  },
  { id: 'cyber_volt', name: 'Cyber Volt', bg: '#050811', accent: '#a3e635' },
  {
    id: 'electric_blue',
    name: 'Electric Cobalt',
    bg: '#030712',
    accent: '#38bdf8',
  },
  {
    id: 'crimson_drop',
    name: 'Crimson Heat',
    bg: '#180507',
    accent: '#ef4444',
  },
];

/**
 * Canvas typefaces.
 *
 * The previous stacks led with 'Cinzel', 'Playfair Display', 'Impact' and
 * 'Brush Script MT' while nothing ever loaded a webfont, so every one of them
 * silently fell back to the generic family and the picker promised a look it
 * could not deliver. This component cannot add a `<link>` to the document head
 * of the app shell, so the stacks below are deliberately built from faces that
 * ship with macOS/Windows/Android plus a generic family that always resolves,
 * and the labels describe what actually renders.
 */
const FONT_OPTIONS = [
  {
    id: 'sans',
    name: 'System Sans',
    stack:
      "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  {
    id: 'serif',
    name: 'Georgia Serif',
    stack: "Georgia, 'Times New Roman', Times, serif",
  },
  {
    id: 'display',
    name: 'Heavy Display',
    stack:
      "Impact, Haettenschweiler, 'Arial Narrow Bold', 'Arial Black', sans-serif",
  },
  {
    id: 'script',
    name: 'Casual Script',
    stack: "'Brush Script MT', 'Segoe Script', 'Snell Roundhand', cursive",
  },
  {
    id: 'mono',
    name: 'Utility Mono',
    stack: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
];

const FONT_STACKS = Object.fromEntries(
  FONT_OPTIONS.map((f) => [f.id, f.stack])
);

const WEIGHT_OPTIONS = [
  { id: '400', name: 'Regular' },
  { id: '600', name: 'Medium' },
  { id: '700', name: 'Bold' },
  { id: '800', name: 'Black' },
];

const ALIGN_OPTIONS = [
  { id: 'left', name: 'Left' },
  { id: 'center', name: 'Center' },
  { id: 'right', name: 'Right' },
];

/** `badgeStyle` used to be written in six places and read in none. */
const BADGE_STYLES = [
  { id: 'solid', name: 'Solid' },
  { id: 'outline', name: 'Outline' },
  { id: 'ticket', name: 'Ticket' },
  { id: 'tag', name: 'Tag' },
];

const LEGACY_BADGE_STYLES = {
  vip: 'solid',
  limited: 'tag',
  discount: 'ticket',
};

const resolveBadgeStyle = (value) =>
  LEGACY_BADGE_STYLES[value] ?? (value || 'solid');

/* ----------------------------------------------------------- colour math -- */

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const hexToRgb = (hex) => {
  const raw = String(hex || '').replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.padEnd(6, '0').slice(0, 6);
  return [
    parseInt(full.slice(0, 2), 16) || 0,
    parseInt(full.slice(2, 4), 16) || 0,
    parseInt(full.slice(4, 6), 16) || 0,
  ];
};

const rgbToHex = ([r, g, b]) =>
  `#${[r, g, b]
    .map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0'))
    .join('')}`;

const mixHex = (a, b, t) => {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex([r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t]);
};

const shadeHex = (hex, amount) =>
  mixHex(hex, amount < 0 ? '#000000' : '#ffffff', Math.abs(amount));

const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Text that sits on top of the accent colour. */
const readableInk = (hex) => (luminance(hex) > 0.55 ? '#0f172a' : '#ffffff');

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** `input[type=color]` cannot represent `rgba(…)` and silently shows black. */
const asHexInput = (value, fallback) =>
  HEX_PATTERN.test(value ?? '') ? value : fallback;

/**
 * One palette derived from one theme. The canvas background used to come from a
 * hardcoded gradient table that disagreed with the swatch the shopper picked;
 * every colour the composition uses now comes from here.
 */
const themePalette = (theme) => {
  const base = theme ?? COLOR_THEMES[0];
  const isLight = luminance(base.bg) > 0.5;
  const text = isLight ? '#0f172a' : '#ffffff';

  return {
    id: base.id,
    isLight,
    accent: base.accent,
    ink: readableInk(base.accent),
    bg: base.bg,
    bgEdge: isLight
      ? mixHex(base.bg, base.accent, 0.09)
      : shadeHex(mixHex(base.bg, base.accent, 0.28), -0.42),
    text,
    subtext: mixHex(text, base.bg, 0.42),
    panel: isLight ? '#ffffff' : mixHex(base.bg, '#ffffff', 0.12),
    panelStroke: isLight
      ? mixHex(base.bg, '#000000', 0.18)
      : mixHex(base.bg, '#ffffff', 0.28),
    glow: `${base.accent}22`,
    grain: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)',
  };
};

/**
 * Re-tint without re-seeding. A layer records *which* palette slot each of its
 * colours came from; changing the palette re-resolves those slots and leaves
 * everything the shopper positioned, typed or hand-coloured alone. (Setting a
 * colour by hand clears its role, so a manual override survives a theme swap.)
 */
const TINT_ROLES = [
  ['color', 'colorRole'],
  ['fill', 'fillRole'],
  ['bg', 'bgRole'],
  ['stroke', 'strokeRole'],
];

const retintLayers = (layers, palette) =>
  layers.map((layer) => {
    let next = layer;
    TINT_ROLES.forEach(([key, roleKey]) => {
      const role = layer[roleKey];
      const resolved = role ? palette[role] : undefined;
      if (resolved && resolved !== next[key]) {
        next = next === layer ? { ...layer } : next;
        next[key] = resolved;
      }
    });
    return next;
  });

/* ---------------------------------------------------------------- layers -- */

const productImageSrc = (product) =>
  product?.image || product?.images?.[0] || null;

const layerId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function generateStarterLayers(templateId, platformId, product, palette) {
  const platform = PLATFORMS.find((p) => p.id === platformId) || PLATFORMS[0];
  const { width, height } = platform;

  const prodName = (product?.productName || 'ICONIC PRODUCT').toUpperCase();
  const prodPrice = `$${product?.price ?? 120}`;
  const prodBrand = (product?.manufacturer || 'CART COMMERCE').toUpperCase();
  const imageSrc = productImageSrc(product);

  const productLayer = (overrides) => ({
    id: 'product-card',
    name: 'Product Hero Showcase',
    type: 'product',
    productTitle: prodName,
    productPrice: prodPrice,
    productCategory: product?.category || 'Curated Goods',
    imageSrc,
    borderRadius: 12,
    fill: palette.panel,
    fillRole: 'panel',
    stroke: palette.panelStroke,
    strokeRole: 'panelStroke',
    opacity: 1,
    visible: true,
    ...overrides,
  });

  switch (templateId) {
    case 'hype_drop':
      return [
        {
          id: 'tape-top',
          name: 'Caution Tape Top',
          type: 'shape',
          shapeType: 'rect',
          x: width / 2,
          y: 18,
          width,
          height: 16,
          fill: palette.accent,
          fillRole: 'accent',
          borderRadius: 0,
          opacity: 0.9,
          visible: true,
        },
        {
          id: 'badge-drop',
          name: 'Drop Badge',
          type: 'badge',
          badgeStyle: 'tag',
          text: 'LIMITED DROP • 2026 ARCHIVE',
          fontSize: 10,
          fontWeight: 800,
          x: width / 2,
          y: 48,
          width: 190,
          height: 24,
          color: palette.ink,
          colorRole: 'ink',
          bg: palette.accent,
          bgRole: 'accent',
          opacity: 1,
          visible: true,
        },
        {
          id: 'headline',
          name: 'Main Headline',
          type: 'text',
          text: `${prodName} ARCHIVE`,
          fontFamily: 'display',
          fontSize: Math.min(24, Math.floor(width / 16)),
          fontWeight: 800,
          color: palette.text,
          colorRole: 'text',
          x: width / 2,
          y: 92,
          width: width - 40,
          height: 40,
          align: 'center',
          opacity: 1,
          visible: true,
        },
        productLayer({
          name: 'Product Hero Showcase',
          productCategory: product?.category || 'Streetwear & Kicks',
          x: width / 2,
          y: height * 0.46,
          width: Math.min(width - 48, 260),
          height: 148,
        }),
        {
          id: 'subtext',
          name: 'Description Copy',
          type: 'text',
          text: 'Verified deadstock. Vault-grade priority shipping included.',
          fontFamily: 'sans',
          fontSize: 12,
          fontWeight: 600,
          color: palette.subtext,
          colorRole: 'subtext',
          x: width / 2,
          y: height - 84,
          width: width - 60,
          height: 32,
          align: 'center',
          opacity: 1,
          visible: true,
        },
        {
          id: 'price-tag',
          name: 'Price & CTA Badge',
          type: 'badge',
          badgeStyle: 'solid',
          text: `COP NOW — ${prodPrice}`,
          fontSize: 12,
          fontWeight: 800,
          x: width / 2,
          y: height - 44,
          width: 170,
          height: 32,
          color: palette.ink,
          colorRole: 'ink',
          bg: palette.accent,
          bgRole: 'accent',
          opacity: 1,
          visible: true,
        },
      ];

    case 'flash_sale':
      return [
        {
          id: 'starburst',
          name: '50% OFF Starburst',
          type: 'shape',
          shapeType: 'starburst',
          text: '50% OFF',
          x: width - 54,
          y: 54,
          width: 72,
          height: 72,
          fill: '#ef4444',
          opacity: 1,
          visible: true,
        },
        {
          id: 'headline',
          name: 'Promo Headline',
          type: 'text',
          text: `${prodName} FLASH SALE`,
          fontFamily: 'display',
          fontSize: 24,
          fontWeight: 800,
          color: palette.text,
          colorRole: 'text',
          x: width / 2,
          y: 56,
          width: width - 130,
          height: 44,
          align: 'center',
          opacity: 1,
          visible: true,
        },
        productLayer({
          name: 'Product Stage',
          productCategory: product?.category || 'Special Edition',
          x: width / 2,
          y: height * 0.44,
          width: Math.min(width - 48, 260),
          height: 148,
        }),
        {
          id: 'coupon-pill',
          name: 'Coupon Code Pill',
          type: 'badge',
          badgeStyle: 'ticket',
          text: 'CODE: FLASH2026 • 24H ONLY',
          fontSize: 10,
          fontWeight: 700,
          x: width / 2,
          y: height - 76,
          width: 194,
          height: 26,
          color: '#0f172a',
          bg: '#ffffff',
          opacity: 1,
          visible: true,
        },
        {
          id: 'cta-pill',
          name: 'Call to Action Button',
          type: 'badge',
          badgeStyle: 'solid',
          text: `CLAIM FOR ${prodPrice}`,
          fontSize: 12,
          fontWeight: 800,
          x: width / 2,
          y: height - 38,
          width: 180,
          height: 30,
          color: '#ffffff',
          bg: '#ef4444',
          opacity: 1,
          visible: true,
        },
      ];

    case 'creator_spotlight':
      return [
        {
          id: 'rating-badge',
          name: '5-Star Rating',
          type: 'text',
          text: '★★★★★ VERIFIED 5.0 RATING',
          fontFamily: 'sans',
          fontSize: 11,
          fontWeight: 700,
          color: palette.accent,
          colorRole: 'accent',
          x: width / 2,
          y: 40,
          width: width - 60,
          height: 20,
          align: 'center',
          opacity: 1,
          visible: true,
        },
        productLayer({
          name: 'Product Card',
          productCategory: product?.category || 'Customer Favorite',
          x: width / 2,
          y: height * 0.38,
          width: Math.min(width - 56, 250),
          height: 140,
        }),
        {
          id: 'quote-card',
          name: 'Customer Endorsement Box',
          type: 'shape',
          shapeType: 'card',
          x: width / 2,
          y: height - 78,
          width: width - 50,
          height: 92,
          fill: palette.panel,
          fillRole: 'panel',
          stroke: palette.panelStroke,
          strokeRole: 'panelStroke',
          strokeWidth: 1,
          borderRadius: 10,
          opacity: 1,
          visible: true,
        },
        {
          id: 'headline',
          name: 'Quote Title',
          type: 'text',
          text: `"${prodName} IS UNMATCHED"`,
          fontFamily: 'serif',
          fontSize: 15,
          fontWeight: 700,
          color: palette.text,
          colorRole: 'text',
          x: width / 2,
          y: height - 100,
          width: width - 74,
          height: 22,
          align: 'center',
          opacity: 1,
          visible: true,
        },
        {
          id: 'subtext',
          name: 'Quote Body',
          type: 'text',
          text: '"The build quality is beyond expectations. Shipping was lightning fast!"',
          fontFamily: 'serif',
          fontSize: 11,
          fontWeight: 400,
          color: palette.subtext,
          colorRole: 'subtext',
          x: width / 2,
          y: height - 74,
          width: width - 74,
          height: 30,
          align: 'center',
          opacity: 1,
          visible: true,
        },
        {
          id: 'verified-stamp',
          name: 'Buyer Attribution',
          type: 'text',
          text: 'Verified Vault Collector • 2026',
          fontFamily: 'sans',
          fontSize: 10,
          fontWeight: 700,
          color: palette.accent,
          colorRole: 'accent',
          x: width / 2,
          y: height - 50,
          width: width - 74,
          height: 16,
          align: 'center',
          opacity: 1,
          visible: true,
        },
      ];

    case 'minimal_luxury':
    default:
      return [
        {
          id: 'border-outer',
          name: 'Gold Framing Border',
          type: 'shape',
          shapeType: 'border',
          x: width / 2,
          y: height / 2,
          width: width - 36,
          height: height - 36,
          stroke: palette.accent,
          strokeRole: 'accent',
          strokeWidth: 1.5,
          opacity: 1,
          visible: true,
        },
        {
          id: 'brand-header',
          name: 'Brand Eyebrow',
          type: 'text',
          text: `${prodBrand} • DROP 2026`,
          fontFamily: 'sans',
          fontSize: 10,
          fontWeight: 700,
          color: palette.accent,
          colorRole: 'accent',
          x: width / 2,
          y: 42,
          width: width - 80,
          height: 18,
          align: 'center',
          opacity: 1,
          visible: true,
        },
        {
          id: 'stage-orb',
          name: 'Spotlight Radial Glow',
          type: 'shape',
          shapeType: 'circle',
          x: width / 2,
          y: height * 0.42,
          width: width * 0.68,
          height: width * 0.68,
          fill: palette.glow,
          fillRole: 'glow',
          opacity: 1,
          visible: true,
        },
        productLayer({
          productCategory: product?.category || 'Luxury Goods',
          x: width / 2,
          y: height * 0.42,
          width: Math.min(width - 56, 250),
          height: 140,
        }),
        {
          id: 'badge-pill',
          name: 'Crest Badge',
          type: 'badge',
          badgeStyle: 'solid',
          text: 'AUTHENTIC DROP',
          fontSize: 10,
          fontWeight: 800,
          x: width / 2,
          y: height * 0.42 + 88,
          width: 130,
          height: 22,
          color: palette.ink,
          colorRole: 'ink',
          bg: palette.accent,
          bgRole: 'accent',
          opacity: 1,
          visible: true,
        },
        {
          id: 'headline',
          name: 'Main Headline',
          type: 'text',
          text: `${prodName} ARCHIVE`,
          fontFamily: 'serif',
          fontSize: 20,
          fontWeight: 700,
          color: palette.text,
          colorRole: 'text',
          x: width / 2,
          y: height - 90,
          width: width - 60,
          height: 30,
          align: 'center',
          opacity: 1,
          visible: true,
        },
        {
          id: 'subtext',
          name: 'Subtitle',
          type: 'text',
          text: 'Crafted with premium materials. Available in limited quantities.',
          fontFamily: 'sans',
          fontSize: 11,
          fontWeight: 400,
          color: palette.subtext,
          colorRole: 'subtext',
          x: width / 2,
          y: height - 64,
          width: width - 80,
          height: 28,
          align: 'center',
          opacity: 1,
          visible: true,
        },
        {
          id: 'price-cta',
          name: 'Price Callout',
          type: 'text',
          text: `${prodPrice}  |  OFFICIAL DROP`,
          fontFamily: 'sans',
          fontSize: 14,
          fontWeight: 700,
          color: palette.accent,
          colorRole: 'accent',
          x: width / 2,
          y: height - 40,
          width: 200,
          height: 22,
          align: 'center',
          opacity: 1,
          visible: true,
        },
      ];
  }
}

/* -------------------------------------------------------------- painting -- */

/** Every rounded-rect path starts here, so `fill()` can never inherit a path. */
const pathRoundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2)));
  } else {
    ctx.rect(x, y, w, h);
  }
};

const measureWidth = (ctx, text) =>
  typeof ctx.measureText === 'function'
    ? (ctx.measureText(text)?.width ?? 0)
    : 0;

/**
 * Greedy word wrap to `maxWidth`. Falls back to the raw paragraphs when the
 * context cannot measure (headless/test canvases) rather than dropping copy.
 */
function wrapText(ctx, text, maxWidth) {
  const source = String(text ?? '');
  if (!source) return [];

  const paragraphs = source.split('\n');
  if (typeof ctx.measureText !== 'function' || !(maxWidth > 0)) {
    return paragraphs;
  }

  const lines = [];
  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push('');
      return;
    }

    let line = words[0];
    for (let i = 1; i < words.length; i += 1) {
      const candidate = `${line} ${words[i]}`;
      if (measureWidth(ctx, candidate) <= maxWidth) line = candidate;
      else {
        lines.push(line);
        line = words[i];
      }
    }
    lines.push(line);
  });

  return lines;
}

const clampLines = (lines, max) =>
  lines.length <= max
    ? lines
    : [...lines.slice(0, max - 1), `${lines[max - 1].trim()}…`];

function drawShapeLayer(ctx, layer, palette) {
  const lw = layer.width || 120;
  const lh = layer.height || 40;
  const x0 = layer.x - lw / 2;
  const y0 = layer.y - lh / 2;
  const hasStroke = layer.stroke && layer.stroke !== 'transparent';

  ctx.fillStyle = layer.fill || palette.glow;
  ctx.strokeStyle = layer.stroke || 'transparent';
  ctx.lineWidth = layer.strokeWidth || 1;

  if (layer.shapeType === 'border') {
    ctx.strokeRect(x0, y0, lw, lh);
    return;
  }

  if (layer.shapeType === 'circle') {
    ctx.beginPath();
    ctx.arc(layer.x, layer.y, lw / 2, 0, Math.PI * 2);
    ctx.fill();
    if (hasStroke) ctx.stroke();
    return;
  }

  if (layer.shapeType === 'starburst') {
    const points = 12;
    const outerR = lw / 2;
    const innerR = outerR * 0.72;
    ctx.beginPath();
    for (let p = 0; p < points * 2; p += 1) {
      const r = p % 2 === 0 ? outerR : innerR;
      const angle = (p * Math.PI) / points;
      const px = layer.x + Math.cos(angle) * r;
      const py = layer.y + Math.sin(angle) * r;
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    if (layer.text) {
      ctx.fillStyle = layer.color || '#ffffff';
      ctx.font = `800 ${layer.fontSize || 11}px ${FONT_STACKS.sans}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(layer.text, layer.x, layer.y);
    }
    return;
  }

  pathRoundRect(ctx, x0, y0, lw, lh, layer.borderRadius ?? 6);
  ctx.fill();
  if (hasStroke) ctx.stroke();
}

function drawProductLayer(ctx, layer, { palette, imageFor }) {
  const lw = layer.width || 220;
  const lh = layer.height || 140;
  const x0 = layer.x - lw / 2;
  const y0 = layer.y - lh / 2;
  const radius = layer.borderRadius ?? 12;

  ctx.fillStyle = layer.fill || palette.panel;
  ctx.strokeStyle = layer.stroke || palette.panelStroke;
  ctx.lineWidth = layer.strokeWidth || 1;
  pathRoundRect(ctx, x0, y0, lw, lh, radius);
  ctx.fill();
  ctx.stroke();

  const pad = Math.max(8, Math.round(lh * 0.08));
  const stacked = lw < lh * 1.5;
  const media = stacked
    ? { x: x0 + pad, y: y0 + pad, w: lw - pad * 2, h: lh * 0.5 }
    : {
        x: x0 + pad,
        y: y0 + pad,
        w: Math.min(lh - pad * 2, lw * 0.44),
        h: lh - pad * 2,
      };

  const image = imageFor?.(layer.imageSrc);
  ctx.save();
  pathRoundRect(
    ctx,
    media.x,
    media.y,
    media.w,
    media.h,
    Math.max(0, radius - 4)
  );
  if (typeof ctx.clip === 'function') ctx.clip();

  if (image && typeof ctx.drawImage === 'function') {
    const iw = image.naturalWidth || image.width || media.w;
    const ih = image.naturalHeight || image.height || media.h;
    const scale = Math.max(media.w / iw, media.h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(
      image,
      media.x + (media.w - dw) / 2,
      media.y + (media.h - dh) / 2,
      dw,
      dh
    );
  } else {
    // No artwork yet (still loading, blocked, or the product has none) — a
    // legible monogram plate beats an empty hole in the composition.
    ctx.fillStyle = palette.isLight
      ? 'rgba(15, 23, 42, 0.06)'
      : 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.fillStyle = palette.accent;
    ctx.font = `800 ${Math.round(Math.min(media.w, media.h) * 0.4)}px ${FONT_STACKS.display}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      String(layer.productTitle || 'P')
        .trim()
        .slice(0, 2)
        .toUpperCase(),
      media.x + media.w / 2,
      media.y + media.h / 2
    );
  }
  ctx.restore();

  const textX = stacked ? layer.x : media.x + media.w + pad;
  const textW = stacked ? lw - pad * 2 : x0 + lw - pad - textX;
  const align = stacked ? 'center' : 'left';
  const anchorX = stacked ? layer.x : textX;
  const base = clamp(Math.round(lh * 0.11), 9, 16);

  ctx.textAlign = align;
  ctx.textBaseline = 'middle';

  const top = stacked ? media.y + media.h + pad : y0 + pad;
  const bottom = y0 + lh - pad;

  ctx.fillStyle = palette.subtext;
  ctx.font = `700 ${Math.round(base * 0.68)}px ${FONT_STACKS.sans}`;
  ctx.fillText(
    String(layer.productCategory || 'CURATED DROP').toUpperCase(),
    anchorX,
    top + base * 0.4
  );

  ctx.fillStyle = palette.text;
  ctx.font = `700 ${base}px ${FONT_STACKS.sans}`;
  const titleLines = clampLines(
    wrapText(ctx, layer.productTitle || 'PRODUCT', textW),
    2
  );
  titleLines.forEach((line, i) => {
    ctx.fillText(line, anchorX, top + base * 1.6 + i * base * 1.2);
  });

  ctx.fillStyle = palette.accent;
  ctx.font = `800 ${Math.round(base * 1.15)}px ${FONT_STACKS.sans}`;
  ctx.fillText(layer.productPrice || '$120', anchorX, bottom - base * 0.5);
}

function drawBadgeLayer(ctx, layer, palette) {
  const lw = layer.width || 150;
  const lh = layer.height || 28;
  const x0 = layer.x - lw / 2;
  const y0 = layer.y - lh / 2;
  const style = resolveBadgeStyle(layer.badgeStyle);
  const radius = layer.borderRadius ?? lh / 2;
  const bg = layer.bg || palette.accent;
  const fg = layer.color || palette.ink;

  if (style === 'outline') {
    ctx.strokeStyle = bg;
    ctx.lineWidth = layer.strokeWidth || 1.5;
    pathRoundRect(ctx, x0, y0, lw, lh, radius);
    ctx.stroke();
  } else {
    ctx.fillStyle = bg;
    pathRoundRect(ctx, x0, y0, lw, lh, radius);
    ctx.fill();

    if (style === 'ticket') {
      ctx.strokeStyle = fg;
      ctx.lineWidth = 1;
      if (typeof ctx.setLineDash === 'function') ctx.setLineDash([3, 3]);
      pathRoundRect(
        ctx,
        x0 + 3,
        y0 + 3,
        lw - 6,
        lh - 6,
        Math.max(0, radius - 3)
      );
      ctx.stroke();
      if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
    }

    if (style === 'tag') {
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(x0 + lh * 0.45, layer.y, Math.max(2, lh * 0.12), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const inset = style === 'tag' ? lh * 0.9 : Math.max(8, lh * 0.4);
  ctx.fillStyle = style === 'outline' ? bg : fg;
  ctx.font = `${layer.fontWeight ?? 700} ${layer.fontSize || 10}px ${
    FONT_STACKS[layer.fontFamily] ?? FONT_STACKS.sans
  }`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lines = clampLines(wrapText(ctx, layer.text ?? '', lw - inset - 8), 2);
  const lineHeight = (layer.fontSize || 10) * 1.18;
  const startY = layer.y - ((lines.length - 1) * lineHeight) / 2;
  const centreX = style === 'tag' ? layer.x + lh * 0.25 : layer.x;
  lines.forEach((line, i) =>
    ctx.fillText(line, centreX, startY + i * lineHeight)
  );
}

function drawTextLayer(ctx, layer, { palette, height }) {
  const lw = layer.width || 120;
  const size = layer.fontSize || 18;
  const weight = layer.fontWeight ?? 700;

  ctx.font = `${weight} ${size}px ${
    FONT_STACKS[layer.fontFamily] ?? FONT_STACKS.sans
  }`;
  ctx.fillStyle = layer.color || palette.text;
  ctx.textAlign = layer.align || 'center';
  ctx.textBaseline = 'middle';

  const lines = wrapText(ctx, layer.text ?? '', lw);
  if (!lines.length) return;

  const lineHeight = size * 1.24;
  const startY = layer.y - ((lines.length - 1) * lineHeight) / 2;
  const drawX =
    layer.align === 'left'
      ? layer.x - lw / 2
      : layer.align === 'right'
        ? layer.x + lw / 2
        : layer.x;

  // Clipped on the horizontal only: copy is wrapped to the layer's width, but
  // silently swallowing a line that needs one more row is worse than letting
  // the block grow past its box.
  ctx.save();
  ctx.beginPath();
  ctx.rect(layer.x - lw / 2 - 1, 0, lw + 2, height);
  if (typeof ctx.clip === 'function') ctx.clip();

  const outlined = layer.stroke && (layer.strokeWidth ?? 0) > 0;
  if (outlined) {
    ctx.strokeStyle = layer.stroke;
    ctx.lineWidth = layer.strokeWidth;
    ctx.lineJoin = 'round';
  }

  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;
    if (outlined && typeof ctx.strokeText === 'function') {
      ctx.strokeText(line, drawX, y);
    }
    ctx.fillText(line, drawX, y);
  });

  ctx.restore();
}

/**
 * Paints one composition into any 2D context already scaled to `width`/`height`
 * design units — the on-screen canvas and the full-resolution export share it,
 * so what the shopper sees is exactly what downloads.
 */
function paintComposition(ctx, options) {
  const { width, height, palette, layers, imageFor, selection, guides } =
    options;

  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, palette.bg);
  bg.addColorStop(1, palette.bgEdge);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = palette.grain;
  for (let gx = 20; gx < width; gx += 40) {
    for (let gy = 20; gy < height; gy += 40) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  layers.forEach((layer) => {
    if (layer.visible === false) return;

    ctx.save();
    ctx.globalAlpha = clamp(layer.opacity ?? 1, 0, 1);

    if (layer.type === 'shape') drawShapeLayer(ctx, layer, palette);
    else if (layer.type === 'product')
      drawProductLayer(ctx, layer, { palette, imageFor });
    else if (layer.type === 'badge') drawBadgeLayer(ctx, layer, palette);
    else drawTextLayer(ctx, layer, { palette, height });

    ctx.restore();
  });

  if (guides?.v || guides?.h) {
    ctx.save();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1;
    if (typeof ctx.setLineDash === 'function') ctx.setLineDash([5, 4]);
    if (guides.v) {
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
    }
    if (guides.h) {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    }
    if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);
    ctx.restore();
  }

  if (!selection || selection.visible === false) return;

  ctx.save();
  const sw = selection.width || 120;
  const sh = selection.height || 40;
  const sx = selection.x;
  const sy = selection.y;

  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 1.5;
  if (typeof ctx.setLineDash === 'function') ctx.setLineDash([4, 3]);
  ctx.strokeRect(sx - sw / 2, sy - sh / 2, sw, sh);
  if (typeof ctx.setLineDash === 'function') ctx.setLineDash([]);

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#2563eb';
  [
    [sx - sw / 2, sy - sh / 2],
    [sx + sw / 2, sy - sh / 2],
    [sx + sw / 2, sy + sh / 2],
    [sx - sw / 2, sy + sh / 2],
  ].forEach(([cx, cy]) => {
    ctx.fillRect(cx - 3.5, cy - 3.5, 7, 7);
    ctx.strokeRect(cx - 3.5, cy - 3.5, 7, 7);
  });

  const labelText = `${selection.name ?? 'Layer'} (${Math.round(sw)}×${Math.round(sh)}px)`;
  ctx.font = `700 9px ${FONT_STACKS.sans}`;
  const labelWidth = measureWidth(ctx, labelText) || 90;
  ctx.fillStyle = '#2563eb';
  pathRoundRect(ctx, sx - sw / 2, sy - sh / 2 - 18, labelWidth + 12, 16, 4);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(labelText, sx - sw / 2 + 6, sy - sh / 2 - 10);

  ctx.restore();
}

/* ----------------------------------------------------------------- misc -- */

const DESIGN_LABELS = {
  platform: {
    label: 'Format',
    format: (v) => PLATFORMS.find((p) => p.id === v)?.label ?? v,
  },
  template: {
    label: 'Template',
    format: (v) => TEMPLATES.find((t) => t.id === v)?.name ?? v,
  },
  colorTheme: {
    label: 'Palette',
    format: (v) => COLOR_THEMES.find((c) => c.id === v)?.name ?? v,
  },
  productId: {
    label: 'Featured product',
    format: (v) => products.find((p) => p.itemid === v)?.productName ?? v,
  },
};

const DEFAULT_HASHTAGS =
  'streetwear drops grails curated limitededition design';

const buildCaption = (headline, product) =>
  [
    headline,
    '',
    product?.shortDescription ||
      product?.description ||
      'Exclusive drop available now at Cart Commerce.',
    '',
    `Shop the collection: https://cartcommerce.shop/products/${product?.itemid ?? ''}`,
  ].join('\n');

const formatHashtags = (raw) =>
  String(raw ?? '')
    .split(/[\s,#]+/)
    .filter(Boolean)
    .map((tag) => `#${tag}`)
    .join(' ');

function EyeOffIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M6.61 6.61A18.15 18.15 0 0 0 1 12s4 8 11 8a9.12 9.12 0 0 0 5.39-1.61" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

EyeOffIcon.propTypes = { size: PropTypes.number };

const NUDGE_KEYS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

const SNAP_TOLERANCE = 6;

/* ================================================================ studio == */

export function SocialStudio() {
  const { setMascot, speak } = useMascot();
  const { showToast } = useToast();

  const fieldId = useId();
  const id = (suffix) => `${fieldId}-${suffix}`;

  const [canvasEl, setCanvasEl] = useState(null);

  const [selectedPlatform, setSelectedPlatform] = useState('flyer_print');
  const [selectedTemplate, setSelectedTemplate] = useState('minimal_luxury');
  const [selectedColorTheme, setSelectedColorTheme] = useState('obsidian');
  const [selectedProductId, setSelectedProductId] = useState(
    products[0]?.itemid || 'SM57'
  );
  const [showPhoneMockup, setShowPhoneMockup] = useState(false);
  const [activeTab, setActiveTab] = useState('catalog');

  const [selectedLayerId, setSelectedLayerId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [guides, setGuides] = useState({ v: false, h: false });
  const [announcement, setAnnouncement] = useState('');

  const [captionDraft, setCaptionDraft] = useState(null);
  const [hashtags, setHashtags] = useState(DEFAULT_HASHTAGS);

  const history = useDesignHistory([], { limit: 80 });
  const { present: layers, commit, preview, reset, undo, redo } = history;

  useUndoRedoShortcuts({ undo, redo });

  const activeProduct = useMemo(
    () =>
      products.find((p) => p.itemid === selectedProductId) || products[0] || {},
    [selectedProductId]
  );

  const activePlatformObj =
    PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];
  const activeColorThemeObj =
    COLOR_THEMES.find((c) => c.id === selectedColorTheme) || COLOR_THEMES[0];

  const palette = useMemo(
    () => themePalette(activeColorThemeObj),
    [activeColorThemeObj]
  );

  const selectedLayer = useMemo(
    () => layers.find((l) => l.id === selectedLayerId) || null,
    [layers, selectedLayerId]
  );

  const layersRef = useRef(layers);
  layersRef.current = layers;

  const paletteRef = useRef(palette);
  paletteRef.current = palette;

  const productRef = useRef(activeProduct);
  productRef.current = activeProduct;

  /* -------------------------------------------------------- announcements */

  const announceTimer = useRef(null);
  const announce = useCallback((message) => {
    setAnnouncement(message);
    clearTimeout(announceTimer.current);
    announceTimer.current = setTimeout(() => setAnnouncement(''), 5000);
  }, []);

  useEffect(() => () => clearTimeout(announceTimer.current), []);

  /* --------------------------------------------------------- product art  */

  const imageCache = useRef(new Map());
  // Read, not discarded: an async image decode must land in the paint effect's
  // dependency list, or the re-render it triggers finds every dep unchanged and
  // the decoded product shot never reaches the canvas.
  const [imageRevision, setImageRevision] = useState(0);
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const imageFor = useCallback((src) => {
    if (!src || typeof window === 'undefined' || typeof Image === 'undefined') {
      return null;
    }

    const cached = imageCache.current.get(src);
    if (cached) return cached.status === 'ready' ? cached.image : null;

    const image = new Image();
    const entry = { status: 'loading', image };
    imageCache.current.set(src, entry);

    const settle = (status) => () => {
      entry.status = status;
      // A repaint is the only way an async decode reaches the canvas.
      if (isMounted.current) setImageRevision((n) => n + 1);
    };
    image.onload = settle('ready');
    image.onerror = settle('error');
    image.crossOrigin = 'anonymous';
    image.src = src;

    return null;
  }, []);

  /* ------------------------------------------------------------- seeding  */

  const seedSignature = useRef(null);
  const themeSignature = useRef(selectedColorTheme);

  useEffect(() => {
    const signature = `${selectedTemplate}|${selectedPlatform}`;
    if (seedSignature.current === signature) return;

    const isFirstSeed = seedSignature.current === null;
    seedSignature.current = signature;

    const seeded = generateStarterLayers(
      selectedTemplate,
      selectedPlatform,
      productRef.current,
      paletteRef.current
    );

    if (isFirstSeed) reset(seeded);
    else commit(seeded);

    setSelectedLayerId(
      seeded.find((l) => l.id === 'headline')?.id ?? seeded[0]?.id ?? null
    );
  }, [selectedTemplate, selectedPlatform, reset, commit]);

  /**
   * A palette change re-tints; it must never re-seed. The old effect listed the
   * theme object in its deps and threw away everything the shopper had done.
   */
  useEffect(() => {
    if (themeSignature.current === selectedColorTheme) return;
    themeSignature.current = selectedColorTheme;
    commit((prev) => retintLayers(prev, paletteRef.current));
  }, [selectedColorTheme, commit]);

  useEffect(() => {
    setMascot('sparky');
    speak(
      'Welcome to the post designer. Pick a template, drag anything on the canvas, and undo is always one step away.',
      'happy'
    );
  }, [setMascot, speak]);

  /* -------------------------------------------------------------- caption */

  const headlineLayer = layers.find((l) => l.id === 'headline') ?? null;
  const headline =
    headlineLayer?.text ??
    (activeProduct.productName
      ? `${activeProduct.productName.toUpperCase()} ARCHIVE`
      : 'EXCLUSIVE DROP');

  const caption = captionDraft ?? buildCaption(headline, activeProduct);

  /* ------------------------------------------------------------ the doc   */

  const doc = useMemo(
    () =>
      createDesignDoc({
        mode: 'social',
        options: {
          platform: selectedPlatform,
          template: selectedTemplate,
          colorTheme: selectedColorTheme,
          productId: selectedProductId,
          caption,
          hashtags,
        },
        layers,
      }),
    [
      selectedPlatform,
      selectedTemplate,
      selectedColorTheme,
      selectedProductId,
      caption,
      hashtags,
      layers,
    ]
  );

  const persistence = useDesignPersistence({ mode: 'social', doc });

  const applyDoc = useCallback(
    (incoming) => {
      if (!incoming) return;
      const options = incoming.options ?? {};

      if (options.platform) setSelectedPlatform(options.platform);
      if (options.template) setSelectedTemplate(options.template);
      if (options.colorTheme) setSelectedColorTheme(options.colorTheme);
      if (options.productId) setSelectedProductId(options.productId);
      setCaptionDraft(options.caption ?? null);
      setHashtags(options.hashtags ?? DEFAULT_HASHTAGS);

      // Pin the seed/tint guards to the incoming design so the effects above
      // see "already applied" instead of regenerating over the top of it.
      seedSignature.current = `${options.template ?? selectedTemplate}|${
        options.platform ?? selectedPlatform
      }`;
      themeSignature.current = options.colorTheme ?? selectedColorTheme;

      const restored = incoming.layers ?? [];
      reset(restored);
      setSelectedLayerId(
        restored.find((l) => l.id === 'headline')?.id ?? restored[0]?.id ?? null
      );
    },
    [reset, selectedTemplate, selectedPlatform, selectedColorTheme]
  );

  const { sharedDoc, acknowledgeShared } = persistence;
  useEffect(() => {
    if (!sharedDoc) return;
    applyDoc(sharedDoc);
    acknowledgeShared();
    announce('Opened a shared design from the link.');
  }, [sharedDoc, acknowledgeShared, applyDoc, announce]);

  /* ---------------------------------------------------------- layer edits */

  const updateLayer = useCallback(
    (targetId, updates) => {
      if (!targetId) return;
      commit((prev) =>
        prev.map((l) => (l.id === targetId ? { ...l, ...updates } : l))
      );
    },
    [commit]
  );

  const updateSelectedLayer = useCallback(
    (updates) => updateLayer(selectedLayerId, updates),
    [updateLayer, selectedLayerId]
  );

  /** A hand-picked colour outranks the palette, so drop its tint role. */
  const setLayerColor = useCallback(
    (key, value) =>
      updateSelectedLayer({ [key]: value, [`${key}Role`]: undefined }),
    [updateSelectedLayer]
  );

  const moveLayer = useCallback(
    (targetId, direction) =>
      commit((prev) => {
        const index = prev.findIndex((l) => l.id === targetId);
        if (index === -1) return prev;
        const nextIndex = direction === 'up' ? index + 1 : index - 1;
        if (nextIndex < 0 || nextIndex >= prev.length) return prev;
        const copy = [...prev];
        const [moved] = copy.splice(index, 1);
        copy.splice(nextIndex, 0, moved);
        return copy;
      }),
    [commit]
  );

  const toggleLayerVisibility = useCallback(
    (targetId) =>
      commit((prev) =>
        prev.map((l) =>
          l.id === targetId ? { ...l, visible: l.visible === false } : l
        )
      ),
    [commit]
  );

  const deleteLayer = useCallback(
    (targetId) => {
      const name =
        layersRef.current.find((l) => l.id === targetId)?.name ?? 'Layer';
      commit((prev) => prev.filter((l) => l.id !== targetId));
      setSelectedLayerId((current) => (current === targetId ? null : current));
      showToast('Layer deleted from canvas', 'info');
      announce(`${name} deleted.`);
    },
    [commit, showToast, announce]
  );

  const duplicateLayer = useCallback(
    (targetId) => {
      const original = layersRef.current.find((l) => l.id === targetId);
      if (!original) return;

      const copy = {
        ...original,
        id: layerId('copy'),
        name: `${original.name} (Copy)`,
        x: original.x + 16,
        y: original.y + 16,
      };
      commit((prev) => [...prev, copy]);
      setSelectedLayerId(copy.id);
      showToast('Layer duplicated', 'success');
      announce(`${original.name} duplicated.`);
    },
    [commit, showToast, announce]
  );

  const addLayer = useCallback(
    (layer, message) => {
      commit((prev) => [...prev, layer]);
      setSelectedLayerId(layer.id);
      setActiveTab('inspector');
      showToast(message, 'success');
      announce(`${layer.name} added. ${message}`);
    },
    [commit, showToast, announce]
  );

  const addTextLayer = (preset = 'headline') => {
    const { width, height } = activePlatformObj;
    addLayer(
      {
        id: layerId('text'),
        name: preset === 'headline' ? 'Custom Headline' : 'Custom Copy',
        type: 'text',
        text:
          preset === 'headline'
            ? 'NEW COLLECTION 2026'
            : 'Exclusive craft for modern collectors.',
        fontFamily: preset === 'headline' ? 'display' : 'sans',
        fontSize: preset === 'headline' ? 22 : 13,
        fontWeight: preset === 'headline' ? 800 : 400,
        color: palette.text,
        colorRole: 'text',
        x: width / 2,
        y: height / 2,
        width: width - 80,
        height: 36,
        align: 'center',
        opacity: 1,
        visible: true,
      },
      'Added new text layer'
    );
  };

  const addBadgeLayer = (badgeType = '50') => {
    const { width, height } = activePlatformObj;
    addLayer(
      {
        id: layerId('badge'),
        name: badgeType === '50' ? '50% OFF Badge' : 'VIP Access Pass',
        type: 'badge',
        badgeStyle: 'solid',
        text: badgeType === '50' ? '50% OFF FLASH' : 'VIP ALL-ACCESS',
        fontSize: 11,
        fontWeight: 800,
        x: width / 2,
        y: height / 2,
        width: 160,
        height: 28,
        color: palette.ink,
        colorRole: 'ink',
        bg: palette.accent,
        bgRole: 'accent',
        opacity: 1,
        visible: true,
      },
      'Added promo badge layer'
    );
  };

  const addShapeLayer = () => {
    const { width, height } = activePlatformObj;
    addLayer(
      {
        id: layerId('shape'),
        name: 'Card Container Box',
        type: 'shape',
        shapeType: 'card',
        x: width / 2,
        y: height / 2,
        width: width - 80,
        height: 100,
        fill: palette.panel,
        fillRole: 'panel',
        stroke: palette.accent,
        strokeRole: 'accent',
        strokeWidth: 1.5,
        borderRadius: 12,
        opacity: 1,
        visible: true,
      },
      'Added shape container layer'
    );
  };

  const alignLayer = (alignType) => {
    if (!selectedLayer) return;
    const { width, height } = activePlatformObj;
    const half = (selectedLayer.width || 120) / 2;

    const x =
      alignType === 'left'
        ? half + 20
        : alignType === 'right'
          ? width - half - 20
          : alignType === 'center'
            ? width / 2
            : selectedLayer.x;
    const y = alignType === 'middle' ? height / 2 : selectedLayer.y;

    updateSelectedLayer({ x, y });
    announce(`${selectedLayer.name} aligned ${alignType}.`);
  };

  const setHeadlineText = (text) =>
    commit((prev) => {
      if (prev.some((l) => l.id === 'headline')) {
        return prev.map((l) => (l.id === 'headline' ? { ...l, text } : l));
      }
      // The headline layer can be deleted; typing here brings it back rather
      // than leaving a frozen controlled input behind.
      const { width, height } = activePlatformObj;
      return [
        ...prev,
        {
          id: 'headline',
          name: 'Main Headline',
          type: 'text',
          text,
          fontFamily: 'serif',
          fontSize: 20,
          fontWeight: 700,
          color: paletteRef.current.text,
          colorRole: 'text',
          x: width / 2,
          y: height - 90,
          width: width - 60,
          height: 30,
          align: 'center',
          opacity: 1,
          visible: true,
        },
      ];
    });

  /* -------------------------------------------------------- catalog import */

  const handleSelectProduct = (event) => {
    const nextId = event.target.value;
    setSelectedProductId(nextId);

    const prod = products.find((p) => p.itemid === nextId);
    if (!prod) return;

    const name = (prod.productName || 'PRODUCT').toUpperCase();
    const price = `$${prod.price ?? 99}`;

    commit((prev) =>
      prev.map((l) => {
        if (l.type === 'product') {
          return {
            ...l,
            productTitle: name,
            productPrice: price,
            productCategory: prod.category || 'Curated Goods',
            imageSrc: productImageSrc(prod),
          };
        }
        if (l.id === 'headline') return { ...l, text: `${name} ARCHIVE` };

        // Rewrite only the price token, so a "CLAIM FOR $x" pill stays a claim
        // pill instead of being clobbered into "$x | OFFICIAL DROP".
        if (['price-tag', 'price-cta', 'cta-pill'].includes(l.id)) {
          const rewritten = String(l.text ?? '').replace(/\$[\d.,]+/, price);
          return {
            ...l,
            text: rewritten.includes('$') ? rewritten : `${l.text} ${price}`,
          };
        }
        return l;
      })
    );

    setCaptionDraft(null);
    speak(`Imported "${prod.productName}" into your design.`, 'guiding');
    announce(`${prod.productName} imported from the catalog.`);
  };

  /* ---------------------------------------------------------------- canvas */

  const toDesignCoords = useCallback(
    (event) => {
      if (!canvasEl) return { x: 0, y: 0 };
      const rect = canvasEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return { x: 0, y: 0 };
      return {
        x: ((event.clientX - rect.left) * activePlatformObj.width) / rect.width,
        y:
          ((event.clientY - rect.top) * activePlatformObj.height) / rect.height,
      };
    },
    [canvasEl, activePlatformObj]
  );

  const dragState = useRef(null);

  const hitTest = (x, y) => {
    for (let i = layersRef.current.length - 1; i >= 0; i -= 1) {
      const layer = layersRef.current[i];
      if (layer.visible === false) continue;
      const halfW = (layer.width || 120) / 2;
      const halfH = (layer.height || 40) / 2;
      if (
        x >= layer.x - halfW &&
        x <= layer.x + halfW &&
        y >= layer.y - halfH &&
        y <= layer.y + halfH
      ) {
        return layer;
      }
    }
    return null;
  };

  const endDrag = useCallback(() => {
    const state = dragState.current;
    dragState.current = null;
    setIsDragging(false);
    setGuides({ v: false, h: false });
    if (!state) return;

    const final = layersRef.current;
    if (final === state.origin) return;

    // Drag frames are previews, which overwrite the present entry. Put the
    // pre-drag stack back first so undo returns where the drag started.
    preview(state.origin);
    commit(final);
  }, [preview, commit]);

  useEffect(() => {
    if (!isDragging || typeof window === 'undefined') return undefined;
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, [isDragging, endDrag]);

  const handlePointerDown = (event) => {
    const { x, y } = toDesignCoords(event);
    const hit = hitTest(x, y);

    if (!hit) {
      setSelectedLayerId(null);
      return;
    }

    event.currentTarget.focus?.();
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* capture is a nicety; the window listener still ends the drag */
      }
    }

    setSelectedLayerId(hit.id);
    setIsDragging(true);
    dragState.current = {
      id: hit.id,
      offsetX: x - hit.x,
      offsetY: y - hit.y,
      origin: layersRef.current,
    };
  };

  const handlePointerMove = (event) => {
    const state = dragState.current;
    if (!state) return;

    const { x, y } = toDesignCoords(event);
    const { width, height } = activePlatformObj;

    const rawX = x - state.offsetX;
    const rawY = y - state.offsetY;
    const snapV = Math.abs(rawX - width / 2) <= SNAP_TOLERANCE;
    const snapH = Math.abs(rawY - height / 2) <= SNAP_TOLERANCE;

    setGuides((prev) =>
      prev.v === snapV && prev.h === snapH ? prev : { v: snapV, h: snapH }
    );

    const nextX = snapV ? width / 2 : Math.round(rawX);
    const nextY = snapH ? height / 2 : Math.round(rawY);

    preview((prev) =>
      prev.map((l) => (l.id === state.id ? { ...l, x: nextX, y: nextY } : l))
    );
  };

  const cycleSelection = (delta) => {
    if (!layers.length) return false;
    const index = layers.findIndex((l) => l.id === selectedLayerId);
    const next =
      index === -1 ? (delta > 0 ? 0 : layers.length - 1) : index + delta;
    // Let focus leave the canvas at either end rather than trapping Tab.
    if (next < 0 || next >= layers.length) return false;
    setSelectedLayerId(layers[next].id);
    return true;
  };

  const handleCanvasKeyDown = (event) => {
    if (event.key === 'Tab') {
      if (cycleSelection(event.shiftKey ? -1 : 1)) event.preventDefault();
      return;
    }

    if (event.key === 'Escape') {
      setSelectedLayerId(null);
      return;
    }

    if (!selectedLayer) return;

    const nudge = NUDGE_KEYS[event.key];
    if (nudge) {
      event.preventDefault();
      const step = event.shiftKey ? 10 : 1;
      updateSelectedLayer({
        x: Math.round(selectedLayer.x + nudge[0] * step),
        y: Math.round(selectedLayer.y + nudge[1] * step),
      });
      return;
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      deleteLayer(selectedLayer.id);
      return;
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      duplicateLayer(selectedLayer.id);
      return;
    }

    if (event.key === ']' || event.key === '[') {
      event.preventDefault();
      moveLayer(selectedLayer.id, event.key === ']' ? 'up' : 'down');
    }
  };

  /* -------------------------------------------------------------- painting */

  useEffect(() => {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    const { width, height } = activePlatformObj;
    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2;

    canvasEl.width = Math.round(width * dpr);
    canvasEl.height = Math.round(height * dpr);
    // Width only — the stylesheet leaves `height: auto`, so the element keeps
    // the bitmap's aspect ratio when `max-width` shrinks it on a narrow screen.
    canvasEl.style.width = `${width}px`;

    ctx.setTransform?.(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    paintComposition(ctx, {
      width,
      height,
      palette,
      layers,
      imageFor,
      selection: selectedLayer,
      guides,
    });
    // `canvasEl` is a state-backed callback ref, so toggling the phone mockup
    // remounts the element and re-runs this effect. Sharing a plain ref between
    // the two branches used to leave the new canvas blank.
  }, [
    canvasEl,
    activePlatformObj,
    palette,
    layers,
    selectedLayer,
    guides,
    imageFor,
    imageRevision,
  ]);

  /* -------------------------------------------------------------- exports */

  const renderToDataUrl = useCallback(
    ({ full = true } = {}) => {
      if (typeof document === 'undefined') return null;
      const { width, height, exportWidth, exportHeight } = activePlatformObj;
      const target = document.createElement('canvas');
      target.width = full ? exportWidth : width;
      target.height = full ? exportHeight : height;

      const ctx = target.getContext('2d');
      if (!ctx) return null;

      if (full) ctx.scale(exportWidth / width, exportHeight / height);
      paintComposition(ctx, {
        width,
        height,
        palette,
        layers: layersRef.current,
        imageFor,
        selection: null,
        guides: null,
      });

      return target.toDataURL('image/png');
    },
    [activePlatformObj, palette, imageFor]
  );

  const handleDownload = () => {
    const { exportWidth, exportHeight } = activePlatformObj;
    try {
      const dataUrl = renderToDataUrl({ full: true });
      if (!dataUrl) throw new Error('no-canvas');

      const link = document.createElement('a');
      link.download = `cart-flyer-${selectedPlatform}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      showToast(
        `Exported a ${exportWidth}×${exportHeight} PNG to your downloads`,
        'success'
      );
      announce(`Export complete — ${exportWidth} by ${exportHeight} pixels.`);
      speak('Your post is exported at full resolution.', 'celebrating');
    } catch {
      showToast('Image export simulated in test environment', 'info');
      announce('Export is unavailable in this environment.');
    }
  };

  const handleCopyCaption = () => {
    const tags = formatHashtags(hashtags);
    const text = tags ? `${caption}\n\n${tags}` : caption;

    if (!navigator?.clipboard?.writeText) {
      showToast('Clipboard is unavailable in this browser', 'info');
      return;
    }

    navigator.clipboard.writeText(text);
    showToast('Marketing caption and hashtags copied to clipboard!', 'success');
    announce('Caption copied to the clipboard.');
    speak('Caption and hashtags copied.', 'happy');
  };

  const thumbnailFor = useCallback(() => {
    try {
      return renderToDataUrl({ full: false });
    } catch {
      return null;
    }
  }, [renderToDataUrl]);

  const resetToDefaults = useCallback(() => {
    seedSignature.current = null;
    themeSignature.current = 'obsidian';
    setSelectedPlatform('flyer_print');
    setSelectedTemplate('minimal_luxury');
    setSelectedColorTheme('obsidian');
    setSelectedProductId(products[0]?.itemid || 'SM57');
    setCaptionDraft(null);
    setHashtags(DEFAULT_HASHTAGS);

    const seeded = generateStarterLayers(
      'minimal_luxury',
      'flyer_print',
      products[0],
      themePalette(COLOR_THEMES[0])
    );
    seedSignature.current = 'minimal_luxury|flyer_print';
    reset(seeded);
    setSelectedLayerId(seeded.find((l) => l.id === 'headline')?.id ?? null);
    announce('Canvas reset to the starter design.');
  }, [reset, announce]);

  /* ------------------------------------------------------------------ ui  */

  const tabs = [
    { id: 'inspector', label: 'Properties' },
    { id: 'layers', label: `Layers (${layers.length})` },
    { id: 'catalog', label: 'Catalog & Presets' },
  ];

  const isTextish =
    selectedLayer?.type === 'text' || selectedLayer?.type === 'badge';
  const fillValue = selectedLayer?.fill ?? selectedLayer?.bg ?? palette.accent;

  return (
    <>
      <Head>
        <title>
          Social Media Creation Studio & Flier Designer | Cart Commerce
        </title>
        <meta
          name="description"
          content="Multi-layer graphic design studio for e-commerce store owners. Build, customize, and compose promotional fliers, Instagram posts, TikTok reels, and banners."
        />
      </Head>

      <div className={styles.studioContainer}>
        <header className={styles.studioHeader}>
          <div className={styles.headerLeft}>
            <Link href="/" className={styles.backLink}>
              <ChevronLeft size={16} />
              <span>Back to Storefront</span>
            </Link>
            <div className={styles.titleRow}>
              <h1 className={styles.studioTitle}>
                Social Media Creation Studio
              </h1>
              <span className={styles.editionPill}>Multi-layer workbench</span>
            </div>
            <p className={styles.studioSubtitle}>
              <span>Store Owner &amp; Creator Workshop</span> — compose, save
              and share campaign-ready posts
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={`${styles.ghostAction} ${showPhoneMockup ? styles.ghostActionOn : ''}`}
              onClick={() => setShowPhoneMockup((prev) => !prev)}
              aria-label="Toggle smartphone mockup preview"
              aria-pressed={showPhoneMockup}
            >
              <EyeIcon size={16} />
              <span>
                {showPhoneMockup ? 'Hide Phone Frame' : 'OLED Phone Frame'}
              </span>
            </button>
            <button
              type="button"
              className={styles.ghostAction}
              onClick={handleCopyCaption}
              aria-label="Copy post caption to clipboard"
            >
              <ShareIcon size={16} />
              <span>Copy Caption</span>
            </button>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={handleDownload}
              aria-label="Download social post PNG"
            >
              <SparklesIcon size={16} />
              <span>Export PNG</span>
            </button>
          </div>
        </header>

        <div className={styles.toolbarStrip}>
          <div className={styles.toolGroup} role="group" aria-label="History">
            <button
              type="button"
              className={styles.toolBtn}
              onClick={undo}
              disabled={!history.canUndo}
              aria-label="Undo last canvas change"
            >
              <RotateCcwIcon size={13} />
              <span>Undo</span>
            </button>
            <button
              type="button"
              className={styles.toolBtn}
              onClick={redo}
              disabled={!history.canRedo}
              aria-label="Redo last undone canvas change"
            >
              <span className={styles.mirrored}>
                <RotateCcwIcon size={13} />
              </span>
              <span>Redo</span>
            </button>
          </div>

          <div className={styles.toolDivider} aria-hidden="true" />

          <div
            className={styles.toolGroup}
            role="group"
            aria-label="Add elements"
          >
            <span className={styles.toolLabel}>Add</span>
            <button
              type="button"
              className={styles.toolBtn}
              onClick={() => addTextLayer('headline')}
              aria-label="Add text layer"
            >
              Text
            </button>
            <button
              type="button"
              className={styles.toolBtn}
              onClick={() => addBadgeLayer('50')}
              aria-label="Add promo badge layer"
            >
              Promo badge
            </button>
            <button
              type="button"
              className={styles.toolBtn}
              onClick={addShapeLayer}
              aria-label="Add container card layer"
            >
              Card box
            </button>
          </div>

          <div className={styles.toolDivider} aria-hidden="true" />

          <div
            className={styles.toolGroup}
            role="group"
            aria-label="Align selected layer"
          >
            <span className={styles.toolLabel}>Align</span>
            {[
              ['left', 'Align selected layer to the left'],
              ['center', 'Center selected layer horizontally'],
              ['right', 'Align selected layer to the right'],
              ['middle', 'Center selected layer vertically'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={styles.toolBtnSmall}
                onClick={() => alignLayer(key)}
                disabled={!selectedLayer}
                aria-label={label}
              >
                {key[0].toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          <div className={styles.toolDivider} aria-hidden="true" />

          <div
            className={styles.toolGroup}
            role="group"
            aria-label="Selected layer actions"
          >
            <button
              type="button"
              className={styles.toolBtnSmall}
              onClick={() => selectedLayer && duplicateLayer(selectedLayer.id)}
              disabled={!selectedLayer}
              aria-label="Duplicate selected layer"
            >
              Duplicate
            </button>
            <button
              type="button"
              className={`${styles.toolBtnSmall} ${styles.toolBtnDanger}`}
              onClick={() => selectedLayer && deleteLayer(selectedLayer.id)}
              disabled={!selectedLayer}
              aria-label="Delete selected layer"
            >
              Delete
            </button>
          </div>
        </div>

        <p className={styles.srOnly} role="status" aria-live="polite">
          {announcement}
        </p>

        <div className={styles.workbench}>
          <div className={styles.canvasStage}>
            <DesignBar
              persistence={persistence}
              modeLabel="social post"
              onRestore={applyDoc}
              onLoad={applyDoc}
              onReset={resetToDefaults}
              thumbnailFor={thumbnailFor}
              summaryFor={() => summarizeDesign(doc, DESIGN_LABELS)}
            />

            <div className={styles.canvasHeaderBar}>
              <div className={styles.canvasFormatInfo}>
                <strong>{activePlatformObj.name}</strong>
                <span>{activePlatformObj.label}</span>
              </div>
              <p className={styles.dragHint}>
                Drag on the canvas, or focus it and use arrow keys (Shift for
                10px). Tab cycles layers.
              </p>
            </div>

            <div className={styles.canvasWrapper}>
              {showPhoneMockup ? (
                <div className={styles.smartphoneBezel}>
                  <div className={styles.phoneSpeaker} aria-hidden="true" />
                  <div className={styles.phoneCamera} aria-hidden="true" />
                  <div className={styles.phoneStatusBar}>
                    <span>9:41</span>
                  </div>
                  <div className={styles.phoneScreen}>
                    <canvas
                      ref={setCanvasEl}
                      className={styles.graphicCanvas}
                      tabIndex={0}
                      role="application"
                      aria-label={canvasLabel(layers, selectedLayer)}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      onKeyDown={handleCanvasKeyDown}
                    >
                      Interactive post canvas. Use the Layers and Properties
                      panels to edit the composition.
                    </canvas>
                  </div>
                  <div className={styles.phoneHomeBar} aria-hidden="true" />
                </div>
              ) : (
                <div className={styles.standaloneCanvasCard}>
                  <canvas
                    ref={setCanvasEl}
                    className={`${styles.graphicCanvas} ${isDragging ? styles.canvasDragging : ''}`}
                    tabIndex={0}
                    role="application"
                    aria-label={canvasLabel(layers, selectedLayer)}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onKeyDown={handleCanvasKeyDown}
                  >
                    Interactive post canvas. Use the Layers and Properties
                    panels to edit the composition.
                  </canvas>
                </div>
              )}
            </div>

            <p className={styles.resolutionNotice}>
              <CheckCircleIcon size={16} />
              <span>
                Exports a {activePlatformObj.exportWidth}×
                {activePlatformObj.exportHeight} PNG — the full advertised
                resolution, rendered fresh rather than upscaled from the
                preview.
              </span>
            </p>
          </div>

          <div className={styles.inspectorSidebar}>
            <div
              className={styles.sidebarTabs}
              role="tablist"
              aria-label="Studio panels"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={id(`tab-${tab.id}`)}
                  aria-selected={activeTab === tab.id}
                  aria-controls={id(`panel-${tab.id}`)}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  className={`${styles.sidebarTab} ${activeTab === tab.id ? styles.sidebarTabActive : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'inspector' && (
              <div
                className={styles.tabContent}
                role="tabpanel"
                id={id('panel-inspector')}
                aria-labelledby={id('tab-inspector')}
                tabIndex={0}
              >
                {selectedLayer ? (
                  <div className={styles.inspectorPane}>
                    <div className={styles.selectedLayerHeader}>
                      <div>
                        <span className={styles.layerTypePill}>
                          {selectedLayer.type}
                        </span>
                        <h3 className={styles.selectedLayerTitle}>
                          {selectedLayer.name}
                        </h3>
                      </div>
                      <button
                        type="button"
                        className={styles.deselectBtn}
                        onClick={() => setSelectedLayerId(null)}
                        aria-label="Deselect this layer"
                      >
                        <CloseIcon size={14} />
                      </button>
                    </div>

                    <section className={styles.propGroup}>
                      <h4 className={styles.propGroupTitle}>
                        Transform &amp; position
                      </h4>
                      <div className={styles.coordGrid}>
                        {[
                          ['x', 'X (px)', selectedLayer.x],
                          ['y', 'Y (px)', selectedLayer.y],
                          ['width', 'Width', selectedLayer.width ?? 120],
                          ['height', 'Height', selectedLayer.height ?? 36],
                        ].map(([key, label, value]) => (
                          <div key={key} className={styles.coordItem}>
                            <label htmlFor={id(`coord-${key}`)}>{label}</label>
                            <input
                              id={id(`coord-${key}`)}
                              type="number"
                              value={Math.round(value)}
                              onChange={(e) =>
                                updateSelectedLayer({
                                  [key]: Number(e.target.value),
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>

                      <StudioSlider
                        label="Layer opacity"
                        value={Math.round((selectedLayer.opacity ?? 1) * 100)}
                        onChange={(v) =>
                          updateSelectedLayer({ opacity: v / 100 })
                        }
                        min={0}
                        max={100}
                        format={(v) => `${v}%`}
                      />
                    </section>

                    {isTextish && (
                      <section className={styles.propGroup}>
                        <h4 className={styles.propGroupTitle}>
                          Typography &amp; text
                        </h4>

                        <div className={styles.fieldItem}>
                          <label htmlFor={id('text-content')}>Content:</label>
                          <textarea
                            id={id('text-content')}
                            rows={2}
                            value={selectedLayer.text || ''}
                            onChange={(e) =>
                              updateSelectedLayer({ text: e.target.value })
                            }
                            className={styles.inputField}
                          />
                          <p className={styles.fieldHint}>
                            Copy wraps to the layer width. Casing is yours —
                            nothing is force-uppercased on the canvas.
                          </p>
                        </div>

                        <div className={styles.fieldItem}>
                          <label htmlFor={id('font-family')}>
                            Font family:
                          </label>
                          <select
                            id={id('font-family')}
                            value={selectedLayer.fontFamily || 'sans'}
                            onChange={(e) =>
                              updateSelectedLayer({
                                fontFamily: e.target.value,
                              })
                            }
                            className={styles.selectField}
                          >
                            {FONT_OPTIONS.map((font) => (
                              <option key={font.id} value={font.id}>
                                {font.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <OptionPills
                          label="Font weight"
                          options={WEIGHT_OPTIONS}
                          value={String(selectedLayer.fontWeight ?? 700)}
                          onChange={(v) =>
                            updateSelectedLayer({ fontWeight: Number(v) })
                          }
                        />

                        <StudioSlider
                          label="Font size"
                          value={selectedLayer.fontSize || 16}
                          onChange={(v) => updateSelectedLayer({ fontSize: v })}
                          min={8}
                          max={64}
                          format={(v) => `${v}px`}
                        />

                        <OptionPills
                          label="Alignment"
                          options={ALIGN_OPTIONS}
                          value={selectedLayer.align || 'center'}
                          onChange={(v) => updateSelectedLayer({ align: v })}
                        />

                        <ColorField
                          id={id('text-color')}
                          label="Text colour"
                          value={selectedLayer.color ?? palette.text}
                          fallback={palette.text}
                          onChange={(v) => setLayerColor('color', v)}
                        />
                      </section>
                    )}

                    {(selectedLayer.type === 'shape' ||
                      selectedLayer.type === 'badge' ||
                      selectedLayer.type === 'product') && (
                      <section className={styles.propGroup}>
                        <h4 className={styles.propGroupTitle}>
                          Appearance &amp; fill
                        </h4>

                        {selectedLayer.type === 'badge' && (
                          <OptionPills
                            label="Badge style"
                            options={BADGE_STYLES}
                            value={resolveBadgeStyle(selectedLayer.badgeStyle)}
                            onChange={(v) =>
                              updateSelectedLayer({ badgeStyle: v })
                            }
                          />
                        )}

                        <ColorField
                          id={id('fill-color')}
                          label="Fill colour"
                          value={fillValue}
                          fallback={palette.accent}
                          onChange={(v) => {
                            updateSelectedLayer({
                              fill: v,
                              bg: v,
                              fillRole: undefined,
                              bgRole: undefined,
                            });
                          }}
                        />

                        <StudioSlider
                          label="Corner radius"
                          value={
                            selectedLayer.borderRadius ??
                            (selectedLayer.type === 'badge'
                              ? Math.round((selectedLayer.height ?? 28) / 2)
                              : 6)
                          }
                          onChange={(v) =>
                            updateSelectedLayer({ borderRadius: v })
                          }
                          min={0}
                          max={40}
                          format={(v) => `${v}px`}
                        />
                      </section>
                    )}

                    <section className={styles.propGroup}>
                      <h4 className={styles.propGroupTitle}>Stroke</h4>
                      <ColorField
                        id={id('stroke-color')}
                        label="Stroke colour"
                        value={selectedLayer.stroke ?? palette.accent}
                        fallback={palette.accent}
                        onChange={(v) => setLayerColor('stroke', v)}
                      />
                      <StudioSlider
                        label="Stroke width"
                        value={selectedLayer.strokeWidth ?? 0}
                        onChange={(v) =>
                          updateSelectedLayer({ strokeWidth: v })
                        }
                        min={0}
                        max={12}
                        step={0.5}
                        format={(v) => (v ? `${v}px` : 'None')}
                      />
                    </section>
                  </div>
                ) : (
                  <div className={styles.emptyInspector}>
                    <span className={styles.emptyGlyph} aria-hidden="true">
                      <SparklesIcon size={24} />
                    </span>
                    <p>Nothing selected yet</p>
                    <span>
                      Click any text, badge or card on the canvas — or focus the
                      canvas and press Tab — to edit its properties here.
                    </span>
                    <button
                      type="button"
                      className={styles.emptyAction}
                      onClick={() => setActiveTab('layers')}
                    >
                      Browse the layer stack
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'layers' && (
              <div
                className={styles.tabContent}
                role="tabpanel"
                id={id('panel-layers')}
                aria-labelledby={id('tab-layers')}
                tabIndex={0}
              >
                <div className={styles.layersHeader}>
                  <h3>Layers (top to bottom)</h3>
                  <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={() => {
                      const fresh = generateStarterLayers(
                        selectedTemplate,
                        selectedPlatform,
                        activeProduct,
                        palette
                      );
                      commit(fresh);
                      announce('Layers reset to the starter template.');
                      showToast('Reset layers to starter template', 'info');
                    }}
                  >
                    <RotateCcwIcon size={12} />
                    <span>Reset</span>
                  </button>
                </div>

                {layers.length === 0 ? (
                  <p className={styles.layersEmpty}>
                    This canvas is empty. Add a text, badge or card layer from
                    the toolbar to begin.
                  </p>
                ) : (
                  <ul className={styles.layersList}>
                    {layers
                      .map((layer, index) => ({ layer, index }))
                      .reverse()
                      .map(({ layer, index }) => (
                        <li
                          key={layer.id}
                          className={`${styles.layerItem} ${
                            selectedLayerId === layer.id
                              ? styles.layerItemActive
                              : ''
                          } ${layer.visible === false ? styles.layerItemHidden : ''}`}
                        >
                          <button
                            type="button"
                            className={styles.layerEyeBtn}
                            onClick={() => toggleLayerVisibility(layer.id)}
                            aria-label={
                              layer.visible === false
                                ? `Show ${layer.name}`
                                : `Hide ${layer.name}`
                            }
                            aria-pressed={layer.visible !== false}
                          >
                            {layer.visible === false ? (
                              <EyeOffIcon size={14} />
                            ) : (
                              <EyeIcon size={14} />
                            )}
                          </button>

                          <button
                            type="button"
                            className={styles.layerSelectBtn}
                            onClick={() => setSelectedLayerId(layer.id)}
                            aria-pressed={selectedLayerId === layer.id}
                          >
                            <span className={styles.layerBadgeType}>
                              {layer.type}
                            </span>
                            <span className={styles.layerItemName}>
                              {layer.name}
                            </span>
                          </button>

                          <span className={styles.layerControls}>
                            <button
                              type="button"
                              className={styles.layerOrderBtn}
                              disabled={index === layers.length - 1}
                              onClick={() => moveLayer(layer.id, 'up')}
                              aria-label={`Move ${layer.name} forward`}
                            >
                              <span aria-hidden="true">▲</span>
                            </button>
                            <button
                              type="button"
                              className={styles.layerOrderBtn}
                              disabled={index === 0}
                              onClick={() => moveLayer(layer.id, 'down')}
                              aria-label={`Move ${layer.name} backward`}
                            >
                              <span aria-hidden="true">▼</span>
                            </button>
                            <button
                              type="button"
                              className={styles.layerDeleteBtn}
                              onClick={() => deleteLayer(layer.id)}
                              aria-label={`Delete ${layer.name}`}
                            >
                              <span aria-hidden="true">✕</span>
                            </button>
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === 'catalog' && (
              <div
                className={styles.tabContent}
                role="tabpanel"
                id={id('panel-catalog')}
                aria-labelledby={id('tab-catalog')}
                tabIndex={0}
              >
                <section className={styles.sidebarSection}>
                  <h2 className={styles.sidebarHeading}>
                    1. Flier &amp; platform format
                  </h2>
                  <div className={styles.platformGrid}>
                    {PLATFORMS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`${styles.platformCard} ${
                          selectedPlatform === p.id
                            ? styles.platformCardActive
                            : ''
                        }`}
                        aria-pressed={selectedPlatform === p.id}
                        onClick={() => setSelectedPlatform(p.id)}
                      >
                        <strong>{p.name}</strong>
                        <span>{p.aspect}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className={styles.sidebarSection}>
                  <h2 className={styles.sidebarHeading}>
                    2. Import from store catalog
                  </h2>
                  <div className={styles.fieldItem}>
                    <label htmlFor="productCatalogSelect">
                      Choose Catalog Product:
                    </label>
                    <select
                      id="productCatalogSelect"
                      value={selectedProductId}
                      onChange={handleSelectProduct}
                      className={styles.selectField}
                    >
                      {products.map((p) => (
                        <option key={p.itemid} value={p.itemid}>
                          {p.productName} — ${p.price} ({p.manufacturer})
                        </option>
                      ))}
                    </select>
                    <p className={styles.fieldHint}>
                      Pulls the product artwork, title, category and price
                      straight into the composition.
                    </p>
                  </div>
                </section>

                <section className={styles.sidebarSection}>
                  <h2 className={styles.sidebarHeading}>
                    3. Designer starter template
                  </h2>
                  <div className={styles.templateGrid}>
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`${styles.templateCard} ${
                          selectedTemplate === t.id
                            ? styles.templateCardActive
                            : ''
                        }`}
                        aria-pressed={selectedTemplate === t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                      >
                        <span className={styles.templateCardTop}>
                          <span className={styles.templateName}>{t.name}</span>
                          <span className={styles.templateBadge}>
                            {t.badge}
                          </span>
                        </span>
                        <span className={styles.templateDesc}>{t.desc}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className={styles.sidebarSection}>
                  <SwatchRow
                    label="4. Colour palette & mood"
                    hint="Re-tints the design; your edits stay put"
                    options={COLOR_THEMES.map((c) => ({
                      value: c.bg,
                      name: c.name,
                    }))}
                    value={activeColorThemeObj.bg}
                    onChange={(bg) =>
                      setSelectedColorTheme(
                        COLOR_THEMES.find((c) => c.bg === bg)?.id ?? 'obsidian'
                      )
                    }
                    columns={5}
                  />
                </section>

                {/* The quick headline field is the studio's documented entry
                    point for the post's main line — it writes through to the
                    `headline` layer and recreates it if it was deleted. */}
                <section className={styles.sidebarSection}>
                  <h2 className={styles.sidebarHeading}>
                    5. Quick headline sync
                  </h2>
                  <div className={styles.fieldItem}>
                    <label htmlFor="postHeadlineInput">Headline:</label>
                    <input
                      id="postHeadlineInput"
                      type="text"
                      value={headline}
                      maxLength={60}
                      onChange={(e) => setHeadlineText(e.target.value)}
                      className={styles.inputField}
                    />
                  </div>
                </section>

                <section className={styles.sidebarSection}>
                  <h2 className={styles.sidebarHeading}>6. Caption composer</h2>
                  <div className={styles.fieldItem}>
                    <label htmlFor={id('caption')}>Post caption:</label>
                    <textarea
                      id={id('caption')}
                      rows={6}
                      value={caption}
                      onChange={(e) => setCaptionDraft(e.target.value)}
                      className={styles.inputField}
                    />
                  </div>
                  <div className={styles.fieldItem}>
                    <label htmlFor={id('hashtags')}>
                      Hashtags (space separated):
                    </label>
                    <input
                      id={id('hashtags')}
                      type="text"
                      value={hashtags}
                      onChange={(e) => setHashtags(e.target.value)}
                      className={styles.inputField}
                    />
                    <p className={styles.fieldHint}>
                      {formatHashtags(hashtags)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={() => setCaptionDraft(null)}
                  >
                    Regenerate from product
                  </button>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------ subviews -- */

/**
 * `input[type=color]` cannot hold `rgba(…)`, and several seeded layers do. The
 * swatch shows the nearest hex it can represent while the text field keeps the
 * authored value editable, so a translucent fill is no longer silently black.
 */
function ColorField({ id: fieldId, label, value, fallback, onChange }) {
  const hex = asHexInput(value, fallback);
  const isHex = HEX_PATTERN.test(value ?? '');

  return (
    <div className={styles.fieldItem}>
      <label htmlFor={fieldId}>{label}:</label>
      <div className={styles.colorPickerRow}>
        <input
          id={fieldId}
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          className={styles.colorInput}
        />
        <input
          type="text"
          className={styles.colorHexInput}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} value`}
          spellCheck={false}
        />
      </div>
      {!isHex && (
        <p className={styles.fieldHint}>
          Translucent value — the swatch shows the closest solid colour.
        </p>
      )}
    </div>
  );
}

ColorField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  fallback: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

function canvasLabel(layers, selectedLayer) {
  const count = layers.length;
  const selection = selectedLayer
    ? `${selectedLayer.name} selected at ${Math.round(selectedLayer.x)}, ${Math.round(selectedLayer.y)}`
    : 'no layer selected';
  return `Post composition canvas, ${count} layer${count === 1 ? '' : 's'}, ${selection}. Tab cycles layers, arrow keys move the selection, Shift with an arrow moves ten pixels.`;
}
