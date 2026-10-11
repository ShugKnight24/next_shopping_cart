import PropTypes from 'prop-types';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './CartTrackScene.module.css';
import {
  CART_BOX,
  CART_FLOOR_Y,
  CART_HANDLE,
  CartBack,
  CartFront,
  cartPoint,
} from './ChromeCart';
import { ART, GiftBoxArt, GoldCardArt, poly, useSvgIds } from './heroArt';

/**
 * Cart Track: a chrome Cart Commerce cart glides along a lit gold rail,
 * catalogue pieces hop off their display plinths into the basket, and the
 * cart pays with a gold card tap before a gift box drops in.
 *
 * The scene is drawn in "world" units (a viewBox). Everything that moves is
 * its own small HTML layer animated with transform/opacity only, so the
 * compositor does the work. The choreography is computed once from a single
 * timeline, so each product lands exactly where the moving cart will be.
 */

const fmt = (n) => `$${n.toLocaleString('en-US')}.00`;

// Where each piece rests inside the basket, in local cart units.
const CART_SLOTS = {
  slab: { x: 30, y: 66, z: 52, r: -8, k: 0.8 },
  guitar: { x: 112, y: 98, z: 44, r: 22, k: 0.62 },
  headphones: { x: 100, y: 70, z: 32, r: 6, k: 0.8 },
  sneaker: { x: 52, y: 76, z: 22, r: -6, k: 0.78 },
};
const GIFT_SLOT = { x: 62, y: 60, z: 14, size: 1.2 };
const SLOT_ORDER = ['slab', 'guitar', 'headphones', 'sneaker'];

const CATALOGUE = {
  sneaker: { label: 'AIR JORDAN 1', price: 425, k: 1 },
  headphones: { label: 'SONY WH-1000XM5', price: 398, k: 1.05 },
  slab: { label: 'MOX DIAMOND', price: 680, k: 1.1 },
  guitar: { label: 'FENDER STRAT', price: 4850, k: 0.7 },
};

const LAYOUTS = {
  wide: {
    key: 'w',
    W: 1200,
    H: 360,
    G: 300,
    s: 1.2,
    speed: 170,
    enter: -300,
    constStop: 740,
    park: 820,
    exit: 1340,
    plinths: [
      { xp: 96, kind: 'sneaker' },
      { xp: 296, kind: 'headphones' },
      { xp: 496, kind: 'slab' },
      { xp: 696, kind: 'guitar' },
    ],
    plaque: 8,
  },
  compact: {
    key: 'c',
    W: 640,
    H: 360,
    G: 300,
    s: 1.2,
    speed: 150,
    enter: -300,
    constStop: 182,
    park: 262,
    exit: 720,
    plinths: [
      { xp: -6, kind: 'sneaker' },
      { xp: 150, kind: 'headphones' },
    ],
    plaque: 12,
  },
};

/* ------------------------------ Timeline maths ----------------------------- */

const bezier = (x1, y1, x2, y2) => (p) => {
  const bx = (u) =>
    3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
  const by = (u) =>
    3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 32; i += 1) {
    const mid = (lo + hi) / 2;
    if (bx(mid) < p) lo = mid;
    else hi = mid;
  }
  return by((lo + hi) / 2);
};
const cb = (pts) => `cubic-bezier(${pts.join(',')})`;
const EASE_OUT_QUAD = [0.25, 0.46, 0.45, 0.94];
const EASE_IN_QUAD = [0.55, 0.085, 0.68, 0.53];
const EASE_IN_OUT = [0.45, 0, 0.25, 1];
const EASE_OUT = [0.16, 1, 0.3, 1];
const BACK_OUT = [0.34, 1.56, 0.64, 1];
const EXIT_EASE = [0.5, 0, 0.75, 0.5];

