import PropTypes from 'prop-types';
import { useId } from 'react';
import { BRAND_COLORS as C, GLYPH_FULL, GLYPH_MICRO } from './cartGeometry';

/**
 * The Cart Commerce mark: the hero's chrome wire cart with its gold grip and
 * gold plate, reduced to a 64-unit glyph. Every brand variant is this same
 * glyph on a different ground — only the badge and the paint change.
 */

export const MARK_VARIANTS = ['primary', 'mono', 'inverse', 'studio', 'crest'];

const useSvgIds = () => {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (name) => `cc${raw}-${name}`;
};

function Gradients({ id }) {
  return (
    <>
      <linearGradient id={id('navy')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.navy} />
        <stop offset="1" stopColor={C.midnight} />
      </linearGradient>
      <linearGradient id={id('chrome')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.chromeHi} />
        <stop offset="0.45" stopColor={C.chrome} />
        <stop offset="0.75" stopColor={C.chromeMid} />
        <stop offset="1" stopColor="#eef1f6" />
      </linearGradient>
      <linearGradient id={id('chromeFlat')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.chromeHi} />
        <stop offset="1" stopColor="#c3cad6" />
      </linearGradient>
      <linearGradient id={id('chromeBack')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#b9c1ce" />
        <stop offset="1" stopColor={C.chromeLow} />
      </linearGradient>
      <linearGradient id={id('gold')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={C.goldLight} />
        <stop offset="0.5" stopColor={C.gold} />
        <stop offset="1" stopColor={C.goldDeep} />
      </linearGradient>
      <linearGradient id={id('foil')} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#fbecb4" />
        <stop offset="0.35" stopColor={C.gold} />
        <stop offset="0.55" stopColor="#f3d27a" />
        <stop offset="1" stopColor={C.goldDeep} />
      </linearGradient>
      <linearGradient id={id('holo')} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffcf6b" />
        <stop offset="0.35" stopColor="#ff7eb3" />
        <stop offset="0.7" stopColor="#7ec8ff" />
        <stop offset="1" stopColor="#b28dff" />
      </linearGradient>
    </>
  );
}

Gradients.propTypes = { id: PropTypes.func.isRequired };

/** How each variant paints the glyph. */
function paintFor(variant, theme, url) {
  const ink = theme === 'dark' ? C.paper : C.ink;
  switch (variant) {
    case 'mono':
      return {
        body: ink,
        back: ink,
        backOpacity: 0.4,
        side: ink,
        sideOpacity: 0.55,
        grip: ink,
        plate: ink,
        tyre: ink,
        hub: theme === 'dark' ? C.ink : C.paper,
      };
    case 'studio':
      return {
        body: C.paper,
        back: C.paper,
        backOpacity: 0.45,
        side: '#c9d6ee',
        grip: url('gold'),
        plate: url('holo'),
        tyre: '#15171c',
        hub: C.paper,
        playful: true,
      };
    case 'crest':
      return {
        body: url('foil'),
        back: C.gold,
        backOpacity: 0.55,
        side: C.goldDeep,
        grip: url('foil'),
        plate: C.navyDeep,
        plateStroke: url('foil'),
        tyre: C.navyDeep,
        hub: C.gold,
      };
    default:
      return {
        body: url('chrome'),
        // The full chrome ramp dips to grey mid-height; at 16px that reads as
        // a dirty floor line, so the micro glyph uses a flatter ramp.
        microBody: url('chromeFlat'),
        microWheel: C.chrome,
        back: url('chromeBack'),
        side: url('chromeBack'),
        grip: url('gold'),
        plate: url('gold'),
        tyre: '#15171c',
        hub: url('chrome'),
      };
  }
}

function MicroGlyph({ paint }) {
  const g = GLYPH_MICRO;
  const body = paint.microBody || paint.body;
  return (
    <g>
      <path d={g.side} fill={paint.side} fillOpacity={paint.sideOpacity} />
      <g fill="none" stroke={body} strokeLinecap="round" strokeLinejoin="round">
        <path d={g.posts} strokeWidth={g.stroke.posts} />
        <path d={g.rim} strokeWidth={g.stroke.rim} />
        <path d={g.basket} strokeWidth={g.stroke.basket} />
      </g>
      <path
        d={g.grip}
        stroke={paint.grip}
        strokeWidth={g.stroke.grip}
        strokeLinecap="round"
      />
      <rect {...g.plate} fill={paint.plate} />
      {g.wheels.map((w) => (
        <circle key={w.cx} {...w} fill={paint.microWheel || body} />
      ))}
    </g>
  );
}

MicroGlyph.propTypes = { paint: PropTypes.object.isRequired };

/** Little things the Studio cart carries: a storybook, a star, a heart. */
function StudioGoods() {
  return (
    <g>
      <g transform="translate(31 13) rotate(-10)">
        <rect x="-5" y="-7" width="10" height="13" rx="1.2" fill="#7ec8ff" />
        <rect x="-3.4" y="-7" width="1.4" height="13" fill="#2457c5" />
      </g>
      <path
        d="M0-6l1.9 3.9 4.3.6-3.1 3 .7 4.3L0 3.8l-3.8 2 .7-4.3-3.1-3 4.3-.6z"
        transform="translate(43 10)"
        fill="#ffcf6b"
        stroke="#a8761a"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      <path
        d="M0-2.5c-1.6-2.6-5.4-1.4-4.9 1.5C-4.5 1.2 0 3.8 0 3.8s4.5-2.6 4.9-4.8c.5-2.9-3.3-4.1-4.9-1.5z"
        transform="translate(52 14)"
        fill="#ff7eb3"
      />
    </g>
  );
}

function FullGlyph({ paint }) {
  const g = GLYPH_FULL;
  return (
    <g strokeLinecap="round">
      <g fill="none" strokeLinejoin="round">
        <path
          d={g.back}
          stroke={paint.back}
          strokeOpacity={paint.backOpacity}
          strokeWidth={g.stroke.wires}
        />
        <circle
          {...g.backWheel}
          fill={paint.tyre}
          fillOpacity={paint.backOpacity}
          stroke={paint.back}
          strokeOpacity={paint.backOpacity}
        />
        <path d={g.chassis} stroke={paint.body} strokeWidth="2" />
      </g>
      {paint.playful && <StudioGoods />}
      <g fill="none" stroke={paint.body} strokeLinejoin="round">
        <path d={g.wires} strokeWidth={g.stroke.wires} />
        <path d={g.basket} strokeWidth={g.stroke.basket} />
        <path d={g.posts} strokeWidth={g.stroke.posts} />
        <path d={g.rim} strokeWidth={g.stroke.rim} />
      </g>
      <path d={g.grip} stroke={paint.grip} strokeWidth={g.stroke.grip} />
      {!paint.playful && paint.body !== paint.grip && (
        <path
          d={g.grip}
          stroke="#fff6d6"
          strokeWidth="1"
          strokeOpacity="0.7"
          transform="translate(0 -1.2)"
        />
      )}
      <rect
        {...g.plate}
        fill={paint.plate}
        stroke={paint.plateStroke}
        strokeWidth={paint.plateStroke ? 0.8 : undefined}
      />
      {g.wheels.map((w) => (
        <g key={w.cx}>
          <circle
            {...w}
            fill={paint.tyre}
            stroke={paint.body}
            strokeWidth="1.6"
          />
          <circle cx={w.cx} cy={w.cy} r="1.3" fill={paint.hub} />
        </g>
      ))}
    </g>
  );
}

FullGlyph.propTypes = { paint: PropTypes.object.isRequired };

const SHIELD = 'M10 5H54V29C54 44.5 44.5 53.5 32 59 19.5 53.5 10 44.5 10 29Z';

function Badge({ variant, theme, url }) {
  switch (variant) {
    case 'mono':
      return null;
    case 'inverse':
      return (
        <g>
          <rect width="64" height="64" rx="4" fill={C.midnight} />
          <rect
            x="0.75"
            y="0.75"
            width="62.5"
            height="62.5"
            rx="3.25"
            fill="none"
            stroke={url('gold')}
            strokeWidth="1.5"
          />
          <rect
            x="4.5"
            y="4.5"
            width="55"
            height="55"
            rx="1"
            fill="none"
            stroke={C.gold}
            strokeOpacity="0.35"
          />
        </g>
      );
    case 'studio':
      return (
        <g>
          <circle cx="32" cy="32" r="32" fill={url('navy')} />
          <circle
            cx="32"
            cy="32"
            r="30.75"
            fill="none"
            stroke={url('holo')}
            strokeWidth="2.5"
          />
        </g>
      );
    case 'crest':
      return (
        <g>
          <path d={SHIELD} fill={url('navy')} />
          <path d={SHIELD} fill="none" stroke={url('foil')} strokeWidth="2" />
          <path
            d={SHIELD}
            fill="none"
            stroke={C.gold}
            strokeOpacity="0.45"
            strokeWidth="0.75"
            transform="translate(32 31) scale(0.86) translate(-32 -31)"
          />
        </g>
      );
    default:
      return (
        <g>
          <rect width="64" height="64" rx="14" fill={url('navy')} />
          <rect
            x="0.5"
            y="0.5"
            width="63"
            height="63"
            rx="13.5"
            fill="none"
            stroke={theme === 'dark' ? C.gold : url('gold')}
            strokeOpacity={theme === 'dark' ? 0.55 : 0.7}
          />
        </g>
      );
  }
}

Badge.propTypes = {
  variant: PropTypes.string.isRequired,
  theme: PropTypes.string.isRequired,
  url: PropTypes.func.isRequired,
};

/**
 * The mark as an SVG group on a 64×64 grid, for embedding in a lockup.
 * `detail="micro"` swaps in the pixel-snapped glyph used at 16–32px.
 */
export function MarkArt({
  variant = 'primary',
  theme = 'light',
  detail = 'full',
}) {
  const id = useSvgIds();
  const url = (name) => `url(#${id(name)})`;
  const paint = paintFor(variant, theme, url);
  const glyph =
    detail === 'micro' ? (
      <MicroGlyph paint={paint} />
    ) : (
      <FullGlyph paint={paint} />
    );
  // The crest's shield is narrower than the square badges, so its glyph sits
  // a step smaller; every other variant uses the glyph at its native grid.
  const glyphTransform =
    variant === 'crest'
      ? 'translate(32 30) scale(0.7) translate(-32 -32)'
      : variant === 'studio'
        ? 'translate(32 33) scale(0.86) translate(-32 -32)'
        : undefined;

  return (
    <g>
      <defs>
        <Gradients id={id} />
      </defs>
      <Badge variant={variant} theme={theme} url={url} />
      <g transform={glyphTransform}>{glyph}</g>
    </g>
  );
}

MarkArt.propTypes = {
  variant: PropTypes.oneOf(MARK_VARIANTS),
  theme: PropTypes.oneOf(['light', 'dark']),
  detail: PropTypes.oneOf(['full', 'micro']),
};

/**
 * Standalone mark. `size` is the rendered pixel size; at 32px and below the
 * micro glyph is used automatically unless `detail` says otherwise.
 */
export function BrandMark({
  variant = 'primary',
  theme = 'light',
  size = 64,
  detail = 'auto',
  className = '',
  title = 'Cart Commerce',
  style = {},
}) {
  const resolvedDetail =
    detail === 'auto' ? (size <= 32 ? 'micro' : 'full') : detail;
  return (
    <svg
      className={className || undefined}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? 'img' : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : 'true'}
      style={style}
    >
      <MarkArt variant={variant} theme={theme} detail={resolvedDetail} />
    </svg>
  );
}

BrandMark.propTypes = {
  variant: PropTypes.oneOf(MARK_VARIANTS),
  theme: PropTypes.oneOf(['light', 'dark']),
  size: PropTypes.number,
  detail: PropTypes.oneOf(['auto', 'full', 'micro']),
  className: PropTypes.string,
  title: PropTypes.string,
  style: PropTypes.object,
};
