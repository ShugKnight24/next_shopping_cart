import PropTypes from 'prop-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { trackStudioInteraction } from '../../analytics/google';
import {
  Cube3DIcon,
  EyeIcon,
  LayersIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  TimesCircleIcon,
} from '../Icons';
import styles from './Product3DStudio.module.css';

const PRESET_ANGLES = {
  isometric: { x: 14, y: -30, label: '3/4 Studio' },
  lateral: { x: 0, y: 0, label: 'Side Profile' },
  top: { x: -60, y: 0, label: 'Top / Laces' },
  sole: { x: 75, y: -10, label: 'Sole / Grip' },
  heel: { x: 10, y: 155, label: 'Heel View' },
};

function getCategoryHotspots(category) {
  const cat = (category || '').toLowerCase();

  if (
    cat.includes('footwear') ||
    cat.includes('shoe') ||
    cat.includes('jordan') ||
    cat.includes('running')
  ) {
    return [
      {
        id: 'toe',
        x: 32,
        y: 48,
        title: 'Perforated Toe Box',
        desc: 'Supple full-grain leather with precision micro-perforations providing targeted breathability and structural crease resistance.',
      },
      {
        id: 'cushion',
        x: 58,
        y: 66,
        title: 'Encapsulated Air Cushioning',
        desc: 'Full-length composite foam midsole with pressurized Nike Air heel units delivering shock-attenuating energy return.',
      },
      {
        id: 'outsole',
        x: 44,
        y: 84,
        title: 'Concentric Pivot Traction',
        desc: 'High-abrasion solid rubber compound with court-tested herringbone grooves and circular pivot point.',
      },
      {
        id: 'collar',
        x: 74,
        y: 32,
        title: 'Anatomical Lockdown Collar',
        desc: 'Sculpted memory foam padding around the Achilles tendon for zero heel-slippage and ankle stability.',
      },
    ];
  }

  if (cat.includes('instrument') || cat.includes('guitar')) {
    return [
      {
        id: 'pickups',
        x: 48,
        y: 50,
        title: 'Dual Humbucking Pickups',
        desc: 'Hand-wound vintage voiced humbuckers delivering warm, resonant sustain with high harmonic clarity.',
      },
      {
        id: 'fretboard',
        x: 30,
        y: 40,
        title: 'Bound Rosewood Fingerboard',
        desc: 'Precision PLEK-dressed frets on a resonant solid mahogany neck with trapezoid acrylic inlays.',
      },
      {
        id: 'bridge',
        x: 65,
        y: 58,
        title: 'Aluminum Tune-O-Matic Bridge',
        desc: 'Lightweight aluminum stopbar tailpiece for maximum vibration transfer directly into the body.',
      },
    ];
  }

  // Universal hotspots
  return [
    {
      id: 'materials',
      x: 38,
      y: 44,
      title: 'Aerospace-Grade Materials',
      desc: 'Engineered with premium composite finishes for unmatched longevity and structural rigidity.',
    },
    {
      id: 'core',
      x: 55,
      y: 58,
      title: 'Precision Internal Architecture',
      desc: 'Multi-layer internal construction balanced for ergonomic balance and high performance.',
    },
  ];
}

