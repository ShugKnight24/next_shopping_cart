/**
 * The Studio story, scrubbed by scroll:
 *   0  two kids, Maya and Sam, side by side on a soft stage
 *   1  picker tiles orbit them and fly in; each kid's look changes with each
 *      tile that lands on them, a beat apart
 *   2  a storybook tilts up on its stand, open on a page starring both of
 *      them, and turns to the next chapter while they reach for it
 *   3  a framed poster of the pair on the wall
 *   4  Maya's hoodie and Sam's tee, each printed with its owner
 *   5  pull back on everything, ready to start
 * The book page, the poster and the garments are rendered by the studio's own
 * renderers (drawSubstrate + paintLayers + the starters), so the hero shows
 * exactly what the editors make.
 */

import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { spreadConfig } from '../Studio/book/bookPages';
import { createPet } from '../Studio/cast/castModel';
import { decodeSvg } from '../Studio/cast/castRaster';
import {
  normalizePerson,
  PERSON_PRESETS,
  personArt,
} from '../Studio/cast/castRig';
import {
  drawApparelSubstrate,
  drawBookSubstrate,
  drawPosterSubstrate,
} from '../Studio/drawSubstrate';
import { buildStarter, STARTERS } from '../Studio/starters/starters';
import { PRODUCTS } from '../Studio/workbench/products';
import { paintLayers, warmLayers } from '../Studio/workbench/renderLayers';

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const ease = (t) => 1 - (1 - t) ** 3;
const span = (p, a, b) => clamp01((p - a) / (b - a));
const TAU = Math.PI * 2;

/* ---------------------------------------------------------- 2D renders -- */

const canvasOf = (w, h) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
};

/** Paint a product with the studio's own renderers at `scale`. */
const renderDesign = async ({
  artboard,
  draw,
  config,
  layers,
  cast,
  scale = 2,
}) => {
  await warmLayers(layers, cast);
  const [c, ctx] = canvasOf(
    Math.round(artboard.width * scale),
    Math.round(artboard.height * scale)
  );
  ctx.scale(scale, scale);
  draw(ctx, { ...artboard, config });
  paintLayers(ctx, { layers, artboard, cast, scale });
  return c;
};

/**
 * Key the apparel backdrop out so the hoodie is a cut-out in 3D. Flood-fills
 * from the edges, so only backdrop connected to the outside goes: a print in
 * the same off-white as the backdrop, inside the garment, stays.
 */
const keyOut = (c, [r0, g0, b0], tolerance = 10) => {
  const ctx = c.getContext('2d');
  const { width: w, height: h } = c;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const isKey = (i) =>
    Math.abs(d[i] - r0) <= tolerance &&
    Math.abs(d[i + 1] - g0) <= tolerance &&
    Math.abs(d[i + 2] - b0) <= tolerance;
  const seen = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x += 1) stack.push(x, x + (h - 1) * w);
  for (let y = 0; y < h; y += 1) stack.push(y * w, y * w + w - 1);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p]) continue;
    seen[p] = 1;
    if (!isKey(p * 4)) continue;
    d[p * 4 + 3] = 0;
    const x = p % w;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (p >= w) stack.push(p - w);
    if (p < w * (h - 1)) stack.push(p + w);
  }
  // The contact shadow under the garment: the 3D floor draws its own.
  for (let y = Math.round(h * 0.83); y < h; y += 1)
    for (let x = 0; x < w; x += 1) d[(y * w + x) * 4 + 3] = 0;
  ctx.putImageData(img, 0, 0);
  return c;
};

/** keyOut, or the unkeyed render if the canvas cannot be read back. */
const safeKeyOut = (c, colour) => {
  try {
    return keyOut(c, colour);
  } catch {
    return c;
  }
};

/** A person's art as a canvas, `height` px tall. */
const personCanvas = async (person, placement, height = 640) => {
  const art = personArt(person, placement);
  const img = await decodeSvg(
    `hero:${JSON.stringify([person, placement])}`,
    art.svg
  );
  const w = Math.round((art.width / art.height) * height);
  const [c, ctx] = canvasOf(w, height);
  if (img) ctx.drawImage(img, 0, 0, w, height);
  return { canvas: c, aspect: art.width / art.height };
};

/**
 * A picker tile on a rounded card: the head of a look, or the whole kid for
 * an outfit tile (`full`), where the clothes are the point.
 */
