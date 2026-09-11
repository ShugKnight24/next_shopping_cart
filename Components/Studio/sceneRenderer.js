import {
  getDefaultSceneForTheme,
  TIME_OF_DAY_OPTIONS,
} from './sceneEnvironments';

/**
 * Hyper-Realistic Procedural 2D Canvas Scene Environments Renderer
 *
 * Renders layered atmospheric environments for children's storybooks:
 * - Multi-stop gradient skyboxes & atmospheres
 * - Procedural depth planes (mountains, canopies, towers, reefs, clouds)
 * - Volumetric lighting (sunbeams, light caustics, searchlights, auroras)
 * - Organic sinusoidal animated motion (stars, fireflies, bubbles, mist, snow)
 * - Time-of-day lighting washes and weather overlays
 */

export function drawEnvironmentScene(
  ctx,
  {
    sceneId = 'cosmic_nebula',
    stageX,
    stageY,
    stageW,
    stageH,
    time = 0,
    theme = 'space',
    timeOfDay = 'midnight',
    weatherEffect = 'none',
    isFullBleed = false,
  }
) {
  if (!ctx) return;

  const activeSceneId = sceneId || getDefaultSceneForTheme(theme);

  ctx.save();

  // Establish clipping mask for the illustration stage
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(stageX, stageY, stageW, stageH, isFullBleed ? 4 : 8);
  } else {
    ctx.rect(stageX, stageY, stageW, stageH);
  }
  ctx.clip();

  switch (activeSceneId) {
    case 'cosmic_nebula': {
      // Deep space void gradient
      const skyGrad = ctx.createLinearGradient(
        stageX,
        stageY,
        stageX + stageW,
        stageY + stageH
      );
      skyGrad.addColorStop(0, '#030712');
      skyGrad.addColorStop(0.4, '#0f172a');
      skyGrad.addColorStop(0.8, '#1e1b4b');
      skyGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(stageX, stageY, stageW, stageH);

      // Glowing Magenta & Violet Nebula Cloud
      const nebulaGrad1 = ctx.createRadialGradient(
        stageX + stageW * 0.75,
        stageY + stageH * 0.28,
        10,
        stageX + stageW * 0.75,
        stageY + stageH * 0.28,
        stageW * 0.45
      );
      nebulaGrad1.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
      nebulaGrad1.addColorStop(0.5, 'rgba(99, 102, 241, 0.22)');
      nebulaGrad1.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = nebulaGrad1;
      ctx.fillRect(stageX, stageY, stageW, stageH);

      // Glowing Cyan Stardust Pocket
      const nebulaGrad2 = ctx.createRadialGradient(
        stageX + stageW * 0.25,
        stageY + stageH * 0.68,
        5,
        stageX + stageW * 0.25,
        stageY + stageH * 0.68,
        stageW * 0.38
      );
      nebulaGrad2.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      nebulaGrad2.addColorStop(0.6, 'rgba(14, 165, 233, 0.12)');
      nebulaGrad2.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = nebulaGrad2;
      ctx.fillRect(stageX, stageY, stageW, stageH);

      // Starfield with dynamic twinkling alphas
      for (let i = 0; i < 42; i++) {
        const sx = stageX + (((i * 47 + 17) % 997) / 997) * stageW;
        const sy = stageY + (((i * 73 + 31) % 991) / 991) * stageH;
        const sr = 0.8 + (i % 3) * 0.7;
        const alpha = Math.max(
          0.15,
          Math.min(1, 0.35 + 0.6 * Math.sin(time * 2.2 + i * 1.7))
        );

        ctx.fillStyle =
          i % 5 === 0
            ? `rgba(186, 230, 253, ${alpha})`
            : `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();

        // Cross diffraction flares on prominent stars
        if (i % 9 === 0) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.65})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(sx - sr * 3.5, sy);
          ctx.lineTo(sx + sr * 3.5, sy);
          ctx.moveTo(sx, sy - sr * 3.5);
          ctx.lineTo(sx, sy + sr * 3.5);
          ctx.stroke();
        }
      }

      // Massive Ringed Gas Giant Planet
      const px = stageX + stageW * 0.72;
      const py = stageY + stageH * 0.32;
      const pr = stageW * 0.14;

      // Planet Sphere
      const planetGrad = ctx.createRadialGradient(
        px - pr * 0.35,
        py - pr * 0.35,
        pr * 0.1,
        px,
        py,
        pr
      );
      planetGrad.addColorStop(0, '#fde047');
      planetGrad.addColorStop(0.3, '#f59e0b');
      planetGrad.addColorStop(0.7, '#ea580c');
      planetGrad.addColorStop(1, '#431407');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();

      // Translucent Planetary Rings
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.38);
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.45)';
      ctx.lineWidth = pr * 0.22;
      ctx.beginPath();
      ctx.ellipse(0, 0, pr * 1.9, pr * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.lineWidth = pr * 0.08;
      ctx.beginPath();
      ctx.ellipse(0, 0, pr * 2.15, pr * 0.52, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Distant Cratered Crescent Moon
      const mx = stageX + stageW * 0.2;
      const my = stageY + stageH * 0.22;
      const mr = stageW * 0.06;
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(mx + mr * 0.4, my - mr * 0.2, mr * 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Periodic Shooting Star / Comet
      const cometCycle = (time * 0.35) % 4.5;
      if (cometCycle < 1.4) {
        const progress = cometCycle / 1.4;
        const cx = stageX + stageW * 0.85 - progress * stageW * 0.6;
        const cy = stageY + stageH * 0.1 + progress * stageH * 0.45;
        const cometGrad = ctx.createLinearGradient(cx, cy, cx + 45, cy - 25);
        cometGrad.addColorStop(0, '#ffffff');
        cometGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.8)');
        cometGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.strokeStyle = cometGrad;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 45, cy - 25);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'enchanted_forest': {
      // Twilight forest canopy sky
      const forestSky = ctx.createLinearGradient(
        stageX,
        stageY,
        stageX,
        stageY + stageH
      );
      forestSky.addColorStop(0, '#022c22');
      forestSky.addColorStop(0.4, '#064e3b');
      forestSky.addColorStop(0.8, '#14532d');
      forestSky.addColorStop(1, '#052e16');
      ctx.fillStyle = forestSky;
      ctx.fillRect(stageX, stageY, stageW, stageH);

      // Distant misty pine silhouettes
      ctx.fillStyle = 'rgba(6, 78, 59, 0.45)';
      for (let x = stageX; x <= stageX + stageW + 30; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, stageY + stageH * 0.65);
        ctx.lineTo(x + 16, stageY + stageH * 0.35);
        ctx.lineTo(x + 32, stageY + stageH * 0.65);
        ctx.closePath();
        ctx.fill();
      }

      // Volumetric Sunbeams / God-Rays filtering through canopy
      ctx.save();
      const beamGrad = ctx.createLinearGradient(
        stageX + stageW * 0.1,
        stageY,
        stageX + stageW * 0.7,
        stageY + stageH
      );
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
      beamGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.12)');
      beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = beamGrad;
      ctx.beginPath();
      ctx.moveTo(stageX + stageW * 0.15, stageY);
      ctx.lineTo(stageX + stageW * 0.45, stageY);
      ctx.lineTo(stageX + stageW * 0.75, stageY + stageH);
      ctx.lineTo(stageX + stageW * 0.35, stageY + stageH);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Rolling Mossy Forest Floor
      const groundGrad = ctx.createLinearGradient(
        stageX,
        stageY + stageH * 0.65,
        stageX,
        stageY + stageH
      );
      groundGrad.addColorStop(0, '#14532d');
      groundGrad.addColorStop(0.6, '#0f3a22');
      groundGrad.addColorStop(1, '#022c22');
      ctx.fillStyle = groundGrad;
      ctx.beginPath();
      ctx.moveTo(stageX, stageY + stageH * 0.72);
      ctx.quadraticCurveTo(
        stageX + stageW * 0.3,
        stageY + stageH * 0.65,
        stageX + stageW * 0.6,
        stageY + stageH * 0.75
      );
      ctx.quadraticCurveTo(
        stageX + stageW * 0.85,
        stageY + stageH * 0.82,
        stageX + stageW,
        stageY + stageH * 0.7
      );
      ctx.lineTo(stageX + stageW, stageY + stageH);
      ctx.lineTo(stageX, stageY + stageH);
      ctx.closePath();
      ctx.fill();

      // Giant Ancient Oak Tree Trunk on right
      const tx = stageX + stageW * 0.84;
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.moveTo(tx - 24, stageY + stageH);
      ctx.quadraticCurveTo(tx - 18, stageY + stageH * 0.5, tx - 12, stageY);
      ctx.lineTo(tx + 40, stageY);
      ctx.quadraticCurveTo(
        tx + 32,
        stageY + stageH * 0.5,
        tx + 48,
        stageY + stageH
      );
      ctx.closePath();
      ctx.fill();

      // Oak tree hollow with warm starlight glow inside
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(tx + 4, stageY + stageH * 0.58, 7, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(tx + 4, stageY + stageH * 0.58, 5.5, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Spreading canopy leaves
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(tx - 20, stageY + 20, 48, 0, Math.PI * 2);
      ctx.arc(tx + 20, stageY + 30, 42, 0, Math.PI * 2);
      ctx.arc(tx - 60, stageY + 35, 36, 0, Math.PI * 2);
      ctx.fill();

      // Bioluminescent Mushrooms on ground
      [
        [stageX + stageW * 0.22, stageY + stageH * 0.74, '#38bdf8'],
        [stageX + stageW * 0.26, stageY + stageH * 0.76, '#38bdf8'],
        [stageX + stageW * 0.52, stageY + stageH * 0.82, '#a855f7'],
      ].forEach(([mx, my, col]) => {
        // Stalk
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(mx - 1.5, my, 3, 7);
        // Glowing cap
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(mx, my, 5, Math.PI, 0, false);
        ctx.fill();
        // Radiance glow
        ctx.fillStyle = col;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(mx, my, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Floating Animated Fireflies
      for (let i = 0; i < 18; i++) {
        const fx =
          stageX +
          (((i * 53 + 23) % 887) / 887) * stageW +
          Math.sin(time * 1.4 + i) * 12;
        const fy =
          stageY +
          stageH * 0.4 +
          (((i * 41 + 11) % 661) / 661) * (stageH * 0.5) +
          Math.cos(time * 1.8 + i) * 8;
        const glow = Math.max(0.1, 0.3 + 0.7 * Math.sin(time * 3.2 + i * 1.8));

        ctx.fillStyle = `rgba(250, 204, 21, ${glow * 0.4})`;
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${glow})`;
        ctx.beginPath();
        ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'jurassic_valley': {
      // Golden hour prehistoric dawn sky
      const skyGrad = ctx.createLinearGradient(
        stageX,
        stageY,
        stageX,
        stageY + stageH
      );
      skyGrad.addColorStop(0, '#78350f');
      skyGrad.addColorStop(0.3, '#d97706');
      skyGrad.addColorStop(0.65, '#f59e0b');
      skyGrad.addColorStop(1, '#fef08a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(stageX, stageY, stageW, stageH);

      // Distant Volcanic Peaks
      ctx.fillStyle = '#7c2d12';
      ctx.beginPath();
      ctx.moveTo(stageX + stageW * 0.15, stageY + stageH * 0.65);
      ctx.lineTo(stageX + stageW * 0.35, stageY + stageH * 0.28);
      ctx.lineTo(stageX + stageW * 0.55, stageY + stageH * 0.65);
      ctx.closePath();
      ctx.fill();

      // Smoke plume from volcano
      ctx.fillStyle = 'rgba(120, 53, 15, 0.4)';
      ctx.beginPath();
      ctx.arc(
        stageX + stageW * 0.35,
        stageY + stageH * 0.24,
        8,
        0,
        Math.PI * 2
      );
      ctx.arc(
        stageX + stageW * 0.37,
        stageY + stageH * 0.18,
        12,
        0,
        Math.PI * 2
      );
      ctx.arc(
        stageX + stageW * 0.4,
        stageY + stageH * 0.11,
        16,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Midground canyon wall with Twin Waterfalls
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(stageX + stageW * 0.45, stageY + stageH * 0.72);
      ctx.lineTo(stageX + stageW * 0.7, stageY + stageH * 0.38);
      ctx.lineTo(stageX + stageW, stageY + stageH * 0.45);
      ctx.lineTo(stageX + stageW, stageY + stageH);
      ctx.lineTo(stageX + stageW * 0.45, stageY + stageH);
      ctx.closePath();
      ctx.fill();

      // Cascading Waterfall stream
      const wfx = stageX + stageW * 0.78;
      const wfy = stageY + stageH * 0.42;
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.rect(wfx, wfy, 6, stageH * 0.45);
      ctx.rect(wfx + 10, wfy + 6, 4, stageH * 0.4);
      ctx.fill();

      // Mist spray cloud at waterfall base
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(wfx + 5, stageY + stageH * 0.86, 14, 0, Math.PI * 2);
      ctx.arc(wfx + 14, stageY + stageH * 0.88, 10, 0, Math.PI * 2);
      ctx.fill();

      // Giant prehistoric cycads & fern fronds in foreground
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 2.5;
      const fx = stageX + 18;
      const fy = stageY + stageH;
      for (let a = -0.8; a <= 0.8; a += 0.35) {
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.quadraticCurveTo(
          fx + Math.sin(a) * 35,
          fy - 40,
          fx + Math.sin(a) * 55,
          fy - 65
        );
        ctx.stroke();
      }

      // Soaring Pterodactyl silhouettes
      for (let p = 0; p < 3; p++) {
        const px =
          stageX + stageW * (0.25 + p * 0.22) + Math.sin(time * 0.8 + p) * 15;
        const py =
          stageY + stageH * (0.18 + p * 0.08) + Math.cos(time * 0.9 + p) * 6;
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        // Wings
        ctx.moveTo(px, py);
        ctx.lineTo(px - 14, py - 6);
        ctx.lineTo(px - 6, py);
        ctx.lineTo(px, py + 2);
        ctx.lineTo(px + 6, py);
        ctx.lineTo(px + 14, py - 6);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'neon_metropolis': {
      // Cyberpunk deep midnight violet sky
      const citySky = ctx.createLinearGradient(
        stageX,
        stageY,
        stageX,
        stageY + stageH
      );
      citySky.addColorStop(0, '#090d16');
      citySky.addColorStop(0.5, '#1e1b4b');
      citySky.addColorStop(1, '#311042');
      ctx.fillStyle = citySky;
      ctx.fillRect(stageX, stageY, stageW, stageH);

      // Sweeping Searchlight Beams across sky
      const beamAngle = Math.sin(time * 0.6) * 0.35;
      ctx.save();
      ctx.translate(stageX + stageW * 0.5, stageY + stageH * 0.8);
      ctx.rotate(beamAngle);
      const searchGrad = ctx.createLinearGradient(0, 0, 0, -stageH * 0.9);
      searchGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      searchGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = searchGrad;
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(8, 0);
      ctx.lineTo(36, -stageH * 0.9);
      ctx.lineTo(-36, -stageH * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Background skyscraper silhouettes
      ctx.fillStyle = '#0f172a';
      const bldgs = [
        [stageX + 10, 45, stageH * 0.6],
        [stageX + 55, 38, stageH * 0.72],
        [stageX + 100, 50, stageH * 0.55],
        [stageX + 155, 42, stageH * 0.78],
        [stageX + 205, 52, stageH * 0.62],
        [stageX + stageW - 85, 48, stageH * 0.68],
        [stageX + stageW - 40, 40, stageH * 0.58],
      ];
      bldgs.forEach(([bx, bw, bh]) => {
        ctx.fillRect(bx, stageY + stageH - bh, bw, bh);

        // Glowing neon window dots
        for (
          let wy = stageY + stageH - bh + 14;
          wy < stageY + stageH - 10;
          wy += 12
        ) {
          for (let wx = bx + 6; wx < bx + bw - 6; wx += 9) {
            const isLit = (wx * 13 + wy * 19) % 5 < 2;
            if (isLit) {
              ctx.fillStyle =
                (wx + wy) % 3 === 0
                  ? '#38bdf8'
                  : (wx + wy) % 3 === 1
                    ? '#ec4899'
                    : '#facc15';
              ctx.fillRect(wx, wy, 4, 5);
            }
          }
        }
      });

      // Cruising Futuristic Hover Airship / Flying Sneaker Cruiser
      const hx = stageX + ((time * 30) % (stageW + 100)) - 40;
      const hy = stageY + stageH * 0.3 + Math.sin(time * 1.5) * 6;
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(hx, hy, 36, 12, 5);
      else ctx.rect(hx, hy, 36, 12);
      ctx.fill();
      // Cyan trail
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(hx, hy + 6);
      ctx.lineTo(hx - 24, hy + 6);
      ctx.stroke();
      break;
    }

    case 'coral_kingdom': {
      // Underwater turquoise to deep ocean abyss
      const seaGrad = ctx.createLinearGradient(
        stageX,
        stageY,
        stageX,
        stageY + stageH
      );
      seaGrad.addColorStop(0, '#38bdf8');
      seaGrad.addColorStop(0.35, '#0284c7');
      seaGrad.addColorStop(0.75, '#075985');
      seaGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = seaGrad;
      ctx.fillRect(stageX, stageY, stageW, stageH);

      // Dancing sunlight water caustics streaming down
      for (let c = 0; c < 5; c++) {
        const cx =
          stageX + stageW * (0.15 + c * 0.2) + Math.sin(time * 0.9 + c) * 10;
        const cGrad = ctx.createLinearGradient(
          cx,
          stageY,
          cx + 20,
          stageY + stageH * 0.85
        );
        cGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        cGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.12)');
        cGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 8, stageY);
        ctx.lineTo(cx + 8, stageY);
        ctx.lineTo(cx + 35, stageY + stageH * 0.85);
        ctx.lineTo(cx + 10, stageY + stageH * 0.85);
        ctx.closePath();
        ctx.fill();
      }

      // Coral Reef Floor Shelves
      ctx.fillStyle = '#be123c';
      ctx.beginPath();
      ctx.arc(stageX + 30, stageY + stageH - 10, 36, Math.PI, 0, false);
      ctx.arc(stageX + 75, stageY + stageH - 15, 28, Math.PI, 0, false);
      ctx.fill();

      // Purple Sea Fan
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath();
      ctx.arc(
        stageX + stageW - 40,
        stageY + stageH - 10,
        42,
        Math.PI,
        0,
        false
      );
      ctx.fill();

      // Swaying giant emerald kelp fronds
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 3.5;
      for (let k = 0; k < 4; k++) {
        const kx = stageX + 45 + k * 18;
        ctx.beginPath();
        ctx.moveTo(kx, stageY + stageH);
        for (let y = stageY + stageH; y > stageY + stageH * 0.35; y -= 20) {
          const sway = Math.sin(time * 1.8 + y * 0.05 + k) * 8;
          ctx.lineTo(kx + sway, y);
        }
        ctx.stroke();
      }

      // Bioluminescent Jellyfish
      const jx = stageX + stageW * 0.65;
      const jy = stageY + stageH * 0.4 + Math.sin(time * 1.6) * 12;
      ctx.fillStyle = 'rgba(236, 72, 153, 0.65)';
      ctx.beginPath();
      ctx.arc(jx, jy, 16, Math.PI, 0, false);
      ctx.fill();
      // Trailing tentacles
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.55)';
      ctx.lineWidth = 1.4;
      for (let t = -10; t <= 10; t += 5) {
        ctx.beginPath();
        ctx.moveTo(jx + t, jy);
        ctx.quadraticCurveTo(
          jx + t + Math.sin(time * 2 + t) * 6,
          jy + 18,
          jx + t,
          jy + 32
        );
        ctx.stroke();
      }

      // Rising air bubbles with specular gleam
      for (let b = 0; b < 16; b++) {
        const bx =
          stageX +
          (((b * 67 + 29) % 941) / 941) * stageW +
          Math.sin(time * 2 + b) * 4;
        const by = stageY + stageH - ((time * 30 + b * 26) % (stageH + 20));
        const br = 2 + (b % 4);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(bx - br * 0.3, by - br * 0.3, br * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'dreamland_castle': {
      // Twilight bedtime violet & pastel peach sky
      const dreamSky = ctx.createLinearGradient(
        stageX,
        stageY,
        stageX,
        stageY + stageH
      );
      dreamSky.addColorStop(0, '#1e1b4b');
      dreamSky.addColorStop(0.4, '#4c1d95');
      dreamSky.addColorStop(0.75, '#831843');
      dreamSky.addColorStop(1, '#fb7185');
      ctx.fillStyle = dreamSky;
      ctx.fillRect(stageX, stageY, stageW, stageH);

      // Sleeping Golden Crescent Moon
      const mx = stageX + stageW * 0.76;
      const my = stageY + stageH * 0.28;
      const mr = stageW * 0.12;

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(mx, my, mr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4c1d95';
      ctx.beginPath();
      ctx.arc(mx + mr * 0.42, my - mr * 0.15, mr * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // Moon Sleeping Eye & Smile
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(
        mx - mr * 0.2,
        my - mr * 0.1,
        4,
        0.1 * Math.PI,
        0.9 * Math.PI,
        false
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(
        mx - mr * 0.15,
        my + mr * 0.2,
        5,
        0.1 * Math.PI,
        0.9 * Math.PI,
        false
      );
      ctx.stroke();

      // Billowing Fluffy Cloud Pillows
      ctx.fillStyle = '#fdf4ff';
      const cloudPuffs = [
        [stageX + 30, stageY + stageH * 0.72, 45],
        [stageX + 85, stageY + stageH * 0.68, 55],
        [stageX + 155, stageY + stageH * 0.74, 50],
        [stageX + 225, stageY + stageH * 0.69, 58],
        [stageX + stageW - 50, stageY + stageH * 0.73, 50],
      ];
      cloudPuffs.forEach(([cx, cy, cr]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, cr, 0, Math.PI * 2);
        ctx.fill();
      });

      // Whimsical fairytale palace turrets perched on clouds
      const kx = stageX + stageW * 0.35;
      const ky = stageY + stageH * 0.62;
      ctx.fillStyle = '#ede9fe';
      ctx.fillRect(kx - 18, ky - 35, 36, 40);
      // Purple conical turret roof
      ctx.fillStyle = '#7c3aed';
      ctx.beginPath();
      ctx.moveTo(kx - 22, ky - 35);
      ctx.lineTo(kx, ky - 65);
      ctx.lineTo(kx + 22, ky - 35);
      ctx.closePath();
      ctx.fill();
      // Gold flag on top
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(kx, ky - 75, 1.5, 10);
      ctx.beginPath();
      ctx.moveTo(kx + 1.5, ky - 75);
      ctx.lineTo(kx + 12, ky - 70);
      ctx.lineTo(kx + 1.5, ky - 65);
      ctx.closePath();
      ctx.fill();

      // Hanging Starlight Lanterns
      [kx - 45, kx + 45].forEach((lx) => {
        ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, stageY);
        ctx.lineTo(lx, stageY + stageH * 0.42);
        ctx.stroke();

        // Brass lantern
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(lx - 5, stageY + stageH * 0.42, 10, 14);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(lx, stageY + stageH * 0.42 + 7, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'rainbow_meadow': {
      // Sunny morning sky
      const skyGrad = ctx.createLinearGradient(
        stageX,
        stageY,
        stageX,
        stageY + stageH
      );
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.4, '#38bdf8');
      skyGrad.addColorStop(0.8, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(stageX, stageY, stageW, stageH);

      // Translucent 7-Color Rainbow Arch spanning horizon
      const rx = stageX + stageW * 0.5;
      const ry = stageY + stageH * 0.85;
      const rainbowColors = [
        'rgba(239, 68, 68, 0.5)', // Red
        'rgba(249, 115, 22, 0.5)', // Orange
        'rgba(234, 179, 8, 0.5)', // Yellow
        'rgba(34, 197, 94, 0.5)', // Green
        'rgba(59, 130, 246, 0.5)', // Blue
        'rgba(168, 85, 247, 0.5)', // Purple
      ];
      rainbowColors.forEach((rc, idx) => {
        ctx.strokeStyle = rc;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(
          rx,
          ry,
          stageW * 0.55 - idx * 5.5,
          Math.PI * 1.1,
          Math.PI * 1.9,
          false
        );
        ctx.stroke();
      });

      // Rolling Emerald Hills
      const hillGrad = ctx.createLinearGradient(
        stageX,
        stageY + stageH * 0.55,
        stageX,
        stageY + stageH
      );
      hillGrad.addColorStop(0, '#22c55e');
      hillGrad.addColorStop(0.7, '#16a34a');
      hillGrad.addColorStop(1, '#15803d');
      ctx.fillStyle = hillGrad;
      ctx.beginPath();
      ctx.moveTo(stageX, stageY + stageH * 0.68);
      ctx.quadraticCurveTo(
        stageX + stageW * 0.35,
        stageY + stageH * 0.55,
        stageX + stageW * 0.65,
        stageY + stageH * 0.68
      );
      ctx.quadraticCurveTo(
        stageX + stageW * 0.85,
        stageY + stageH * 0.76,
        stageX + stageW,
        stageY + stageH * 0.64
      );
      ctx.lineTo(stageX + stageW, stageY + stageH);
      ctx.lineTo(stageX, stageY + stageH);
      ctx.closePath();
      ctx.fill();

      // Wildflowers dots across the hills
      for (let f = 0; f < 24; f++) {
        const fx = stageX + (((f * 43 + 19) % 877) / 877) * stageW;
        const fy =
          stageY +
          stageH * 0.7 +
          (((f * 31 + 7) % 521) / 521) * (stageH * 0.25);
        ctx.fillStyle =
          f % 3 === 0 ? '#ef4444' : f % 3 === 1 ? '#facc15' : '#ffffff';
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'winter_aurora': {
      // Arctic midnight deep sky
      const skyGrad = ctx.createLinearGradient(
        stageX,
        stageY,
        stageX,
        stageY + stageH
      );
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(0.5, '#064e3b');
      skyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(stageX, stageY, stageW, stageH);

      // Northern Lights (Aurora Borealis) waving curtains
      ctx.save();
      const wave = Math.sin(time * 0.8) * 15;
      const auroraGrad = ctx.createLinearGradient(
        stageX,
        stageY + stageH * 0.15,
        stageX + stageW,
        stageY + stageH * 0.5
      );
      auroraGrad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
      auroraGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.35)');
      auroraGrad.addColorStop(1, 'rgba(236, 72, 153, 0.25)');
      ctx.fillStyle = auroraGrad;
      ctx.beginPath();
      ctx.moveTo(stageX, stageY + stageH * 0.45 + wave);
      ctx.quadraticCurveTo(
        stageX + stageW * 0.3,
        stageY + stageH * 0.15 - wave,
        stageX + stageW * 0.6,
        stageY + stageH * 0.35 + wave
      );
      ctx.quadraticCurveTo(
        stageX + stageW * 0.85,
        stageY + stageH * 0.2 - wave,
        stageX + stageW,
        stageY + stageH * 0.4
      );
      ctx.lineTo(stageX + stageW, stageY + stageH * 0.1);
      ctx.lineTo(stageX, stageY + stageH * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Snow-covered fir tree silhouettes
      ctx.fillStyle = '#064e3b';
      for (let x = stageX + 15; x <= stageX + stageW; x += 36) {
        ctx.beginPath();
        ctx.moveTo(x, stageY + stageH * 0.8);
        ctx.lineTo(x + 14, stageY + stageH * 0.52);
        ctx.lineTo(x + 28, stageY + stageH * 0.8);
        ctx.closePath();
        ctx.fill();
        // Snowy caps on tree
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x + 5, stageY + stageH * 0.68);
        ctx.lineTo(x + 14, stageY + stageH * 0.52);
        ctx.lineTo(x + 23, stageY + stageH * 0.68);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#064e3b';
      }

      // Rolling Snow Banks
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(stageX, stageY + stageH * 0.78);
      ctx.quadraticCurveTo(
        stageX + stageW * 0.4,
        stageY + stageH * 0.72,
        stageX + stageW * 0.7,
        stageY + stageH * 0.82
      );
      ctx.lineTo(stageX + stageW, stageY + stageH);
      ctx.lineTo(stageX, stageY + stageH);
      ctx.closePath();
      ctx.fill();

      // Gently Falling Crystalline Snowflakes
      for (let s = 0; s < 26; s++) {
        const sx =
          stageX +
          (((s * 59 + 17) % 883) / 883) * stageW +
          Math.sin(time * 1.5 + s) * 8;
        const sy = stageY + ((time * 25 + s * 34) % (stageH + 15));
        const sr = 1 + (s % 3) * 0.8;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    default:
      break;
  }

  // Time-of-Day Lighting Wash
  const tod =
    TIME_OF_DAY_OPTIONS.find((t) => t.id === timeOfDay) ||
    TIME_OF_DAY_OPTIONS[0];
  if (tod && tod.tint) {
    ctx.fillStyle = tod.tint;
    ctx.fillRect(stageX, stageY, stageW, stageH);
  }

  // Atmospheric Weather Particles Overlay
  if (weatherEffect === 'fireflies') {
    for (let i = 0; i < 16; i++) {
      const fx =
        stageX +
        (((i * 47 + 13) % 919) / 919) * stageW +
        Math.sin(time * 1.5 + i) * 10;
      const fy =
        stageY +
        stageH * 0.3 +
        (((i * 37 + 7) % 647) / 647) * (stageH * 0.6) +
        Math.cos(time * 2 + i) * 8;
      const glow = 0.2 + 0.8 * Math.sin(time * 3 + i);
      ctx.fillStyle = `rgba(250, 204, 21, ${glow * 0.4})`;
      ctx.beginPath();
      ctx.arc(fx, fy, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(255, 255, 255, ${glow})`;
      ctx.beginPath();
      ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (weatherEffect === 'snow') {
    for (let s = 0; s < 24; s++) {
      const sx =
        stageX +
        (((s * 53 + 23) % 877) / 877) * stageW +
        Math.sin(time + s) * 6;
      const sy = stageY + ((time * 28 + s * 29) % (stageH + 15));
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5 + (s % 2), 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (weatherEffect === 'bubbles') {
    for (let b = 0; b < 14; b++) {
      const bx =
        stageX +
        (((b * 61 + 19) % 907) / 907) * stageW +
        Math.sin(time * 1.8 + b) * 5;
      const by = stageY + stageH - ((time * 28 + b * 25) % (stageH + 15));
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bx, by, 3 + (b % 3), 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (weatherEffect === 'sunbeams') {
    const beamGrad = ctx.createLinearGradient(
      stageX + stageW * 0.2,
      stageY,
      stageX + stageW * 0.8,
      stageY + stageH
    );
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.3)');
    beamGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.12)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(stageX + stageW * 0.1, stageY);
    ctx.lineTo(stageX + stageW * 0.5, stageY);
    ctx.lineTo(stageX + stageW * 0.8, stageY + stageH);
    ctx.lineTo(stageX + stageW * 0.4, stageY + stageH);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}
