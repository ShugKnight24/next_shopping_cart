/**
 * Canvas artwork for the storybook hero and their companion.
 *
 * Lifted out of `CanvasEngine` because a 560-line inline block is exactly why
 * half of `core/characterSchema.js` was pickable but invisible: nobody could
 * find the branch to extend. Every option table in the schema is honoured here,
 * and `CharacterCreator`'s SVG portrait is the other renderer of the same data.
 *
 * Both entry points draw in a local coordinate space whose origin is the
 * character's standing point, so the caller only supplies `x`/`y`.
 *
 * Hot path: these run inside the rAF render loop. No array/object literals, no
 * `.map`/`.forEach` chains — plain loops and scalars only.
 */

import {
  BUILDS,
  PET_SIZES,
  contrastInk,
  findById,
  shade,
} from './core/characterSchema';

const TAU = Math.PI * 2;

const rectPath = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
};

const roundFill = (ctx, x, y, w, h, r) => {
  rectPath(ctx, x, y, w, h, r);
  ctx.fill();
};

const dot = (ctx, x, y, r) => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
};

const starFill = (ctx, cx, cy, r) => {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const ang = (i * Math.PI) / 5 - Math.PI / 2;
    const px = cx + Math.cos(ang) * rad;
    const py = cy + Math.sin(ang) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
};

const tri = (ctx, x1, y1, x2, y2, x3, y3) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
};

/* ==================================================================== hero == */

/** Re-runnable so the pattern pass can clip to the same silhouette. */
function pathOutfit(ctx, style) {
  switch (style) {
    case 'dress':
      ctx.beginPath();
      ctx.moveTo(-11, -10);
      ctx.lineTo(11, -10);
      ctx.lineTo(19, 21);
      ctx.lineTo(-19, 21);
      ctx.closePath();
      break;
    case 'hoodie':
      rectPath(ctx, -14, -11, 28, 32, 9);
      break;
    case 'space_suit':
      rectPath(ctx, -14, -11, 28, 32, 12);
      break;
    case 'hero_suit':
      rectPath(ctx, -12, -11, 24, 32, 9);
      break;
    case 'explorer':
      rectPath(ctx, -13, -10, 26, 30, 4);
      break;
    case 'dungarees':
    case 'tee':
    default:
      rectPath(ctx, -12, -10, 24, 30, 6);
  }
}

