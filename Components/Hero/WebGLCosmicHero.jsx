import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { CART_MESH, CART_OUTLINE, CART_RODS, CART_WHEELS } from './ChromeCart';
import { P, poly } from './heroArt';
import styles from './WebGLCosmicHero.module.css';

/**
 * Gold Dust: a few thousand GPU-drawn gold particles that assemble the
 * Cart Commerce cart, then flow into an Air Jordan 1, a gift box and a
 * personalised storybook from the Studio, and back.
 *
 * Target shapes are sampled on the client from the same vector paths the
 * rest of the hero draws. Positions blend on the GPU, so each frame only
 * updates a handful of uniforms. The loop stops while the canvas is off
 * screen, and the context is released on unmount.
 */

const circlePath = ([cx, cy], r) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;

const giftPaths = () => {
  const w = 60;
  const d = 40;
  const h = 44;
  const lid = 10;
  const box = [
    poly([P(0, 0, 0), P(w, 0, 0), P(w, -h, 0), P(0, -h, 0)]),
    poly([P(w, 0, 0), P(w, 0, d), P(w, -h, d), P(w, -h, 0)]),
    poly([
      P(-3, -h - lid, -2),
      P(w + 3, -h - lid, -2),
      P(w + 3, -h - lid, d + 2),
      P(-3, -h - lid, d + 2),
    ]),
    poly([
      P(-3, -h, -2),
      P(w + 3, -h, -2),
      P(w + 3, -h - lid, -2),
      P(-3, -h - lid, -2),
    ]),
    `M${P(w / 2, 0, 0).join(' ')}L${P(w / 2, -h - lid, -2).join(' ')}L${P(w / 2, -h - lid, d + 2).join(' ')}`,
    `M${P(w, 0, d / 2).join(' ')}L${P(w + 3, -h - lid, d / 2).join(' ')}L${P(-3, -h - lid, d / 2).join(' ')}`,
  ];
  const [bx, by] = P(w / 2, -h - lid, d / 2);
  box.push(
    `M${bx} ${by}c-10 -18 -28 -16 -24 -5c2.4 7 13 7 24 5zM${bx} ${by}c10 -18 28 -16 24 -5c-2.4 7 -13 7 -24 5zM${bx - 2} ${by + 2}l-9 14M${bx + 2} ${by + 2}l9 14`
  );
  return box;
};

const SHAPES = [
  {
    id: 'cart',
    label: 'Your cart',
    paths: () => [
      { d: CART_OUTLINE, w: 3 },
      { d: CART_MESH, w: 0.75 },
      ...CART_WHEELS.map((c) => ({ d: circlePath(c, 9.5), w: 3 })),
      ...CART_WHEELS.map((c) => ({ d: circlePath(c, 4), w: 2 })),
    ],
  },
  {
    id: 'sneaker',
    label: "Air Jordan 1 'Lost & Found'",
    paths: () => [
      'M-45.5 -15 C-49 -28 -48 -42 -43 -52 C-41 -55.5 -36 -56.5 -30 -55.5 L-16 -52.5 L-12.5 -59 L-3.5 -58 C-2 -50 2 -42 8 -36.5 C18 -30.5 32 -26.5 42 -22.5 C48 -20.5 50.5 -17.5 47 -15 Z',
      'M-47 -8 Q-48 0 -40 0 L41 0 Q50 0 50 -7 L50 -9 L-47 -9 Z',
      'M-35 -21.5 C-21 -29.5 0 -38 23 -40.5 C6 -34 -9 -26.5 -19 -20.5 C-25.5 -17 -33.5 -16.5 -35 -21.5 Z',
      'M-12 -15 C-7 -19.4 1 -21.2 9 -21.4 C15 -21.6 21 -22.6 26 -24.6',
      'M-45.6 -42 C-38 -40.5 -31 -34 -28.6 -26 C-27.6 -21 -26.6 -17.6 -24 -15',
      'M-43 -52 C-41 -45.6 -36 -41.2 -30 -40.5 C-24 -42 -19.6 -46 -16 -52.5',
      'M-12.4 -50 L-6.4 -51.4M-9.8 -45.4 L-3.6 -47M-6.6 -41 L-0.6 -42.8M-3 -36.8 L2.6 -38.8',
    ],
  },
  {
    id: 'gift',
    label: 'Gift wrapped',
    paths: giftPaths,
  },
  {
    id: 'storybook',
    label: 'Your storybook, starring your cast',
    paths: () => [
      'M0 0 C-20 -9 -48 -9 -72 -2 L-72 -64 C-48 -71 -20 -71 0 -62 Z',
      'M0 0 C20 -9 48 -9 72 -2 L72 -64 C48 -71 20 -71 0 -62 Z',
      'M-62 -52 C-46 -56 -26 -56 -10 -50M-62 -42 C-46 -46 -26 -46 -10 -40M-62 -32 C-46 -36 -30 -36 -18 -31',
      circlePath([30, -34], 9),
      circlePath([50, -30], 7),
      'M18 -12 C28 -20 54 -20 62 -12',
      'M40 -70 l2.4 -6 2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 z',
    ],
  },
];

