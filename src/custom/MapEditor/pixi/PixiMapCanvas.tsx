/**
 * PixiJS renderer for the map editor — Tier 3 step 3+: full feature parity
 * with the Canvas2D `MapCanvas` (paint/erase/fill, brush preview, selection
 * rect, grid, pan, zoom, undo/redo, save), but rendering through WebGL
 * sprite-batching instead of per-cell `drawImage` calls.
 *
 * Layout: keep the same scroll-host + canvas-takes-map-size pattern as
 * Canvas2D. Mouse math and middle-mouse pan transplant directly — what
 * differs is the rendering hot path:
 *   - Each tileset PNG becomes one PIXI.Texture (shared TextureSource).
 *     Sprites that use the same source automatically batch into a single
 *     GPU draw call per layer.
 *   - One PIXI.Container per visible tile layer. Sprite per non-empty
 *     cell, keyed by (layerIdx, cellIdx) in `spritesRef` for cheap
 *     incremental updates on paint/erase.
 *   - Animations: rAF (via `app.ticker`) advances a global elapsed clock
 *     and reassigns `sprite.texture` on the animated sprites whose frame
 *     index changed. No layer-cache rebuild.
 *   - Overlays (brush preview, selection rect, grid) live on a top
 *     container as `PIXI.Graphics` — redrawn on hover/cursor move only.
 *
 * Identical UX to Canvas2D: same hotkeys, same tool behavior, same
 * brush/selection model. Save and undo go through the same wasm bridge.
 */

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styled from 'styled-components';
import * as PIXI from 'pixi.js';
import {
  TiledMap,
  TiledModule,
  type AssetEntry,
} from '../tiledWasm';
import { parseTmxLayerData, pathKey } from '../tmxLayerData';
import {
  DEFAULT_ZOOM,
  ZOOM_STEPS,
  type Brush,
  type BrushCell,
  type BrushLayer,
  type HistoryEntry,
  type LoadedState,
  type LoadedTileset,
  type MapCanvasHandle,
  type TmjAnimFrame,
  type TmjLayer,
  type TmjMap,
  type TmjTileset,
  type TmjTilesetTile,
} from '../mapEditorTypes';

// --- gid bit math ---------------------------------------------------------
const FLIPPED_HORIZONTALLY = 0x80000000 >>> 0;
const FLIPPED_VERTICALLY   = 0x40000000 >>> 0;
const FLIPPED_DIAGONALLY   = 0x20000000 >>> 0;
const GID_MASK             = 0x1fffffff;
const UNDO_LIMIT = 200;

type AnimSprite = {
  sprite: PIXI.Sprite;
  ts: LoadedTileset;
  cache: TilesetTextureCache;
  frameTileIds: number[];
  durations: number[];
  total: number;
  shownFrame: number;
};

/**
 * One band of a tileset's image. Big tilesets (PSDK exports an
 * autotile-expansion PNG at 256×20128 — way past WebGL's 16384-pixel
 * texture-size limit) get sliced horizontally into multiple bands so
 * each band fits in a single GPU texture.
 *
 * For small tilesets `bands` has length 1 and the cache behaves
 * identically to the pre-banding version.
 */
type TilesetBand = {
  base: PIXI.Texture;
  /** First tile-row (in tileheight units) this band covers in the original image. */
  rowStart: number;
  /** Number of tile-rows in this band. */
  rowCount: number;
};

type TilesetTextureCache = {
  bands: TilesetBand[];
  perTile: Map<number, PIXI.Texture>;
};

/**
 * Build one or more PIXI.Texture sources from a tileset bitmap, splitting
 * along Y if the image is too tall for a single GPU texture. Band heights
 * are always multiples of `tileHeight` so no tile straddles a band edge.
 *
 * `maxTexSize` is the GPU's max texture dimension. WebGL2 guarantees at
 * least 16384 on desktop, but integrated GPUs can be 8192 — we use 16384
 * as the cap (Pixi uses the same value internally for its own checks).
 */
async function buildTilesetBands(
  bitmap: ImageBitmap,
  tileHeight: number,
  maxTexSize: number,
): Promise<TilesetBand[]> {
  const w = bitmap.width;
  const h = bitmap.height;
  if (h <= maxTexSize && w <= maxTexSize) {
    const base = PIXI.Texture.from(bitmap);
    base.source.scaleMode = 'nearest';
    return [{ base, rowStart: 0, rowCount: Math.floor(h / tileHeight) }];
  }
  if (w > maxTexSize) {
    // Almost never seen in practice (most tilesets are narrow columns of
    // tiles). If we hit it, a horizontal split would be needed too — out
    // of scope for the common case; warn loudly.
    console.warn(`[map-editor] tileset bitmap is wider than the GPU's max texture size (${w} > ${maxTexSize}). Horizontal banding is not implemented; tiles in that range may render incorrectly.`);
  }
  // Carve into vertical bands of at most maxTexSize pixels, rounded down
  // to a multiple of tileHeight so tile rows aren't split across bands.
  const rowsPerBand = Math.floor(maxTexSize / tileHeight);
  const bandHeightPx = rowsPerBand * tileHeight;
  const bands: TilesetBand[] = [];
  let rowCursor = 0;
  while (rowCursor * tileHeight < h) {
    const sy = rowCursor * tileHeight;
    const remainingPx = h - sy;
    const thisBandPx = Math.min(bandHeightPx, remainingPx);
    const thisBandRows = Math.floor(thisBandPx / tileHeight);
    if (thisBandRows === 0) break;
    // createImageBitmap with crop avoids a Canvas2D round-trip.
    const sub = await createImageBitmap(bitmap, 0, sy, w, thisBandPx);
    const base = PIXI.Texture.from(sub);
    base.source.scaleMode = 'nearest';
    bands.push({ base, rowStart: rowCursor, rowCount: thisBandRows });
    rowCursor += thisBandRows;
  }
  return bands;
}

// --- styles ---------------------------------------------------------------

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
`;

const Status = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

const ErrorBox = styled.div`
  padding: 12px;
  border-left: 3px solid ${({ theme }) => theme.colors.dangerBase};
  background-color: ${({ theme }) => theme.colors.dark18};
  color: ${({ theme }) => theme.colors.dangerBase};
  ${({ theme }) => theme.fonts.normalSmall};
  white-space: pre-wrap;
  font-family: monospace;
`;

const ScrollHost = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  /* Lighter frame around the dark "drawable" surface inside. Two-tone
     so the drawable area is visually distinguishable from the empty
     scroll margin around it. */
  background-color: ${({ theme }) => theme.colors.dark18};
  border-radius: 8px;
  padding: 12px;
`;

const PixiHost = styled.div`
  position: relative;
  display: inline-block;
  /* The actual drawable area — darker than the ScrollHost so the map
     bounds read as a distinct surface. */
  background-color: ${({ theme }) => theme.colors.dark8};
  border-radius: 4px;
  & canvas {
    display: block;
    image-rendering: pixelated;
    image-rendering: crisp-edges;
    cursor: crosshair;
  }
`;

/**
 * Ensure every tileset has a usable `firstgid`. If the firstgids the
 * bridge handed us are already a strictly-increasing sequence starting
 * at 1, trust them — that's the canonical TMX layout and the values
 * encode the tile-range boundaries the on-disk gids were allocated
 * against. Recomputing them in that case would shift the boundaries
 * and silently re-bucket every saved gid into the wrong tileset (see
 * MagnaRedux: TMX assigns Umbra_Fall_Outdoors 360 slots, but its
 * bitmap is 384 tiles — packing edge-to-edge by image size pushes
 * passages from gid 361 to gid 385 and every cell pointing at a
 * passages tile now resolves to Umbra_Fall_Outdoors instead).
 *
 * We only rebuild when the input is degenerate: bridge dropped to
 * firstgid=1 across the board, values aren't monotonic, or duplicates
 * exist. That covers the original symptom (every external tileset
 * reported firstgid=1 → `findTilesetForGid` always resolved to the
 * last tileset → first-layer paints invisible on freshly-created
 * maps) without disturbing properly-authored maps.
 */
const recomputeFirstgids = <T extends TmjTileset & { bitmap?: ImageBitmap }>(tilesets: T[]): T[] => {
  if (tilesets.length === 0) return tilesets;

  const firstgidsLookOk = (() => {
    if ((tilesets[0].firstgid ?? 0) !== 1) return false;
    for (let i = 1; i < tilesets.length; i++) {
      const prev = tilesets[i - 1].firstgid ?? 0;
      const cur = tilesets[i].firstgid ?? 0;
      if (cur <= prev) return false;
    }
    return true;
  })();
  if (firstgidsLookOk) return tilesets;

  let acc = 1;
  return tilesets.map((ts) => {
    let tilecount = ts.tilecount;
    if (!tilecount || tilecount <= 0) {
      // Derive from bitmap when libtiled didn't surface a tile count.
      if (ts.bitmap && ts.tilewidth && ts.tileheight) {
        const cols = Math.floor(ts.bitmap.width / ts.tilewidth);
        const rows = Math.floor(ts.bitmap.height / ts.tileheight);
        tilecount = cols * rows;
      } else if (ts.columns && ts.imageheight && ts.tileheight) {
        tilecount = ts.columns * Math.floor(ts.imageheight / ts.tileheight);
      } else {
        tilecount = 1;
      }
    }
    const fixed = { ...ts, firstgid: acc };
    acc += Math.max(1, tilecount);
    return fixed;
  });
};

// --- diagnostics ----------------------------------------------------------
//
// Toggle in DevTools:  localStorage.MAP_EDITOR_DEBUG = '1'  (then reload)
// Off by default — instrumentation cost is one localStorage read per call
// when off, and a few console writes per click when on. Use to trace the
// paint chain end-to-end and find where it's silently dropping work.
//
// Categories:
//   load      — bundle fetch, wasm open, JSON shape, normalized layers
//   rebuild   — full layer dump after every structural rebuild
//   layer     — addTileLayer / addGroupLayer outcomes
//   click     — paint mousedown: active layer, brush, tile target
//   stamp     — per-cell bridge write + JS mirror update + sync result
//   sync      — sprite create/update/skip per syncSpriteAt call
//
// Each line is prefixed `[me:<cat>]` to grep cleanly in the console.
type DebugCategory = 'load' | 'rebuild' | 'layer' | 'click' | 'stamp' | 'sync';
const MAP_EDITOR_DEBUG = (): boolean => {
  try { return localStorage.getItem('MAP_EDITOR_DEBUG') === '1'; }
  catch { return false; }
};
const dbg = (cat: DebugCategory, ...args: unknown[]): void => {
  if (!MAP_EDITOR_DEBUG()) return;
  // eslint-disable-next-line no-console
  console.log(`[me:${cat}]`, ...args);
};

// --- pure helpers ---------------------------------------------------------

const readBundle = (projectPath: string, tiledFilename: string):
  Promise<{ map: AssetEntry; tilesets: AssetEntry[]; images: AssetEntry[] }> =>
  new Promise((resolve, reject) => {
    window.api.readMapAndAssets(
      { projectPath, tiledFilename },
      (payload) => resolve(payload as { map: AssetEntry; tilesets: AssetEntry[]; images: AssetEntry[] }),
      (err) => reject(new Error(err.errorMessage)),
    );
  });

const normalize = (p: string) => (p.startsWith('/') ? p : '/' + p).replaceAll('\\', '/');

/** Resolve a brush extra-layer to a destination layer index on the
 *  current map. Prefers `layerName` (stable across maps + reorderings)
 *  and falls back to `activeIdx + layerOffset` only when the name is
 *  missing or doesn't match any current layer. Critical for stamps
 *  pasted onto destinations where layers got reordered or added — the
 *  saved offset is brittle, the name isn't. */
const resolveExtraLayerIdx = (
  layers: { name: string }[],
  extra: BrushLayer,
  activeIdx: number,
): number => {
  if (extra.layerName) {
    const i = layers.findIndex((l) => l.name === extra.layerName);
    if (i >= 0) return i;
  }
  return activeIdx + extra.layerOffset;
};

const decodePngFromBytes = async (bytes: ArrayBuffer): Promise<ImageBitmap> => {
  const blob = new Blob([bytes], { type: 'image/png' });
  return await createImageBitmap(blob);
};

const parseTransparentColor = (s: string | undefined): [number, number, number] | null => {
  if (!s) return null;
  const hex = s.replace('#', '');
  const start = hex.length === 8 ? 2 : 0;
  if (hex.length !== 6 && hex.length !== 8) return null;
  const r = parseInt(hex.substring(start, start + 2), 16);
  const g = parseInt(hex.substring(start + 2, start + 4), 16);
  const b = parseInt(hex.substring(start + 4, start + 6), 16);
  return Number.isNaN(r + g + b) ? null : [r, g, b];
};

const applyTransparentColor = async (
  src: ImageBitmap,
  trans: string | undefined,
): Promise<ImageBitmap> => {
  const rgb = parseTransparentColor(trans);
  if (!rgb) return src;
  const [tr, tg, tb] = rgb;
  const work = document.createElement('canvas');
  work.width = src.width;
  work.height = src.height;
  const ctx = work.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, work.width, work.height);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === tr && data[i + 1] === tg && data[i + 2] === tb) data[i + 3] = 0;
  }
  ctx.putImageData(img, 0, 0);
  src.close?.();
  return await createImageBitmap(work);
};

const findTilesetForGid = (tilesets: LoadedTileset[], gid: number): LoadedTileset | null => {
  let best: LoadedTileset | null = null;
  for (const ts of tilesets) {
    if (ts.firstgid <= gid && (!best || ts.firstgid >= best.firstgid)) best = ts;
  }
  return best;
};

function* cellsOf(layer: TmjLayer): Generator<{ x: number; y: number; raw: number }> {
  if (layer.data && layer.width && layer.height) {
    const w = layer.width;
    for (let y = 0; y < layer.height; y++) {
      for (let x = 0; x < w; x++) {
        const raw = layer.data[y * w + x] >>> 0;
        if (raw !== 0) yield { x, y, raw };
      }
    }
  } else if (layer.chunks) {
    for (const c of layer.chunks) {
      for (let cy = 0; cy < c.height; cy++) {
        for (let cx = 0; cx < c.width; cx++) {
          const raw = c.data[cy * c.width + cx] >>> 0;
          if (raw !== 0) yield { x: c.x + cx, y: c.y + cy, raw };
        }
      }
    }
  }
}

const readCellRaw = (layer: TmjLayer, x: number, y: number): number => {
  if (layer.width && layer.height) {
    if (x < 0 || y < 0 || x >= layer.width || y >= layer.height) return 0;
    if (!layer.data) return 0;
    return (layer.data[y * layer.width + x] >>> 0) | 0;
  }
  if (layer.chunks) {
    for (const c of layer.chunks) {
      if (x >= c.x && y >= c.y && x < c.x + c.width && y < c.y + c.height) {
        return (c.data[(y - c.y) * c.width + (x - c.x)] >>> 0) | 0;
      }
    }
  }
  return 0;
};

const writeCellRaw = (layer: TmjLayer, x: number, y: number, raw: number) => {
  if (layer.width && layer.height) {
    if (x < 0 || y < 0 || x >= layer.width || y >= layer.height) return;
    // Lazy-init the data array. libtiled can return a tile layer with
    // `data` omitted when the layer is all-zeros (or when the .tmx is
    // generated externally — like our New Map flow). Without this guard
    // the FIRST paint on such a layer would silently drop (bridge gets
    // updated, JS-side mirror doesn't), and nothing draws until a
    // structural rebuild forces a fresh load from disk.
    if (!layer.data || layer.data.length !== layer.width * layer.height) {
      layer.data = new Array(layer.width * layer.height).fill(0);
    }
    layer.data[y * layer.width + x] = raw;
    return;
  }
  if (layer.chunks) {
    for (const c of layer.chunks) {
      if (x >= c.x && y >= c.y && x < c.x + c.width && y < c.y + c.height) {
        c.data[(y - c.y) * c.width + (x - c.x)] = raw;
        return;
      }
    }
  }
};

function* lineBetween(x0: number, y0: number, x1: number, y1: number):
  Generator<{ x: number; y: number }> {
  let x = x0, y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    yield { x, y };
    if (x === x1 && y === y1) return;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
  }
}

const sliceTileTexture = (cache: TilesetTextureCache, ts: TmjTileset, localId: number): PIXI.Texture => {
  const existing = cache.perTile.get(localId);
  if (existing) return existing;
  const cols = ts.columns || 1;
  const margin = ts.margin ?? 0;
  const spacing = ts.spacing ?? 0;
  const col = localId % cols;
  const row = Math.floor(localId / cols);
  // Find which band this tile's row lands in. For non-banded tilesets
  // there's only one band starting at row 0 covering everything.
  let band: TilesetBand | undefined;
  for (const b of cache.bands) {
    if (row >= b.rowStart && row < b.rowStart + b.rowCount) { band = b; break; }
  }
  if (!band) {
    if (MAP_EDITOR_DEBUG()) {
      const bandDescs = cache.bands.map((b, i) => `band${i}{start=${b.rowStart} count=${b.rowCount}}`).join(', ');
      dbg('sync', `  sliceTileTexture EMPTY: ts="${ts.name}" cols=${cols} localId=${localId} → (col=${col},row=${row}) but bands=[${bandDescs || 'EMPTY'}] — row not covered`);
    }
    // Tile id falls outside every band — out of bounds. Return an empty
    // texture so the sprite renders nothing rather than something random.
    cache.perTile.set(localId, PIXI.Texture.EMPTY);
    return PIXI.Texture.EMPTY;
  }
  const localRow = row - band.rowStart;
  const sx = margin + col * (ts.tilewidth + spacing);
  const sy = margin + localRow * (ts.tileheight + spacing);
  const tex = new PIXI.Texture({
    source: band.base.source,
    frame: new PIXI.Rectangle(sx, sy, ts.tilewidth, ts.tileheight),
  });
  cache.perTile.set(localId, tex);
  return tex;
};

/**
 * Walk a tree of layers (where `type: 'group'` containers may nest
 * children inside `layer.layers`) and produce a flat document-order
 * list of LEAF layers (tile/object/image — never groups themselves).
 *
 * Each emitted layer is a SHALLOW COPY of the original with these
 * fields folded in from its ancestor groups:
 *   - `offsetx/offsety`  → accumulated sum of own + parents
 *   - `opacity`          → multiplied with parents
 *   - `visible`          → AND'd with parents
 *
 * Plus three synthetic fields the rest of the renderer + LayerList read:
 *   - `bridgeLayerIdx` — wasm-bridge layer index for editing; `null` for
 *     nested tile layers since `tiled_set_cell(layerIdx, ...)` only
 *     addresses top-level layers. Edit operations check this and no-op
 *     for nested layers (read-only until a future bridge function adds
 *     path-based access).
 *   - `depth` — nesting level; 0 = top-level. Used for indentation.
 *   - `ancestorNames` — for breadcrumb display ("z=4 / ground1").
 *
 * Group containers themselves are NOT emitted — they have no pixel
 * data, only structure. PSDK maps commonly nest tile layers inside
 * `<group name="z=N">` containers; if we don't recurse, the entire
 * upper-Z portion of the map vanishes from our render.
 */
const flattenLayerTree = (rootLayers: TmjLayer[]): TmjLayer[] => {
  const out: TmjLayer[] = [];
  const walk = (
    layers: TmjLayer[],
    parentPath: number[],
    parentOffX: number,
    parentOffY: number,
    parentOpacity: number,
    parentVisible: boolean,
    parentDepth: number,
    parentNames: string[],
  ) => {
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      const path = [...parentPath, i];
      const effOffX = parentOffX + (layer.offsetx ?? 0);
      const effOffY = parentOffY + (layer.offsety ?? 0);
      const effOpacity = parentOpacity * (layer.opacity ?? 1);
      const effVisible = parentVisible && (layer.visible ?? true);
      // Emit groups AND leaves. Groups become folder rows in the
      // LayerList (with chevron + expand/collapse). Layer-data offsets
      // / opacity / visibility on the group cascade to its children
      // via the accumulators above, so each leaf gets its own effective
      // values.
      out.push({
        ...layer,
        offsetx: effOffX,
        offsety: effOffY,
        opacity: effOpacity,
        visible: effVisible,
        bridgePath: path,
        depth: parentDepth,
        ancestorNames: parentNames,
      });
      if (layer.type === 'group') {
        walk(
          layer.layers ?? [],
          path,
          effOffX, effOffY, effOpacity, effVisible,
          parentDepth + 1,
          [...parentNames, layer.name],
        );
      }
    }
  };
  walk(rootLayers, [], 0, 0, 1, true, 0, []);
  return out;
};

const buildAnimIndex = (tilesets: LoadedTileset[]):
  Map<number, Map<number, TmjAnimFrame[]>> => {
  const out = new Map<number, Map<number, TmjAnimFrame[]>>();
  tilesets.forEach((ts, idx) => {
    const m = new Map<number, TmjAnimFrame[]>();
    for (const t of ts.tiles ?? []) {
      if (!t.animation || t.animation.length === 0) continue;
      // Only the BASE tile (the one that carries the <animation>) animates.
      // A frame's tileid is a separate static image the user can paint on its
      // own; PSDK's converter agrees — is_tile_animated? keys only on base
      // gids (tileId + offset), so a painted frame renders static in-game.
      // Mapping frame ids here made neighbours of animated tiles wrongly
      // animate (reported at "waterfall foam and below").
      if (!m.has(t.id)) m.set(t.id, t.animation);
    }
    out.set(idx, m);
  });
  return out;
};

// Configure a Sprite to render the given raw gid at tile (cx, cy). Anchor
// and transform follow the same bottom-left + flip-flag scheme as Canvas2D.
const configureSpriteForCell = (
  sprite: PIXI.Sprite,
  state: LoadedState,
  cache: TilesetTextureCache,
  ts: LoadedTileset,
  raw: number,
  localId: number,
  layer: TmjLayer,
  cx: number,
  cy: number,
) => {
  sprite.texture = sliceTileTexture(cache, ts, localId);
  const offX = layer.offsetx ?? 0;
  const offY = layer.offsety ?? 0;
  const tw = state.json.tilewidth;
  const th = state.json.tileheight;
  const flipH = (raw & FLIPPED_HORIZONTALLY) !== 0;
  const flipV = (raw & FLIPPED_VERTICALLY) !== 0;
  const flipD = (raw & FLIPPED_DIAGONALLY) !== 0;
  if (flipH || flipV || flipD) {
    // Anchor at tile center for rotation/flip; translate so the bottom-
    // left of the visible tile lands where we want it.
    sprite.anchor.set(0.5, 0.5);
    sprite.x = cx * tw + offX + ts.tilewidth / 2;
    sprite.y = (cy + 1) * th + offY - ts.tileheight / 2;
    if (flipD) {
      // Transcribed verbatim from Tiled's maprenderer.cpp (lines 498-511
      // in master). D-flip is rendered as rotation +90° CW plus a
      // REINTERPRETATION of H/V before applying scale:
      //   effective_H = original_V
      //   effective_V = !original_H
      // Earlier hand-derived formulas got this consistently wrong — the
      // visual outcome differed from Tiled for every state involving D.
      sprite.rotation = Math.PI / 2;
      const effH = flipV;
      const effV = !flipH;
      sprite.scale.set(effH ? -1 : 1, effV ? -1 : 1);
    } else {
      sprite.rotation = 0;
      sprite.scale.set(flipH ? -1 : 1, flipV ? -1 : 1);
    }
  } else {
    sprite.anchor.set(0, 1);
    sprite.rotation = 0;
    sprite.scale.set(1, 1);
    sprite.x = cx * tw + offX;
    sprite.y = (cy + 1) * th + offY;
  }
};

