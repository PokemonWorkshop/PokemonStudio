/**
 * Modal for editing a stamp's panel thumbnail. Users can:
 *   - Toggle individual stamp-layers on/off in the preview (the paint
 *     behavior is untouched — only the thumbnail render is affected).
 *   - Drag a rectangle over the preview to crop the thumbnail down to
 *     a region of the stamp.
 * Save writes `thumbnailLayers` / `thumbnailCrop` onto the stamp.
 *
 * Renders the stamp at a comfortable size (~340px max axis) with the
 * same code path the panel uses, so what the user sees here is exactly
 * what'll appear in the panel after save.
 */

import { DarkButton, PrimaryButton } from '@components/buttons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import type { LoadedTileset } from './mapEditorTypes';
import type { Stamp } from './StampsPanel';

// Avoid importing the renderer's internal helpers — we replicate the
// minimum slicing logic here so this file stays self-contained.
type PhantomTileset = { bitmap: ImageBitmap; tilewidth: number; tileheight: number; columns: number };
type ThumbTileset = { bitmap?: ImageBitmap; tilewidth: number; tileheight: number };

const PREVIEW_MAX = 340;

const normalizeKey = (key: string): string =>
  key.replaceAll('\\', '/').split('/').pop() ?? key;
const tilesetKeyOf = (ts: LoadedTileset): string =>
  normalizeKey(ts.source ?? ts.name ?? '');

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  /*
   * Entry only, via @starting-style -- no mount flag, no JS. These modals used
   * to teleport in at full opacity while Studio's own EditorOverlayV2 dialogs
   * fade, which made the fork's dialogs read as cheaper than the host app's.
   */
  transition: opacity ${({ theme }) => theme.motion.durModal} ease;

  @starting-style {
    opacity: 0;
  }
`;
const Modal = styled.div`
  background: ${({ theme }) => theme.colors.dark14};
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 540px;
  max-width: 720px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5);
  /*
   * Scales from 0.96, never from 0 -- a dialog growing from nothing reads as a
   * zoom effect rather than as something arriving. Centred modals keep
   * transform-origin at the centre; only trigger-anchored surfaces (menus)
   * origin at their trigger.
   */
  transition: opacity ${({ theme }) => theme.motion.durModal} ${({ theme }) => theme.motion.easeOut},
    transform ${({ theme }) => theme.motion.durModal} ${({ theme }) => theme.motion.easeOut};

  @starting-style {
    opacity: 0;
    transform: scale(0.96);
  }

  @media (prefers-reduced-motion: reduce) {
    transition: opacity ${({ theme }) => theme.motion.durModal} ease;

    @starting-style {
      transform: none;
    }
  }
`;
const Header = styled.div`
  ${({ theme }) => theme.fonts.titlesHeadline6};
  color: ${({ theme }) => theme.colors.text100};
`;
const Body = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 18px;
`;
const LayersCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;
const LayerCheckRow = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  cursor: pointer;
  &:hover { color: ${({ theme }) => theme.colors.text100}; }
`;
const PreviewCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
`;
const PreviewWrap = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.dark20};
  border: 1px solid ${({ theme }) => theme.colors.dark23};
  border-radius: 4px;
  padding: 4px;
  user-select: none;
`;
const PreviewCanvas = styled.canvas`
  display: block;
  image-rendering: pixelated;
  cursor: crosshair;
`;
const CropHint = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
`;
const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;
const ResetLink = styled.button`
  all: unset;
  cursor: pointer;
  margin-right: auto;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  &:hover { color: ${({ theme }) => theme.colors.primaryBase}; }
`;

type Props = {
  stamp: Stamp;
  tilesets: LoadedTileset[];
  phantoms: Map<string, PhantomTileset>;
  onCancel: () => void;
  onSave: (patch: { thumbnailLayers?: string[]; thumbnailCrop?: Stamp['thumbnailCrop'] }) => void;
};

