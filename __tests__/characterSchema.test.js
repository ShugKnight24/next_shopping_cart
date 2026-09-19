import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BACK_ACCESSORIES,
  BROWS,
  BUILDS,
  CHARACTER_GROUPS,
  COMPANION_GROUPS,
  DEFAULT_AVATAR,
  DEFAULT_COMPANION,
  EXPRESSIONS,
  EYE_SHAPES,
  FACE_ACCESSORIES,
  FRECKLE_OPTIONS,
  HAIR_STYLES,
  HEAD_ACCESSORIES,
  OUTFIT_PATTERNS,
  OUTFIT_STYLES,
  PET_COLLARS,
  PET_POSES,
  PET_SIZES,
  contrastInk,
  describeCharacter,
  findById,
  normalizeAvatar,
  normalizeCompanion,
  randomAvatar,
  shade,
} from '../Components/Studio/core/characterSchema';

const root = join(__dirname, '..', 'Components', 'Studio');
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8');

/**
 * The bug this whole module exists to prevent is the pickable-but-invisible
 * option: a choice the editor offers that no renderer reads. It shipped that
 * way once — five collars, six coat colours, five badges and the companion's
 * name were all selectable and none of them reached the printed page.
 *
 * There are two renderers, and an option must be honoured by both: the SVG
 * portraits in `CharacterPortraits`, and the canvas art in `drawCharacter`.
 * Checking that each option's id appears as a literal in both sources is crude,
 * but it catches the exact regression: adding a table entry and wiring only one
 * side, or neither.
 */
const RENDERERS = [
  ['drawCharacter.js', read('drawCharacter.js')],
  ['CharacterPortraits.jsx', read('CharacterPortraits.jsx')],
];

/**
 * Tables whose entries are branched on by id. A renderer may reference an id as
 * a quoted literal (`case 'braids':`) or as an unquoted object key in a lookup
 * table (`POSE_TRANSFORM = { sit: … }`) — both count as wired.
 */
const ID_TABLES = {
  HAIR_STYLES,
  EYE_SHAPES,
  EXPRESSIONS,
  BROWS,
  FRECKLE_OPTIONS,
  FACE_ACCESSORIES,
  HEAD_ACCESSORIES,
  BACK_ACCESSORIES,
  OUTFIT_STYLES,
  OUTFIT_PATTERNS,
  PET_COLLARS,
  PET_POSES,
};

/**
 * Tables consumed numerically (`findById(BUILDS, x).scale`) rather than
 * branched on. Their ids never appear in a renderer, so they get the check that
 * actually matters for them: every entry carries a usable scale.
 */
const SCALE_TABLES = { BUILDS, PET_SIZES };

/** The default is allowed to live in a `default:` / else branch, unnamed. */
const DEFAULTS = { ...DEFAULT_AVATAR, ...DEFAULT_COMPANION };

const isWired = (source, id) =>
  source.includes(`'${id}'`) ||
  source.includes(`"${id}"`) ||
  new RegExp(`\\b${id}\\s*:`).test(source);

describe('character schema is wired to both renderers', () => {
  Object.entries(ID_TABLES).forEach(([tableName, table]) => {
    RENDERERS.forEach(([rendererName, source]) => {
      it(`${rendererName} handles every ${tableName} option`, () => {
        const missing = table
          .map((option) => option.id)
          // 'none' is an absence, expressed by drawing nothing.
          .filter((id) => id !== 'none')
          .filter((id) => !Object.values(DEFAULTS).includes(id))
          .filter((id) => !isWired(source, id));

        expect(missing).toEqual([]);
      });
    });
  });

  Object.entries(SCALE_TABLES).forEach(([tableName, table]) => {
    it(`${tableName} entries all carry a numeric scale`, () => {
      table.forEach((option) => {
        expect(typeof option.scale, `${tableName}.${option.id}`).toBe('number');
        expect(option.scale).toBeGreaterThan(0);
      });
    });
  });
});