function drawOutfitPattern(ctx, pattern, accent) {
  if (!pattern || pattern === 'solid') return;
  ctx.save();
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = accent;
  ctx.strokeStyle = accent;

  if (pattern === 'stripes') {
    for (let y = -10; y < 22; y += 6) ctx.fillRect(-22, y, 44, 2.6);
  } else if (pattern === 'dots') {
    for (let y = -6; y < 21; y += 7) {
      for (let x = -9; x <= 9; x += 7) dot(ctx, x, y, 1.7);
    }
  } else if (pattern === 'stars') {
    for (let y = -5; y < 21; y += 9) {
      for (let x = -8; x <= 8; x += 9) starFill(ctx, x, y, 3.1);
    }
  } else if (pattern === 'chevron') {
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let y = -9; y < 22; y += 7) {
      ctx.moveTo(-16, y);
      ctx.lineTo(0, y + 5);
      ctx.lineTo(16, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawLegsAndShoes(ctx, skin, accent, style) {
  const legTop = style === 'dress' ? 20 : 18;
  ctx.fillStyle = skin;
  roundFill(ctx, -7.5, legTop, 5.5, 8, 2);
  roundFill(ctx, 2, legTop, 5.5, 8, 2);
  ctx.fillStyle = accent;
  roundFill(ctx, -8.5, legTop + 6.5, 7.5, 4, 2);
  roundFill(ctx, 1, legTop + 6.5, 7.5, 4, 2);
}

function drawOutfit(ctx, a, outfit, accent, skin) {
  const fold = shade(outfit, -0.22);
  const ink = contrastInk(outfit);

  drawLegsAndShoes(ctx, skin, accent, a.outfitStyle);

  // Arms sit behind the torso so sleeves read as one garment.
  ctx.fillStyle = a.outfitStyle === 'dress' ? skin : outfit;
  roundFill(ctx, -17.5, -8, 5.5, 18, 2.75);
  roundFill(ctx, 12, -8, 5.5, 18, 2.75);
  ctx.fillStyle = skin;
  dot(ctx, -14.7, 11, 3);
  dot(ctx, 14.7, 11, 3);

  if (a.outfitStyle === 'hoodie') {
    // Hood bunched behind the shoulders.
    ctx.fillStyle = fold;
    ctx.beginPath();
    ctx.ellipse(0, -13, 17, 8, 0, 0, TAU);
    ctx.fill();
  }

  ctx.fillStyle = outfit;
  pathOutfit(ctx, a.outfitStyle);
  ctx.fill();

  ctx.save();
  pathOutfit(ctx, a.outfitStyle);
  if (ctx.clip) ctx.clip();
  drawOutfitPattern(ctx, a.outfitPattern, accent);
  ctx.restore();

  ctx.fillStyle = accent;
  switch (a.outfitStyle) {
    case 'hoodie':
      // Kangaroo pocket + drawstrings.
      ctx.fillStyle = fold;
      roundFill(ctx, -9, 6, 18, 10, 3);
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-3.5, -9);
      ctx.lineTo(-4.5, -2);
      ctx.moveTo(3.5, -9);
      ctx.lineTo(4.5, -2);
      ctx.stroke();
      ctx.fillStyle = accent;
      roundFill(ctx, -14, 17, 28, 4, 2);
      break;
    case 'dungarees':
      ctx.fillStyle = accent;
      ctx.fillRect(-8.5, -11, 4, 9);
      ctx.fillRect(4.5, -11, 4, 9);
      roundFill(ctx, -8, 0, 16, 9, 2);
      break;
    case 'dress':
      ctx.fillStyle = accent;
      roundFill(ctx, -12, -2, 24, 4, 2);
      ctx.beginPath();
      ctx.moveTo(-19, 21);
      ctx.lineTo(19, 21);
      ctx.lineTo(17, 17);
      ctx.lineTo(-17, 17);
      ctx.closePath();
      ctx.fill();
      break;
    case 'hero_suit':
      ctx.fillStyle = accent;
      roundFill(ctx, -12, 6, 24, 5, 2);
      starFill(ctx, 0, -1, 6.5);
      break;
    case 'space_suit':
      ctx.fillStyle = accent;
      roundFill(ctx, -9, -4, 18, 11, 3);
      ctx.fillStyle = fold;
      dot(ctx, -4.5, 0.5, 1.8);
      dot(ctx, 0, 0.5, 1.8);
      dot(ctx, 4.5, 0.5, 1.8);
      break;
    case 'explorer':
      ctx.fillStyle = accent;
      ctx.fillRect(-13, -1, 26, 2.5);
      roundFill(ctx, -11, 5, 8, 8, 2);
      roundFill(ctx, 3, 5, 8, 8, 2);
      break;
    default:
      // Graphic tee: ringer collar + a small chest motif.
      ctx.fillStyle = accent;
      roundFill(ctx, -8, -11, 16, 3.5, 1.75);
      starFill(ctx, 0, 2, 5.5);
  }

  // Collar shadow under the chin, whatever the garment.
  ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
  ctx.beginPath();
  ctx.ellipse(0, -10, 8, 3, 0, 0, Math.PI);
  ctx.fill();

  if (a.outfitStyle === 'space_suit') {
    ctx.strokeStyle =
      ink === '#0f172a' ? 'rgba(15,23,42,0.3)' : 'rgba(248,250,252,0.35)';
    ctx.lineWidth = 1.2;
    rectPath(ctx, -14, -11, 28, 32, 12);
    ctx.stroke();
  }
}

function drawHead(ctx, skin) {
  const cheek = shade(skin, -0.12);
  ctx.fillStyle = cheek;
  roundFill(ctx, -4, -14, 8, 6, 2);
  ctx.fillStyle = skin;
  dot(ctx, 0, -22, 14);
  // Ears
  ctx.fillStyle = cheek;
  dot(ctx, -13.5, -21, 3.4);
  dot(ctx, 13.5, -21, 3.4);
}

function drawHair(ctx, a) {
  const hair = a.hairColor;
  const hairLo = shade(hair, -0.28);
  const style = a.hairStyle;
  ctx.fillStyle = hair;

  switch (style) {
    case 'crop':
      ctx.beginPath();
      ctx.arc(0, -25, 14, Math.PI, 0, false);
      ctx.fill();
      ctx.fillRect(-14, -25, 28, 2.5);
      break;

    case 'curls':
      ctx.beginPath();
      ctx.arc(0, -26, 14, Math.PI, 0, false);
      ctx.fill();
      for (let i = -12; i <= 12; i += 6) dot(ctx, i, -28, 4.5);
      ctx.fillStyle = hairLo;
      for (let i = -9; i <= 9; i += 6) dot(ctx, i, -32, 3);
      break;

    case 'coils':
      ctx.beginPath();
      ctx.arc(0, -26, 14, Math.PI, 0, false);
      ctx.fill();
      for (let i = -13; i <= 13; i += 4.5) {
        dot(ctx, i, -30, 2.6);
        ctx.fillStyle = hairLo;
        dot(ctx, i + 2, -27, 1.8);
        ctx.fillStyle = hair;
      }
      break;

    case 'afro':
      dot(ctx, 0, -30, 17.5);
      ctx.fillStyle = hairLo;
      dot(ctx, -9, -34, 5);
      dot(ctx, 9, -34, 5);
      break;

    case 'waves':
      ctx.beginPath();
      ctx.arc(0, -26, 14, Math.PI, 0, false);
      ctx.fill();
      roundFill(ctx, -15.5, -26, 6, 24, 3);
      roundFill(ctx, 9.5, -26, 6, 24, 3);
      ctx.fillStyle = hairLo;
      roundFill(ctx, -15.5, -8, 6, 6, 3);
      roundFill(ctx, 9.5, -8, 6, 6, 3);
      break;

    case 'braids':
      ctx.beginPath();
      ctx.arc(0, -26, 14, Math.PI, 0, false);
      ctx.fill();
      for (let s = -1; s <= 1; s += 2) {
        for (let k = 0; k < 4; k += 1) {
          dot(ctx, s * 12.5, -22 + k * 6, 3.1);
        }
      }
      break;

    case 'locs':
      ctx.beginPath();
      ctx.arc(0, -27, 14.5, Math.PI, 0, false);
      ctx.fill();
      // Crown locs lie on top; only the outer pair hangs, so the face stays clear.
      for (let i = -12; i <= 12; i += 4.8) {
        roundFill(ctx, i - 1.9, -35, 3.8, 10, 1.9);
      }
      for (let s = -1; s <= 1; s += 2) {
        roundFill(ctx, s * 13 - 2.4, -29, 4.8, 23, 2.4);
      }
      ctx.fillStyle = hairLo;
      for (let s = -1; s <= 1; s += 2) {
        roundFill(ctx, s * 13 - 2.4, -10, 4.8, 4, 2.4);
      }
      break;

    case 'ponytail':
      ctx.beginPath();
      ctx.arc(0, -26, 14, Math.PI, 0, false);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(16, -30, 9, 4.5, 0.6, 0, TAU);
      ctx.fill();
      ctx.fillStyle = hairLo;
      dot(ctx, 12.5, -30, 2.6);
      break;

    case 'buns':
      ctx.beginPath();
      ctx.arc(0, -26, 14, Math.PI, 0, false);
      ctx.fill();
      dot(ctx, -13, -34, 6);
      dot(ctx, 13, -34, 6);
      ctx.fillStyle = hairLo;
      dot(ctx, -13, -34, 2.4);
      dot(ctx, 13, -34, 2.4);
      break;

    case 'bob':
      ctx.beginPath();
      ctx.arc(0, -25, 15, Math.PI, 0, false);
      ctx.fill();
      roundFill(ctx, -15, -25, 5.5, 16, 2.75);
      roundFill(ctx, 9.5, -25, 5.5, 16, 2.75);
      ctx.fillRect(-15, -27, 30, 4);
      break;

    case 'spiky':
      ctx.beginPath();
      ctx.moveTo(-14, -24);
      ctx.lineTo(-10, -36);
      ctx.lineTo(-4, -28);
      ctx.lineTo(0, -38);
      ctx.lineTo(5, -28);
      ctx.lineTo(10, -35);
      ctx.lineTo(14, -24);
      ctx.closePath();
      ctx.fill();
      break;

    case 'beanie': {
      // Headwear over hair: the knit takes `beanieColor`, the hair beneath
      // still takes `hairColor`. Getting this wrong was the original bug.
      ctx.beginPath();
      ctx.arc(0, -25, 14, Math.PI, 0, false);
      ctx.fill();
      ctx.fillRect(-14, -25, 28, 5);
      const knit = a.beanieColor ?? '#0284c7';
      ctx.fillStyle = knit;
      ctx.beginPath();
      ctx.arc(0, -26, 15, Math.PI, 0, false);
      ctx.fill();
      ctx.fillStyle = shade(knit, -0.22);
      ctx.fillRect(-15, -27, 30, 5);
      ctx.fillStyle = knit;
      dot(ctx, 0, -42, 4);
      ctx.strokeStyle = shade(knit, -0.3);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = -11; i <= 11; i += 5.5) {
        ctx.moveTo(i, -27);
        ctx.lineTo(i, -38);
      }
      ctx.stroke();
      break;
    }

    default:
      ctx.beginPath();
      ctx.arc(0, -26, 14, Math.PI, 0, false);
      ctx.fill();
  }
}

function drawEyes(ctx, a) {
  const c = a.eyeColor;
  const shapeId = a.eyeShape;

  for (let s = -1; s <= 1; s += 2) {
    const ex = s * 4.6;
    const ey = -22;

    if (shapeId === 'sleepy') {
      ctx.strokeStyle = shade(c, -0.25);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(ex, ey - 0.5, 3.2, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      continue;
    }

    // Sclera
    ctx.fillStyle = '#ffffff';
    if (shapeId === 'almond') {
      ctx.beginPath();
      ctx.ellipse(ex, ey, 3.6, 2.4, 0, 0, TAU);
      ctx.fill();
    } else if (shapeId === 'wide') {
      dot(ctx, ex, ey, 4.3);
    } else {
      dot(ctx, ex, ey, 3.4);
    }

    ctx.fillStyle = c;
    dot(ctx, ex, ey, shapeId === 'wide' ? 2.8 : 2.2);
    ctx.fillStyle = '#0f172a';
    dot(ctx, ex, ey, shapeId === 'wide' ? 1.4 : 1.1);
    ctx.fillStyle = '#ffffff';
    dot(ctx, ex - 0.9, ey - 0.9, 0.8);

    if (shapeId === 'sparkle') {
      ctx.fillStyle = '#fef9c3';
      starFill(ctx, ex + 2.6, ey - 3.2, 2.1);
    }
  }
}

function drawBrows(ctx, a) {
  if (a.brows === 'none') return;
  ctx.strokeStyle = shade(a.hairColor, -0.15);
  ctx.lineCap = 'round';

  for (let s = -1; s <= 1; s += 2) {
    const bx = s * 4.6;
    if (a.brows === 'bold') {
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(bx - 3.4, -27.2);
      ctx.lineTo(bx + 3.4, -27.8);
      ctx.stroke();
    } else if (a.brows === 'raised') {
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bx, -25.6, 3.4, 1.12 * Math.PI, 1.88 * Math.PI);
      ctx.stroke();
    } else {
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(bx, -25.2, 3.2, 1.18 * Math.PI, 1.82 * Math.PI);
      ctx.stroke();
    }
  }
  ctx.lineCap = 'butt';
}

function drawMouth(ctx, expression) {
  ctx.strokeStyle = '#7f1d1d';
  ctx.fillStyle = '#7f1d1d';
  ctx.lineWidth = 1.3;

  switch (expression) {
    case 'grin':
      ctx.beginPath();
      ctx.arc(0, -18.5, 5, 0.05 * Math.PI, 0.95 * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4.4, -18.5, 8.8, 1.6);
      break;
    case 'calm':
      ctx.beginPath();
      ctx.moveTo(-2.6, -17.6);
      ctx.lineTo(2.6, -17.6);
      ctx.stroke();
      break;
    case 'determined':
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(-3.4, -17.2);
      ctx.lineTo(3.4, -18.2);
      ctx.stroke();
      break;
    case 'surprised':
      ctx.beginPath();
      ctx.ellipse(0, -17.4, 2.2, 2.8, 0, 0, TAU);
      ctx.fill();
      break;
    case 'giggle':
      ctx.beginPath();
      ctx.arc(0, -19, 4.6, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fb7185';
      ctx.beginPath();
      ctx.ellipse(0, -16.6, 2.4, 1.4, 0, 0, TAU);
      ctx.fill();
      break;
    default:
      ctx.beginPath();
      ctx.arc(0, -18, 4, 0.1 * Math.PI, 0.9 * Math.PI, false);
      ctx.stroke();
  }
}

function drawFreckles(ctx, freckles, skin) {
  if (!freckles || freckles === 'none') return;
  ctx.fillStyle = shade(skin, -0.42);

  if (freckles === 'nose' || freckles === 'full') {
    dot(ctx, -1.6, -20.6, 0.7);
    dot(ctx, 1.6, -20.6, 0.7);
    dot(ctx, 0, -19.6, 0.7);
  }
  if (freckles === 'cheeks' || freckles === 'full') {
    for (let s = -1; s <= 1; s += 2) {
      dot(ctx, s * 7.6, -19.6, 0.75);
      dot(ctx, s * 9.4, -20.6, 0.7);
      dot(ctx, s * 8.4, -17.9, 0.65);
    }
  }
  if (freckles === 'full') {
    dot(ctx, -5.2, -16.4, 0.6);
    dot(ctx, 5.2, -16.4, 0.6);
  }
}

function drawFace(ctx, a) {
  // Blush first so eyes and mouth sit on top.
  ctx.fillStyle = 'rgba(244, 114, 182, 0.28)';
  ctx.beginPath();
  ctx.ellipse(-8.4, -19, 3.4, 2.2, 0, 0, TAU);
  ctx.ellipse(8.4, -19, 3.4, 2.2, 0, 0, TAU);
  ctx.fill();

  drawBrows(ctx, a);
  drawEyes(ctx, a);

  // Nose
  ctx.fillStyle = shade(a.skin, -0.28);
  dot(ctx, 0, -20.4, 0.9);

  drawMouth(ctx, a.expression);
  drawFreckles(ctx, a.freckles, a.skin);
}

function drawFaceAccessory(ctx, id, a) {
  switch (id) {
    case 'glasses':
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-4.6, -22, 4.2, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(4.6, -22, 4.2, 0, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-0.4, -22);
      ctx.lineTo(0.4, -22);
      ctx.moveTo(-8.8, -22.6);
      ctx.lineTo(-13.4, -23.4);
      ctx.moveTo(8.8, -22.6);
      ctx.lineTo(13.4, -23.4);
      ctx.stroke();
      break;

    case 'star_shades':
      ctx.fillStyle = a.outfitAccentColor;
      starFill(ctx, -4.8, -22, 5.4);
      starFill(ctx, 4.8, -22, 5.4);
      ctx.strokeStyle = shade(a.outfitAccentColor, -0.35);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-1.2, -22);
      ctx.lineTo(1.2, -22);
      ctx.stroke();
      break;

    case 'superhero_mask':
      ctx.fillStyle = a.outfitAccentColor;
      ctx.beginPath();
      ctx.moveTo(-12, -26.5);
      ctx.lineTo(12, -26.5);
      ctx.lineTo(10, -19);
      ctx.lineTo(3, -20.5);
      ctx.lineTo(0, -22.5);
      ctx.lineTo(-3, -20.5);
      ctx.lineTo(-10, -19);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(-4.6, -23, 3, 1.9, 0, 0, TAU);
      ctx.ellipse(4.6, -23, 3, 1.9, 0, 0, TAU);
      ctx.fill();
      break;

    case 'eyepatch':
      ctx.strokeStyle = '#1c1917';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-13, -27);
      ctx.lineTo(10, -24.5);
      ctx.stroke();
      ctx.fillStyle = '#1c1917';
      roundFill(ctx, -9, -25.5, 8.6, 7, 2);
      break;

    case 'snorkel':
      ctx.strokeStyle = '#0ea5e9';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(11, -26);
      ctx.lineTo(13.5, -37);
      ctx.stroke();
      ctx.fillStyle = 'rgba(186, 230, 253, 0.75)';
      roundFill(ctx, -10.5, -26.5, 21, 9, 4);
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 1.4;
      rectPath(ctx, -10.5, -26.5, 21, 9, 4);
      ctx.stroke();
      break;

    default:
      break;
  }
}