function buildScene(L) {
  const { W, H, G, s } = L;
  const Pw = (x, up, z) => [x + z * 0.42 * s, G - up - (z - 8) * 0.3 * s];
  const Y0 = G - s * CART_FLOOR_Y;
  const toWorld = (cx, [lx, ly]) => [cx + s * lx, Y0 + s * ly];

  // Cart motion: cruise, ease into the till, pay, roll out.
  const t1 = (L.constStop - L.enter) / L.speed;
  const decelDur = 0.9;
  const decelSlope = (L.speed * decelDur) / (L.park - L.constStop);
  const DECEL = [0.3, +(0.3 * decelSlope).toFixed(3), 0.45, 1];
  const t2 = t1 + decelDur;
  const tCard = t2 + 0.25;
  const tTap = tCard + 0.75;
  const tPaid = tTap + 0.2;
  const tGift = tTap + 0.75;
  const tGiftLand = tGift + 0.55;
  const t3 = tGiftLand + 0.75;
  const exitDur = 1.5;
  const t4 = t3 + exitDur;
  const T = +(t4 + 0.5).toFixed(2);

  const decel = bezier(...DECEL);
  const exitE = bezier(...EXIT_EASE);
  const cx = (t) => {
    if (t <= t1) return L.enter + L.speed * t;
    if (t <= t2)
      return L.constStop + (L.park - L.constStop) * decel((t - t1) / decelDur);
    if (t <= t3) return L.park;
    if (t <= t4) return L.park + (L.exit - L.park) * exitE((t - t3) / exitDur);
    return L.exit;
  };

  // Plinths and hops.
  const PLINTH = { w: 96, d: 50, h: 120, z: 96 };
  const HOP = 0.78;
  const items = L.plinths.map((p, i) => {
    const cat = CATALOGUE[p.kind];
    const slot = CART_SLOTS[p.kind];
    const [X, Yb] = Pw(p.xp + PLINTH.w / 2, PLINTH.h, PLINTH.z + PLINTH.d / 2);
    const local = cartPoint(slot.x, slot.y, slot.z);
    // Land a touch ahead of where the product left from.
    const target = X + 22;
    let lo = 0;
    let hi = t2;
    for (let n = 0; n < 40; n += 1) {
      const mid = (lo + hi) / 2;
      if (toWorld(cx(mid), local)[0] < target) lo = mid;
      else hi = mid;
    }
    const tLand = (lo + hi) / 2;
    const [wx, wy] = toWorld(cx(tLand), local);
    const dy = wy - Yb;
    const apex = 40;
    return {
      ...p,
      ...cat,
      slot,
      X,
      Yb,
      dx: wx - X,
      dy,
      apex,
      apexAt: Math.sqrt(apex) / (Math.sqrt(apex) + Math.sqrt(apex + dy)),
      scale: (s * slot.k) / cat.k,
      tLaunch: tLand - HOP,
      tLand,
      tRestock: t3 + 0.3 + i * 0.18,
      index: i,
    };
  });
  const landings = [...items].sort((a, b) => a.tLand - b.tLand);
  const total = items.reduce((sum, it) => sum + it.price, 0);

  // Terminal.
  const TL = L.park + 236;
  const reader = [TL + 44, 141];
  const handle = toWorld(L.park, CART_HANDLE);
  const giftLocal = cartPoint(GIFT_SLOT.x, GIFT_SLOT.y, GIFT_SLOT.z);
  const giftWorld = toWorld(L.park, giftLocal);

  return {
    L,
    W,
    H,
    G,
    s,
    Pw,
    Y0,
    T,
    t1,
    t2,
    t3,
    t4,
    tCard,
    tTap,
    tPaid,
    tGift,
    tGiftLand,
    DECEL,
    PLINTH,
    items,
    landings,
    total,
    TL,
    reader,
    handle,
    giftLocal,
    giftWorld,
  };
}

/* ------------------------------ Keyframe CSS ------------------------------ */

