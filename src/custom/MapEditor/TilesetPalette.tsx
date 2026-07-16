/**
 * Tiled-style tileset palette.
 *
 * Layout:
 *   ┌─────────────────────────────────┐
 *   │  [TS A] [TS B] [TS C]   ─ + 100%│   tabs + zoom controls
 *   ├─────────────────────────────────┤
 *   │   ┌───────────────────────┐     │
 *   │   │  scaled tileset image │     │   active tileset, scrollable
 *   │   │  with selection overlay     │
 *   │   └───────────────────────┘     │
 *   └─────────────────────────────────┘
 *
 * Each tileset gets its own tab. Click a tab to switch. Single-click on a
 * tile → 1×1 brush. Drag a rectangle → multi-cell pattern brush. Active
 * brush cells highlighted in yellow.
 *
 * Zoom: 25%–400% via CSS scale transform on the canvas (one source of
 * truth — actual pixel positions don't change). Click math accounts for
 * the CSS scaling via the canvas's bounding rect.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import type { Brush, LoadedState, LoadedTileset } from './mapEditorTypes';
import { drawAnimationBadge } from './animBadge';

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.dark16};
  border-radius: 8px;
  overflow: hidden;
  flex: 1 1 auto;
  min-height: 0;
`;

const Header = styled.div`
  padding: 8px 10px;
  ${({ theme }) => theme.fonts.titlesOverline};
  color: ${({ theme }) => theme.colors.text400};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark14};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TabBar = styled.div`
  display: flex;
  overflow-x: auto;
  background-color: ${({ theme }) => theme.colors.dark14};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark12};
  flex-shrink: 0;

  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.dark20};
    border-radius: 3px;
  }
`;

const Tab = styled.button<{ $active: boolean }>`
  all: unset;
  cursor: pointer;
  padding: 8px 12px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ $active, theme }) => ($active ? theme.colors.text100 : theme.colors.text400)};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.dark16 : 'transparent')};
  border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primaryBase : 'transparent')};
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.text100};
    background-color: ${({ $active, theme }) => ($active ? theme.colors.dark16 : theme.colors.dark18)};
  }
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark14};
  background-color: ${({ theme }) => theme.colors.dark14};
  flex-shrink: 0;
`;

const ZoomBtn = styled.button`
  all: unset;
  cursor: pointer;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text400};
  background-color: ${({ theme }) => theme.colors.dark20};
  border-radius: 4px;
  ${({ theme }) => theme.fonts.normalSmall};

  &:hover {
    color: ${({ theme }) => theme.colors.text100};
    background-color: ${({ theme }) => theme.colors.dark23};
  }
  &:disabled {
    color: ${({ theme }) => theme.colors.text700};
    cursor: default;
    background-color: ${({ theme }) => theme.colors.dark18};
  }
`;

const ZoomLabel = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  min-width: 42px;
  text-align: center;
`;

const ZoomInput = styled.input`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 1px 4px;
  width: 50px;
  text-align: center;
  outline: none;
  &:hover { border-color: ${({ theme }) => theme.colors.dark23}; }
  &:focus {
    border-color: ${({ theme }) => theme.colors.primaryBase};
    color: ${({ theme }) => theme.colors.text100};
  }
`;

const Spacer = styled.span` flex: 1; `;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AddBtn = styled.button`
  all: unset;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text400};
  font-family: monospace;
  font-size: 14px;
  line-height: 1;
  &:hover { color: ${({ theme }) => theme.colors.text100}; background-color: ${({ theme }) => theme.colors.dark18}; }
`;

const TilesetMeta = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
  font-size: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
`;

const ScrollHost = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const CanvasWrap = styled.div`
  position: relative;
  /* Origin top-left so CSS scale doesn't shift the content. */
  transform-origin: top left;
  user-select: none;
`;

const TilesetCanvas = styled.canvas`
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  background: ${({ theme }) => theme.colors.dark14};
  cursor: crosshair;
