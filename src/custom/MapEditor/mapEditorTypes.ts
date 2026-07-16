/**
 * Shared types for the map editor.
 *
 * Lifted out of the old Canvas2D `MapCanvas.tsx` when that renderer was
 * dropped (Phase 2). PixiMapCanvas is now the only renderer; the rest of
 * the editor (MapEditorPage, LayerList, TilesetPalette, AnimationEditor,
 * BulkAnimationEditor) imports its public contract from here instead of
 * from a renderer file.
 */

// ----- Tiled-JSON shapes ---------------------------------------------------
//
// The subset of Tiled's JSON format we care about. We never produce these
// — libtiled does, via the `tiled_map_as_json` bridge — we only consume
// them to drive the renderer + palette UI.

export type TmjAnimFrame = { tileid: number; duration: number };
export type TmjTilesetTile = { id: number; animation?: TmjAnimFrame[] };
export type TmjTileset = {
  firstgid: number;
  image?: string;
  imagewidth?: number;
  imageheight?: number;
  tilewidth: number;
  tileheight: number;
  columns: number;
  margin?: number;
  spacing?: number;
  name?: string;
  source?: string;
  transparentcolor?: string;
  tiles?: TmjTilesetTile[];
  tilecount?: number;
};
export type TmjChunk = { x: number; y: number; width: number; height: number; data: number[] };
export type TmjLayer = {
  type: 'tilelayer' | 'objectgroup' | 'imagelayer' | 'group';
  /** Tiled's per-layer unique id (`<layer id="...">` in .tmx). Stable. */
  id?: number;
  name: string;
  visible: boolean;
  opacity: number;
  width?: number;
  height?: number;
  data?: number[];
  chunks?: TmjChunk[];
  offsetx?: number;
  offsety?: number;
  /** Present only on `type === 'group'`. */
  layers?: TmjLayer[];
  // ---- Synthetic metadata populated by flattenLayerTree --------------
  // Not part of Tiled JSON; the renderer attaches these during flatten so
  // bridge calls and the layer panel can address layers uniformly.
  /**
   * Bridge-side path from the map root down to this layer.
   * `[3]` = top-level layer at index 3; `[3, 1]` = second child of top-
   * level group at index 3. Used by every path-based wasm authoring call.
   */
  bridgePath?: number[];
  /** Nesting depth — 0 for top-level, 1 for child-of-group, etc. */
  depth?: number;
  /** Ancestor group names for breadcrumb display in LayerList. */
  ancestorNames?: string[];
};
export type TmjMap = {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  tilesets: TmjTileset[];
  layers: TmjLayer[];
  backgroundcolor?: string;
};

// ----- Editor types --------------------------------------------------------

/**
 * Per-tileset runtime data. `bitmap` is optional: if libtiled couldn't
 * resolve the .tsx's image (missing file, decode error, etc.) we still
 * include the tileset in the lookup list — otherwise `findTilesetForGid`
 * would skip past it and resolve gids meant for it to the wrong tileset.
 * Cells whose tileset has no bitmap simply don't draw.
 */
export type LoadedTileset = TmjTileset & { bitmap?: ImageBitmap };

/**
 * One painted cell in a brush. Null in `Brush.cells` = leave that cell alone.
 * The flip flags mirror the high 3 bits of Tiled's raw gid encoding and let
 * the user paint mirrored / rotated variants of any tile without authoring
 * a separate tileset entry. `flipD` is the anti-diagonal swap that, combined
 * with H/V, encodes 90°/180°/270° rotations.
 */
export type BrushCell = {
  tilesetIndex: number;
  tileId: number;
  flipH?: boolean;
  flipV?: boolean;
  flipD?: boolean;
};

/** One additional layer's worth of cells, paired with a destination hint. */
export type BrushLayer = {
  /** Destination layer relative to active at paint time (positive = above
   *  active). Used as a fallback when `layerName` is unset or doesn't
   *  resolve on the current map. */
  layerOffset: number;
  /** Destination layer name. Preferred over `layerOffset` when present —
   *  layer indices shift between maps (especially after a stamp creates
   *  missing layers), but names are stable. Set by stamp recall so a
   *  stamp authored against e.g. "walls_1" lands on "walls_1" regardless
   *  of where that layer ended up in the destination's flat ordering. */
  layerName?: string;
  /** Same row-major shape as `Brush.cells`. */
  cells: (BrushCell | null)[];
};

