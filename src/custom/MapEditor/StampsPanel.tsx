/**
 * Stamps panel — Tiled-style saved brush library.
 *
 * A "stamp" is a named, persisted copy of the current paint brush. The user
 * picks or builds a brush (single tile or N×M pattern via right-drag), hits
 * "Save as stamp" with a name, and the brush goes into a list they can recall
 * later with one click.
 *
 * Persistence:
 *   - localStorage, keyed by project path so each project keeps its own
 *     library. We serialize tileset references by `source` / `name` rather
 *     than by index — tileset indices vary per map, so a stamp built on
 *     `map_a.tmx` can still resolve correctly when loaded on `map_b.tmx`
 *     as long as both maps reference the same .tsx files.
 *   - Cells whose tileset isn't present in the current map become null in
 *     the resolved brush (silently skipped at paint time, matching how
 *     normal brushes treat null cells).
 *
 * Thumbnails:
 *   - Rendered to a small `<canvas>` per row using the bitmap already in
 *     `loaded.tilesets` — no extra image fetches.
 *   - Bounded width/height keeps the panel scannable even for wide patterns.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import type { Brush, BrushCell, BrushLayer, LoadedState, LoadedTileset } from './mapEditorTypes';

// ----- types ---------------------------------------------------------------

type StampCell = {
  tilesetKey: string;
  tileId: number;
  flipH?: boolean;
  flipV?: boolean;
  flipD?: boolean;
} | null;
type StampLayer = { layerOffset: number; cells: StampCell[] };

export type Stamp = {
  id: string;
  name: string;
  width: number;
  height: number;
  cells: StampCell[];
  extraLayers?: StampLayer[];
  /**
   * Layer names the user had selected when the stamp was saved, with the
   * first entry being the active layer. Recalling the stamp restores this
   * selection so the same multi-layer context is back without the user
   * having to re-select. Names (not indices) so reorderings don't break.
   */
  layerNames?: string[];
  /**
   * Map of tilesetKey → .tsx filename for every tileset this stamp
   * references. Lets the loader auto-add missing tilesets to a target
   * map (Tiled parity: stamps are project-global and can ride alongside
   * their tilesets onto a map that doesn't have them yet).
   *
   * The key matches StampCell.tilesetKey (ts.source ?? ts.name); the
   * value is the basename like "grass.tsx", suitable for passing to the
   * existing onAddTileset flow.
   */
  tilesetRefs?: Record<string, string>;
  /** When the stamp was last saved (epoch ms). For ordering in the UI. */
  updatedAt: number;
};

// ----- persistence ---------------------------------------------------------

const STORAGE_PREFIX = 'pokemonstudio.fork.mapEditor.stamps:';

const storageKeyFor = (projectPath: string) => STORAGE_PREFIX + projectPath;

const loadStamps = (projectPath: string): Stamp[] => {
  try {
    const raw = localStorage.getItem(storageKeyFor(projectPath));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Stamp[];
  } catch {
    return [];
  }
};

const saveStamps = (projectPath: string, stamps: Stamp[]) => {
  try {
    localStorage.setItem(storageKeyFor(projectPath), JSON.stringify(stamps));
  } catch {
    /* quota or private mode — non-fatal, stamp just won't persist this turn */
  }
};

// ----- brush ⇄ stamp conversion -------------------------------------------

/** Strip directory components from a tileset's source path so the same
 *  .tsx file gets the same key regardless of how it was referenced.
 *
 *  Why: libtiled normalizes loaded `<tileset source="…">` differently
 *  depending on path (e.g. drops the leading `../`), and our own
 *  addTileset code writes `../Tilesets/foo.tsx`. Without normalizing,
 *  a stamp whose key was `Tilesets/foo.tsx` looks "missing" forever on
 *  a map that has it as `../Tilesets/foo.tsx`. .tsx filenames are unique
 *  inside a PSDK project, so basename is a safe canonical key. */
export const normalizeTilesetKey = (key: string): string =>
  key.replaceAll('\\', '/').split('/').pop() ?? key;

/** Identify a tileset by `source` first (file path is stable across maps),
 * falling back to `name` if no source is set (in-map tilesets). Always
 * normalized to a basename so different prefixes don't fragment lookups. */
