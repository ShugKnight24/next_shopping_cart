import { contrastInk, shade } from './core/characterSchema';

/**
 * The vector stamp library, extracted verbatim out of `CanvasEngine`'s old
 * `drawSticker` callback so the workbench can paint art layers too.
 *
 * Every stamp is hand-coded Canvas2D drawn around the origin inside a nominal
 * 48x48 design box — that box is what the editor's selection chrome has always
 * framed, so it is the unit the `size` argument scales. A few stamps bleed a
 * little past it on purpose (fennec ears, planetary rings); that overhang is
 * part of the artwork and is preserved.
 *
 * Pure module: no React, no canvas ownership, no knowledge of the editor. The
 * caller owns translate / rotate / scale.
 */

/** The coordinate box every stamp is authored in. */
const DESIGN_BOX = 48;

/* Hoisted out of the switch so the hot path allocates nothing per call. */
const RAINBOW_BANDS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
const SAFARI_HAT_RADII = [5, 5, 0, 0];

export const STAMP_IDS = [
  'mascot_luna',
  'mascot_finley',
  'mascot_leo',
  'mascot_penny',
  'mascot_dexter',
  'mascot_carty',
  'mascot_sparky',
  'badge_hero',
  'badge_brave',
  'badge_starlight',
  'badge_certified',
  'badge_dino_scout',
  'bubble',
  'rose',
  'compass',
  'magic_wand',
  'treasure_chest',
  'planet',
  'castle',
  'spaceship',
  'crystal',
  'mushroom',
  'rainbow',
  'dragon_egg',
  'star',
  'rocket',
  'crown',
  'sneaker',
  'sparkle',
  'heart',
];

/**
 * Grouping for the workbench asset browser. Membership mirrors the catalog in
 * the workbench asset browser so categories stay stable as stamps are added.
 */
export const STAMP_CATEGORIES = [
  {
    id: 'companions',
    name: 'Companions',
    stamps: [
      'mascot_luna',
      'mascot_finley',
      'mascot_leo',
      'mascot_penny',
      'mascot_dexter',
      'mascot_carty',
      'mascot_sparky',
    ],
  },
  {
    id: 'badges',
    name: 'Badges',
    stamps: [
      'badge_hero',
      'badge_brave',
      'badge_starlight',
      'badge_certified',
      'badge_dino_scout',
    ],
  },
  {
    id: 'props',
    name: 'Props',
    stamps: [
      'bubble',
      'rose',
      'compass',
      'magic_wand',
      'treasure_chest',
      'planet',
      'castle',
      'spaceship',
      'crystal',
      'mushroom',
      'rainbow',
      'dragon_egg',
    ],
  },
  {
    id: 'stamps',
    name: 'Stamps',
    stamps: ['star', 'rocket', 'crown', 'sneaker', 'sparkle', 'heart'],
  },
];

/**
 * Stamps that honour `tint`. The rest are identity-coloured — a rainbow is its
 * bands, Luna is her fawn-and-navy markings, the certified seal is gold — and
 * silently ignore it. The inspector reads this list so it can hide a tint
 * control that would do nothing rather than offer a dead knob.
 */
export const TINTABLE_STAMPS = [
  'badge_hero',
  'badge_brave',
  'badge_starlight',
  'badge_dino_scout',
  'bubble',
  'magic_wand',
  'castle',
  'spaceship',
  'crystal',
  'mushroom',
  'dragon_egg',
  'star',
  'rocket',
  'crown',
  'sneaker',
  'sparkle',
  'heart',
];

/** Is a tint control meaningful for this stamp? */
export function isTintable(type) {
  return TINTABLE_STAMPS.indexOf(type) !== -1;
}

/**
 * Draw a stamp centred on the current canvas origin.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} options
 * @param {string} options.type    stamp id, see `STAMP_IDS`
 * @param {number} [options.size]  edge of the box the artwork fits (default 48)
 * @param {string} [options.tint]  hex recolour for the primary body, or null
 * @param {boolean} [options.flipX] mirror the artwork horizontally
 * @param {string} [options.text]  caption, used by the `bubble` stamp
 */