/**
 * A paint brush — single tile or NxM rectangle picked from the canvas / palette.
 *
 * `cells` is row-major (`cells[y * width + x]`) and targets the **active
 * layer** at paint time. A null entry = "skip", preserving whatever's
 * underneath at that position (Tiled's behavior for empty-source cells).
 *
 * `extraLayers` is the multi-layer extension: each entry carries a parallel
 * `width * height` grid for a different relative-layer destination.
 */
export type Brush = {
  width: number;
  height: number;
  cells: (BrushCell | null)[];
  extraLayers?: BrushLayer[];
};

export const singleBrush = (tilesetIndex: number, tileId: number): Brush => ({
  width: 1,
  height: 1,
  cells: [{ tilesetIndex, tileId }],
});

// ----- brush transforms (X/Y/Z keys, Tiled-parity) -------------------------
//
// Tiled stores tile orientation in three flip bits (H, V, D) packed into
// the high bits of the cell gid. 90° rotation is encoded as a combination
// of D + one axis flip — there are exactly 8 distinct orientations
// (identity, three rotations, the same four mirrored).
//
// Tracking the UL and UR corners through the render pipeline (`rotation =
// π/2; scale = (flipH ? -1 : 1, flipV ? 1 : -1)` when D=1, else `scale =
// (flipH ? -1 : 1, flipV ? -1 : 1)`), the four pure rotation states are:
//   0°   = (D=0, H=0, V=0)         identity
//   90°  = (D=1, H=1, V=0)         CW from identity
//   180° = (D=0, H=1, V=1)         CW from 90°
//   270° = (D=1, H=0, V=1)         CW from 180° (a.k.a. CCW from identity)
//
// CW cycle: (0,0,0) → (1,1,0) → (0,1,1) → (1,0,1) → (0,0,0)
//
// Deriving the per-step formula from the cycle:
//   CW  : (D, H, V) → (!D, !V,  H)
//   CCW : (D, H, V) → (!D,  V, !H)
//
// X (flip H) and Y (flip V) toggle their respective bits — composing with
// a rotated state gives the expected Tiled behavior (e.g. Z then X applied
// to identity yields (1,0,0), which renders as "CW rotation then mirror
// along screen X").
//
// Each transform also rotates the BRUSH GRID itself so the cell-position
// layout matches the visual rotation: a 2×3 brush rotated CW becomes 3×2,
// with cells transposed.

const flipCellH = (c: BrushCell | null): BrushCell | null =>
  c ? { ...c, flipH: !c.flipH } : null;

const flipCellV = (c: BrushCell | null): BrushCell | null =>
  c ? { ...c, flipV: !c.flipV } : null;

const rotateCellCw = (c: BrushCell | null): BrushCell | null =>
  c ? { ...c, flipD: !c.flipD, flipH: !c.flipV, flipV: !!c.flipH } : null;

const rotateCellCcw = (c: BrushCell | null): BrushCell | null =>
  c ? { ...c, flipD: !c.flipD, flipH: !!c.flipV, flipV: !c.flipH } : null;

/** Mirror a brush's cell grid horizontally and toggle each cell's flipH. */
export const flipBrushHorizontal = (b: Brush): Brush => ({
  width: b.width,
  height: b.height,
  cells: mirrorGridH(b.cells, b.width, b.height).map(flipCellH),
  extraLayers: b.extraLayers?.map((l) => ({
    layerOffset: l.layerOffset,
    cells: mirrorGridH(l.cells, b.width, b.height).map(flipCellH),
  })),
});

/** Mirror a brush's cell grid vertically and toggle each cell's flipV. */
export const flipBrushVertical = (b: Brush): Brush => ({
  width: b.width,
  height: b.height,
  cells: mirrorGridV(b.cells, b.width, b.height).map(flipCellV),
  extraLayers: b.extraLayers?.map((l) => ({
    layerOffset: l.layerOffset,
    cells: mirrorGridV(l.cells, b.width, b.height).map(flipCellV),
  })),
});

/** Rotate a brush 90° clockwise. Width and height swap. */
export const rotateBrushCw = (b: Brush): Brush => ({
  width: b.height,
  height: b.width,
  cells: transposeCw(b.cells, b.width, b.height).map(rotateCellCw),
  extraLayers: b.extraLayers?.map((l) => ({
    layerOffset: l.layerOffset,
    cells: transposeCw(l.cells, b.width, b.height).map(rotateCellCw),
  })),
});