const tilesetKey = (ts: LoadedTileset): string =>
  normalizeTilesetKey(ts.source ?? ts.name ?? '');

const cellToStamp = (cell: BrushCell | null, tilesets: LoadedTileset[]): StampCell => {
  if (!cell) return null;
  const ts = tilesets[cell.tilesetIndex];
  if (!ts) return null;
  const out: NonNullable<StampCell> = { tilesetKey: tilesetKey(ts), tileId: cell.tileId };
  if (cell.flipH) out.flipH = true;
  if (cell.flipV) out.flipV = true;
  if (cell.flipD) out.flipD = true;
  return out;
};

const cellFromStamp = (cell: StampCell, tilesets: LoadedTileset[]): BrushCell | null => {
  if (!cell) return null;
  // Normalize the stamp's stored key too — older stamps were saved with
  // path-prefixed keys ("Tilesets/foo.tsx") before normalization existed.
  const target = normalizeTilesetKey(cell.tilesetKey);
  const idx = tilesets.findIndex((ts) => tilesetKey(ts) === target);
  if (idx < 0) return null;
  const out: BrushCell = { tilesetIndex: idx, tileId: cell.tileId };
  if (cell.flipH) out.flipH = true;
  if (cell.flipV) out.flipV = true;
  if (cell.flipD) out.flipD = true;
  return out;
};

/** Derive the .tsx filename ("grass.tsx") from a tileset's `source` path
 *  ("../Tilesets/grass.tsx"). Empty string if the tileset has no source
 *  (in-map tilesets) — those can't be auto-added to other maps anyway. */
const tilesetTsxFilename = (ts: LoadedTileset): string => {
  const src = ts.source ?? '';
  if (!src) return '';
  return src.replaceAll('\\', '/').split('/').pop() ?? '';
};

/** Collect tilesetKey → .tsx filename for every tileset a brush uses
 *  across all its layers. Stored in the saved stamp so onApplyStamp can
 *  auto-add the missing ones when pasting onto a map without them. */
const collectTilesetRefs = (brush: Brush, tilesets: LoadedTileset[]): Record<string, string> => {
  const refs: Record<string, string> = {};
  const consume = (cells: (BrushCell | null)[]) => {
    for (const c of cells) {
      if (!c) continue;
      const ts = tilesets[c.tilesetIndex];
      if (!ts) continue;
      const key = tilesetKey(ts);
      if (!key || key in refs) continue;
      const tsx = tilesetTsxFilename(ts);
      if (tsx) refs[key] = tsx;
    }
  };
  consume(brush.cells);
  if (brush.extraLayers) for (const l of brush.extraLayers) consume(l.cells);
  return refs;
};

const brushToStamp = (
  brush: Brush,
  tilesets: LoadedTileset[],
  name: string,
  layerNames: string[] | undefined,
): Stamp => {
  const tilesetRefs = collectTilesetRefs(brush, tilesets);
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    width: brush.width,
    height: brush.height,
    cells: brush.cells.map((c) => cellToStamp(c, tilesets)),
    extraLayers: brush.extraLayers?.map<StampLayer>((l) => ({
      layerOffset: l.layerOffset,
      cells: l.cells.map((c) => cellToStamp(c, tilesets)),
    })),
    layerNames: layerNames && layerNames.length > 0 ? layerNames : undefined,
    tilesetRefs: Object.keys(tilesetRefs).length > 0 ? tilesetRefs : undefined,
    updatedAt: Date.now(),
  };
};

export const stampToBrush = (stamp: Stamp, tilesets: LoadedTileset[]): Brush => {
  // Attach each extra layer's saved name from stamp.layerNames so the
  // paint path can resolve by name on destination maps where layer
  // indices differ. layerNames[0] is the active layer name (not paired
  // with an extra — the brush's own `cells` go there); layerNames[i+1]
  // pairs with extraLayers[i] in the order they were captured.
  const extraNames = (stamp.layerNames ?? []).slice(1);
  return {
    width: stamp.width,
    height: stamp.height,
    cells: stamp.cells.map((c) => cellFromStamp(c, tilesets)),
    extraLayers: stamp.extraLayers?.map<BrushLayer>((l, i) => ({
      layerOffset: l.layerOffset,
      layerName: extraNames[i],
      cells: l.cells.map((c) => cellFromStamp(c, tilesets)),
    })),
  };
};

