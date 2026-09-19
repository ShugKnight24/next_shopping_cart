/**
 * The single source of truth for what a hero and a companion can look like.
 *
 * Both renderers — the live SVG portrait in `CharacterCreator` and the canvas
 * hero drawn by `CanvasEngine` — read their values from here. That is the point:
 * the previous split let the picker offer five collars, six coat colours, a pet
 * name and five badges that no renderer ever read, so a shopper could spend two
 * minutes dressing a companion and receive none of it on the printed page.
 *
 * Rule for adding an option: add it here, then wire BOTH renderers. An entry
 * that only one renderer honours is a bug, and `assertSchemaIsWired` in
 * `__tests__/characterSchema.test.js` is what catches it.
 */

/* ------------------------------------------------------------------ hero -- */

export const SKIN_TONES = [
  { value: '#fee9d4', name: 'Porcelain Rose', shadow: '#f3cdad' },
  { value: '#fed7aa', name: 'Porcelain Peach', shadow: '#eab68a' },
  { value: '#fbd38d', name: 'Honey Gold', shadow: '#e0b16b' },
  { value: '#f0b27a', name: 'Golden Apricot', shadow: '#d19660' },
  { value: '#e5a95d', name: 'Warm Sand', shadow: '#c48c45' },
  { value: '#d68c4a', name: 'Amber Clay', shadow: '#b3703a' },
  { value: '#d97706', name: 'Caramel Bronze', shadow: '#a85c05' },
  { value: '#b45f1f', name: 'Cinnamon', shadow: '#8c4715' },
  { value: '#92400e', name: 'Deep Chestnut', shadow: '#6f2f09' },
  { value: '#7a3410', name: 'Cocoa', shadow: '#58240b' },
  { value: '#5c2a0c', name: 'Mahogany', shadow: '#3f1c08' },
  { value: '#451a03', name: 'Rich Espresso', shadow: '#2c1002' },
];

export const HAIR_STYLES = [
  { id: 'crop', name: 'Short Crop' },
  { id: 'curls', name: 'Fluffy Curls' },
  { id: 'coils', name: 'Tight Coils' },
  { id: 'afro', name: 'Round Afro' },
  { id: 'waves', name: 'Long Waves' },
  { id: 'braids', name: 'Royal Braids' },
  { id: 'locs', name: 'Shoulder Locs' },
  { id: 'ponytail', name: 'High Ponytail' },
  { id: 'buns', name: 'Double Buns' },
  { id: 'bob', name: 'Neat Bob' },
  { id: 'spiky', name: 'Spiky Adventure' },
  { id: 'beanie', name: 'Starlight Beanie' },
];

/** Beanie is headwear over hair — its knit takes the beanie colour, the hair
 *  beneath still takes the hair colour. Both renderers must honour this. */
export const HAIR_STYLES_WITH_HEADWEAR = ['beanie'];

export const HAIR_COLORS = [
  { value: '#1c1917', name: 'Ebony Black' },
  { value: '#3f2a16', name: 'Dark Walnut' },
  { value: '#4a2c11', name: 'Chestnut Brown' },
  { value: '#8b5a2b', name: 'Warm Hazel' },
  { value: '#c68642', name: 'Light Caramel' },
  { value: '#fde047', name: 'Golden Sun' },
  { value: '#f5deb3', name: 'Platinum Wheat' },
  { value: '#ea580c', name: 'Auburn Red' },
  { value: '#b91c1c', name: 'Ruby Flame' },
  { value: '#ec4899', name: 'Pastel Rose' },
  { value: '#7c3aed', name: 'Nebula Violet' },
  { value: '#0284c7', name: 'Galactic Cyan' },
];

export const EYE_COLORS = [
  { value: '#1e293b', name: 'Slate Night' },
  { value: '#4a2c11', name: 'Warm Brown' },
  { value: '#78350f', name: 'Amber' },
  { value: '#166534', name: 'Forest Green' },
  { value: '#1d4ed8', name: 'Ocean Blue' },
  { value: '#0891b2', name: 'Aqua' },
  { value: '#6d28d9', name: 'Starlight Violet' },
  { value: '#9a3412', name: 'Copper' },
];

