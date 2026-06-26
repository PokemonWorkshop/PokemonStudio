import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import type { LoadedState } from './mapEditorTypes';

/**
 * Map resize dialog.
 *
 * Three modes the user can compose:
 *   - **Resize** — change width/height, keep top-left content anchor.
 *   - **Crop**   — shrink, with offsetX/Y > 0 to keep right/bottom portion.
 *   - **Shift**  — same width/height, non-zero offsets to translate content.
 *
 * `offsetX/Y` shift the existing tile-layer contents inside the new bounds:
 * positive = move content right/down, negative = move left/up. Cells that
 * fall outside the new dimensions are dropped. Object/image/group layers
 * are NOT shifted (their positions are in pixel space; resizing the grid
 * doesn't change them).
 *
 * The preview canvas shows the new bounds (yellow border), the existing
 * content's footprint inside them (dashed outline at offset ox/oy), and a
 * low-res render of the current map tiles. Drag the content footprint to
 * adjust the offset visually — matches Tiled's UX.
 *
 * Strict bounds: width/height must be ≥ 1. We don't impose an upper cap —
 * Tiled and PSDK both support large maps; the user knows their constraints.
 */

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.colors.dark18};
  border: 1px solid ${({ theme }) => theme.colors.dark23};
  border-radius: 12px;
  padding: 24px;
  width: 560px;
  max-width: calc(100vw - 48px);
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
`;

const Title = styled.div`
  ${({ theme }) => theme.fonts.titlesHeadline6};
  color: ${({ theme }) => theme.colors.text100};
`;

const Hint = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  line-height: 1.4;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Label = styled.label`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

const NumInput = styled.input`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.dark14};
  border: 1px solid ${({ theme }) => theme.colors.dark23};
  border-radius: 6px;
  padding: 6px 10px;
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalRegular};
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.primaryBase}; }
`;

const PreviewBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.dark14};
  border: 1px solid ${({ theme }) => theme.colors.dark23};
  border-radius: 8px;
`;

const PreviewScroll = styled.div`
  /* When the zoomed canvas exceeds the visible box, scrollbars let the
     user pan around. max-height matches the auto-fit size so the dialog
     doesn't grow vertically as you zoom in. */
  max-width: 100%;
  max-height: ${({ theme: _t }) => '300px'};
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.dark14};
`;

const PreviewCanvas = styled.canvas`
  cursor: grab;
  image-rendering: pixelated;
  &:active { cursor: grabbing; }
`;

const ZoomBar = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

const ZoomBtn = styled.button`
  all: unset;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.dark23};
  color: ${({ theme }) => theme.colors.text100};
  padding: 2px 10px;
  border-radius: 4px;
  ${({ theme }) => theme.fonts.normalRegular};
  &:hover { background-color: ${({ theme }) => theme.colors.primarySoft}; }
`;

const ZoomLabel = styled.span`
  min-width: 48px;
  text-align: center;
`;

const Buttons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 4px;
`;

const Btn = styled.button<{ $primary?: boolean }>`
  all: unset;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 6px;
  ${({ theme }) => theme.fonts.normalRegular};
  background-color: ${({ $primary, theme }) =>
    $primary ? theme.colors.primaryBase : theme.colors.dark14};
  color: ${({ $primary, theme }) =>
    $primary ? theme.colors.text100 : theme.colors.text400};
  &:hover {
    background-color: ${({ $primary, theme }) =>
      $primary ? theme.colors.primarySoft : theme.colors.dark23};
    color: ${({ theme }) => theme.colors.text100};
  }
`;

const PREVIEW_MAX = 280;
const GID_MASK = 0x1fffffff;

type Props = {
  currentWidth: number;
  currentHeight: number;
  /** Loaded map state — drives the tile-thumbnail preview. Pass null and
   *  the preview falls back to schematic-only (still shows bounds + drag). */
  loaded: LoadedState | null;
  onCancel: () => void;
  onConfirm: (newWidth: number, newHeight: number, offsetX: number, offsetY: number) => void;
};