// ----- phantom tilesets ---------------------------------------------------
//
// When a stamp is rendered in the panel, its cells reference tilesets by
// key (.tsx source path). The current map may not have all of them — that's
// the whole point of stamps as a project-global library. For thumbnails to
// render correctly anyway, we lazily fetch the missing .tsx + image from
// disk and cache the result here. Same machinery is reused for the cursor
// ghost on the canvas via the same projectPath / tilesetKey mapping.

type PhantomTileset = {
  bitmap: ImageBitmap;
  tilewidth: number;
  tileheight: number;
  columns: number;
};

/** Parse a .tsx and return the bits we need to slice a tileset image into
 *  per-tile rects: tile size, columns, image filename. Returns null on
 *  malformed XML or missing required fields. */
const parseTsxMetadata = (xmlText: string): { tilewidth: number; tileheight: number; columns: number; imageFilename: string } | null => {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) return null;
  const root = doc.documentElement;
  const tw = parseInt(root.getAttribute('tilewidth') ?? '0', 10);
  const th = parseInt(root.getAttribute('tileheight') ?? '0', 10);
  const cols = parseInt(root.getAttribute('columns') ?? '0', 10);
  const img = root.querySelector(':scope > image');
  const source = img?.getAttribute('source') ?? '';
  const imageFilename = source.replaceAll('\\', '/').split('/').pop() ?? '';
  if (!tw || !th || !imageFilename) return null;
  // Some .tsx files omit `columns` — derive from image width / tilewidth.
  const imgW = parseInt(img?.getAttribute('width') ?? '0', 10);
  const columns = cols > 0 ? cols : Math.max(1, Math.floor(imgW / tw));
  return { tilewidth: tw, tileheight: th, columns, imageFilename };
};

const decodePngBytesToBitmap = async (bytes: ArrayBuffer): Promise<ImageBitmap> => {
  const blob = new Blob([bytes], { type: 'image/png' });
  return createImageBitmap(blob);
};

/** Best-effort fetch + decode of a tileset's .tsx + image, given the .tsx
 *  filename. Returns null if any step fails (file missing, malformed
 *  XML, image decode error) — the caller falls back to a placeholder. */
const loadPhantomTileset = async (projectPath: string, tsxFilename: string): Promise<PhantomTileset | null> => {
  try {
    const tsxBytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      window.api.readTilesetBytes(
        { projectPath, tsxFilename },
        (payload) => resolve(payload.bytes),
        ({ errorMessage }) => reject(new Error(errorMessage)),
      );
    });
    const meta = parseTsxMetadata(new TextDecoder().decode(tsxBytes));
    if (!meta) return null;
    const imageBytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      window.api.readTilesetImageBytes(
        { projectPath, imageFilename: meta.imageFilename },
        (payload) => resolve(payload.bytes),
        ({ errorMessage }) => reject(new Error(errorMessage)),
      );
    });
    const bitmap = await decodePngBytesToBitmap(imageBytes);
    return { bitmap, tilewidth: meta.tilewidth, tileheight: meta.tileheight, columns: meta.columns };
  } catch {
    return null;
  }
};

// ----- thumbnail renderer --------------------------------------------------

const THUMB_MAX_PX = 48;

/**
 * Render a stamp to a canvas. Picks an integer scale that fits within
 * THUMB_MAX_PX in both axes (or 1 if even one tile already overflows —
 * very large stamps just clip the preview).
 */
/** Slim shape covering everything renderStampThumbnail reads from a
 *  tileset entry. Both LoadedTileset and PhantomTileset satisfy it. */
type ThumbTileset = { bitmap?: ImageBitmap; tilewidth: number; tileheight: number };