/** Rotate a brush 90° counter-clockwise. Width and height swap. */
export const rotateBrushCcw = (b: Brush): Brush => ({
  width: b.height,
  height: b.width,
  cells: transposeCcw(b.cells, b.width, b.height).map(rotateCellCcw),
  extraLayers: b.extraLayers?.map((l) => ({
    layerOffset: l.layerOffset,
    cells: transposeCcw(l.cells, b.width, b.height).map(rotateCellCcw),
  })),
});

// ----- grid layout helpers (row-major, source(w,h) → dest with same data) --

const mirrorGridH = (cells: (BrushCell | null)[], w: number, h: number): (BrushCell | null)[] => {
  const out: (BrushCell | null)[] = new Array(cells.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      out[y * w + x] = cells[y * w + (w - 1 - x)];
    }
  }
  return out;
};

const mirrorGridV = (cells: (BrushCell | null)[], w: number, h: number): (BrushCell | null)[] => {
  const out: (BrushCell | null)[] = new Array(cells.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      out[y * w + x] = cells[(h - 1 - y) * w + x];
    }
  }
  return out;
};

const transposeCw = (cells: (BrushCell | null)[], w: number, h: number): (BrushCell | null)[] => {
  // CW: a (w × h) source becomes an (h × w) destination. The dest cell at
  // (dx, dy) holds whatever was at src(dy, h - 1 - dx). Dest stride is h.
  const out: (BrushCell | null)[] = new Array(cells.length);
  for (let dy = 0; dy < w; dy++) {
    for (let dx = 0; dx < h; dx++) {
      out[dy * h + dx] = cells[(h - 1 - dx) * w + dy];
    }
  }
  return out;
};

const transposeCcw = (cells: (BrushCell | null)[], w: number, h: number): (BrushCell | null)[] => {
  // CCW: dest(dx, dy) holds src(w - 1 - dy, dx). Same (h × w) dest shape.
  const out: (BrushCell | null)[] = new Array(cells.length);
  for (let dy = 0; dy < w; dy++) {
    for (let dx = 0; dx < h; dx++) {
      out[dy * h + dx] = cells[dx * w + (w - 1 - dy)];
    }
  }
  return out;
};

export type LoadedState = {
  /**
   * The .tmx this state was actually built from. Loading is async and the canvas
   * isn't remounted on map switch, so `loaded` can still describe the PREVIOUS
   * map — anything reading it as "the current map" (e.g. its dimensions) must
   * first check this against the map it thinks it has.
   */
  tiledFilename: string;
  json: TmjMap;
  tilesets: LoadedTileset[];
  /**
   * Cached max-rows-up value: the most rows a single tile could extend above
   * its cell's own row, given the tallest tileset. Used by the cell-update
   * path to know how far up to clear+redraw when one cell on a layer changes.
   */
  maxRowsUp: number;
};

/**
 * One reversible cell edit: was `oldRaw` at (x, y) on `layerIdx`.
 * Applied via `MapCanvasHandle.applyCellBatch`; the parent's typed action
 * history owns the stack.
 */
export type HistoryEntry = { layerIdx: number; x: number; y: number; oldRaw: number };