// --- component -----------------------------------------------------------

type PixiMapCanvasProps = {
  projectPath: string;
  tiledFilename: string;
  activeLayer: number;
  selectedLayers: number[];
  selectedBrush: Brush | null;
  layerVisibility: Record<number, boolean>;
  tool: 'stamp' | 'erase' | 'fill' | 'rect' | 'ellipse' | 'wand' | 'sameTile';
  showGrid: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  reloadKey?: number;
  onDirty: () => void;
  onLoaded: (state: LoadedState) => void;
  onHistoryChange?: () => void;
  onPaintCommit?: (batch: HistoryEntry[]) => void;
  onPickBrush?: (brush: Brush) => void;
  onJumpToLayer?: (layerIdx: number) => void;
  onHoverCell?: (cell: { x: number; y: number } | null) => void;
  onSelectionChange?: (sel: { x: number; y: number; w: number; h: number } | null) => void;
  /** Awaited at the start of a stamp/erase paint stroke. Lets the parent
   *  do last-minute structural work (e.g. auto-adding missing tilesets a
   *  stamp brush references) before cells get laid down. Returning a
   *  Promise blocks subsequent drag-paints until it resolves. */
  onBeforePaint?: () => Promise<void> | void;
  /** Fires after a wand / sameTile drag commits a NEW tile selection.
   *  Carries the before/after snapshots so the parent's typed history
   *  can record the change and replay it on undo/redo. */
  onTileSelectionCommit?: (
    prev: { cells: Set<number>; layerIdx: number },
    next: { cells: Set<number>; layerIdx: number },
  ) => void;
  /** Fork (Events mode): rendered INSIDE the position:relative PixiHost so
   *  overlay content shares the canvas coordinate space and scrolls/zooms
   *  with it. Pixi appends its canvas imperatively; React only reconciles
   *  its own children, so the two coexist. */
  eventsOverlay?: React.ReactNode;
};

