import Link from 'next/link';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import styles from './ScrollStory.module.css';

/**
 * A scroll-scrubbed 3D story: a tall section whose sticky viewport plays a
 * Three.js scene as the page scrolls, with DOM captions keyed to the same
 * damped progress as the camera.
 *
 * The route supplies `loadScene`, an async factory that receives
 * `{ THREE, renderer, mobile, reduced }` and returns
 * `{ update(progress, seconds), resize(width, height), dispose() }`.
 * Three.js is imported on the client only, after mount, so the server render
 * is just the captions — which is also what a visitor without WebGL, or one
 * who asked for reduced motion and has no GPU to spare, gets to read.
 *
 * captions: [{ at: [from, to], kicker, title, body, ctas: [{ href, label, primary }] }]
 */

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const span = (p, a, b) => clamp01((p - a) / (b - a));

export const ScrollStory = ({
  id,
  label,
  captions,
  loadScene,
  height = 600,
  mobileHeight = 520,
  tone = 'dark',
  skipTo = null,
}) => {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const capRefs = useRef([]);
  const dotRefs = useRef([]);
  const cueRef = useRef(null);
  const [state, setState] = useState('loading'); // loading | ready | static

  // The scene is built once per mount; later caption or loader identities
  // (an inline array, a new arrow) must not tear down and rebuild WebGL.
  const captionsRef = useRef(captions);
  captionsRef.current = captions;
  const loadSceneRef = useRef(loadScene);
  loadSceneRef.current = loadScene;

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    let disposed = false;
    let frame = 0;
    let cleanup = () => {};
    let isStatic = false;

    // Without the scene every caption is laid out and visible, so none of
    // them may stay inert from the scroll-driven fade.
    const goStatic = () => {
      if (disposed) return;
      isStatic = true;
      capRefs.current.forEach((el) => {
        if (el) el.inert = false;
      });
      setState('static');
    };

    const fade = (p, [a, b]) => {
      const fadeIn = a <= 0 ? 1 : span(p, a - 0.02, a + 0.02);
      const fadeOut = b >= 1 ? 1 : 1 - span(p, b - 0.02, b + 0.02);
      return Math.min(fadeIn, fadeOut);
    };

    // The sticky viewport is pinned below the site header (--story-top).
    const progressOf = () => {
      const top = parseFloat(root.style.getPropertyValue('--story-top')) || 0;
      const r = root.getBoundingClientRect();
      return clamp01(
        (top - r.top) / Math.max(1, r.height - (window.innerHeight - top))
      );
    };

    const paintCaptions = (p) => {
      if (isStatic) return;
      let current = 0;
      captionsRef.current.forEach((cap, i) => {
        const el = capRefs.current[i];
        if (!el) return;
        const o = fade(p, cap.at);
        el.style.opacity = o.toFixed(3);
        el.style.setProperty('--shift', (1 - o).toFixed(3));
        el.toggleAttribute('data-on', o > 0.05);
        // A caption you cannot see cannot take focus either.
        el.inert = o <= 0.05;
        if (p >= cap.at[0] - 0.03) current = i;
      });
      dotRefs.current.forEach((d, i) =>
        i === current
          ? d?.setAttribute('aria-current', 'step')
          : d?.removeAttribute('aria-current')
      );
      if (cueRef.current)
        cueRef.current.style.opacity = String(1 - span(p, 0.01, 0.05));
    };

    // The site's own sticky header and promo bar sit over the top of the
    // page; start the story's viewport below whatever is pinned there.
    const measureTop = () => {
      let bottom = 0;
      document.querySelectorAll('body *').forEach((el) => {
        if (root.contains(el)) return;
        const { position } = getComputedStyle(el);
        if (position !== 'fixed' && position !== 'sticky') return;
        const r = el.getBoundingClientRect();
        if (
          r.top <= 1 &&
          r.height < window.innerHeight * 0.4 &&
          r.width > window.innerWidth * 0.6
        )
          bottom = Math.max(bottom, r.bottom);
      });
      root.style.setProperty('--story-top', `${Math.round(bottom)}px`);
    };
    // Measuring walks the page, so at most once a frame however fast resizes fire.
    let topFrame = 0;
    const syncTop = () => {
      cancelAnimationFrame(topFrame);
      topFrame = requestAnimationFrame(measureTop);
    };
    measureTop();
    window.addEventListener('resize', syncTop);

    // Captions work without the scene, so they track scroll from the start.
    const onScroll = () => paintCaptions(progressOf());
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    (async () => {
      let THREE;
      try {
        THREE = await import('three');
      } catch {
        goStatic();
        return;
      }
      if (disposed) return;

      const mobile = window.matchMedia('(max-width: 760px)').matches;
      const reducedQuery = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        });
      } catch {
        goStatic();
        return;
      }
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, mobile ? 1.6 : 2)
      );
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      let scene;
      try {
        scene = await loadSceneRef.current({
          THREE,
          renderer,
          mobile,
          reduced: reducedQuery.matches,
        });
      } catch (error) {
        console.warn(`[${id}] 3D story fell back to text`, error);
        renderer.dispose();
        renderer.forceContextLoss();
        goStatic();
        return;
      }
      if (disposed) {
        scene.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        return;
      }

      const resize = () => {
        const { clientWidth: w, clientHeight: h } = canvas;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        scene.resize(w, h);
      };
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      resize();

      let progress = progressOf();
      let last = performance.now();
      setState('ready');

      /**
       * With reduced motion the story does not glide: each chapter is shown
       * at rest, and scrolling cuts from one to the next.
       */
      const restingProgress = (p) => {
        const caps = captionsRef.current;
        let i = 0;
        caps.forEach((cap, k) => {
          if (p >= cap.at[0] - 0.03) i = k;
        });
        const [a, b] = caps[i].at;
        return Math.min(1, (a + Math.min(b, 1)) / 2);
      };

      const tick = (now) => {
        frame = requestAnimationFrame(tick);
        // Damp with the real frame interval so the scene keeps pace with the captions at any fps.
        const dt = Math.min(0.25, (now - last) / 1000);
        last = now;
        const target = progressOf();
        if (reducedQuery.matches) progress = restingProgress(target);
        else progress += (target - progress) * (1 - Math.exp(-dt * 7));
        scene.update(progress, now / 1000, reducedQuery.matches);
        renderer.render(scene.scene, scene.camera);
        paintCaptions(reducedQuery.matches ? target : progress);
      };

      // Off screen, the loop stops entirely and restarts on the way back.
      const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting && !frame) {
          last = performance.now();
          frame = requestAnimationFrame(tick);
        } else if (!entry.isIntersecting && frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      });
      io.observe(root);
      frame = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        io.disconnect();
        scene.dispose();
        renderer.dispose();
        // dispose() keeps the WebGL context alive; browsers cap live contexts.
        renderer.forceContextLoss();
      };
    })();

    return () => {
      disposed = true;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', syncTop);
      cancelAnimationFrame(topFrame);
      cleanup();
    };
  }, [id]);

  const goTo = (i) => {
    const root = rootRef.current;
    if (!root) return;
    const pinned = parseFloat(root.style.getPropertyValue('--story-top')) || 0;
    const top = root.getBoundingClientRect().top + window.scrollY - pinned;
    const travel = root.offsetHeight - (window.innerHeight - pinned);
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches;
    window.scrollTo({
      top: top + travel * (captions[i].at[0] + 0.02),
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  return (
    <section
      ref={rootRef}
      id={id}
      className={`${styles.story} ${styles[tone] ?? ''} ${state === 'static' ? styles.isStatic : ''}`}
      aria-label={label}
      style={{
        '--story-height': `${height}vh`,
        '--story-height-mobile': `${mobileHeight}vh`,
      }}
    >
      <div className={styles.sticky}>
        <canvas
          ref={canvasRef}
          className={`${styles.canvas} ${state === 'ready' ? styles.canvasReady : ''}`}
          aria-hidden="true"
        />
        {state === 'loading' && (
          <div className={styles.loading} aria-hidden="true" />
        )}

        <div className={styles.captions}>
          {captions.map((cap, i) => (
            <article
              key={cap.title}
              ref={(el) => (capRefs.current[i] = el)}
              className={styles.caption}
              data-on={i === 0 ? '' : undefined}
              style={i === 0 ? undefined : { opacity: 0 }}
            >
              {cap.kicker && (
                <p className={styles.kicker}>
                  {i > 0 && i < captions.length - 1 && (
                    <b>{String(i).padStart(2, '0')}</b>
                  )}
                  {cap.kicker}
                </p>
              )}
              <h2 className={styles.title}>{cap.title}</h2>
              {cap.body && <p className={styles.body}>{cap.body}</p>}
              {cap.ctas?.length > 0 && (
                <div className={styles.ctas}>
                  {cap.ctas.map((cta) => (
                    <Link
                      key={cta.href}
                      href={cta.href}
                      className={
                        cta.primary ? styles.ctaPrimary : styles.ctaGhost
                      }
                    >
                      {cta.label}
                    </Link>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>

        <ol className={styles.dots} aria-label="Story chapters">
          {captions.map((cap, i) => (
            <li key={cap.title}>
              <button
                type="button"
                ref={(el) => (dotRefs.current[i] = el)}
                aria-label={cap.kicker || cap.title}
                onClick={() => goTo(i)}
              />
            </li>
          ))}
        </ol>

        <div ref={cueRef} className={styles.cue} aria-hidden="true">
          Scroll
        </div>
        {skipTo && (
          <a className={styles.skip} href={skipTo}>
            Skip the story
          </a>
        )}
      </div>
    </section>
  );
};

ScrollStory.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  captions: PropTypes.arrayOf(
    PropTypes.shape({
      at: PropTypes.arrayOf(PropTypes.number).isRequired,
      kicker: PropTypes.string,
      title: PropTypes.string.isRequired,
      body: PropTypes.string,
      ctas: PropTypes.arrayOf(
        PropTypes.shape({
          href: PropTypes.string,
          label: PropTypes.string,
          primary: PropTypes.bool,
        })
      ),
    })
  ).isRequired,
  loadScene: PropTypes.func.isRequired,
  height: PropTypes.number,
  mobileHeight: PropTypes.number,
  tone: PropTypes.oneOf(['dark', 'light']),
  skipTo: PropTypes.string,
};