export function Product3DStudio({
  product,
  selectedVariant,
  onSelectVariant,
  className = '',
}) {
  const [rotation, setRotation] = useState(PRESET_ANGLES.isometric);
  const [activePreset, setActivePreset] = useState('isometric');
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isExploded, setIsExploded] = useState(false);
  const [showHotspots, setShowHotspots] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [colorAccent, setColorAccent] = useState(
    selectedVariant?.value || '#ef4444'
  );

  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const animFrameRef = useRef(null);
  const canvasRef = useRef(null);

  const hotspots = getCategoryHotspots(product?.category);

  // Sync color accent with selected variant
  useEffect(() => {
    if (selectedVariant?.value) {
      setColorAccent(selectedVariant.value);
    }
  }, [selectedVariant]);

  // Turntable animation loop
  useEffect(() => {
    const loop = () => {
      if (isAutoRotating && !isDraggingRef.current && !isExploded) {
        setRotation((prev) => ({
          x: prev.x,
          y: (prev.y + 0.5) % 360,
        }));
      } else if (!isDraggingRef.current) {
        // Apply inertia dampening
        if (
          Math.abs(velocityRef.current.x) > 0.05 ||
          Math.abs(velocityRef.current.y) > 0.05
        ) {
          setRotation((prev) => ({
            x: Math.max(-85, Math.min(85, prev.x + velocityRef.current.x)),
            y: (prev.y + velocityRef.current.y) % 360,
          }));
          velocityRef.current.x *= 0.92;
          velocityRef.current.y *= 0.92;
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isAutoRotating, isExploded]);

  // Pointer event handlers for 360 degree orbital rotation
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    setIsAutoRotating(false);
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };
  };

  const handlePointerMove = useCallback((e) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;

    const rotSpeed = 0.65;
    const newVelY = deltaX * rotSpeed;
    const newVelX = -deltaY * rotSpeed * 0.5;

    velocityRef.current = { x: newVelX, y: newVelY };

    setRotation((prev) => ({
      x: Math.max(-85, Math.min(85, prev.x + newVelX)),
      y: (prev.y + newVelY) % 360,
    }));

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    setActivePreset(null);
  }, []);

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const setPresetView = (key) => {
    const preset = PRESET_ANGLES[key];
    if (!preset) return;
    trackStudioInteraction('preset_angle', key, { productId: product?.itemid });
    setIsAutoRotating(false);
    setActivePreset(key);
    setRotation({ x: preset.x, y: preset.y });
    setActiveHotspot(null);
  };

  const resetView = () => {
    trackStudioInteraction('reset_view', 'isometric', {
      productId: product?.itemid,
    });
    setPresetView('isometric');
    setIsExploded(false);
    setIsAutoRotating(true);
    setActiveHotspot(null);
  };

  const handleHotspotClick = (spot, e) => {
    e.stopPropagation();
    const willOpen = activeHotspot?.id !== spot.id;
    if (willOpen) {
      trackStudioInteraction('hotspot_click', spot.title, {
        productId: product?.itemid,
      });
    }
    setActiveHotspot(willOpen ? spot : null);
    setIsAutoRotating(false);
  };

  // Studio Lighting Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, w, h);

    // Dynamic ground contact shadow reflecting product rotation
    const radY = (rotation.y * Math.PI) / 180;
    const shadowStretch = 1 + Math.cos(radY) * 0.2;
    const shadowAlpha = isExploded ? 0.08 : 0.25;

    const grad = ctx.createRadialGradient(
      w / 2,
      h * 0.78,
      10,
      w / 2,
      h * 0.78,
      140 * shadowStretch
    );
    grad.addColorStop(0, `rgba(15, 23, 42, ${shadowAlpha})`);
    grad.addColorStop(0.5, `rgba(30, 58, 95, ${shadowAlpha * 0.4})`);
    grad.addColorStop(1, 'rgba(30, 58, 95, 0)');

    ctx.save();
    ctx.translate(w / 2, h * 0.78);
    ctx.scale(shadowStretch, 0.35);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }, [rotation, isExploded]);

  const activeImage = product?.image || '/images/placeholder.svg';

  return (
    <div
      className={`${styles.studioContainer} ${className}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      data-testid="product-3d-studio"
    >
      {/* Studio Header Bar */}
      <div className={styles.studioHeader}>
        <div className={styles.badge3D}>
          <span className={styles.liveIndicator} />
          <Cube3DIcon size={14} />
          <span>3D Interactive Studio</span>
        </div>

        <div className={styles.topControls}>
          <button
            className={`${styles.iconBtn} ${isExploded ? styles.active : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsExploded(!isExploded);
              setIsAutoRotating(false);
            }}
            title={isExploded ? 'Collapse View' : 'Exploded Anatomy View'}
            aria-label="Toggle exploded view"
          >
            <LayersIcon size={16} />
          </button>

          <button
            className={`${styles.iconBtn} ${showHotspots ? styles.active : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowHotspots(!showHotspots);
            }}
            title={showHotspots ? 'Hide Tech Hotspots' : 'Show Tech Hotspots'}
            aria-label="Toggle hotspots"
          >
            <EyeIcon size={16} />
          </button>

          <button
            className={`${styles.iconBtn} ${isAutoRotating ? styles.active : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoRotating(!isAutoRotating);
            }}
            title={isAutoRotating ? 'Pause Turntable' : 'Play Turntable'}
            aria-label="Toggle turntable auto-rotate"
          >
            {isAutoRotating ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
          </button>

          <button
            className={styles.iconBtn}
            onClick={(e) => {
              e.stopPropagation();
              resetView();
            }}
            title="Reset Studio Camera"
            aria-label="Reset camera"
          >
            <RotateCcwIcon size={16} />
          </button>
        </div>
      </div>

      {/* Viewport Area */}
      <div className={styles.viewport}>
        <canvas ref={canvasRef} className={styles.canvas} />

        {/* Spatial 3D Scene */}
        <div className={styles.spatialScene}>
          <div className={styles.pedestal} />

          <div
            className={styles.modelWrapper}
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            }}
          >
            {!isExploded ? (
              <>
                <img
                  src={activeImage}
                  alt={`${product?.productName || 'Product'} 3D Model`}
                  className={styles.modelImage}
                  draggable={false}
                  style={{
                    filter: `drop-shadow(0 26px 30px rgba(0, 0, 0, 0.25)) drop-shadow(0 0 16px ${colorAccent}40)`,
                  }}
                />

                {/* Interactive Tech Hotspots */}
                {showHotspots &&
                  hotspots.map((spot) => (
                    <button
                      key={spot.id}
                      className={styles.hotspot}
                      style={{
                        top: `${spot.y}%`,
                        left: `${spot.x}%`,
                      }}
                      onClick={(e) => handleHotspotClick(spot, e)}
                      aria-label={`Inspect ${spot.title}`}
                    >
                      <span className={styles.hotspotPulse} />
                      <Cube3DIcon size={12} />
                    </button>
                  ))}
              </>
            ) : (
              /* Exploded Anatomy Mode */
              <div className={styles.explodedContainer}>
                <div
                  className={styles.explodedLayer}
                  style={{ transform: 'translateY(-40px) translateZ(40px)' }}
                >
                  <div>
                    <div className={styles.layerTitle}>
                      Layer 1: Performance Outer Shell
                    </div>
                    <div className={styles.layerDesc}>
                      Full-grain leather with aerodynamic perforations
                    </div>
                  </div>
                </div>

                <img
                  src={activeImage}
                  alt={`${product?.productName || 'Product'} Exploded View`}
                  className={styles.modelImage}
                  style={{
                    transform: 'scale(0.95)',
                    opacity: 0.9,
                  }}
                  draggable={false}
                />

                <div
                  className={styles.explodedLayer}
                  style={{ transform: 'translateY(40px) translateZ(-30px)' }}
                >
                  <div>
                    <div className={styles.layerTitle}>
                      Layer 2: Responsive Cushioning Matrix
                    </div>
                    <div className={styles.layerDesc}>
                      Polyurethane midsole core with pressurized air pod
                    </div>
                  </div>
                </div>

                <div
                  className={styles.explodedLayer}
                  style={{ transform: 'translateY(75px) translateZ(-60px)' }}
                >
                  <div>
                    <div className={styles.layerTitle}>
                      Layer 3: Solid Rubber Traction Base
                    </div>
                    <div className={styles.layerDesc}>
                      Concentric circular pivot channels for multi-surface grip
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Hotspot Info Drawer */}
        {activeHotspot && (
          <div
            className={styles.hotspotCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.hotspotCardHeader}>
              <h4 className={styles.hotspotCardTitle}>{activeHotspot.title}</h4>
              <button
                className={styles.hotspotClose}
                onClick={() => setActiveHotspot(null)}
                aria-label="Close hotspot info"
              >
                <TimesCircleIcon size={16} />
              </button>
            </div>
            <p className={styles.hotspotCardBody}>{activeHotspot.desc}</p>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className={styles.bottomBar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.viewsRow}>
          <div className={styles.presetButtons}>
            {Object.entries(PRESET_ANGLES).map(([key, item]) => (
              <button
                key={key}
                className={`${styles.presetBtn} ${activePreset === key ? styles.activePreset : ''}`}
                onClick={() => setPresetView(key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <span className={styles.interactionHint}>
            <RotateCcwIcon size={12} /> Drag to orbit 360°
          </span>
        </div>

        {/* Real-time Colorway Swatches */}
        {product?.variants && product.variants.length > 0 && (
          <div className={styles.swatchesRow}>
            <span className={styles.swatchLabel}>Colorways:</span>
            <div className={styles.swatchesList}>
              {product.variants.map((v) => (
                <button
                  key={v.id || v.name}
                  className={`${styles.swatchBtn} ${selectedVariant?.id === v.id || selectedVariant?.name === v.name ? styles.activeSwatch : ''}`}
                  style={{ backgroundColor: v.value || '#1e3a5f' }}
                  title={v.name}
                  onClick={() => {
                    if (onSelectVariant) onSelectVariant(v);
                    if (v.value) setColorAccent(v.value);
                  }}
                  aria-label={`Select colorway ${v.name}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Product3DStudio.propTypes = {
  product: PropTypes.shape({
    itemid: PropTypes.string,
    productName: PropTypes.string,
    manufacturer: PropTypes.string,
    image: PropTypes.string,
    category: PropTypes.string,
    variants: PropTypes.array,
  }).isRequired,
  selectedVariant: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  onSelectVariant: PropTypes.func,
  className: PropTypes.string,
};