function drawHeadAccessory(ctx, id, accent) {
  switch (id) {
    case 'crown':
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-10, -35);
      ctx.lineTo(-6, -29);
      ctx.lineTo(0, -38);
      ctx.lineTo(6, -29);
      ctx.lineTo(10, -35);
      ctx.lineTo(8, -27);
      ctx.lineTo(-8, -27);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = accent;
      dot(ctx, 0, -30.5, 1.8);
      break;

    case 'astronaut_helmet':
      ctx.fillStyle = 'rgba(224, 242, 254, 0.22)';
      dot(ctx, 0, -22, 19);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(0, -22, 19, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, -22, 16, -2.5, -1.5);
      ctx.stroke();
      break;

    case 'party_hat':
      ctx.fillStyle = accent;
      tri(ctx, -9, -33, 9, -33, 0, -48);
      ctx.fillStyle = shade(accent, -0.3);
      ctx.beginPath();
      ctx.moveTo(-6, -38);
      ctx.lineTo(6, -38);
      ctx.lineTo(4, -42);
      ctx.lineTo(-4, -42);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      dot(ctx, 0, -48.5, 2.4);
      break;

    case 'headband':
      ctx.fillStyle = accent;
      ctx.fillRect(-15, -31, 30, 4);
      ctx.fillStyle = '#fbbf24';
      starFill(ctx, 9, -33, 4.4);
      break;

    case 'chef_hat':
      ctx.fillStyle = '#f8fafc';
      dot(ctx, -8, -38, 7);
      dot(ctx, 8, -38, 7);
      dot(ctx, 0, -41, 8);
      roundFill(ctx, -11, -35, 22, 8, 2);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.strokeRect(-11, -35, 22, 8);
      break;

    default:
      break;
  }
}

