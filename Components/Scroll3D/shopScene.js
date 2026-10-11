/**
 * The storefront story, scrubbed by scroll:
 *   0  a chrome cart on a lit stage
 *   1  the products rise from their pedestals: sneaker, headphones, guitar,
 *      a holo trading card and a kettlebell
 *   2  one by one they arc into the cart
 *   3  a gold card taps to pay, a check draws, the haul becomes a gift box
 *   4  the box lands centre stage, ready to ship
 * Every model is built here from primitives, so the hero has no image or
 * network dependencies and no CORS to worry about.
 */

import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const ease = (t) => 1 - (1 - t) ** 3;
const span = (p, a, b) => clamp01((p - a) / (b - a));
const TAU = Math.PI * 2;

const C = {
  night: '#0f2744',
  sapphire: '#1e3a5f',
  gold: '#d9a62e',
  goldLight: '#f3d27a',
  chrome: '#dfe3ea',
  cherry: '#8e1b22',
  ink: '#101826',
};

export async function loadShopScene({ THREE, renderer, mobile }) {
  const scene = new THREE.Scene();
  const bg = new THREE.Color(C.night);
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, 7, 16);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  scene.environmentIntensity = 0.9;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);

  /* ------------------------------------------------------------ lights -- */
  scene.add(new THREE.HemisphereLight('#c9dbff', '#1a2235', 0.9));
  const key = new THREE.SpotLight('#fff3dc', 60, 14, 0.62, 0.55, 1.4);
  key.position.set(-2.6, 5.4, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  key.shadow.bias = -0.0004;
  key.shadow.radius = 5;
  scene.add(key, key.target);
  const rim = new THREE.PointLight('#5b8fff', 18, 10);
  rim.position.set(3, 2.2, -2.6);
  scene.add(rim);
  const warm = new THREE.PointLight('#ffb347', 10, 8);
  warm.position.set(-2.4, 1.2, -1.8);
  scene.add(warm);

  /* --------------------------------------------------------- materials -- */
  const mats = [];
  const mat = (m) => (mats.push(m), m);
  const chrome = mat(
    new THREE.MeshStandardMaterial({
      color: C.chrome,
      metalness: 1,
      roughness: 0.2,
    })
  );
  const gold = mat(
    new THREE.MeshStandardMaterial({
      color: C.gold,
      metalness: 1,
      roughness: 0.28,
    })
  );
  const rubber = mat(
    new THREE.MeshStandardMaterial({ color: '#16181d', roughness: 0.85 })
  );
  const stageMat = mat(
    new THREE.MeshStandardMaterial({
      color: '#13243d',
      metalness: 0.35,
      roughness: 0.32,
    })
  );
  const pedestalMat = mat(
    new THREE.MeshStandardMaterial({
      color: '#1b3354',
      metalness: 0.2,
      roughness: 0.4,
    })
  );
  const glow = mat(
    new THREE.MeshBasicMaterial({ color: C.goldLight, toneMapped: false })
  );

  const geos = [];
  const keep = (g) => (geos.push(g), g);
  const texs = [];

  /** A thin rod between two points: the wire of the cart. */
  const rod = (a, b, r = 0.012) => {
    const dir = new THREE.Vector3().subVectors(b, a);
    const g = new THREE.CylinderGeometry(r, r, dir.length(), 8, 1);
    g.translate(0, dir.length() / 2, 0);
    g.applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir.normalize()
      )
    );
    g.translate(a.x, a.y, a.z);
    return g;
  };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const shadowed = (m) => {
    m.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return m;
  };

  /* ------------------------------------------------------------- stage -- */
  const stage = new THREE.Group();
  scene.add(stage);
  const floor = new THREE.Mesh(
    keep(new THREE.CircleGeometry(30, 64)),
    mat(new THREE.MeshStandardMaterial({ color: '#0c1d33', roughness: 0.9 }))
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  stage.add(floor);
  const disc = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(2.6, 2.7, 0.12, 96)),
    stageMat
  );
  disc.position.y = 0.06;
  disc.receiveShadow = true;
  stage.add(disc);
  const ring = new THREE.Mesh(
    keep(new THREE.TorusGeometry(2.62, 0.012, 8, 160)),
    glow
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.125;
  stage.add(ring);
  const TOP = 0.12;

  /* -------------------------------------------------------------- cart -- */
  const buildCart = () => {
    const g = new THREE.Group();
    const L = 1.1,
      W = 0.66,
      H = 0.5,
      base = 0.42;
    const parts = [];
    // Basket: the floor is a little shorter than the rim, like a real cart.
    const rimY = base + H;
    const rimC = [
      V(-L / 2, rimY, -W / 2),
      V(L / 2, rimY, -W / 2),
      V(L / 2, rimY, W / 2),
      V(-L / 2, rimY, W / 2),
    ];
    const floorC = [
      V(-L / 2 + 0.12, base, -W / 2 + 0.04),
      V(L / 2 - 0.02, base, -W / 2 + 0.04),
      V(L / 2 - 0.02, base, W / 2 - 0.04),
      V(-L / 2 + 0.12, base, W / 2 - 0.04),
    ];
    for (let i = 0; i < 4; i += 1) {
      parts.push(
        rod(rimC[i], rimC[(i + 1) % 4], 0.016),
        rod(floorC[i], floorC[(i + 1) % 4]),
        rod(floorC[i], rimC[i])
      );
    }
    // Wires along the long sides and the ends, and two rails around.
    const n = 12;
    for (let i = 1; i < n; i += 1) {
      const t = i / n;
      [0, 3].forEach((side) => {
        const a = floorC[side].clone().lerp(floorC[side === 0 ? 1 : 2], t);
        const b = rimC[side].clone().lerp(rimC[side === 0 ? 1 : 2], t);
        parts.push(rod(a, b, 0.008));
      });
      const a = floorC[0].clone().lerp(floorC[3], t / 1.2 + 0.08);
      const b = floorC[1].clone().lerp(floorC[2], t / 1.2 + 0.08);
      if (i < n - 1) parts.push(rod(a, b, 0.006));
    }
    for (let i = 1; i < 6; i += 1) {
      const t = i / 6;
      [
        [0, 3],
        [1, 2],
      ].forEach(([p, q]) =>
        parts.push(
          rod(
            floorC[p].clone().lerp(floorC[q], t),
            rimC[p].clone().lerp(rimC[q], t),
            0.008
          )
        )
      );
    }
    [0.33, 0.66].forEach((t) => {
      const ring = rimC.map((r, i) => floorC[i].clone().lerp(r, t));
      for (let i = 0; i < 4; i += 1)
        parts.push(rod(ring[i], ring[(i + 1) % 4], 0.009));
    });
    // Chassis and handle.
    const legs = [
      V(-L / 2 + 0.14, 0.08, -W / 2 + 0.08),
      V(L / 2 - 0.06, 0.08, -W / 2 + 0.08),
      V(L / 2 - 0.06, 0.08, W / 2 - 0.08),
      V(-L / 2 + 0.14, 0.08, W / 2 - 0.08),
    ];
    legs.forEach((p, i) => parts.push(rod(p, floorC[i], 0.018)));
    parts.push(
      rod(legs[0], legs[1], 0.016),
      rod(legs[3], legs[2], 0.016),
      rod(legs[0], legs[3], 0.016)
    );
    const handleA = V(-L / 2 - 0.16, rimY + 0.16, -W / 2 + 0.02);
    const handleB = V(-L / 2 - 0.16, rimY + 0.16, W / 2 - 0.02);
    parts.push(rod(rimC[0], handleA, 0.016), rod(rimC[3], handleB, 0.016));
    const wire = new THREE.Mesh(keep(mergeGeometries(parts)), chrome);
    parts.forEach((p) => p.dispose());
    g.add(wire);
    const grip = new THREE.Mesh(keep(rod(handleA, handleB, 0.034)), gold);
    g.add(grip);
    // Wheels.
    const wheelGeo = keep(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 24));
    wheelGeo.rotateX(Math.PI / 2);
    const hubGeo = keep(new THREE.CylinderGeometry(0.03, 0.03, 0.056, 16));
    hubGeo.rotateX(Math.PI / 2);
    const wheels = legs.map((p) => {
      const w = new THREE.Group();
      w.add(new THREE.Mesh(wheelGeo, rubber), new THREE.Mesh(hubGeo, chrome));
      w.position.set(p.x, 0.075, p.z);
      g.add(w);
      return w;
    });
    // A gold plate on the front, for the brand.
    const plate = new THREE.Mesh(
      keep(new THREE.BoxGeometry(0.02, 0.12, 0.36)),
      gold
    );
    plate.position.set(L / 2 + 0.005, base + H * 0.55, 0);
    g.add(plate);
    g.userData = {
      wheels,
      // Where item `i` of `count` rides in the basket; writes into `out`.
      inside: (i, count, out) =>
        out.set(
          lerp(-L / 2 + 0.26, L / 2 - 0.18, count > 1 ? i / (count - 1) : 0.5),
          base + 0.14 + (i % 2) * 0.05,
          i % 2 ? 0.12 : -0.12
        ),
    };
    return shadowed(g);
  };

  /* ---------------------------------------------------------- products -- */
  /** A smooth 1D profile through `[a, value]` keys, tabulated once at build time. */
  const profile = (keys) => {
    const pts = new THREE.CatmullRomCurve3(
      keys.map(([a, v]) => V(a, v, 0)),
      false,
      'centripetal'
    ).getPoints(400);
    const table = new Float32Array(257);
    let j = 1;
    for (let i = 0; i <= 256; i += 1) {
      const a = i / 256;
      while (j < pts.length - 1 && pts[j].x < a) j += 1;
      const p0 = pts[j - 1];
      const p1 = pts[j];
      table[i] = lerp(p0.y, p1.y, clamp01((a - p0.x) / (p1.x - p0.x || 1)));
    }
    return (a) => {
      const f = clamp01(a) * 256;
      const i = Math.min(255, Math.floor(f));
      return lerp(table[i], table[i + 1], f - i);
    };
  };

  /**
   * An indexed grid over a parametric surface `at(u, v, out)`. Normals come
   * from the surface's own derivatives, so seams between patches stay smooth.
   */
  const grid = (nu, nv, at, flip = false) => {
    const pos = [];
    const nor = [];
    const uv = [];
    const idx = [];
    const p = V(0, 0, 0);
    const du = V(0, 0, 0);
    const dv = V(0, 0, 0);
    const q = V(0, 0, 0);
    const e = 1e-3;
    for (let j = 0; j <= nv; j += 1) {
      for (let i = 0; i <= nu; i += 1) {
        const u = i / nu;
        const v = j / nv;
        at(u, v, p);
        at(Math.min(1, u + e), v, du).sub(at(Math.max(0, u - e), v, q));
        at(u, Math.min(1, v + e), dv).sub(at(u, Math.max(0, v - e), q));
        q.crossVectors(du, dv).normalize();
        if (flip) q.negate();
        pos.push(p.x, p.y, p.z);
        nor.push(q.x, q.y, q.z);
        uv.push(u, v);
      }
    }
    for (let j = 0; j < nv; j += 1) {
      for (let i = 0; i < nu; i += 1) {
        const a = j * (nu + 1) + i;
        const b = a + 1;
        const c = a + nu + 1;
        const d = c + 1;
        if (flip) idx.push(a, c, b, b, c, d);
        else idx.push(a, b, c, b, d, c);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    return geo;
  };

  /** Herringbone and pivot circles, for the outsole's bump map. */
  const treadTexture = () => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 192;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(0, 0, 512, 192);
    ctx.strokeStyle = '#303030';
    ctx.lineWidth = 3;
    for (let x = -64; x < 560; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x - 40, 96);
      ctx.lineTo(x, 192);
      ctx.stroke();
    }
    [
      [392, 96, 50],
      [92, 96, 38],
    ].forEach(([cx, cy, r]) => {
      ctx.fillStyle = '#a0a0a0';
      ctx.beginPath();
      ctx.arc(cx, cy, r + 5, 0, TAU);
      ctx.fill();
      for (let k = r; k > 4; k -= 9) {
        ctx.beginPath();
        ctx.arc(cx, cy, k, 0, TAU);
        ctx.stroke();
      }
    });
    return new THREE.CanvasTexture(c);
  };

  /**
   * A high-top basketball sneaker in white, varsity red and black leather.
   * The upper is a lasted shell: cross-sections swept heel to toe, closed over
   * the toe box and open at the collar, with overlays laid on its surface.
   * The toe points along +x; the sole sits on y = 0.
   */
  const buildSneaker = () => {
    const g = new THREE.Group();
    const leather = (color, roughness) =>
      mat(
        new THREE.MeshPhysicalMaterial({
          color,
          roughness,
          clearcoat: 0.35,
          clearcoatRoughness: 0.4,
        })
      );
    const white = leather('#f3f0e9', 0.5);
    const red = leather('#b3121e', 0.42);
    const black = leather('#17181c', 0.4);
    const lining = mat(
      new THREE.MeshStandardMaterial({
        color: '#25272d',
        roughness: 0.95,
        side: THREE.BackSide,
      })
    );
    const insoleMat = mat(
      new THREE.MeshStandardMaterial({ color: '#2b2d33', roughness: 0.95 })
    );
    const nylon = mat(
      new THREE.MeshStandardMaterial({ color: '#f1efe8', roughness: 0.72 })
    );
    const sail = mat(
      new THREE.MeshStandardMaterial({ color: '#ede4cf', roughness: 0.62 })
    );
    const tread = treadTexture();
    texs.push(tread);
    const outsole = mat(
      new THREE.MeshStandardMaterial({
        color: '#9c1620',
        roughness: 0.9,
        bumpMap: tread,
        bumpScale: 1.5,
      })
    );
    const eyeletMat = mat(
      new THREE.MeshStandardMaterial({
        color: '#2c2d33',
        metalness: 0.6,
        roughness: 0.35,
      })
    );
    const add = (geo, m) => {
      const mesh = new THREE.Mesh(keep(geo), m);
      g.add(mesh);
      return mesh;
    };

    // The last: footprint half-width, topline height and collar opening, heel (0) to toe (1).
    const X0 = -0.5;
    const X1 = 0.52;
    const BASE = 0.062;
    const halfW = profile([
      [0, 0.112],
      [0.25, 0.118],
      [0.5, 0.13],
      [0.7, 0.156],
      [0.86, 0.158],
      [1, 0.14],
    ]);
    const topY = profile([
      [0, 0.54],
      [0.14, 0.53],
      [0.28, 0.536],
      [0.42, 0.568],
      [0.5, 0.48],
      [0.58, 0.39],
      [0.66, 0.315],
      [0.74, 0.27],
      [0.84, 0.238],
      [0.92, 0.212],
      [0.97, 0.17],
      [1, 0.1],
    ]);
    const gap = profile([
      [0, 0],
      [0.04, 0],
      [0.08, 0.04],
      [0.13, 0.066],
      [0.22, 0.08],
      [0.3, 0.078],
      [0.39, 0.058],
      [0.46, 0.042],
      [0.56, 0.036],
      [0.63, 0.024],
      [0.67, 0],
      [1, 0],
    ]);
    const endRound = (a) => {
      const h = clamp01(a / 0.12);
      const t = clamp01((1 - a) / 0.17);
      return Math.sqrt(1 - (1 - h) ** 2) * Math.sqrt(1 - (1 - t) ** 2);
    };
    // Toe spring and a slight heel rocker, shared by every part.
    const spring = (x) =>
      0.07 * smooth(span(x, 0.12, 0.58)) ** 1.5 +
      0.022 * smooth(span(x, -0.34, -0.56)) ** 2;
    const cosSpace = (u) => (1 - Math.cos(Math.PI * u)) / 2;

    /** A point on the upper: `v` runs from the sole (0) up to the topline (1). */
    const upperAt = (a, v, side, out) => {
      const th = (clamp01(v) * Math.PI) / 2;
      const f = Math.sin(th);
      const heel = 1 - smooth(span(a, 0, 0.3));
      // The heel narrows toward the Achilles; the forefoot stays full.
      const hw =
        halfW(a) *
        endRound(a) *
        (1 - 0.16 * f * f * (1 - smooth(span(a, 0.05, 0.45))));
      const gp = Math.min(Math.max(0, gap(a)), hw * 0.8);
      const p = lerp(0.45, 0.9, smooth(span(a, 0.45, 0.82)));
      const x =
        lerp(X0, X1, a) +
        heel * (0.045 * f ** 3 - 0.028 * Math.sin(Math.PI * f));
      return out.set(
        x,
        lerp(BASE, topY(a), f) + spring(x),
        side * (gp + (hw - gp) * Math.max(0, Math.cos(th)) ** p)
      );
    };
    const nA = V(0, 0, 0);
    const nB = V(0, 0, 0);
    const nC = V(0, 0, 0);
    const upperNormal = (a, v, side, out) => {
      upperAt(Math.min(1, a + 1e-3), v, side, out).sub(
        upperAt(Math.max(0, a - 1e-3), v, side, nA)
      );
      upperAt(a, Math.min(1, v + 1e-3), side, nB).sub(
        upperAt(a, Math.max(0, v - 1e-3), side, nC)
      );
      return out.cross(nB).normalize().multiplyScalar(side);
    };

    // Shell: white leather outside, dark lining seen through the collar.
    [-1, 1].forEach((side) => {
      const shell = keep(
        grid(64, 16, (u, v, o) => upperAt(cosSpace(u), v, side, o), side < 0)
      );
      g.add(new THREE.Mesh(shell, white), new THREE.Mesh(shell, lining));
    });

    // Overlays sit just proud of the shell, each following its curvature.
    const nP = V(0, 0, 0);
    const panel = (side, a0, a1, lo, hi, lift, m, nu = 28, nv = 8) =>
      add(
        grid(
          nu,
          nv,
          (u, v, o) => {
            const a = lerp(a0, a1, u);
            const vv = clamp01(lerp(lo(a), hi(a), v));
            upperAt(a, vv, side, o);
            return o.addScaledVector(upperNormal(a, vv, side, nP), lift);
          },
          side < 0
        ),
        m
      );
    [-1, 1].forEach((side) => {
      // Swoosh-like sweep: a straight top edge from a fine tail at the heel,
      // a deep belly, and a head that hooks up over the toe overlay.
      const sweepTop = (u) =>
        lerp(0.52, 0.44, u) - 0.04 * Math.sin(Math.PI * u);
      panel(
        side,
        0.22,
        0.64,
        (a) => {
          const u = span(a, 0.22, 0.64);
          return (
            sweepTop(u) - 0.48 * u ** 1.3 * Math.sqrt(Math.max(0, 1 - u ** 5))
          );
        },
        (a) => sweepTop(span(a, 0.22, 0.64)),
        0.012,
        black,
        44,
        8
      );
      // Ankle collar, dipping lower over the ankle bone.
      panel(
        side,
        0,
        0.46,
        (a) => 0.68 - 0.09 * Math.sin(Math.PI * span(a, 0.03, 0.46)),
        () => 1,
        0.004,
        black,
        30,
        6
      );
      // Toe overlay: wraps the toe and sweeps back to meet the eyestay.
      panel(
        side,
        0.53,
        1,
        () => 0,
        (a) =>
          span(a, 0.53, 0.66) ** 0.7 -
          0.5 * smooth(span(a, 0.66, 0.8)) +
          0.12 * smooth(span(a, 0.88, 1)),
        0.008,
        red,
        32,
        10
      );
      // Heel counter, a rounded cup.
      panel(
        side,
        0,
        0.34,
        () => 0,
        (a) => 0.66 * Math.sqrt(Math.max(0, 1 - span(a, 0, 0.34) ** 2)),
        0.008,
        red,
        24,
        10
      );
      // Eyestay, running up the lacing to the collar.
      panel(
        side,
        0.4,
        0.665,
        () => 0.8,
        () => 1,
        0.011,
        red,
        24,
        3
      );
    });

    // Padded collar around the ankle opening.
    const rim = [];
    for (let k = 0; k <= 22; k += 1)
      rim.push(upperAt(lerp(0.45, 0.04, k / 22), 1, 1, V(0, 0, 0)));
    for (let k = 1; k <= 22; k += 1)
      rim.push(upperAt(lerp(0.04, 0.45, k / 22), 1, -1, V(0, 0, 0)));
    add(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rim), 96, 0.024, 8),
      black
    );

    // Tongue: a padded nylon strip that follows the lacing and stands above the collar.
    const tongueLine = new THREE.CatmullRomCurve3([
      ...[0.7, 0.6, 0.5, 0.42].map((a) =>
        V(lerp(X0, X1, a), topY(a) - 0.004, 0)
      ),
      V(-0.12, 0.635, 0),
    ]);
    const tongue = new THREE.BoxGeometry(1, 1, 1, 6, 20, 1);
    const tp = tongue.attributes.position;
    const cP = V(0, 0, 0);
    const cT = V(0, 0, 0);
    for (let i = 0; i < tp.count; i += 1) {
      const s = tp.getY(i) + 0.5;
      const w = tp.getX(i) * 2;
      const d = tp.getZ(i) + 0.5;
      tongueLine.getPointAt(s, cP);
      tongueLine.getTangentAt(s, cT);
      const hw =
        0.068 *
        (s > 0.8 ? 0.4 + 0.6 * Math.sqrt(1 - ((s - 0.8) / 0.2) ** 2) : 1);
      const thick = lerp(0.012, 0.034, smooth(span(s, 0.4, 0.9)));
      const n = d * thick - 0.03 * w * w - 0.01;
      const x = cP.x + cT.y * n;
      tp.setXYZ(i, x, cP.y - cT.x * n + spring(x), w * hw);
    }
    tongue.computeVertexNormals();
    add(tongue, nylon);
    // A red tag at the top of the tongue.
    tongueLine.getPointAt(0.84, cP);
    tongueLine.getTangentAt(0.84, cT);
    const tagN = V(cT.y, -cT.x, 0);
    const tag = new THREE.BoxGeometry(0.07, 0.05, 0.006);
    tag.applyMatrix4(
      new THREE.Matrix4()
        .makeBasis(V(0, 0, -1), cT, tagN)
        .setPosition(cP.addScaledVector(tagN, 0.028))
    );
    add(tag, red);

    // Eyelets and criss-cross laces.
    const ROWS = 7;
    const eyelet = (k, side) => {
      const a = lerp(0.44, 0.635, k / (ROWS - 1));
      const p = upperAt(a, 0.9, side, V(0, 0, 0));
      return p.addScaledVector(upperNormal(a, 0.9, side, nP), 0.013);
    };
    const eyeParts = [];
    const laceParts = [];
    const zAxis = V(0, 0, 1);
    const lift = V(0.55, 0.83, 0).normalize();
    for (let k = 0; k < ROWS; k += 1) {
      [-1, 1].forEach((side) => {
        const a = lerp(0.44, 0.635, k / (ROWS - 1));
        const ring = new THREE.TorusGeometry(0.015, 0.005, 4, 10);
        ring.applyQuaternion(
          new THREE.Quaternion().setFromUnitVectors(
            zAxis,
            upperNormal(a, 0.9, side, V(0, 0, 0))
          )
        );
        const at = eyelet(k, side);
        ring.translate(at.x, at.y, at.z);
        eyeParts.push(ring);
        if (k < ROWS - 1) {
          const from = eyelet(k, side);
          const to = eyelet(k + 1, -side);
          const mid = from
            .clone()
            .lerp(to, 0.5)
            .addScaledVector(lift, side > 0 ? 0.03 : 0.042);
          laceParts.push(
            new THREE.TubeGeometry(
              new THREE.QuadraticBezierCurve3(from, mid, to),
              8,
              0.011,
              5
            )
          );
        }
      });
    }
    const top0 = eyelet(0, 1);
    const top1 = eyelet(0, -1);
    laceParts.push(
      new THREE.TubeGeometry(
        new THREE.QuadraticBezierCurve3(
          top0,
          top0.clone().lerp(top1, 0.5).addScaledVector(lift, 0.035),
          top1
        ),
        8,
        0.011,
        5
      )
    );
    add(mergeGeometries(eyeParts), eyeletMat);
    add(mergeGeometries(laceParts), nylon);
    eyeParts.forEach((p) => p.dispose());
    laceParts.forEach((p) => p.dispose());

    // Sole unit: a sail cupsole over a slightly wider red rubber outsole.
    const slab = (x0, x1, grow, y0, y1) => (u, v, o) => {
      const a = cosSpace(u);
      const x = lerp(x0, x1, a);
      const hw = (halfW(a) + grow) * endRound(a);
      const phi = v * TAU;
      const c = Math.cos(phi);
      const s = Math.sin(phi);
      const top = typeof y1 === 'function' ? y1(a) : y1;
      return o.set(
        x,
        lerp(y0, top, 0.5 + 0.5 * Math.sign(s) * Math.abs(s) ** 0.28) +
          spring(x),
        hw * Math.sign(c) * Math.abs(c) ** 0.28
      );
    };
    add(
      grid(
        64,
        24,
        slab(-0.515, 0.535, 0.014, 0.01, (a) => lerp(0.104, 0.088, a))
      ),
      sail
    );
    const outsoleGeo = grid(64, 16, slab(-0.524, 0.544, 0.02, -0.022, 0.02));
    const op = outsoleGeo.attributes.position;
    const ouv = outsoleGeo.attributes.uv;
    for (let i = 0; i < op.count; i += 1)
      ouv.setXY(i, (op.getX(i) + 0.524) / 1.068, (op.getZ(i) + 0.2) / 0.4);
    add(outsoleGeo, outsole);
    // Insole, seen through the collar.
    add(
      grid(
        40,
        2,
        (u, v, o) => {
          const a = cosSpace(u);
          const x = lerp(X0, X1, a);
          return o.set(
            x,
            0.108 + spring(x),
            (v * 2 - 1) * halfW(a) * endRound(a) * 0.85
          );
        },
        true
      ),
      insoleMat
    );

    g.scale.setScalar(0.5);
    return shadowed(g);
  };

  const buildHeadphones = () => {
    const g = new THREE.Group();
    const black = mat(
      new THREE.MeshStandardMaterial({
        color: '#1b1d22',
        metalness: 0.3,
        roughness: 0.45,
      })
    );
    const band = new THREE.Mesh(
      keep(new THREE.TorusGeometry(0.26, 0.026, 12, 48, Math.PI)),
      black
    );
    band.position.y = 0.14;
    g.add(band);
    const bandTop = new THREE.Mesh(
      keep(new THREE.TorusGeometry(0.26, 0.012, 8, 48, Math.PI)),
      gold
    );
    bandTop.position.set(0, 0.14, 0.024);
    g.add(bandTop);
    [-1, 1].forEach((s) => {
      const cup = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.11, 0.11, 0.09, 32)),
        black
      );
      cup.rotation.z = Math.PI / 2;
      cup.position.set(s * 0.27, 0.12, 0);
      const cushion = new THREE.Mesh(
        keep(new THREE.TorusGeometry(0.085, 0.03, 12, 32)),
        mat(
          new THREE.MeshStandardMaterial({ color: '#2a2c33', roughness: 0.9 })
        )
      );
      cushion.rotation.y = Math.PI / 2;
      cushion.position.set(s * 0.23, 0.12, 0);
      const cap = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.06, 0.06, 0.095, 32)),
        gold
      );
      cap.rotation.z = Math.PI / 2;
      cap.position.set(s * 0.275, 0.12, 0);
      g.add(cup, cushion, cap);
    });
    return shadowed(g);
  };

  const buildGuitar = () => {
    const g = new THREE.Group();
    const body = new THREE.Shape();
    body.moveTo(0, -0.26);
    body.bezierCurveTo(0.22, -0.27, 0.26, -0.1, 0.2, 0.0);
    body.bezierCurveTo(0.17, 0.06, 0.24, 0.1, 0.22, 0.2);
    body.bezierCurveTo(0.2, 0.26, 0.12, 0.22, 0.06, 0.12);
    body.lineTo(-0.06, 0.12);
    body.bezierCurveTo(-0.12, 0.22, -0.2, 0.26, -0.22, 0.2);
    body.bezierCurveTo(-0.24, 0.1, -0.17, 0.06, -0.2, 0.0);
    body.bezierCurveTo(-0.26, -0.1, -0.22, -0.27, 0, -0.26);
    const bodyGeo = keep(
      new THREE.ExtrudeGeometry(body, {
        depth: 0.05,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.012,
        bevelSegments: 3,
        curveSegments: 24,
      })
    );
    bodyGeo.translate(0, 0, -0.025);
    g.add(
      new THREE.Mesh(
        bodyGeo,
        mat(
          new THREE.MeshPhysicalMaterial({
            color: C.cherry,
            roughness: 0.25,
            clearcoat: 1,
            clearcoatRoughness: 0.08,
          })
        )
      )
    );
    const neck = new THREE.Mesh(
      keep(new THREE.BoxGeometry(0.06, 0.62, 0.03)),
      mat(new THREE.MeshStandardMaterial({ color: '#3b2416', roughness: 0.6 }))
    );
    neck.position.set(0, 0.42, 0.012);
    g.add(neck);
    const head = new THREE.Mesh(
      keep(new THREE.BoxGeometry(0.1, 0.13, 0.03)),
      mat(new THREE.MeshStandardMaterial({ color: '#16110e', roughness: 0.4 }))
    );
    head.position.set(0, 0.78, 0.012);
    g.add(head);
    [-0.06, -0.02, 0.06].forEach((y) => {
      const pickup = new THREE.Mesh(
        keep(new THREE.BoxGeometry(0.12, 0.035, 0.02)),
        mat(new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.4 }))
      );
      pickup.position.set(0, y * 1.4, 0.04);
      g.add(pickup);
    });
    const bridge = new THREE.Mesh(
      keep(new THREE.BoxGeometry(0.12, 0.02, 0.02)),
      chrome
    );
    bridge.position.set(0, -0.14, 0.04);
    g.add(bridge);
    for (let i = 0; i < 6; i += 1) {
      const x = -0.022 + i * 0.0088;
      const s = new THREE.Mesh(
        keep(rod(V(x, -0.14, 0.045), V(x * 0.7, 0.74, 0.03), 0.0018)),
        chrome
      );
      g.add(s);
    }
    for (let i = 0; i < 6; i += 1) {
      const peg = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(0.008, 0.008, 0.04, 8)),
        chrome
      );
      peg.rotation.z = Math.PI / 2;
      peg.position.set(i < 3 ? -0.07 : 0.07, 0.74 + (i % 3) * 0.035, 0.012);
      g.add(peg);
    }
    g.rotation.z = -0.22;
    g.scale.setScalar(0.9);
    return shadowed(g);
  };

  /** A holo collectible card, front painted on a canvas. */
  const cardTexture = () => {
    const c = document.createElement('canvas');
    c.width = 360;
    c.height = 500;
    const ctx = c.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 360, 500);
    ['#ffcf6b', '#ff7eb3', '#7ec8ff', '#b28dff', '#ffd36b'].forEach(
      (col, i, a) => grad.addColorStop(i / (a.length - 1), col)
    );
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 360, 500);
    ctx.fillStyle = '#0f2744';
    ctx.fillRect(16, 16, 328, 468);
    ctx.fillStyle = grad;
    ctx.fillRect(28, 64, 304, 260);
    ctx.fillStyle = '#0f2744';
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 ? 40 : 96;
      ctx.lineTo(180 + Math.cos(a) * r, 196 + Math.sin(a) * r);
    }
    ctx.fill();
    ctx.fillStyle = '#ffd36b';
    ctx.font = '700 30px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('ROOKIE', 180, 48);
    ctx.font = '600 22px sans-serif';
    ctx.fillStyle = '#e9eef8';
    ctx.fillText('1st EDITION · 1 / 500', 180, 372);
    ctx.font = '600 16px sans-serif';
    ctx.fillStyle = '#9fb2d6';
    ctx.fillText('VERIFIED AUTHENTIC', 180, 440);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };

  const buildCard = () => {
    const g = new THREE.Group();
    const tex = cardTexture();
    const front = mat(
      new THREE.MeshPhysicalMaterial({
        map: tex,
        roughness: 0.25,
        metalness: 0.2,
        iridescence: 1,
        iridescenceIOR: 1.6,
        clearcoat: 1,
      })
    );
    const edge = mat(
      new THREE.MeshStandardMaterial({ color: '#e8eef8', roughness: 0.3 })
    );
    const card = new THREE.Mesh(keep(new THREE.BoxGeometry(0.36, 0.5, 0.008)), [
      edge,
      edge,
      edge,
      edge,
      front,
      edge,
    ]);
    const slab = new THREE.Mesh(
      keep(new THREE.BoxGeometry(0.42, 0.58, 0.04)),
      mat(
        new THREE.MeshPhysicalMaterial({
          color: '#ffffff',
          transmission: 1,
          roughness: 0.05,
          thickness: 0.04,
          transparent: true,
          opacity: 0.35,
        })
      )
    );
    g.add(card, slab);
    g.userData.texture = tex;
    return shadowed(g);
  };

  const buildKettlebell = () => {
    const g = new THREE.Group();
    const black = mat(
      new THREE.MeshStandardMaterial({
        color: '#1c1f26',
        metalness: 0.55,
        roughness: 0.38,
      })
    );
    // Cast-iron bell: lathed, flat-footed, widest just below its middle.
    const bell = new THREE.Mesh(
      keep(
        new THREE.LatheGeometry(
          new THREE.SplineCurve(
            [
              [0, 0],
              [0.1, 0],
              [0.135, 0.014],
              [0.168, 0.06],
              [0.183, 0.14],
              [0.172, 0.22],
              [0.14, 0.284],
              [0.085, 0.322],
              [0, 0.334],
            ].map(([x, y]) => new THREE.Vector2(x, y))
          ).getPoints(28),
          40
        )
      ),
      black
    );
    // The handle rises out of the shoulders as one bent bar.
    const handle = new THREE.Mesh(
      keep(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([
            V(-0.1, 0.25, 0),
            V(-0.122, 0.34, 0),
            V(-0.112, 0.43, 0),
            V(-0.06, 0.47, 0),
            V(0.06, 0.47, 0),
            V(0.112, 0.43, 0),
            V(0.122, 0.34, 0),
            V(0.1, 0.25, 0),
          ]),
          40,
          0.026,
          10
        )
      ),
      black
    );
    const band = new THREE.Mesh(
      keep(new THREE.TorusGeometry(0.184, 0.01, 8, 56)),
      gold
    );
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.14;
    const foot = new THREE.Mesh(
      keep(new THREE.TorusGeometry(0.1, 0.008, 6, 40)),
      gold
    );
    foot.rotation.x = Math.PI / 2;
    foot.position.y = 0.004;
    g.add(bell, handle, band, foot);
    return shadowed(g);
  };

  const buildGift = () => {
    const g = new THREE.Group();
    const wrap = mat(
      new THREE.MeshStandardMaterial({
        color: C.sapphire,
        roughness: 0.45,
        metalness: 0.15,
      })
    );
    const box = new THREE.Mesh(
      keep(new THREE.BoxGeometry(0.5, 0.38, 0.5)),
      wrap
    );
    box.position.y = 0.19;
    const lid = new THREE.Group();
    const lidBox = new THREE.Mesh(
      keep(new THREE.BoxGeometry(0.54, 0.08, 0.54)),
      wrap
    );
    lid.add(lidBox);
    lid.position.y = 0.42;
    const ribbonA = new THREE.Mesh(
      keep(new THREE.BoxGeometry(0.08, 0.385, 0.505)),
      gold
    );
    ribbonA.position.y = 0.19;
    const ribbonB = new THREE.Mesh(
      keep(new THREE.BoxGeometry(0.505, 0.385, 0.08)),
      gold
    );
    ribbonB.position.y = 0.19;
    const lidRibbonA = new THREE.Mesh(
      keep(new THREE.BoxGeometry(0.08, 0.085, 0.545)),
      gold
    );
    const lidRibbonB = new THREE.Mesh(
      keep(new THREE.BoxGeometry(0.545, 0.085, 0.08)),
      gold
    );
    lid.add(lidRibbonA, lidRibbonB);
    [-1, 1].forEach((s) => {
      const loop = new THREE.Mesh(
        keep(new THREE.TorusGeometry(0.07, 0.022, 10, 24)),
        gold
      );
      loop.position.set(s * 0.06, 0.09, 0);
      loop.rotation.set(0, s * 0.6, s * 0.5);
      lid.add(loop);
    });
    g.add(box, ribbonA, ribbonB, lid);
    g.userData.lid = lid;
    return shadowed(g);
  };

  /* --------------------------------------------------------- the cast -- */
  const cart = buildCart();
  scene.add(cart);

  const PRODUCTS = [
    { build: buildSneaker, angle: -1.17, lift: 0.2, scale: 1 },
    { build: buildHeadphones, angle: -0.585, lift: 0.18, scale: 1.05 },
    { build: buildGuitar, angle: 0, lift: 0.08, scale: 0.85 },
    { build: buildCard, angle: 0.585, lift: 0.36, scale: 1.05 },
    { build: buildKettlebell, angle: 1.17, lift: 0.04, scale: 1.25 },
  ];
  // An arc of pedestals behind the cart, open toward the camera.
  const R = 1.75;
  const pedestalGeo = keep(new THREE.CylinderGeometry(0.26, 0.3, 0.42, 48));
  const capGeo = keep(new THREE.TorusGeometry(0.26, 0.008, 6, 64));
  const items = PRODUCTS.map((spec, i) => {
    const object = spec.build();
    const home = V(
      Math.sin(spec.angle) * R,
      TOP + 0.42 + spec.lift,
      -Math.cos(spec.angle) * R * 0.7 + 0.1
    );
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(home.x, TOP + 0.21, home.z);
    pedestal.castShadow = pedestal.receiveShadow = true;
    const cap = new THREE.Mesh(capGeo, glow);
    cap.rotation.x = Math.PI / 2;
    cap.position.set(home.x, TOP + 0.425, home.z);
    scene.add(pedestal, cap, object);
    return { ...spec, object, home, pedestal, cap, seed: i * 1.37 };
  });

  const gift = buildGift();
  scene.add(gift);

  // A gold card that taps to pay, and a check that draws itself.
  const payCard = new THREE.Mesh(
    keep(new THREE.BoxGeometry(0.34, 0.22, 0.01)),
    mat(
      new THREE.MeshPhysicalMaterial({
        color: C.gold,
        metalness: 1,
        roughness: 0.22,
        clearcoat: 1,
      })
    )
  );
  payCard.castShadow = true;
  scene.add(payCard);
  const checkCurve = new THREE.CatmullRomCurve3([
    V(-0.16, 0.0, 0),
    V(-0.04, -0.12, 0),
    V(0.22, 0.18, 0),
  ]);
  const checkGeo = keep(
    new THREE.TubeGeometry(checkCurve, 48, 0.025, 10, false)
  );
  const checkMat = mat(
    new THREE.MeshBasicMaterial({ color: '#7ef0b2', toneMapped: false })
  );
  const check = new THREE.Mesh(checkGeo, checkMat);
  const checkRing = new THREE.Mesh(
    keep(new THREE.TorusGeometry(0.34, 0.016, 10, 96)),
    checkMat
  );
  const checkGroup = new THREE.Group();
  checkGroup.add(check, checkRing);
  scene.add(checkGroup);
  const checkIndexCount = checkGeo.index.count;

  // Sparkles drifting through the light.
  const SPARKS = mobile ? 140 : 280;
  const sparkPos = new Float32Array(SPARKS * 3);
  const sparkSeed = Array.from({ length: SPARKS }, () => [
    (Math.random() - 0.5) * 9,
    Math.random() * 4,
    (Math.random() - 0.5) * 6 - 1,
    Math.random() * TAU,
  ]);
  const sparkGeo = keep(new THREE.BufferGeometry());
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparks = new THREE.Points(
    sparkGeo,
    mat(
      new THREE.PointsMaterial({
        color: C.goldLight,
        size: mobile ? 0.03 : 0.022,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
      })
    )
  );
  scene.add(sparks);

  // Confetti for the finale.
  const CONFETTI = mobile ? 90 : 180;
  const confetti = new THREE.InstancedMesh(
    keep(new THREE.PlaneGeometry(0.035, 0.06)),
    mat(
      new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false })
    ),
    CONFETTI
  );
  const confettiSeed = Array.from({ length: CONFETTI }, () => ({
    x: (Math.random() - 0.5) * 3,
    z: (Math.random() - 0.5) * 2,
    speed: 0.3 + Math.random() * 0.5,
    spin: Math.random() * TAU,
    delay: Math.random(),
  }));
  const confettiColors = [C.gold, C.goldLight, '#ff7eb3', '#7ec8ff', '#ffffff'];
  confettiSeed.forEach((_, i) =>
    confetti.setColorAt(
      i,
      new THREE.Color(confettiColors[i % confettiColors.length])
    )
  );
  confetti.frustumCulled = false;
  scene.add(confetti);
  const dummy = new THREE.Object3D();

  /* ------------------------------------------------------------ camera -- */
  /*
   * `aim` is where the subject sits beside the look point, as a fraction of the
   * camera distance (negative: to its left). Wide screens leave it there, clear
   * of the captions; portrait screens slide the camera over to centre it.
   */
  const SHOTS = [
    { at: 0.0, pos: [0.0, 1.55, 4.3], look: [0, 0.62, 0] },
    { at: 0.12, pos: [2.4, 2.1, 3.7], look: [0, 0.75, -0.4] },
    { at: 0.26, pos: [-2.2, 1.9, 3.8], look: [0, 0.75, -0.4] },
    { at: 0.38, pos: [0.0, 2.7, 4.0], look: [0, 0.6, -0.2] },
    // The fly-ins: the camera drifts left to right with the haul.
    { at: 0.41, pos: [-1.0, 2.9, 4.2], look: [-0.6, 0.95, -0.25], aim: -0.11 },
    { at: 0.48, pos: [-0.2, 2.9, 4.1], look: [0.0, 0.95, -0.2], aim: -0.05 },
    { at: 0.53, pos: [0.4, 2.9, 4.0], look: [0.4, 0.95, -0.2], aim: -0.05 },
    // ...then holds high over the cart's shoulder, looking down the kettlebell's
    // arc so its whole drop into the basket stays in frame.
    { at: 0.57, pos: [-0.8, 3.25, 4.05], look: [0.82, 0.95, 0.38], aim: -0.09 },
    {
      at: 0.645,
      pos: [-0.8, 3.25, 4.05],
      look: [0.82, 0.95, 0.38],
      aim: -0.09,
    },
    { at: 0.72, pos: [1.5, 1.75, 3.3], look: [0.1, 0.95, 0] },
    { at: 0.86, pos: [-0.3, 1.5, 3.6], look: [0, 0.6, 0] },
    { at: 1.0, pos: [0.0, 1.55, 4.3], look: [0, 0.62, 0] },
  ];
  const vPos = SHOTS.map((s) => V(...s.pos));
  const vLook = SHOTS.map((s) => V(...s.look));
  const aims = SHOTS.map((s) => s.aim ?? 0);
  const lookAt = V(0, 0, 0);
  const across = V(0, 0, 0);
  // Portrait screens are narrow: pull back a little and centre the subject.
  let portrait = false;
  const shot = (p) => {
    let i = 0;
    while (i < SHOTS.length - 2 && SHOTS[i + 1].at <= p) i += 1;
    const t = smooth(span(p, SHOTS[i].at, SHOTS[i + 1].at));
    camera.position.lerpVectors(vPos[i], vPos[i + 1], t);
    lookAt.lerpVectors(vLook[i], vLook[i + 1], t);
    if (!portrait) return;
    across.subVectors(camera.position, lookAt);
    const d = across.length();
    camera.position.copy(lookAt).addScaledVector(across, 1.3);
    // (camera - look) x up points to screen left; slide toward the subject.
    across
      .cross(UP)
      .normalize()
      .multiplyScalar(-lerp(aims[i], aims[i + 1], t) * d);
    camera.position.add(across);
    lookAt.add(across);
  };

  const tmp = V(0, 0, 0);
  const fromScratch = V(0, 0, 0);
  const UP = V(0, 1, 0);

  /* ------------------------------------------------------------ update -- */
  const update = (p, t, reduced) => {
    const idle = reduced ? 0 : 1;

    // Cart: rolls in, waits for the haul, rolls off once it is boxed.
    const rollIn = ease(span(p, 0.0, 0.08));
    const rollOut = smooth(span(p, 0.84, 0.94));
    cart.position.set(lerp(-0.25, 0, rollIn) + rollOut * 3.2, TOP, 0.25);
    cart.rotation.y =
      lerp(0.35, -0.42, smooth(span(p, 0.0, 0.3))) + rollOut * 0.2;
    cart.userData.wheels.forEach((w) => {
      w.rotation.z = -(cart.position.x + rollIn) * 6;
    });

    // Products: rise and turn on their pedestals, then arc into the basket.
    const rise = ease(span(p, 0.1, 0.22));
    items.forEach((item, i) => {
      const o = item.object;
      const a = 0.4 + i * 0.045;
      const fly = ease(span(p, a, a + 0.07));
      // Scratch vectors only: this runs every frame.
      cart.userData
        .inside(i, items.length, tmp)
        .applyAxisAngle(UP, cart.rotation.y)
        .add(cart.position);
      const floatY = Math.sin(t * 1.4 + item.seed) * 0.03 * idle;
      const from = fromScratch.set(
        item.home.x,
        item.home.y - (1 - rise) * 0.35 + floatY,
        item.home.z
      );
      o.position.lerpVectors(from, tmp, fly);
      o.position.y += Math.sin(fly * Math.PI) * 0.9;
      const show = (t * 0.6 + item.seed) * idle;
      o.rotation.set(
        item.build === buildCard ? -0.1 : 0,
        lerp(show + item.angle, cart.rotation.y + i, fly),
        0
      );
      const boxed = smooth(span(p, 0.74, 0.8));
      o.scale.setScalar(
        item.scale * lerp(rise * 0.98 + 0.02, 0.62, fly) * (1 - boxed) + 0.0001
      );
      o.visible = o.scale.x > 0.002;
    });

    // Checkout: the card taps the handle, the check draws, the haul is boxed.
    const tap = span(p, 0.66, 0.72);
    const tapIn = ease(clamp01(tap * 2));
    const tapOut = smooth(clamp01(tap * 2 - 1));
    payCard.visible = tap > 0 && tap < 1;
    payCard.position.set(
      lerp(1.4, 0.0, tapIn) + tapOut * 0.6 + cart.position.x - 0.7,
      lerp(1.6, 1.12, tapIn) + tapOut * 0.6,
      lerp(0.9, 0.3, tapIn)
    );
    payCard.rotation.set(
      -0.4,
      lerp(-0.8, 0.2, tapIn),
      lerp(0.3, -0.2, tapIn) + tapOut * 2
    );
    const drawn = span(p, 0.7, 0.76);
    checkGroup.visible = drawn > 0 && p < 0.9;
    check.geometry.setDrawRange(0, Math.floor(checkIndexCount * ease(drawn)));
    checkRing.scale.setScalar(ease(drawn));
    checkGroup.position.set(
      cart.position.x + 0.2,
      1.3 + Math.sin(t * 2) * 0.02 * idle,
      0.4
    );
    checkGroup.lookAt(camera.position);
    checkMat.opacity = 1;

    // Gift: appears in the basket, lifts out to centre stage as the cart leaves.
    const boxIn = ease(span(p, 0.76, 0.82));
    const lift = smooth(span(p, 0.82, 0.9));
    const inBasket = tmp.set(cart.position.x + 0.05, TOP + 0.5, 0.25);
    gift.position.lerpVectors(inBasket, fromScratch.set(0, TOP, 0.35), lift);
    gift.position.y += Math.sin(lift * Math.PI) * 0.7;
    gift.scale.setScalar(Math.max(0.001, boxIn * lerp(0.9, 1.25, lift)));
    gift.visible = boxIn > 0.01;
    gift.rotation.y =
      lerp(0.3, -0.5, lift) + Math.sin(t * 0.8) * 0.05 * idle * span(p, 0.9, 1);
    const pop = span(p, 0.93, 1);
    gift.userData.lid.position.y =
      0.42 + ease(pop) * 0.14 + Math.sin(t * 3) * 0.01 * pop * idle;
    gift.userData.lid.rotation.z = ease(pop) * -0.18;

    // Pedestals sink away once they are empty, leaving the stage to the box.
    const sink = smooth(span(p, 0.6, 0.72));
    items.forEach((item) => {
      item.pedestal.position.y = TOP + 0.21 - sink * 0.44;
      item.cap.position.y = TOP + 0.425 - sink * 0.44;
      item.pedestal.visible = sink < 0.99;
      item.cap.visible = sink < 0.99;
    });

    // Light warms toward the finale.
    key.intensity = lerp(60, 80, span(p, 0.86, 1));
    warm.intensity = lerp(10, 22, span(p, 0.86, 1));

    // Sparkles and confetti.
    sparkSeed.forEach(([x, y, z, ph], i) => {
      sparkPos[i * 3] = x + Math.sin(t * 0.3 + ph) * 0.2 * idle;
      sparkPos[i * 3 + 1] = (y + t * 0.08 * idle) % 4;
      sparkPos[i * 3 + 2] = z;
    });
    sparkGeo.attributes.position.needsUpdate = true;
    const party = span(p, 0.9, 0.96);
    confettiSeed.forEach((c, i) => {
      const life = (t * c.speed * 0.4 + c.delay) % 1;
      dummy.position.set(
        c.x + Math.sin(t + c.spin) * 0.2,
        2.6 - life * 2.6,
        c.z
      );
      dummy.rotation.set(t * 2 + c.spin, t * 1.4 + c.spin, 0);
      dummy.scale.setScalar(party * (reduced ? 0 : 1) + 0.0001);
      dummy.updateMatrix();
      confetti.setMatrixAt(i, dummy.matrix);
    });
    confetti.instanceMatrix.needsUpdate = true;
    confetti.visible = party > 0.001;

    shot(p);
    camera.lookAt(lookAt);
  };

  /* ------------------------------------------------------------ resize -- */
  const resize = (w, h) => {
    camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 48 : w / h < 1.2 ? 40 : 34;
    portrait = w / h < 0.8;
    // Frame the scene beside the captions: right of them on wide screens, above them on phones.
    if (w / h > 1.1) camera.setViewOffset(w, h, -w * 0.16, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.17, w, h);
    camera.updateProjectionMatrix();
  };

  const dispose = () => {
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    texs.forEach((t) => t.dispose());
    items.forEach((item) => item.object.userData.texture?.dispose());
    envTexture.dispose();
    pmrem.dispose();
  };

  return { scene, camera, update, resize, dispose };
}