export function drawStamp(
  ctx,
  { type, size = DESIGN_BOX, tint = null, flipX = false, text = null }
) {
  // Derived once per call, and only when a tint is actually in play, so the
  // untinted path stays byte-identical to the original inline switch.
  const body = tint || null;
  const bodyDark = tint ? shade(tint, -0.25) : null;
  const bodyDeep = tint ? shade(tint, -0.45) : null;
  const bodyLight = tint ? shade(tint, 0.35) : null;

  ctx.save();

  // Leave the matrix untouched at the authored size — no rounding drift.
  if (size !== DESIGN_BOX) {
    const s = size / DESIGN_BOX;
    ctx.scale(s, s);
  }
  if (flipX) {
    ctx.scale(-1, 1);
  }

  switch (type) {
    case 'mascot_luna': {
      // Luna The Cosmic Shepherd Astronaut Mascot Sticker
      // Astronaut spacesuit
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-16, 4, 32, 22, 6);
      ctx.fill();
      ctx.stroke();

      // Navy suit shoulder pads & chest trim
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-16, 6, 5, 12);
      ctx.fillRect(11, 6, 5, 12);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-6, 8, 12, 3);

      // Gold collar star badge
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 15, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Anatolian curled astronaut tail
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(14, 18, 7, 0, Math.PI * 1.5, true);
      ctx.stroke();
      ctx.lineCap = 'butt';

      // Shepherd Head & Muzzle
      ctx.fillStyle = '#e5a95d'; // Warm Anatolian fawn fur
      ctx.beginPath();
      ctx.arc(0, -5, 14, 0, Math.PI * 2);
      ctx.fill();

      // Dark charcoal muzzle mask
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.ellipse(0, -2, 7, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Distinctive pink nose leather blaze
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.ellipse(0, -4, 2, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nose tip & mouth
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(0, -3, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Loving amber eyes
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(-4.5, -8, 1.8, 0, Math.PI * 2);
      ctx.arc(4.5, -8, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, -8.5, 0.7, 0, Math.PI * 2);
      ctx.arc(5, -8.5, 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Anatolian folded drop ears
      ctx.fillStyle = '#b47834';
      ctx.beginPath();
      ctx.ellipse(-13, -8, 4, 7, -0.3, 0, Math.PI * 2);
      ctx.ellipse(13, -8, 4, 7, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Cosmic glass bubble helmet
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -5, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Helmet shine reflection
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -5, 16, -2.4, -1.4);
      ctx.stroke();
      break;
    }
    case 'mascot_finley': {
      // Finley The Starlight Fox Mascot Sticker
      // Celestial bushy tail with snowy white tip
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(14, 10, 8, 15, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(17, 2, 5, 0, Math.PI * 2);
      ctx.fill();

      // Amber body
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.roundRect(-10, 4, 20, 18, 6);
      ctx.fill();

      // Cream chest ruff
      ctx.fillStyle = '#fff7ed';
      ctx.beginPath();
      ctx.ellipse(0, 10, 6, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Flowing celestial sky-blue scarf with gold stars
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(-12, 1, 24, 7, 3.5);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(6, 6);
      ctx.lineTo(13, 17);
      ctx.lineTo(7, 18);
      ctx.lineTo(2, 7);
      ctx.closePath();
      ctx.fill();

      // Scarf golden star pins
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(-5, 4.5, 1.2, 0, Math.PI * 2);
      ctx.arc(2, 4.5, 1.2, 0, Math.PI * 2);
      ctx.arc(9, 12, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Large pointed fennec ears
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(-12, -8);
      ctx.lineTo(-18, -26);
      ctx.lineTo(-4, -12);
      ctx.closePath();
      ctx.moveTo(12, -8);
      ctx.lineTo(18, -26);
      ctx.lineTo(4, -12);
      ctx.closePath();
      ctx.fill();

      // Ear interior cream fluff
      ctx.fillStyle = '#fff7ed';
      ctx.beginPath();
      ctx.moveTo(-11, -9);
      ctx.lineTo(-16, -22);
      ctx.lineTo(-5, -12);
      ctx.closePath();
      ctx.moveTo(11, -9);
      ctx.lineTo(16, -22);
      ctx.lineTo(5, -12);
      ctx.closePath();
      ctx.fill();

      // Fox Head
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(0, -7, 13, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cheeks white fluff
      ctx.fillStyle = '#fff7ed';
      ctx.beginPath();
      ctx.ellipse(-8, -4, 5, 4, -0.2, 0, Math.PI * 2);
      ctx.ellipse(8, -4, 5, 4, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Muzzle & tiny dark nose
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(0, -4, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Soulful celestial eyes
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(-4.5, -9, 1.6, 2.2, 0, 0, Math.PI * 2);
      ctx.ellipse(4.5, -9, 1.6, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(-4, -9.5, 0.8, 0, Math.PI * 2);
      ctx.arc(5, -9.5, 0.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'mascot_leo': {
      // Leo The Story Lion Mascot Sticker
      // Fluffy sunburst mane
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const r = 21;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        const rInner = 16;
        const nextAngle = angle + Math.PI / 12;
        ctx.lineTo(Math.cos(nextAngle) * rInner, Math.sin(nextAngle) * rInner);
      }
      ctx.closePath();
      ctx.fill();

      // Golden Lion Face
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 1, 13, 0, Math.PI * 2);
      ctx.fill();

      // Round lion ears
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(-11, -9, 4, 0, Math.PI * 2);
      ctx.arc(11, -9, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(-11, -9, 2, 0, Math.PI * 2);
      ctx.arc(11, -9, 2, 0, Math.PI * 2);
      ctx.fill();

      // Tilted red artist beret
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(-4, -13, 10, 4.5, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-6, -18, 1.5, 3); // Beret stem

      // Lion muzzle & nose
      ctx.fillStyle = '#fffbeb';
      ctx.beginPath();
      ctx.ellipse(0, 5, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(0, 3, 2.2, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cute smiling mouth
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(-2, 6, 2, 0.2, Math.PI * 0.9);
      ctx.arc(2, 6, 2, 0.1, Math.PI * 0.8);
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(-4.5, 0, 1.8, 0, Math.PI * 2);
      ctx.arc(4.5, 0, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'mascot_penny': {
      // Princess Penny Fairytale Mascot Sticker
      // Blonde curls
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(-10, -3, 7, 0, Math.PI * 2);
      ctx.arc(10, -3, 7, 0, Math.PI * 2);
      ctx.arc(0, -6, 12, 0, Math.PI * 2);
      ctx.fill();

      // Face
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Rosy blush cheeks
      ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
      ctx.beginPath();
      ctx.arc(-5.5, 3, 2.2, 0, Math.PI * 2);
      ctx.arc(5.5, 3, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Royal Tiara
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-9, -7);
      ctx.lineTo(-5, -14);
      ctx.lineTo(0, -9);
      ctx.lineTo(5, -14);
      ctx.lineTo(9, -7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tiara Ruby
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -10, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Purple eyes & sweet smile
      ctx.fillStyle = '#4c1d95';
      ctx.beginPath();
      ctx.arc(-3.5, 0, 1.4, 0, Math.PI * 2);
      ctx.arc(3.5, 0, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#db2777';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 3.5, 2.5, 0.1, Math.PI - 0.1);
      ctx.stroke();

      // Magic starlight sparkles around tiara
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(-14, -12, 1.5, 0, Math.PI * 2);
      ctx.arc(14, -12, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'mascot_dexter': {
      // Dexter The Dino Explorer Mascot Sticker
      // Green dino body & tail
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(-12, 2, 24, 18, 6);
      ctx.fill();

      // Spikes on back
      ctx.fillStyle = '#059669';
      ctx.beginPath();
      ctx.moveTo(10, 4);
      ctx.lineTo(16, 7);
      ctx.lineTo(10, 10);
      ctx.moveTo(10, 12);
      ctx.lineTo(17, 15);
      ctx.lineTo(10, 18);
      ctx.fill();

      // Dino head
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.ellipse(0, -6, 12, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lighter snout
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.ellipse(0, -3, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Nostrils & eyes
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.arc(-2, -4, 1, 0, Math.PI * 2);
      ctx.arc(2, -4, 1, 0, Math.PI * 2);
      ctx.arc(-4.5, -9, 1.8, 0, Math.PI * 2);
      ctx.arc(4.5, -9, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, -9.5, 0.7, 0, Math.PI * 2);
      ctx.arc(5, -9.5, 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Safari Explorer Hat
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(0, -13, 14, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(-7, -19, 14, 8, SAFARI_HAT_RADII);
      ctx.fill();

      // Hat band
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-7, -15, 14, 2);
      break;
    }
    case 'mascot_carty': {
      // Carty The Courier Bot Mascot Sticker
      // Head Chassis
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-14, -10, 28, 22, 6);
      ctx.fill();
      ctx.stroke();

      // Antenna with glowing beacon
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, -18);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -19, 3, 0, Math.PI * 2);
      ctx.fill();

      // Dark Visor
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-10, -6, 20, 12, 3);
      ctx.fill();

      // Glowing Cyan Eyes
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(-4.5, 0, 2.2, 0, Math.PI * 2);
      ctx.arc(4.5, 0, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Ear bolts
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-17, -4, 3, 8);
      ctx.fillRect(14, -4, 3, 8);
      break;
    }
    case 'mascot_sparky': {
      // Sparky The Sneaker Hound Mascot Sticker
      // Hound Head
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Floppy ears
      ctx.fillStyle = '#c2410c';
      ctx.beginPath();
      ctx.ellipse(-12, 1, 4, 7, -0.3, 0, Math.PI * 2);
      ctx.ellipse(12, 1, 4, 7, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Backwards Red Cap
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, -4, 12, Math.PI, 0, false);
      ctx.fill();
      ctx.fillRect(-8, -13, 16, 3);

      // Dark Sunglasses
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-10, -3, 9, 6, 2);
      ctx.roundRect(1, -3, 9, 6, 2);
      ctx.fill();

      // Sunglass shine
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-8, -1);
      ctx.lineTo(-3, -1);
      ctx.moveTo(3, -1);
      ctx.lineTo(8, -1);
      ctx.stroke();

      // Muzzle & nose
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.ellipse(0, 5, 5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(0, 3.5, 1.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'badge_hero': {
      // Story Hero Star Shield Badge
      ctx.fillStyle = body || '#1e40af';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-18, -18);
      ctx.lineTo(18, -18);
      ctx.lineTo(18, 4);
      ctx.quadraticCurveTo(18, 20, 0, 26);
      ctx.quadraticCurveTo(-18, 20, -18, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Center 5-Point Star
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(
          Math.cos(((18 + i * 72) * Math.PI) / 180) * 9,
          -3 - Math.sin(((18 + i * 72) * Math.PI) / 180) * 9
        );
        ctx.lineTo(
          Math.cos(((54 + i * 72) * Math.PI) / 180) * 4,
          -3 - Math.sin(((54 + i * 72) * Math.PI) / 180) * 4
        );
      }
      ctx.closePath();
      ctx.fill();

      // "HERO" Banner
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-14, 8, 28, 9);
      ctx.fillStyle = body || '#1e40af';
      ctx.font = 'bold 7px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HERO', 0, 15);
      break;
    }
    case 'badge_brave': {
      // Brave Heart Crest Badge
      // Golden laurels
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-14, 0, 12, 0.4, 2.7);
      ctx.arc(14, 0, 12, 0.4, 2.7, true);
      ctx.stroke();

      // Heart
      ctx.fillStyle = body || '#ef4444';
      ctx.beginPath();
      ctx.arc(-6, -2, 6, Math.PI, 0, false);
      ctx.arc(6, -2, 6, Math.PI, 0, false);
      ctx.lineTo(0, 14);
      ctx.closePath();
      ctx.fill();

      // Mini gold crown on heart
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-7, -5);
      ctx.lineTo(-8, -12);
      ctx.lineTo(-3, -8);
      ctx.lineTo(0, -14);
      ctx.lineTo(3, -8);
      ctx.lineTo(8, -12);
      ctx.lineTo(7, -5);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'badge_starlight': {
      // Starlight Constellation Medallion
      ctx.fillStyle = body || '#0f172a';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner glowing starlight ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.stroke();

      // 8-Point Compass Star
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? 12 : 4;
        const a = (i * Math.PI) / 4;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();

      // Central cyan gem
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'badge_certified': {
      // Official Archival Seal Badge with ribbons
      // Ribbon tails
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-8, 12);
      ctx.lineTo(-12, 26);
      ctx.lineTo(-6, 22);
      ctx.lineTo(0, 26);
      ctx.lineTo(-3, 14);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(8, 12);
      ctx.lineTo(12, 26);
      ctx.lineTo(6, 22);
      ctx.lineTo(0, 26);
      ctx.lineTo(3, 14);
      ctx.fill();

      // Serrated Gold Medallion
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI) / 8;
        const r = i % 2 === 0 ? 19 : 16;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner seal circle
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef3c7';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PROOF', 0, 2);
      break;
    }
    case 'badge_dino_scout': {
      // Dino Scout Explorer Badge
      ctx.fillStyle = body || '#064e3b';
      ctx.strokeStyle = bodyLight || '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        ctx.lineTo(Math.cos(angle) * 19, Math.sin(angle) * 19);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 3-Toed Dino Footprint
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(0, 2, 4.5, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(-5, -6, 2.5, 4.5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(0, -8, 2.5, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(5, -6, 2.5, 4.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'bubble': {
      // Interactive Storybook Speech Bubble
      const caption = text || 'Adventure time!';
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      const textWidth = ctx.measureText ? ctx.measureText(caption).width : 60;
      const bWidth = Math.max(70, textWidth + 24);
      const bHeight = 32;

      // Draw bubble body
      ctx.fillStyle = body || '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-bWidth / 2, -bHeight / 2 - 4, bWidth, bHeight, 10);
      ctx.fill();
      ctx.stroke();

      // Speech pointer tail
      ctx.fillStyle = body || '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-10, bHeight / 2 - 4);
      ctx.lineTo(-18, bHeight / 2 + 10);
      ctx.lineTo(-2, bHeight / 2 - 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Patch inner tail seam
      ctx.fillStyle = body || '#ffffff';
      ctx.fillRect(-10, bHeight / 2 - 6, 9, 3);

      // Draw Speech Bubble Text
      ctx.fillStyle = tint ? contrastInk(tint) : '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (flipX) {
        // The caption stays readable when the artwork is mirrored.
        ctx.save();
        ctx.scale(-1, 1);
        ctx.fillText(caption, 0, -4);
        ctx.restore();
      } else {
        ctx.fillText(caption, 0, -4);
      }
      break;
    }
    case 'rose': {
      // Antoine de Saint-Exupéry's Celestial Rose Under Glass
      // Mahogany base
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(0, 16, 16, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glass cloche dome
      ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -2, 13, Math.PI, 0, false);
      ctx.lineTo(13, 16);
      ctx.lineTo(-13, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Rose stem & leaves
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.quadraticCurveTo(2, 6, 0, 0);
      ctx.stroke();
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(-4, 6, 3, 1.5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(4, 8, 3, 1.5, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Crimson Rose Blossom
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, -2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-2, -3, 3.5, 0, Math.PI * 2);
      ctx.arc(2, -3, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Fallen petal
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.ellipse(6, 15, 2.5, 1.2, 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'compass': {
      // Antique Explorer Brass Compass
      ctx.fillStyle = '#fef3c7';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Top ring loop
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -21, 4, 0, Math.PI * 2);
      ctx.stroke();

      // Compass Rose Cardinal Lines
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(0, 14);
      ctx.moveTo(-14, 0);
      ctx.lineTo(14, 0);
      ctx.stroke();

      // North needle (Red) & South needle (Silver)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-3, 0);
      ctx.lineTo(0, -14);
      ctx.lineTo(3, 0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-3, 0);
      ctx.lineTo(0, 14);
      ctx.lineTo(3, 0);
      ctx.closePath();
      ctx.fill();

      // Center Brass Rivet
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'magic_wand': {
      // Fairytale Magic Wand
      ctx.strokeStyle = body || '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-14, 14);
      ctx.lineTo(8, -8);
      ctx.stroke();
      ctx.lineCap = 'butt';

      // Starlight Tip
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(
          8 + Math.cos(((18 + i * 72) * Math.PI) / 180) * 10,
          -8 - Math.sin(((18 + i * 72) * Math.PI) / 180) * 10
        );
        ctx.lineTo(
          8 + Math.cos(((54 + i * 72) * Math.PI) / 180) * 4.5,
          -8 - Math.sin(((54 + i * 72) * Math.PI) / 180) * 4.5
        );
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Magic burst sparkles
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(19, -15, 1.8, 0, Math.PI * 2);
      ctx.arc(17, -2, 1.4, 0, Math.PI * 2);
      ctx.arc(2, -18, 1.4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'treasure_chest': {
      // Heirloom Treasure Chest
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-16, -2, 32, 18, 4);
      ctx.fill();
      ctx.stroke();

      // Chest Lid Curved
      ctx.beginPath();
      ctx.arc(0, -2, 16, Math.PI, 0, false);
      ctx.fill();
      ctx.stroke();

      // Glowing treasure inside lid
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(0, -2, 13, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sparkling Jewels
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(-5, -2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(4, -2, 2, 0, Math.PI * 2);
      ctx.fill();

      // Golden clasp & keyhole
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-3, 3, 6, 7);
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(0, 6, 1, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'planet': {
      // Cosmic Ringed Planet (Saturn)
      // Planet Sphere
      const pGrad = ctx.createLinearGradient(-12, -12, 12, 12);
      pGrad.addColorStop(0, '#7c3aed');
      pGrad.addColorStop(0.5, '#ec4899');
      pGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, Math.PI * 2);
      ctx.fill();

      // Planetary Rings
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 6, -0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Little Orbiting Moon
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(17, -11, 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'star': {
      // Gold foil star
      ctx.fillStyle = body || '#f59e0b';
      ctx.strokeStyle = bodyDark || '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(
          Math.cos(((18 + i * 72) * Math.PI) / 180) * 18,
          -Math.sin(((18 + i * 72) * Math.PI) / 180) * 18
        );
        ctx.lineTo(
          Math.cos(((54 + i * 72) * Math.PI) / 180) * 8,
          -Math.sin(((54 + i * 72) * Math.PI) / 180) * 8
        );
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'crown': {
      // Royal Crown
      ctx.fillStyle = body || '#fbbf24';
      ctx.strokeStyle = bodyDeep || '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, 10);
      ctx.lineTo(-20, -10);
      ctx.lineTo(-8, -2);
      ctx.lineTo(0, -16);
      ctx.lineTo(8, -2);
      ctx.lineTo(20, -10);
      ctx.lineTo(18, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gems
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -16, 2.5, 0, Math.PI * 2);
      ctx.arc(-20, -10, 2.5, 0, Math.PI * 2);
      ctx.arc(20, -10, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'rocket': {
      // Space Rocket
      ctx.fillStyle = body || '#f8fafc';
      ctx.strokeStyle = bodyDeep || '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.quadraticCurveTo(12, -10, 12, 10);
      ctx.lineTo(-12, 10);
      ctx.quadraticCurveTo(-12, -10, 0, -22);
      ctx.fill();
      ctx.stroke();

      // Fins
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(-12, 4);
      ctx.lineTo(-20, 14);
      ctx.lineTo(-12, 12);
      ctx.closePath();
      ctx.moveTo(12, 4);
      ctx.lineTo(20, 14);
      ctx.lineTo(12, 12);
      ctx.closePath();
      ctx.fill();

      // Porthole
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -4, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'sneaker': {
      // Sneaker Stamp
      ctx.fillStyle = body || '#dc2626';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-18, 8);
      ctx.lineTo(-18, -4);
      ctx.lineTo(-4, -6);
      ctx.lineTo(8, 2);
      ctx.lineTo(20, 8);
      ctx.lineTo(20, 14);
      ctx.lineTo(-18, 14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sole
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-18, 10, 38, 4);
      break;
    }
    case 'sparkle': {
      // Magic twinkle
      ctx.fillStyle = body || '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.quadraticCurveTo(0, 0, 16, 0);
      ctx.quadraticCurveTo(0, 0, 0, 16);
      ctx.quadraticCurveTo(0, 0, -16, 0);
      ctx.quadraticCurveTo(0, 0, 0, -16);
      ctx.fill();
      break;
    }
    case 'castle': {
      ctx.fillStyle = body || '#64748b';
      ctx.fillRect(-12, -4, 24, 18);
      ctx.fillStyle = bodyDark || '#475569';
      ctx.fillRect(-15, -12, 8, 26);
      ctx.fillRect(7, -12, 8, 26);
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(-15, -12);
      ctx.lineTo(-11, -20);
      ctx.lineTo(-7, -12);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(7, -12);
      ctx.lineTo(11, -20);
      ctx.lineTo(15, -12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-4, 4, 8, 10);
      break;
    }
    case 'spaceship': {
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(-3, 14);
      ctx.lineTo(0, 22);
      ctx.lineTo(3, 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-8, 6);
      ctx.lineTo(-16, 15);
      ctx.lineTo(-6, 14);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(8, 6);
      ctx.lineTo(16, 15);
      ctx.lineTo(6, 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = body || '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.quadraticCurveTo(-8, -4, -8, 14);
      ctx.lineTo(8, 14);
      ctx.quadraticCurveTo(8, -4, 0, -18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'crystal': {
      ctx.fillStyle = body || '#c084fc';
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(8, -6);
      ctx.lineTo(5, 16);
      ctx.lineTo(-5, 16);
      ctx.lineTo(-8, -6);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = bodyDark || '#a855f7';
      ctx.beginPath();
      ctx.moveTo(-8, -6);
      ctx.lineTo(-15, 0);
      ctx.lineTo(-10, 14);
      ctx.lineTo(-5, 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = bodyDeep || '#9333ea';
      ctx.beginPath();
      ctx.moveTo(8, -6);
      ctx.lineTo(15, 0);
      ctx.lineTo(10, 14);
      ctx.lineTo(5, 16);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'mushroom': {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(-5, 2, 10, 14);
      ctx.fillStyle = body || '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 2, 16, Math.PI, 0, false);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-6, -4, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(6, -5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -8, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'rainbow': {
      for (let idx = 0; idx < RAINBOW_BANDS.length; idx++) {
        ctx.strokeStyle = RAINBOW_BANDS[idx];
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 14, 18 - idx * 2.8, Math.PI, 0, false);
        ctx.stroke();
      }
      break;
    }
    case 'dragon_egg': {
      ctx.fillStyle = body || '#10b981';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = bodyLight || '#a7f3d0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.quadraticCurveTo(0, 0, 6, -4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, 3);
      ctx.quadraticCurveTo(0, 7, 8, 3);
      ctx.stroke();
      break;
    }
    case 'heart':
    default: {
      // Heart Badge
      ctx.fillStyle = body || '#f43f5e';
      ctx.beginPath();
      ctx.arc(-6, -4, 7, Math.PI, 0, false);
      ctx.arc(6, -4, 7, Math.PI, 0, false);
      ctx.lineTo(0, 14);
      ctx.closePath();
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}