function buildCss(S) {
  const { W, T, L } = S;
  const pre = `cct-${L.key}`;
  const c = (v) => `${((v * 100) / W).toFixed(3)}cqw`;
  const tx = (v) => `translate3d(${c(v)},0,0)`;
  const ty = (v) => `translate3d(0,${c(v)},0)`;
  const pct = (t) => `${Math.min(100, Math.max(0, (t / T) * 100)).toFixed(3)}%`;
  const eps = 0.01;

  const blocks = [];
  const rules = [];
  // frames: [t, declarations, easing?]
  const kf = (name, frames, delay = 0) => {
    const sorted = [...frames].sort((a, b) => a[0] - b[0]);
    const body = sorted
      .map(
        ([t, decl, ease]) =>
          `${pct(t)}{${decl}${ease ? `;animation-timing-function:${ease}` : ''}}`
      )
      .join('');
    blocks.push(`@keyframes ${pre}-${name}{${body}}`);
    rules.push(
      `.${pre}-${name}{animation:${pre}-${name} ${T}s linear ${delay}s infinite}`
    );
  };
  const vis = (intervals, fade = 0.14) => {
    const frames = [[0, 'opacity:0']];
    intervals.forEach(([a, b]) => {
      frames.push([Math.max(0, a - fade), 'opacity:0']);
      frames.push([a, 'opacity:1']);
      frames.push([b, 'opacity:1']);
      frames.push([Math.min(T, b + fade), 'opacity:0']);
    });
    frames.push([T, 'opacity:0']);
    // An interval that starts at 0 must be visible at 0.
    if (intervals.some(([a]) => a <= 0)) frames[0] = [0, 'opacity:1'];
    if (intervals.some(([, b]) => b >= T))
      frames[frames.length - 1] = [T, 'opacity:1'];
    return frames;
  };

  // Cart travel.
  kf('cart', [
    [0, `transform:${tx(L.enter)}`, 'linear'],
    [S.t1, `transform:${tx(L.constStop)}`, cb(S.DECEL)],
    [S.t2, `transform:${tx(L.park)}`],
    [S.t3, `transform:${tx(L.park)}`, cb(EXIT_EASE)],
    [S.t4, `transform:${tx(L.exit)}`],
    [T, `transform:${tx(L.exit)}`],
  ]);

  // Suspension dip whenever something lands in the basket.
  const dips = [...S.landings.map((it) => it.tLand), S.tGiftLand];
  const dipFrames = [[0, `transform:${ty(0)}`]];
  dips.forEach((t) => {
    dipFrames.push([t, `transform:${ty(0)}`, cb(EASE_OUT)]);
    dipFrames.push([t + 0.1, `transform:${ty(2.6)}`, cb(EASE_IN_OUT)]);
    dipFrames.push([t + 0.36, `transform:${ty(0)}`]);
  });
  dipFrames.push([T, `transform:${ty(0)}`]);
  kf('dip', dipFrames);

  S.items.forEach((it) => {
    const n = it.index;
    // Goods inside the basket.
    kf(`good${n}`, [
      [0, `opacity:0;transform:${ty(0)}`],
      [it.tLand - eps, `opacity:0;transform:${ty(0)}`],
      [it.tLand, `opacity:1;transform:${ty(-3)}`, cb(EASE_OUT)],
      [it.tLand + 0.16, `opacity:1;transform:${ty(1.4)}`, cb(EASE_IN_OUT)],
      [it.tLand + 0.32, `opacity:1;transform:${ty(0)}`],
      [S.t4 + 0.05, `opacity:1;transform:${ty(0)}`],
      [S.t4 + 0.05 + eps, `opacity:0;transform:${ty(0)}`],
      [T, `opacity:0;transform:${ty(0)}`],
    ]);
    // The display piece: leaves at landing, restocks as the cart rolls out.
    kf(`stock${n}`, [
      [0, `opacity:1;transform:${ty(0)}`],
      [it.tLand - eps, `opacity:1;transform:${ty(0)}`],
      [it.tLand, `opacity:0;transform:${ty(0)}`],
      [it.tRestock, `opacity:0;transform:${ty(18)}`, cb(EASE_OUT)],
      [it.tRestock + 0.7, `opacity:1;transform:${ty(0)}`],
      [T, `opacity:1;transform:${ty(0)}`],
    ]);
    kf(`hopx${n}`, [
      [0, `transform:${tx(0)}`],
      [it.tLaunch, `transform:${tx(0)}`, 'linear'],
      [it.tLand, `transform:${tx(it.dx)}`],
      [it.tRestock - eps, `transform:${tx(it.dx)}`],
      [it.tRestock, `transform:${tx(0)}`],
      [T, `transform:${tx(0)}`],
    ]);
    kf(`hopy${n}`, [
      [0, `transform:${ty(0)}`],
      [it.tLaunch - 0.16, `transform:${ty(0)}`, cb(EASE_IN_OUT)],
      [it.tLaunch - 0.06, `transform:${ty(2)}`, cb(EASE_OUT)],
      [it.tLaunch, `transform:${ty(0)}`, cb(EASE_OUT_QUAD)],
      [
        it.tLaunch + 0.78 * it.apexAt,
        `transform:${ty(-it.apex)}`,
        cb(EASE_IN_QUAD),
      ],
      [it.tLand, `transform:${ty(it.dy)}`],
      [it.tRestock - eps, `transform:${ty(it.dy)}`],
      [it.tRestock, `transform:${ty(0)}`],
      [T, `transform:${ty(0)}`],
    ]);
    const spin = it.slot.r;
    kf(`hops${n}`, [
      [0, 'transform:rotate(0deg) scale(1)'],
      [it.tLaunch, 'transform:rotate(0deg) scale(1)', cb(EASE_IN_OUT)],
      [it.tLand, `transform:rotate(${spin}deg) scale(${it.scale.toFixed(3)})`],
      [
        it.tRestock - eps,
        `transform:rotate(${spin}deg) scale(${it.scale.toFixed(3)})`,
      ],
      [it.tRestock, 'transform:rotate(0deg) scale(1)'],
      [T, 'transform:rotate(0deg) scale(1)'],
    ]);
    // Price chip rising from the basket.
    kf(`chip${n}`, [
      [0, `opacity:0;transform:${ty(0)}`],
      [it.tLand, `opacity:0;transform:${ty(0)}`, cb(EASE_OUT)],
      [it.tLand + 0.14, `opacity:1;transform:${ty(-8)}`],
      [it.tLand + 0.8, `opacity:1;transform:${ty(-24)}`, cb(EASE_IN_OUT)],
      [it.tLand + 1.05, `opacity:0;transform:${ty(-30)}`],
      [T, `opacity:0;transform:${ty(0)}`],
    ]);
  });

  // Gift drop after payment.
  kf('giftop', [
    [0, 'opacity:0'],
    [S.tGift, 'opacity:0'],
    [S.tGift + 0.15, 'opacity:1'],
    [S.t4 + 0.05, 'opacity:1'],
    [S.t4 + 0.05 + eps, 'opacity:0'],
    [T, 'opacity:0'],
  ]);
  kf('giftdrop', [
    [0, `transform:${ty(-150)} rotate(-14deg)`],
    [S.tGift, `transform:${ty(-150)} rotate(-14deg)`, cb(EASE_IN_QUAD)],
    [S.tGiftLand, `transform:${ty(0)} rotate(0deg)`, cb(EASE_OUT)],
    [S.tGiftLand + 0.14, `transform:${ty(-6)} rotate(2deg)`, cb(EASE_IN_OUT)],
    [S.tGiftLand + 0.32, `transform:${ty(0)} rotate(0deg)`],
    [T, `transform:${ty(0)} rotate(0deg)`],
  ]);

  // Gold card: from the cart handle, arcs to the reader, taps, lifts away.
  const [hx, hy] = S.handle;
  const [rx, ry] = S.reader;
  kf('cardop', [
    [0, 'opacity:0'],
    [S.tCard, 'opacity:0', cb(EASE_OUT)],
    [S.tCard + 0.2, 'opacity:1'],
    [S.tTap + 0.7, 'opacity:1'],
    [S.tTap + 1.05, 'opacity:0'],
    [T, 'opacity:0'],
  ]);
  kf('cardx', [
    [0, `transform:${tx(hx - rx)}`],
    [S.tCard, `transform:${tx(hx - rx)}`, cb(EASE_IN_OUT)],
    [S.tTap, `transform:${tx(0)}`],
    [S.tTap + 1.05, `transform:${tx(16)}`],
    [T, `transform:${tx(hx - rx)}`],
  ]);
  kf('cardy', [
    [0, `transform:${ty(hy - ry)}`],
    [S.tCard, `transform:${ty(hy - ry)}`, cb(EASE_OUT)],
    [S.tCard + 0.42, `transform:${ty(-58)}`, cb(EASE_IN_OUT)],
    [S.tTap, `transform:${ty(0)}`, cb(EASE_OUT)],
    [S.tTap + 0.1, `transform:${ty(4)}`, cb(EASE_IN_OUT)],
    [S.tTap + 0.32, `transform:${ty(-8)}`, cb(EASE_IN_OUT)],
    [S.tTap + 1.05, `transform:${ty(-34)}`],
    [T, `transform:${ty(hy - ry)}`],
  ]);
  kf('cardr', [
    [0, 'transform:rotate(18deg) scale(0.6)'],
    [S.tCard, 'transform:rotate(18deg) scale(0.6)', cb(EASE_IN_OUT)],
    [S.tTap, 'transform:rotate(-12deg) scale(1)'],
    [T, 'transform:rotate(-12deg) scale(1)'],
  ]);

  // Contactless ripples on the reader.
  [0, 1].forEach((j) => {
    const t = S.tTap + 0.04 + j * 0.2;
    kf(`ripple${j}`, [
      [0, 'opacity:0;transform:scale(0.4)'],
      [t, 'opacity:0.95;transform:scale(0.4)', cb(EASE_OUT)],
      [t + 0.8, 'opacity:0;transform:scale(1.9)'],
      [T, 'opacity:0;transform:scale(0.4)'],
    ]);
  });

  // Terminal screen: running total, then paid.
  const marks = S.landings.map((it) => it.tLand);
  const resetAt = S.t4 + 0.2;
  for (let k = 0; k <= S.landings.length; k += 1) {
    const start = k === 0 ? 0 : marks[k - 1];
    const end = k === S.landings.length ? S.tPaid : marks[k];
    const intervals = [[start, end]];
    if (k === 0) intervals.push([resetAt, T]);
    kf(`screen${k}`, vis(intervals, 0.12));
  }
  kf('paid', vis([[S.tPaid, resetAt]], 0.12));
  kf('check', [
    [0, 'transform:scale(0.4)'],
    [S.tPaid, 'transform:scale(0.4)', cb(BACK_OUT)],
    [S.tPaid + 0.5, 'transform:scale(1)'],
    [T, 'transform:scale(1)'],
  ]);

  // Gift sparkle burst.
  kf('spark', [
    [0, 'opacity:0;transform:scale(0.2) rotate(0deg)'],
    [
      S.tGiftLand - 0.05,
      'opacity:0;transform:scale(0.2) rotate(0deg)',
      cb(EASE_OUT),
    ],
    [
      S.tGiftLand + 0.2,
      'opacity:1;transform:scale(1) rotate(45deg)',
      cb(EASE_IN_OUT),
    ],
    [S.tGiftLand + 0.8, 'opacity:0;transform:scale(0.5) rotate(90deg)'],
    [T, 'opacity:0;transform:scale(0.2) rotate(0deg)'],
  ]);

  // A slow light running along the front rail.
  kf('glint', [
    [0, `opacity:0;transform:${tx(-200)}`, 'linear'],
    [
      T * 0.04,
      `opacity:1;transform:${tx(-200 + (W + 400) * 0.04 * 1.6)}`,
      'linear',
    ],
    [T * 0.56, `opacity:1;transform:${tx(W + 100)}`],
    [T * 0.6, `opacity:0;transform:${tx(W + 200)}`],
    [T, `opacity:0;transform:${tx(-200)}`],
  ]);

  return `${blocks.join('')}@media (prefers-reduced-motion: no-preference){${rules.join('')}}`;
}