const HOLD = 3.4;
const MORPH = 1.9;

function samplePaths(paths, count, rand) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;visibility:hidden';
  document.body.appendChild(svg);
  const list = paths.map((p) => (typeof p === 'string' ? { d: p, w: 1 } : p));
  const els = list.map(({ d }) => {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', d);
    svg.appendChild(el);
    return el;
  });
  const lengths = els.map((el) => el.getTotalLength());
  const weighted = lengths.map((l, i) => l * list[i].w);
  const total = weighted.reduce((a, b) => a + b, 0);
  const pts = [];
  els.forEach((el, i) => {
    const n = Math.max(2, Math.round((weighted[i] / total) * count));
    for (let k = 0; k < n && pts.length < count; k += 1) {
      const p = el.getPointAtLength(((k + rand()) / n) * lengths[i]);
      pts.push([p.x + (rand() - 0.5) * 1.4, p.y + (rand() - 0.5) * 1.4]);
    }
  });
  svg.remove();
  while (pts.length < count) pts.push(pts[Math.floor(rand() * pts.length)]);
  // Fit into a 1.9 × 1.45 box, centred slightly above the middle.
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const scale = Math.min(1.9 / (maxX - minX), 1.45 / (maxY - minY));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return pts.map(([x, y]) => [(x - cx) * scale, -(y - cy) * scale + 0.08]);
}

const VS = `
attribute vec2 aA;
attribute vec2 aB;
attribute vec4 aSeed;
uniform float uMix;
uniform float uTime;
uniform vec2 uScale;
uniform vec2 uMouse;
uniform float uPoint;
varying float vAlpha;
varying vec3 vColor;
void main() {
  float t = clamp((uMix - aSeed.x * 0.45) / 0.55, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec2 p = mix(aA, aB, t);
  float ang = aSeed.y * 6.28318;
  p += vec2(cos(ang), sin(ang)) * sin(3.14159 * t) * (0.16 + 0.3 * aSeed.z);
  p += vec2(sin(uTime * 0.9 + aSeed.y * 20.0), cos(uTime * 0.7 + aSeed.x * 17.0)) * 0.006;
  vec2 d = p - uMouse;
  p += normalize(d + 0.0001) * 0.14 * exp(-dot(d, d) * 26.0);
  gl_Position = vec4(p * uScale, 0.0, 1.0);
  float tw = 0.6 + 0.4 * sin(uTime * 2.4 + aSeed.y * 40.0);
  gl_PointSize = (1.9 + aSeed.z * 3.6) * uPoint * (0.8 + 0.35 * tw);
  vAlpha = tw;
  vColor = mix(vec3(1.0, 0.74, 0.24), vec3(1.0, 0.96, 0.84), aSeed.w * aSeed.w);
}`;