export const EYE_SHAPES = [
  { id: 'round', name: 'Round' },
  { id: 'almond', name: 'Almond' },
  { id: 'wide', name: 'Wide Wonder' },
  { id: 'sleepy', name: 'Gentle' },
  { id: 'sparkle', name: 'Star Sparkle' },
];

export const EXPRESSIONS = [
  { id: 'smile', name: 'Happy Smile' },
  { id: 'grin', name: 'Big Grin' },
  { id: 'calm', name: 'Calm' },
  { id: 'determined', name: 'Determined' },
  { id: 'surprised', name: 'Surprised' },
  { id: 'giggle', name: 'Giggling' },
];

export const BROWS = [
  { id: 'soft', name: 'Soft' },
  { id: 'bold', name: 'Bold' },
  { id: 'raised', name: 'Curious' },
  { id: 'none', name: 'Subtle' },
];

/** Accessories are slotted, not exclusive — a hero can wear specs AND a cape. */
export const FACE_ACCESSORIES = [
  { id: 'none', name: 'None' },
  { id: 'glasses', name: 'Round Specs' },
  { id: 'star_shades', name: 'Star Shades' },
  { id: 'superhero_mask', name: 'Hero Mask' },
  { id: 'eyepatch', name: 'Explorer Patch' },
  { id: 'snorkel', name: 'Snorkel Mask' },
];

export const HEAD_ACCESSORIES = [
  { id: 'none', name: 'None' },
  { id: 'crown', name: 'Royal Crown' },
  { id: 'astronaut_helmet', name: 'Astronaut Helmet' },
  { id: 'party_hat', name: 'Party Hat' },
  { id: 'headband', name: 'Star Headband' },
  { id: 'chef_hat', name: 'Chef Toque' },
];

export const BACK_ACCESSORIES = [
  { id: 'none', name: 'None' },
  { id: 'cape', name: 'Hero Cape' },
  { id: 'wings', name: 'Starlight Wings' },
  { id: 'backpack', name: 'Explorer Pack' },
  { id: 'jetpack', name: 'Rocket Pack' },
];

export const OUTFIT_STYLES = [
  { id: 'tee', name: 'Graphic Tee' },
  { id: 'hoodie', name: 'Cosy Hoodie' },
  { id: 'dungarees', name: 'Dungarees' },
  { id: 'dress', name: 'Twirl Dress' },
  { id: 'hero_suit', name: 'Hero Suit' },
  { id: 'space_suit', name: 'Space Suit' },
  { id: 'explorer', name: 'Explorer Vest' },
];

export const OUTFIT_COLORS = [
  { value: '#2563eb', name: 'Royal Blue' },
  { value: '#0ea5e9', name: 'Sky Cyan' },
  { value: '#dc2626', name: 'Ruby Crimson' },
  { value: '#f97316', name: 'Sunset Orange' },
  { value: '#d97706', name: 'Golden Ochre' },
  { value: '#facc15', name: 'Buttercup' },
  { value: '#059669', name: 'Emerald Pine' },
  { value: '#14b8a6', name: 'Lagoon Teal' },
  { value: '#7c3aed', name: 'Nebula Purple' },
  { value: '#ec4899', name: 'Bubblegum Pink' },
  { value: '#f8fafc', name: 'Cloud White' },
  { value: '#0f172a', name: 'Obsidian Black' },
];

export const OUTFIT_PATTERNS = [
  { id: 'solid', name: 'Solid' },
  { id: 'stripes', name: 'Stripes' },
  { id: 'stars', name: 'Stars' },
  { id: 'dots', name: 'Polka Dots' },
  { id: 'chevron', name: 'Chevron' },
];

export const FRECKLE_OPTIONS = [
  { id: 'none', name: 'None' },
  { id: 'cheeks', name: 'Cheek Freckles' },
  { id: 'nose', name: 'Nose Dusting' },
  { id: 'full', name: 'Full Sprinkle' },
];