`;

const EmptyMessage = styled.div`
  padding: 16px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
  text-align: center;
`;

// Pixel-art-clean ratios only — see the matching list in MapCanvas.tsx.
const ZOOM_STEPS = [0.25, 0.5, 1, 2, 3, 4, 6, 8];
const DEFAULT_ZOOM_IDX = ZOOM_STEPS.indexOf(1);
const ZOOM_MIN = ZOOM_STEPS[0];
const ZOOM_MAX = ZOOM_STEPS[ZOOM_STEPS.length - 1];

type Props = {
  state: LoadedState;
  /** Currently active brush (for highlighting selected tiles). */
  brush: Brush | null;
  /**
   * Called with the picked brush. Single click → 1×1 brush.
   * Drag selection → NxM pattern.
   */
  onPickBrush: (brush: Brush) => void;
  /** Opens the "add tileset" dialog. When omitted the "+" button hides. */
  onAddTileset?: () => void;
  /** Collapse the entire palette panel into a thin rail (parent owns the
   *  rail + re-expand button). When omitted the "›" button hides — mirrors
   *  LayerList's `onCollapse`. */
  onCollapse?: () => void;
  /**
   * Open the animation editor for the selected tile(s).
   *   - exactly 1 tileId → single-tile editor (AnimationEditor)
   *   - >1 tileIds       → bulk editor (BulkAnimationEditor)
   * MapEditorPage owns that dispatch + the modal mount.
   */
  onEditAnimation?: (tilesetIndex: number, tileIds: number[]) => void;
};

export const TilesetPalette: React.FC<Props> = ({ state, brush, onPickBrush, onAddTileset, onCollapse, onEditAnimation }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  // Continuous zoom value (not step-index): lets the user type arbitrary
  // percentages. Buttons + wheel snap to the next ZOOM_STEPS rung.
  const [zoom, setZoom] = useState<number>(ZOOM_STEPS[DEFAULT_ZOOM_IDX]);
  const [zoomInputText, setZoomInputText] = useState<string>(() => `${Math.round(ZOOM_STEPS[DEFAULT_ZOOM_IDX] * 100)}`);
  useEffect(() => {
    if (document.activeElement?.tagName === 'INPUT') return;
    setZoomInputText(`${Math.round(zoom * 100)}`);
  }, [zoom]);
  const commitZoomInput = () => {
    const n = parseFloat(zoomInputText);
    if (!Number.isFinite(n) || n <= 0) {
      setZoomInputText(`${Math.round(zoom * 100)}`);
      return;
    }
    const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, n / 100));
    setZoom(next);
    setZoomInputText(`${Math.round(next * 100)}`);
  };
  // Next/prev step relative to the current continuous zoom value.
  const stepZoom = (dir: 1 | -1, anchor?: { cursorX: number; cursorY: number; rect: DOMRect }) => {
    const idx = ZOOM_STEPS.findIndex((z) => z >= zoom - 1e-9);
    let nextIdx = idx;
    if (dir > 0) nextIdx = idx < 0 ? 0 : Math.min(ZOOM_STEPS.length - 1, idx + (ZOOM_STEPS[idx] > zoom ? 0 : 1));
    else nextIdx = idx < 0 ? ZOOM_STEPS.length - 1 : Math.max(0, idx - 1);
    const next = ZOOM_STEPS[nextIdx];
    if (next === zoom) return;
    if (anchor && scrollHostRef.current) {
      // Cursor-anchored: keep the palette pixel under the mouse fixed
      // as zoom changes. Math mirrors the canvas's Ctrl+wheel zoom.
      const host = scrollHostRef.current;
      const worldX = (host.scrollLeft + anchor.cursorX) / zoom;
      const worldY = (host.scrollTop + anchor.cursorY) / zoom;
      setZoom(next);
      requestAnimationFrame(() => {
        const h = scrollHostRef.current;
        if (!h) return;
        h.scrollLeft = worldX * next - anchor.cursorX;
        h.scrollTop = worldY * next - anchor.cursorY;
      });
    } else {
      setZoom(next);
    }
  };
  const scrollHostRef = useRef<HTMLDivElement | null>(null);

  // Keep the active tileset across state-identity flips when the
  // SAME tileset (by source/name) is still present in the new state.
  // The state object gets rebuilt on every reload — including the post-
  // animation-save reload — so a naive `setActiveIdx(0)` would yank the
  // user out of whichever tileset they were editing. Only reset when the
  // active source genuinely disappears (different map, tileset removed).
  const activeKeyRef = useRef<string | null>(null);
  activeKeyRef.current = state.tilesets[activeIdx]
    ? (state.tilesets[activeIdx].source ?? state.tilesets[activeIdx].name ?? null)
    : null;
  useEffect(() => {
    const prevKey = activeKeyRef.current;
    if (!prevKey) { setActiveIdx(0); return; }
    const matchIdx = state.tilesets.findIndex(
      (ts) => (ts.source ?? ts.name) === prevKey,
    );
    setActiveIdx(matchIdx >= 0 ? matchIdx : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // When the brush changes externally (right-click pick on the canvas),
  // jump the palette tab to that tileset and scroll its first picked tile
  // into view + centered. Skips palette-internal brush changes (the brush
  // already belongs to the active tab so the effect is a no-op there).
  //
  // Timing note: when the target tileset is DIFFERENT from the current
  // one, setActiveIdx remounts TilesetView; its drawImage useEffect sizes
  // the canvas on commit. We wait two rAFs so that:
  //   1) React commits the activeIdx change
  //   2) TilesetView's useEffect sets canvas.width/height + CanvasWrap
  //      gets its explicit dimensions
  //   3) Layout is settled and scrollHeight reflects the scaled content
  // before we assign scrollTop / scrollLeft.
  useEffect(() => {
    if (!brush) return;
    const firstCell = brush.cells.find((c) => c !== null);
    if (!firstCell) return;
    const targetIdx = firstCell.tilesetIndex;
    if (targetIdx < 0 || targetIdx >= state.tilesets.length) return;
    setActiveIdx(targetIdx);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const ts = state.tilesets[targetIdx];
      const host = scrollHostRef.current;
      if (!ts || !host) return;
      const cols = ts.columns || 1;
      const margin = ts.margin ?? 0;
      const spacing = ts.spacing ?? 0;
      const col = firstCell.tileId % cols;
      const row = Math.floor(firstCell.tileId / cols);
      const tileX = margin + col * (ts.tilewidth + spacing);
      const tileY = margin + row * (ts.tileheight + spacing);
      const z = zoom;
      // Center the picked tile on both axes; clamp to scroll bounds.
      const desiredY = tileY * z - host.clientHeight / 2 + (ts.tileheight * z) / 2;
      const desiredX = tileX * z - host.clientWidth / 2 + (ts.tilewidth * z) / 2;
      const maxScrollY = Math.max(0, host.scrollHeight - host.clientHeight);
      const maxScrollX = Math.max(0, host.scrollWidth - host.clientWidth);
      host.scrollTop = Math.min(maxScrollY, Math.max(0, desiredY));
      host.scrollLeft = Math.min(maxScrollX, Math.max(0, desiredX));
    }));
    // brush identity changes on every pick, so deps on brush are correct.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brush]);

  const ts = state.tilesets[activeIdx];

  return (
    <Wrap>
      <Header>
        <HeaderLeft>
          {onCollapse && (
            <AddBtn onClick={onCollapse} title="Collapse tilesets panel">›</AddBtn>
          )}
          <span>Tilesets</span>
          {onAddTileset && (
            <AddBtn onClick={onAddTileset} title="Add a tileset reference to this map">+</AddBtn>
          )}
        </HeaderLeft>
        <TilesetMeta>{ts?.name ?? '—'}</TilesetMeta>
      </Header>
      <TabBar>
        {state.tilesets.map((t, i) => (
          <Tab
            key={i}
            $active={i === activeIdx}
            onClick={() => setActiveIdx(i)}
            title={t.name ?? '(unnamed)'}
          >
            {t.name ?? `#${i}`}
          </Tab>
        ))}
      </TabBar>
      <ZoomControls>
        <ZoomBtn onClick={() => stepZoom(-1)} disabled={zoom <= ZOOM_MIN + 1e-9} title="Zoom out">−</ZoomBtn>
        <ZoomInput
          type="text"
          inputMode="numeric"
          value={`${zoomInputText}%`}
          onChange={(e) => setZoomInputText(e.target.value.replace(/%/g, '').trim())}
          onFocus={(e) => e.currentTarget.select()}
          onBlur={commitZoomInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); commitZoomInput(); e.currentTarget.blur(); }
            else if (e.key === 'Escape') { setZoomInputText(`${Math.round(zoom * 100)}`); e.currentTarget.blur(); }
          }}
          title="Type a custom zoom % (Enter to apply)"
        />
        <ZoomBtn onClick={() => stepZoom(1)} disabled={zoom >= ZOOM_MAX - 1e-9} title="Zoom in">+</ZoomBtn>
        <ZoomBtn
          onClick={() => setZoom(ZOOM_STEPS[DEFAULT_ZOOM_IDX])}
          title="Reset zoom (100%)"
          disabled={Math.abs(zoom - 1) < 1e-9}
          style={{ width: 'auto', padding: '0 6px' }}
        >1×</ZoomBtn>
        <Spacer />
        {onEditAnimation && (() => {
          // Collect the tile ids from the active tileset that are in the
          // brush. 1 → single-tile animation editor. >1 → bulk editor.
          // Nulls (Ctrl+click holes inside a bbox) are skipped.
          const tileIds: number[] = [];
          if (brush) {
            for (const c of brush.cells) {
              if (c && c.tilesetIndex === activeIdx) tileIds.push(c.tileId);
            }
          }
          const count = tileIds.length;
          const editable = count > 0;
          const title = !editable
            ? 'Select one or more tiles from this tileset to edit their animation'
            : count === 1
              ? `Edit animation for tile #${tileIds[0]}`
              : `Bulk animation editor (${count} tiles)`;
          return (
            <ZoomBtn
              onClick={() => editable && onEditAnimation(activeIdx, tileIds)}
              disabled={!editable}
              title={title}
              // Icon-only so the row doesn't overflow when the user narrows
              // the tileset panel. Hover/title carries the meaning.
              style={{ flexShrink: 0 }}
            >🎞</ZoomBtn>
          );
        })()}
      </ZoomControls>
      <ScrollHost
        ref={scrollHostRef}
        onWheel={(e) => {
          if (!e.ctrlKey && !e.metaKey) return;
          // Ctrl+wheel zoom — cursor-anchored so the palette pixel under
          // the mouse stays put. Same UX as the map canvas.
          e.preventDefault();
          const host = scrollHostRef.current;
          if (!host) return;
          const rect = host.getBoundingClientRect();
          const cursorX = e.clientX - rect.left;
          const cursorY = e.clientY - rect.top;
          stepZoom(e.deltaY < 0 ? 1 : -1, { cursorX, cursorY, rect });
        }}
      >
        {ts && ts.bitmap ? (
          <TilesetView
            tileset={ts}
            tilesetIndex={activeIdx}
            brush={brush}
            zoom={zoom}
            onPickBrush={onPickBrush}
          />
        ) : (
          <EmptyMessage>
            {ts ? `Tileset "${ts.name}" has no image bytes loaded.` : 'No tileset.'}
          </EmptyMessage>
        )}
      </ScrollHost>
    </Wrap>
  );
};