const renderStampThumbnail = (
  canvas: HTMLCanvasElement,
  stamp: Stamp,
  tilesets: LoadedTileset[],
  phantoms: Map<string, PhantomTileset>,
) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  // Resolve a cell's tileset by key — checks the map's tilesets first
  // (preferred, since they reflect any user edits) then the panel's
  // phantom cache for stamps whose tileset isn't on the current map.
  const lookup = (key: string): ThumbTileset | undefined => {
    const real = tilesets.find((t) => tilesetKey(t) === key);
    if (real?.bitmap) return real;
    return phantoms.get(key);
  };
  // Pick a representative tile size from the first usable cell — most
  // brushes are single-tileset and uniform-size; in mixed cases we just
  // use the first cell's tileset metrics. Falls back to 32×32 when even
  // that doesn't resolve (empty stamp, no tilesets loaded yet).
  const firstResolved = stamp.cells.find((c) => c) ?? null;
  const ts = firstResolved ? lookup(firstResolved.tilesetKey) : (tilesets[0] as ThumbTileset | undefined);
  const tw = ts?.tilewidth ?? 32;
  const th = ts?.tileheight ?? 32;

  const pxW = stamp.width * tw;
  const pxH = stamp.height * th;
  const scale = Math.max(1, Math.floor(Math.min(THUMB_MAX_PX / pxW, THUMB_MAX_PX / pxH))) || 1;
  const w = Math.min(THUMB_MAX_PX, Math.max(tw * scale, pxW * scale));
  const h = Math.min(THUMB_MAX_PX, Math.max(th * scale, pxH * scale));
  canvas.width = w;
  canvas.height = h;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);

  // Center the rendered cells within the bounded thumbnail.
  const renderW = stamp.width * tw * scale;
  const renderH = stamp.height * th * scale;
  const offX = Math.floor((w - renderW) / 2);
  const offY = Math.floor((h - renderH) / 2);

  for (let y = 0; y < stamp.height; y++) {
    for (let x = 0; x < stamp.width; x++) {
      const cell = stamp.cells[y * stamp.width + x];
      if (!cell) continue;
      const cellTs = lookup(cell.tilesetKey);
      if (!cellTs || !cellTs.bitmap) continue;
      const cols = Math.max(1, Math.floor(cellTs.bitmap.width / cellTs.tilewidth));
      const sx = (cell.tileId % cols) * cellTs.tilewidth;
      const sy = Math.floor(cell.tileId / cols) * cellTs.tileheight;
      ctx.drawImage(
        cellTs.bitmap,
        sx, sy, cellTs.tilewidth, cellTs.tileheight,
        offX + x * tw * scale, offY + y * th * scale, tw * scale, th * scale,
      );
    }
  }
};

// ----- styled --------------------------------------------------------------

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.dark14};
  border: 1px solid ${({ theme }) => theme.colors.dark20};
  border-radius: 8px;
  overflow: hidden;
  min-height: 0;
  /* Fill the SidebarPane wrapper so the vertical drag handle in MapEditorPage
     actually re-sizes us. Without flex:1 the panel sticks to its content
     height and the parent pane has a gap. */
  flex: 1;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.dark18};
  ${({ theme }) => theme.fonts.titlesHeadline6};
  color: ${({ theme }) => theme.colors.text100};
`;

const HeaderTitle = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const Count = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

const SaveBtn = styled.button`
  ${({ theme }) => theme.fonts.normalRegular};
  background: ${({ theme }) => theme.colors.primaryBase};
  color: ${({ theme }) => theme.colors.text100};
  border: none;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.primarySoft}; }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

const EmptyHint = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  padding: 16px 12px;
  text-align: center;
`;

// `div` (not `button`) because the row needs to contain other buttons
// (DeleteBtn, ImportBtn) and nesting buttons is invalid HTML — React
// 18+ warns and 19 errors on it. We keep the click + cursor + a11y role
// so the row still behaves like a clickable surface.
const Row = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: ${({ $active, theme }) => ($active ? theme.colors.dark22 : 'transparent')};
  border-left: 3px solid ${({ $active, theme }) => ($active ? theme.colors.primaryBase : 'transparent')};
  color: ${({ theme }) => theme.colors.text100};
  cursor: pointer;
  text-align: left;
  ${({ theme }) => theme.fonts.normalRegular};
  &:hover { background: ${({ theme }) => theme.colors.dark20}; }
`;