export type MapCanvasHandle = {
  /** Serialize current edits back to .tmx bytes; returns null if not loaded. */
  saveBytes: () => Uint8Array | null;
  /**
   * A PNG data URL of the current rendered map (whole stage, metadata layers
   * hidden as on screen), downscaled for cheap reuse. Returns null if the
   * renderer can't produce one. Used by the event editor's tone-command
   * preview to show a tint over the real map.
   */
  snapshotDataURL?: () => string | null;
  /** Force a full repaint (used after layer visibility toggles). */
  redraw: () => void;
  /** Revert the most recent paint. Returns true if anything was undone. */
  undo: () => boolean;
  /** Re-apply the most recently undone paint. Returns true if anything was redone. */
  redo: () => boolean;
  /** Counts for the toolbar to enable/disable buttons. */
  stackSizes: () => { undo: number; redo: number };
  // ---- Layer + map structure authoring ---------------------------------
  // All mutate the in-memory wasm map only. Caller (MapEditorPage) is
  // responsible for calling saveBytes + writeMapBytes + reloadKey++ to
  // round-trip the change to disk and refresh the scene. Return -1 / false
  // on failure; the wasm map is left unchanged in that case.
  addTileLayer: (name: string) => number;
  addGroupLayer: (name: string) => number;
  removeLayer: (index: number) => boolean;
  removeLayerAtPath: (path: number[]) => boolean;
  renameLayer: (index: number, name: string) => boolean;
  renameLayerAtPath: (path: number[], name: string) => boolean;
  moveLayer: (from: number, to: number) => boolean;
  moveLayerToPath: (srcPath: number[], dstParentPath: number[], dstIdx: number) => boolean;
  setLayerOpacityAtPath?: (path: number[], opacity: number) => boolean;
  /**
   * Live in-memory opacity preview. Updates the flat layer's effective
   * `opacity` and the corresponding render container's alpha WITHOUT
   * tearing down the scene. Use this for slider drags; commit the real
   * wasm update via `setLayerOpacityAtPath` separately.
   */
  setLayerOpacityLive?: (flatIdx: number, opacity: number) => void;
  /**
   * Resize the map. `offsetX/Y` shifts tile-layer content within the new
   * bounds (positive = right/down). Object/image/group layers are
   * untouched. Returns true on success.
   */
  resizeMap: (newWidth: number, newHeight: number, offsetX: number, offsetY: number) => boolean;
  /**
   * Re-derive the scene graph from the current in-memory wasm map state,
   * without touching disk. Returns true if the renderer supports in-place
   * rebuild. Used after layer authoring (add/del/rename/move) and map
   * resize so structural edits don't force a save the user didn't ask for.
   */
  rebuildScene?: () => boolean;
  /**
   * Replace the in-memory wasm map handle with a fresh one loaded from
   * `bytes` (a previously-captured .tmx snapshot), then rebuild the
   * scene. Used by structural undo/redo.
   */
  replaceMapFromBytes?: (bytes: Uint8Array) => Promise<boolean>;
  /**
   * Apply a batch of cell edits (write each entry's `oldRaw` to (x, y) on
   * `layerIdx`). Returns the INVERSE batch — each entry's `oldRaw` is the
   * pre-write value at that cell, so the inverse can be used to redo the
   * original action.
   */
  applyCellBatch?: (batch: HistoryEntry[]) => HistoryEntry[] | null;
  /**
   * Force the tile selection to a specific cell set on a specific layer
   * (or clear if cells is empty / layerIdx is -1). Used by the parent's
   * undo/redo to restore a prior selection state without firing a new
   * commit event — the call is one-shot, not change-tracked.
   */
  setTileSelection?: (cells: Set<number>, layerIdx: number) => void;
  /**
   * Build a Brush from the current tile selection (cropped to its bbox,
   * selection-shaped — cells outside the mask are null). Honors the
   * panel's multi-layer selection: extra co-selected layers become
   * extraLayers in the brush so multi-layer copy/paste round-trips.
   * Returns null when there's no selection. Used by Ctrl+C / Ctrl+X.
   */
  selectionToBrush?: () => Brush | null;
  /**
   * Erase every cell in the current tile selection on its layer (and on
   * any co-selected layers when the panel has more than one selected).
   * Pushes one undo batch. Used by Ctrl+X after the brush is built.
   */
  eraseTileSelection?: () => void;
  /**
   * Add a new tileset reference to the map IN MEMORY — no .tmx written
   * to disk. The caller hands in the modified .tmx bytes (with the new
   * `<tileset>` element already inserted), the .tsx file bytes, and the
   * image bytes.
   */
  addTilesetInMemory?: (params: {
    modifiedMapBytes: Uint8Array;
    newTsx: { relPath: string; bytes: ArrayBuffer };
    newImage: { relPath: string; bytes: ArrayBuffer; transparentColor?: string };
  }) => Promise<boolean>;
};

export type Tool =
  | 'stamp'      // single-cell + drag paint (drag = Bresenham)
  | 'erase'      // single-cell erase + right-drag erase rect
  | 'fill'       // flood-fill matching gids on click
  | 'rect'       // shape fill: rectangle (drag → preview → release paints brush across rect)
  | 'ellipse'    // shape fill: ellipse (same UX, masked by ellipse)
  | 'wand'       // magic wand: click → select contiguous cells with same gid
  | 'sameTile'   // select all cells on active layer with same gid (not connectivity-bound)
  | 'select';    // rectangular tile selection: drag → tileSelection (Shift=add, Ctrl=sub, Ctrl+Shift=intersect)

/** Available zoom levels (1 = 100%). Cursor-anchored stepping via Ctrl+wheel. */
// Pixel-art-friendly zoom steps only: powers-of-two ratios plus 0.5 and
// integer multiples. Anything like 0.33 / 0.66 / 1.5 renders fractional
// pixels and looks blurry on tile maps.
export const ZOOM_STEPS = [0.125, 0.25, 0.5, 1, 2, 3, 4, 6, 8] as const;
export const DEFAULT_ZOOM = 1;