export const PixiMapCanvas = forwardRef<MapCanvasHandle, PixiMapCanvasProps>(
  function PixiMapCanvas(props, forwardedRef) {
    const {
      projectPath, tiledFilename, activeLayer, selectedLayers, selectedBrush, layerVisibility,
      tool, showGrid, zoom, onZoomChange, reloadKey,
      onDirty, onLoaded, onHistoryChange, onPaintCommit, onPickBrush, onJumpToLayer,
      onHoverCell, onSelectionChange, onTileSelectionCommit, onBeforePaint, eventsOverlay,
    } = props;
    const onBeforePaintRef = useRef(onBeforePaint);
    onBeforePaintRef.current = onBeforePaint;
    // Set to false while an onBeforePaint promise is in flight. Painting
    // and drag-paint interpolation both check this and skip work until
    // the hook resolves — prevents the first stroke from depositing
    // null cells against a not-yet-loaded tileset.
    const paintReadyRef = useRef(true);
    const onPaintCommitRef = useRef(onPaintCommit);
    onPaintCommitRef.current = onPaintCommit;
    const onHoverCellRef = useRef(onHoverCell);
    const onSelectionChangeRef = useRef(onSelectionChange);
    const onTileSelectionCommitRef = useRef(onTileSelectionCommit);
    onHoverCellRef.current = onHoverCell;
    onSelectionChangeRef.current = onSelectionChange;
    onTileSelectionCommitRef.current = onTileSelectionCommit;

    // Props mirrored into refs for the long-lived window listeners.
    const activeLayerRef = useRef(activeLayer);
    const selectedLayersRef = useRef(selectedLayers);
    const selectedBrushRef = useRef(selectedBrush);
    const visibilityRef = useRef(layerVisibility);
    const toolRef = useRef(tool);
    const showGridRef = useRef(showGrid);
    const zoomRef = useRef(zoom);
    const onPickBrushRef = useRef(onPickBrush);
    const onJumpToLayerRef = useRef(onJumpToLayer);
    const onZoomChangeRef = useRef(onZoomChange);
    activeLayerRef.current = activeLayer;
    selectedLayersRef.current = selectedLayers;
    selectedBrushRef.current = selectedBrush;
    visibilityRef.current = layerVisibility;
    toolRef.current = tool;
    showGridRef.current = showGrid;
    zoomRef.current = zoom;
    onPickBrushRef.current = onPickBrush;
    onJumpToLayerRef.current = onJumpToLayer;
    onZoomChangeRef.current = onZoomChange;

    // DOM + Pixi refs.
    const hostRef = useRef<HTMLDivElement | null>(null);
    const scrollHostRef = useRef<HTMLDivElement | null>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const rootRef = useRef<PIXI.Container | null>(null);          // tile layers
    const overlayRef = useRef<PIXI.Container | null>(null);       // hover/sel/grid
    const previewGfxRef = useRef<PIXI.Container | null>(null);    // brush ghost
    const selectionGfxRef = useRef<PIXI.Graphics | null>(null);
    const gridGfxRef = useRef<PIXI.Graphics | null>(null);
    const previewSpritesRef = useRef<PIXI.Sprite[]>([]);          // pooled preview sprites

    // Data + scene state.
    const loadedRef = useRef<LoadedState | null>(null);
    const mapWasmRef = useRef<TiledMap | null>(null);
    const layerContainersRef = useRef<Map<number, PIXI.Container>>(new Map());
    const tilesetCachesRef = useRef<Map<number, TilesetTextureCache>>(new Map());
    const animIndexRef = useRef<Map<number, Map<number, TmjAnimFrame[]>>>(new Map());
    // Sprite registry: spritesRef[layerIdx][y * width + x] = sprite for that cell.
    const spritesRef = useRef<Map<number, Map<number, PIXI.Sprite>>>(new Map());
    const animSpritesRef = useRef<AnimSprite[]>([]);
    const globalElapsedRef = useRef<number>(0);
    // One-shot guard so we don't spam the console every time the user
    // tries to paint on a layer nested inside a <group>. Reset on map
    // reload (the load effect re-creates the component scope).
    const grouplayerWarnedRef = useRef(false);

    // Undo/redo + drag state.
    const undoStackRef = useRef<HistoryEntry[][]>([]);
    const redoStackRef = useRef<HistoryEntry[][]>([]);
    const paintingRef = useRef(false);
    const lastPaintedRef = useRef<{ tx: number; ty: number } | null>(null);
    const paintBatchRef = useRef<HistoryEntry[]>([]);
    const selectingRef = useRef(false);
    const selectionAnchorRef = useRef<{ tx: number; ty: number } | null>(null);
    // Shift state captured at right-mousedown — drives single-layer (false)
    // vs multi-layer (true) brush pick on the matching mouseup.
    const selectionShiftRef = useRef(false);
    // Mouse button that opened the current selection drag — drives the
    // mouseup branch: 0 (left) → shape fill (rect/ellipse, masked by the
    // active tool), 2 (right) → existing pick / erase-rect behavior.
    const selectionButtonRef = useRef<0 | 2>(2);
    const [selectionRect, setSelectionRect] = useState<{ sx: number; sy: number; ex: number; ey: number } | null>(null);
    const selectionRectRef = useRef(selectionRect);
    selectionRectRef.current = selectionRect;
    const hoverCellRef = useRef<{ tx: number; ty: number } | null>(null);

    // ----- tile selection (wand / sameTile) --------------------------------
    //
    // A set of cell indices (y * mapWidth + x) on the active layer. Built
    // by the Magic Wand (flood-fill matching gids) or Select Same Tile
    // (whole-layer scan) tools. Drawn as a yellow tint in the preview
    // overlay; Delete erases the cells, Esc clears the selection.
    const tileSelectionRef = useRef<Set<number>>(new Set());
    // Layer the selection was built against. If the user switches to a
    // different active layer the highlight + Delete target still belong
    // to the original layer until cleared / rebuilt.
    const tileSelectionLayerRef = useRef<number>(-1);
    // Bumped after every set mutation so the preview overlay re-renders
    // (refs alone don't trigger React updates).
    const [tileSelectionVersion, setTileSelectionVersion] = useState(0);
    const bumpTileSelection = useCallback(() => setTileSelectionVersion((n) => n + 1), []);

    // Pan state.
    const panningRef = useRef(false);
    const panOriginRef = useRef<{ clientX: number; clientY: number; scrollLeft: number; scrollTop: number } | null>(null);
    const panPendingRef = useRef<{ clientX: number; clientY: number } | null>(null);
    const panRafRef = useRef<number | null>(null);
    const spaceHeldRef = useRef(false);
    // Tracks whether Shift is currently held. Used by the fill tool to
    // show a preview of cells that flood-fill would replace.
    const shiftHeldRef = useRef(false);
    const [shiftHeldTick, setShiftHeldTick] = useState(0);

    // ----- multi-cell-match drag state (Tiled-style wand / fill) ----------
    //
    // Mirrors Tiled's BucketFillTool / MagicWandTool design: while the
    // left mouse button is held, dragging onto more cells ADDS each new
    // cell's raw value to `matches`. The fill region grows to cover any
    // cell matching ANY entry in matches — so a single drag can wand a
    // "grass OR sand" region, or bucket-fill all border tiles regardless
    // of which one was clicked first. Match equality uses the FULL raw
    // value (gid + H/V/D flip bits) so an upright grass cell is distinct
    // from a flipped one. Mouseup commits: wand merges the region into
    // the tile selection per the selection mode (Replace / Add / Subtract,
    // bound to no-mod / Shift / Ctrl); fill paints the brush across the
    // region. Right-click or Esc during the drag cancels everything.
    type DragTool = 'wand' | 'sameTile' | 'fill';
    type SelectionMode = 'replace' | 'add' | 'subtract' | 'intersect';
    // No-op guard used by the wand/rect commits: same cell sets shouldn't
    // push redundant history entries (would force the user to undo nothing).
    const selectionsEqual = (a: Set<number>, b: Set<number>): boolean => {
      if (a.size !== b.size) return false;
      for (const v of a) if (!b.has(v)) return false;
      return true;
    };
    type TileDragState = {
      tool: DragTool;
      anchor: { tx: number; ty: number };
      matches: Set<number>;
      layerIdx: number;
      mode: SelectionMode;
      region: Set<number>;
      cancelled: boolean;
    };
    // Modifier mode captured at the mousedown of a 'select'-tool drag.
    // Held for the duration so the user can lift the modifier before
    // releasing — matches Tiled (modifiers at the *start* of the drag set
    // the mode; mid-drag modifiers only tweak geometry in Tiled, which we
    // don't replicate yet).
    const selectionRectModeRef = useRef<SelectionMode>('replace');
    const tileDragRef = useRef<TileDragState | null>(null);
    const [tileDragVersion, setTileDragVersion] = useState(0);
    const bumpTileDrag = useCallback(() => setTileDragVersion((n) => n + 1), []);

    const [status, setStatus] = useState<string>('Loading…');
    const [error, setError] = useState<string | null>(null);

    // ----- sprite helpers (renderer-specific edit ops) ---------------------

    /** Get-or-create the sprite map for `layerIdx`. */
    const layerSprites = (layerIdx: number): Map<number, PIXI.Sprite> => {
      let m = spritesRef.current.get(layerIdx);
      if (!m) { m = new Map(); spritesRef.current.set(layerIdx, m); }
      return m;
    };

    /**
     * Sync the sprite at (layerIdx, x, y) to whatever's currently in the
     * layer's data array. Creates/updates/destroys as needed.
     */
    const syncSpriteAt = useCallback((layerIdx: number, x: number, y: number) => {
      const state = loadedRef.current;
      if (!state) { dbg('sync', `BAIL layer=${layerIdx} (${x},${y}) — no state`); return; }
      const layer = state.json.layers[layerIdx];
      if (!layer || layer.type !== 'tilelayer') { dbg('sync', `BAIL layer=${layerIdx} (${x},${y}) — layer missing or not tilelayer (type=${layer?.type})`); return; }
      const container = layerContainersRef.current.get(layerIdx);
      if (!container) { dbg('sync', `BAIL layer=${layerIdx} (${x},${y}) — NO CONTAINER (layerContainersRef has ${layerContainersRef.current.size} entries)`); return; }
      const w = layer.width ?? state.json.width;
      const key = y * w + x;
      const map = layerSprites(layerIdx);
      const existing = map.get(key);
      const raw = readCellRaw(layer, x, y);
      const gid = raw & GID_MASK;

      if (!gid) {
        if (existing) {
          existing.destroy();
          container.removeChild(existing);
          map.delete(key);
          dbg('sync', `layer=${layerIdx} (${x},${y}) gid=0 — destroyed existing sprite`);
        } else {
          dbg('sync', `layer=${layerIdx} (${x},${y}) gid=0 — no-op (cell is empty)`);
        }
        return;
      }
      const ts = findTilesetForGid(state.tilesets, gid);
      if (!ts || !ts.bitmap) {
        dbg('sync', `BAIL layer=${layerIdx} (${x},${y}) gid=${gid} — tileset ${ts ? 'has no bitmap' : 'not found'} (tilesets=${state.tilesets.length})`);
        if (existing) {
          existing.destroy();
          container.removeChild(existing);
          map.delete(key);
        }
        return;
      }
      const tsIdx = state.tilesets.indexOf(ts);
      const cache = tilesetCachesRef.current.get(tsIdx);
      if (!cache) { dbg('sync', `BAIL layer=${layerIdx} (${x},${y}) gid=${gid} — no texture cache for tileset ${tsIdx} "${ts.name}" (tilesetCachesRef has ${tilesetCachesRef.current.size})`); return; }
      const localId = gid - ts.firstgid;

      let sprite = existing;
      const wasNew = !sprite;
      if (!sprite) {
        sprite = new PIXI.Sprite();
        container.addChild(sprite);
        map.set(key, sprite);
      }
      configureSpriteForCell(sprite, state, cache, ts, raw, localId, layer, x, y);
      // Diagnostic: log every property that could make the sprite invisible
      // even when it IS present in the container's children list.
      const tex = sprite.texture as { width?: number; height?: number; source?: { resource?: unknown } } | undefined;
      const root = rootRef.current;
      dbg('sync', `layer=${layerIdx} "${layer.name}" (${x},${y}) gid=${gid} ts=${tsIdx} localId=${localId}`);
      dbg('sync', `  ${wasNew ? 'CREATED' : 'updated'} sprite. container: visible=${container.visible} alpha=${container.alpha} children=${container.children.length} parent=${container.parent === root ? 'root' : container.parent ? 'OTHER' : 'NONE'}`);
      dbg('sync', `  sprite: visible=${sprite.visible} alpha=${sprite.alpha} pos=(${sprite.x},${sprite.y}) size=${sprite.width}×${sprite.height} tex=${tex?.width}×${tex?.height} hasSource=${!!tex?.source?.resource}`);
      if (root) dbg('sync', `  root: children=${root.children.length} stage parent=${root.parent ? 'attached' : 'DETACHED'}`);
    }, []);

    /**
     * Rebuild the animated-sprite registry by scanning every cell of every
     * tile layer. Cheap (the layer.data arrays are already in JS). Called
     * on initial load AND after edits (paint/erase) so newly placed
     * animated tiles join the cycle.
     */
    const rebuildAnimSprites = useCallback(() => {
      const state = loadedRef.current;
      if (!state) return;
      animSpritesRef.current = [];
      const idx = animIndexRef.current;
      for (let li = 0; li < state.json.layers.length; li++) {
        const layer = state.json.layers[li];
        if (layer.type !== 'tilelayer') continue;
        const w = layer.width ?? state.json.width;
        const layerMap = spritesRef.current.get(li);
        if (!layerMap) continue;
        for (const cell of cellsOf(layer)) {
          const gid = cell.raw & GID_MASK;
          if (!gid) continue;
          const ts = findTilesetForGid(state.tilesets, gid);
          if (!ts) continue;
          const tsIdx = state.tilesets.indexOf(ts);
          const cache = tilesetCachesRef.current.get(tsIdx);
          if (!cache) continue;
          const localId = gid - ts.firstgid;
          const anim = idx.get(tsIdx)?.get(localId);
          if (!anim || anim.length === 0) continue;
          const sprite = layerMap.get(cell.y * w + cell.x);
          if (!sprite) continue;
          animSpritesRef.current.push({
            sprite, ts, cache,
            frameTileIds: anim.map((f) => f.tileid),
            durations: anim.map((f) => f.duration),
            total: anim.reduce((s, f) => s + f.duration, 0),
            shownFrame: Math.max(0, anim.findIndex((f) => f.tileid === localId)),
          });
        }
      }
    }, []);

    /**
     * Re-derive the scene graph from the in-memory wasm map, WITHOUT
     * touching disk. Used after layer authoring (add/remove/rename/move)
     * and map resize so the canvas reflects the change without the
     * write→reload round-trip — which would force a save the user didn't
     * ask for.
     *
     * Tileset textures are kept across rebuilds (layer ops don't change
     * tilesets). Containers + sprites + anim-sprite registry are torn
     * down and rebuilt from the fresh `toJson()`. Undo history is cleared
     * because layer indices shift on add/remove/move and stale entries
     * would corrupt the wrong cells.
     */
    const rebuildSceneFromCurrentWasm = useCallback((): boolean => {
      const wasm = mapWasmRef.current;
      const app = appRef.current;
      const root = rootRef.current;
      const prev = loadedRef.current;
      if (!wasm || !app || !root || !prev) return false;

      // Fresh JSON post-mutation. Tilesets array indices stay aligned
      // with `prev.tilesets` for layer ops (no tileset added/removed).
      const rawMap = wasm.toJson() as TmjMap;
      const tilesetsMerged: TmjTileset[] = rawMap.tilesets.map((entry, idx) => {
        if (entry.image) return entry;
        try {
          const tsj = wasm.tilesetJson(idx) as Partial<TmjTileset>;
          return { ...tsj, firstgid: entry.firstgid, source: entry.source } as TmjTileset;
        } catch { return entry; }
      });
      dbg('rebuild', 'wasm.toJson layer count:', rawMap.layers.length, 'mapDims:', rawMap.width, '×', rawMap.height);
      // Bridge-supplied firstgids are unreliable — see recomputeFirstgids
      // for the bug. Worse, the values can DRIFT between rebuilds: after
      // addTileLayer libtiled re-emits firstgids that still look
      // "monotonic from 1" (so recomputeFirstgids's heuristic check
      // passes them through) but the actual values shift, while the cell
      // data still references the originally-corrected gids. Result: a
      // structural rebuild silently maps every cell to the wrong tileset.
      //
      // Fix: carry the corrected firstgid forward from the previous load
      // for any tileset we already had, only trusting wasm's value for
      // brand-new tilesets (addTilesetInMemory pre-populates prev.tilesets
      // for those before calling us). Bitmaps come from prev for the same
      // reason — layer ops don't decode new textures.
      const recomputed = recomputeFirstgids(tilesetsMerged);
      const newLoadedTilesets: LoadedTileset[] = recomputed.map((ts, idx) => {
        const prevTs = prev.tilesets[idx];
        return {
          ...ts,
          bitmap: prevTs?.bitmap,
          firstgid: prevTs?.firstgid ?? ts.firstgid,
        };
      });
      // Same group-flatten as the load effect — see flattenLayerTree.
      const flatLayers = flattenLayerTree(rawMap.layers);
      // SAME defensive normalization as the load effect. When the user
      // adds a layer via the bridge, libtiled's toVariant can return
      // the new tile layer WITHOUT a `data` array (it's all-zeros at
      // creation; the JSON converter may omit it). If we leave it
      // missing, the first paint into that layer silently no-ops:
      // bridge gets updated, but writeCellRaw falls through because
      // `layer.data` is undefined, syncSpriteAt then reads 0 and skips
      // the sprite. This is the "draw on Tile Layer 1, see nothing,
      // add Layer 2, NOW Layer 1's cells appear" bug — the second
      // structural rebuild re-runs this code with the previously-
      // bridged paints already serialized in. Eager normalization on
      // EVERY rebuild (not just initial load) fixes it permanently.
      const mapW = rawMap.width;
      const mapH = rawMap.height;
      // Build a name→data lookup from the previous load so we can carry
      // the JS-mirror cell data forward for layers that already existed.
      // CRITICAL: wasm.toJson re-emits cell gids using libtiled's broken
      // bridge firstgids (e.g. multiple tilesets all colliding at 17 for
      // maps that hit the firstgid recompute bug). Trusting wasm's cell
      // data after a structural rebuild would mean a wall cell that was
      // gid=282 (HiddenGrotto_Walls) comes back as gid=17 → renderer
      // resolves it to the passages tileset → entire map renders wrong.
      //
      // Our JS mirror (prev.json.layers[i].data) is maintained by every
      // writeCellRaw on paint/erase, so it's authoritative for cells that
      // came from the original .tmx load + every subsequent user edit.
      // New layers (no prev entry by name) get an empty array — they
      // were just added and have no content yet.
      const prevDataByName = new Map<string, number[]>();
      for (const pl of prev.json.layers) {
        if (pl.type !== 'tilelayer') continue;
        if (Array.isArray(pl.data)) prevDataByName.set(pl.name, pl.data);
      }
      // Build bridge→corrected firstgid translation. wasm.toJson emits cell
      // gids using the bridge's internal firstgids (recomputed sequential
      // from the broken libtiled tilecounts), but state.tilesets keeps the
      // corrected firstgids carried forward from prev (so renderer math
      // matches the .tmx override applied at initial load). For carried
      // layers the cells are already in corrected namespace and need no
      // translation, but when we fall back to wasm data (new layer or
      // RESIZED layer where carried.length !== expected) the cells are in
      // bridge namespace — translate them or every higher-firstgid tileset
      // (buildings, water, …) renders as the wrong tileset, leaving the
      // map mostly blank. This was the visual corruption after Resize Map.
      // CRITICAL: read bridge firstgids from rawMap.tilesets BEFORE
      // recomputeFirstgids — that helper *replaces* non-monotonic bridge
      // values with corrected ones (same logic as load-time), so
      // recomputed[i].firstgid ends up equal to prev.tilesets[i].firstgid.
      // Using it for bridgeFgs makes needsTranslation false and lets broken-
      // namespace cells pass through untranslated. The bridge actually
      // stamped the cell data in rawMap.tilesets's original (cumulative
      // nextTileId) namespace, so we must use that here.
      const bridgeFgs = rawMap.tilesets.map((ts) => ts.firstgid);
      const correctedFgs = recomputed.map((_, i) => prev.tilesets[i]?.firstgid ?? bridgeFgs[i]);
      const needsTranslation = bridgeFgs.some((fg, i) => fg !== correctedFgs[i]);
      const FLIP_MASK = 0xE0000000 >>> 0;
      const GID_MASK = 0x1FFFFFFF;
      const translateGid = (g: number): number => {
        const bare = g & GID_MASK;
        if (bare === 0) return 0;
        let i = bridgeFgs.length - 1;
        while (i >= 0 && bridgeFgs[i] > bare) i--;
        if (i < 0) return g;
        const localId = bare - bridgeFgs[i];
        const newBare = correctedFgs[i] + localId;
        return ((g & FLIP_MASK) | newBare) >>> 0;
      };
      for (const layer of flatLayers) {
        if (layer.type !== 'tilelayer') continue;
        // Fall back to map dims when libtiled omits per-layer width/height
        // (it can do this for finite layers that fill the map).
        if (!layer.width) layer.width = mapW;
        if (!layer.height) layer.height = mapH;
        const expected = layer.width * layer.height;
        const carried = prevDataByName.get(layer.name);
        if (carried && carried.length === expected) {
          layer.data = carried;
        } else if (!Array.isArray(layer.data) || layer.data.length !== expected) {
          layer.data = new Array(expected).fill(0);
        } else if (needsTranslation) {
          layer.data = (layer.data as number[]).map(translateGid);
        }
      }
      const json: TmjMap = { ...rawMap, tilesets: tilesetsMerged, layers: flatLayers };
      if (MAP_EDITOR_DEBUG()) {
        for (let i = 0; i < flatLayers.length; i++) {
          const l = flatLayers[i];
          const dataLen = Array.isArray(l.data) ? l.data.length : 'n/a';
          dbg('rebuild', `  layer[${i}] name="${l.name}" type=${l.type} dims=${l.width}×${l.height} data.length=${dataLen} bridgePath=${JSON.stringify(l.bridgePath)}`);
        }
      }
      const maxTileHeight = Math.max(
        json.tileheight,
        ...newLoadedTilesets.map((ts) => ts.tileheight),
      );
      const maxRowsUp = Math.max(0, Math.ceil(maxTileHeight / json.tileheight) - 1);
      const state: LoadedState = { tiledFilename, json, tilesets: newLoadedTilesets, maxRowsUp };
      loadedRef.current = state;

      // Map dims may have changed (resize); update renderer + canvas
      // display size. No texture invalidation needed.
      const pixW = json.width * json.tilewidth;
      const pixH = json.height * json.tileheight;
      app.renderer.resize(pixW, pixH);
      app.canvas.style.width = `${pixW * zoomRef.current}px`;
      app.canvas.style.height = `${pixH * zoomRef.current}px`;

      animIndexRef.current = buildAnimIndex(state.tilesets);

      // Tear down + rebuild scene children.
      for (const child of root.removeChildren()) child.destroy({ children: true });
      layerContainersRef.current.clear();
      spritesRef.current.clear();

      if (json.backgroundcolor) {
        const bg = new PIXI.Graphics().rect(0, 0, pixW, pixH).fill(json.backgroundcolor);
        root.addChild(bg);
      }

      const caches = tilesetCachesRef.current;
      for (let li = 0; li < json.layers.length; li++) {
        const layer = json.layers[li];
        const container = new PIXI.Container();
        container.label = `layer:${layer.name}`;
        root.addChild(container);
        layerContainersRef.current.set(li, container);

        if (layer.type !== 'tilelayer') {
          container.visible = false;
          continue;
        }
        const vis = li in visibilityRef.current ? visibilityRef.current[li] : layer.visible;
        container.visible = vis;
        container.alpha = layer.opacity ?? 1;
        dbg('rebuild', `  container[${li}] "${layer.name}" visible=${vis} (layer.visible=${layer.visible} in visibilityRef=${li in visibilityRef.current}) alpha=${container.alpha} (layer.opacity=${layer.opacity})`);

        const layerSpriteMap = layerSprites(li);
        const w = layer.width ?? json.width;
        for (const cell of cellsOf(layer)) {
          const raw = cell.raw >>> 0;
          const gid = raw & GID_MASK;
          if (!gid) continue;
          const ts = findTilesetForGid(state.tilesets, gid);
          if (!ts || !ts.bitmap) continue;
          const tsIdx = state.tilesets.indexOf(ts);
          const cache = caches.get(tsIdx);
          if (!cache) continue;
          const localId = gid - ts.firstgid;
          const sprite = new PIXI.Sprite();
          configureSpriteForCell(sprite, state, cache, ts, raw, localId, layer, cell.x, cell.y);
          container.addChild(sprite);
          layerSpriteMap.set(cell.y * w + cell.x, sprite);
        }
      }

      rebuildAnimSprites();
      redrawGridOverlay();
      redrawSelectionOverlay();
      redrawPreviewOverlay();

      // Layer ops shift indices → discard undo/redo history; otherwise
      // an undo could write to the "old" layer index that now refers to
      // a different layer.
      undoStackRef.current = [];
      redoStackRef.current = [];
      onHistoryChange?.();

      onLoaded(state);
      return true;
    // The redraw* / rebuild* / onLoaded / onHistoryChange refs are stable
    // (useCallback / refs). Keep the dep list tight to avoid re-binding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ----- batched undo helpers --------------------------------------------

    const commitBatch = useCallback((batch: HistoryEntry[]) => {
      if (batch.length === 0) return;
      // Dedupe by (layerIdx, x, y), keeping the FIRST entry per cell.
      // During a click-drag the same cell often gets written more than
      // once (NxM brushes overlap as the cursor moves; the user drags
      // back over an already-painted tile; etc). Only the first entry's
      // `oldRaw` is the truly-pre-stroke value — subsequent ones carry
      // intermediate state (i.e. the brush tile we just put there). If
      // we left the dupes in, undo would walk forward and leave each
      // cell at the second-to-last value instead of the original. The
      // dedupe makes a single stroke = single undo step, with the right
      // restore target.
      const seen = new Set<string>();
      const deduped: HistoryEntry[] = [];
      for (const e of batch) {
        const k = `${e.layerIdx}:${e.x}:${e.y}`;
        if (seen.has(k)) continue;
        seen.add(k);
        deduped.push(e);
      }
      undoStackRef.current.push(deduped);
      if (undoStackRef.current.length > UNDO_LIMIT) undoStackRef.current.shift();
      redoStackRef.current = [];
      onHistoryChange?.();
      // Hand the deduped batch to the parent so it can append a typed
      // {kind:'cells', batch} entry to its single unified action history.
      // Fires ONLY on new commits — not on undo/redo paths (which use
      // applyCellBatch directly and don't go through commitBatch).
      onPaintCommitRef.current?.(deduped);
    }, [onHistoryChange]);

    // ----- edit operations -------------------------------------------------

    const stampBrushAt = useCallback((tx: number, ty: number) => {
      const state = loadedRef.current;
      const map = mapWasmRef.current;
      if (!state || !map) { dbg('stamp', 'BAIL: no state or wasm map'); return; }
      const brush = selectedBrushRef.current;
      if (!brush) { dbg('stamp', 'BAIL: no brush selected'); return; }
      const activeIdx = activeLayerRef.current;
      dbg('click', `stampBrushAt(${tx},${ty}) activeIdx=${activeIdx} brush=${brush.width}×${brush.height}`);

      const batchAdds: HistoryEntry[] = [];

      // Paint one (cells, dstLayer) grid. Skips out-of-bounds, non-tile,
      // and out-of-layer-dim cells. Multi-layer brushes call this once per
      // captured layer.
      const paintGrid = (cells: (BrushCell | null)[], dstLayer: number) => {
        if (dstLayer < 0 || dstLayer >= state.json.layers.length) {
          dbg('stamp', `BAIL: dstLayer ${dstLayer} out of bounds (layers.length=${state.json.layers.length})`);
          return;
        }
        const layerN = state.json.layers[dstLayer];
        if (!layerN || layerN.type !== 'tilelayer') {
          dbg('stamp', `BAIL: layer[${dstLayer}] is ${layerN?.type ?? 'undefined'} (need tilelayer)`);
          return;
        }
        const path = layerN.bridgePath;
        if (!path) { dbg('stamp', `BAIL: layer[${dstLayer}] has no bridgePath`); return; }
        dbg('stamp', `paintGrid layer[${dstLayer}] name="${layerN.name}" path=${JSON.stringify(path)} dims=${layerN.width}×${layerN.height} data=${Array.isArray(layerN.data) ? `array(${layerN.data.length})` : layerN.data}`);
        for (let py = 0; py < brush.height; py++) {
          for (let px = 0; px < brush.width; px++) {
            const cell = cells[py * brush.width + px];
            if (!cell) continue;
            const dx = tx + px;
            const dy = ty + py;
            if (dx < 0 || dy < 0 || dx >= state.json.width || dy >= state.json.height) continue;
            if (layerN.width && layerN.height && (dx >= layerN.width || dy >= layerN.height)) continue;
            const oldRaw = readCellRaw(layerN, dx, dy);
            const ts = state.tilesets[cell.tilesetIndex];
            if (!ts) continue;
            // Encode flip bits into the raw gid when the brush carries
            // them (Tiled X/Y/Z hotkeys). When clean we use the cheaper
            // (tileset, tileId) bridge call so we don't pay the path-
            // walking cost on every cell of a no-flip paint stroke.
            const baseGid = ts.firstgid + cell.tileId;
            const hasFlip = cell.flipH || cell.flipV || cell.flipD;
            let newRaw: number;
            if (hasFlip) {
              newRaw = baseGid >>> 0;
              if (cell.flipH) newRaw = (newRaw | FLIPPED_HORIZONTALLY) >>> 0;
              if (cell.flipV) newRaw = (newRaw | FLIPPED_VERTICALLY) >>> 0;
              if (cell.flipD) newRaw = (newRaw | FLIPPED_DIAGONALLY) >>> 0;
            } else {
              newRaw = baseGid >>> 0;
            }
            if (oldRaw === newRaw) continue;
            if (hasFlip) map.setCellRawAtPath(path, dx, dy, newRaw);
            else map.setCellAtPath(path, dx, dy, cell.tilesetIndex, cell.tileId);
            writeCellRaw(layerN, dx, dy, newRaw);
            batchAdds.push({ layerIdx: dstLayer, x: dx, y: dy, oldRaw });
            syncSpriteAt(dstLayer, dx, dy);
          }
        }
      };

      paintGrid(brush.cells, activeIdx);
      if (brush.extraLayers) {
        for (const extra of brush.extraLayers) {
          paintGrid(extra.cells, resolveExtraLayerIdx(state.json.layers, extra, activeIdx));
        }
      }

      if (batchAdds.length === 0) return;
      if (paintingRef.current) paintBatchRef.current.push(...batchAdds);
      else commitBatch(batchAdds);
      rebuildAnimSprites();
      onDirty();
    }, [syncSpriteAt, rebuildAnimSprites, commitBatch, onDirty]);

    const eraseAt = useCallback((tx: number, ty: number) => {
      const state = loadedRef.current;
      const map = mapWasmRef.current;
      if (!state || !map) return;
      const layerIdx = activeLayerRef.current;
      const layer = state.json.layers[layerIdx];
      if (!layer || layer.type !== 'tilelayer') return;
      const path = layer.bridgePath;
      if (!path) return;
      if (tx < 0 || ty < 0 || tx >= state.json.width || ty >= state.json.height) return;
      if (layer.width && layer.height && (tx >= layer.width || ty >= layer.height)) return;
      const oldRaw = readCellRaw(layer, tx, ty);
      if (oldRaw === 0) return;
      map.setCellAtPath(path, tx, ty, -1, -1);
      writeCellRaw(layer, tx, ty, 0);
      syncSpriteAt(layerIdx, tx, ty);
      const entry: HistoryEntry = { layerIdx, x: tx, y: ty, oldRaw };
      if (paintingRef.current) paintBatchRef.current.push(entry);
      else commitBatch([entry]);
      rebuildAnimSprites();
      onDirty();
    }, [syncSpriteAt, rebuildAnimSprites, commitBatch, onDirty]);

    const eraseRect = useCallback((sx: number, sy: number, ex: number, ey: number) => {
      const state = loadedRef.current;
      const map = mapWasmRef.current;
      if (!state || !map) return;
      const layerIdx = activeLayerRef.current;
      const layer = state.json.layers[layerIdx];
      if (!layer || layer.type !== 'tilelayer') return;
      const path = layer.bridgePath;
      if (!path) return;
      const batch: HistoryEntry[] = [];
      for (let y = sy; y <= ey; y++) {
        for (let x = sx; x <= ex; x++) {
          if (x < 0 || y < 0 || x >= state.json.width || y >= state.json.height) continue;
          if (layer.width && layer.height && (x >= layer.width || y >= layer.height)) continue;
          const oldRaw = readCellRaw(layer, x, y);
          if (oldRaw === 0) continue;
          map.setCellAtPath(path, x, y, -1, -1);
          writeCellRaw(layer, x, y, 0);
          batch.push({ layerIdx, x, y, oldRaw });
          syncSpriteAt(layerIdx, x, y);
        }
      }
      if (batch.length === 0) return;
      commitBatch(batch);
      rebuildAnimSprites();
      onDirty();
    }, [syncSpriteAt, rebuildAnimSprites, commitBatch, onDirty]);

    const floodFillAt = useCallback((tx: number, ty: number) => {
      const state = loadedRef.current;
      const map = mapWasmRef.current;
      if (!state || !map) return;
      const brush = selectedBrushRef.current;
      const fillCell = brush?.cells.find((c) => c !== null) ?? null;
      if (!fillCell) return;
      // Paint-bucket behavior: when a tile selection is active (from Wand
      // or Same Tile), the fill tool fills every cell in the SELECTION
      // with the brush, instead of flood-filling matching gids from the
      // click point. Combines well with Same Tile — select every
      // "grass" cell, switch to Fill, click, and they all become the
      // brush's tile in one action. Selection clears after the fill.
      const sel = tileSelectionRef.current;
      if (sel.size > 0) {
        fillTileSelection(fillCell);
        return;
      }
      const layerIdx = activeLayerRef.current;
      const layer = state.json.layers[layerIdx];
      if (!layer || layer.type !== 'tilelayer') return;
      const path = layer.bridgePath;
      if (!path) return;
      if (tx < 0 || ty < 0 || tx >= state.json.width || ty >= state.json.height) return;
      const targetRaw = readCellRaw(layer, tx, ty);
      const targetGid = targetRaw & GID_MASK;
      const ts = state.tilesets[fillCell.tilesetIndex];
      if (!ts) return;
      const baseGid = ts.firstgid + fillCell.tileId;
      const hasFlip = fillCell.flipH || fillCell.flipV || fillCell.flipD;
      let newRaw = baseGid >>> 0;
      if (fillCell.flipH) newRaw = (newRaw | FLIPPED_HORIZONTALLY) >>> 0;
      if (fillCell.flipV) newRaw = (newRaw | FLIPPED_VERTICALLY) >>> 0;
      if (fillCell.flipD) newRaw = (newRaw | FLIPPED_DIAGONALLY) >>> 0;
      if (baseGid === targetGid && targetRaw === newRaw) return;
      const w = state.json.width;
      const h = state.json.height;
      const visited = new Uint8Array(w * h);
      const queue: number[] = [ty * w + tx];
      const batch: HistoryEntry[] = [];
      while (queue.length > 0) {
        const idx = queue.shift()!;
        if (visited[idx]) continue;
        visited[idx] = 1;
        const x = idx % w;
        const y = (idx / w) | 0;
        if (layer.width && layer.height && (x >= layer.width || y >= layer.height)) continue;
        const raw = readCellRaw(layer, x, y);
        if ((raw & GID_MASK) !== targetGid) continue;
        if (hasFlip) map.setCellRawAtPath(path, x, y, newRaw);
        else map.setCellAtPath(path, x, y, fillCell.tilesetIndex, fillCell.tileId);
        writeCellRaw(layer, x, y, newRaw);
        batch.push({ layerIdx, x, y, oldRaw: raw });
        syncSpriteAt(layerIdx, x, y);
        if (x + 1 < w) queue.push(idx + 1);
        if (x > 0) queue.push(idx - 1);
        if (y + 1 < h) queue.push(idx + w);
        if (y > 0) queue.push(idx - w);
      }
      if (batch.length === 0) return;
      commitBatch(batch);
      rebuildAnimSprites();
      onDirty();
    }, [syncSpriteAt, rebuildAnimSprites, commitBatch, onDirty]);

    /**
     * Shape fill: rectangle or ellipse. Tiles the active brush across the
     * bounding rect (Tiled behavior — the brush isn't stretched, it
     * repeats). Ellipse mode masks every cell against the inscribed
     * ellipse using the cell center as the sample point.
     */
    const paintShape = useCallback((sx: number, sy: number, ex: number, ey: number, mode: 'rect' | 'ellipse') => {
      const state = loadedRef.current;
      const map = mapWasmRef.current;
      if (!state || !map) return;
      const brush = selectedBrushRef.current;
      if (!brush) return;
      const activeIdx = activeLayerRef.current;
      const minX = Math.min(sx, ex), maxX = Math.max(sx, ex);
      const minY = Math.min(sy, ey), maxY = Math.max(sy, ey);
      const rw = maxX - minX + 1;
      const rh = maxY - minY + 1;
      // Inscribed-ellipse params. Centered on the rect center; radii from
      // the rect half-widths. Cell center is offset by +0.5 in each axis
      // so the ellipse boundary cuts through cells consistently.
      const cx = (minX + maxX + 1) / 2;
      const cy = (minY + maxY + 1) / 2;
      const rx = rw / 2;
      const ry = rh / 2;
      const inEllipse = (x: number, y: number) => {
        if (rx <= 0 || ry <= 0) return true;
        const dx = (x + 0.5 - cx) / rx;
        const dy = (y + 0.5 - cy) / ry;
        return dx * dx + dy * dy <= 1;
      };

      // Mirror stampBrushAt's per-layer paint loop, but iterate the SHAPE's
      // bounds instead of the brush's, tiling the brush pattern across the
      // shape. Multi-layer brushes paint all extras at the same shape.
      const batchAdds: HistoryEntry[] = [];
      const paintGrid = (cells: (BrushCell | null)[], dstLayer: number) => {
        if (dstLayer < 0 || dstLayer >= state.json.layers.length) return;
        const layerN = state.json.layers[dstLayer];
        if (!layerN || layerN.type !== 'tilelayer') return;
        const path = layerN.bridgePath;
        if (!path) return;
        for (let y = minY; y <= maxY; y++) {
          for (let x = minX; x <= maxX; x++) {
            if (mode === 'ellipse' && !inEllipse(x, y)) continue;
            if (x < 0 || y < 0 || x >= state.json.width || y >= state.json.height) continue;
            if (layerN.width && layerN.height && (x >= layerN.width || y >= layerN.height)) continue;
            const bx = ((x - minX) % brush.width + brush.width) % brush.width;
            const by = ((y - minY) % brush.height + brush.height) % brush.height;
            const cell = cells[by * brush.width + bx];
            if (!cell) continue;
            const oldRaw = readCellRaw(layerN, x, y);
            const ts = state.tilesets[cell.tilesetIndex];
            if (!ts) continue;
            const baseGid = ts.firstgid + cell.tileId;
            const hasFlip = cell.flipH || cell.flipV || cell.flipD;
            let newRaw = baseGid >>> 0;
            if (cell.flipH) newRaw = (newRaw | FLIPPED_HORIZONTALLY) >>> 0;
            if (cell.flipV) newRaw = (newRaw | FLIPPED_VERTICALLY) >>> 0;
            if (cell.flipD) newRaw = (newRaw | FLIPPED_DIAGONALLY) >>> 0;
            if (oldRaw === newRaw) continue;
            if (hasFlip) map.setCellRawAtPath(path, x, y, newRaw);
            else map.setCellAtPath(path, x, y, cell.tilesetIndex, cell.tileId);
            writeCellRaw(layerN, x, y, newRaw);
            batchAdds.push({ layerIdx: dstLayer, x, y, oldRaw });
            syncSpriteAt(dstLayer, x, y);
          }
        }
      };
      paintGrid(brush.cells, activeIdx);
      if (brush.extraLayers) {
        for (const extra of brush.extraLayers) paintGrid(extra.cells, resolveExtraLayerIdx(state.json.layers, extra, activeIdx));
      }
      if (batchAdds.length === 0) return;
      commitBatch(batchAdds);
      rebuildAnimSprites();
      onDirty();
    }, [syncSpriteAt, rebuildAnimSprites, commitBatch, onDirty]);

    /**
     * Merge `add` into the current tile selection if `additive` is true and
     * the existing selection was built against the same layer; otherwise
     * replace. Cross-layer additive is rejected (a selection only ever
     * targets one layer) — switching layers always resets.
     */
    const commitTileSelection = (add: Set<number>, layerIdx: number, additive: boolean) => {
      if (additive && tileSelectionLayerRef.current === layerIdx && tileSelectionRef.current.size > 0) {
        for (const idx of add) tileSelectionRef.current.add(idx);
      } else {
        tileSelectionRef.current = add;
      }
      tileSelectionLayerRef.current = layerIdx;
      bumpTileSelection();
    };

    /** Magic wand: flood-fill the active layer for cells sharing the
     *  clicked cell's gid (0 / empty also matches itself — clicking an
     *  empty cell selects the surrounding empty region). With `additive`,
     *  unions the new contiguous region into the existing selection. */
    const buildWandSelection = useCallback((tx: number, ty: number, additive: boolean) => {
      const state = loadedRef.current;
      if (!state) return;
      const layerIdx = activeLayerRef.current;
      const layer = state.json.layers[layerIdx];
      if (!layer || layer.type !== 'tilelayer') return;
      const w = state.json.width;
      const h = state.json.height;
      if (tx < 0 || ty < 0 || tx >= w || ty >= h) return;
      const targetGid = readCellRaw(layer, tx, ty) & GID_MASK;
      const visited = new Uint8Array(w * h);
      const sel = new Set<number>();
      const queue: number[] = [ty * w + tx];
      while (queue.length > 0) {
        const idx = queue.shift()!;
        if (visited[idx]) continue;
        visited[idx] = 1;
        const x = idx % w;
        const y = (idx / w) | 0;
        if (layer.width && layer.height && (x >= layer.width || y >= layer.height)) continue;
        const g = readCellRaw(layer, x, y) & GID_MASK;
        if (g !== targetGid) continue;
        sel.add(idx);
        if (x + 1 < w) queue.push(idx + 1);
        if (x > 0) queue.push(idx - 1);
        if (y + 1 < h) queue.push(idx + w);
        if (y > 0) queue.push(idx - w);
      }
      commitTileSelection(sel, layerIdx, additive);
    }, [bumpTileSelection]);

    /** Select Same Tile: scan the whole active layer for cells with the
     *  clicked cell's gid (no connectivity requirement, unlike the wand).
     *  With `additive`, the new match-set unions into the existing
     *  selection — lets the user assemble a multi-tile mask with Ctrl. */
    const buildSameTileSelection = useCallback((tx: number, ty: number, additive: boolean) => {
      const state = loadedRef.current;
      if (!state) return;
      const layerIdx = activeLayerRef.current;
      const layer = state.json.layers[layerIdx];
      if (!layer || layer.type !== 'tilelayer') return;
      const w = state.json.width;
      const h = state.json.height;
      if (tx < 0 || ty < 0 || tx >= w || ty >= h) return;
      const targetGid = readCellRaw(layer, tx, ty) & GID_MASK;
      const sel = new Set<number>();
      const lw = layer.width ?? w;
      const lh = layer.height ?? h;
      for (let y = 0; y < Math.min(h, lh); y++) {
        for (let x = 0; x < Math.min(w, lw); x++) {
          if ((readCellRaw(layer, x, y) & GID_MASK) === targetGid) sel.add(y * w + x);
        }
      }
      commitTileSelection(sel, layerIdx, additive);
    }, [bumpTileSelection]);

    /**
     * Scanline flood-fill from `anchor` on the active layer, including
     * every cell whose raw value (gid + flip bits) is in `matches`.
     * Returns the cell index set (y * mapW + x). Bounded by a hard cap
     * so a stray click on an enormous empty region doesn't lock the
     * renderer mid-frame — anything past the cap is dropped, which is
     * fine for preview purposes (the user moves on or lets go).
     */
    const FLOOD_REGION_CAP = 50000;
    const computeMatchRegion = useCallback((
      layer: TmjLayer,
      anchorX: number,
      anchorY: number,
      matches: Set<number>,
      mapW: number,
      mapH: number,
    ): Set<number> => {
      const out = new Set<number>();
      if (!matches.size) return out;
      if (anchorX < 0 || anchorY < 0 || anchorX >= mapW || anchorY >= mapH) return out;
      if (!matches.has(readCellRaw(layer, anchorX, anchorY) >>> 0)) return out;
      const visited = new Uint8Array(mapW * mapH);
      const queue: number[] = [anchorY * mapW + anchorX];
      const lw = layer.width ?? mapW;
      const lh = layer.height ?? mapH;
      while (queue.length > 0 && out.size < FLOOD_REGION_CAP) {
        const idx = queue.shift()!;
        if (visited[idx]) continue;
        visited[idx] = 1;
        const x = idx % mapW;
        const y = (idx / mapW) | 0;
        if (x >= lw || y >= lh) continue;
        if (!matches.has(readCellRaw(layer, x, y) >>> 0)) continue;
        out.add(idx);
        if (x + 1 < mapW) queue.push(idx + 1);
        if (x > 0) queue.push(idx - 1);
        if (y + 1 < mapH) queue.push(idx + mapW);
        if (y > 0) queue.push(idx - mapW);
      }
      return out;
    }, []);

    /** Decide the selection mode for a wand-click given current modifiers.
     *  Matches Tiled: Shift = Add, Ctrl/Cmd = Subtract, otherwise Replace. */
    const selectionModeFromEvent = (e: { shiftKey: boolean; ctrlKey: boolean; metaKey: boolean }): SelectionMode => {
      const ctrl = e.ctrlKey || e.metaKey;
      // Tiled-exact: Ctrl+Shift=intersect, Shift=add, Ctrl=subtract, else replace.
      // (See tiled/src/tiled/abstracttileselectiontool.cpp::modifiersChanged.)
      if (ctrl && e.shiftKey) return 'intersect';
      if (e.shiftKey) return 'add';
      if (ctrl) return 'subtract';
      return 'replace';
    };

    /** Open a multi-cell-match drag (wand/sameTile/fill). The first cell's
     *  raw seeds the matches; subsequent hovers add more via updateDrag. */
    const startTileDrag = useCallback((
      tool: DragTool,
      tx: number,
      ty: number,
      mode: SelectionMode,
    ): boolean => {
      const state = loadedRef.current;
      if (!state) return false;
      const layerIdx = activeLayerRef.current;
      const layer = state.json.layers[layerIdx];
      if (!layer || layer.type !== 'tilelayer') return false;
      const mapW = state.json.width;
      const mapH = state.json.height;
      if (tx < 0 || ty < 0 || tx >= mapW || ty >= mapH) return false;
      const seed = readCellRaw(layer, tx, ty) >>> 0;
      const matches = new Set<number>([seed]);
      const region = tool === 'sameTile'
        ? computeSameTileRegion(layer, matches, mapW, mapH)
        : computeMatchRegion(layer, tx, ty, matches, mapW, mapH);
      tileDragRef.current = {
        tool,
        anchor: { tx, ty },
        matches,
        layerIdx,
        mode,
        region,
        cancelled: false,
      };
      bumpTileDrag();
      return true;
    }, [bumpTileDrag, computeMatchRegion]);

    /** Whole-active-layer scan for cells whose raw matches any entry. Used
     *  by the Same-Tile tool — same multi-cell-match semantics as the
     *  wand, but without connectivity. */
    const computeSameTileRegion = (
      layer: TmjLayer,
      matches: Set<number>,
      mapW: number,
      mapH: number,
    ): Set<number> => {
      const out = new Set<number>();
      const lw = layer.width ?? mapW;
      const lh = layer.height ?? mapH;
      for (let y = 0; y < Math.min(mapH, lh); y++) {
        for (let x = 0; x < Math.min(mapW, lw); x++) {
          if (matches.has(readCellRaw(layer, x, y) >>> 0)) {
            out.add(y * mapW + x);
            if (out.size >= FLOOD_REGION_CAP) return out;
          }
        }
      }
      return out;
    };

    /** Called from the window mousemove handler while a tile drag is open.
     *  Adds the hovered cell's raw to matches if new, then recomputes the
     *  region. Returns true if the region changed (so the preview repaints). */
    const updateTileDrag = useCallback((tx: number, ty: number): boolean => {
      const drag = tileDragRef.current;
      if (!drag || drag.cancelled) return false;
      const state = loadedRef.current;
      if (!state) return false;
      const layer = state.json.layers[drag.layerIdx];
      if (!layer || layer.type !== 'tilelayer') return false;
      const mapW = state.json.width;
      const mapH = state.json.height;
      if (tx < 0 || ty < 0 || tx >= mapW || ty >= mapH) return false;
      const raw = readCellRaw(layer, tx, ty) >>> 0;
      if (drag.matches.has(raw)) return false;
      drag.matches.add(raw);
      drag.region = drag.tool === 'sameTile'
        ? computeSameTileRegion(layer, drag.matches, mapW, mapH)
        : computeMatchRegion(layer, drag.anchor.tx, drag.anchor.ty, drag.matches, mapW, mapH);
      bumpTileDrag();
      return true;
    }, [bumpTileDrag, computeMatchRegion]);

    /** Commit a wand/sameTile drag into tileSelectionRef using the drag's
     *  selection mode. Replace overwrites; Add unions; Subtract removes
     *  the region's cells from any existing selection on the same layer.
     *  Fires onTileSelectionCommit so the parent can push an undo entry. */
    const commitWandDrag = useCallback(() => {
      const drag = tileDragRef.current;
      if (!drag || drag.cancelled) return;
      if (drag.tool === 'fill') return;
      const prevCells = new Set(tileSelectionRef.current);
      const prevLayer = tileSelectionLayerRef.current;
      const sameLayer = prevLayer === drag.layerIdx;
      let next: Set<number>;
      if (drag.mode === 'add' && sameLayer && prevCells.size > 0) {
        next = new Set(prevCells);
        for (const i of drag.region) next.add(i);
      } else if (drag.mode === 'subtract' && sameLayer && prevCells.size > 0) {
        next = new Set(prevCells);
        for (const i of drag.region) next.delete(i);
      } else if (drag.mode === 'intersect' && sameLayer && prevCells.size > 0) {
        next = new Set();
        for (const i of drag.region) if (prevCells.has(i)) next.add(i);
      } else {
        next = new Set(drag.region);
      }
      // No-op guard — if the selection didn't actually change (e.g. user
      // re-selected the same region), don't push a history entry. Saves
      // the user from having to undo "nothing" presses.
      const nextLayer = next.size > 0 ? drag.layerIdx : -1;
      if (selectionsEqual(prevCells, next) && prevLayer === nextLayer) return;
      tileSelectionRef.current = next;
      tileSelectionLayerRef.current = nextLayer;
      bumpTileSelection();
      onTileSelectionCommitRef.current?.(
        { cells: prevCells, layerIdx: prevLayer },
        { cells: new Set(next), layerIdx: nextLayer },
      );
    }, [bumpTileSelection]);

    /** Apply a rectangle selection (from the 'select' tool's drag) to
     *  tileSelectionRef using the captured modifier mode. Empty rect or
     *  no-op (selection unchanged) → does nothing. Fires
     *  onTileSelectionCommit so undo/redo picks it up. Bound to the
     *  active layer at the moment of release. */
    const commitRectSelection = useCallback((
      sx: number, sy: number, ex: number, ey: number, mode: SelectionMode,
    ) => {
      const state = loadedRef.current;
      if (!state) return;
      const layerIdx = activeLayerRef.current;
      const layer = state.json.layers[layerIdx];
      if (!layer || layer.type !== 'tilelayer') return;
      const mapW = state.json.width;
      const region = new Set<number>();
      for (let y = sy; y <= ey; y++) {
        for (let x = sx; x <= ex; x++) {
          if (x < 0 || y < 0 || x >= state.json.width || y >= state.json.height) continue;
          region.add(y * mapW + x);
        }
      }
      if (region.size === 0) return;
      const prevCells = new Set(tileSelectionRef.current);
      const prevLayer = tileSelectionLayerRef.current;
      const sameLayer = prevLayer === layerIdx;
      let next: Set<number>;
      if (mode === 'add' && sameLayer && prevCells.size > 0) {
        next = new Set(prevCells);
        for (const i of region) next.add(i);
      } else if (mode === 'subtract' && sameLayer && prevCells.size > 0) {
        next = new Set(prevCells);
        for (const i of region) next.delete(i);
      } else if (mode === 'intersect' && sameLayer && prevCells.size > 0) {
        next = new Set();
        for (const i of region) if (prevCells.has(i)) next.add(i);
      } else {
        next = new Set(region);
      }
      const nextLayer = next.size > 0 ? layerIdx : -1;
      if (selectionsEqual(prevCells, next) && prevLayer === nextLayer) return;
      tileSelectionRef.current = next;
      tileSelectionLayerRef.current = nextLayer;
      bumpTileSelection();
      onTileSelectionCommitRef.current?.(
        { cells: prevCells, layerIdx: prevLayer },
        { cells: new Set(next), layerIdx: nextLayer },
      );
    }, [bumpTileSelection]);

    /** Commit a fill drag by tiling the brush PATTERN across the region.
     *
     *  Transcribed from Tiled's AbstractTileFillTool::fillWithStamp:
     *  the stamp is anchored at the region's bounding-rect top-left and
     *  REPEATED (every brush.width × brush.height) across the bbox; cells
     *  outside the actual flood-fill mask are not painted. So a 2×2
     *  brush gets tiled like wallpaper across whatever the region covers,
     *  preserving the multi-cell pattern instead of degrading to "paint
     *  one tile everywhere". Multi-layer brushes (extraLayers) apply
     *  their respective layers in parallel via the same offset math.
     */
    const commitFillDrag = useCallback(() => {
      const drag = tileDragRef.current;
      if (!drag || drag.cancelled || drag.tool !== 'fill') return;
      const state = loadedRef.current;
      const map = mapWasmRef.current;
      if (!state || !map) return;
      const brush = selectedBrushRef.current;
      if (!brush || drag.region.size === 0) return;
      const mapW = state.json.width;
      const mapH = state.json.height;
      // Compute the region's bounding rect — Tiled's stamp anchor point.
      let minX = mapW, minY = mapH, maxX = -1, maxY = -1;
      for (const idx of drag.region) {
        const x = idx % mapW;
        const y = (idx / mapW) | 0;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
      if (maxX < 0) return;
      const activeIdx = drag.layerIdx;
      const batchAdds: HistoryEntry[] = [];

      const paintGrid = (cells: (BrushCell | null)[], dstLayer: number) => {
        if (dstLayer < 0 || dstLayer >= state.json.layers.length) return;
        const layerN = state.json.layers[dstLayer];
        if (!layerN || layerN.type !== 'tilelayer') return;
        const path = layerN.bridgePath;
        if (!path) return;
        for (const idx of drag.region) {
          const cx = idx % mapW;
          const cy = (idx / mapW) | 0;
          // Stamp tiles across the bbox; brush coord = position in the
          // pattern at (cx - minX, cy - minY) wrapped by brush dims.
          const bx = ((cx - minX) % brush.width + brush.width) % brush.width;
          const by = ((cy - minY) % brush.height + brush.height) % brush.height;
          const cell = cells[by * brush.width + bx];
          if (!cell) continue; // null in stamp = skip this cell
          if (layerN.width && layerN.height && (cx >= layerN.width || cy >= layerN.height)) continue;
          const ts = state.tilesets[cell.tilesetIndex];
          if (!ts) continue;
          const baseGid = ts.firstgid + cell.tileId;
          const hasFlip = cell.flipH || cell.flipV || cell.flipD;
          let newRaw = baseGid >>> 0;
          if (cell.flipH) newRaw = (newRaw | FLIPPED_HORIZONTALLY) >>> 0;
          if (cell.flipV) newRaw = (newRaw | FLIPPED_VERTICALLY) >>> 0;
          if (cell.flipD) newRaw = (newRaw | FLIPPED_DIAGONALLY) >>> 0;
          const oldRaw = readCellRaw(layerN, cx, cy);
          if (oldRaw === newRaw) continue;
          if (hasFlip) map.setCellRawAtPath(path, cx, cy, newRaw);
          else map.setCellAtPath(path, cx, cy, cell.tilesetIndex, cell.tileId);
          writeCellRaw(layerN, cx, cy, newRaw);
          batchAdds.push({ layerIdx: dstLayer, x: cx, y: cy, oldRaw });
          syncSpriteAt(dstLayer, cx, cy);
        }
      };
      paintGrid(brush.cells, activeIdx);
      if (brush.extraLayers) {
        for (const extra of brush.extraLayers) {
          paintGrid(extra.cells, resolveExtraLayerIdx(state.json.layers, extra, activeIdx));
        }
      }

      if (batchAdds.length > 0) {
        commitBatch(batchAdds);
        rebuildAnimSprites();
        onDirty();
      }
    }, [syncSpriteAt, rebuildAnimSprites, commitBatch, onDirty]);

    /** End the in-flight tile drag — commit if not cancelled, then clear. */
    const endTileDrag = useCallback(() => {
      const drag = tileDragRef.current;
      if (!drag) return;
      if (!drag.cancelled) {
        if (drag.tool === 'fill') commitFillDrag();
        else commitWandDrag();
      }
      tileDragRef.current = null;
      bumpTileDrag();
    }, [commitFillDrag, commitWandDrag, bumpTileDrag]);

    /** Mark the drag as cancelled — preview stays cleared until release. */
    const cancelTileDrag = useCallback(() => {
      const drag = tileDragRef.current;
      if (!drag) return;
      drag.cancelled = true;
      drag.region = new Set();
      bumpTileDrag();
    }, [bumpTileDrag]);

    const clearTileSelection = useCallback(() => {
      if (tileSelectionRef.current.size === 0) return;
      tileSelectionRef.current = new Set();
      tileSelectionLayerRef.current = -1;
      bumpTileSelection();
    }, [bumpTileSelection]);

    /** Erase every cell in the current tile selection on the layer it was
     *  built against. Cleared after, so a second Delete doesn't re-fire. */
    const eraseTileSelection = useCallback(() => {
      const state = loadedRef.current;
      const map = mapWasmRef.current;
      if (!state || !map) return;
      const sel = tileSelectionRef.current;
      if (sel.size === 0) return;
      const layerIdx = tileSelectionLayerRef.current;
      if (layerIdx < 0) return;
      const layer = state.json.layers[layerIdx];
      if (!layer || layer.type !== 'tilelayer') return;
      const path = layer.bridgePath;
      if (!path) return;
      const w = state.json.width;
      const batch: HistoryEntry[] = [];
      for (const idx of sel) {
        const x = idx % w;
        const y = (idx / w) | 0;
        const oldRaw = readCellRaw(layer, x, y);
        if (oldRaw === 0) continue;
        map.setCellAtPath(path, x, y, -1, -1);
        writeCellRaw(layer, x, y, 0);
        batch.push({ layerIdx, x, y, oldRaw });
        syncSpriteAt(layerIdx, x, y);
      }
      if (batch.length > 0) {
        commitBatch(batch);
        rebuildAnimSprites();
        onDirty();
      }
      clearTileSelection();
    }, [syncSpriteAt, rebuildAnimSprites, commitBatch, onDirty, clearTileSelection]);

    /** Fill every cell in the current tile selection with `cell` (a single
     *  BrushCell — the fill tool's representative tile). Used when the
     *  user pairs Wand / Same Tile with the fill tool. Selection clears
     *  after to mirror the one-shot feel of a paint-bucket click. */
    const fillTileSelection = useCallback((cell: BrushCell) => {
      const state = loadedRef.current;
      const map = mapWasmRef.current;
      if (!state || !map) return;
      const sel = tileSelectionRef.current;
      if (sel.size === 0) return;
      const layerIdx = tileSelectionLayerRef.current;
      if (layerIdx < 0) return;
      const layer = state.json.layers[layerIdx];
      if (!layer || layer.type !== 'tilelayer') return;
      const path = layer.bridgePath;
      if (!path) return;
      const ts = state.tilesets[cell.tilesetIndex];
      if (!ts) return;
      const baseGid = ts.firstgid + cell.tileId;
      const hasFlip = cell.flipH || cell.flipV || cell.flipD;
      let newRaw = baseGid >>> 0;
      if (cell.flipH) newRaw = (newRaw | FLIPPED_HORIZONTALLY) >>> 0;
      if (cell.flipV) newRaw = (newRaw | FLIPPED_VERTICALLY) >>> 0;
      if (cell.flipD) newRaw = (newRaw | FLIPPED_DIAGONALLY) >>> 0;
      const w = state.json.width;
      const batch: HistoryEntry[] = [];
      for (const idx of sel) {
        const x = idx % w;
        const y = (idx / w) | 0;
        const oldRaw = readCellRaw(layer, x, y);
        if (oldRaw === newRaw) continue;
        if (hasFlip) map.setCellRawAtPath(path, x, y, newRaw);
        else map.setCellAtPath(path, x, y, cell.tilesetIndex, cell.tileId);
        writeCellRaw(layer, x, y, newRaw);
        batch.push({ layerIdx, x, y, oldRaw });
        syncSpriteAt(layerIdx, x, y);
      }
      if (batch.length > 0) {
        commitBatch(batch);
        rebuildAnimSprites();
        onDirty();
      }
      clearTileSelection();
    }, [syncSpriteAt, rebuildAnimSprites, commitBatch, onDirty, clearTileSelection]);

    /**
     * Build a brush from the current tile selection's bbox and hand it to
     * the parent via onPickBrush. Cells outside the selection but inside
     * the bbox become null (paint-skip), so an irregular wand selection
     * gets painted as-is when the brush is stamped elsewhere.
     */
    const copyTileSelectionToBrush = useCallback((): boolean => {
      const state = loadedRef.current;
      if (!state) return false;
      const sel = tileSelectionRef.current;
      if (sel.size === 0) return false;
      const layerIdx = tileSelectionLayerRef.current;
      if (layerIdx < 0) return false;
      const layer = state.json.layers[layerIdx];
      if (!layer || layer.type !== 'tilelayer') return false;
      const w = state.json.width;
      // bbox of selected indices.
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const idx of sel) {
        const x = idx % w;
        const y = (idx / w) | 0;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
      const bw = maxX - minX + 1;
      const bh = maxY - minY + 1;
      const cells: (BrushCell | null)[] = new Array(bw * bh).fill(null);
      for (const idx of sel) {
        const x = idx % w;
        const y = (idx / w) | 0;
        const raw = readCellRaw(layer, x, y);
        if (!raw) continue;
        const gid = raw & GID_MASK;
        const ts = findTilesetForGid(state.tilesets, gid);
        if (!ts) continue;
        const tsIdx = state.tilesets.indexOf(ts);
        const cell: BrushCell = { tilesetIndex: tsIdx, tileId: gid - ts.firstgid };
        if ((raw & FLIPPED_HORIZONTALLY) !== 0) cell.flipH = true;
        if ((raw & FLIPPED_VERTICALLY)   !== 0) cell.flipV = true;
        if ((raw & FLIPPED_DIAGONALLY)   !== 0) cell.flipD = true;
        cells[(y - minY) * bw + (x - minX)] = cell;
      }
      onPickBrushRef.current?.({ width: bw, height: bh, cells });
      return true;
    }, []);

    const paintAt = useCallback((tx: number, ty: number) => {
      if (toolRef.current === 'erase') eraseAt(tx, ty);
      else if (toolRef.current === 'fill') floodFillAt(tx, ty);
      else stampBrushAt(tx, ty);
    }, [eraseAt, floodFillAt, stampBrushAt]);

    // ----- undo/redo --------------------------------------------------------

    const applyEntry = useCallback((entry: HistoryEntry): HistoryEntry | null => {
      const state = loadedRef.current;
      const map = mapWasmRef.current;
      if (!state || !map) return null;
      const layer = state.json.layers[entry.layerIdx];
      if (!layer || layer.type !== 'tilelayer') return null;
      const currentRaw = readCellRaw(layer, entry.x, entry.y);
      const inverse: HistoryEntry = { ...entry, oldRaw: currentRaw };
      const path = layer.bridgePath;
      if (!path) return null;
      // Use setCellRawAtPath so flip/rotation bits round-trip through
      // undo/redo and any-depth nested layers work too.
      map.setCellRawAtPath(path, entry.x, entry.y, entry.oldRaw >>> 0);
      writeCellRaw(layer, entry.x, entry.y, entry.oldRaw >>> 0);
      syncSpriteAt(entry.layerIdx, entry.x, entry.y);
      return inverse;
    }, [syncSpriteAt]);

    const applyBatch = useCallback((batch: HistoryEntry[]): HistoryEntry[] | null => {
      const inverse: HistoryEntry[] = [];
      for (const entry of batch) {
        const inv = applyEntry(entry);
        if (!inv) return null;
        inverse.push(inv);
      }
      rebuildAnimSprites();
      return inverse.reverse();
    }, [applyEntry, rebuildAnimSprites]);

    const doUndo = useCallback((): boolean => {
      const batch = undoStackRef.current.pop();
      if (!batch) return false;
      const inverse = applyBatch(batch);
      if (inverse) {
        redoStackRef.current.push(inverse);
        onHistoryChange?.();
        onDirty();
        return true;
      }
      undoStackRef.current.push(batch);
      return false;
    }, [applyBatch, onDirty, onHistoryChange]);

    const doRedo = useCallback((): boolean => {
      const batch = redoStackRef.current.pop();
      if (!batch) return false;
      const inverse = applyBatch(batch);
      if (inverse) {
        undoStackRef.current.push(inverse);
        onHistoryChange?.();
        onDirty();
        return true;
      }
      redoStackRef.current.push(batch);
      return false;
    }, [applyBatch, onDirty, onHistoryChange]);

    useImperativeHandle(forwardedRef, () => ({
      // A PNG data URL of just the tile layers (rootRef — NOT the overlay
      // container, so no grid/selection/event markers leak in), downscaled to
      // keep the tone-preview's per-pixel pass cheap. Uses the renderer's
      // extract (the drawing buffer isn't preserved, so reading app.canvas
      // directly would come back blank). Best-effort: any failure → null, and
      // the tone form falls back to its abstract swatches.
      snapshotDataURL: () => {
        const app = appRef.current;
        const root = rootRef.current;
        if (!app || !root) return null;
        try {
          const src = app.renderer.extract.canvas(root) as HTMLCanvasElement;
          if (!src || !src.width || !src.height) return null;
          const maxW = 640;
          const scale = Math.min(1, maxW / src.width);
          if (scale === 1) return typeof src.toDataURL === 'function' ? src.toDataURL('image/png') : null;
          const off = document.createElement('canvas');
          off.width = Math.max(1, Math.round(src.width * scale));
          off.height = Math.max(1, Math.round(src.height * scale));
          const ctx = off.getContext('2d');
          if (!ctx) return null;
          ctx.drawImage(src, 0, 0, off.width, off.height);
          return off.toDataURL('image/png');
        } catch (e) {
          console.warn('[map-editor] snapshotDataURL failed', e);
          return null;
        }
      },
      saveBytes: () => {
        const bytes = mapWasmRef.current?.save();
        if (!bytes) return null;
        // The wasm bridge serializes tilesets using its internal firstgids,
        // which for tilesets loaded standalone (every fresh .tsx the bridge
        // opened on its own) are all "1" — colliding. Our cell data lives
        // in the CORRECTED firstgid namespace (see recomputeFirstgids +
        // load-time .tmx override), so a saved file with firstgid="1" on
        // every <tileset/> is internally inconsistent: Tiled (and our own
        // reload) resolves gid 447 against tileset[0] tilecount=144 and
        // either picks the wrong tileset or renders the red-X "missing
        // tile" marker. Fix: rewrite <tileset ... firstgid="..."/>
        // declarations in order to match state.tilesets's corrected gids.
        const prev = loadedRef.current;
        const ts = prev?.tilesets;
        if (!prev || !ts || ts.length === 0) return bytes;
        try {
          let text = new TextDecoder('utf-8').decode(bytes);

          // ---- 1. Rewrite <tileset firstgid="…"/> declarations -----------
          let tsIdx = 0;
          text = text.replace(/<tileset\b([^>]*?)firstgid="(\d+)"([^>]*?)\/?>/g, (m, pre, _fg, post) => {
            const correct = ts[tsIdx]?.firstgid;
            tsIdx++;
            if (correct == null) return m;
            return `<tileset${pre}firstgid="${correct}"${post}/>`;
          });
          if (tsIdx !== ts.length) {
            console.warn(`[map-editor] saveBytes firstgid rewrite: matched ${tsIdx} <tileset> tags, expected ${ts.length} — leaving original bytes`);
            return bytes;
          }

          // ---- 2. Replace every <data encoding="csv">…</data> block ------
          // The bridge's MapWriter emits cell gids via libtiled's GidMapper
          // (cumulative `nextTileId()` across tilesets). For .tsx files whose
          // explicit `<tile>` slots fall short of the image-derived tilecount
          // (PSDK's tilesets declare 0 explicit tiles for systemtags /
          // terrain_tag / Umbra), nextTileId is 0 → every later tileset's
          // firstGid collides at the same value → the GidMapper QMap
          // overwrites earlier entries → emitted gids collapse to whichever
          // tileset was inserted last for that firstGid, regardless of which
          // tileset the cell actually references. That's how Umbra grass
          // ends up saved as gid 8 (passages tile 7).
          //
          // Workaround: ignore wasm's CSV output entirely and serialize cell
          // data from the JS mirror, which has held the canonical gids since
          // load (.tmx-parsed) and every subsequent paint. The mirror lives
          // on prev.json.layers (flattened); we walk the .tmx's <layer> tags
          // in document order and zip them against the flattened JS list.
          const jsLayers = prev.json.layers.filter((l) => l.type === 'tilelayer');
          let layerOrdinal = 0;
          let csvMismatch = false;
          text = text.replace(
            /(<layer\b[^>]*>[\s\S]*?<data\b[^>]*encoding="csv"[^>]*>)([\s\S]*?)(<\/data>)/g,
            (full, openTag, _oldCsv, closeTag) => {
              const jsLayer = jsLayers[layerOrdinal];
              layerOrdinal++;
              if (!jsLayer || !Array.isArray(jsLayer.data)) {
                csvMismatch = true;
                return full;
              }
              const w = jsLayer.width ?? prev.json.width;
              const data = jsLayer.data as number[];
              const rows: string[] = [];
              for (let y = 0; y < Math.ceil(data.length / w); y++) {
                const start = y * w;
                const end = Math.min(start + w, data.length);
                rows.push(data.slice(start, end).map((g) => (g >>> 0).toString()).join(','));
              }
              // Match libtiled's formatting: leading newline, row-per-line,
              // trailing comma+newline on all but last row, newline after last.
              const csv = '\n' + rows.join(',\n') + '\n';
              return openTag + csv + closeTag;
            },
          );
          if (csvMismatch || layerOrdinal !== jsLayers.length) {
            console.warn(`[map-editor] saveBytes cell rewrite: matched ${layerOrdinal} <layer> blocks, expected ${jsLayers.length}${csvMismatch ? ' (also: missing JS mirror data)' : ''} — saved file may be inconsistent`);
          }

          return new TextEncoder().encode(text);
        } catch (e) {
          console.warn('[map-editor] saveBytes rewrite failed', e);
          return bytes;
        }
      },
      redraw: () => { /* Pixi auto-renders; visibility/zoom effects handle prop changes */ },
      undo: doUndo,
      redo: doRedo,
      stackSizes: () => ({ undo: undoStackRef.current.length, redo: redoStackRef.current.length }),
      // Authoring: mutate wasm map only. Caller drives reload via save +
      // writeMapBytes + reloadKey bump so we don't need an in-place
      // scene-graph rebuild for layer add/del/move.
      addTileLayer: (name: string) => {
        const idx = mapWasmRef.current?.addTileLayer(name) ?? -1;
        dbg('layer', `addTileLayer("${name}") → bridge idx ${idx}`);
        return idx;
      },
      addGroupLayer: (name: string) => {
        const idx = mapWasmRef.current?.addGroupLayer(name) ?? -1;
        dbg('layer', `addGroupLayer("${name}") → bridge idx ${idx}`);
        return idx;
      },
      removeLayer: (idx: number) => (mapWasmRef.current?.removeLayer(idx) ?? -1) === 0,
      removeLayerAtPath: (path: number[]) =>
        (mapWasmRef.current?.removeLayerAtPath(path) ?? -1) === 0,
      renameLayer: (idx: number, name: string) => (mapWasmRef.current?.renameLayer(idx, name) ?? -1) === 0,
      renameLayerAtPath: (path: number[], name: string) =>
        (mapWasmRef.current?.renameLayerAtPath(path, name) ?? -1) === 0,
      moveLayer: (from: number, to: number) => (mapWasmRef.current?.moveLayer(from, to) ?? -1) === 0,
      moveLayerToPath: (srcPath: number[], dstParentPath: number[], dstIdx: number) =>
        (mapWasmRef.current?.moveLayerToPath(srcPath, dstParentPath, dstIdx) ?? -1) === 0,
      setLayerOpacityAtPath: (path: number[], opacity: number) =>
        (mapWasmRef.current?.setLayerOpacityAtPath(path, opacity) ?? -1) === 0,
      setLayerOpacityLive: (flatIdx: number, opacity: number) => {
        // Live preview: update the layer's effective opacity in the JS
        // state and the corresponding container's alpha directly. Skips
        // the full scene rebuild that would make slider-drag choppy and
        // (worse) trigger onLoaded's visibility-reset, which is the
        // "the layer disables itself" symptom.
        const state = loadedRef.current;
        if (state && state.json.layers[flatIdx]) {
          state.json.layers[flatIdx].opacity = opacity;
        }
        const container = layerContainersRef.current.get(flatIdx);
        if (container) container.alpha = opacity;
      },
      resizeMap: (w: number, h: number, dx: number, dy: number) =>
        (mapWasmRef.current?.resize(w, h, dx, dy) ?? -1) === 0,
      // In-place scene rebuild from current wasm state. Parent calls this
      // after layer authoring instead of save+reload-from-disk, so edits
      // stay in-memory until the user explicitly hits Save.
      rebuildScene: rebuildSceneFromCurrentWasm,
      // Phase 1c: the parent owns the action history now. This lets it
      // apply a stored batch (writing each entry's `oldRaw` back) and
      // get a redo batch in return. Same semantics as the legacy
      // applyBatch — we just expose it on the handle.
      applyCellBatch: (batch: HistoryEntry[]) => applyBatch(batch),
      // One-shot selection setter used by parent's undo/redo to restore
      // a prior tile-selection state. Does NOT fire onTileSelectionCommit
      // (that'd push a redundant history entry and create an undo loop).
      setTileSelection: (cells: Set<number>, layerIdx: number) => {
        tileSelectionRef.current = new Set(cells);
        tileSelectionLayerRef.current = cells.size > 0 ? layerIdx : -1;
        bumpTileSelection();
      },
      /**
       * Turn the current tile selection into a Brush, cropped to its
       * bounding box. Cells outside the selection (inside the bbox) are
       * null so the brush paints with selection-shaped holes — matches
       * Tiled's "Copy" behavior. Returns null if no selection or if the
       * bound layer no longer exists. When other layers are co-selected
       * in the panel, their content under the same mask is captured as
       * extraLayers so multi-layer copy/paste round-trips.
       */
      selectionToBrush: (): Brush | null => {
        const state = loadedRef.current;
        if (!state) return null;
        const sel = tileSelectionRef.current;
        if (sel.size === 0) return null;
        const anchor = tileSelectionLayerRef.current;
        const anchorLayer = state.json.layers[anchor];
        if (!anchorLayer || anchorLayer.type !== 'tilelayer') return null;
        const mapW = state.json.width;
        let minX = mapW, minY = state.json.height, maxX = -1, maxY = -1;
        for (const idx of sel) {
          const x = idx % mapW;
          const y = (idx / mapW) | 0;
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
        if (maxX < 0) return null;
        const bw = maxX - minX + 1;
        const bh = maxY - minY + 1;
        const buildCells = (li: number): (BrushCell | null)[] => {
          const cs: (BrushCell | null)[] = new Array(bw * bh).fill(null);
          const ln = state.json.layers[li];
          if (!ln || ln.type !== 'tilelayer') return cs;
          for (const idx of sel) {
            const cx = idx % mapW;
            const cy = (idx / mapW) | 0;
            const raw = readCellRaw(ln, cx, cy);
            if (!raw) continue;
            const gid = raw & GID_MASK;
            const ts = findTilesetForGid(state.tilesets, gid);
            if (!ts) continue;
            const tsIdx = state.tilesets.indexOf(ts);
            const cell: BrushCell = { tilesetIndex: tsIdx, tileId: gid - ts.firstgid };
            if ((raw & FLIPPED_HORIZONTALLY) !== 0) cell.flipH = true;
            if ((raw & FLIPPED_VERTICALLY)   !== 0) cell.flipV = true;
            if ((raw & FLIPPED_DIAGONALLY)   !== 0) cell.flipD = true;
            cs[(cy - minY) * bw + (cx - minX)] = cell;
          }
          return cs;
        };
        const cells = buildCells(anchor);
        let extraLayers: BrushLayer[] | undefined;
        const selSet = new Set(selectedLayersRef.current);
        if (selSet.size > 1) {
          extraLayers = [];
          for (const li of selSet) {
            if (li === anchor) continue;
            const ln = state.json.layers[li];
            if (!ln || ln.type !== 'tilelayer') continue;
            const cs = buildCells(li);
            if (cs.every((c) => c === null)) continue;
            extraLayers.push({ layerOffset: li - anchor, cells: cs });
          }
          if (extraLayers.length === 0) extraLayers = undefined;
        }
        return { width: bw, height: bh, cells, extraLayers };
      },
      /**
       * Erase every cell in the current tile selection on the selection's
       * layer (and any co-selected layers). Pushes one undo batch covering
       * all writes. Used by Cut (Ctrl+X). Leaves the selection itself
       * intact — the caller decides whether to clear it.
       */
      eraseTileSelection: () => {
        const state = loadedRef.current;
        const map = mapWasmRef.current;
        if (!state || !map) return;
        const sel = tileSelectionRef.current;
        if (sel.size === 0) return;
        const anchor = tileSelectionLayerRef.current;
        const anchorLayer = state.json.layers[anchor];
        if (!anchorLayer || anchorLayer.type !== 'tilelayer') return;
        const mapW = state.json.width;
        const batch: HistoryEntry[] = [];
        const eraseOn = (li: number) => {
          const ln = state.json.layers[li];
          if (!ln || ln.type !== 'tilelayer' || !ln.bridgePath) return;
          for (const idx of sel) {
            const x = idx % mapW;
            const y = (idx / mapW) | 0;
            if (ln.width && ln.height && (x >= ln.width || y >= ln.height)) continue;
            const oldRaw = readCellRaw(ln, x, y);
            if (oldRaw === 0) continue;
            map.setCellAtPath(ln.bridgePath, x, y, -1, -1);
            writeCellRaw(ln, x, y, 0);
            batch.push({ layerIdx: li, x, y, oldRaw });
            syncSpriteAt(li, x, y);
          }
        };
        const selSet = new Set(selectedLayersRef.current);
        if (selSet.size > 1) {
          for (const li of selSet) eraseOn(li);
        } else {
          eraseOn(anchor);
        }
        if (batch.length === 0) return;
        commitBatch(batch);
        rebuildAnimSprites();
        onDirty();
      },
      /**
       * Swap the wasm map handle for one built from `bytes`. The tileset
       * + image MEMFS entries are still in place from the original load,
       * so `openMap` (no assets re-supply) resolves the references the
       * snapshot points at. After the swap we rebuild the scene so the
       * UI matches the restored state. Used exclusively by structural
       * undo/redo — keeps everything in memory, no disk writes.
       */
      replaceMapFromBytes: async (bytes: Uint8Array) => {
        const old = mapWasmRef.current;
        if (!old) return false;
        try {
          const next = await TiledModule.openMap(bytes);
          mapWasmRef.current = next;
          try { old.close(); } catch { /* best effort */ }
          return rebuildSceneFromCurrentWasm();
        } catch (e) {
          console.error('[map-editor] replaceMapFromBytes failed', e);
          return false;
        }
      },
      /**
       * In-memory tileset add. Pushes the new .tsx + image into MEMFS,
       * opens the modified .tmx (which already references the new
       * tileset), swaps the wasm handle, decodes the new image bitmap +
       * builds its texture cache, and rebuilds the scene. The .tmx
       * never touches disk. Used by MapEditorPage.onAddTileset so adding
       * a tileset doesn't auto-save.
       */
      addTilesetInMemory: async ({ modifiedMapBytes, newTsx, newImage }) => {
        const old = mapWasmRef.current;
        const app = appRef.current;
        const prev = loadedRef.current;
        if (!old || !app || !prev) return false;
        try {
          // openMapWithAssets puts every passed file into MEMFS, then
          // opens the map. The map's `<tileset source="../Tilesets/X.tsx"/>`
          // resolves relative to the map's MEMFS path, so we mount the
          // new map at the same Data/Tiled/Maps location as the
          // original, the new .tsx at Data/Tiled/Tilesets/, and the
          // image at Data/Tiled/Assets/ — same convention the load
          // effect uses.
          const mapEntry = {
            relPath: 'Data/Tiled/Maps/__inmem.tmx',
            bytes: modifiedMapBytes.buffer.slice(
              modifiedMapBytes.byteOffset,
              modifiedMapBytes.byteOffset + modifiedMapBytes.byteLength,
            ),
          };
          const next = await TiledModule.openMapWithAssets(mapEntry, [
            { relPath: newTsx.relPath, bytes: newTsx.bytes },
            { relPath: newImage.relPath, bytes: newImage.bytes },
          ]);

          // Find the new tileset's metadata in the freshly-loaded map.
          // We appended it in the XML so it's the LAST entry.
          const newRaw = next.toJson() as TmjMap;
          const newIdx = newRaw.tilesets.length - 1;
          let newTilesetMeta: TmjTileset = newRaw.tilesets[newIdx];
          if (!newTilesetMeta.image) {
            try {
              const tsj = next.tilesetJson(newIdx) as Partial<TmjTileset>;
              newTilesetMeta = {
                ...tsj,
                firstgid: newRaw.tilesets[newIdx].firstgid,
                source: newRaw.tilesets[newIdx].source,
              } as TmjTileset;
            } catch { /* leave as raw entry */ }
          }

          // Decode the new image into a bitmap (with optional transparent
          // color applied), then slice into texture bands the renderer
          // can use for sprite textures.
          const rawBmp = await decodePngFromBytes(newImage.bytes);
          const bmp = await applyTransparentColor(rawBmp, newImage.transparentColor);
          const gl = (app.renderer as unknown as { gl?: WebGL2RenderingContext }).gl;
          const gpuMaxTex = gl
            ? Math.min(16384, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number)
            : 16384;
          const bands = await buildTilesetBands(bmp, newTilesetMeta.tileheight, gpuMaxTex);

          // Pick a firstgid for the new tileset that's STRICTLY beyond
          // every existing tileset's (firstgid + tilecount) range.
          //
          // Why we override what wasm returned: libtiled's nextTileId
          // logic (the same one we work around with recomputeFirstgids on
          // load) can hand back a firstgid that overlaps an already-
          // present tileset's gid range. When that happens, cells in
          // existing layers — whose gids were assigned against the
          // PRESERVED firstgids in prev.tilesets — start resolving to
          // the freshly-added tileset, visibly replacing tiles in the
          // user's map. Computing it from prev's preserved firstgids
          // guarantees no overlap.
          //
          // The reported `tilecount` field on libtiled-emitted tileset
          // entries cannot be trusted — we've seen it come back as 14
          // for a tileset whose image is clearly 8×48 (384 real tiles).
          // Trusting it would put the new tileset's firstgid inside the
          // existing one's actual gid range and visibly replace any cell
          // referencing a tile beyond the bogus count.
          //
          // Bitmap dimensions ARE authoritative when the bitmap is
          // decoded (which it always is at this point for any tileset
          // the renderer is using). Take the LARGER of bitmap-derived
          // and reported count to also handle cases where tilecount is
          // somehow higher than what the bitmap would suggest.
          let safeFirstgid = 1;
          for (const ts of prev.tilesets) {
            let countFromBitmap = 0;
            if (ts.bitmap && ts.tilewidth && ts.tileheight) {
              const cols = Math.floor(ts.bitmap.width / ts.tilewidth);
              const rows = Math.floor(ts.bitmap.height / ts.tileheight);
              countFromBitmap = cols * rows;
            } else if (ts.columns && ts.imageheight && ts.tileheight) {
              countFromBitmap = ts.columns * Math.floor(ts.imageheight / ts.tileheight);
            }
            const reportedCount = (typeof ts.tilecount === 'number' && ts.tilecount > 0) ? ts.tilecount : 0;
            const count = Math.max(countFromBitmap, reportedCount, 1);
            const span = (ts.firstgid ?? 0) + count;
            if (span > safeFirstgid) safeFirstgid = span;
          }
          // Swap handle, pre-populate the renderer's tileset list + cache
          // at the new index so the upcoming rebuildScene finds them.
          mapWasmRef.current = next;
          try { old.close(); } catch { /* best */ }
          prev.tilesets[newIdx] = { ...newTilesetMeta, bitmap: bmp, firstgid: safeFirstgid };
          tilesetCachesRef.current.set(newIdx, { bands, perTile: new Map() });

          return rebuildSceneFromCurrentWasm();
        } catch (e) {
          console.error('[map-editor] addTilesetInMemory failed', e);
          return false;
        }
      },
    }), [doUndo, doRedo, rebuildSceneFromCurrentWasm, applyBatch]);

    // ----- coords + topmost helpers ----------------------------------------

    const eventToTile = useCallback((e: React.MouseEvent | MouseEvent): { tx: number; ty: number } | null => {
      const canvas = appRef.current?.canvas;
      const state = loadedRef.current;
      if (!canvas || !state) return null;
      const rect = canvas.getBoundingClientRect();
      const sx = (e as MouseEvent).clientX - rect.left;
      const sy = (e as MouseEvent).clientY - rect.top;
      // canvas display size == native map dims * zoom (we resize on zoom).
      // So pixels per tile in display space = tilewidth * zoom.
      const tx = Math.floor(sx / (state.json.tilewidth * zoomRef.current));
      const ty = Math.floor(sy / (state.json.tileheight * zoomRef.current));
      if (tx < 0 || ty < 0 || tx >= state.json.width || ty >= state.json.height) return null;
      return { tx, ty };
    }, []);

    const topVisibleAt = useCallback((tx: number, ty: number):
      { layerIdx: number; tilesetIndex: number; tileId: number } | null => {
      const state = loadedRef.current;
      if (!state) return null;
      for (let li = state.json.layers.length - 1; li >= 0; li--) {
        const layer = state.json.layers[li];
        if (layer.type !== 'tilelayer') continue;
        const vis = li in visibilityRef.current ? visibilityRef.current[li] : layer.visible;
        if (!vis) continue;
        const raw = readCellRaw(layer, tx, ty);
        if (!raw) continue;
        const gid = raw & GID_MASK;
        const ts = findTilesetForGid(state.tilesets, gid);
        if (!ts) continue;
        const tsIdx = state.tilesets.indexOf(ts);
        return { layerIdx: li, tilesetIndex: tsIdx, tileId: gid - ts.firstgid };
      }
      return null;
    }, []);

    // ----- overlay redraws -------------------------------------------------

    const redrawSelectionOverlay = useCallback(() => {
      const gfx = selectionGfxRef.current;
      const state = loadedRef.current;
      if (!gfx || !state) return;
      gfx.clear();
      const sel = selectionRectRef.current;
      if (!sel) return;
      const tw = state.json.tilewidth;
      const th = state.json.tileheight;
      const x = sel.sx * tw;
      const y = sel.sy * th;
      const w = (sel.ex - sel.sx + 1) * tw;
      const h = (sel.ey - sel.sy + 1) * th;

      // Left-button shape-fill drag → preview WHICH CELLS will be painted
      // by tinting each one individually, masked by the ellipse if active.
      // Right-drag (pick / erase) keeps the bounding-box-only look.
      const isShapeDrag = selectionButtonRef.current === 0
        && (toolRef.current === 'rect' || toolRef.current === 'ellipse');

      if (isShapeDrag) {
        // Outline-only — the actual brush tiles are previewed as ghost
        // sprites in redrawPreviewOverlay, so this layer just supplies
        // the gold boundary silhouette of the shape.
        const isEllipse = toolRef.current === 'ellipse';
        if (isEllipse) {
          gfx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2)
            .stroke({ color: 0xffd000, width: 2 });
        } else {
          gfx.rect(x + 1, y + 1, w - 2, h - 2)
            .stroke({ color: 0xffd000, width: 2 });
        }
      } else {
        // Pick / erase-rect: bounding box only.
        gfx.rect(x, y, w, h).fill({ color: 0xffd000, alpha: 0.18 });
        gfx.rect(x + 1, y + 1, w - 2, h - 2).stroke({ color: 0xffd000, width: 2 });
      }
    }, []);

    const redrawGridOverlay = useCallback(() => {
      const gfx = gridGfxRef.current;
      const state = loadedRef.current;
      if (!gfx || !state) return;
      gfx.clear();
      gfx.visible = !!showGridRef.current;
      if (!gfx.visible) return;
      const tw = state.json.tilewidth;
      const th = state.json.tileheight;
      const W = state.json.width * tw;
      const H = state.json.height * th;
      for (let x = 0; x <= state.json.width; x++) {
        const xp = x * tw + 0.5;
        gfx.moveTo(xp, 0).lineTo(xp, H);
      }
      for (let y = 0; y <= state.json.height; y++) {
        const yp = y * th + 0.5;
        gfx.moveTo(0, yp).lineTo(W, yp);
      }
      gfx.stroke({ color: 0xffffff, width: 1, alpha: 0.12 });
    }, []);

    const redrawPreviewOverlay = useCallback(() => {
      const container = previewGfxRef.current;
      const state = loadedRef.current;
      if (!container || !state) return;
      // Clear pooled preview sprites + any outline children.
      for (const s of previewSpritesRef.current) {
        container.removeChild(s);
        s.destroy();
      }
      previewSpritesRef.current = [];
      // Remove any old outline children (children that aren't sprites we tracked).
      for (const child of container.removeChildren()) {
        child.destroy();
      }

      const tw = state.json.tilewidth;
      const th = state.json.tileheight;

      // ----- tile selection highlight (wand / sameTile) ------------------
      // Drawn first so it sits UNDER the cursor preview, and rendered
      // independently of hover so it stays visible after the cursor leaves
      // the canvas. Yellow tint per cell.
      const sel = tileSelectionRef.current;
      if (sel.size > 0) {
        const w = state.json.width;
        const g = new PIXI.Graphics();
        for (const idx of sel) {
          const x = idx % w;
          const y = (idx / w) | 0;
          g.rect(x * tw, y * th, tw, th);
        }
        g.fill({ color: 0xffd000, alpha: 0.28 });
        container.addChild(g);
      }

      // ----- live drag preview (multi-cell-match wand / fill / sameTile) --
      // While the left mouse is held, render the growing region. Wand /
      // sameTile drag in cyan (distinct from the committed selection so
      // Add / Subtract modes read clearly); fill drag renders ghost brush
      // sprites at each region cell to show what would be painted.
      const drag = tileDragRef.current;
      if (drag && !drag.cancelled && drag.region.size > 0) {
        const mapW = state.json.width;
        if (drag.tool === 'fill') {
          const previewBrush = selectedBrushRef.current;
          if (previewBrush && previewBrush.cells.some((c) => c)) {
            // Mirror commitFillDrag: tile the brush across the region's
            // bounding rect, anchored at bbox top-left. So a 2x2 pattern
            // wallpapers across the fill area in the preview AND in the
            // committed paint.
            let pMinX = state.json.width, pMinY = state.json.height, pMaxX = -1, pMaxY = -1;
            for (const idx of drag.region) {
              const x = idx % mapW;
              const y = (idx / mapW) | 0;
              if (x < pMinX) pMinX = x; if (x > pMaxX) pMaxX = x;
              if (y < pMinY) pMinY = y; if (y > pMaxY) pMaxY = y;
            }
            for (const idx of drag.region) {
              const cx = idx % mapW;
              const cy = (idx / mapW) | 0;
              const bx = ((cx - pMinX) % previewBrush.width + previewBrush.width) % previewBrush.width;
              const by = ((cy - pMinY) % previewBrush.height + previewBrush.height) % previewBrush.height;
              const cell = previewBrush.cells[by * previewBrush.width + bx];
              if (!cell) continue;
              const ts = state.tilesets[cell.tilesetIndex];
              if (!ts?.bitmap) continue;
              const cache = tilesetCachesRef.current.get(cell.tilesetIndex);
              if (!cache) continue;
              const s = new PIXI.Sprite(sliceTileTexture(cache, ts, cell.tileId));
              s.alpha = 0.7;
              const fH = !!cell.flipH, fV = !!cell.flipV, fD = !!cell.flipD;
              if (fH || fV || fD) {
                s.anchor.set(0.5, 0.5);
                s.x = cx * tw + tw / 2;
                s.y = cy * th + th / 2;
                if (fD) {
                  s.rotation = Math.PI / 2;
                  s.scale.set(fV ? -1 : 1, fH ? 1 : -1);
                } else {
                  s.scale.set(fH ? -1 : 1, fV ? -1 : 1);
                }
              } else {
                s.anchor.set(0, 1);
                s.x = cx * tw;
                s.y = (cy + 1) * th;
              }
              container.addChild(s);
              previewSpritesRef.current.push(s);
            }
          } else {
            const g = new PIXI.Graphics();
            for (const idx of drag.region) {
              const x = idx % mapW;
              const y = (idx / mapW) | 0;
              g.rect(x * tw, y * th, tw, th);
            }
            g.fill({ color: 0x4af0ff, alpha: 0.32 });
            container.addChild(g);
          }
        } else {
          // Wand / Same-Tile drag preview — cyan tint so it stands apart
          // from the already-committed yellow selection underneath.
          const g = new PIXI.Graphics();
          for (const idx of drag.region) {
            const x = idx % mapW;
            const y = (idx / mapW) | 0;
            g.rect(x * tw, y * th, tw, th);
          }
          g.fill({ color: 0x4af0ff, alpha: 0.32 });
          container.addChild(g);
        }
      }

      // Shape-fill drag preview: render the brush at every cell that
      // will be painted (with ellipse mask + brush tiling, mirroring the
      // paintShape logic). Lives here in previewGfxRef so we get actual
      // tile sprites at zoom-quality — the selectionGfxRef Graphics layer
      // just draws the outline silhouette on top.
      const shapeRect = selectionRectRef.current;
      const isShapeDrag = shapeRect && selectingRef.current
        && selectionButtonRef.current === 0
        && (toolRef.current === 'rect' || toolRef.current === 'ellipse');
      if (isShapeDrag && selectedBrushRef.current) {
        const shapeBrush = selectedBrushRef.current;
        const isEllipse = toolRef.current === 'ellipse';
        const minX = Math.min(shapeRect.sx, shapeRect.ex);
        const maxX = Math.max(shapeRect.sx, shapeRect.ex);
        const minY = Math.min(shapeRect.sy, shapeRect.ey);
        const maxY = Math.max(shapeRect.sy, shapeRect.ey);
        const rw = maxX - minX + 1;
        const rh = maxY - minY + 1;
        const ecx = (minX + maxX + 1) / 2;
        const ecy = (minY + maxY + 1) / 2;
        const erx = rw / 2;
        const ery = rh / 2;
        const inEllipse = (ix: number, iy: number) => {
          if (erx <= 0 || ery <= 0) return true;
          const ddx = (ix + 0.5 - ecx) / erx;
          const ddy = (iy + 0.5 - ecy) / ery;
          return ddx * ddx + ddy * ddy <= 1;
        };
        // Hard cap on ghost sprite count to keep huge drags responsive.
        // Above the cap we fall back to the outline-only path (the
        // selection overlay still draws it).
        const SHAPE_GHOST_CAP = 4000;
        let drawn = 0;
        for (let py = minY; py <= maxY && drawn < SHAPE_GHOST_CAP; py++) {
          for (let px = minX; px <= maxX && drawn < SHAPE_GHOST_CAP; px++) {
            if (isEllipse && !inEllipse(px, py)) continue;
            if (px < 0 || py < 0 || px >= state.json.width || py >= state.json.height) continue;
            const bx = ((px - minX) % shapeBrush.width + shapeBrush.width) % shapeBrush.width;
            const by = ((py - minY) % shapeBrush.height + shapeBrush.height) % shapeBrush.height;
            const cell = shapeBrush.cells[by * shapeBrush.width + bx];
            if (!cell) continue;
            const ts = state.tilesets[cell.tilesetIndex];
            if (!ts?.bitmap) continue;
            const cache = tilesetCachesRef.current.get(cell.tilesetIndex);
            if (!cache) continue;
            const sprite = new PIXI.Sprite(sliceTileTexture(cache, ts, cell.tileId));
            sprite.alpha = 0.6;
            const fH = !!cell.flipH, fV = !!cell.flipV, fD = !!cell.flipD;
            if (fH || fV || fD) {
              sprite.anchor.set(0.5, 0.5);
              sprite.x = px * tw + tw / 2;
              sprite.y = py * th + th / 2;
              if (fD) {
                // Match the cell-renderer's Tiled-source-derived transform.
                sprite.rotation = Math.PI / 2;
                sprite.scale.set(fV ? -1 : 1, fH ? 1 : -1);
              } else {
                sprite.scale.set(fH ? -1 : 1, fV ? -1 : 1);
              }
            } else {
              sprite.anchor.set(0, 1);
              sprite.x = px * tw;
              sprite.y = (py + 1) * th;
            }
            container.addChild(sprite);
            previewSpritesRef.current.push(sprite);
            drawn++;
          }
        }
        return;
      }

      const hover = hoverCellRef.current;
      if (!hover || selectingRef.current) return;

      // Fill-preview-on-Shift: when the user holds Shift with the Fill
      // tool active, highlight every cell flood-fill would replace under
      // the cursor. Saves them from accidentally bucket-filling a huge
      // contiguous area. Recomputed per hover-cell change (the per-cell
      // closure result is cheap to throw away).
      if (toolRef.current === 'fill' && shiftHeldRef.current) {
        const fillLayer = state.json.layers[activeLayerRef.current];
        if (fillLayer && fillLayer.type === 'tilelayer') {
          const mapW = state.json.width;
          const mapH = state.json.height;
          const target = readCellRaw(fillLayer, hover.tx, hover.ty) & GID_MASK;
          // Bounded BFS — cap at 50k cells so an accidental hover over a
          // huge empty region doesn't lock the renderer. The user can
          // still execute the fill; the preview just stops drawing past
          // the cap. Almost no real map hits this in practice.
          const FILL_PREVIEW_CAP = 50000;
          const visited = new Uint8Array(mapW * mapH);
          const matched: number[] = [];
          const queue: number[] = [hover.ty * mapW + hover.tx];
          while (queue.length > 0 && matched.length < FILL_PREVIEW_CAP) {
            const idx = queue.shift()!;
            if (visited[idx]) continue;
            visited[idx] = 1;
            const x = idx % mapW;
            const y = (idx / mapW) | 0;
            if (fillLayer.width && fillLayer.height && (x >= fillLayer.width || y >= fillLayer.height)) continue;
            if ((readCellRaw(fillLayer, x, y) & GID_MASK) !== target) continue;
            matched.push(idx);
            if (x + 1 < mapW) queue.push(idx + 1);
            if (x > 0) queue.push(idx - 1);
            if (y + 1 < mapH) queue.push(idx + mapW);
            if (y > 0) queue.push(idx - mapW);
          }
          if (matched.length > 0) {
            // Render a translucent ghost of the brush's fill tile at every
            // cell that would be replaced — so the user sees the actual
            // result of the flood-fill, not just the affected region. Falls
            // back to a cyan tint when no brush is active (or no resolvable
            // bitmap) so the preview still communicates the area.
            const previewBrush = selectedBrushRef.current;
            const fillSrc = previewBrush?.cells.find((c) => c) ?? null;
            const fillTs = fillSrc ? state.tilesets[fillSrc.tilesetIndex] : null;
            const fillCache = fillSrc ? tilesetCachesRef.current.get(fillSrc.tilesetIndex) : null;
            const canDrawSprites = fillSrc && fillTs?.bitmap && fillCache;
            if (canDrawSprites) {
              const fH = !!fillSrc.flipH, fV = !!fillSrc.flipV, fD = !!fillSrc.flipD;
              for (const idx of matched) {
                const x = idx % mapW;
                const y = (idx / mapW) | 0;
                const fSprite = new PIXI.Sprite(sliceTileTexture(fillCache, fillTs, fillSrc.tileId));
                fSprite.alpha = 0.6;
                if (fH || fV || fD) {
                  fSprite.anchor.set(0.5, 0.5);
                  fSprite.x = x * tw + tw / 2;
                  fSprite.y = y * th + th / 2;
                  if (fD) {
                    fSprite.rotation = Math.PI / 2;
                    fSprite.scale.set(fV ? -1 : 1, fH ? 1 : -1);
                  } else {
                    fSprite.scale.set(fH ? -1 : 1, fV ? -1 : 1);
                  }
                } else {
                  fSprite.anchor.set(0, 1);
                  fSprite.x = x * tw;
                  fSprite.y = (y + 1) * th;
                }
                container.addChild(fSprite);
                previewSpritesRef.current.push(fSprite);
              }
            } else {
              const fpg = new PIXI.Graphics();
              for (const idx of matched) {
                const x = idx % mapW;
                const y = (idx / mapW) | 0;
                fpg.rect(x * tw, y * th, tw, th);
              }
              fpg.fill({ color: 0x4af0ff, alpha: 0.32 });
              container.addChild(fpg);
            }
          }
        }
        // Still draw the cursor ghost on top so the user knows where
        // the click anchor is. Fall through to the brush-ghost path below.
      }

      if (toolRef.current === 'erase') {
        const gfx = new PIXI.Graphics();
        gfx.rect(hover.tx * tw, hover.ty * th, tw, th).fill({ color: 0xff4040, alpha: 0.18 });
        gfx.rect(hover.tx * tw + 1, hover.ty * th + 1, tw - 2, th - 2).stroke({ color: 0xff4040, width: 2 });
        container.addChild(gfx);
        return;
      }

      const brush = selectedBrushRef.current;
      // Empty cursor — no brush selected, OR every cell across the active
      // grid AND every extraLayer is null. Multi-layer brushes can have an
      // empty active grid but populated extras (e.g. picking from a region
      // where the active layer is blank), so we must check extras too —
      // otherwise we'd render the placeholder hollow outline and miss the
      // ghost preview the user actually wants.
      const anyFilled = brush && (
        brush.cells.some((c) => c !== null)
        || (brush.extraLayers?.some((l) => l.cells.some((c) => c !== null)) ?? false)
      );
      if (!brush || !anyFilled) {
        const gfx = new PIXI.Graphics();
        gfx.rect(hover.tx * tw + 1, hover.ty * th + 1, tw - 2, th - 2)
          .stroke({ color: 0xffffff, width: 2, alpha: 0.55 });
        container.addChild(gfx);
        return;
      }
      // Ghost: translucent sprites for every non-null cell across the
      // active grid AND all extraLayers. Multi-layer brushes (Ctrl-pick
      // across layers, or Shift right-drag) carry a per-layer-offset
      // payload — without rendering it here the preview only shows the
      // active layer and the user can't tell extras were captured.
      const drawGhostGrid = (cells: (BrushCell | null)[]) => {
        for (let py = 0; py < brush.height; py++) {
          for (let px = 0; px < brush.width; px++) {
            const cell = cells[py * brush.width + px];
            if (!cell) continue;
            const ts = state.tilesets[cell.tilesetIndex];
            if (!ts?.bitmap) continue;
            const cache = tilesetCachesRef.current.get(cell.tilesetIndex);
            if (!cache) continue;
            const dxx = hover.tx + px;
            const dyy = hover.ty + py;
            if (dxx < 0 || dyy < 0 || dxx >= state.json.width || dyy >= state.json.height) continue;
            const sprite = new PIXI.Sprite(sliceTileTexture(cache, ts, cell.tileId));
            sprite.alpha = 0.55;
            // Apply flip/rotation bits so the preview matches the paint.
            // Same transform as the actual cell renderer (syncSpriteAt).
            const flipH = !!cell.flipH;
            const flipV = !!cell.flipV;
            const flipD = !!cell.flipD;
            if (flipH || flipV || flipD) {
              sprite.anchor.set(0.5, 0.5);
              sprite.x = dxx * tw + tw / 2;
              sprite.y = dyy * th + th / 2;
              if (flipD) {
                // Match the cell-renderer's Tiled-source-derived transform.
                sprite.rotation = Math.PI / 2;
                sprite.scale.set(flipV ? -1 : 1, flipH ? 1 : -1);
              } else {
                sprite.scale.set(flipH ? -1 : 1, flipV ? -1 : 1);
              }
            } else {
              sprite.anchor.set(0, 1);
              sprite.x = dxx * tw;
              sprite.y = (dyy + 1) * th;
            }
            container.addChild(sprite);
            previewSpritesRef.current.push(sprite);
          }
        }
      };
      // Render bottom-to-top so higher-offset layers stack on top, matching
      // the order they'll paint in.
      const sortedExtras = brush.extraLayers
        ? [...brush.extraLayers].sort((a, b) => a.layerOffset - b.layerOffset)
        : [];
      for (const extra of sortedExtras) if (extra.layerOffset < 0) drawGhostGrid(extra.cells);
      drawGhostGrid(brush.cells);
      for (const extra of sortedExtras) if (extra.layerOffset > 0) drawGhostGrid(extra.cells);

      // Footprint outline — hugs the UNION of filled cells across the active
      // grid + every extra layer, so the user sees the actual region that
      // will be painted (not just the active layer's contribution).
      const filledMask = new Uint8Array(brush.width * brush.height);
      const markFilled = (cells: (BrushCell | null)[]) => {
        for (let i = 0; i < cells.length; i++) if (cells[i]) filledMask[i] = 1;
      };
      markFilled(brush.cells);
      for (const extra of sortedExtras) markFilled(extra.cells);
      const outline = new PIXI.Graphics();
      const isFilled = (lx: number, ly: number) =>
        lx >= 0 && ly >= 0 && lx < brush.width && ly < brush.height && filledMask[ly * brush.width + lx] === 1;
      const ox = hover.tx * tw;
      const oy = hover.ty * th;
      for (let ly = 0; ly < brush.height; ly++) {
        for (let lx = 0; lx < brush.width; lx++) {
          if (!isFilled(lx, ly)) continue;
          const left = ox + lx * tw;
          const top = oy + ly * th;
          const right = left + tw;
          const bottom = top + th;
          if (!isFilled(lx, ly - 1)) { outline.moveTo(left, top).lineTo(right, top); }
          if (!isFilled(lx + 1, ly)) { outline.moveTo(right, top).lineTo(right, bottom); }
          if (!isFilled(lx, ly + 1)) { outline.moveTo(left, bottom).lineTo(right, bottom); }
          if (!isFilled(lx - 1, ly)) { outline.moveTo(left, top).lineTo(left, bottom); }
        }
      }
      outline.stroke({ color: 0xffd000, width: 2 });
      container.addChild(outline);
    }, []);

    // ----- mouse routing ---------------------------------------------------

    const onCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      // Pan path takes priority.
      if (e.button === 1 || (e.button === 0 && spaceHeldRef.current)) {
        e.preventDefault();
        const host = scrollHostRef.current;
        if (!host) return;
        panningRef.current = true;
        panOriginRef.current = {
          clientX: e.clientX, clientY: e.clientY,
          scrollLeft: host.scrollLeft, scrollTop: host.scrollTop,
        };
        return;
      }
      const pos = eventToTile(e);
      if (!pos) return;
      if (e.button === 0) {
        const t = toolRef.current;
        if (t === 'fill' || t === 'wand' || t === 'sameTile') {
          // Tiled-style multi-cell-match drag: mousedown seeds the match
          // list with the clicked cell; drag adds more; release commits.
          // Wand/sameTile commit to the selection (Shift=add, Ctrl=sub,
          // none=replace). Fill paints the brush across the region on
          // release. Right-click or Esc during the drag cancels.
          const mode = selectionModeFromEvent({ shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey });
          startTileDrag(t, pos.tx, pos.ty, mode);
          return;
        }
        if (t === 'rect' || t === 'ellipse') {
          // Same selection-rect machinery as right-drag pick, but flagged
          // as a LEFT-button drag so mouseup branches to paintShape rather
          // than the pick/erase paths.
          selectingRef.current = true;
          selectionButtonRef.current = 0;
          selectionAnchorRef.current = pos;
          selectionShiftRef.current = false;
          setSelectionRect({ sx: pos.tx, sy: pos.ty, ex: pos.tx, ey: pos.ty });
          return;
        }
        if (t === 'select') {
          // Rectangular tile select. Capture the modifier mode NOW so the
          // user can release the modifier mid-drag (Tiled-parity). On
          // release: applies the rect to tileSelectionRef. Single click
          // (no drag, empty rect → ex===sx && ey===sy AND mode==='replace')
          // clears the selection — handled in the mouseup branch.
          selectingRef.current = true;
          selectionButtonRef.current = 0;
          selectionAnchorRef.current = pos;
          selectionShiftRef.current = false;
          selectionRectModeRef.current = selectionModeFromEvent({
            shiftKey: e.shiftKey, ctrlKey: e.ctrlKey, metaKey: e.metaKey,
          });
          setSelectionRect({ sx: pos.tx, sy: pos.ty, ex: pos.tx, ey: pos.ty });
          return;
        }
        // stamp / erase: per-cell paint with drag interpolation.
        paintingRef.current = true;
        paintBatchRef.current = [];
        // Give the parent a chance to do last-minute structural work
        // (e.g. auto-add tilesets a stamp brush is missing). When it
        // returns a Promise we defer the first paint until it resolves,
        // and the drag-paint move handler skips strokes via paintReadyRef
        // so we don't lay down null cells against not-yet-loaded tilesets.
        const ensure = onBeforePaintRef.current?.();
        if (ensure && typeof (ensure as Promise<void>).then === 'function') {
          paintReadyRef.current = false;
          (ensure as Promise<void>).then(() => {
            paintReadyRef.current = true;
            if (!paintingRef.current) return; // mouse already released
            const latest = hoverCellRef.current ?? pos;
            paintAt(latest.tx, latest.ty);
            lastPaintedRef.current = latest;
          }).catch(() => {
            paintReadyRef.current = true;
          });
        } else {
          paintAt(pos.tx, pos.ty);
          lastPaintedRef.current = pos;
        }
      } else if (e.button === 2) {
        // Right-click during an active wand/fill drag CANCELS the drag —
        // mirrors Tiled's behavior (lets the user back out of a fill that
        // grew too far without releasing onto the bad region).
        if (tileDragRef.current) {
          cancelTileDrag();
          return;
        }
        // Ctrl/Cmd + right-click = jump-to-layer only (no pick, no selection start).
        if (e.ctrlKey || e.metaKey) {
          const hit = topVisibleAt(pos.tx, pos.ty);
          if (hit) onJumpToLayerRef.current?.(hit.layerIdx);
          return;
        }
        // Tiled-parity: right-click on the rectangular select tool clears
        // the tile selection (instead of starting a pick rect, which is
        // useless when you don't want a brush). Other tools keep the
        // right-drag-pick behavior unchanged.
        if (toolRef.current === 'select') {
          clearTileSelection();
          return;
        }
        selectingRef.current = true;
        selectionButtonRef.current = 2;
        selectionAnchorRef.current = pos;
        // Snapshot Shift state at mousedown — Shift may be released
        // before mouseup, so we can't read it from the up event.
        selectionShiftRef.current = e.shiftKey;
        setSelectionRect({ sx: pos.tx, sy: pos.ty, ex: pos.tx, ey: pos.ty });
      }
    }, [eventToTile, paintAt, topVisibleAt, startTileDrag, cancelTileDrag, clearTileSelection]);

    const onContextMenu = useCallback((e: React.MouseEvent) => { e.preventDefault(); }, []);

    // Tracks whether the cursor is currently over the canvas DOM element.
    // The window-level mousemove handler reads this so it doesn't keep
    // updating "hovered tile" when the user moves over the toolbar / a
    // sidebar / outside the window entirely — eventToTile alone isn't
    // enough because the canvas can be scrolled such that a non-canvas
    // element sits over what would otherwise be a valid tile coord.
    const isOverCanvasRef = useRef(false);
    const onCanvasMouseEnter = useCallback(() => {
      isOverCanvasRef.current = true;
    }, []);
    const onCanvasMouseLeave = useCallback(() => {
      isOverCanvasRef.current = false;
      if (hoverCellRef.current !== null) {
        hoverCellRef.current = null;
        onHoverCellRef.current?.(null);
        redrawPreviewOverlay();
      }
    }, [redrawPreviewOverlay]);

    // Window-level mousemove / mouseup for drag continuity.
    useEffect(() => {
      const onMouseMove = (e: MouseEvent) => {
        // Pan: rAF-batched scroll updates.
        if (panningRef.current && panOriginRef.current && scrollHostRef.current) {
          const prev = panPendingRef.current;
          if (prev && prev.clientX === e.clientX && prev.clientY === e.clientY) return;
          panPendingRef.current = { clientX: e.clientX, clientY: e.clientY };
          if (panRafRef.current === null) {
            panRafRef.current = requestAnimationFrame(() => {
              panRafRef.current = null;
              const p = panPendingRef.current;
              const o = panOriginRef.current;
              const host = scrollHostRef.current;
              if (p && o && host) {
                host.scrollLeft = o.scrollLeft - (p.clientX - o.clientX);
                host.scrollTop = o.scrollTop - (p.clientY - o.clientY);
              }
            });
          }
          return;
        }

        // Suppress hover updates while a drag is in progress (the drag
        // handlers below still get the event for paint/select continuity),
        // and suppress them entirely while the cursor isn't over the
        // canvas — otherwise the HUD's "hovered tile" gets stuck on a
        // stale position when the user moves into the toolbar/sidebar.
        const overCanvas = isOverCanvasRef.current;
        const pos = overCanvas ? eventToTile(e) : null;
        const prev = hoverCellRef.current;
        const cellChanged = (pos?.tx !== prev?.tx) || (pos?.ty !== prev?.ty);
        if (cellChanged) {
          hoverCellRef.current = pos;
          onHoverCellRef.current?.(pos ? { x: pos.tx, y: pos.ty } : null);
          // Tiled-style multi-cell-match drag: extend the match list with
          // every new cell the cursor visits. Triggers a region recompute
          // (cheap until the user crosses into a brand-new tile identity)
          // and the preview redraw below shows the expanded result.
          if (tileDragRef.current && pos) updateTileDrag(pos.tx, pos.ty);
          // Redraw the preview ghost on EVERY cell change, including
          // mid-paint-drag, so the brush silhouette tracks the cursor.
          redrawPreviewOverlay();
        }

        if (paintingRef.current && paintReadyRef.current) {
          if (!pos) return;
          const last = lastPaintedRef.current;
          if (last && last.tx === pos.tx && last.ty === pos.ty) return;
          if (last) {
            for (const step of lineBetween(last.tx, last.ty, pos.tx, pos.ty)) {
              if (step.x === last.tx && step.y === last.ty) continue;
              paintAt(step.x, step.y);
            }
          } else {
            paintAt(pos.tx, pos.ty);
          }
          lastPaintedRef.current = pos;
          return;
        }
        if (selectingRef.current && selectionAnchorRef.current) {
          if (!pos) return;
          const a = selectionAnchorRef.current;
          setSelectionRect({
            sx: Math.min(a.tx, pos.tx),
            sy: Math.min(a.ty, pos.ty),
            ex: Math.max(a.tx, pos.tx),
            ey: Math.max(a.ty, pos.ty),
          });
        }
      };

      const onMouseUp = () => {
        if (panningRef.current) {
          panningRef.current = false;
          panOriginRef.current = null;
          panPendingRef.current = null;
          if (panRafRef.current !== null) {
            cancelAnimationFrame(panRafRef.current);
            panRafRef.current = null;
          }
        }
        // Commit any open tile drag (wand/sameTile → selection update,
        // fill → paint application). endTileDrag handles cancellation
        // and clears the in-flight state.
        if (tileDragRef.current) {
          endTileDrag();
        }
        if (paintingRef.current) {
          paintingRef.current = false;
          lastPaintedRef.current = null;
          if (paintBatchRef.current.length > 0) {
            commitBatch(paintBatchRef.current);
            paintBatchRef.current = [];
          } else {
            // No cells were committed (e.g. brush is all-null from a
            // stamp whose tilesets couldn't be resolved). Still notify
            // the parent so it can finalize any pre-paint structural
            // snapshot that was waiting on stroke end.
            onPaintCommitRef.current?.([]);
          }
        }
        if (selectingRef.current) {
          selectingRef.current = false;
          selectionAnchorRef.current = null;
          const wasLeftDrag = selectionButtonRef.current === 0;
          setSelectionRect((rect) => {
            if (!rect) return null;
            // Left-button drag → shape fill (the tool decides rect vs.
            // ellipse). Right-button drag → existing pick / erase-rect.
            if (wasLeftDrag) {
              if (toolRef.current === 'rect') paintShape(rect.sx, rect.sy, rect.ex, rect.ey, 'rect');
              else if (toolRef.current === 'ellipse') paintShape(rect.sx, rect.sy, rect.ex, rect.ey, 'ellipse');
              else if (toolRef.current === 'select') {
                const isClick = rect.sx === rect.ex && rect.sy === rect.ey;
                const mode = selectionRectModeRef.current;
                // Tiled: a single click (no drag) with no modifier clears
                // the selection. With a modifier it acts as a 1-cell op.
                if (isClick && mode === 'replace') {
                  clearTileSelection();
                } else {
                  commitRectSelection(rect.sx, rect.sy, rect.ex, rect.ey, mode);
                }
              }
              return null;
            }
            if (toolRef.current === 'erase') {
              eraseRect(rect.sx, rect.sy, rect.ex, rect.ey);
              return null;
            }
            const state = loadedRef.current;
            const activeIdx = activeLayerRef.current;
            const layer = state?.json.layers[activeIdx];
            if (!state || !layer || layer.type !== 'tilelayer') return null;
            const w = rect.ex - rect.sx + 1;
            const h = rect.ey - rect.sy + 1;
            const buildCellsForLayer = (li: number): (BrushCell | null)[] => {
              const cs: (BrushCell | null)[] = [];
              const layerN = state.json.layers[li];
              for (let py = 0; py < h; py++) {
                for (let px = 0; px < w; px++) {
                  const cx = rect.sx + px;
                  const cy = rect.sy + py;
                  const raw = readCellRaw(layerN, cx, cy);
                  if (!raw) { cs.push(null); continue; }
                  const gid = raw & GID_MASK;
                  const ts = findTilesetForGid(state.tilesets, gid);
                  if (!ts) { cs.push(null); continue; }
                  const tsIdx = state.tilesets.indexOf(ts);
                  // Capture flip/rotation bits so picking a previously-
                  // flipped tile reproduces its orientation in the brush.
                  const cell: BrushCell = { tilesetIndex: tsIdx, tileId: gid - ts.firstgid };
                  if ((raw & FLIPPED_HORIZONTALLY) !== 0) cell.flipH = true;
                  if ((raw & FLIPPED_VERTICALLY)   !== 0) cell.flipV = true;
                  if ((raw & FLIPPED_DIAGONALLY)   !== 0) cell.flipD = true;
                  cs.push(cell);
                }
              }
              return cs;
            };
            const cells = buildCellsForLayer(activeIdx);
            // Multi-layer pick — two triggers:
            //   1) Ctrl+click in LayerList → selectedLayers contains > 1
            //   2) Shift held at mousedown → all visible tile layers
            // Shift is the quick override; Ctrl+click is persistent.
            const selSet = new Set(selectedLayersRef.current);
            const useShift = selectionShiftRef.current;
            let extraLayers: BrushLayer[] | undefined;
            if (selSet.size > 1 || useShift) {
              extraLayers = [];
              for (let li = 0; li < state.json.layers.length; li++) {
                if (li === activeIdx) continue;
                const ln = state.json.layers[li];
                if (ln.type !== 'tilelayer') continue;
                const include = useShift
                  ? (li in visibilityRef.current ? visibilityRef.current[li] : ln.visible)
                  : selSet.has(li);
                if (!include) continue;
                const cs = buildCellsForLayer(li);
                if (cs.every((c) => c === null)) continue;
                extraLayers.push({ layerOffset: li - activeIdx, cells: cs });
              }
              if (extraLayers.length === 0) extraLayers = undefined;
            }
            onPickBrushRef.current?.({ width: w, height: h, cells, extraLayers });
            return null;
          });
        }
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }, [eventToTile, paintAt, topVisibleAt, commitBatch, eraseRect, redrawPreviewOverlay, paintShape, updateTileDrag, endTileDrag, commitRectSelection, clearTileSelection]);

    // Spacebar pan-mode + suppress page scroll.
    useEffect(() => {
      const isField = (el: EventTarget | null) => {
        const t = el as HTMLElement | null;
        return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      };
      const onDown = (e: KeyboardEvent) => {
        if (isField(e.target)) return;
        if (e.code === 'Space') {
          e.preventDefault();
          if (!e.repeat) {
            spaceHeldRef.current = true;
            const el = scrollHostRef.current;
            if (el) el.style.cursor = 'grab';
          }
          return;
        }
        if (e.key === 'Shift' && !shiftHeldRef.current) {
          shiftHeldRef.current = true;
          // Bump so the preview overlay re-runs and computes the
          // flood-fill ghost (only meaningful when Fill tool is active).
          if (toolRef.current === 'fill') setShiftHeldTick((n) => n + 1);
        }
      };
      const onUp = (e: KeyboardEvent) => {
        if (isField(e.target)) return;
        if (e.code === 'Space') {
          e.preventDefault();
          spaceHeldRef.current = false;
          const el = scrollHostRef.current;
          if (el) el.style.cursor = '';
          return;
        }
        if (e.key === 'Shift' && shiftHeldRef.current) {
          shiftHeldRef.current = false;
          if (toolRef.current === 'fill') setShiftHeldTick((n) => n + 1);
        }
      };
      window.addEventListener('keydown', onDown);
      window.addEventListener('keyup', onUp);
      return () => {
        window.removeEventListener('keydown', onDown);
        window.removeEventListener('keyup', onUp);
      };
    }, []);

    // Delete erases the current tile selection (built by Wand / Same Tile);
    // Esc clears it without erasing. Both ignored while a text field has
    // focus so the inline rename inputs aren't intercepted.
    useEffect(() => {
      const isField = (el: EventTarget | null) => {
        const t = el as HTMLElement | null;
        return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
      };
      const onKey = (e: KeyboardEvent) => {
        if (isField(e.target)) return;
        // Esc cancels an in-flight wand/fill drag even when no selection
        // exists yet — Tiled-style. Don't gate this behind the selection-
        // exists check below.
        if (e.key === 'Escape' && tileDragRef.current) {
          e.preventDefault();
          cancelTileDrag();
          return;
        }
        if (tileSelectionRef.current.size === 0) return;
        // Ctrl/Cmd modifies the meaning: C = copy selection cells into
        // brush; X = same + erase. Without modifier: Delete/Esc as before.
        const mod = e.ctrlKey || e.metaKey;
        const key = e.key.toLowerCase();
        if (mod && key === 'c') {
          e.preventDefault();
          copyTileSelectionToBrush();
        } else if (mod && key === 'x') {
          e.preventDefault();
          if (copyTileSelectionToBrush()) eraseTileSelection();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          eraseTileSelection();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          clearTileSelection();
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, [eraseTileSelection, clearTileSelection, copyTileSelectionToBrush, cancelTileDrag]);

    // Switching to a non-selection tool drops the tile selection — keeps
    // the highlight from sticking around after the user moves on. Also
    // cancels any in-flight wand/fill/sameTile drag so its preview clears.
    useEffect(() => {
      if (tool !== 'wand' && tool !== 'sameTile') clearTileSelection();
      if (tileDragRef.current) cancelTileDrag();
    }, [tool, clearTileSelection, cancelTileDrag]);

    // Ctrl+wheel zoom anchored at cursor (same math as Canvas2D).
    const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
      if (panningRef.current) return;
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const host = scrollHostRef.current;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;
      const oldZoom = zoomRef.current;
      const worldX = (host.scrollLeft + cursorX) / oldZoom;
      const worldY = (host.scrollTop + cursorY) / oldZoom;
      const idx = ZOOM_STEPS.findIndex((z) => Math.abs(z - oldZoom) < 0.001);
      const safe = idx === -1 ? ZOOM_STEPS.indexOf(DEFAULT_ZOOM) : idx;
      const next = e.deltaY < 0
        ? Math.min(ZOOM_STEPS.length - 1, safe + 1)
        : Math.max(0, safe - 1);
      const newZoom = ZOOM_STEPS[next];
      if (newZoom === oldZoom) return;
      onZoomChangeRef.current?.(newZoom);
      requestAnimationFrame(() => {
        const h = scrollHostRef.current;
        if (!h) return;
        h.scrollLeft = worldX * newZoom - cursorX;
        h.scrollTop = worldY * newZoom - cursorY;
      });
    }, []);

    // ----- Pixi Application init + teardown --------------------------------

    useEffect(() => {
      let cancelled = false;
      let createdApp: PIXI.Application | null = null;

      (async () => {
        const host = hostRef.current;
        if (!host) return;
        const app = new PIXI.Application();
        await app.init({
          backgroundAlpha: 0,
          antialias: false,
          autoDensity: true,
          resolution: window.devicePixelRatio || 1,
          width: 1, height: 1,
        });
        if (cancelled) {
          app.destroy(true, { children: true });
          return;
        }
        createdApp = app;
        appRef.current = app;
        host.appendChild(app.canvas);
        app.canvas.style.imageRendering = 'pixelated';

        // Scene graph: root (layers) under stage, overlay above.
        const root = new PIXI.Container();
        root.label = 'mapRoot';
        app.stage.addChild(root);
        rootRef.current = root;

        const overlay = new PIXI.Container();
        overlay.label = 'overlay';
        app.stage.addChild(overlay);
        overlayRef.current = overlay;

        const grid = new PIXI.Graphics();
        grid.label = 'grid';
        overlay.addChild(grid);
        gridGfxRef.current = grid;

        const selection = new PIXI.Graphics();
        selection.label = 'selection';
        overlay.addChild(selection);
        selectionGfxRef.current = selection;

        const preview = new PIXI.Container();
        preview.label = 'preview';
        overlay.addChild(preview);
        previewGfxRef.current = preview;

        // Animation ticker.
        app.ticker.add((ticker) => {
          const dt = ticker.deltaMS;
          const sprites = animSpritesRef.current;
          if (sprites.length === 0) return;
          globalElapsedRef.current += dt;
          const t = globalElapsedRef.current;
          for (const a of sprites) {
            if (a.total <= 0) continue;
            const cyc = t % a.total;
            let acc = 0;
            let nextFrame = 0;
            for (let i = 0; i < a.durations.length; i++) {
              acc += a.durations[i];
              if (cyc < acc) { nextFrame = i; break; }
            }
            if (nextFrame !== a.shownFrame) {
              a.shownFrame = nextFrame;
              a.sprite.texture = sliceTileTexture(a.cache, a.ts, a.frameTileIds[nextFrame]);
            }
          }
        });
      })();

      return () => {
        cancelled = true;
        if (createdApp) {
          try { createdApp.destroy(true, { children: true, texture: true }); } catch { /* ignored */ }
        }
        appRef.current = null;
        rootRef.current = null;
        overlayRef.current = null;
        gridGfxRef.current = null;
        selectionGfxRef.current = null;
        previewGfxRef.current = null;
        layerContainersRef.current.clear();
        tilesetCachesRef.current.clear();
        spritesRef.current.clear();
        animSpritesRef.current = [];
      };
    }, []);

    // ----- Load map + build scene graph ------------------------------------

    useEffect(() => {
      let cancelled = false;
      let openedMap: TiledMap | null = null;
      const ownedBitmaps: ImageBitmap[] = [];

      (async () => {
        try {
          setError(null);
          setStatus('Reading map + assets from disk…');
          // Wait for Pixi app to be ready (init is async).
          for (let i = 0; i < 50 && !appRef.current; i++) {
            await new Promise((r) => setTimeout(r, 50));
          }
          if (cancelled || !appRef.current || !rootRef.current) return;

          const bundle = await readBundle(projectPath, tiledFilename);
          if (cancelled) return;

          setStatus('Parsing map in wasm…');
          openedMap = await TiledModule.openMapWithAssets(
            bundle.map, [...bundle.tilesets, ...bundle.images],
          );
          if (cancelled) return;

          setStatus('Decoding tilesets…');
          const rawMap = openedMap.toJson() as TmjMap;

          // Override bridge-supplied layer data with values parsed directly
          // from the .tmx XML. The bridge's JSON exporter recomputes per-
          // tileset firstgids from `nextTileId()`, which silently shifts
          // every cell pointing at later tilesets when a .tsx has shrunk
          // since the .tmx was authored. The XML carries the authoritative
          // file-firstgid gids — using them keeps cells aligned with the
          // tileset metadata the bridge still reports correctly.
          try {
            // Diagnostic: confirm we're reading the on-disk .tmx by dumping
            // the file header. If this doesn't match what's on disk, the
            // bundle pipeline is handing us stale/transformed bytes — and
            // the firstgid mismatch is a side-effect of that.
            try {
              const text = new TextDecoder('utf-8').decode(bundle.map.bytes.slice(0, 1200));
              console.log('[map-editor] bundle.map.bytes header:\n' + text);
            } catch { /* ignored */ }
            const overrides = await parseTmxLayerData(bundle.map.bytes);

            // Override tileset firstgids from the .tmx. The bridge derives
            // these from each tileset's nextTileId() — a running counter
            // tied to the .tsx's explicit tile slots. When a .tsx declares
            // fewer slots than the .tmx allocated gids for (PSDK's
            // passages.tsx declares 16 tiles but maps allocate 144), every
            // later tileset's firstgid is shifted down and cells in those
            // ranges resolve to the wrong sprite. .tmx firstgids are
            // authoritative; the bridge ones are derived and stale.
            // Always-on diagnostic: bridge vs .tmx firstgids side-by-side
            // and how many we changed. Helps catch silent code-path issues
            // (HMR not picking up a change, parser bailing, etc.).
            const tmxFgs = overrides.tilesetFirstgids;
            const bridgeFgs = rawMap.tilesets.map((ts) => ts.firstgid);
            console.log(
              '[map-editor] firstgid check — bridge:', bridgeFgs,
              ' tmx:', tmxFgs,
            );
            if (tmxFgs.length === rawMap.tilesets.length) {
              const fixes: string[] = [];
              for (let i = 0; i < rawMap.tilesets.length; i++) {
                const fg = tmxFgs[i];
                if (rawMap.tilesets[i].firstgid !== fg) {
                  fixes.push(`#${i} "${rawMap.tilesets[i].name ?? '?'}": ${rawMap.tilesets[i].firstgid} → ${fg}`);
                  rawMap.tilesets[i].firstgid = fg;
                }
              }
              console.log(
                fixes.length > 0
                  ? `[map-editor] tileset firstgids overridden from .tmx (${fixes.length}):\n  ` + fixes.join('\n  ')
                  : `[map-editor] firstgids match — no override needed`,
              );
            } else {
              console.warn(`[map-editor] tileset count mismatch: .tmx has ${tmxFgs.length}, bridge has ${rawMap.tilesets.length} — skipping firstgid override`);
            }

            let appliedById = 0;
            let appliedByPath = 0;
            let missing = 0;
            // Walk the bridge's layer tree in document order and match
            // each tile layer to its XML-decoded data. Prefer matching by
            // Tiled layer `id` (stable across reorderings); fall back to
            // structural path through the tree if the bridge didn't carry
            // the id through. Names are NOT safe — duplicates are legal
            // and PSDK exporters do produce them.
            const applyOverrides = (layers: TmjLayer[], prefix: number[]) => {
              layers.forEach((layer, idx) => {
                const path = [...prefix, idx];
                if (layer.type === 'tilelayer') {
                  let fresh: number[] | undefined;
                  if (typeof layer.id === 'number') fresh = overrides.byId.get(layer.id);
                  if (fresh) appliedById++;
                  else {
                    fresh = overrides.byPath.get(pathKey(path));
                    if (fresh) appliedByPath++;
                  }
                  if (fresh) layer.data = fresh;
                  else missing++;
                } else if (layer.type === 'group' && layer.layers) {
                  applyOverrides(layer.layers, path);
                }
              });
            };
            applyOverrides(rawMap.layers, []);
            dbg('load', `.tmx data overrides applied: ${appliedById} by id, ${appliedByPath} by path, ${missing} layers unchanged`);
          } catch (e) {
            console.warn('[map-editor] .tmx layer-data override failed; using bridge values', e);
          }

          const tilesetsMerged: TmjTileset[] = rawMap.tilesets.map((entry, idx) => {
            if (entry.image) return entry;
            try {
              const tsj = openedMap!.tilesetJson(idx) as Partial<TmjTileset>;
              return { ...tsj, firstgid: entry.firstgid, source: entry.source } as TmjTileset;
            } catch { return entry; }
          });
          // Flatten nested <group> layers into a single document-order
          // list. PSDK maps wrap tile layers in `<group name="z=N">`
          // containers; without this, nested layers (the bulk of upper-Z
          // content) never get rendered.
          const flatLayers = flattenLayerTree(rawMap.layers);
          // Defensive normalization: every tile layer must have a `data`
          // array sized exactly width × height. libtiled CAN omit data
          // for all-zero layers (or return a short array) when loading
          // a freshly-generated .tmx like our New Map flow's output. If
          // we leave a layer with missing data, the FIRST paint goes to
          // the bridge but the JS-side mirror stays empty AND the
          // renderer never sees the change. Force-pad to zeros up-front
          // so the runtime paths (writeCellRaw / syncSpriteAt) always
          // have a consistent backing array.
          let normalizedAny = false;
          const loadMapW = rawMap.width;
          const loadMapH = rawMap.height;
          for (const layer of flatLayers) {
            if (layer.type !== 'tilelayer') continue;
            // Fall back to map dims when libtiled omits per-layer width/height.
            if (!layer.width) layer.width = loadMapW;
            if (!layer.height) layer.height = loadMapH;
            const expected = layer.width * layer.height;
            if (!Array.isArray(layer.data) || layer.data.length !== expected) {
              layer.data = new Array(expected).fill(0);
              normalizedAny = true;
            }
          }
          if (normalizedAny) {
            console.log('[map-editor] normalized one or more layer.data arrays at load time (was missing or wrong length)');
          }
          if (MAP_EDITOR_DEBUG()) {
            dbg('load', `wasm.toJson layer count: ${rawMap.layers.length} mapDims: ${rawMap.width}×${rawMap.height} tilesets: ${rawMap.tilesets.length}`);
            for (let i = 0; i < flatLayers.length; i++) {
              const l = flatLayers[i];
              const dataLen = Array.isArray(l.data) ? l.data.length : 'n/a';
              dbg('load', `  layer[${i}] name="${l.name}" type=${l.type} dims=${l.width}×${l.height} data.length=${dataLen} bridgePath=${JSON.stringify(l.bridgePath)}`);
            }
          }
          // Bridge-supplied firstgids on external tilesets are unreliable
          // — see recomputeFirstgids for the bug + fix. Without this every
          // tileset reports firstgid=1, so `findTilesetForGid` resolves
          // every paint to the LAST tileset and most tiles render empty.
          const tilesetsWithGids = recomputeFirstgids(tilesetsMerged);
          const json: TmjMap = { ...rawMap, tilesets: tilesetsWithGids, layers: flatLayers };

          const imagesByPath = new Map<string, ArrayBuffer>();
          for (const img of bundle.images) imagesByPath.set(normalize(img.relPath), img.bytes);

          const loadedTilesets: LoadedTileset[] = [];
          for (const ts of json.tilesets) {
            let bmp: ImageBitmap | undefined;
            if (ts.image) {
              const bytes = imagesByPath.get(normalize(ts.image));
              if (bytes) {
                try {
                  const raw = await decodePngFromBytes(bytes);
                  bmp = await applyTransparentColor(raw, ts.transparentcolor);
                  ownedBitmaps.push(bmp);
                } catch (e) {
                  console.warn('[pixi] PNG decode failed for', ts.image, e);
                }
              }
            }
            loadedTilesets.push({ ...ts, bitmap: bmp });
          }
          if (cancelled) return;

          const maxTileHeight = Math.max(
            json.tileheight, ...loadedTilesets.map((ts) => ts.tileheight),
          );
          const maxRowsUp = Math.max(0, Math.ceil(maxTileHeight / json.tileheight) - 1);
          const state: LoadedState = { tiledFilename, json, tilesets: loadedTilesets, maxRowsUp };
          loadedRef.current = state;
          mapWasmRef.current = openedMap;
          openedMap = null;
          undoStackRef.current = [];
          redoStackRef.current = [];
          globalElapsedRef.current = 0;
          onHistoryChange?.();

          // Renderer is sized at NATIVE map dims (once, on load). Zoom is
          // applied via CSS scaling on the canvas element with
          // image-rendering: pixelated for crisp pixel art. This avoids
          // reallocating a huge GPU framebuffer on every Ctrl+wheel step —
          // the cost of which was the choppiness at high zoom levels.
          const pixW = json.width * json.tilewidth;
          const pixH = json.height * json.tileheight;
          appRef.current.renderer.resize(pixW, pixH);
          appRef.current.canvas.style.width = `${pixW * zoomRef.current}px`;
          appRef.current.canvas.style.height = `${pixH * zoomRef.current}px`;
          rootRef.current.scale.set(1);
          if (overlayRef.current) overlayRef.current.scale.set(1);

          // Textures per tileset.
          setStatus('Uploading textures…');
          // Query the GPU's max texture dimension so we know when to band.
          // WebGL2 spec minimum is 2048; modern desktop GPUs report 16384.
          // We cap at 16384 to match what Pixi accepts as a single texture.
          const gl = (appRef.current.renderer as unknown as { gl?: WebGL2RenderingContext }).gl;
          const gpuMaxTex = gl
            ? Math.min(16384, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number)
            : 16384;
          const tsCaches = new Map<number, TilesetTextureCache>();
          for (let i = 0; i < state.tilesets.length; i++) {
            const ts = state.tilesets[i];
            if (!ts.bitmap) continue;
            // Tilesets whose bitmap exceeds the GPU's max texture size
            // (e.g. PSDK's autotile-expansion images at 256×20128) need
            // to be sliced into multiple GPU textures or every sprite
            // referencing them renders as a black square.
            const bands = await buildTilesetBands(ts.bitmap, ts.tileheight, gpuMaxTex);
            if (bands.length > 1) {
              console.log(`[map-editor] tileset "${ts.name}" sliced into ${bands.length} bands (image ${ts.bitmap.width}×${ts.bitmap.height} > GPU limit ${gpuMaxTex})`);
            }
            tsCaches.set(i, { bands, perTile: new Map() });
            dbg('load', `  cache[${i}] for "${ts.name}" firstgid=${ts.firstgid} dims=${ts.bitmap.width}×${ts.bitmap.height} → ${bands.length} band(s) [${bands.map((b) => `rows ${b.rowStart}..${b.rowStart + b.rowCount - 1}`).join(', ')}]`);
          }
          tilesetCachesRef.current = tsCaches;
          animIndexRef.current = buildAnimIndex(state.tilesets);

          // Containers + sprites per visible layer.
          setStatus('Building scene graph…');
          const root = rootRef.current;
          for (const child of root.removeChildren()) child.destroy({ children: true });
          layerContainersRef.current.clear();
          spritesRef.current.clear();

          if (json.backgroundcolor) {
            const bg = new PIXI.Graphics().rect(0, 0, pixW, pixH).fill(json.backgroundcolor);
            root.addChild(bg);
          }

          let totalSprites = 0;
          for (let li = 0; li < json.layers.length; li++) {
            const layer = json.layers[li];
            const container = new PIXI.Container();
            container.label = `layer:${layer.name}`;
            root.addChild(container);
            layerContainersRef.current.set(li, container);

            if (layer.type !== 'tilelayer') {
              container.visible = false;
              continue;
            }
            const vis = li in visibilityRef.current ? visibilityRef.current[li] : layer.visible;
            container.visible = vis;
            container.alpha = layer.opacity ?? 1;

            const layerSpriteMap = layerSprites(li);
            const w = layer.width ?? json.width;
            for (const cell of cellsOf(layer)) {
              const raw = cell.raw >>> 0;
              const gid = raw & GID_MASK;
              if (!gid) continue;
              const ts = findTilesetForGid(state.tilesets, gid);
              if (!ts || !ts.bitmap) continue;
              const tsIdx = state.tilesets.indexOf(ts);
              const cache = tsCaches.get(tsIdx);
              if (!cache) continue;
              const localId = gid - ts.firstgid;
              const sprite = new PIXI.Sprite();
              configureSpriteForCell(sprite, state, cache, ts, raw, localId, layer, cell.x, cell.y);
              container.addChild(sprite);
              layerSpriteMap.set(cell.y * w + cell.x, sprite);
              totalSprites++;
            }
          }

          rebuildAnimSprites();
          redrawGridOverlay();
          redrawSelectionOverlay();
          redrawPreviewOverlay();

          // Clear the transient loading message — once loaded, the
          // map-dims/hover/selection HUD lives in the parent (MapEditorPage).
          // Sprite count + animated count + WebGL are dev-only now (see
          // the console.groupCollapsed dump below).
          setStatus('');

          // Persistent diagnostic dump. Always-on so when a map looks
          // wrong, the user can expand the group in DevTools and paste
          // it back — no need to re-instrument and reload. Collapsed by
          // default so it doesn't dominate the console.
          try {
            const totalCells = json.layers
              .filter((l) => l.type === 'tilelayer')
              .reduce((s, l) => s + ((l.data?.length) ?? l.chunks?.reduce((sc, c) => sc + c.data.length, 0) ?? 0), 0);
            const totalFilled = json.layers
              .filter((l) => l.type === 'tilelayer')
              .reduce((s, l) => {
                let n = 0;
                for (const c of cellsOf(l)) { void c; n++; }
                return s + n;
              }, 0);
            console.groupCollapsed(`[map-editor] ${tiledFilename} loaded — ${json.width}×${json.height}, ${state.tilesets.length} tilesets, ${json.layers.length} layers (${totalSprites} sprites)`);
            console.log(`Total cell slots across tile layers: ${totalCells.toLocaleString()}`);
            console.log(`Total non-empty cells:              ${totalFilled.toLocaleString()}`);
            console.log(`Sprites rendered:                   ${totalSprites.toLocaleString()}`);
            console.log(`Animated sprites:                   ${animSpritesRef.current.length.toLocaleString()}`);
            if (totalFilled !== totalSprites) {
              console.warn(`Sprite count (${totalSprites}) ≠ filled cells (${totalFilled}). ${totalFilled - totalSprites} cell(s) failed to resolve a tileset.`);
            }
            // Sanity-check the layer.data SHAPE — for base64-gzip .tmx
            // files libtiled may emit `data` as a base64 STRING (since the
            // map's layerDataFormat is preserved on toJson). Our cellsOf
            // assumes it's a flat int array; if it's a string, all reads
            // produce NaN → 0 and we silently lose most cells.
            const firstTL = state.json.layers.find((l) => l.type === 'tilelayer');
            if (firstTL) {
              const d = firstTL.data;
              const sample = d == null ? null
                : Array.isArray(d) ? Array.from(d as number[]).slice(0, 10)
                : typeof d === 'string' ? (d as string).slice(0, 40)
                : (() => { try { return Array.from(d as ArrayLike<number>).slice(0, 10); } catch { return '?'; } })();
              console.log(`First tile layer "${firstTL.name}" data shape:`, {
                typeofData: typeof d,
                isArray: Array.isArray(d),
                length: (d as { length?: number })?.length,
                expectedLengthForFiniteMap: (firstTL.width ?? state.json.width) * (firstTL.height ?? state.json.height),
                encodingAttr: (firstTL as { encoding?: string }).encoding ?? null,
                compressionAttr: (firstTL as { compression?: string }).compression ?? null,
                sample,
              });
            }
            console.groupCollapsed('Tilesets');
            state.tilesets.forEach((ts, idx) => {
              const bitmapDims = ts.bitmap ? `${ts.bitmap.width}x${ts.bitmap.height}` : 'NONE';
              const declared = `${ts.imagewidth ?? '?'}x${ts.imageheight ?? '?'}`;
              const sliceCap = (ts.columns || 1) * Math.floor((ts.bitmap?.height ?? 0) / Math.max(1, ts.tileheight));
              const tilesArr = (ts as { tiles?: TmjTilesetTile[] }).tiles ?? [];
              const animTiles = tilesArr.filter((t) => t.animation && t.animation.length > 0);
              console.log(`#${idx} ${ts.name}`, {
                source: (ts as TmjTileset).source ?? '(embedded)',
                firstgid: ts.firstgid,
                tilewidth: ts.tilewidth,
                tileheight: ts.tileheight,
                columns: ts.columns,
                tilecount: (ts as { tilecount?: number }).tilecount,
                declaredImage: declared,
                actualBitmap: bitmapDims,
                bitmapMatches: bitmapDims === declared,
                renderableTileSlots: sliceCap,
                tilesArrayLength: tilesArr.length,
                tilesWithAnimation: animTiles.length,
                firstAnimSample: animTiles[0]
                  ? { id: animTiles[0].id, frames: animTiles[0].animation?.length }
                  : null,
              });
            });
            console.groupEnd();

            // Cross-check: the animation index built by buildAnimIndex.
            // If "tilesWithAnimation" above is > 0 but this is empty for
            // the same tileset, the bug is in buildAnimIndex. If both
            // agree at 0, libtiled isn't emitting per-tile animation
            // data from `tilesetJson(idx)`.
            console.groupCollapsed('Animation index (post-buildAnimIndex)');
            let totalAnimTiles = 0;
            animIndexRef.current.forEach((m, tsIdx) => {
              if (m.size > 0) {
                console.log(`tileset #${tsIdx} ${state.tilesets[tsIdx]?.name}: ${m.size} indexed tile-id(s) trigger animations`);
                totalAnimTiles += m.size;
              }
            });
            if (totalAnimTiles === 0) console.warn('Animation index is EMPTY — no tile id in any tileset has an animation entry.');
            console.groupEnd();

            console.groupCollapsed('Layers');
            state.json.layers.forEach((l, idx) => {
              const isTile = l.type === 'tilelayer';
              let filled = 0;
              if (isTile) { for (const c of cellsOf(l)) { void c; filled++; } }
              console.log(
                `#${idx}`,
                `depth=${l.depth ?? 0}`,
                `bridgeIdx=${(l as { bridgeLayerIdx?: number | null }).bridgeLayerIdx ?? '—'}`,
                l.type,
                `"${l.name}"`,
                isTile ? `${filled} filled cell(s)` : '',
                `vis=${l.visible}`,
                `opacity=${l.opacity}`,
              );
            });
            console.groupEnd();

            // First non-empty cell from each of the first 5 tile layers,
            // resolved through findTilesetForGid the same way the renderer
            // does — so any tileset-resolution mismatches surface here.
            console.groupCollapsed('Sample cells (first non-empty per layer)');
            let layersSampled = 0;
            for (let li = 0; li < state.json.layers.length && layersSampled < 5; li++) {
              const l = state.json.layers[li];
              if (l.type !== 'tilelayer') continue;
              let sample: object | null = null;
              for (const cell of cellsOf(l)) {
                const raw = cell.raw >>> 0;
                const gid = raw & GID_MASK;
                if (!gid) continue;
                const ts = findTilesetForGid(state.tilesets, gid);
                if (!ts) {
                  sample = { pos: `${cell.x},${cell.y}`, raw: '0x' + raw.toString(16), gid, resolved: 'NO TILESET MATCHES' };
                  break;
                }
                const tsIdx = state.tilesets.indexOf(ts);
                const localId = gid - ts.firstgid;
                const cols = ts.columns || 1;
                const sliceX = (localId % cols) * ts.tilewidth;
                const sliceY = Math.floor(localId / cols) * ts.tileheight;
                const inBounds = !!ts.bitmap
                  && sliceX + ts.tilewidth <= ts.bitmap.width
                  && sliceY + ts.tileheight <= ts.bitmap.height;
                sample = {
                  pos: `${cell.x},${cell.y}`, raw: '0x' + raw.toString(16), gid,
                  tileset: `#${tsIdx} ${ts.name}`, localId,
                  slice: `(${sliceX},${sliceY},${ts.tilewidth},${ts.tileheight})`,
                  inBounds,
                };
                break;
              }
              if (sample) {
                console.log(`"${l.name}"`, sample);
                layersSampled++;
              }
            }
            console.groupEnd();

            // Raw-data dump of the first tile layer's first 5 rows. Helps
            // diagnose "decoded values are wrong" by letting us eyeball the
            // bridge output vs. the on-disk .tmx (which has known values).
            // First 8 cells per row to keep the log readable.
            try {
              const first = state.json.layers.find((l) => l.type === 'tilelayer');
              if (first && first.data && first.width) {
                console.groupCollapsed(`First layer raw data dump — "${first.name}"`);
                const cols = Math.min(first.width, 8);
                const rows = Math.min(first.height ?? 1, 5);
                for (let y = 0; y < rows; y++) {
                  const slice: number[] = [];
                  for (let x = 0; x < cols; x++) {
                    slice.push((first.data[y * first.width + x] >>> 0));
                  }
                  console.log(`row ${y}: [${slice.join(', ')}]`);
                }
                console.groupEnd();
              }
            } catch { /* ignored */ }

            console.groupEnd();
          } catch (e) { console.warn('[map-editor] diagnostic dump failed:', e); }

          onLoaded(state);
        } catch (e) {
          if (cancelled) return;
          console.error('[pixi] load failed', e);
          setError(e instanceof Error ? `${e.message}\n${e.stack ?? ''}` : String(e));
        } finally {
          openedMap?.dispose();
        }
      })();

      return () => {
        cancelled = true;
        mapWasmRef.current?.dispose();
        mapWasmRef.current = null;
        loadedRef.current = null;
        animSpritesRef.current = [];
        for (const b of ownedBitmaps) b.close?.();
        for (const cache of tilesetCachesRef.current.values()) {
          for (const t of cache.perTile.values()) t.destroy(false);
          for (const band of cache.bands) band.base.destroy(false);
        }
        tilesetCachesRef.current.clear();
        layerContainersRef.current.clear();
        spritesRef.current.clear();
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectPath, tiledFilename, reloadKey]);

    // Layer visibility → toggle container.visible.
    useEffect(() => {
      for (const [li, container] of layerContainersRef.current) {
        const state = loadedRef.current;
        const layer = state?.json.layers[li];
        if (!layer) continue;
        const vis = li in layerVisibility ? layerVisibility[li] : layer.visible;
        container.visible = vis;
      }
    }, [layerVisibility]);

    // Zoom: CSS-scale the canvas. The Pixi renderer stays at native map
    // dims — only the displayed size changes. This is O(1) per zoom step
    // (no framebuffer realloc, no scene-graph reflow).
    useEffect(() => {
      const app = appRef.current;
      const state = loadedRef.current;
      if (!app || !state) return;
      const pixW = state.json.width * state.json.tilewidth;
      const pixH = state.json.height * state.json.tileheight;
      app.canvas.style.width = `${pixW * zoom}px`;
      app.canvas.style.height = `${pixH * zoom}px`;
    }, [zoom]);

    // Overlay redraws on relevant changes. We redraw the brush-preview
    // overlay too so shape-fill drags update their ghost-tile preview as
    // the rect grows / shrinks under the cursor.
    useEffect(() => {
      redrawSelectionOverlay();
      redrawPreviewOverlay();
      // Forward to parent for the coords HUD. Convert internal sx/sy/ex/ey
      // (inclusive corners) to {x, y, w, h} which is friendlier for display.
      if (!selectionRect) onSelectionChangeRef.current?.(null);
      else onSelectionChangeRef.current?.({
        x: selectionRect.sx,
        y: selectionRect.sy,
        w: selectionRect.ex - selectionRect.sx + 1,
        h: selectionRect.ey - selectionRect.sy + 1,
      });
    }, [selectionRect, redrawSelectionOverlay, redrawPreviewOverlay]);
    useEffect(() => { redrawGridOverlay(); }, [showGrid, redrawGridOverlay]);
    useEffect(() => { redrawPreviewOverlay(); }, [selectedBrush, tool, tileSelectionVersion, shiftHeldTick, tileDragVersion, redrawPreviewOverlay]);

    return (
      <Wrap>
        {status && <Status>{status}</Status>}
        {error && <ErrorBox>{error}</ErrorBox>}
        <ScrollHost ref={scrollHostRef} onWheel={onWheel}>
          <PixiHost
            ref={hostRef}
            onMouseDown={onCanvasMouseDown}
            onContextMenu={onContextMenu}
            onMouseEnter={onCanvasMouseEnter}
            onMouseLeave={onCanvasMouseLeave}
          >
            {eventsOverlay}
          </PixiHost>
        </ScrollHost>
      </Wrap>
    );
  },
);