export const ResizeMapDialog: React.FC<Props> = ({
  currentWidth, currentHeight, loaded, onCancel, onConfirm,
}) => {
  const [w, setW] = useState(currentWidth);
  const [h, setH] = useState(currentHeight);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => { firstFieldRef.current?.focus(); firstFieldRef.current?.select(); }, []);

  const dirty = w !== currentWidth || h !== currentHeight || ox !== 0 || oy !== 0;
  const valid = Number.isFinite(w) && Number.isFinite(h) && w >= 1 && h >= 1;

  // --- preview thumbnail -------------------------------------------------

  // Pre-render the current map's tiles to an offscreen canvas once. Reused
  // for every redraw (the user is just dragging the offset / resizing the
  // bounds — the source pixels don't change while the dialog is open).
  const mapThumb = useMemo(() => buildMapThumbnail(loaded), [loaded]);

  // Outer canvas dimensions adapt to whichever is bigger: the current map,
  // the new map, or the offset spillover. We size the preview area so the
  // union fits, then scale to PREVIEW_MAX while preserving aspect ratio.
  const unionRect = useMemo(() => {
    const minX = Math.min(0, ox);
    const minY = Math.min(0, oy);
    const maxX = Math.max(w, currentWidth + ox);
    const maxY = Math.max(h, currentHeight + oy);
    return {
      x: minX, y: minY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
    };
  }, [w, h, ox, oy, currentWidth, currentHeight]);

  // Auto-fit scale (so the preview always opens at "see-the-whole-map" zoom).
  const baseScale = useMemo(() => {
    const s = PREVIEW_MAX / Math.max(unionRect.width, unionRect.height);
    return Math.max(0.1, Math.min(s, 24));
  }, [unionRect]);
  // User zoom multiplier on top of baseScale. Clamped wide enough to let
  // the user inspect single tiles on big maps without going absurd.
  const ZOOM_STEPS = [0.5, 0.75, 1, 1.5, 2, 3, 5, 8, 12, 20];
  const [zoomMul, setZoomMul] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const scale = baseScale * zoomMul;
  const zoomIn = () => setZoomMul((z) => {
    const i = ZOOM_STEPS.findIndex((s) => s > z + 1e-6);
    return i >= 0 ? ZOOM_STEPS[i] : z;
  });
  const zoomOut = () => setZoomMul((z) => {
    const i = [...ZOOM_STEPS].reverse().findIndex((s) => s < z - 1e-6);
    return i >= 0 ? [...ZOOM_STEPS].reverse()[i] : z;
  });
  const zoomReset = () => setZoomMul(1);
  // Wheel-to-zoom on the canvas. Attached natively (not via React's onWheel)
  // so we can register with passive:false and actually preventDefault — React
  // marks wheel listeners passive by default, which would let the scroll
  // container scroll AND zoom at the same time.

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cw = Math.ceil(unionRect.width * scale);
    const ch = Math.ceil(unionRect.height * scale);
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cw, ch);

    // Translate origin so unionRect.x/y → canvas (0, 0).
    const tx = -unionRect.x * scale;
    const ty = -unionRect.y * scale;

    // 1. New bounds — gray fill so the user sees the "empty canvas" they'd
    //    end up with after the resize.
    ctx.fillStyle = '#2a2a2e';
    ctx.fillRect(tx + 0 * scale, ty + 0 * scale, w * scale, h * scale);

    // 2. Existing map content, blitted from the offscreen thumbnail and
    //    translated by the offset. Clipped to the new bounds so cells
    //    that'd be dropped on resize don't visually persist.
    if (mapThumb) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(tx + 0 * scale, ty + 0 * scale, w * scale, h * scale);
      ctx.clip();
      const srcW = mapThumb.width;
      const srcH = mapThumb.height;
      const destX = tx + ox * scale;
      const destY = ty + oy * scale;
      const destW = currentWidth * scale;
      const destH = currentHeight * scale;
      ctx.drawImage(mapThumb, 0, 0, srcW, srcH, destX, destY, destW, destH);
      ctx.restore();
    }

    // 3. Tile grid overlay (optional). Drawn over the thumbnail but under
    //    the bounds outlines so the framing always reads. Covers the full
    //    union rect so cells outside the new bounds (cropped area) still
    //    show their tile boundaries. Skipped when zoomed out too far to
    //    keep lines visible — at <2 px/tile the grid becomes a gray haze.
    if (showGrid && scale >= 2) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = 0; gx <= unionRect.width; gx++) {
        const px = Math.floor(tx + (unionRect.x + gx) * scale) + 0.5;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, ch);
      }
      for (let gy = 0; gy <= unionRect.height; gy++) {
        const py = Math.floor(ty + (unionRect.y + gy) * scale) + 0.5;
        ctx.moveTo(0, py);
        ctx.lineTo(cw, py);
      }
      ctx.stroke();
    }

    // 4. Old content footprint outline (dashed) — what cells will MOVE.
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = '#e6c14a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      tx + ox * scale + 0.5,
      ty + oy * scale + 0.5,
      currentWidth * scale - 1,
      currentHeight * scale - 1,
    );
    ctx.setLineDash([]);

    // 5. New bounds outline (solid yellow) — what the map will become.
    ctx.strokeStyle = '#ffd000';
    ctx.lineWidth = 2;
    ctx.strokeRect(tx + 0.5, ty + 0.5, w * scale - 1, h * scale - 1);
  }, [w, h, ox, oy, currentWidth, currentHeight, mapThumb, scale, unionRect, showGrid]);

  // --- drag-to-offset ----------------------------------------------------

  const dragRef = useRef<{ startX: number; startY: number; startOx: number; startOy: number } | null>(null);
  const onCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, startOx: ox, startOy: oy };
  }, [ox, oy]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = Math.round((e.clientX - d.startX) / scale);
      const dy = Math.round((e.clientY - d.startY) / scale);
      setOx(d.startOx + dx);
      setOy(d.startOy + dy);
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [scale]);

  // Native wheel listener with passive:false so preventDefault works (see
  // comment on the removed onCanvasWheel above).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY < 0) zoomIn();
      else if (e.deltaY > 0) zoomOut();
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && valid && dirty) onConfirm(w, h, ox, oy);
    else if (e.key === 'Escape') onCancel();
  };

  const resetOffset = () => { setOx(0); setOy(0); };

  return (
    <Overlay onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()} onKeyDown={onKey}>
        <Title>Resize map</Title>
        <Hint>
          Current: <strong>{currentWidth} × {currentHeight}</strong> tiles.
          Drag the dashed area in the preview to shift content within the new bounds, or type offsets directly.
          Cells outside the yellow new-bounds box are dropped.
        </Hint>
        <PreviewBox>
          <PreviewScroll>
            <PreviewCanvas
              ref={canvasRef}
              onMouseDown={onCanvasMouseDown}
              title="Drag to shift content · scroll to zoom"
            />
          </PreviewScroll>
          <ZoomBar>
            <ZoomBtn onClick={zoomOut} title="Zoom out">−</ZoomBtn>
            <ZoomLabel>{Math.round(zoomMul * 100)}%</ZoomLabel>
            <ZoomBtn onClick={zoomIn} title="Zoom in">+</ZoomBtn>
            <ZoomBtn onClick={zoomReset} title="Fit">Fit</ZoomBtn>
            <ZoomBtn
              onClick={() => setShowGrid((g) => !g)}
              title="Toggle tile grid"
              style={{ marginLeft: 12, opacity: showGrid ? 1 : 0.55 }}
            >
              {showGrid ? '▦ Grid' : '▢ Grid'}
            </ZoomBtn>
          </ZoomBar>
        </PreviewBox>
        <Grid>
          <Field>
            <Label htmlFor="rmw">Width</Label>
            <NumInput
              id="rmw"
              ref={firstFieldRef}
              type="number"
              min={1}
              step={1}
              value={w}
              onChange={(e) => setW(parseInt(e.target.value, 10) || 0)}
            />
          </Field>
          <Field>
            <Label htmlFor="rmh">Height</Label>
            <NumInput
              id="rmh"
              type="number"
              min={1}
              step={1}
              value={h}
              onChange={(e) => setH(parseInt(e.target.value, 10) || 0)}
            />
          </Field>
          <Field>
            <Label htmlFor="rmox">Offset X</Label>
            <NumInput
              id="rmox"
              type="number"
              step={1}
              value={ox}
              onChange={(e) => setOx(parseInt(e.target.value, 10) || 0)}
            />
          </Field>
          <Field>
            <Label htmlFor="rmoy">Offset Y</Label>
            <NumInput
              id="rmoy"
              type="number"
              step={1}
              value={oy}
              onChange={(e) => setOy(parseInt(e.target.value, 10) || 0)}
            />
          </Field>
        </Grid>
        <Buttons>
          {(ox !== 0 || oy !== 0) && <Btn onClick={resetOffset}>Reset offset</Btn>}
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn $primary onClick={() => onConfirm(w, h, ox, oy)} disabled={!valid || !dirty}>
            Resize
          </Btn>
        </Buttons>
      </Modal>
    </Overlay>
  );
};