function drawBackAccessory(ctx, id, accent, outfit) {
  switch (id) {
    case 'cape': {
      // The accent colour, not a hardcoded red — this was the reported bug.
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.moveTo(-10, -11);
      ctx.lineTo(-26, 26);
      ctx.quadraticCurveTo(0, 32, 26, 26);
      ctx.lineTo(10, -11);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shade(accent, -0.25);
      ctx.beginPath();
      ctx.moveTo(-4, -10);
      ctx.lineTo(-9, 28);
      ctx.lineTo(0, 29.5);
      ctx.lineTo(2, -10);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = accent;
      roundFill(ctx, -12, -13, 24, 4, 2);
      break;
    }

    case 'wings':
      for (let s = -1; s <= 1; s += 2) {
        ctx.fillStyle = 'rgba(248, 250, 252, 0.92)';
        ctx.beginPath();
        ctx.moveTo(s * 6, -10);
        ctx.quadraticCurveTo(s * 34, -26, s * 30, 4);
        ctx.quadraticCurveTo(s * 20, 0, s * 6, 8);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.moveTo(s * 6, -8);
        ctx.quadraticCurveTo(s * 24, -18, s * 24, 0);
        ctx.quadraticCurveTo(s * 16, -2, s * 6, 5);
        ctx.closePath();
        ctx.fill();
      }
      break;

    case 'backpack':
      ctx.fillStyle = shade(accent, -0.18);
      roundFill(ctx, -15, -7, 30, 26, 7);
      ctx.fillStyle = accent;
      roundFill(ctx, -11, 2, 22, 9, 3);
      break;

    case 'jetpack':
      ctx.fillStyle = '#cbd5e1';
      roundFill(ctx, -17, -8, 10, 24, 5);
      roundFill(ctx, 7, -8, 10, 24, 5);
      ctx.fillStyle = shade(outfit, -0.3);
      ctx.fillRect(-17, -2, 34, 3);
      ctx.fillStyle = '#f97316';
      tri(ctx, -15, 16, -9, 16, -12, 28);
      tri(ctx, 9, 16, 15, 16, 12, 28);
      ctx.fillStyle = '#fde047';
      tri(ctx, -14, 16, -10, 16, -12, 23);
      tri(ctx, 10, 16, 14, 16, 12, 23);
      break;

    default:
      break;
  }
}