describe('schema option tables', () => {
  it('has unique ids or values within every group', () => {
    [...CHARACTER_GROUPS, ...COMPANION_GROUPS].forEach(({ key, table }) => {
      const keys = table.map((o) => o.id ?? o.value);
      expect(new Set(keys).size, `duplicate entry in ${key}`).toBe(keys.length);
    });
  });

  it('gives every option a human-readable name', () => {
    [...CHARACTER_GROUPS, ...COMPANION_GROUPS].forEach(({ key, table }) => {
      table.forEach((option) => {
        expect(option.name, `unnamed option in ${key}`).toBeTruthy();
      });
    });
  });

  it('defaults to a value that exists in its own table', () => {
    CHARACTER_GROUPS.forEach(({ key, table }) => {
      const fallback = DEFAULT_AVATAR[key];
      const found = table.some((o) => (o.id ?? o.value) === fallback);
      expect(
        found,
        `DEFAULT_AVATAR.${key} = ${fallback} is not in its table`
      ).toBe(true);
    });

    COMPANION_GROUPS.forEach(({ key, table }) => {
      const fallback = DEFAULT_COMPANION[key];
      const found = table.some((o) => (o.id ?? o.value) === fallback);
      expect(
        found,
        `DEFAULT_COMPANION.${key} = ${fallback} is not in its table`
      ).toBe(true);
    });
  });
});

describe('normalizeAvatar', () => {
  it('resolves the v1 alias keys', () => {
    const avatar = normalizeAvatar({
      hairstyle: 'braids',
      hair: '#1c1917',
      outfit: '#dc2626',
    });

    expect(avatar.hairStyle).toBe('braids');
    expect(avatar.hairColor).toBe('#1c1917');
    expect(avatar.outfitColor).toBe('#dc2626');
  });

  it('routes a v1 exclusive accessory into the slot it belongs to', () => {
    expect(normalizeAvatar({ accessory: 'glasses' }).faceAccessory).toBe(
      'glasses'
    );
    expect(normalizeAvatar({ accessory: 'crown' }).headAccessory).toBe('crown');
    expect(normalizeAvatar({ accessory: 'cape' }).backAccessory).toBe('cape');
  });

  it('turns the old freckles accessory into the freckles option', () => {
    const avatar = normalizeAvatar({ accessory: 'freckles' });
    expect(avatar.freckles).toBe('cheeks');
    expect(avatar.faceAccessory).toBe('none');
  });

  it('fills every missing key from the default', () => {
    expect(normalizeAvatar({})).toEqual(DEFAULT_AVATAR);
    expect(normalizeAvatar(undefined)).toEqual(DEFAULT_AVATAR);
  });
});

describe('normalizeCompanion', () => {
  it('maps generic v1 species words onto mascot ids', () => {
    expect(normalizeCompanion({ species: 'dog' }).species).toBe('luna');
    expect(normalizeCompanion({ species: 'dragon' }).species).toBe('sparky');
  });

  it('leaves an already-current species alone', () => {
    expect(normalizeCompanion({ species: 'penny' }).species).toBe('penny');
  });
});

describe('colour helpers', () => {
  it('darkens and lightens without leaving the hex range', () => {
    expect(shade('#808080', -0.5)).toBe('#404040');
    expect(shade('#ffffff', 0.5)).toBe('#ffffff');
    expect(shade('#000000', -0.5)).toBe('#000000');
  });

  it('expands three-digit hex', () => {
    expect(shade('#fff', 0)).toBe('#ffffff');
  });

  it('picks readable ink for light and dark garments', () => {
    expect(contrastInk('#f8fafc')).toBe('#0f172a');
    expect(contrastInk('#0f172a')).toBe('#f8fafc');
  });
});

describe('describeCharacter', () => {
  it('names every choice, including the ones that used to be dropped', () => {
    const lines = describeCharacter(DEFAULT_AVATAR, DEFAULT_COMPANION);

    expect(lines['Companion Coat']).toBeTruthy();
    expect(lines['Companion Collar']).toBeTruthy();
    expect(lines['Companion Pose']).toBeTruthy();
    expect(lines.Eyes).toBeTruthy();
    expect(lines.Expression).toBeTruthy();
    expect(Object.values(lines)).not.toContain('—');
  });
});

describe('randomAvatar', () => {
  it('only ever picks values the picker also offers', () => {
    for (let i = 0; i < 40; i += 1) {
      const avatar = randomAvatar();
      CHARACTER_GROUPS.forEach(({ key, table }) => {
        const found = table.some((o) => (o.id ?? o.value) === avatar[key]);
        expect(found, `randomAvatar produced an unknown ${key}`).toBe(true);
      });
    }
  });
});

describe('findById', () => {
  it('falls back to the first entry rather than returning undefined', () => {
    expect(findById(HAIR_STYLES, 'not-a-style')).toBe(HAIR_STYLES[0]);
  });
});