const FS = `
precision mediump float;
varying float vAlpha;
varying vec3 vColor;
void main() {
  float r = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, r);
  a = (a * a * 0.55 + pow(a, 6.0) * 0.9) * vAlpha;
  gl_FragColor = vec4(vColor * a, a);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

// Deterministic PRNG so every visit forms the same dust.
const mulberry = (seed) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

function FallbackCart() {
  return (
    <svg
      className={styles.fallback}
      viewBox="-50 -30 260 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d={CART_RODS}
        stroke="#f0c75e"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="0.1 4.2"
        fill="none"
      />
      {CART_WHEELS.map((c) => (
        <path
          key={c.join()}
          d={circlePath(c, 9.5)}
          stroke="#f6dd8a"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="0.1 3.6"
          fill="none"
        />
      ))}
    </svg>
  );
}

export function WebGLCosmicHero({ className }) {
  const wrapRef = useRef(null);
  const hostRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [label, setLabel] = useState(SHAPES[0].label);

  useEffect(() => {
    const wrap = wrapRef.current;
    const host = hostRef.current;
    if (!wrap || !host) return undefined;
    // The canvas is created per effect run so a released context is never
    // reused (React re-runs effects on the same DOM in development).
    const canvas = document.createElement('canvas');
    canvas.className = styles.canvas;
    host.appendChild(canvas);

    let gl = null;
    try {
      gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
      });
    } catch {
      gl = null;
    }
    if (!gl) {
      canvas.remove();
      setWebglSupported(false);
      return undefined;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VS);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FS);
    const program = gl.createProgram();
    if (vs && fs) {
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
    }
    if (!vs || !fs || !gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
      setWebglSupported(false);
      return undefined;
    }
    gl.useProgram(program);

    const reduced = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    )?.matches;
    const count = wrap.clientWidth < 520 ? 2000 : 3200;
    const rand = mulberry(7);
    const dustShare = 0.07;
    const shapeCount = Math.round(count * (1 - dustShare));
    const scatter = () =>
      Array.from({ length: count - shapeCount }, () => [
        (rand() - 0.5) * 3.2,
        (rand() - 0.5) * 2.2,
      ]);

    // Shape buffers: index 0 is loose dust, then each target shape.
    const clouds = [
      Array.from({ length: count }, () => [
        (rand() - 0.5) * 3.2,
        (rand() - 0.5) * 2.4,
      ]),
      ...SHAPES.map((s) => [
        ...samplePaths(s.paths(), shapeCount, rand),
        ...scatter(),
      ]),
    ];
    const buffers = clouds.map((pts) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(pts.flat()),
        gl.STATIC_DRAW
      );
      return buf;
    });
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count; i += 1) {
      seeds[i * 4] = rand();
      seeds[i * 4 + 1] = rand();
      seeds[i * 4 + 2] = rand() ** 2;
      seeds[i * 4 + 3] = rand();
    }
    const seedBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);

    const loc = {
      a: gl.getAttribLocation(program, 'aA'),
      b: gl.getAttribLocation(program, 'aB'),
      seed: gl.getAttribLocation(program, 'aSeed'),
      mix: gl.getUniformLocation(program, 'uMix'),
      time: gl.getUniformLocation(program, 'uTime'),
      scale: gl.getUniformLocation(program, 'uScale'),
      mouse: gl.getUniformLocation(program, 'uMouse'),
      point: gl.getUniformLocation(program, 'uPoint'),
    };
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuf);
    gl.enableVertexAttribArray(loc.seed);
    gl.vertexAttribPointer(loc.seed, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(loc.a);
    gl.enableVertexAttribArray(loc.b);

    const bindPair = (from, to) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[from]);
      gl.vertexAttribPointer(loc.a, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers[to]);
      gl.vertexAttribPointer(loc.b, 2, gl.FLOAT, false, 0, 0);
    };

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    const mouse = { x: 10, y: 10 };
    const size = { w: 1, h: 1, dpr: 1 };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      size.w = w;
      size.h = h;
      size.dpr = dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    let lastPair = '';
    let lastLabel = SHAPES[0].label;
    const draw = (time) => {
      // Timeline: dust → cart, then hold / morph through the shapes forever.
      let from = 0;
      let to = 1;
      let mixV = 1;
      if (time < MORPH) {
        mixV = time / MORPH;
      } else {
        const cycle = HOLD + MORPH;
        const tt = time - MORPH;
        const k = Math.floor(tt / cycle);
        const local = tt - k * cycle;
        from = 1 + (k % SHAPES.length);
        to = 1 + ((k + 1) % SHAPES.length);
        mixV = local < HOLD ? 0 : (local - HOLD) / MORPH;
      }
      const pair = `${from}-${to}`;
      if (pair !== lastPair) {
        bindPair(from, to);
        lastPair = pair;
      }
      const shown = mixV < 0.55 ? from : to;
      const nextLabel = SHAPES[Math.max(0, shown - 1)].label;
      if (nextLabel !== lastLabel) {
        lastLabel = nextLabel;
        setLabel(nextLabel);
      }

      const aspect = size.w / size.h;
      const fit = Math.min(1, aspect / 1.45) * 0.92;
      gl.uniform2f(loc.scale, fit / aspect, fit);
      gl.uniform1f(loc.mix, mixV);
      gl.uniform1f(loc.time, time);
      gl.uniform2f(loc.mouse, mouse.x, mouse.y);
      gl.uniform1f(loc.point, size.dpr * Math.max(0.8, size.h / 340));
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.POINTS, 0, count);
    };

    let raf = 0;
    let running = false;
    let elapsed = 0;
    let last = 0;
    const loop = (now) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      elapsed += dt;
      draw(elapsed);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    if (reduced) {
      bindPair(1, 1);
      lastPair = '1-1';
      draw(MORPH);
    }

    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(([entry]) =>
            entry.isIntersecting ? start() : stop()
          )
        : null;
    if (io) io.observe(canvas);
    else start();

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            resize();
            if (!running) draw(reduced ? MORPH : elapsed);
          })
        : null;
    ro?.observe(canvas);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const aspect = size.w / size.h;
      const fit = Math.min(1, aspect / 1.45) * 0.92;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.x = nx / (fit / aspect);
      mouse.y = ny / fit;
    };
    const onLeave = () => {
      mouse.x = 10;
      mouse.y = 10;
    };
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);

    // A GPU reset or a tab the browser reclaimed: drawing would silently do
    // nothing and leave an empty stage, so show the drawn cart instead.
    const onLost = (event) => {
      event.preventDefault();
      stop();
      io?.disconnect();
      ro?.disconnect();
      canvas.remove();
      setWebglSupported(false);
    };
    canvas.addEventListener('webglcontextlost', onLost);

    return () => {
      canvas.removeEventListener('webglcontextlost', onLost);
      stop();
      io?.disconnect();
      ro?.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
      buffers.forEach((b) => gl.deleteBuffer(b));
      gl.deleteBuffer(seedBuf);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`${styles.stage} ${className || ''}`.trim()}
      role="img"
      aria-label="Gold dust particles forming a shopping cart, an Air Jordan 1 sneaker, a gift box and a personalised storybook"
    >
      <div className={styles.glow} />
      <div className={styles.floor} />
      {webglSupported ? (
        <div ref={hostRef} className={styles.canvasHost} />
      ) : (
        <FallbackCart />
      )}
      <div className={styles.hud} aria-hidden="true">
        <span className={styles.eyebrow}>Gold Dust · WebGL</span>
        <span className={styles.label} key={label}>
          {webglSupported ? label : SHAPES[0].label}
        </span>
      </div>
    </div>
  );
}

WebGLCosmicHero.propTypes = {
  className: PropTypes.string,
};