/* ------------------------------ Render helpers ----------------------------- */

const pctOf = (v, of) => `${((v / of) * 100).toFixed(4)}%`;

function Layer({ S, box, className = '', style, origin, children }) {
  return (
    <div
      className={`${styles.layer} ${className}`}
      style={{
        left: pctOf(box[0], S.W),
        top: pctOf(box[1], S.H),
        width: pctOf(box[2], S.W),
        height: pctOf(box[3], S.H),
        transformOrigin: origin,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
Layer.propTypes = {
  S: PropTypes.object.isRequired,
  box: PropTypes.arrayOf(PropTypes.number).isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  origin: PropTypes.string,
  children: PropTypes.node,
};

function Fill({ className = '', style, origin, children }) {
  return (
    <div
      className={`${styles.fill} ${className}`}
      style={{ transformOrigin: origin, ...style }}
    >
      {children}
    </div>
  );
}
Fill.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  origin: PropTypes.string,
  children: PropTypes.node,
};

const Svg = ({ box, children }) => (
  <svg viewBox={box.join(' ')} xmlns="http://www.w3.org/2000/svg">
    {children}
  </svg>
);
Svg.propTypes = {
  box: PropTypes.arrayOf(PropTypes.number).isRequired,
  children: PropTypes.node,
};

/* ------------------------------ Static backdrop ---------------------------- */

function Backdrop({ S }) {
  const u = useSvgIds();
  const { W, H, G, Pw, PLINTH, TL } = S;
  const far = [-400, W + 400];
  const bedTop = poly([
    Pw(far[0], 0, -14),
    Pw(far[1], 0, -14),
    Pw(far[1], 0, 74),
    Pw(far[0], 0, 74),
  ]);
  const [, bedFrontY] = Pw(0, 0, -14);
  const sleepers = [];
  for (let x = -360; x < W + 200; x += 34) {
    sleepers.push(
      poly([Pw(x, 0, -2), Pw(x + 11, 0, -2), Pw(x + 11, 0, 66), Pw(x, 0, 66)])
    );
  }
  const rail = (z) => {
    const a = Pw(far[0], -1.5, z);
    const b = Pw(far[1], -1.5, z);
    return `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={styles.backdrop}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={u('floor')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#daa520" stopOpacity="0.16" />
          <stop offset="0.5" stopColor="#2d5a87" stopOpacity="0.12" />
          <stop offset="1" stopColor="#0f2744" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={u('spot')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6d6" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff6d6" stopOpacity="0.07" />
          <stop offset="1" stopColor="#fff6d6" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id={u('plinthFront')} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#24507e" />
          <stop offset="0.55" stopColor="#163657" />
          <stop offset="1" stopColor="#0b1d33" />
        </linearGradient>
        <linearGradient id={u('plinthSide')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#11284a" />
          <stop offset="1" stopColor="#06111f" />
        </linearGradient>
        <linearGradient id={u('plinthTop')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4a7bb0" />
          <stop offset="1" stopColor="#2a5585" />
        </linearGradient>
        <radialGradient id={u('pool')}>
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={u('gold')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbe7a1" />
          <stop offset="0.5" stopColor="#d9a62e" />
          <stop offset="1" stopColor="#a8761a" />
        </linearGradient>
        <linearGradient id={u('railGold')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2c2" />
          <stop offset="0.45" stopColor="#e2b246" />
          <stop offset="1" stopColor="#8a5f12" />
        </linearGradient>
        <linearGradient id={u('bed')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d2038" />
          <stop offset="1" stopColor="#173757" />
        </linearGradient>
        <linearGradient id={u('bedFront')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1a2e" />
          <stop offset="1" stopColor="#050d18" />
        </linearGradient>
        <linearGradient id={u('kiosk')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2d5a87" />
          <stop offset="0.4" stopColor="#173757" />
          <stop offset="1" stopColor="#081a2f" />
        </linearGradient>
        <linearGradient id={u('glass')} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#13253d" />
          <stop offset="1" stopColor="#050b14" />
        </linearGradient>
        <filter id={u('blur')} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>

      {/* Floor glow */}
      <ellipse
        cx={W / 2}
        cy={G - 30}
        rx={W * 0.62}
        ry="110"
        fill={`url(#${u('floor')})`}
      />

      {/* Display plinths with spotlights */}
      {S.items.map((it) => {
        const { xp } = it;
        const z0 = PLINTH.z;
        const z1 = PLINTH.z + PLINTH.d;
        const A = Pw(xp, PLINTH.h, z0);
        const B = Pw(xp + PLINTH.w, PLINTH.h, z0);
        const C = Pw(xp + PLINTH.w, PLINTH.h, z1);
        const D = Pw(xp, PLINTH.h, z1);
        const A0 = Pw(xp, 0, z0);
        const B0 = Pw(xp + PLINTH.w, 0, z0);
        const C0 = Pw(xp + PLINTH.w, 0, z1);
        const midX = (A[0] + B[0]) / 2;
        return (
          <g key={it.kind}>
            <path
              d={poly([
                [it.X - 12, -10],
                [it.X + 12, -10],
                [it.X + 70, it.Yb + 4],
                [it.X - 70, it.Yb + 4],
              ])}
              fill={`url(#${u('spot')})`}
            />
            <ellipse
              cx={midX + 14}
              cy={A0[1] + 2}
              rx="78"
              ry="9"
              fill="#020617"
              opacity="0.45"
            />
            <path d={poly([A, B, B0, A0])} fill={`url(#${u('plinthFront')})`} />
            <path d={poly([B, C, C0, B0])} fill={`url(#${u('plinthSide')})`} />
            <path d={poly([A, B, C, D])} fill={`url(#${u('plinthTop')})`} />
            <ellipse
              cx={it.X}
              cy={it.Yb}
              rx="44"
              ry="11"
              fill={`url(#${u('pool')})`}
            />
            {/* Gold trims */}
            <path
              d={`M${A[0]} ${A[1]}L${B[0]} ${B[1]}L${C[0]} ${C[1]}`}
              stroke={`url(#${u('gold')})`}
              strokeWidth="2.2"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d={poly([[A0[0], A0[1] - 9], [B0[0], B0[1] - 9], B0, A0])}
              fill="#d9a62e"
              opacity="0.22"
            />
            <path
              d={`M${A[0] + 1} ${A[1] + 2}V${A0[1] - 2}`}
              stroke="#ffffff"
              strokeOpacity="0.18"
              strokeWidth="1.5"
            />
            {/* Plaque */}
            <g transform={`translate(${midX} ${A[1] + 26})`}>
              <rect
                x={-(it.label.length * S.L.plaque * 0.36 + 10)}
                y={-S.L.plaque * 1.2}
                width={(it.label.length * S.L.plaque * 0.36 + 10) * 2}
                height={S.L.plaque * 2.9}
                rx="2.5"
                fill="#081a2f"
                stroke={`url(#${u('gold')})`}
                strokeWidth="0.8"
              />
              <text
                y="0"
                fontFamily="Inter, system-ui, sans-serif"
                fontSize={S.L.plaque * 0.78}
                fontWeight="700"
                letterSpacing="1"
                fill="#f6dd8a"
                textAnchor="middle"
              >
                {it.label}
              </text>
              <text
                y={S.L.plaque * 1.2}
                fontFamily="Inter, system-ui, sans-serif"
                fontSize={S.L.plaque * 0.9}
                fontWeight="800"
                fill="#ffffff"
                textAnchor="middle"
              >
                {fmt(it.price).replace('.00', '')}
              </text>
            </g>
          </g>
        );
      })}

      {/* Checkout kiosk */}
      <g>
        <ellipse
          cx={TL + 50}
          cy={G - 30}
          rx="46"
          ry="8"
          fill="#020617"
          opacity="0.5"
        />
        <ellipse
          cx={TL + 44}
          cy={G - 34}
          rx="32"
          ry="6.5"
          fill={`url(#${u('kiosk')})`}
          stroke={`url(#${u('gold')})`}
          strokeWidth="1.4"
        />
        <rect
          x={TL + 37}
          y="118"
          width="14"
          height={G - 34 - 118}
          fill={`url(#${u('kiosk')})`}
        />
        <path
          d={`M${TL + 39} 120V${G - 38}`}
          stroke="#ffffff"
          strokeOpacity="0.2"
          strokeWidth="1.4"
        />
        {/* Reader pad */}
        <path
          d={`M${TL + 22} 136 L${TL + 66} 136 L${TL + 70} 148 L${TL + 18} 148 Z`}
          fill={`url(#${u('kiosk')})`}
          stroke={`url(#${u('gold')})`}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <g
          stroke="#f6dd8a"
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
          transform={`translate(${TL + 44} 142)`}
        >
          <path d="M-1.5 -3 C0 -1.5 0 1.5 -1.5 3" />
          <path d="M1.5 -5 C4 -2 4 2 1.5 5" />
          <path d="M4.5 -6.5 C8 -2.5 8 2.5 4.5 6.5" />
        </g>
        {/* Head */}
        <path d={`M${TL + 88} 58 l6 -4 v60 l-6 6 Z`} fill="#081a2f" />
        <rect
          x={TL}
          y="56"
          width="88"
          height="64"
          rx="7"
          fill={`url(#${u('glass')})`}
          stroke={`url(#${u('gold')})`}
          strokeWidth="1.4"
        />
        <rect x={TL + 6} y="62" width="76" height="50" rx="3" fill="#0b1d33" />
        <path
          d={`M${TL + 6} 62 h34 l-20 50 h-14 Z`}
          fill="#ffffff"
          opacity="0.05"
        />
        <circle cx={TL + 44} cy="116.5" r="1.3" fill="#f6dd8a" />
        {/* Sign */}
        <text
          x={TL + 44}
          y="40"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="10"
          fontWeight="800"
          letterSpacing="3"
          fill="#f6dd8a"
          textAnchor="middle"
        >
          CHECKOUT
        </text>
        <path
          d={`M${TL + 2} 46 H${TL + 86}`}
          stroke={`url(#${u('gold')})`}
          strokeWidth="1"
          opacity="0.7"
        />
      </g>

      {/* Track bed */}
      <path d={bedTop} fill={`url(#${u('bed')})`} />
      <path
        d={`M${far[0]} ${bedFrontY}H${far[1]}V${bedFrontY + 14}H${far[0]}Z`}
        fill={`url(#${u('bedFront')})`}
      />
      <path
        d={`M${far[0]} ${bedFrontY}H${far[1]}`}
        stroke={`url(#${u('gold')})`}
        strokeWidth="1.2"
        opacity="0.85"
      />
      <g fill="#2a4566" opacity="0.9">
        {sleepers.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {/* Rails with their reflections in the polished bed */}
      {[56, 8].map((z) => (
        <g key={z}>
          <path
            d={rail(z)}
            stroke="#f0c75e"
            strokeWidth="3"
            opacity="0.32"
            filter={`url(#${u('blur')})`}
            transform="translate(0 6)"
          />
          <path
            d={rail(z)}
            stroke="#3a2a08"
            strokeWidth="8.5"
            opacity="0.6"
            transform="translate(0 1.4)"
          />
          <path d={rail(z)} stroke={`url(#${u('railGold')})`} strokeWidth="6" />
          <path
            d={rail(z)}
            stroke="#fff8dc"
            strokeWidth="1.3"
            opacity="0.9"
            transform="translate(0 -1.6)"
          />
        </g>
      ))}
    </svg>
  );
}
Backdrop.propTypes = { S: PropTypes.object.isRequired };

/* --------------------------------- Scene ---------------------------------- */

function TrackScene({ S, css, paused }) {
  const cls = (name) => `cct-${S.L.key}-${name}`;
  const { W, s, Y0 } = S;
  const cartBox = [
    s * CART_BOX[0],
    Y0 + s * CART_BOX[1],
    s * CART_BOX[2],
    s * CART_BOX[3],
  ];
  const parkStyle = {
    transform: `translate3d(${((S.L.park * 100) / W).toFixed(3)}cqw,0,0)`,
  };
  const cartItems = SLOT_ORDER.map((kind) =>
    S.items.find((it) => it.kind === kind)
  ).filter(Boolean);
  const [rx, ry] = S.reader;
  const cardBox = [rx - 30, ry - 26, 60, 40];
  const [gx, gy] = S.giftWorld;
  const screenBox = [S.TL + 6, 62, 76, 50];
  const sparkPts = [
    [-26, -44],
    [30, -52],
    [44, -20],
    [-10, -66],
    [12, -30],
  ];

  return (
    <div
      className={`${styles.scene} ${paused ? styles.paused : ''}`}
      style={{ aspectRatio: `${W} / ${S.H}` }}
    >
      <style>{css}</style>
      <Backdrop S={S} />

      {/* Rail glint */}
      <Layer S={S} box={[0, S.G - 14, 200, 28]}>
        <Fill className={cls('glint')} style={{ opacity: 0 }}>
          <div className={styles.glint} />
        </Fill>
      </Layer>

      {/* Cart: back wires and goods */}
      <Layer S={S} box={cartBox}>
        <Fill className={cls('cart')} style={parkStyle}>
          <Fill className={cls('dip')}>
            <Fill>
              <Svg box={CART_BOX}>
                <CartBack />
              </Svg>
            </Fill>
            {cartItems.map((it) => {
              const { Art } = ART[it.kind];
              const [lx, ly] = cartPoint(it.slot.x, it.slot.y, it.slot.z);
              return (
                <Fill key={it.kind} className={cls(`good${it.index}`)}>
                  <Svg box={CART_BOX}>
                    <Art
                      transform={`translate(${lx} ${ly}) rotate(${it.slot.r}) scale(${it.slot.k})`}
                    />
                  </Svg>
                </Fill>
              );
            })}
            <Fill className={cls('giftop')}>
              <Fill
                className={cls('giftdrop')}
                origin={`${pctOf(S.giftLocal[0] - CART_BOX[0], CART_BOX[2])} ${pctOf(S.giftLocal[1] - CART_BOX[1], CART_BOX[3])}`}
              >
                <Svg box={CART_BOX}>
                  <GiftBoxArt
                    size={GIFT_SLOT.size}
                    transform={`translate(${S.giftLocal[0]} ${S.giftLocal[1]})`}
                  />
                </Svg>
              </Fill>
            </Fill>
          </Fill>
        </Fill>
      </Layer>

      {/* Display pieces that hop into the basket */}
      {S.items.map((it) => {
        const { Art, box } = ART[it.kind];
        const k = it.k;
        const layerBox = [
          it.X + k * box[0],
          it.Yb + k * box[1],
          k * box[2],
          k * box[3],
        ];
        const origin = `${pctOf(-box[0], box[2])} ${pctOf(-box[1], box[3])}`;
        return (
          <Layer key={it.kind} S={S} box={layerBox} origin={origin}>
            <Fill className={cls(`stock${it.index}`)}>
              <Fill className={cls(`hopx${it.index}`)}>
                <Fill className={cls(`hopy${it.index}`)}>
                  <Fill className={cls(`hops${it.index}`)} origin={origin}>
                    <Svg box={box}>
                      <Art />
                    </Svg>
                  </Fill>
                </Fill>
              </Fill>
            </Fill>
          </Layer>
        );
      })}

      {/* Cart: front wires, rim, handle */}
      <Layer S={S} box={cartBox}>
        <Fill className={cls('cart')} style={parkStyle}>
          <Fill className={cls('dip')}>
            <Svg box={CART_BOX}>
              <CartFront />
            </Svg>
          </Fill>
        </Fill>
      </Layer>

      {/* Price chips */}
      {S.items.map((it) => {
        const [lx] = cartPoint(it.slot.x, it.slot.y, it.slot.z);
        const landX = it.X + it.dx;
        const chipX = landX - s * lx + s * 80;
        return (
          <Layer key={it.kind} S={S} box={[chipX - 40, Y0 + s * 6, 80, 22]}>
            <Fill className={cls(`chip${it.index}`)} style={{ opacity: 0 }}>
              <span className={styles.chip}>
                +{fmt(it.price).replace('.00', '')}
              </span>
            </Fill>
          </Layer>
        );
      })}

      {/* Terminal screen */}
      <Layer S={S} box={screenBox}>
        {Array.from({ length: S.landings.length + 1 }, (_, k) => {
          const sum = S.landings
            .slice(0, k)
            .reduce((acc, it) => acc + it.price, 0);
          return (
            <Fill key={k} className={cls(`screen${k}`)} style={{ opacity: 0 }}>
              <Svg box={screenBox}>
                <text
                  x={screenBox[0] + 7}
                  y={screenBox[1] + 13}
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize="6.4"
                  fontWeight="700"
                  letterSpacing="1"
                  fill="#8fb3d9"
                >
                  {`ITEMS ${k}`}
                </text>
                <text
                  x={screenBox[0] + 7}
                  y={screenBox[1] + 31}
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize="13"
                  fontWeight="800"
                  fill="#ffffff"
                >
                  {fmt(sum)}
                </text>
                <text
                  x={screenBox[0] + 7}
                  y={screenBox[1] + 43}
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize="5.6"
                  fontWeight="700"
                  letterSpacing="1"
                  fill="#f6dd8a"
                >
                  {k === S.landings.length ? 'TAP TO PAY' : 'ADDING TO CART…'}
                </text>
              </Svg>
            </Fill>
          );
        })}
        <Fill className={cls('paid')}>
          <Fill className={cls('check')} origin="50% 40%">
            <Svg box={screenBox}>
              <circle
                cx={screenBox[0] + 38}
                cy={screenBox[1] + 20}
                r="11"
                fill="#d9a62e"
              />
              <circle
                cx={screenBox[0] + 38}
                cy={screenBox[1] + 20}
                r="14.5"
                fill="none"
                stroke="#f6dd8a"
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              <path
                d={`M${screenBox[0] + 32.5} ${screenBox[1] + 20.5} l3.8 3.8 l7.4 -8`}
                stroke="#0f2744"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <text
                x={screenBox[0] + 38}
                y={screenBox[1] + 44}
                fontFamily="Inter, system-ui, sans-serif"
                fontSize="6.4"
                fontWeight="800"
                letterSpacing="1.4"
                fill="#ffffff"
                textAnchor="middle"
              >
                {`PAID ${fmt(S.total)}`}
              </text>
            </Svg>
          </Fill>
        </Fill>
      </Layer>

      {/* Contactless ripples */}
      {[0, 1].map((j) => (
        <Layer key={j} S={S} box={[rx - 30, ry - 14, 60, 28]}>
          <Fill className={cls(`ripple${j}`)} style={{ opacity: 0 }}>
            <div className={styles.ripple} />
          </Fill>
        </Layer>
      ))}

      {/* Gift sparkles */}
      {sparkPts.map(([ox, oy], j) => (
        <Layer key={ox} S={S} box={[gx + 22 + ox - 8, gy + oy - 8, 16, 16]}>
          <Fill
            className={cls('spark')}
            style={{ opacity: 0, animationDelay: `${j * 0.06}s` }}
          >
            <svg viewBox="-8 -8 16 16" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M0 -8 C0.8 -1.6 1.6 -0.8 8 0 C1.6 0.8 0.8 1.6 0 8 C-0.8 1.6 -1.6 0.8 -8 0 C-1.6 -0.8 -0.8 -1.6 0 -8 Z"
                fill="#fbe7a1"
              />
            </svg>
          </Fill>
        </Layer>
      ))}

      {/* Gold card */}
      <Layer S={S} box={cardBox}>
        <Fill className={cls('cardop')} style={{ opacity: 0 }}>
          <Fill className={cls('cardx')}>
            <Fill className={cls('cardy')}>
              <Fill className={cls('cardr')} origin="50% 50%">
                <Svg box={cardBox}>
                  <GoldCardArt transform={`translate(${rx - 24} ${ry - 22})`} />
                </Svg>
              </Fill>
            </Fill>
          </Fill>
        </Fill>
      </Layer>
    </div>
  );
}
TrackScene.propTypes = {
  S: PropTypes.object.isRequired,
  css: PropTypes.string.isRequired,
  paused: PropTypes.bool,
};

export function CartTrackScene({ className = '' }) {
  const rootRef = useRef(null);
  const [layoutKey, setLayoutKey] = useState('wide');
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.('(max-width: 640px)');
    if (!mq) return undefined;
    const apply = () => setLayoutKey(mq.matches ? 'compact' : 'wide');
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) =>
      setPaused(!entry.isIntersecting)
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const S = useMemo(() => buildScene(LAYOUTS[layoutKey]), [layoutKey]);
  const css = useMemo(() => buildCss(S), [S]);
  const names = S.items.map((it) => it.label).join(', ');

  return (
    <div
      ref={rootRef}
      className={`${styles.stage} ${className}`.trim()}
      role="img"
      aria-label={`A chrome Cart Commerce cart glides along a gold track, collecting ${names}, then pays with a gold card tap and receives a gift box.`}
    >
      <TrackScene S={S} css={css} paused={paused} />
    </div>
  );
}

CartTrackScene.propTypes = {
  className: PropTypes.string,
};