export const BUILDS = [
  { id: 'small', name: 'Little', scale: 0.9 },
  { id: 'regular', name: 'Regular', scale: 1 },
  { id: 'tall', name: 'Tall', scale: 1.1 },
];

/* ------------------------------------------------------------- companion -- */

export const PET_FUR_COLORS = [
  { value: '#ea580c', name: 'Amber Red' },
  { value: '#f59e0b', name: 'Golden Honey' },
  { value: '#fbbf24', name: 'Sunbeam' },
  { value: '#ffffff', name: 'Snow White' },
  { value: '#d6d3d1', name: 'Silver Mist' },
  { value: '#78716c', name: 'Storm Grey' },
  { value: '#292524', name: 'Midnight Black' },
  { value: '#a855f7', name: 'Starlight Lavender' },
  { value: '#38bdf8', name: 'Sky Sprite' },
  { value: '#10b981', name: 'Emerald Dragon' },
];

export const PET_COLLARS = [
  { id: 'none', name: 'No Collar' },
  { id: 'star_bandana', name: 'Star Bandana' },
  { id: 'golden_bell', name: 'Golden Bell' },
  { id: 'explorer_scarf', name: 'Explorer Scarf' },
  { id: 'capelet', name: 'Tiny Capelet' },
  { id: 'bowtie', name: 'Dapper Bowtie' },
];

export const PET_COLLAR_COLORS = [
  { value: '#ef4444', name: 'Signal Red' },
  { value: '#f59e0b', name: 'Gold' },
  { value: '#22c55e', name: 'Clover' },
  { value: '#3b82f6', name: 'Cobalt' },
  { value: '#a855f7', name: 'Violet' },
  { value: '#0f172a', name: 'Ink' },
];

export const PET_POSES = [
  { id: 'sit', name: 'Sitting' },
  { id: 'stand', name: 'Standing Proud' },
  { id: 'leap', name: 'Mid-Leap' },
  { id: 'curl', name: 'Curled Up' },
];

export const PET_SIZES = [
  { id: 'tiny', name: 'Pocket-sized', scale: 0.75 },
  { id: 'regular', name: 'Regular', scale: 1 },
  { id: 'big', name: 'Big Buddy', scale: 1.3 },
];

/* ------------------------------------------------------------- defaults -- */

export const DEFAULT_AVATAR = {
  skin: '#fbd38d',
  hairStyle: 'curls',
  hairColor: '#4a2c11',
  beanieColor: '#0284c7',
  eyeColor: '#1e293b',
  eyeShape: 'round',
  expression: 'smile',
  brows: 'soft',
  freckles: 'none',
  faceAccessory: 'none',
  headAccessory: 'none',
  backAccessory: 'cape',
  outfitStyle: 'tee',
  outfitColor: '#2563eb',
  outfitAccentColor: '#facc15',
  outfitPattern: 'solid',
  build: 'regular',
};

export const DEFAULT_COMPANION = {
  species: 'leo',
  name: 'Leo',
  furColor: '#ea580c',
  collar: 'star_bandana',
  collarColor: '#ef4444',
  badge: 'badge_hero',
  pose: 'sit',
  size: 'regular',
};

/**
 * Older saved designs, share links and the v1 `StorybookStudio` state used a
 * different key for half of these (`hairstyle`, `hair`, `outfit`, `accessory`).
 * Resolve once, here, so no renderer has to know about the aliases.
 */