const Thumb = styled.canvas`
  width: ${THUMB_MAX_PX}px;
  height: ${THUMB_MAX_PX}px;
  background: ${({ theme }) => theme.colors.dark20};
  border: 1px solid ${({ theme }) => theme.colors.dark22};
  border-radius: 4px;
  image-rendering: pixelated;
  flex-shrink: 0;
`;

const RowMain = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StampName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NameInput = styled.input`
  ${({ theme }) => theme.fonts.normalRegular};
  background: ${({ theme }) => theme.colors.dark20};
  color: ${({ theme }) => theme.colors.text100};
  border: 1px solid ${({ theme }) => theme.colors.primaryBase};
  border-radius: 3px;
  padding: 2px 6px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
`;

const StampMeta = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

const DeleteBtn = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text400};
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  &:hover { background: ${({ theme }) => theme.colors.dangerBase}; color: ${({ theme }) => theme.colors.text100}; }
`;

// Inline warning shown on rows whose stamp references tilesets/layers
// the current map doesn't have. The Import button next to it performs
// the structural adds under a single undoable action.
const MissingDepsBox = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
  padding: 4px 6px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.warningSoft ?? 'rgba(220, 160, 0, 0.10)'};
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.warningBase ?? '#e0a020'};
`;
const ImportBtn = styled.button`
  all: unset;
  cursor: pointer;
  padding: 2px 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.primaryBase};
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalSmall};
  &:hover { filter: brightness(1.1); }
  &:disabled { opacity: 0.5; cursor: default; }
`;

// ----- component -----------------------------------------------------------

type Props = {
  projectPath: string;
  loaded: LoadedState | null;
  /** Current paint brush — null = nothing to save. */
  selectedBrush: Brush | null;
  /** Active layer's flat index — captured into stamps so they remember
   *  which layer was the "anchor" at save time. */
  activeLayer: number;
  /** All layers currently selected (Ctrl-multi-select). Captured into
   *  stamps so multi-layer painting context survives save/recall. */
  selectedLayers: number[];
  /** Set the active brush. Called when a stamp is clicked. */
  onPickBrush: (brush: Brush) => void;
  /** Restore the saved layer selection when a stamp is loaded. First arg
   *  is the new active layer, second is the full selection. */
  onPickLayers?: (active: number, all: number[]) => void;
  /** Optional richer handler: set the brush AND ensure that every layer
   *  the stamp references actually exists on the current map (creating
   *  any that don't), then restore the selection. Takes precedence over
   *  the onPickBrush + onPickLayers pair when supplied. */
  onApplyStamp?: (stamp: Stamp) => void;
  /** Triggered by the per-stamp "Import" button — adds tilesets + layers
   *  the stamp needs but the current map is missing, under a single
   *  undoable action. */
  onImportStampDeps?: (stamp: Stamp) => void | Promise<void>;
};

