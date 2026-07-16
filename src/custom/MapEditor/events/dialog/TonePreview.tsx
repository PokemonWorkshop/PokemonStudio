import React from 'react';
import styled from 'styled-components';
import { ZoomPan } from '../../ZoomPan';

/**
 * Fork-owned. Previews a screen/fog/picture tone (or a flash color) applied to a
 * snapshot of the ACTUAL current map, so the user sees what the command will do
 * before it runs — not just abstract swatches.
 *
 * The map snapshot is a PNG data URL captured from the Pixi renderer
 * (MapCanvasHandle.snapshotDataURL). We apply the exact RGSS tone math per pixel
 * on a downscaled copy, which is cheap enough to re-run live as the sliders move:
 *
 *   Tone : gray desaturates toward luminance, then RGB is added (may be negative
 *          to darken) — `c' = clamp(c + (lum - c) * gray + toneC, 0, 255)`.
 *   Flash: the color is blended over the pixel by its strength (alpha) —
 *          `c' = c * (1 - a) + colorC * a`.
 *
 * If no snapshot is available the component renders nothing; the caller keeps its
 * abstract-swatch fallback.
 */

const Canvas = styled.canvas`
  display: block;
  max-width: 100%;
  max-height: 100%;
  image-rendering: pixelated;
`;

type Props = {
  snapshotUrl: string | null;
  red: number;
  green: number;
  blue: number;
  /** Tone: the gray channel. Flash: the strength (alpha). */
  fourth: number;
  isFlash: boolean;
};

const clamp255 = (n: number) => (n < 0 ? 0 : n > 255 ? 255 : n);

export const TonePreview: React.FC<Props> = ({ snapshotUrl, red, green, blue, fourth, isFlash }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const baseRef = React.useRef<ImageData | null>(null);

  // Load the snapshot once into an offscreen ImageData we can re-tint cheaply.
  React.useEffect(() => {
    baseRef.current = null;
    if (!snapshotUrl) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      baseRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      paint();
    };
    img.src = snapshotUrl;
    return () => {
      cancelled = true;
    };
    // paint is stable enough; re-run only when the snapshot changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotUrl]);

  const paint = React.useCallback(() => {
    const base = baseRef.current;
    const canvas = canvasRef.current;
    if (!base || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const out = ctx.createImageData(base.width, base.height);
    const src = base.data;
    const dst = out.data;
    if (isFlash) {
      const a = clamp255(fourth) / 255;
      const inv = 1 - a;
      const fr = clamp255(red) * a;
      const fg = clamp255(green) * a;
      const fb = clamp255(blue) * a;
      for (let i = 0; i < src.length; i += 4) {
        dst[i] = src[i] * inv + fr;
        dst[i + 1] = src[i + 1] * inv + fg;
        dst[i + 2] = src[i + 2] * inv + fb;
        dst[i + 3] = src[i + 3];
      }
    } else {
      const g = clamp255(fourth) / 255;
      for (let i = 0; i < src.length; i += 4) {
        const r = src[i];
        const gr = src[i + 1];
        const b = src[i + 2];
        const lum = 0.299 * r + 0.587 * gr + 0.114 * b;
        dst[i] = clamp255(r + (lum - r) * g + red);
        dst[i + 1] = clamp255(gr + (lum - gr) * g + green);
        dst[i + 2] = clamp255(b + (lum - b) * g + blue);
        dst[i + 3] = src[i + 3];
      }
    }
    ctx.putImageData(out, 0, 0);
  }, [red, green, blue, fourth, isFlash]);

  // Re-tint whenever a channel changes.
  React.useEffect(() => {
    paint();
  }, [paint]);

  if (!snapshotUrl) return null;
  return (
    <ZoomPan height={220} resetKey={snapshotUrl}>
      <Canvas ref={canvasRef} />
    </ZoomPan>
  );
};