export const normalizeAvatar = (avatar = {}) => {
  const legacyAccessory = avatar.accessory;

  return {
    ...DEFAULT_AVATAR,
    ...avatar,
    hairStyle: avatar.hairStyle ?? avatar.hairstyle ?? DEFAULT_AVATAR.hairStyle,
    hairColor: avatar.hairColor ?? avatar.hair ?? DEFAULT_AVATAR.hairColor,
    outfitColor:
      avatar.outfitColor ?? avatar.outfit ?? DEFAULT_AVATAR.outfitColor,
    // v1 had one exclusive `accessory` slot mixing face, head and back items.
    faceAccessory:
      avatar.faceAccessory ??
      (isIn(FACE_ACCESSORIES, legacyAccessory) ? legacyAccessory : null) ??
      (legacyAccessory === 'freckles' ? 'none' : null) ??
      DEFAULT_AVATAR.faceAccessory,
    headAccessory:
      avatar.headAccessory ??
      (isIn(HEAD_ACCESSORIES, legacyAccessory) ? legacyAccessory : null) ??
      DEFAULT_AVATAR.headAccessory,
    backAccessory:
      avatar.backAccessory ??
      (isIn(BACK_ACCESSORIES, legacyAccessory) ? legacyAccessory : null) ??
      DEFAULT_AVATAR.backAccessory,
    freckles:
      avatar.freckles ??
      (legacyAccessory === 'freckles' ? 'cheeks' : DEFAULT_AVATAR.freckles),
  };
};

export const normalizeCompanion = (companion = {}) => ({
  ...DEFAULT_COMPANION,
  ...companion,
  species: SPECIES_ALIASES[companion.species] ?? companion.species ?? 'leo',
});

/** v1 stored generic species words; the catalog uses mascot names. */
export const SPECIES_ALIASES = {
  dog: 'luna',
  cat: 'penny',
  fox: 'finley',
  lion: 'leo',
  dino: 'dexter',
  robot: 'carty',
  dragon: 'sparky',
};

/* --------------------------------------------------------------- lookups -- */

const isIn = (table, id) => (id && table.some((o) => o.id === id) ? id : null);

export const findByValue = (table, value, fallbackIndex = 0) =>
  table.find((o) => o.value === value) ?? table[fallbackIndex];

export const findById = (table, id, fallbackIndex = 0) =>
  table.find((o) => o.id === id) ?? table[fallbackIndex];

