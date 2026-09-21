import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Global HTMLCanvasElement 2D Context Mock for jsdom test runner
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = vi.fn((type) => {
    if (type !== '2d') return null;
    return {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      roundRect: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      setLineDash: vi.fn(),
      getLineDash: vi.fn(() => []),
      // The workbench viewport sets its own device-pixel transform every paint
      // and cannot fall back the way decorative canvases can — without these it
      // throws inside the paint effect before rendering anything.
      setTransform: vi.fn(),
      getTransform: vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
      resetTransform: vi.fn(),
      transform: vi.fn(),
      arcTo: vi.fn(),
      drawImage: vi.fn(),
      createPattern: vi.fn(() => null),
      putImageData: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
      createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
      measureText: vi.fn(() => ({ width: 50 })),
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
    };
  });

  HTMLCanvasElement.prototype.toDataURL = vi.fn(
    () => 'data:image/png;base64,mock'
  );
}