/** One tileset's image, with click + drag-select interactions. */
const TilesetView: React.FC<{
  tileset: LoadedTileset;
  tilesetIndex: number;
  brush: Brush | null;
  zoom: number;
  onPickBrush: (brush: Brush) => void;
}> = ({ tileset: ts, tilesetIndex, brush, zoom, onPickBrush }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Drag-select state (palette-local, doesn't escape this component).
  const [selecting, setSelecting] = useState(false);
  const [selRect, setSelRect] = useState<{ sx: number; sy: number; ex: number; ey: number } | null>(null);
  // Mirror of selRect so the mouseup window handler can read the latest
  // rect synchronously without going through a setState updater (which
  // would trigger "setState during render" if we called the parent's
  // onPickBrush from inside).
  const selRectRef = useRef(selRect);
  selRectRef.current = selRect;
  const anchorRef = useRef<{ tx: number; ty: number } | null>(null);
  // Persistent picked-tile set. Lets us:
  //   - Drag-select a rectangle (replaces the set with that rect's tiles)
  //   - Ctrl+click to toggle individual tiles in/out (additive selection,
  //     same as Tiled / most tile editors)
  // The set is the source of truth for the visual highlight AND for
  // building the multi-cell brush we hand back via onPickBrush.
  const [selectedTiles, setSelectedTiles] = useState<Set<number>>(new Set());
  // Clear local selection when the underlying tileset changes — old
  // (col,row) keys can refer to non-existent tiles in the new tileset.
  useEffect(() => { setSelectedTiles(new Set()); }, [ts]);

  // Geometry helpers shared between render + click math.
  const geom = useMemo(() => {
    const cols = ts.columns || 1;
    const margin = ts.margin ?? 0;
    const spacing = ts.spacing ?? 0;
    const tilePitchX = ts.tilewidth + spacing;
    const tilePitchY = ts.tileheight + spacing;
    const rows = ts.bitmap
      ? Math.max(1, Math.floor((ts.bitmap.height - margin + spacing) / tilePitchY))
      : 1;
    return { cols, rows, margin, spacing, tilePitchX, tilePitchY };
  }, [ts]);

  // Build a set of (col, row) keys to outline in the palette. When the
  // user has a local selection (drag or Ctrl+click), that drives the
  // highlight directly so even non-rectangular Ctrl+click selections show
  // every picked tile. When there's no local selection (e.g. the brush
  // was set from outside via right-click pick on the map), we fall back
  // to deriving highlights from the current brush so the cells the user
  // would stamp are still indicated.
  const highlighted = useMemo(() => {
    if (selectedTiles.size > 0) return selectedTiles;
    const out = new Set<number>();
    if (!brush) return out;
    for (const c of brush.cells) {
      if (!c || c.tilesetIndex !== tilesetIndex) continue;
      const col = c.tileId % geom.cols;
      const row = Math.floor(c.tileId / geom.cols);
      out.add(row * geom.cols + col);
    }
    return out;
  }, [selectedTiles, brush, tilesetIndex, geom.cols]);

  /**
   * Turn a selected-tile set into a multi-cell Brush. We compute the
   * bounding box of the picks, then fill an array of (bboxW × bboxH)
   * cells where each entry is the tile at that position OR null if the
   * user didn't pick it (Ctrl+click holes inside the bbox remain
   * unpainted by the stamp). Empty set → 1×1 brush with a single null
   * cell, which clears the active brush on the canvas side.
   */
  const buildBrushFromSet = useCallback((tiles: Set<number>) => {
    if (tiles.size === 0) {
      onPickBrush({ width: 1, height: 1, cells: [null] });
      return;
    }
    let minC = Infinity, maxC = -Infinity, minR = Infinity, maxR = -Infinity;
    for (const k of tiles) {
      const c = k % geom.cols;
      const r = Math.floor(k / geom.cols);
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
    }
    const w = maxC - minC + 1;
    const h = maxR - minR + 1;
    const cells: (Brush['cells'][number])[] = new Array(w * h).fill(null);
    for (const k of tiles) {
      const c = k % geom.cols;
      const r = Math.floor(k / geom.cols);
      cells[(r - minR) * w + (c - minC)] = { tilesetIndex, tileId: r * geom.cols + c };
    }
    onPickBrush({ width: w, height: h, cells });
  }, [geom.cols, tilesetIndex, onPickBrush]);

  // Tile ids in this tileset that have an <animation> defined. Drawn with
  // a "•••" badge in the corner so the user can tell at a glance which
  // tiles are animated without opening the editor for each one.
  const animatedTileIds = useMemo(() => {
    const out = new Set<number>();
    const tiles = (ts as unknown as { tiles?: Array<{ id: number; animation?: unknown[] }> }).tiles;
    if (!tiles) return out;
    for (const t of tiles) {
      if (t.animation && Array.isArray(t.animation) && t.animation.length > 0) out.add(t.id);
    }
    return out;
  }, [ts]);

  // Redraw: PNG + highlight grid + active drag selection rect.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ts.bitmap) return;
    const w = ts.imagewidth ?? ts.bitmap.width;
    const h = ts.imageheight ?? ts.bitmap.height;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    // Guard the drawImage: on map switch the previous map's ImageBitmaps
    // can be detached by Pixi's GPU upload + close cycle while a stale
    // `ts` reference is still in this effect's closure. Throwing here
    // would crash the whole component for one frame — try/catch + early
    // return lets React re-render with the new map's fresh bitmaps.
    try {
      ctx.drawImage(ts.bitmap, 0, 0);
    } catch (e) {
      console.warn('[tileset-palette] drawImage skipped (detached bitmap, will retry on next render):', e);
      return;
    }

    // Brush-membership highlights.
    if (highlighted.size > 0) {
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffd000';
      for (const key of highlighted) {
        const row = Math.floor(key / geom.cols);
        const col = key % geom.cols;
        const sx = geom.margin + col * geom.tilePitchX;
        const sy = geom.margin + row * geom.tilePitchY;
        ctx.strokeRect(sx + 0.5, sy + 0.5, ts.tilewidth - 1, ts.tileheight - 1);
      }
      ctx.restore();
    }

    // Animation badge — film-strip across the bottom of every tile that
    // has an <animation> entry. Same look in the animation editor.
    if (animatedTileIds.size > 0) {
      for (const id of animatedTileIds) {
        const row = Math.floor(id / geom.cols);
        const col = id % geom.cols;
        if (row >= geom.rows) continue;
        const sx = geom.margin + col * geom.tilePitchX;
        const sy = geom.margin + row * geom.tilePitchY;
        drawAnimationBadge(ctx, sx, sy, ts.tilewidth, ts.tileheight);
      }
    }

    // Active drag-selection (in-progress).
    if (selRect) {
      const x = geom.margin + selRect.sx * geom.tilePitchX;
      const y = geom.margin + selRect.sy * geom.tilePitchY;
      const ww = (selRect.ex - selRect.sx + 1) * geom.tilePitchX - geom.spacing;
      const hh = (selRect.ey - selRect.sy + 1) * geom.tilePitchY - geom.spacing;
      ctx.save();
      ctx.fillStyle = 'rgba(255, 208, 0, 0.18)';
      ctx.fillRect(x, y, ww, hh);
      ctx.strokeStyle = '#ffd000';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, ww - 2, hh - 2);
      ctx.restore();
    }
  }, [ts, highlighted, selRect, geom, animatedTileIds]);

  // Map pointer pixel coords → tileset grid (col, row).
  const eventToTile = (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent):
    { tx: number; ty: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = Math.floor(sx * scaleX);
    const py = Math.floor(sy * scaleY);
    // Subtract margin, divide by tile pitch.
    const tx = Math.floor((px - geom.margin) / geom.tilePitchX);
    const ty = Math.floor((py - geom.margin) / geom.tilePitchY);
    if (tx < 0 || ty < 0 || tx >= geom.cols || ty >= geom.rows) return null;
    return { tx, ty };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const pos = eventToTile(e);
    if (!pos) return;
    const key = pos.ty * geom.cols + pos.tx;

    // Ctrl/Cmd+click: toggle this tile in/out of the existing selection.
    // No drag — single-tile toggle, same as Tiled / most editors.
    //
    // IMPORTANT: keep the parent setState (onPickBrush via
    // buildBrushFromSet) OUTSIDE the setSelectedTiles updater.
    // React invokes functional updaters during reconciliation; calling
    // a parent setState from there warns "Cannot update a component
    // while rendering a different component" AND can silently drop the
    // update, leaving the parent's selectedBrush stale.
    if (e.ctrlKey || e.metaKey) {
      const next = new Set(selectedTiles);
      if (next.has(key)) next.delete(key); else next.add(key);
      setSelectedTiles(next);
      buildBrushFromSet(next);
      return;
    }

    // Plain click — start a fresh drag-select. The drag rect on its own
    // doesn't replace `selectedTiles` until mouseup so the highlight
    // briefly shows both the OLD selection and the in-progress rect; the
    // user's intent is unambiguous on release.
    setSelecting(true);
    anchorRef.current = pos;
    setSelRect({ sx: pos.tx, sy: pos.ty, ex: pos.tx, ey: pos.ty });
  };

  // Window-level mousemove/mouseup so drag works even when cursor leaves
  // the canvas. Reads `selecting` via state — effect re-binds when it
  // flips, which is fine (it's a brief interaction).
  useEffect(() => {
    if (!selecting) return;
    const onMove = (e: MouseEvent) => {
      const pos = eventToTile(e);
      if (!pos || !anchorRef.current) return;
      const a = anchorRef.current;
      setSelRect({
        sx: Math.min(a.tx, pos.tx),
        sy: Math.min(a.ty, pos.ty),
        ex: Math.max(a.tx, pos.tx),
        ey: Math.max(a.ty, pos.ty),
      });
    };
    const onUp = () => {
      setSelecting(false);
      anchorRef.current = null;
      // Capture the rect synchronously (closure over current ref) so we
      // can compute the new selection + parent brush OUTSIDE the React
      // updater. Calling onPickBrush from inside setSelRect's updater
      // triggers "setState during render" because the updater runs in
      // the reconciliation phase. See the matching comment in onMouseDown.
      const rect = selRectRef.current;
      if (!rect) return;
      const next = new Set<number>();
      for (let r = rect.sy; r <= rect.ey; r++) {
        for (let c = rect.sx; c <= rect.ex; c++) {
          if (c < 0 || r < 0 || c >= geom.cols || r >= geom.rows) continue;
          next.add(r * geom.cols + c);
        }
      }
      setSelectedTiles(next);
      setSelRect(null);
      buildBrushFromSet(next);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selecting, tilesetIndex, geom.cols, geom.rows]);

  // CSS-sized to the scaled bitmap so the ScrollHost's scrollable area
  // grows with zoom (transform: scale would not expand the layout box,
  // which broke "scroll-to-tile" centering at zoom != 1).
  const scaledW = ts.bitmap ? ts.bitmap.width * zoom : undefined;
  const scaledH = ts.bitmap ? ts.bitmap.height * zoom : undefined;
  return (
    <CanvasWrap>
      <TilesetCanvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onContextMenu={(e) => e.preventDefault()}
        style={scaledW !== undefined ? { width: `${scaledW}px`, height: `${scaledH}px` } : undefined}
      />
    </CanvasWrap>
  );
};