/** Shade a hex colour for shadows and folds. `amount` < 0 darkens. */
export const shade = (hex, amount) => {
  const normalized = hex?.replace('#', '') ?? '000000';
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;

  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return hex;

  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  const r = clamp(((num >> 16) & 255) * (1 + amount));
  const g = clamp(((num >> 8) & 255) * (1 + amount));
  const b = clamp((num & 255) * (1 + amount));

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

/** Readable ink over an arbitrary garment colour. */
export const contrastInk = (hex) => {
  const normalized = hex?.replace('#', '') ?? '000000';
  const num = parseInt(
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized,
    16
  );
  if (Number.isNaN(num)) return '#0f172a';

  const luminance =
    (0.299 * ((num >> 16) & 255) +
      0.587 * ((num >> 8) & 255) +
      0.114 * (num & 255)) /
    255;

  return luminance > 0.6 ? '#0f172a' : '#f8fafc';
};

/**
 * Every option group, in the order the editor presents them. Used to drive the
 * picker, the randomizer and the order summary without restating the list.
 */
export const CHARACTER_GROUPS = [
  { key: 'skin', label: 'Skin Tone', table: SKIN_TONES, kind: 'swatch' },
  { key: 'hairStyle', label: 'Hairstyle', table: HAIR_STYLES, kind: 'pill' },
  {
    key: 'hairColor',
    label: 'Hair Colour',
    table: HAIR_COLORS,
    kind: 'swatch',
  },
  { key: 'eyeShape', label: 'Eye Shape', table: EYE_SHAPES, kind: 'pill' },
  { key: 'eyeColor', label: 'Eye Colour', table: EYE_COLORS, kind: 'swatch' },
  { key: 'brows', label: 'Eyebrows', table: BROWS, kind: 'pill' },
  { key: 'expression', label: 'Expression', table: EXPRESSIONS, kind: 'pill' },
  { key: 'freckles', label: 'Freckles', table: FRECKLE_OPTIONS, kind: 'pill' },
  {
    key: 'faceAccessory',
    label: 'Eyewear',
    table: FACE_ACCESSORIES,
    kind: 'pill',
  },
  {
    key: 'headAccessory',
    label: 'Headwear',
    table: HEAD_ACCESSORIES,
    kind: 'pill',
  },
  {
    key: 'backAccessory',
    label: 'On Their Back',
    table: BACK_ACCESSORIES,
    kind: 'pill',
  },
  { key: 'outfitStyle', label: 'Outfit', table: OUTFIT_STYLES, kind: 'pill' },
  {
    key: 'outfitColor',
    label: 'Outfit Colour',
    table: OUTFIT_COLORS,
    kind: 'swatch',
  },
  {
    key: 'outfitPattern',
    label: 'Pattern',
    table: OUTFIT_PATTERNS,
    kind: 'pill',
  },
  {
    key: 'outfitAccentColor',
    label: 'Accent Colour',
    table: OUTFIT_COLORS,
    kind: 'swatch',
  },
  { key: 'build', label: 'Height', table: BUILDS, kind: 'pill' },
];

export const COMPANION_GROUPS = [
  {
    key: 'furColor',
    label: 'Coat Colour',
    table: PET_FUR_COLORS,
    kind: 'swatch',
  },
  { key: 'collar', label: 'Collar', table: PET_COLLARS, kind: 'pill' },
  {
    key: 'collarColor',
    label: 'Collar Colour',
    table: PET_COLLAR_COLORS,
    kind: 'swatch',
  },
  { key: 'pose', label: 'Pose', table: PET_POSES, kind: 'pill' },
  { key: 'size', label: 'Size', table: PET_SIZES, kind: 'pill' },
];

const pick = (table) => table[Math.floor(Math.random() * table.length)];

/** "Surprise me" — every group randomized from the same tables the picker shows. */
export const randomAvatar = () =>
  CHARACTER_GROUPS.reduce(
    (acc, group) => {
      const choice = pick(group.table);
      acc[group.key] = choice.value ?? choice.id;
      return acc;
    },
    { ...DEFAULT_AVATAR }
  );

export const randomCompanion = (species) =>
  COMPANION_GROUPS.reduce(
    (acc, group) => {
      const choice = pick(group.table);
      acc[group.key] = choice.value ?? choice.id;
      return acc;
    },
    { ...DEFAULT_COMPANION, species: species ?? DEFAULT_COMPANION.species }
  );

/** Order-sheet lines. Every visible choice must survive into the cart. */
export const describeCharacter = (avatar, companion) => {
  const a = normalizeAvatar(avatar);
  const c = normalizeCompanion(companion);

  const name = (table, key, byValue) =>
    (byValue ? findByValue(table, a[key]) : findById(table, a[key]))?.name ??
    '—';

  return {
    Skin: name(SKIN_TONES, 'skin', true),
    Hair: `${name(HAIR_STYLES, 'hairStyle')} in ${name(HAIR_COLORS, 'hairColor', true)}`,
    Eyes: `${name(EYE_SHAPES, 'eyeShape')}, ${name(EYE_COLORS, 'eyeColor', true)}`,
    Expression: name(EXPRESSIONS, 'expression'),
    Freckles: name(FRECKLE_OPTIONS, 'freckles'),
    Outfit: `${name(OUTFIT_STYLES, 'outfitStyle')} — ${name(OUTFIT_COLORS, 'outfitColor', true)}, ${name(OUTFIT_PATTERNS, 'outfitPattern')}`,
    Accessories:
      [
        findById(FACE_ACCESSORIES, a.faceAccessory)?.name,
        findById(HEAD_ACCESSORIES, a.headAccessory)?.name,
        findById(BACK_ACCESSORIES, a.backAccessory)?.name,
      ]
        .filter((n) => n && n !== 'None')
        .join(', ') || 'None',
    Companion: `${c.name} the ${c.species}`,
    'Companion Coat': findByValue(PET_FUR_COLORS, c.furColor)?.name ?? '—',
    'Companion Collar': findById(PET_COLLARS, c.collar)?.name ?? '—',
    'Companion Pose': findById(PET_POSES, c.pose)?.name ?? '—',
  };
};