export const StampsPanel: React.FC<Props> = ({
  projectPath, loaded, selectedBrush, activeLayer, selectedLayers, onPickBrush, onPickLayers, onApplyStamp, onImportStampDeps,
}) => {
  const [stamps, setStamps] = useState<Stamp[]>(() => loadStamps(projectPath));
  // Re-read from storage if the project changes (different project = different library).
  useEffect(() => { setStamps(loadStamps(projectPath)); }, [projectPath]);
  // Track which stamp the user most recently picked, so the row highlights.
  const [activeStampId, setActiveStampId] = useState<string | null>(null);
  // When set, that stamp row renders an inline rename input. Set to the
  // new stamp's id immediately after Save so the user can name it without
  // a modal (`window.prompt` is blocked in Electron's renderer).
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...stamps].sort((a, b) => b.updatedAt - a.updatedAt),
    [stamps],
  );

  // Per-stamp dependency check: which tilesets and layers does this stamp
  // expect that the current map doesn't have? Surfaced as a warning badge
  // + Import button on the row, so the user explicitly opts into the
  // structural edits instead of having them happen on click.
  const depsByStampId = useMemo(() => {
    const haveTilesetKeys = new Set<string>();
    for (const ts of loaded?.tilesets ?? []) {
      haveTilesetKeys.add(normalizeTilesetKey(ts.source ?? ts.name ?? ''));
    }
    const haveLayerNames = new Set(loaded?.json.layers.map((l) => l.name) ?? []);
    const out = new Map<string, { tilesets: number; layers: number }>();
    for (const s of stamps) {
      let tilesetCount = 0;
      if (s.tilesetRefs) {
        for (const [key, tsx] of Object.entries(s.tilesetRefs)) {
          if (tsx && !haveTilesetKeys.has(normalizeTilesetKey(key))) tilesetCount++;
        }
      }
      const layerCount = (s.layerNames ?? []).filter((n) => !haveLayerNames.has(n)).length;
      out.set(s.id, { tilesets: tilesetCount, layers: layerCount });
    }
    return out;
  }, [stamps, loaded]);

  // Lazy-loaded tileset images for stamps whose tilesets aren't on the
  // current map. Without this, thumbnails for "foreign" stamps render as
  // blanks. Bumping `phantomsVersion` triggers thumbnail re-renders as
  // new entries land — we can't pass the Map itself through React's
  // shallow-equality memos otherwise.
  const phantomsRef = useRef<Map<string, PhantomTileset>>(new Map());
  const inflightRef = useRef<Set<string>>(new Set());
  const [phantomsVersion, setPhantomsVersion] = useState(0);

  useEffect(() => {
    if (!projectPath) return;
    // Build the set of tileset keys referenced by ANY stamp but missing
    // from `loaded.tilesets`. For each, kick off a fetch + decode in the
    // background; on success, store in phantomsRef + bump the version so
    // mounted StampRows re-render their thumbnails with the new bitmap.
    const have = new Set<string>();
    for (const ts of loaded?.tilesets ?? []) {
      have.add(ts.source ?? ts.name ?? '');
    }
    const wanted = new Map<string, string>(); // tilesetKey → tsxFilename
    for (const s of stamps) {
      if (!s.tilesetRefs) continue;
      for (const [key, tsx] of Object.entries(s.tilesetRefs)) {
        if (!tsx) continue;
        if (have.has(key)) continue;
        if (phantomsRef.current.has(key)) continue;
        if (inflightRef.current.has(key)) continue;
        wanted.set(key, tsx);
      }
    }
    if (wanted.size === 0) return;
    let cancelled = false;
    for (const [key, tsx] of wanted) {
      inflightRef.current.add(key);
      void loadPhantomTileset(projectPath, tsx).then((phantom) => {
        inflightRef.current.delete(key);
        if (cancelled || !phantom) return;
        phantomsRef.current.set(key, phantom);
        setPhantomsVersion((n) => n + 1);
      });
    }
    return () => { cancelled = true; };
    // We deliberately depend on stamps + loaded.tilesets — phantomsVersion
    // isn't in the deps because re-running on every bump would just no-op
    // (the wanted set is already covered) and burn a render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stamps, loaded?.tilesets, projectPath]);

  // Snapshot reference re-created on bump so React re-runs effects that
  // depend on it (the thumbnail renderer's useEffect deps).
  const phantomsForRow = useMemo(() => phantomsRef.current, [phantomsVersion]);

  const persist = useCallback((next: Stamp[]) => {
    setStamps(next);
    saveStamps(projectPath, next);
  }, [projectPath]);

  const onSaveStamp = useCallback(() => {
    if (!selectedBrush || !loaded) return;
    const defaultName = `Stamp ${stamps.length + 1}`;

    // Capture the multi-layer context. If the user has multiple layers
    // selected but the brush itself is single-layer (typical when picking
    // from the palette while having multi-selected), synthesize extras
    // that repeat the same cells on each non-active selected layer — so
    // recalling the stamp paints the pattern across all the layers the
    // user had in mind, even ones that were hidden.
    let brushToSave = selectedBrush;
    if (!brushToSave.extraLayers && selectedLayers.length > 1) {
      const extras: BrushLayer[] = [];
      for (const li of selectedLayers) {
        if (li === activeLayer) continue;
        extras.push({
          layerOffset: li - activeLayer,
          cells: brushToSave.cells.map((c) => (c ? { ...c } : null)),
        });
      }
      if (extras.length > 0) brushToSave = { ...brushToSave, extraLayers: extras };
    }

    // Layer names by selection order, with the active layer first. Lets
    // the recall path restore the same active+multi-select state.
    const layerNames: string[] = [];
    const activeName = loaded.json.layers[activeLayer]?.name;
    if (activeName !== undefined) layerNames.push(activeName);
    for (const li of selectedLayers) {
      if (li === activeLayer) continue;
      const nm = loaded.json.layers[li]?.name;
      if (nm !== undefined) layerNames.push(nm);
    }

    const stamp = brushToStamp(brushToSave, loaded.tilesets, defaultName, layerNames);
    persist([...stamps, stamp]);
    setActiveStampId(stamp.id);
    setEditingId(stamp.id);
  }, [selectedBrush, loaded, stamps, persist, selectedLayers, activeLayer]);

  const onDelete = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    persist(stamps.filter((s) => s.id !== id));
    if (activeStampId === id) setActiveStampId(null);
    if (editingId === id) setEditingId(null);
  }, [stamps, activeStampId, editingId, persist]);

  const onPickStamp = useCallback((stamp: Stamp) => {
    if (!loaded) return;
    // Block selection when the stamp has unmet dependencies — using it
    // would paint mostly-null cells and silently drop the user's intent
    // (or, worse, partially apply against the wrong tilesets). The row's
    // Import button is the only way forward in that state.
    const deps = depsByStampId.get(stamp.id);
    if (deps && (deps.tilesets > 0 || deps.layers > 0)) return;
    // Prefer the richer parent handler when available — it can auto-add
    // missing tilesets/layers before constructing the brush, so cells
    // that would otherwise fall back to null (referenced-but-absent
    // tileset) end up as real tiles. Defers brush construction to the
    // parent for that reason. Falls back to the legacy brush-only path.
    if (onApplyStamp) {
      onApplyStamp(stamp);
    } else {
      const brush = stampToBrush(stamp, loaded.tilesets);
      onPickBrush(brush);
      // No parent handler available — best-effort: just restore selection
      // for names that already exist, skip the missing ones.
      if (stamp.layerNames && stamp.layerNames.length > 0 && onPickLayers) {
        const nameToIdx = new Map<string, number>();
        loaded.json.layers.forEach((l, i) => {
          if (!nameToIdx.has(l.name)) nameToIdx.set(l.name, i);
        });
        const resolved: number[] = [];
        for (const name of stamp.layerNames) {
          const idx = nameToIdx.get(name);
          if (idx !== undefined) resolved.push(idx);
        }
        if (resolved.length > 0) onPickLayers(resolved[0], resolved);
      }
    }
    setActiveStampId(stamp.id);
  }, [loaded, onPickBrush, onPickLayers, onApplyStamp]);

  const onStartRename = useCallback((id: string) => setEditingId(id), []);
  const onCancelRename = useCallback(() => setEditingId(null), []);
  const onCommitRename = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) { setEditingId(null); return; }
    persist(stamps.map((s) => (s.id === id ? { ...s, name: trimmed, updatedAt: Date.now() } : s)));
    setEditingId(null);
  }, [stamps, persist]);

  const canSave = !!selectedBrush && !!loaded;

  return (
    <Panel>
      <Header>
        <HeaderTitle>
          Stamps <Count>({stamps.length})</Count>
        </HeaderTitle>
        <SaveBtn onClick={onSaveStamp} disabled={!canSave} title="Save the current brush as a named stamp">
          + Save
        </SaveBtn>
      </Header>
      <List>
        {sorted.length === 0 ? (
          <EmptyHint>
            Pick a tile or right-drag a rectangle on the map, then click <b>+ Save</b>.
          </EmptyHint>
        ) : (
          sorted.map((stamp) => (
            <StampRow
              key={stamp.id}
              stamp={stamp}
              tilesets={loaded?.tilesets ?? []}
              phantoms={phantomsForRow}
              missingDeps={depsByStampId.get(stamp.id) ?? { tilesets: 0, layers: 0 }}
              active={stamp.id === activeStampId}
              editing={stamp.id === editingId}
              onPick={onPickStamp}
              onDelete={onDelete}
              onStartRename={onStartRename}
              onCommitRename={onCommitRename}
              onCancelRename={onCancelRename}
              onImportDeps={onImportStampDeps}
            />
          ))
        )}
      </List>
    </Panel>
  );
};