function drawBackpackStraps(ctx, accent) {
  ctx.fillStyle = shade(accent, -0.35);
  ctx.fillRect(-9, -11, 3.5, 16);
  ctx.fillRect(5.5, -11, 3.5, 16);
}

/**
 * Draw the hero at `x`,`y` (their standing point).
 * `avatar` must already be through `normalizeAvatar`.
 */
export function drawHero(ctx, avatar, opts) {
  const x = opts?.x ?? 0;
  const y = opts?.y ?? 0;
  const scale =
    (findById(BUILDS, avatar.build, 1)?.scale ?? 1) * (opts?.scale ?? 1);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  drawBackAccessory(
    ctx,
    avatar.backAccessory,
    avatar.outfitAccentColor,
    avatar.outfitColor
  );
  drawOutfit(
    ctx,
    avatar,
    avatar.outfitColor,
    avatar.outfitAccentColor,
    avatar.skin
  );
  if (avatar.backAccessory === 'backpack') {
    drawBackpackStraps(ctx, avatar.outfitAccentColor);
  }
  drawHead(ctx, avatar.skin);
  drawHair(ctx, avatar);
  drawFace(ctx, avatar);
  drawFaceAccessory(ctx, avatar.faceAccessory, avatar);
  drawHeadAccessory(ctx, avatar.headAccessory, avatar.outfitAccentColor);

  ctx.restore();
}

/* =============================================================== companion == */

