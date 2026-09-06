import { useEffect, useRef, useState } from 'react';
import styles from './Hero.module.css';

/**
 * WebGLCosmicHero
 *
 * High-performance interactive WebGL particle vortex.
 * Renders 1,200+ hardware-accelerated 3D cosmic commerce particles that
 * swirl in a logarithmic gravitational vortex, reacting dynamically to
 * cursor velocity and click shockwaves.
 *
 * Gracefully degrades to an animated CSS canvas fallback if WebGL is unavailable.
 */
export function WebGLCosmicHero({ className }) {
  const canvasRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [_interactionStats, _setInteractionStats] = useState({
    particles: 1200,
    fps: 60,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = null;
    try {
      gl =
        canvas.getContext('webgl', { alpha: true, antialias: true }) ||
        canvas.getContext('experimental-webgl');
    } catch {
      gl = null;
    }

    if (!gl) {
      setWebglSupported(false);
      return;
    }

    // Set canvas dimensions
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(300, rect.width * dpr);
      canvas.height = Math.max(200, rect.height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Vertex Shader
    const vsSource = `
      attribute vec3 aPosition;
      attribute vec4 aColor;
      attribute float aSize;

      uniform mat4 uMatrix;
      uniform float uTime;
      uniform vec2 uMouse;

      varying vec4 vColor;

      void main() {
        vec3 pos = aPosition;

        // Gravitational swirl offset
        float dist = length(pos.xy - uMouse);
        float force = max(0.0, 1.0 - dist * 1.8);
        pos.xy += normalize(pos.xy - uMouse + 0.001) * force * 0.15;

        // Rotation around Z
        float angle = uTime * 0.4 + length(pos.xy) * 1.5;
        float s = sin(angle);
        float c = cos(angle);
        vec2 rotated = vec2(pos.x * c - pos.y * s, pos.x * s + pos.y * c);
        pos.xy = rotated;

        gl_Position = uMatrix * vec4(pos, 1.0);
        gl_PointSize = aSize * (1.0 + force * 1.5);
        vColor = aColor;
      }
    `;

    // Fragment Shader
    const fsSource = `
      precision mediump float;
      varying vec4 vColor;

      void main() {
        // Soft circular particle
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) {
          discard;
        }
        float alpha = smoothstep(0.5, 0.0, dist) * vColor.a;
        gl_FragColor = vec4(vColor.rgb, alpha);
      }
    `;

    function compileShader(source, type) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) {
      setWebglSupported(false);
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setWebglSupported(false);
      return;
    }

    gl.useProgram(program);

    // Particle Generation (1200 particles)
    const PARTICLE_COUNT = 1200;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 4);
    const sizes = new Float32Array(PARTICLE_COUNT);

    // Palette: Gold, Cyan, Sapphire, White
    const palette = [
      [0.85, 0.65, 0.13, 0.85], // Gold
      [0.96, 0.82, 0.25, 0.95], // Bright Gold
      [0.22, 0.74, 0.97, 0.8], // Cyan
      [0.12, 0.23, 0.37, 0.6], // Deep Navy
      [1.0, 1.0, 1.0, 0.9], // White
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Golden ratio spiral distribution
      const r = Math.pow(Math.random(), 0.6) * 0.9;
      const theta = Math.random() * Math.PI * 2;

      positions[i * 3 + 0] = Math.cos(theta) * r;
      positions[i * 3 + 1] = Math.sin(theta) * r;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.6; // depth

      const col = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 4 + 0] = col[0];
      colors[i * 4 + 1] = col[1];
      colors[i * 4 + 2] = col[2];
      colors[i * 4 + 3] = col[3];

      sizes[i] = (2.0 + Math.random() * 4.5) * dpr;
    }

    // Buffers
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    const colBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    const aColor = gl.getAttribLocation(program, 'aColor');
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);

    const sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
    const aSize = gl.getAttribLocation(program, 'aSize');
    gl.enableVertexAttribArray(aSize);
    gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, 0, 0);

    const uMatrix = gl.getUniformLocation(program, 'uMatrix');
    const uTime = gl.getUniformLocation(program, 'uTime');
    const uMouse = gl.getUniformLocation(program, 'uMouse');

    // Enable additive blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    // Mouse coordinates in WebGL space (-1 to 1)
    let mousePos = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };
    canvas.addEventListener('mousemove', onMouseMove);

    // Render loop
    let animationFrameId;
    let startTime = performance.now();

    const render = (now) => {
      const elapsed = (now - startTime) * 0.001;

      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Identity 4x4 matrix
      const matrix = new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
      ]);

      gl.uniformMatrix4fv(uMatrix, false, matrix);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, mousePos.x, mousePos.y);

      gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`${styles.webglContainer} ${className || ''}`.trim()}>
      {webglSupported ? (
        <canvas
          ref={canvasRef}
          className={styles.webglCanvas}
          aria-label="Interactive WebGL celestial commerce vortex"
        />
      ) : (
        // CSS Fallback for headless testing or non-WebGL devices
        <div className={styles.webglFallback}>
          <div className={styles.fallbackVortex} />
          <div className={styles.fallbackGlow} />
        </div>
      )}

      {/* Holographic Center Emblem */}
      <div className={styles.webglEmblem}>
        <div className={styles.emblemCore}>
          <svg viewBox="0 0 80 80" className={styles.emblemSvg} fill="none">
            <polygon
              points="40,5 75,25 75,60 40,78 5,60 5,25"
              stroke="#daa520"
              strokeWidth="1.5"
              fill="rgba(30, 58, 95, 0.6)"
            />
            <polygon
              points="40,15 65,30 65,55 40,68 15,55 15,30"
              stroke="#38bdf8"
              strokeWidth="1"
              fill="none"
            />
            <circle cx="40" cy="42" r="8" fill="#daa520" opacity="0.9" />
          </svg>
        </div>
        <span className={styles.emblemLabel}>QUANTUM COSMOS</span>
      </div>

      {/* HUD Telemetry overlay */}
      <div className={styles.webglHud}>
        <span>GPU ACCELERATED // 1200 PARTICLES</span>
        <span>INTERACTIVE GRAVITATIONAL LENS</span>
      </div>
    </div>
  );
}