export const StampThumbnailEditor: React.FC<Props> = ({
  stamp, tilesets, phantoms, onCancel, onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Layer names this stamp references, in order: index 0 = anchor cells,
  // index i+1 = extraLayers[i]. Names come from stamp.layerNames when
  // present; we fall back to synthetic names ("Layer 0", "Layer 1", …)
  // so the checklist always has something to show, even for older stamps
  // saved before layerNames existed.
  const layerEntries = useMemo(() => {
    const total = 1 + (stamp.extraLayers?.length ?? 0);
    const names = stamp.layerNames ?? [];
    return Array.from({ length: total }, (_, i) => ({
      idx: i,
      name: names[i] ?? `Layer ${i}`,
    }));
  }, [stamp]);

  // Selected layer names (visible in thumbnail). Initialize from saved
  // state when present; otherwise default to "all visible".
  const [visibleLayers, setVisibleLayers] = useState<Set<string>>(() => {
    if (stamp.thumbnailLayers) return new Set(stamp.thumbnailLayers);
    return new Set(layerEntries.map((l) => l.name));
  });

  const [crop, setCrop] = useState<Stamp['thumbnailCrop']>(stamp.thumbnailCrop);
  // Live drag state during crop-rect creation — committed to `crop` on
  // mouseup so the saved crop only changes after the user finishes.
  const [dragRect, setDragRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const dragStartRef = useRef<{ cx: number; cy: number } | null>(null);

  // Helpers for the preview render — mirrors the slice logic the panel
  // thumbnail uses, just at a larger scale so the editor canvas reads
  // well at modal-size.
  const lookup = useCallback((key: string): ThumbTileset | undefined => {
    const real = tilesets.find((t) => tilesetKeyOf(t) === normalizeKey(key));
    if (real?.bitmap) return real;
    return phantoms.get(key) ?? phantoms.get(normalizeKey(key));
  }, [tilesets, phantoms]);

  // Compute the scale + canvas size once per render. Outside the
  // render effect because the drag math needs the same numbers.
  const renderMetrics = useMemo(() => {
    const firstResolved = stamp.cells.find((c) => c) ?? null;
    const ts = firstResolved ? lookup(firstResolved.tilesetKey) : (tilesets[0] as ThumbTileset | undefined);
    const tw = ts?.tilewidth ?? 32;
    const th = ts?.tileheight ?? 32;
    const pxW = stamp.width * tw;
    const pxH = stamp.height * th;
    // Integer scale, biggest that fits within PREVIEW_MAX. Min 1.
    const scale = Math.max(1, Math.floor(Math.min(PREVIEW_MAX / pxW, PREVIEW_MAX / pxH))) || 1;
    return { tw, th, pxW, pxH, scale, w: pxW * scale, h: pxH * scale };
  }, [stamp, lookup, tilesets]);

  // Redraw the preview whenever inputs change. Always renders the full
  // stamp with the layer filter applied; the crop is overlaid via a
  // dimming mask rather than baked into the bitmap, so the user can
  // still see the cropped-out region while choosing the new bounds.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { tw, th, scale, w, h } = renderMetrics;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);

    const drawGrid = (cells: (Stamp['cells'][number])[]) => {
      for (let y = 0; y < stamp.height; y++) {
        for (let x = 0; x < stamp.width; x++) {
          const cell = cells[y * stamp.width + x];
          if (!cell) continue;
          const cellTs = lookup(cell.tilesetKey);
          if (!cellTs || !cellTs.bitmap) continue;
          const cols = Math.max(1, Math.floor(cellTs.bitmap.width / cellTs.tilewidth));
          const sx = (cell.tileId % cols) * cellTs.tilewidth;
          const sy = Math.floor(cell.tileId / cols) * cellTs.tileheight;
          try {
            ctx.drawImage(
              cellTs.bitmap,
              sx, sy, cellTs.tilewidth, cellTs.tileheight,
              x * tw * scale, y * th * scale, tw * scale, th * scale,
            );
          } catch { /* detached bitmap — skip; next render gets fresh one */ }
        }
      }
    };
    // Same painter order as the panel thumbnail renderer: extras first
    // (bottom of stack), anchor cells last (on top). Keeps the editor
    // preview perfectly matched to what'll appear in the panel after
    // save — otherwise the user sees one composition while picking the
    // crop and a different one in the row a moment later.
    if (stamp.extraLayers) {
      for (let i = 0; i < stamp.extraLayers.length; i++) {
        const name = layerEntries[i + 1]?.name;
        if (!name || !visibleLayers.has(name)) continue;
        drawGrid(stamp.extraLayers[i].cells);
      }
    }
    if (visibleLayers.has(layerEntries[0].name)) drawGrid(stamp.cells);

    // Crop overlay: dim the parts OUTSIDE the crop rect, draw the rect
    // border. During a drag, prefer the live dragRect; otherwise the
    // committed crop. With no crop, no overlay.
    const active = dragRect ?? crop ?? null;
    if (active) {
      const cx = active.x * tw * scale;
      const cy = active.y * th * scale;
      const cw = active.width * tw * scale;
      const ch = active.height * th * scale;
      // Four dim rects around the crop area.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, w, cy);                          // top
      ctx.fillRect(0, cy + ch, w, h - (cy + ch));         // bottom
      ctx.fillRect(0, cy, cx, ch);                        // left
      ctx.fillRect(cx + cw, cy, w - (cx + cw), ch);       // right
      // Border.
      ctx.strokeStyle = '#ffd000';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx + 1, cy + 1, cw - 2, ch - 2);
    }
  }, [stamp, renderMetrics, visibleLayers, layerEntries, crop, dragRect, lookup]);

  // Cell-coordinate hit testing on the preview canvas.
  const eventToCell = useCallback((e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const { tw, th, scale, pxW, pxH } = renderMetrics;
    // Use displayed size, not native — they're equal here (no extra CSS
    // scaling) but guarding against fractional differences from DPR.
    const cx = Math.floor((px / rect.width) * pxW / tw);
    const cy = Math.floor((py / rect.height) * pxH / th);
    if (cx < 0 || cy < 0 || cx >= stamp.width || cy >= stamp.height) return null;
    return { x: cx, y: cy };
    void scale;
  }, [renderMetrics, stamp.width, stamp.height]);

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = eventToCell(e);
    if (!pos) return;
    dragStartRef.current = { cx: pos.x, cy: pos.y };
    setDragRect({ x: pos.x, y: pos.y, width: 1, height: 1 });
  };
  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    const pos = eventToCell(e);
    if (!pos) return;
    // Snap to square — the panel row's thumbnail slot is fixed-size, so
    // square crops render at a consistent scale across every stamp in
    // the list. Side length = max of the two axes' drag distances; the
    // anchor (drag origin) determines which corner stays put, so the
    // square grows from where the user clicked.
    const dx = pos.x - start.cx;
    const dy = pos.y - start.cy;
    const side = Math.max(Math.abs(dx), Math.abs(dy)) + 1;
    const signX = dx < 0 ? -1 : 1;
    const signY = dy < 0 ? -1 : 1;
    let x = signX > 0 ? start.cx : start.cx - (side - 1);
    let y = signY > 0 ? start.cy : start.cy - (side - 1);
    // Clamp to stamp bounds so the square never spills past the edge.
    x = Math.max(0, Math.min(x, stamp.width - side));
    y = Math.max(0, Math.min(y, stamp.height - side));
    // If the requested side is larger than the stamp dimension, shrink
    // it (only possible on tiny stamps where the bigger axis is < side).
    const cappedSide = Math.min(side, stamp.width - x, stamp.height - y);
    setDragRect({ x, y, width: cappedSide, height: cappedSide });
  };
  const finishDrag = () => {
    if (!dragStartRef.current) return;
    dragStartRef.current = null;
    if (dragRect) {
      // Treat a near-zero drag (single click) as "clear crop" — easier
      // discovery than hunting for a button.
      if (dragRect.width <= 1 && dragRect.height <= 1) {
        setCrop(undefined);
      } else {
        setCrop({ ...dragRect });
      }
    }
    setDragRect(null);
  };

  const toggleLayer = (name: string) => {
    setVisibleLayers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const handleSave = () => {
    // Normalize: when the user re-checked everything, omit the field
    // entirely so we don't bloat localStorage with a no-op array.
    const allNames = layerEntries.map((l) => l.name);
    const layersDiffer = visibleLayers.size !== allNames.length
      || allNames.some((n) => !visibleLayers.has(n));
    onSave({
      thumbnailLayers: layersDiffer ? Array.from(visibleLayers) : undefined,
      thumbnailCrop: crop ?? undefined,
    });
  };

  const reset = () => {
    setVisibleLayers(new Set(layerEntries.map((l) => l.name)));
    setCrop(undefined);
    setDragRect(null);
  };

  return (
    <Backdrop onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>Edit thumbnail · {stamp.name}</Header>
        <Body>
          <LayersCol>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Layers shown in preview</div>
            {layerEntries.map((l) => (
              <LayerCheckRow key={l.idx}>
                <input
                  type="checkbox"
                  checked={visibleLayers.has(l.name)}
                  onChange={() => toggleLayer(l.name)}
                />
                <span>{l.name}</span>
              </LayerCheckRow>
            ))}
          </LayersCol>
          <PreviewCol>
            <PreviewWrap>
              <PreviewCanvas
                ref={canvasRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={finishDrag}
                onMouseLeave={finishDrag}
              />
            </PreviewWrap>
            <CropHint>
              {crop
                ? `Crop: ${crop.width} × ${crop.height} tiles at (${crop.x}, ${crop.y}) — click any tile to clear`
                : 'Drag a rectangle to crop the thumbnail · click once to keep the full stamp'}
            </CropHint>
          </PreviewCol>
        </Body>
        <Footer>
          <ResetLink onClick={reset}>Reset to defaults</ResetLink>
          <DarkButton onClick={onCancel}>Cancel</DarkButton>
          <PrimaryButton onClick={handleSave}>Save thumbnail</PrimaryButton>
        </Footer>
      </Modal>
    </Backdrop>
  );
};
