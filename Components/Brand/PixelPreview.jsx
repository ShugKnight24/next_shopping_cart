import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

/**
 * Rasterises an icon at its real pixel size, then blows it up with
 * nearest-neighbour scaling so every pixel of a 16px favicon is visible.
 */
export function PixelPreview({ src, size, zoom = 6, label }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const raster = document.createElement('canvas');
      raster.width = size;
      raster.height = size;
      raster.getContext('2d').drawImage(img, 0, 0, size, size);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(raster, 0, 0, canvas.width, canvas.height);
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size * zoom}
      height={size * zoom}
      role="img"
      aria-label={label || `${size}px raster of ${src}`}
      style={{ width: size * zoom, height: size * zoom }}
    />
  );
}

PixelPreview.propTypes = {
  src: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  zoom: PropTypes.number,
  label: PropTypes.string,
};