/**
 * Composite every visible tile layer onto a single offscreen canvas using
 * the actual tile bitmaps from each tileset. Reused as the preview
 * thumbnail — the dialog scales it down (or up with `image-rendering:
 * pixelated`) when displaying.
 *
 * Per-tile render size:
 *   - Prefer the tileset's native tile size for crisp 1:1 pixels.
 *   - Bounded by `MAX_DIM / max(mapW, mapH)` so the offscreen never
 *     exceeds MAX_DIM in either axis. For 64×64 maps at 32px tiles
 *     we render at full quality (2048×2048). For 256×256 maps with
 *     a 4096 cap we drop to 16px-per-tile — still recognizable, no
 *     more giant color blocks.
 *
 * Flip bits (H/V/D from the high 3 bits of the gid raw value) are
 * honored by applying a transform around each drawImage call. Mirrors
 * the cell-render logic in PixiMapCanvas so the preview matches what
 * the user sees on the map.
 */
const FLIPPED_HORIZONTALLY = 0x80000000 >>> 0;
const FLIPPED_VERTICALLY   = 0x40000000 >>> 0;
const FLIPPED_DIAGONALLY   = 0x20000000 >>> 0;
const MAX_DIM = 4096;

const buildMapThumbnail = (loaded: LoadedState | null): HTMLCanvasElement | null => {
  if (!loaded) return null;
  const { json, tilesets } = loaded;
  const w = json.width;
  const h = json.height;
  if (w <= 0 || h <= 0) return null;

  // Pick the per-tile render size: native tile size if it fits within
  // MAX_DIM, otherwise scaled down to fit. Always at least 1.
  const tw = json.tilewidth || 32;
  const th = json.tileheight || 32;
  const maxFromMap = Math.floor(MAX_DIM / Math.max(w, h));
  const cellSize = Math.max(1, Math.min(Math.max(tw, th), maxFromMap));

  const canvas = document.createElement('canvas');
  canvas.width = w * cellSize;
  canvas.height = h * cellSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  // Smooth downscale from native tile bitmap → cellSize destination.
  // The thumbnail itself is rendered once; the dialog then handles
  // zoom-level scaling separately on the visible <canvas>.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'medium';

  // Resolve gid → (tileset, localId). Picks the tileset with the highest
  // firstgid that's still <= gid (Tiled's lookup rule). Cached per-gid.
  type Hit = { ts: typeof tilesets[number]; localId: number };
  const hitByGid = new Map<number, Hit | null>();
  const lookupTileset = (gid: number): Hit | null => {
    if (hitByGid.has(gid)) return hitByGid.get(gid) ?? null;
    let best: Hit | null = null;
    for (const ts of tilesets) {
      if (ts.firstgid <= gid && (!best || ts.firstgid > best.ts.firstgid)) {
        best = { ts, localId: gid - ts.firstgid };
      }
    }
    hitByGid.set(gid, best);
    return best;
  };

  const drawCell = (gidRaw: number, x: number, y: number): void => {
    const gid = gidRaw & GID_MASK;
    if (!gid) return;
    const hit = lookupTileset(gid);
    if (!hit) return;
    const { ts, localId } = hit;
    if (!ts.bitmap) return;
    const cols = ts.columns || Math.floor(ts.bitmap.width / ts.tilewidth) || 1;
    const sx = (localId % cols) * ts.tilewidth;
    const sy = Math.floor(localId / cols) * ts.tileheight;
    if (sx + ts.tilewidth > ts.bitmap.width || sy + ts.tileheight > ts.bitmap.height) return;

    const flipH = (gidRaw & FLIPPED_HORIZONTALLY) !== 0;
    const flipV = (gidRaw & FLIPPED_VERTICALLY) !== 0;
    const flipD = (gidRaw & FLIPPED_DIAGONALLY) !== 0;
    const dx = x * cellSize;
    const dy = y * cellSize;

    if (!flipH && !flipV && !flipD) {
      ctx.drawImage(ts.bitmap, sx, sy, ts.tilewidth, ts.tileheight, dx, dy, cellSize, cellSize);
      return;
    }
    // Flip/rotation: translate to cell center, apply transform, draw centered.
    ctx.save();
    ctx.translate(dx + cellSize / 2, dy + cellSize / 2);
    if (flipD) {
      // Anti-diagonal: rotate 90° then mirror Y (matches Tiled's D flag).
      ctx.rotate(Math.PI / 2);
      ctx.scale(1, -1);
    }
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(
      ts.bitmap, sx, sy, ts.tilewidth, ts.tileheight,
      -cellSize / 2, -cellSize / 2, cellSize, cellSize,
    );
    ctx.restore();
  };

  // Walk layers in document order so later layers paint over earlier.
  const walk = (layers: typeof json.layers): void => {
    for (const layer of layers) {
      if (layer.type === 'group' && layer.layers) {
        walk(layer.layers);
        continue;
      }
      if (layer.type !== 'tilelayer' || !layer.data) continue;
      if (layer.visible === false) continue;
      const lw = layer.width ?? w;
      const lh = layer.height ?? h;
      for (let y = 0; y < Math.min(h, lh); y++) {
        for (let x = 0; x < Math.min(w, lw); x++) {
          const raw = layer.data[y * lw + x] >>> 0;
          if (raw) drawCell(raw, x, y);
        }
      }
    }
  };
  walk(json.layers);
  return canvas;
};