function drawPetBase(ctx, pose, fur) {
  const lo = shade(fur, -0.22);
  ctx.fillStyle = lo;

  switch (pose) {
    case 'stand':
      roundFill(ctx, -11, 16, 6, 12, 3);
      roundFill(ctx, 5, 16, 6, 12, 3);
      ctx.fillStyle = shade(fur, -0.38);
      roundFill(ctx, -12, 25, 8, 4, 2);
      roundFill(ctx, 4, 25, 8, 4, 2);
      break;
    case 'leap':
      roundFill(ctx, -18, 12, 12, 5.5, 2.75);
      roundFill(ctx, 8, 16, 13, 5.5, 2.75);
      break;
    case 'curl':
      ctx.beginPath();
      ctx.ellipse(0, 12, 24, 10, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = shade(fur, -0.34);
      ctx.beginPath();
      ctx.ellipse(16, 10, 8, 4, -0.4, 0, TAU);
      ctx.fill();
      break;
    default:
      // Sitting: haunch + front paws.
      ctx.beginPath();
      ctx.ellipse(-12, 15, 8, 9, 0.2, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(12, 15, 8, 9, -0.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = shade(fur, -0.36);
      roundFill(ctx, -8, 18, 6.5, 5, 2.5);
      roundFill(ctx, 1.5, 18, 6.5, 5, 2.5);
  }
}

function drawCollar(ctx, collar, color) {
  if (!collar || collar === 'none') return;
  const lo = shade(color, -0.3);
  const ink = contrastInk(color);

  switch (collar) {
    case 'star_bandana':
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-12, -12);
      ctx.lineTo(12, -12);
      ctx.lineTo(0, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = lo;
      ctx.fillRect(-12, -13, 24, 2.5);
      ctx.fillStyle = ink;
      starFill(ctx, 0, -5, 3.4);
      break;

    case 'golden_bell':
      ctx.fillStyle = color;
      roundFill(ctx, -12, -12.5, 24, 5, 2.5);
      ctx.fillStyle = '#fbbf24';
      dot(ctx, 0, -5, 4.2);
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-3.6, -5);
      ctx.lineTo(3.6, -5);
      ctx.stroke();
      ctx.fillStyle = '#92400e';
      dot(ctx, 0, -3.4, 1);
      break;

    case 'explorer_scarf':
      ctx.fillStyle = color;
      roundFill(ctx, -12, -13, 24, 6, 3);
      ctx.beginPath();
      ctx.moveTo(9, -8);
      ctx.quadraticCurveTo(24, -3, 27, 13);
      ctx.lineTo(18, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = lo;
      dot(ctx, 19, 4, 1.8);
      break;

    case 'capelet':
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-15, -11);
      ctx.quadraticCurveTo(0, -4, 15, -11);
      ctx.lineTo(13, 8);
      ctx.quadraticCurveTo(0, 13, -13, 8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = lo;
      roundFill(ctx, -13, -13.5, 26, 4, 2);
      break;

    case 'bowtie':
      ctx.fillStyle = color;
      tri(ctx, -1, -9, -11, -14, -11, -4);
      tri(ctx, 1, -9, 11, -14, 11, -4);
      ctx.fillStyle = lo;
      dot(ctx, 0, -9, 2.6);
      break;

    default:
      break;
  }
}

function drawPetBadge(ctx, badge) {
  if (!badge) return;
  const bx = -8;
  const by = 4;

  switch (badge) {
    case 'badge_brave':
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(bx - 2.2, by - 1.4, 2.6, Math.PI, 0, false);
      ctx.arc(bx + 2.2, by - 1.4, 2.6, Math.PI, 0, false);
      ctx.lineTo(bx, by + 5);
      ctx.closePath();
      ctx.fill();
      break;

    case 'badge_starlight':
      ctx.fillStyle = '#fbbf24';
      starFill(ctx, bx, by, 5.2);
      ctx.fillStyle = '#fef9c3';
      starFill(ctx, bx, by, 2.4);
      break;

    case 'badge_certified':
      ctx.fillStyle = '#0ea5e9';
      dot(ctx, bx, by, 5);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bx, by, 3.2, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      dot(ctx, bx, by, 1.3);
      break;

    case 'badge_dino_scout':
      ctx.fillStyle = '#047857';
      roundFill(ctx, bx - 5, by - 5, 10, 10, 3);
      ctx.fillStyle = '#6ee7b7';
      dot(ctx, bx, by + 1, 2);
      dot(ctx, bx - 2.6, by - 2.2, 1.1);
      dot(ctx, bx, by - 3.2, 1.1);
      dot(ctx, bx + 2.6, by - 2.2, 1.1);
      break;

    default:
      // badge_hero — shield
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(bx - 4.6, by - 5);
      ctx.lineTo(bx + 4.6, by - 5);
      ctx.lineTo(bx + 4.6, by + 1);
      ctx.quadraticCurveTo(bx, by + 6.5, bx - 4.6, by + 1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      starFill(ctx, bx, by - 1.2, 2.8);
  }
}

function drawFinley(ctx, fur) {
  const lo = shade(fur, -0.26);
  const cream = shade(fur, 0.72);

  // Bushy tail with a snowy tip.
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.moveTo(-10, 14);
  ctx.quadraticCurveTo(-32, 12, -28, -8);
  ctx.quadraticCurveTo(-20, 2, -8, 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-28, -8);
  ctx.quadraticCurveTo(-32, 2, -24, -2);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = fur;
  roundFill(ctx, -12, -8, 24, 30, 8);
  ctx.fillStyle = cream;
  ctx.beginPath();
  ctx.ellipse(0, 6, 7, 10, 0, 0, TAU);
  ctx.fill();

  // Pointed desert-fox ears.
  for (let s = -1; s <= 1; s += 2) {
    ctx.fillStyle = lo;
    tri(ctx, s * 14, -20, s * 18, -36, s * 4, -24);
    ctx.fillStyle = cream;
    tri(ctx, s * 13, -22, s * 16, -33, s * 6, -24);
  }

  ctx.fillStyle = fur;
  dot(ctx, 0, -20, 13);
  ctx.fillStyle = cream;
  ctx.beginPath();
  ctx.ellipse(0, -17, 9, 6, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#431407';
  dot(ctx, -4, -21, 1.8);
  dot(ctx, 4, -21, 1.8);
  ctx.fillStyle = '#fbbf24';
  dot(ctx, -4, -21, 0.8);
  dot(ctx, 4, -21, 0.8);
  ctx.fillStyle = '#1c1917';
  dot(ctx, 0, -16, 1.6);
}

function drawLuna(ctx, fur, name) {
  const lo = shade(fur, -0.4);

  // Curled tail inside the suit.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-16, 12, 10, 0.2 * Math.PI, 1.4 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#fbbf24';
  dot(ctx, -22, 4, 3);

  // The suit stays white — it is a spacesuit, not a coat.
  ctx.fillStyle = '#f8fafc';
  roundFill(ctx, -14, -8, 28, 30, 8);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;
  rectPath(ctx, -14, -8, 28, 30, 8);
  ctx.stroke();

  ctx.fillStyle = '#1e293b';
  roundFill(ctx, -12, -12, 24, 6, 2);

  // Name patch — the shopper's own companion name, not a stock string.
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-10, 6, 20, 8);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 1;
  ctx.strokeRect(-10, 6, 20, 8);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 6px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText((name || 'Luna').toUpperCase().slice(0, 7), 0, 12.5);

  ctx.fillStyle = lo;
  tri(ctx, -12, -26, -18, -14, -8, -18);
  tri(ctx, 12, -26, 18, -14, 8, -18);

  ctx.fillStyle = fur;
  dot(ctx, 0, -22, 14);
  ctx.fillStyle = shade(fur, -0.75);
  ctx.beginPath();
  ctx.ellipse(0, -18, 9, 8, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = '#fbbf24';
  dot(ctx, -4, -23, 1.8);
  dot(ctx, 4, -23, 1.8);
  ctx.fillStyle = '#0f172a';
  dot(ctx, -4, -23, 1);
  dot(ctx, 4, -23, 1);

  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.ellipse(0, -17, 3, 2, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath();
  ctx.ellipse(0, -18.5, 2, 0.8, 0, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -22, 17, 0, TAU);
  ctx.stroke();
}

function drawPenny(ctx, fur) {
  const lo = shade(fur, -0.25);

  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-16, 22);
  ctx.lineTo(16, 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = lo;
  ctx.beginPath();
  ctx.moveTo(-16, 22);
  ctx.lineTo(16, 22);
  ctx.lineTo(13, 17);
  ctx.lineTo(-13, 17);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fde047';
  dot(ctx, 0, -22, 12);
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.moveTo(-8, -30);
  ctx.lineTo(-4, -36);
  ctx.lineTo(0, -30);
  ctx.lineTo(4, -36);
  ctx.lineTo(8, -30);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#1e293b';
  dot(ctx, -4, -23, 1.6);
  dot(ctx, 4, -23, 1.6);
  ctx.strokeStyle = '#be123c';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -19, 3.2, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, -5);
  ctx.lineTo(20, -22);
  ctx.stroke();
  ctx.fillStyle = '#fef08a';
  starFill(ctx, 21, -24, 4.6);
}

function drawDexter(ctx, fur) {
  const lo = shade(fur, -0.3);
  const belly = shade(fur, 0.45);

  ctx.fillStyle = lo;
  ctx.beginPath();
  ctx.moveTo(8, 16);
  ctx.quadraticCurveTo(28, 14, 32, -4);
  ctx.lineTo(16, 22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f59e0b';
  for (let i = 0; i < 4; i += 1) {
    const sx = 6 + i * 7;
    const sy = -4 + (i < 2 ? i * 8 : (3 - i) * 4 + 8);
    tri(ctx, sx - 3, sy, sx, sy - 6, sx + 3, sy);
  }

  ctx.fillStyle = fur;
  roundFill(ctx, -16, -8, 30, 32, 10);
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(-4, 10, 8, 12, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(-4, -20, 15, 12, -0.1, 0, TAU);
  ctx.fill();
  ctx.fillStyle = belly;
  ctx.beginPath();
  ctx.ellipse(-12, -17, 8, 6, 0, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = shade(fur, -0.6);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(-10, -16, 5, 0.1 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  tri(ctx, -12, -14, -10, -11, -8, -14);

  ctx.fillStyle = '#ffffff';
  dot(ctx, -2, -23, 4.5);
  ctx.fillStyle = shade(fur, -0.65);
  dot(ctx, -2, -23, 2.5);
  ctx.fillStyle = '#ffffff';
  dot(ctx, -3, -24, 1);

  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.ellipse(-4, -30, 18, 4, 0, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-4, -30, 10, Math.PI, 0, false);
  ctx.fill();
  ctx.fillStyle = '#38bdf8';
  dot(ctx, -4, -33, 2.5);
}

function drawCarty(ctx, fur) {
  const lo = shade(fur, -0.35);

  ctx.fillStyle = fur;
  roundFill(ctx, -14, -12, 28, 28, 6);
  ctx.fillStyle = lo;
  ctx.fillRect(-14, 8, 28, 4);

  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(-10, -6, 20, 6);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.fillRect(-9, -5, 6, 2);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, -24);
  ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  dot(ctx, 0, -24, 3);

  ctx.fillStyle = lo;
  roundFill(ctx, -12, 2, 24, 5, 2);
  ctx.fillStyle = '#22c55e';
  dot(ctx, -7, 4.5, 1.4);
  dot(ctx, 0, 4.5, 1.4);
  dot(ctx, 7, 4.5, 1.4);
}

/** Sparky The Sneaker Hound — his own artwork, not Leo's. */
function drawSparky(ctx, fur) {
  const lo = shade(fur, -0.28);
  const pale = shade(fur, 0.5);

  // Wagging tail.
  ctx.strokeStyle = fur;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-11, 12);
  ctx.quadraticCurveTo(-24, 8, -22, -6);
  ctx.stroke();
  ctx.lineCap = 'butt';

  ctx.fillStyle = fur;
  roundFill(ctx, -13, -8, 26, 30, 9);
  ctx.fillStyle = pale;
  ctx.beginPath();
  ctx.ellipse(0, 8, 7.5, 11, 0, 0, TAU);
  ctx.fill();

  // Hound head: broad skull, long muzzle.
  ctx.fillStyle = fur;
  dot(ctx, 0, -21, 13);
  ctx.fillStyle = pale;
  ctx.beginPath();
  ctx.ellipse(0, -14.5, 8, 6, 0, 0, TAU);
  ctx.fill();

  // Long floppy ears, the giveaway of the breed.
  ctx.fillStyle = lo;
  for (let s = -1; s <= 1; s += 2) {
    ctx.beginPath();
    ctx.ellipse(s * 13, -16, 5.5, 13, s * 0.22, 0, TAU);
    ctx.fill();
  }

  // Saddle marking over the eyes.
  ctx.fillStyle = lo;
  ctx.beginPath();
  ctx.arc(0, -24, 12, Math.PI, 0, false);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  dot(ctx, -4.2, -21, 3);
  dot(ctx, 4.2, -21, 3);
  ctx.fillStyle = '#3f2a16';
  dot(ctx, -4.2, -21, 1.8);
  dot(ctx, 4.2, -21, 1.8);
  ctx.fillStyle = '#ffffff';
  dot(ctx, -5, -21.8, 0.8);
  dot(ctx, 3.4, -21.8, 0.8);

  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.ellipse(0, -14.5, 3, 2.2, 0, 0, TAU);
  ctx.fill();

  // Happy open mouth + tongue.
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, -12, 4.2, 0.12 * Math.PI, 0.88 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#fb7185';
  ctx.beginPath();
  ctx.ellipse(0, -8.5, 2.6, 3.4, 0, 0, TAU);
  ctx.fill();

  // The sneaker he is named for.
  ctx.fillStyle = '#f8fafc';
  roundFill(ctx, 10, 15, 22, 9, 4);
  ctx.fillStyle = '#dc2626';
  roundFill(ctx, 12, 14, 14, 6, 3);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(15, 16);
  ctx.lineTo(21, 19);
  ctx.moveTo(21, 16);
  ctx.lineTo(15, 19);
  ctx.stroke();
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(10, 22, 22, 2.5);
}

function drawLeo(ctx, fur) {
  const mane = shade(fur, -0.2);
  const face = shade(fur, 0.35);

  ctx.fillStyle = fur;
  roundFill(ctx, -12, -6, 24, 28, 9);

  ctx.fillStyle = mane;
  dot(ctx, 0, -14, 18);
  ctx.fillStyle = shade(fur, -0.32);
  for (let i = 0; i < 10; i += 1) {
    const ang = (i * TAU) / 10;
    dot(ctx, Math.cos(ang) * 17, -14 + Math.sin(ang) * 17, 4);
  }

  ctx.fillStyle = face;
  dot(ctx, 0, -14, 12);
  ctx.fillStyle = fur;
  dot(ctx, -10, -24, 5);
  dot(ctx, 10, -24, 5);

  ctx.fillStyle = '#1e293b';
  dot(ctx, -4.2, -16, 1.8);
  dot(ctx, 4.2, -16, 1.8);
  ctx.fillStyle = '#ffffff';
  dot(ctx, -4.8, -16.7, 0.7);
  dot(ctx, 3.6, -16.7, 0.7);

  ctx.fillStyle = '#9a3412';
  ctx.beginPath();
  ctx.ellipse(0, -11.5, 2.6, 1.8, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(-2, -9, 2.4, 0, 0.9 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(2, -9, 2.4, 0.1 * Math.PI, Math.PI);
  ctx.stroke();
}

/**
 * Draw the companion at `x`,`y`.
 * `companion` must already be through `normalizeCompanion`.
 */
export function drawCompanion(ctx, companion, opts) {
  const x = opts?.x ?? 0;
  const y = opts?.y ?? 0;
  const scale =
    (findById(PET_SIZES, companion.size, 1)?.scale ?? 1) * (opts?.scale ?? 1);
  const fur = companion.furColor;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  switch (companion.pose) {
    case 'stand':
      ctx.translate(0, -4);
      break;
    case 'leap':
      ctx.translate(0, -8);
      ctx.rotate(-0.17);
      break;
    case 'curl':
      ctx.translate(0, 7);
      ctx.scale(1.08, 0.8);
      break;
    default:
      break;
  }

  drawPetBase(ctx, companion.pose, fur);

  switch (companion.species) {
    case 'finley':
      drawFinley(ctx, fur);
      break;
    case 'luna':
      drawLuna(ctx, fur, companion.name);
      break;
    case 'penny':
      drawPenny(ctx, fur);
      break;
    case 'dexter':
      drawDexter(ctx, fur);
      break;
    case 'carty':
      drawCarty(ctx, fur);
      break;
    case 'sparky':
      drawSparky(ctx, fur);
      break;
    default:
      drawLeo(ctx, fur);
  }

  drawCollar(ctx, companion.collar, companion.collarColor);
  drawPetBadge(ctx, companion.badge);

  ctx.restore();
}