const tileCanvas = async (person, label, full = false) => {
  const art = personArt(person, {});
  const [x, y, w, h] = full
    ? [
        art.viewBox[0] - (art.height - art.width) / 2,
        art.viewBox[1],
        art.height,
        art.height,
      ]
    : art.headBox;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${art.markup}</svg>`;
  const img = await decodeSvg(
    `tile:${label}:${full}:${JSON.stringify(person)}`,
    svg
  );
  const [c, ctx] = canvasOf(256, 300);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(6, 6, 244, 288, 28);
  ctx.fill();
  ctx.fillStyle = '#f4f1ea';
  ctx.beginPath();
  ctx.roundRect(20, 20, 216, 216, 20);
  ctx.fill();
  if (img) ctx.drawImage(img, 28, 28, 200, 200);
  ctx.fillStyle = '#2b2433';
  ctx.font = '700 30px ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, 128, 274);
  return c;
};

/* ------------------------------------------------------------ the cast -- */

/** A kid from the rig's kid preset, with a look of their own. */
const kidOf = (id, name, look) => ({
  ...normalizePerson({ ...PERSON_PRESETS.kid, ...look }),
  id,
  kind: 'person',
  name,
});

const MAYA = kidOf('hero-maya', 'Maya', {
  skin: 'caramel',
  hair: 'buns',
  hairColor: 'espresso',
  top: 'tee',
  topColor: 'mustard',
  pattern: 'stars',
  accentColor: 'white',
  bottom: 'overalls',
  bottomColor: 'denim',
  shoes: 'sneakers',
  shoeColor: 'red',
});

const SAM = kidOf('hero-sam', 'Sam', {
  skin: 'peach',
  freckles: true,
  hair: 'curlyTop',
  hairColor: 'ginger',
  eyeColor: 'green',
  glasses: 'round',
  top: 'tee',
  topColor: 'teal',
  pattern: 'stripes',
  accentColor: 'white',
  bottom: 'shorts',
  bottomColor: 'navy',
  shoes: 'sneakers',
  shoeColor: 'mustard',
});

/** Both start from the same blank kid: a plain sky tee and jeans. */
const plain = (kid, extra = {}) => ({
  ...kid,
  hair: 'crop',
  top: 'tee',
  topColor: 'sky',
  pattern: 'solid',
  bottom: 'jeans',
  bottomColor: 'denim',
  glasses: 'none',
  ...extra,
});

/**
 * Each kid's looks as their three tiles land: plain, then hair, then outfit,
 * then the finishing touch. Tile `n` turns look `n` into look `n + 1`.
 */
const KIDS = [
  {
    person: MAYA,
    side: 1,
    looks: [
      plain(MAYA),
      plain(MAYA, { hair: 'buns' }),
      plain(MAYA, { hair: 'buns', topColor: 'mustard', pattern: 'stars' }),
      MAYA,
    ],
    tiles: [
      ['Space buns', { ...MAYA }, false],
      [
        'Stars tee',
        plain(MAYA, { hair: 'buns', topColor: 'mustard', pattern: 'stars' }),
        true,
      ],
      ['Overalls', { ...MAYA }, true],
    ],
  },
  {
    person: SAM,
    side: -1,
    looks: [
      plain(SAM),
      plain(SAM, { hair: 'curlyTop' }),
      plain(SAM, {
        hair: 'curlyTop',
        topColor: 'teal',
        pattern: 'stripes',
        bottom: 'shorts',
        bottomColor: 'navy',
      }),
      SAM,
    ],
    tiles: [
      ['Curly top', plain(SAM, { hair: 'curlyTop' }), false],
      [
        'Stripes',
        plain(SAM, {
          hair: 'curlyTop',
          topColor: 'teal',
          pattern: 'stripes',
          bottom: 'shorts',
          bottomColor: 'navy',
        }),
        true,
      ],
      ['Glasses', { ...SAM }, false],
    ],
  },
];

/** A poster of the pair: their names, the two of them reaching for each other. */
const DUO_POSTER = {
  id: 'hero-duo',
  needs: ['hero', 'grownup'],
  options: { artStyle: 'sunset' },
  build: (k) =>
    [
      k.text('{hero} & {grownup}', 0.12, {
        size: 52,
        font: 'serif',
        weight: 700,
      }),
      k.text('Partners in adventure', 0.22, {
        size: 18,
        font: 'sans',
        weight: 600,
        role: 'subtitle',
        transform: 'uppercase',
        spacing: 4,
      }),
      k.person('hero', 0.34, { pose: 'reach', side: 1, mood: 'grin' }, 1.3),
      k.person(
        'grownup',
        0.64,
        { pose: 'reach', side: -1, mood: 'laugh' },
        1.3
      ),
      k.person('pet', 0.9, {}, 1.1),
    ].filter(Boolean),
};

/* --------------------------------------------------------------- scene -- */

export async function loadStudioScene({ THREE, renderer, mobile }) {
  const scene = new THREE.Scene();
  const bg = new THREE.Color('#161a33');
  scene.background = bg;
  scene.fog = new THREE.Fog(bg, 11, 24);
  const pmrem = new THREE.PMREMGenerator(renderer);
  // The room is only needed to bake the environment map; free it after.
  const room = new RoomEnvironment();
  const envTexture = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  scene.environment = envTexture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);

  scene.add(new THREE.HemisphereLight('#ffeedd', '#2a2f52', 1.1));
  const key = new THREE.DirectionalLight('#fff1dc', 2.6);
  key.position.set(-3, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 7, top: 5, bottom: -3 });
  key.shadow.bias = -0.0004;
  key.shadow.radius = 6;
  scene.add(key);
  const fill = new THREE.PointLight('#8f7bff', 14, 12);
  fill.position.set(4, 2.5, 2);
  scene.add(fill);

  const geos = [];
  const mats = [];
  const texs = [];
  const keep = (g) => (geos.push(g), g);
  const mat = (m) => (mats.push(m), m);
  const tex = (canvas) => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    texs.push(t);
    return t;
  };

  /* -------------------------------------------------------- the content -- */
  // Maya plays the hero, Sam the second lead (castForRoles hands the
  // "grown-up" part to the next person when there is no adult), plus the pet.
  const cast = [MAYA, SAM, createPet({ id: 'hero-pet', name: 'Biscuit' })];

  // The three products, rendered by the editors' own code. The book is the
  // "Birthday book" idea: its first two story spreads (a picnic, then the
  // party) both star the pair, so a page can turn from one to the next.
  const bookDefaults = { ...PRODUCTS.book.defaults, format: 'landscape' };
  const bookArt = PRODUCTS.book.artboard(bookDefaults);
  const bookBuilt = buildStarter(
    'book',
    STARTERS.book.find((b) => b.id === 'birthday'),
    { artboard: bookArt, options: bookDefaults, cast }
  );
  const storySpreads = bookBuilt.options.spreads
    .filter((sp) => sp.kind === 'story')
    .slice(0, 2);
  const spreadRender = (sp) =>
    renderDesign({
      artboard: bookArt,
      draw: (ctx, b) =>
        drawBookSubstrate(ctx, { ...b, config: spreadConfig(b.config) }),
      config: {
        ...bookDefaults,
        cast,
        spreads: bookBuilt.options.spreads,
        activeSpread: sp.id,
      },
      layers: bookBuilt.layers.filter((l) => l.page === sp.id),
      cast,
      // Sharp enough to read the story text on the tilted page.
      scale: 3,
    });
  const posterOptions = { ...PRODUCTS.poster.defaults, cast };
  const posterArt = PRODUCTS.poster.artboard(posterOptions);
  const posterBuilt = buildStarter('poster', DUO_POSTER, {
    artboard: posterArt,
    options: posterOptions,
    cast,
  });
  // One garment each, printed with its owner.
  const GARMENTS = [
    { kid: MAYA, garment: 'hoodie', color: '#26305f', accentColor: '#e8b44c' },
    { kid: SAM, garment: 'tee', color: '#e3b23c', accentColor: '#2c3e6b' },
  ];
  const apparelArt = PRODUCTS.apparel.artboard(PRODUCTS.apparel.defaults);
  const garmentRender = ({ kid, ...look }) => {
    const options = { ...PRODUCTS.apparel.defaults, ...look, cast: [kid] };
    const built = buildStarter('apparel', STARTERS.apparel[0], {
      artboard: apparelArt,
      options,
      cast: [kid],
    });
    return renderDesign({
      artboard: apparelArt,
      draw: drawApparelSubstrate,
      config: options,
      layers: built.layers,
      cast: built.cast,
    }).then((c) => safeKeyOut(c, [248, 250, 252]));
  };

  const kidArt = (k) =>
    Promise.all([
      Promise.all(k.looks.map((p) => personCanvas(p, {}))),
      Promise.all(
        k.tiles.map(([label, p, full]) => tileCanvas(p, label, full))
      ),
      personCanvas(k.person, { pose: 'cheer', mood: 'laugh' }),
      personCanvas(k.person, { pose: 'wave', mood: 'grin' }),
      // Reaching towards the book beside them: Maya stands left of it and
      // reaches right, Sam stands right of it and reaches left.
      personCanvas(k.person, { pose: 'reach', mood: 'grin', side: k.side }),
    ]);

  const [kidArts, spreadCanvases, posterCanvas, garmentCanvases] =
    await Promise.all([
      Promise.all(KIDS.map(kidArt)),
      Promise.all(storySpreads.map(spreadRender)),
      renderDesign({
        artboard: posterArt,
        draw: drawPosterSubstrate,
        config: { ...posterOptions, ...posterBuilt.options },
        layers: posterBuilt.layers,
        cast: posterBuilt.cast,
      }),
      Promise.all(GARMENTS.map(garmentRender)),
    ]);

  /* -------------------------------------------------------------- room -- */
  const floor = new THREE.Mesh(
    keep(new THREE.CircleGeometry(30, 64)),
    mat(new THREE.MeshStandardMaterial({ color: '#1d2245', roughness: 0.95 }))
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const wall = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(34, 12)),
    mat(new THREE.MeshStandardMaterial({ color: '#232955', roughness: 1 }))
  );
  wall.position.set(0, 6, -2.4);
  wall.receiveShadow = true;
  scene.add(wall);
  const STAGE_R = 1.08;
  const stage = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(STAGE_R, STAGE_R + 0.05, 0.08, 64)),
    mat(
      new THREE.MeshStandardMaterial({
        color: '#2d3470',
        roughness: 0.5,
        metalness: 0.2,
      })
    )
  );
  stage.position.set(0, 0.04, 0.8);
  stage.receiveShadow = true;
  scene.add(stage);
  const stageRing = new THREE.Mesh(
    keep(new THREE.TorusGeometry(STAGE_R + 0.02, 0.01, 8, 128)),
    mat(new THREE.MeshBasicMaterial({ color: '#f3c76a', toneMapped: false }))
  );
  stageRing.rotation.x = Math.PI / 2;
  stageRing.position.set(0, 0.085, 0.8);
  scene.add(stageRing);

  /* ------------------------------------------------------- the two kids -- */
  const FIG_H = 1.15;
  const figGeo = keep(new THREE.PlaneGeometry(1, 1));
  figGeo.translate(0, 0.5, 0);
  const looksOf = (canvases) =>
    canvases.map((l) => ({ texture: tex(l.canvas), aspect: l.aspect }));

  const kids = kidArts.map(([lookCanvases, , cheer, wave, point], ki) => {
    const looks = looksOf(lookCanvases);
    const figureMat = mat(
      new THREE.MeshBasicMaterial({
        map: looks[0].texture,
        transparent: true,
        alphaTest: 0.05,
        toneMapped: false,
        side: THREE.DoubleSide,
      })
    );
    const mesh = new THREE.Mesh(figGeo, figureMat);
    mesh.castShadow = true;
    mesh.customDepthMaterial = mat(
      new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        map: figureMat.map,
        alphaTest: 0.4,
      })
    );
    scene.add(mesh);
    return {
      mesh,
      mat: figureMat,
      looks,
      cheer: looksOf([cheer])[0],
      wave: looksOf([wave])[0],
      point: looksOf([point])[0],
      shown: looks[0],
      // Sam follows Maya a beat behind, so every hop is a little relay.
      delay: ki * 0.018,
      bob: ki * 1.3,
      h: FIG_H,
      moving: false,
      landed: 0,
      pop: 0,
    };
  });
  const show = (kid, look) => {
    if (kid.shown === look) return;
    kid.shown = look;
    kid.mat.map = look.texture;
    kid.mesh.customDepthMaterial.map = look.texture;
    kid.mat.needsUpdate = true;
  };

  // Picker tiles orbiting the pair, alternating whose they are. Tile `j` of
  // each kid flies in on its own beat, Sam's a moment after Maya's.
  const tileGeo = keep(new THREE.PlaneGeometry(0.34, 0.4));
  const tiles = [];
  const TILE_COUNT = KIDS.reduce((n, k) => n + k.tiles.length, 0);
  for (let j = 0; j < 3; j += 1)
    kidArts.forEach(([, tileCanvases], owner) => {
      const m = new THREE.Mesh(
        tileGeo,
        mat(
          new THREE.MeshBasicMaterial({
            map: tex(tileCanvases[j]),
            transparent: true,
            toneMapped: false,
            side: THREE.DoubleSide,
          })
        )
      );
      scene.add(m);
      const flyAt = 0.16 + j * 0.05 + owner * 0.022;
      tiles.push({
        mesh: m,
        owner,
        flyAt,
        landAt: flyAt + 0.04,
        phase: (tiles.length / TILE_COUNT) * TAU,
      });
    });

  /* -------------------------------------------------------------- book -- */
  // An open picture book on a reading stand on a round table. The stand
  // tilts it up as the kids arrive so the camera reads the pages face on,
  // then a page turns from one chapter to the next.
  const BOOK = { x: -2.3, z: 0.4 };
  // How far the stand tilts the book up from flat: pages face the camera.
  const BOOK_TILT = 0.95;
  const TABLE_R = 1.4;
  const TABLE_Y = 0.625;
  const wood = mat(
    new THREE.MeshStandardMaterial({ color: '#6b4a34', roughness: 0.55 })
  );
  const table = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(TABLE_R, TABLE_R, 0.05, 64)),
    wood
  );
  table.position.set(BOOK.x, TABLE_Y - 0.025, BOOK.z);
  table.castShadow = table.receiveShadow = true;
  const tableLeg = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(0.07, 0.14, 0.58, 16)),
    mat(new THREE.MeshStandardMaterial({ color: '#4d3424', roughness: 0.6 }))
  );
  tableLeg.position.set(BOOK.x, 0.29, BOOK.z);
  tableLeg.castShadow = true;
  scene.add(table, tableLeg);

  // Page size from the spread's own aspect: each page is half of it.
  const W = 0.82;
  const D = (W * 2 * bookArt.height) / bookArt.width;
  // The hardcover border the substrate paints around the spread is the 3D
  // book's own cover here, so the textures start inside it.
  const INSET = 14;
  const pageTexture = (canvas, half) => {
    const k = canvas.width / bookArt.width;
    const inset = INSET * k;
    const w = canvas.width / 2 - inset;
    const h = canvas.height - inset * 2;
    const [c, ctx] = canvasOf(Math.round(w), Math.round(h));
    ctx.drawImage(
      canvas,
      half === 'left' ? inset : canvas.width / 2,
      inset,
      w,
      h,
      0,
      0,
      w,
      h
    );
    return mat(
      new THREE.MeshStandardMaterial({ map: tex(c), roughness: 0.85 })
    );
  };
  /**
   * One page, lying face up, curving up from the spine and settling flat
   * towards the edge as a real open book does. `side` 1 runs from the spine
   * to the right, -1 to the left; texture left-to-right either way.
   */
  const ARCH = 0.045;
  const pageGeometry = (side, lift = 0) => {
    const g = keep(new THREE.PlaneGeometry(W, D, 24, 1));
    g.rotateX(-Math.PI / 2);
    g.translate((side * W) / 2, 0, 0);
    const pos = g.attributes.position;
    for (let v = 0; v < pos.count; v += 1) {
      const u = Math.abs(pos.getX(v)) / W;
      pos.setY(
        v,
        lift +
          ARCH * Math.sin(Math.min(1, u * 1.6) * (Math.PI / 2)) * (1 - u * 0.35)
      );
    }
    g.computeVertexNormals();
    return g;
  };
  const [spreadA, spreadB] = spreadCanvases;
  // The leaf that turns: the next chapter's left page on its back, built as
  // a left page then turned over, so it reads correctly once it lands.
  const leafBack = pageGeometry(-1);
  leafBack.rotateZ(Math.PI);

  const bookTilt = new THREE.Group();
  bookTilt.position.set(BOOK.x, TABLE_Y, BOOK.z + D / 2 - 0.05);
  scene.add(bookTilt);
  const bookGroup = new THREE.Group();
  // Hinged on its bottom edge: the far edge rises as the stand tilts.
  bookGroup.position.set(0, 0.06, -D / 2);
  bookTilt.add(bookGroup);

  const cloth = mat(
    new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 })
  );
  const cream = mat(
    new THREE.MeshStandardMaterial({ color: '#f3ecdc', roughness: 0.9 })
  );
  const STACK = 0.035;
  [-1, 1].forEach((side) => {
    const board = new THREE.Mesh(
      keep(new THREE.BoxGeometry(W + 0.04, 0.014, D + 0.06)),
      cloth
    );
    board.position.set((side * (W + 0.04)) / 2, -STACK - 0.007, 0);
    const pages = new THREE.Mesh(
      keep(new THREE.BoxGeometry(W - 0.01, STACK, D - 0.01)),
      cream
    );
    pages.position.set((side * W) / 2, -STACK / 2, 0);
    bookGroup.add(board, pages);
  });
  const spine = new THREE.Mesh(
    keep(
      new THREE.CylinderGeometry(0.03, 0.03, D + 0.06, 16, 1, false, 0, Math.PI)
    ),
    cloth
  );
  spine.rotation.x = Math.PI / 2;
  spine.position.y = -STACK - 0.01;
  const leftPage = new THREE.Mesh(
    pageGeometry(-1),
    pageTexture(spreadA, 'left')
  );
  const rightBase = new THREE.Mesh(
    pageGeometry(1),
    pageTexture(spreadB, 'right')
  );
  const leaf = new THREE.Group();
  leaf.position.y = 0.003;
  leaf.add(
    new THREE.Mesh(pageGeometry(1, 0.0005), pageTexture(spreadA, 'right')),
    new THREE.Mesh(leafBack, pageTexture(spreadB, 'left'))
  );
  bookGroup.add(spine, leftPage, rightBase, leaf);

  // The stand: a slanted wooden back the book rests on, and a lip it sits in.
  const standBack = new THREE.Mesh(
    keep(new THREE.BoxGeometry(W * 1.5, 0.03, D * 0.92)),
    wood
  );
  standBack.position.set(0, -STACK - 0.035, 0);
  bookGroup.add(standBack);
  const lip = new THREE.Mesh(
    keep(new THREE.BoxGeometry(W * 2.15, 0.07, 0.05)),
    wood
  );
  lip.position.set(0, 0.03, 0.02);
  bookTilt.add(lip);
  // A strut that props the stand up from behind.
  const strut = new THREE.Mesh(
    keep(new THREE.BoxGeometry(0.06, 0.02, 1)),
    wood
  );
  scene.add(strut);
  const strutFrom = new THREE.Vector3();
  const strutTo = new THREE.Vector3();

  bookTilt.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });

  // A warm reading light on the pages once they face the camera.
  const bookLight = new THREE.SpotLight('#fff1d6', 0, 6, 0.6, 0.7, 1.2);
  bookLight.position.set(BOOK.x + 0.6, 3.2, BOOK.z + 2.2);
  bookLight.target = bookGroup;
  scene.add(bookLight);

  /* ------------------------------------------------------------ poster -- */
  const POSTER = { x: 0, y: 2.05, z: -2.3 };
  const posterH = 1.6;
  const posterW = posterH * (posterArt.width / posterArt.height);
  const posterMesh = new THREE.Mesh(
    keep(new THREE.BoxGeometry(posterW, posterH, 0.05)),
    [
      ...Array(4).fill(
        mat(
          new THREE.MeshStandardMaterial({ color: '#b8875a', roughness: 0.6 })
        )
      ),
      mat(
        new THREE.MeshStandardMaterial({
          map: tex(posterCanvas),
          roughness: 0.75,
        })
      ),
      mat(new THREE.MeshStandardMaterial({ color: '#2a2a2a' })),
    ]
  );
  posterMesh.position.set(POSTER.x, POSTER.y, POSTER.z);
  posterMesh.castShadow = true;
  scene.add(posterMesh);
  const posterLight = new THREE.SpotLight('#fff1d6', 0, 6, 0.5, 0.6, 1.2);
  posterLight.position.set(0, 4, -1);
  posterLight.target = posterMesh;
  scene.add(posterLight);

  /* ---------------------------------------------------------- garments -- */
  // Maya's hoodie on the left of the rail, Sam's tee on the right, with room
  // between them for the two kids to stand by their own.
  const RAIL = { x: 2.7, z: 0.1 };
  const GARMENT_X = [RAIL.x - 1.3, RAIL.x + 1.3];
  const garmentH = 1.5;
  const garmentW = garmentH * (apparelArt.width / apparelArt.height);
  // A gentle bow across the chest so the cut-out reads as fabric, not a card.
  const garmentGeo = keep(new THREE.PlaneGeometry(garmentW, garmentH, 24, 1));
  const gp = garmentGeo.attributes.position;
  for (let i = 0; i < gp.count; i += 1)
    gp.setZ(i, Math.cos((gp.getX(i) / garmentW) * Math.PI) * 0.06);
  garmentGeo.computeVertexNormals();
  const garments = garmentCanvases.map((canvas, i) => {
    const m = mat(
      new THREE.MeshStandardMaterial({
        map: tex(canvas),
        transparent: true,
        alphaTest: 0.1,
        roughness: 0.85,
        side: THREE.DoubleSide,
      })
    );
    const mesh = new THREE.Mesh(garmentGeo, m);
    mesh.castShadow = true;
    mesh.customDepthMaterial = mat(
      new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        map: m.map,
        alphaTest: 0.4,
      })
    );
    mesh.position.set(GARMENT_X[i], 1.1, RAIL.z);
    scene.add(mesh);
    return mesh;
  });
  const railMat = mat(
    new THREE.MeshStandardMaterial({
      color: '#c8ccd6',
      metalness: 1,
      roughness: 0.25,
    })
  );
  const rail = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(0.012, 0.012, 3.8, 12)),
    railMat
  );
  rail.rotation.z = Math.PI / 2;
  rail.position.set(RAIL.x, 2.0, RAIL.z - 0.02);
  scene.add(rail);
  const hookGeo = keep(
    new THREE.TorusGeometry(0.05, 0.008, 8, 24, Math.PI * 1.4)
  );
  GARMENT_X.forEach((x) => {
    const hook = new THREE.Mesh(hookGeo, railMat);
    hook.position.set(x, 1.95, RAIL.z);
    scene.add(hook);
  });

  /* ---------------------------------------------------------- sparkles -- */
  const SPARKS = mobile ? 120 : 240;
  const sparkPos = new Float32Array(SPARKS * 3);
  const sparkSeed = Array.from({ length: SPARKS }, () => [
    (Math.random() - 0.5) * 11 + 0.5,
    Math.random() * 4.5,
    (Math.random() - 0.5) * 5 - 0.5,
    Math.random() * TAU,
  ]);
  const sparkGeo = keep(new THREE.BufferGeometry());
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  scene.add(
    new THREE.Points(
      sparkGeo,
      mat(
        new THREE.PointsMaterial({
          color: '#ffd98a',
          size: mobile ? 0.03 : 0.022,
          transparent: true,
          opacity: 0.75,
          depthWrite: false,
        })
      )
    )
  );

  /* -------------------------------------------------------- choreography -- */
  /**
   * Where each kid stands at each beat, and how tall. `side` is -1 for Maya
   * (on the left) and 1 for Sam; `by` is where they stand by their garment.
   */
  const spotsFor = (side, by) => {
    const home = [side * 0.42, 0.08, 0.8];
    // On the table either side of the stand, pointing at their story.
    const page = [BOOK.x + side * (W + 0.2), TABLE_Y, BOOK.z + 0.7];
    const wall = [POSTER.x + side * 1.08, 0.0, -1.85];
    // Level with the rail, so the hop in from the wall comes between the
    // garments rather than through one.
    const rack = [by, 0.0, RAIL.z + 0.05];
    return [
      { at: 0.0, pos: home, h: FIG_H },
      { at: 0.34, pos: home, h: FIG_H },
      { at: 0.44, pos: page, h: 0.52 },
      { at: 0.56, pos: page, h: 0.52 },
      { at: 0.64, pos: wall, h: FIG_H * 0.9 },
      { at: 0.76, pos: wall, h: FIG_H * 0.9 },
      { at: 0.84, pos: rack, h: FIG_H * 0.9 },
      { at: 0.9, pos: rack, h: FIG_H * 0.9 },
      { at: 0.97, pos: home, h: FIG_H },
      { at: 1.01, pos: home, h: FIG_H },
    ].map((s) => ({ ...s, v: new THREE.Vector3(...s.pos) }));
  };
  kids[0].spots = spotsFor(-1, RAIL.x - 0.36);
  kids[1].spots = spotsFor(1, RAIL.x + 0.36);

  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  /** The spot pair either side of `p`: the index of the one before it. */
  const segment = (list, p) => {
    let i = 0;
    while (i < list.length - 2 && list[i + 1].at <= p) i += 1;
    return i;
  };
  const placeKid = (kid, p) => {
    const i = segment(kid.spots, p);
    const a = kid.spots[i];
    const b = kid.spots[i + 1];
    const t = smooth(span(p, a.at, b.at));
    kid.mesh.position.lerpVectors(a.v, b.v, t);
    // A hop between spots.
    kid.moving = a.v.distanceToSquared(b.v) > 0.0001;
    if (kid.moving) kid.mesh.position.y += Math.sin(t * Math.PI) * 0.6;
    kid.h = lerp(a.h, b.h, t);
  };

  /**
   * Camera beats. `wide` is how far a narrow (portrait) screen backs off
   * along the shot's line of sight to keep both kids and the product in
   * frame: close shots barely move, the rail and the finale back right off.
   */
  const SHOTS = [
    { at: 0.0, pos: [0.0, 1.75, 6.0], look: [0, 1.0, 0.2], wide: 1.15 },
    { at: 0.12, pos: [0.0, 1.45, 5.0], look: [0, 0.85, 0.7], wide: 1.2 },
    { at: 0.32, pos: [0.35, 1.5, 5.1], look: [0, 0.88, 0.6], wide: 1.2 },
    {
      at: 0.44,
      pos: [BOOK.x + 0.15, 2.4, BOOK.z + 4.9],
      look: [BOOK.x - 0.1, 0.98, BOOK.z],
      wide: 1.25,
    },
    {
      at: 0.56,
      pos: [BOOK.x + 0.05, 2.2, BOOK.z + 4.1],
      look: [BOOK.x - 0.1, 0.98, BOOK.z],
      wide: 1.25,
    },
    { at: 0.64, pos: [0.0, 1.7, 4.0], look: [0, 1.3, -2.0], wide: 1.3 },
    { at: 0.76, pos: [0.05, 1.65, 3.7], look: [0.05, 1.3, -2.0], wide: 1.3 },
    { at: 0.84, pos: [RAIL.x, 1.3, 5.0], look: [RAIL.x, 1.0, 0.0], wide: 1.4 },
    { at: 0.9, pos: [RAIL.x, 1.25, 4.8], look: [RAIL.x, 1.0, 0.0], wide: 1.4 },
    { at: 1.0, pos: [1.0, 2.5, 9.8], look: [1.0, 1.0, -0.4], wide: 1.3 },
  ];
  const vPos = SHOTS.map((s) => new THREE.Vector3(...s.pos));
  const vLook = SHOTS.map((s) => new THREE.Vector3(...s.look));
  const lookAt = new THREE.Vector3();
  // How narrow the screen is: 0 on a landscape screen, 1 on a phone held
  // upright. Set by resize().
  let narrow = 0;
  const shot = (p) => {
    const i = segment(SHOTS, p);
    const t = smooth(span(p, SHOTS[i].at, SHOTS[i + 1].at));
    camera.position.lerpVectors(vPos[i], vPos[i + 1], t);
    lookAt.lerpVectors(vLook[i], vLook[i + 1], t);
    if (narrow) {
      const wide = lerp(SHOTS[i].wide, SHOTS[i + 1].wide, t);
      camera.position
        .sub(lookAt)
        .multiplyScalar(1 + (wide - 1) * narrow)
        .add(lookAt);
    }
  };

  const update = (p, t, reduced) => {
    const idle = reduced ? 0 : 1;
    shot(p);
    camera.lookAt(lookAt);

    // Each kid's look is set by how many of their tiles have landed, with a
    // squash-and-stretch pop as each one lands.
    for (let ki = 0; ki < kids.length; ki += 1) {
      kids[ki].landed = 0;
      kids[ki].pop = 0;
    }
    for (let i = 0; i < tiles.length; i += 1) {
      const tile = tiles[i];
      const kid = kids[tile.owner];
      if (p < tile.landAt) continue;
      kid.landed += 1;
      const since = (p - tile.landAt) / 0.025;
      if (since < 1) kid.pop = Math.max(kid.pop, (1 - since) * 0.08);
    }

    for (let ki = 0; ki < kids.length; ki += 1) {
      const kid = kids[ki];
      const q = p - kid.delay;
      placeKid(kid, q);
      let look = kid.looks[Math.min(kid.landed, kid.looks.length - 1)];
      if (q > 0.92) look = kid.wave;
      else if (kid.moving && q > 0.36) look = kid.cheer;
      else if (q > 0.44 && q < 0.56) look = kid.point;
      show(kid, look);
      const { h, pop } = kid;
      kid.mesh.scale.set(h * look.aspect * (1 + pop), h * (1 - pop * 0.6), 1);
      kid.mesh.position.y +=
        Math.abs(Math.sin(t * 2.2 + kid.bob)) *
        0.015 *
        idle *
        (kid.moving ? 0 : 1);
      kid.mesh.lookAt(
        camera.position.x,
        kid.mesh.position.y + 0.5,
        camera.position.z
      );
    }

    // Tiles orbit the pair, then each flies into its kid.
    const orbitIn = ease(span(p, 0.1, 0.16));
    for (let i = 0; i < tiles.length; i += 1) {
      const tile = tiles[i];
      const kid = kids[tile.owner];
      const fly = ease(span(p, tile.flyAt, tile.landAt));
      const a = tile.phase + t * 0.5 * idle + p * 4;
      tmpA.set(
        Math.cos(a) * 1.35 * orbitIn,
        0.8 + Math.sin(a * 2) * 0.12,
        0.8 + Math.sin(a) * 0.62 * orbitIn
      );
      tmpB.set(
        kid.mesh.position.x,
        kid.mesh.position.y + kid.h * 0.6,
        kid.mesh.position.z
      );
      tile.mesh.position.lerpVectors(tmpA, tmpB, fly);
      tile.mesh.scale.setScalar(Math.max(0.001, orbitIn * (1 - fly)));
      tile.mesh.visible = orbitIn > 0.01 && fly < 0.99;
      tile.mesh.lookAt(camera.position);
    }

    // The stand tilts the book up to the camera as the kids arrive, then a
    // page turns to the next chapter.
    const lift = ease(span(p, 0.36, 0.45));
    bookTilt.rotation.x = lerp(0.08, BOOK_TILT, lift);
    bookTilt.rotation.y = lerp(0.35, 0, lift);
    const turn = smooth(span(p, 0.485, 0.535));
    leaf.rotation.z = turn * Math.PI;
    // The turning leaf lifts and bows a little as it goes over.
    leaf.position.y = 0.003 + Math.sin(turn * Math.PI) * 0.03;
    bookLight.intensity =
      lerp(0, 22, span(p, 0.38, 0.46)) * (1 - span(p, 0.58, 0.64));
    // The strut runs from the back of the stand down to the table.
    strutFrom.set(0, -0.06, -D * 0.55);
    bookTilt.localToWorld(strutFrom);
    strutTo.set(BOOK.x, TABLE_Y + 0.01, strutFrom.z - 0.12);
    strut.position.lerpVectors(strutFrom, strutTo, 0.5);
    strut.scale.z = Math.max(0.01, strutFrom.distanceTo(strutTo));
    strut.lookAt(strutTo);
    strut.visible = lift > 0.05;

    // The poster lights up when the camera reaches the wall.
    posterLight.intensity = lerp(0, 40, span(p, 0.58, 0.66));

    // The garments sway on their hangers, out of step with each other.
    for (let i = 0; i < garments.length; i += 1) {
      const g = garments[i];
      g.rotation.z = Math.sin(t * 0.9 + i * 1.7) * 0.02 * idle;
      g.rotation.y = Math.sin(t * 0.6 + i * 2.1) * 0.05 * idle;
    }

    for (let i = 0; i < SPARKS; i += 1) {
      const [x, y, z, ph] = sparkSeed[i];
      sparkPos[i * 3] = x + Math.sin(t * 0.3 + ph) * 0.2 * idle;
      sparkPos[i * 3 + 1] = (y + t * 0.06 * idle) % 4.5;
      sparkPos[i * 3 + 2] = z;
    }
    sparkGeo.attributes.position.needsUpdate = true;
  };

  const resize = (w, h) => {
    const aspect = w / h;
    camera.aspect = aspect;
    camera.fov = aspect < 0.8 ? 50 : aspect < 1.2 ? 40 : 34;
    narrow = aspect < 0.8 ? 1 : aspect < 1.2 ? 0.5 : 0;
    scene.fog.near = 11 * (1 + 0.4 * narrow);
    scene.fog.far = 24 * (1 + 0.4 * narrow);
    if (aspect > 1.1) camera.setViewOffset(w, h, -w * 0.16, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.17, w, h);
    camera.updateProjectionMatrix();
  };

  const dispose = () => {
    geos.forEach((g) => g.dispose());
    mats.forEach((m) => m.dispose());
    texs.forEach((t) => t.dispose());
    envTexture.dispose();
    pmrem.dispose();
  };

  return { scene, camera, update, resize, dispose };
}