// ----- row -----------------------------------------------------------------

type RowProps = {
  stamp: Stamp;
  tilesets: LoadedTileset[];
  /** Lazy-loaded tileset images for stamps that reference tilesets the
   *  current map doesn't have. Used as the second-tier lookup in the
   *  thumbnail renderer so off-map stamps still preview correctly. */
  phantoms: Map<string, PhantomTileset>;
  /** Counts of tilesets/layers this stamp expects but the current map
   *  doesn't have. When either is > 0, the row shows a warning + Import
   *  button to add them under a single undoable action. */
  missingDeps: { tilesets: number; layers: number };
  active: boolean;
  editing: boolean;
  onPick: (stamp: Stamp) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onStartRename: (id: string) => void;
  onCommitRename: (id: string, name: string) => void;
  onImportDeps?: (stamp: Stamp) => void | Promise<void>;
  onCancelRename: () => void;
};

const StampRow: React.FC<RowProps> = ({
  stamp, tilesets, phantoms, missingDeps, active, editing,
  onPick, onDelete, onStartRename, onCommitRename, onCancelRename, onImportDeps,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (canvasRef.current) renderStampThumbnail(canvasRef.current, stamp, tilesets, phantoms);
  }, [stamp, tilesets, phantoms]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);
  const filledCount = stamp.cells.reduce((n, c) => n + (c ? 1 : 0), 0);
  const hasMissing = missingDeps.tilesets + missingDeps.layers > 0;
  // Local "busy" flag so rapid double-clicks don't fire the import twice.
  // Reset on each new missing-deps state (which itself flips after a
  // successful import — the deps go to zero and the badge disappears).
  const [importing, setImporting] = useState(false);
  useEffect(() => { setImporting(false); }, [hasMissing]);

  // Row-level click: pick the stamp, UNLESS we're in rename mode (let the
  // input handle clicks) or the user clicked a child that handles its own
  // event (rename input, delete btn) — those stopPropagation themselves.
  const onRowClick = () => { if (!editing) onPick(stamp); };

  return (
    <Row
      $active={active}
      role="button"
      tabIndex={0}
      onClick={onRowClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onRowClick(); } }}
      title={`${stamp.name} — click to load · double-click name to rename`}
    >
      <Thumb ref={canvasRef} />
      <RowMain>
        {editing ? (
          <NameInput
            ref={inputRef}
            defaultValue={stamp.name}
            onClick={(e) => e.stopPropagation()}
            onBlur={(e) => onCommitRename(stamp.id, e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); onCommitRename(stamp.id, e.currentTarget.value); }
              else if (e.key === 'Escape') { e.preventDefault(); onCancelRename(); }
            }}
          />
        ) : (
          <StampName onDoubleClick={(e) => { e.stopPropagation(); onStartRename(stamp.id); }}>
            {stamp.name}
          </StampName>
        )}
        <StampMeta>{stamp.width}×{stamp.height} · {filledCount} tile{filledCount === 1 ? '' : 's'}</StampMeta>
        {hasMissing && onImportDeps && (
          <MissingDepsBox onClick={(e) => e.stopPropagation()}>
            <span>
              ⚠ Needs{missingDeps.tilesets > 0 ? ` ${missingDeps.tilesets} tileset${missingDeps.tilesets === 1 ? '' : 's'}` : ''}
              {missingDeps.tilesets > 0 && missingDeps.layers > 0 ? ' + ' : ''}
              {missingDeps.layers > 0 ? `${missingDeps.layers} layer${missingDeps.layers === 1 ? '' : 's'}` : ''}
            </span>
            <ImportBtn
              disabled={importing}
              onClick={async (e) => {
                e.stopPropagation();
                if (importing) return;
                setImporting(true);
                try { await onImportDeps(stamp); } finally { setImporting(false); }
              }}
              title="Add the missing tilesets and layers to this map (undoable)"
            >
              {importing ? 'Importing…' : 'Import'}
            </ImportBtn>
          </MissingDepsBox>
        )}
      </RowMain>
      <DeleteBtn onClick={(e) => onDelete(stamp.id, e)} title="Delete stamp">✕</DeleteBtn>
    </Row>
  );
};
