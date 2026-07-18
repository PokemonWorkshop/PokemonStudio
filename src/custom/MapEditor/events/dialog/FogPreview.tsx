import React from 'react';
import styled from 'styled-components';
import { ZoomPan } from '../../ZoomPan';
import { useResourceImageSrc } from '@components/ResourceImage';

/**
 * Fork-owned. Previews a Change Fog (204) command over a snapshot of the ACTUAL
 * current map, so the user sees the fog the command will apply before it runs —
 * the fog analogue of TonePreview.
 *
 * PSDK draws the fog (`RPG::Cache.fog(name, hue)`) tiled across the screen,
 * zoomed by `fog_zoom%`, at `fog_opacity` (0..255), with a blend type and an
 * auto-scroll (`fog_sx` / `fog_sy`). We reproduce that on a 2D canvas:
 *   - opacity  -> globalAlpha
 *   - blend    -> 0 normal (source-over), 1 add (lighter), 2 sub (~color-burn),
 *                 3 multiply (multiply). Blend 3 matches the project's Plane
 *                 multiply-fog patch; canvas has no true subtract, so 2 is
 *                 approximated with color-burn (a distinct darkening).
 *   - hue      -> ctx.filter hue-rotate
 *   - zoom     -> tile scaled by zoom/100, repeated to cover
 *   - sx / sy  -> the tiling origin drifts each frame (a motion hint)
 *
 * We only ever drawImage (never getImageData), so the project:// fog texture
 * tainting the canvas is harmless — the composite is display-only.
 */

const Canvas = styled.canvas`
  display: block;
  max-width: 100%;
  max-height: 100%;
  image-rendering: pixelated;
`;

type Props = {
  snapshotUrl: string | null;
  /** Bare fog name ('' / '__undef__' = no fog). */
  fogName: string;
  hue: number;
  opacity: number;
  blend: number;
  zoom: number;
  sx: number;
  sy: number;
  /** Static starting offset in fog-texture px (project's fog_offset_x/oy). */
  ox: number;
  oy: number;
  /** Viewport height for the ZoomPan. */
  height?: number;
  /**
   * When set, left-dragging the preview reports an incremental offset change
   * (in fog-texture px) so the caller can update ox/oy live. Enables the
   * "grab the fog and slide it" gesture.
   */
  onOffsetChange?: (dOx: number, dOy: number) => void;
};

const BLEND_OP: Record<number, GlobalCompositeOperation> = {
  0: 'source-over',
  1: 'lighter',
  2: 'color-burn', // subtraction has no canvas equivalent — approximate darkening
  3: 'multiply',
};

export const FogPreview: React.FC<Props> = ({ snapshotUrl, fogName, hue, opacity, blend, zoom, sx, sy, ox, oy, height = 320, onOffsetChange }) => {
  const hasFog = !!fogName && fogName !== '__undef__';
  // Hooks must run unconditionally; feed a stable dummy path when there's no fog.
  const fogUrl = useResourceImageSrc(`graphics/fogs/${hasFog ? fogName : '__none__'}`);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const snapRef = React.useRef<HTMLImageElement | null>(null);
  const fogRef = React.useRef<HTMLImageElement | null>(null);
  const [, force] = React.useReducer((n) => n + 1, 0);
  // Latest params, read inside the rAF loop without re-subscribing it.
  const paramsRef = React.useRef({ hue, opacity, blend, zoom, sx, sy, ox, oy });
  paramsRef.current = { hue, opacity, blend, zoom, sx, sy, ox, oy };

  // Left-drag → offset change. Convert the incremental cursor delta (un-zoomed
  // CSS px) to fog-texture px and negate so the fog follows the cursor (in
  // game, a larger fog_offset scrolls the plane the other way).
  const handleDrag = React.useCallback((dxCss: number, dyCss: number) => {
    const c = canvasRef.current;
    if (!c || !c.clientWidth || !c.clientHeight) return;
    const scale = Math.max(0.05, paramsRef.current.zoom / 100);
    const dxCanvas = dxCss * (c.width / c.clientWidth);
    const dyCanvas = dyCss * (c.height / c.clientHeight);
    onOffsetChange?.(-dxCanvas / scale, -dyCanvas / scale);
  }, [onOffsetChange]);

  // Load the map snapshot.
  React.useEffect(() => {
    snapRef.current = null;
    if (!snapshotUrl) { force(); return; }
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) { snapRef.current = img; force(); } };
    img.src = snapshotUrl;
    return () => { cancelled = true; };
  }, [snapshotUrl]);

  // Load the fog texture.
  React.useEffect(() => {
    fogRef.current = null;
    if (!hasFog) { force(); return; }
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) { fogRef.current = img; force(); } };
    img.onerror = () => { if (!cancelled) { fogRef.current = null; force(); } };
    img.src = fogUrl;
    return () => { cancelled = true; };
  }, [fogUrl, hasFog]);

  // Composite loop. Runs continuously so the scroll (sx/sy) animates; when both
  // are zero it just redraws the same static frame (cheap for a small canvas).
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snap = snapRef.current;
    const fog = fogRef.current;
    // Size to the snapshot when we have one, else a 4:3 stand-in.
    const w = snap?.naturalWidth || 480;
    const h = snap?.naturalHeight || 320;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let start = 0;
    const draw = (t: number) => {
      if (!start) start = t;
      const frames = (t - start) / (1000 / 60); // elapsed in ~game frames
      const { hue: hu, opacity: op, blend: bl, zoom: zm, sx: dx, sy: dy, ox: fox, oy: foy } = paramsRef.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.filter = 'none';
      // Background: the real map, or a neutral fill.
      if (snap) ctx.drawImage(snap, 0, 0, w, h);
      else { ctx.fillStyle = '#20242c'; ctx.fillRect(0, 0, w, h); }

      if (fog) {
        const scale = Math.max(0.05, zm / 100);
        const tw = Math.max(1, fog.naturalWidth * scale);
        const th = Math.max(1, fog.naturalHeight * scale);
        // Tiling origin in canvas px: the static offset (texture px → canvas px)
        // plus the scroll drift (PSDK advances the fog origin ~ sx/8 per frame).
        // A larger origin scrolls the fog left, matching $game_map.fog_offset_x.
        const originX = fox * scale + (frames * dx) / 8;
        const originY = foy * scale + (frames * dy) / 8;
        const startX = -(((originX % tw) + tw) % tw);
        const startY = -(((originY % th) + th) % th);
        ctx.globalAlpha = Math.max(0, Math.min(255, op)) / 255;
        ctx.globalCompositeOperation = BLEND_OP[bl] ?? 'source-over';
        ctx.filter = hu ? `hue-rotate(${hu}deg)` : 'none';
        for (let y = startY; y < h; y += th) {
          for (let x = startX; x < w; x += tw) {
            ctx.drawImage(fog, x, y, tw, th);
          }
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = 'none';
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
    // Re-run when the loaded images change; live param edits flow via paramsRef.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshotUrl, fogUrl, hasFog, snapRef.current, fogRef.current]);

  if (!hasFog && !snapshotUrl) return null;
  // Taller than the tone preview: fog is a subtle full-screen effect, so a
  // bigger default viewport makes it legible without needing to zoom in.
  return (
    <ZoomPan height={height} resetKey={`${snapshotUrl}|${fogUrl}`} onDrag={hasFog && onOffsetChange ? handleDrag : undefined}>
      <Canvas ref={canvasRef} />
    </ZoomPan>
  );
};
