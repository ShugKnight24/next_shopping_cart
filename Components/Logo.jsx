import PropTypes from 'prop-types';
import { useContext, useId } from 'react';
import {
  BRAND_VARIANTS,
  BrandContext,
  LEGACY_VARIANT_ALIASES,
  resolveBrandVariant,
} from './Brand/BrandContext';
import { MarkArt } from './Brand/BrandMark';

const SANS = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";

// The title is set to a fixed measure so the lockup holds its proportions
// whichever system font renders it; the subtitle tracks out to match.
const MEASURE = 208;
const SUBTITLE_PER_CHAR = 10.4;

/** Wordmark treatment per variant: same measure, different voice. */
function wordmarkFor(variant, isDark, url) {
  const ink = isDark ? '#ffffff' : '#0f2744';
  switch (variant) {
    case 'mono':
      return {
        family: SANS,
        weight: 800,
        size: 21,
        title: ink,
        subtitle: ink,
        subtitleOpacity: 0.72,
      };
    case 'inverse':
      return {
        family: SERIF,
        weight: 700,
        size: 20,
        title: isDark ? '#ffffff' : '#081628',
        subtitle: isDark ? '#daa520' : '#996515',
        rule: isDark ? '#daa520' : '#b8860b',
      };
    case 'studio':
      return {
        family: SANS,
        weight: 800,
        size: 21,
        title: ink,
        subtitle: url(isDark ? 'holoText' : 'holoTextDeep'),
      };
    case 'crest':
      return {
        family: SANS,
        weight: 700,
        size: 20,
        title: isDark ? url('foilText') : '#0f2744',
        subtitle: isDark ? 'rgba(255, 255, 255, 0.72)' : '#996515',
      };
    default:
      return {
        family: SANS,
        weight: 800,
        size: 21,
        title: ink,
        subtitle: isDark ? '#daa520' : '#996515',
      };
  }
}

/**
 * Cart Commerce logo lockup.
 *
 * - `variant`: any id from BRAND_VARIANTS (legacy ids are mapped); defaults to
 *   the active brand from BrandContext.
 * - `layout`: 'horizontal' (mark + wordmark), 'stacked', or 'mark' only.
 * - `size`: 'xs' | 'sm' switch to the pixel-snapped micro glyph.
 */
export function Logo({
  variant: propVariant,
  theme = 'light',
  showSubtitle = true,
  subtitle: customSubtitle,
  className = '',
  size = 'default',
  layout = 'horizontal',
  style = {},
}) {
  const brandContext = useContext(BrandContext);
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const url = (name) => `url(#cc${rawId}-${name})`;

  const activeVariant = resolveBrandVariant(
    propVariant || brandContext?.variant
  );
  const variantConfig = BRAND_VARIANTS[activeVariant];
  const isDark = theme === 'dark';
  const detail = size === 'xs' || size === 'sm' ? 'micro' : 'full';
  const subtitleText = customSubtitle || variantConfig.subtitle;
  const label = `Cart Commerce - ${variantConfig.name}`;
  const type = wordmarkFor(activeVariant, isDark, url);

  const stacked = layout === 'stacked';
  const markOnly = layout === 'mark';
  const textX = stacked ? 0 : 78;
  const titleY = stacked ? 96 : 32;
  const subtitleY = stacked ? 113 : 47;
  const subtitleLength = Math.min(
    MEASURE,
    subtitleText.length * SUBTITLE_PER_CHAR
  );
  const subtitleX =
    stacked && subtitleLength < MEASURE
      ? (MEASURE - subtitleLength) / 2
      : textX;

  let viewBox = '0 0 288 64';
  if (stacked) viewBox = `0 0 ${MEASURE} ${showSubtitle ? 120 : 104}`;
  if (markOnly) viewBox = '0 0 64 64';

  return (
    <svg
      className={`brand-logo-svg brand-variant-${activeVariant} ${className}`.trim()}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      style={{ overflow: 'visible', ...style }}
    >
      <title>{label}</title>
      <defs>
        <linearGradient id={`cc${rawId}-foilText`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbecb4" />
          <stop offset="0.5" stopColor="#d9a62e" />
          <stop offset="1" stopColor="#f3d27a" />
        </linearGradient>
        <linearGradient id={`cc${rawId}-holoText`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffcf6b" />
          <stop offset="0.35" stopColor="#ff7eb3" />
          <stop offset="0.7" stopColor="#7ec8ff" />
          <stop offset="1" stopColor="#b28dff" />
        </linearGradient>
        <linearGradient
          id={`cc${rawId}-holoTextDeep`}
          x1="0"
          y1="0"
          x2="1"
          y2="0"
        >
          <stop offset="0" stopColor="#b45309" />
          <stop offset="0.35" stopColor="#be185d" />
          <stop offset="0.7" stopColor="#1d4ed8" />
          <stop offset="1" stopColor="#6d28d9" />
        </linearGradient>
      </defs>

      <g transform={stacked ? `translate(${(MEASURE - 64) / 2} 0)` : undefined}>
        <MarkArt
          variant={activeVariant}
          theme={theme === 'dark' ? 'dark' : 'light'}
          detail={detail}
        />
      </g>

      {!markOnly && (
        <g>
          <text
            x={stacked ? 0 : textX}
            y={titleY}
            fill={type.title}
            fontFamily={type.family}
            fontSize={type.size}
            fontWeight={type.weight}
            textLength={MEASURE}
            lengthAdjust="spacing"
          >
            CART COMMERCE
          </text>

          {showSubtitle && type.rule && (
            <line
              x1={textX}
              x2={textX + MEASURE}
              y1={titleY + 5.5}
              y2={titleY + 5.5}
              stroke={type.rule}
              strokeWidth="0.75"
            />
          )}

          {showSubtitle && (
            <text
              x={subtitleX}
              y={subtitleY}
              fill={type.subtitle}
              fillOpacity={type.subtitleOpacity}
              fontFamily={SANS}
              fontSize="8.5"
              fontWeight="700"
              textLength={subtitleLength}
              lengthAdjust="spacing"
            >
              {subtitleText}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}

Logo.propTypes = {
  variant: PropTypes.oneOf([
    ...Object.keys(BRAND_VARIANTS),
    ...Object.keys(LEGACY_VARIANT_ALIASES),
  ]),
  theme: PropTypes.oneOf(['light', 'dark', 'auto']),
  showSubtitle: PropTypes.bool,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.string,
  layout: PropTypes.oneOf(['horizontal', 'stacked', 'mark']),
  style: PropTypes.object,
};
