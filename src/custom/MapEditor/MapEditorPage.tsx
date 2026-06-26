/**
 * Fork-owned Map editor page.
 *
 * Mounted at `/world/overview` via a thin upstream shim
 * (src/views/pages/world/Overview.page.tsx).
 *
 * Layout (Tiled-inspired):
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  breadcrumb · Data/Map tabs · [Save]                    │
 *   ├──────────┬──────────────────────────────────┬───────────┤
 *   │  Layers  │   Canvas (paint with selected)   │  Tilesets │
 *   │          │                                  │  (palette)│
 *   └──────────┴──────────────────────────────────┴───────────┘
 *
 * Owns editor state (active layer, selected brush, dirty flag, layer
 * visibility overrides) and delegates rendering + bridge calls to
 * MapCanvas via a forwarded handle.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { DatabaseTabsBar } from '@components/database/DatabaseTabsBar';
import { MapBreadcrumb } from '@components/world/map';
import { useMapPage } from '@hooks/usePage';
import { useGlobalState } from '@src/GlobalStateProvider';
import { DarkButton, PrimaryButton } from '@components/buttons';
import { type Brush, type HistoryEntry, type LoadedState, type MapCanvasHandle, singleBrush, type Tool, ZOOM_STEPS, DEFAULT_ZOOM, flipBrushHorizontal, flipBrushVertical, rotateBrushCw, rotateBrushCcw } from './mapEditorTypes';
import { enforceCsvLayerData } from './tmxLayerData';
import { LayerList } from './LayerList';
import { StampsPanel, stampToBrush, normalizeTilesetKey, type Stamp } from './StampsPanel';
import { TilesetPalette } from './TilesetPalette';
import { AddTilesetDialog } from './AddTilesetDialog';
import { ResizeMapDialog } from './ResizeMapDialog';
import { AnimationEditor } from './AnimationEditor';
import { BulkAnimationEditor } from './BulkAnimationEditor';
import { useProjectMaps } from '@hooks/useProjectData';
import type { Sha1 } from '@modelEntities/sha1';
import { PixiMapCanvas } from './pixi/PixiMapCanvas';
import { setSaveShortcutOverride } from '@hooks/saveShortcutOverride';

/** Renderer selection — persisted to localStorage so it survives reloads. */
const PageStyle = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: calc(100vh - 64px);
  padding: 16px;
  gap: 12px;
  box-sizing: border-box;
`;

const TopBar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex-shrink: 0;
  /* Center the breadcrumb + Data/Map tabs row horizontally (matches the
     standard Studio overview layout). Children that need full width
     (e.g. the toolbar) override with align-self: stretch. */
  & > :first-child { align-self: center; }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const ToolGroup = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.dark16};
  border-radius: 6px;
  overflow: hidden;
`;

const ToolBtn = styled.button<{ $active?: boolean }>`
  all: unset;
  cursor: pointer;
  padding: 6px 10px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ $active, theme }) => ($active ? theme.colors.text100 : theme.colors.text400)};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.dark23 : 'transparent')};
  border-right: 1px solid ${({ theme }) => theme.colors.dark14};

  &:last-child { border-right: none; }
  &:hover {
    color: ${({ theme }) => theme.colors.text100};
    background-color: ${({ $active, theme }) => ($active ? theme.colors.dark23 : theme.colors.dark18)};
  }
`;

const SingleToolBtn = styled(ToolBtn)`
  background-color: ${({ $active, theme }) => ($active ? theme.colors.dark23 : theme.colors.dark16)};
  border-right: none;
  border-radius: 6px;
`;

// Split-button used for tool groups (Shape, Select). Left half activates
// the currently-selected sub-tool; right chevron opens a small flyout to
// pick a different one. Looks like one pill, behaves like two buttons.
const SplitWrap = styled.div`
  position: relative;
  display: flex;
  align-items: stretch;
  background-color: ${({ theme }) => theme.colors.dark16};
  border-radius: 6px;
  overflow: visible;
`;
const SplitMain = styled.button<{ $active?: boolean }>`
  all: unset;
  cursor: pointer;
  padding: 6px 8px 6px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ $active, theme }) => ($active ? theme.colors.text100 : theme.colors.text400)};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.dark23 : 'transparent')};
  border-right: 1px solid ${({ theme }) => theme.colors.dark14};
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  &:hover {
    color: ${({ theme }) => theme.colors.text100};
    background-color: ${({ $active, theme }) => ($active ? theme.colors.dark23 : theme.colors.dark18)};
  }
`;
const SplitChevron = styled.button<{ $active?: boolean; $open?: boolean }>`
  all: unset;
  cursor: pointer;
  padding: 6px 6px;
  display: flex;
  align-items: center;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ $active, theme }) => ($active ? theme.colors.text100 : theme.colors.text400)};
  background-color: ${({ $active, $open, theme }) =>
    $open ? theme.colors.dark18 : $active ? theme.colors.dark23 : 'transparent'};
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  &:hover {
    color: ${({ theme }) => theme.colors.text100};
    background-color: ${({ theme }) => theme.colors.dark18};
  }
`;
const SplitMenu = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  min-width: 160px;
  padding: 4px;
  gap: 2px;
  background-color: ${({ theme }) => theme.colors.dark16};
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
`;
const SplitMenuItem = styled.button<{ $active?: boolean }>`
  all: unset;
  cursor: pointer;
  padding: 6px 10px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ $active, theme }) => ($active ? theme.colors.text100 : theme.colors.text400)};
  background-color: ${({ $active, theme }) => ($active ? theme.colors.dark23 : 'transparent')};
  border-radius: 4px;
  &:hover {
    color: ${({ theme }) => theme.colors.text100};
    background-color: ${({ $active, theme }) => ($active ? theme.colors.dark23 : theme.colors.dark18)};
  }
`;

const ZoomBar = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.dark16};
  border-radius: 6px;
  overflow: hidden;
  & > ${ToolBtn} { padding: 6px 8px; }
`;

const ZoomInput = styled.input`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 2px 4px;
  width: 56px;
  text-align: center;
  outline: none;
  &:hover { border-color: ${({ theme }) => theme.colors.dark23}; }
  &:focus {
    border-color: ${({ theme }) => theme.colors.primaryBase};
    color: ${({ theme }) => theme.colors.text100};
  }
  /* Hide the spinner arrows — we have +/− buttons next to it. */
  &::-webkit-outer-spin-button, &::-webkit-inner-spin-button {
    -webkit-appearance: none; margin: 0;
  }
  &[type=number] { -moz-appearance: textfield; }
`;

const Spacer = styled.span` flex: 1; `;

const Workspace = styled.div<{
  $leftCollapsed: boolean;
  $rightCollapsed: boolean;
  $leftWidth: number;
  $rightWidth: number;
  $resizing: boolean;
}>`
  display: grid;
  /* Five tracks: left sidebar, drag handle, center, drag handle, right
     sidebar. The handles are real grid columns (8px) so they don't
     fight the gap math — gap stays 0 and the handles ARE the visual
     dividers. Collapsed side shrinks to a 24px rail; its drag handle
     hides (it'd be confusing to drag a collapsed rail). */
  grid-template-columns:
    ${({ $leftCollapsed, $leftWidth }) => ($leftCollapsed ? '24px' : `${$leftWidth}px`)}
    ${({ $leftCollapsed }) => ($leftCollapsed ? '0px' : '8px')}
    minmax(0, 1fr)
    ${({ $rightCollapsed }) => ($rightCollapsed ? '0px' : '8px')}
    ${({ $rightCollapsed, $rightWidth }) => ($rightCollapsed ? '24px' : `${$rightWidth}px`)};
  gap: 0;
  flex: 1;
  min-height: 0;
  /* Only animate when collapsing/expanding a rail — never during a live
     resize drag (would feel laggy). */
  transition: ${({ $resizing }) => ($resizing ? 'none' : 'grid-template-columns 120ms ease')};
`;

const ResizeHandle = styled.div<{ $hidden?: boolean }>`
  cursor: col-resize;
  background-color: transparent;
  transition: background-color 100ms;
  /* visibility:hidden (not display:none) keeps the element in the grid
     cell so siblings do not shift columns — important because the left
     handle hides when the layers panel is collapsed but the 5-column
     grid template stays. */
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
  pointer-events: ${({ $hidden }) => ($hidden ? 'none' : 'auto')};
  /* Thin visible bar inside the 8px hit area — easier to grab than a
     hairline, but doesn't waste horizontal space. */
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 3px;
    right: 3px;
    background-color: transparent;
    transition: background-color 100ms;
    border-radius: 1px;
  }
  &:hover::before, &:active::before {
    background-color: ${({ theme }) => theme.colors.primaryBase};
  }
`;

const LEFT_MIN = 160;
const LEFT_MAX = 480;
const RIGHT_MIN = 180;
const RIGHT_MAX = 600;
const DEFAULT_LEFT = 220;
const DEFAULT_RIGHT = 280;
const COLUMNS_STORAGE_KEY = 'pokemonstudio.fork.mapEditor.columns';
const LAYERS_RATIO_STORAGE_KEY = 'pokemonstudio.fork.mapEditor.layersRatio';
// Fraction of the left sidebar's vertical space allocated to the LayerList
// panel; the rest goes to StampsPanel. Clamped to [0.15, 0.85] so neither
// panel collapses to nothing — at the extremes the user can still see the
// header to grab and drag back.
const LAYERS_RATIO_MIN = 0.15;
const LAYERS_RATIO_MAX = 0.85;
const DEFAULT_LAYERS_RATIO = 0.6;

type ColumnWidths = { left: number; right: number };

const clampLeft = (n: number) => Math.max(LEFT_MIN, Math.min(LEFT_MAX, n));
const clampRight = (n: number) => Math.max(RIGHT_MIN, Math.min(RIGHT_MAX, n));
const clampLayersRatio = (n: number) => Math.max(LAYERS_RATIO_MIN, Math.min(LAYERS_RATIO_MAX, n));

const loadColumnWidths = (): ColumnWidths => {
  try {
    const raw = localStorage.getItem(COLUMNS_STORAGE_KEY);
    if (!raw) return { left: DEFAULT_LEFT, right: DEFAULT_RIGHT };
    const o = JSON.parse(raw) as Partial<ColumnWidths>;
    return {
      left: clampLeft(typeof o.left === 'number' ? o.left : DEFAULT_LEFT),
      right: clampRight(typeof o.right === 'number' ? o.right : DEFAULT_RIGHT),
    };
  } catch { return { left: DEFAULT_LEFT, right: DEFAULT_RIGHT }; }
};

const loadLayersRatio = (): number => {
  try {
    const raw = localStorage.getItem(LAYERS_RATIO_STORAGE_KEY);
    if (!raw) return DEFAULT_LAYERS_RATIO;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? clampLayersRatio(n) : DEFAULT_LAYERS_RATIO;
  } catch { return DEFAULT_LAYERS_RATIO; }
};

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

const SidebarPane = styled.div<{ $flex: number }>`
  flex: ${({ $flex }) => $flex};
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

/**
 * Thin horizontal drag handle between the two stacked sidebar panels.
 * Cursor flips to row-resize on hover; while dragging we set it on body
 * too so the cursor stays consistent even when the pointer momentarily
 * leaves the 8px strip.
 */
const VerticalSplit = styled.div`
  flex: 0 0 8px;
  cursor: row-resize;
  background: transparent;
  position: relative;
  margin: 4px 0;
  &::before {
    content: '';
    position: absolute;
    left: 12px;
    right: 12px;
    top: 50%;
    height: 2px;
    background: ${({ theme }) => theme.colors.dark22};
    border-radius: 1px;
    transform: translateY(-50%);
  }
  &:hover::before {
    background: ${({ theme }) => theme.colors.primaryBase};
  }
`;

const CanvasArea = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CoordsHud = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 6px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  font-variant-numeric: tabular-nums;
  min-height: 18px;
`;

const HudCell = styled.span`
  white-space: nowrap;
`;

const HudSep = styled.span`
  color: ${({ theme }) => theme.colors.text500};
`;

// Top-of-canvas chrome row: left = coordinate HUD, right = grid + zoom
// (moved here from the main toolbar to declutter — they're per-view
// state, not authoring tools).
const HudRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 28px;
`;
const RightHud = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CollapseRail = styled.button`
  all: unset;
  width: 24px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.dark16};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text400};
  font-family: monospace;
  font-size: 14px;
  user-select: none;

  &:hover {
    background-color: ${({ theme }) => theme.colors.dark18};
    color: ${({ theme }) => theme.colors.text100};
  }
`;

const Unavailable = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text400};
  padding: 24px;
  text-align: center;
`;

const SaveBadge = styled.span<{ $dirty: boolean }>`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ $dirty, theme }) => ($dirty ? theme.colors.warningBase : theme.colors.text500)};
  align-self: center;
`;

/**
 * libtiled's MapWriter computes external-tileset `source=` paths relative
 * to the map file's path. Our wasm bridge passes an empty path to
 * `writeMap(m, &buf, QString())`, so the writer falls back to MEMFS root
 * ("/"): a tileset mounted at `/Tilesets/foo.tsx` is written as
 * `source="Tilesets/foo.tsx"` instead of `source="../Tilesets/foo.tsx"`.
 *
 * The .tmx lives at `Data/Tiled/Maps/`, .tsx files at `Data/Tiled/Tilesets/`,
 * so the on-disk source needs the `..` to climb out of Maps/. Re-prepend
 * it before writing.
 *
 * (The proper fix is in the bridge — track the map's load path and pass
 * it to writeMap — but that needs another wasm rebuild. This JS post-
 * process is identical in effect and unblocks immediately.)
 */
const fixTilesetSourcesInTmx = (bytes: Uint8Array): Uint8Array => {
  const xml = new TextDecoder().decode(bytes);
  let fixedCount = 0;
  const fixed = xml.replace(
    /(<tileset\b[^>]*?\bsource\s*=\s*["'])([^"']+)/g,
    (full, prefix, src: string) => {
      // Bug compensation: an earlier bridge build of `writeMap` passed the
      // full .tmx path (including filename) instead of the parent dir, so
      // MapWriter computed paths off-by-one and emitted `../../Tilesets/`
      // (one extra `..`). Collapse that here so already-saved files heal
      // on the next round-trip.
      if (src.startsWith('../../Tilesets/') || src.startsWith('../../Assets/')) {
        fixedCount++;
        return `${prefix}${src.slice(3)}`; // drop one "../"
      }
      // libtiled may write external-tileset sources in two broken forms
      // when no map path is passed to MapWriter:
      //   - `Tilesets/foo.tsx`   (MEMFS root, no separator)
      //   - `/Tilesets/foo.tsx`  (MEMFS absolute path)
      // Both get resolved relative to the .tmx's Maps/ folder, missing
      // the `..` climb-out to reach the sibling Tilesets/ folder.
      //
      // Anything already starting with `../` or `Maps/` is correct on
      // disk — leave it alone. Absolute Windows paths (drive letters,
      // backslashes) are exotic enough to also leave alone.
      if (src.startsWith('../') || src.startsWith('Maps/')) return full;
      if (/^[A-Za-z]:[\\/]/.test(src)) return full; // C:\... or C:/...
      // Strip a leading slash if present, then climb out of Maps/.
      const stripped = src.startsWith('/') ? src.slice(1) : src;
      fixedCount++;
      return `${prefix}../${stripped}`;
    },
  );
  if (fixedCount > 0) {
    console.log(`[tiled] fixTilesetSourcesInTmx: rewrote ${fixedCount} tileset source(s) to use "../" prefix`);
  }
  return new TextEncoder().encode(fixed);
};

const saveBytes = async (
  projectPath: string,
  tiledFilename: string,
  bytes: Uint8Array,
): Promise<{ size: number; mtime: number }> => {
  const fixed = fixTilesetSourcesInTmx(bytes);
  // Re-encode all <data> blocks as CSV regardless of the source .tmx's
  // original encoding. Standardizes the on-disk format across the project
  // (better diffs, no half-broken libtiled base64 path) and is lossless —
  // same gids, just a different serialization. Falls back to `fixed` on
  // any parse failure.
  const csvBuf = await enforceCsvLayerData(
    fixed.buffer.slice(fixed.byteOffset, fixed.byteOffset + fixed.byteLength),
  );
  return new Promise((resolve, reject) => {
    window.api.writeMapBytes(
      { projectPath, tiledFilename, bytes: csvBuf },
      (payload) => resolve(payload),
      (err) => reject(new Error(err.errorMessage)),
    );
  });
};

// Reusable split-button dropdown for grouping related tools (Shape →
// rect/ellipse, Select → rect/sameTile/wand). Main button activates the
// currently-shown sub-tool; chevron flyouts to swap which sub-tool is
// shown + active. Closes on click-outside or Esc.
type ToolDropdownItem = { value: Tool; label: string; icon: string; title: string };
const ToolDropdown: React.FC<{
  groupLabel: string;
  items: ToolDropdownItem[];
  activeTool: Tool;
  onPick: (t: Tool) => void;
}> = ({ groupLabel, items, activeTool, onPick }) => {
  const [open, setOpen] = useState(false);
  // Remember the last sub-tool chosen via the dropdown so reopening the
  // group (after switching to an unrelated tool) restores that choice as
  // the main-button action, not items[0]. Persists in component state for
  // the editor session.
  const [lastPicked, setLastPicked] = useState<Tool>(items[0].value);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isGroupActive = items.some((i) => i.value === activeTool);
  // When something in this group is active, the main button reflects
  // *that* sub-tool. Otherwise it falls back to the last one the user
  // picked from this group, then to items[0].
  const shown = items.find((i) => i.value === activeTool)
    ?? items.find((i) => i.value === lastPicked)
    ?? items[0];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <SplitWrap ref={wrapRef}>
      <SplitMain
        $active={isGroupActive}
        onClick={() => { setLastPicked(shown.value); onPick(shown.value); setOpen(false); }}
        title={shown.title}
      >
        <span>{shown.icon}</span>
        {/* Always prefix with the group label — without it, both Fill ▾
            and Select ▾ both read "Rectangle" when on their rect sub-tool,
            which is impossible to disambiguate at a glance. */}
        <span>{groupLabel} · {shown.label}</span>
      </SplitMain>
      <SplitChevron
        $active={isGroupActive}
        $open={open}
        onClick={() => setOpen((v) => !v)}
        title={`${groupLabel}: more options`}
        aria-label={`${groupLabel} options`}
      >▾</SplitChevron>
      {open && (
        <SplitMenu role="menu">
          {items.map((it) => (
            <SplitMenuItem
              key={it.value}
              $active={it.value === activeTool}
              onClick={() => { setLastPicked(it.value); onPick(it.value); setOpen(false); }}
              title={it.title}
              role="menuitem"
            >
              <span>{it.icon}</span> <span>{it.label}</span>
            </SplitMenuItem>
          ))}
        </SplitMenu>
      )}
    </SplitWrap>
  );
};

export const MapEditorPage = () => {
  const { t } = useTranslation();
  const { map, hasMap } = useMapPage();
  const [globalState, setGlobalState] = useGlobalState();
  const { projectPath } = globalState;
  // Studio holds the map records (with cached tileMetadata + sha1 + mtime)
  // here. We refresh them after every save so the "Update modified maps"
  // banner doesn't show for maps we wrote.
  const { projectDataValues: studioMaps, setProjectDataValues: setStudioMap } = useProjectMaps();

  const canRender = hasMap && !!projectPath && !!map?.tiledFilename;

  const canvasRef = useRef<MapCanvasHandle | null>(null);
  const [loaded, setLoaded] = useState<LoadedState | null>(null);
  const [activeLayer, setActiveLayer] = useState<number>(0);
  // Layers a right-click pick should sample from. Always contains
  // activeLayer; Ctrl+click in LayerList toggles others in/out (Tiled-style
  // "Select All Layers"). When only the active is selected, picks behave
  // exactly like single-layer mode.
  const [selectedLayers, setSelectedLayers] = useState<number[]>([0]);
  const [selectedBrush, setSelectedBrush] = useState<Brush | null>(null);
  void singleBrush; // re-exported for potential future use
  const [layerVisibility, setLayerVisibility] = useState<Record<number, boolean>>({});
  // Persistent record of every layer the user has MANUALLY toggled, keyed
  // by layer name. layerVisibility is index-keyed and gets rebuilt on
  // every structural edit (move, add, remove) because indices shift —
  // we re-apply these by name during the rebuild so toggles survive.
  // Cleared on map navigation (different .tmx = different layer namespace).
  const userVisibilityRef = useRef<Record<string, boolean>>({});
  useEffect(() => {
    userVisibilityRef.current = {};
    // Switching maps invalidates the active brush — its cell indices
    // refer to the previous map's tilesets and would either resolve to
    // the wrong sprites or fall back to null on the new map. Clearing
    // forces the user to re-pick a brush from the current context.
    setSelectedBrush(null);
    clipboardBrushRef.current = null;
  }, [map?.tiledFilename]);
  // Carries a list of layer NAMES across a structural edit so onLoaded can
  // restore the corresponding flat indices once the new state lands. Used
  // by onApplyStamp when a stamp references layers that don't exist yet —
  // we create them, await the rebuild, and onLoaded picks up the names.
  const pendingStampSelectionRef = useRef<string[] | null>(null);
  // Stamp queued for brush-construction after a structural rebuild — set
  // when onApplyStamp adds layers, consumed in onLoaded once the rebuild
  // lands so the brush is built against tilesets/layers that now exist.
  const pendingStampApplyRef = useRef<Stamp | null>(null);
  // Clipboard brush — set by Ctrl+C / Ctrl+X (built from the tile
  // selection), restored by Ctrl+V. Outlives changes to the active brush
  // so paste still works after picking a different brush in between.
  const clipboardBrushRef = useRef<Brush | null>(null);
  // Latest loaded state — kept in a ref so async sequences (stamp-apply
  // chains multiple structural edits) can read fresh tilesets/layers
  // without waiting for React to re-render the `loaded` state binding.
  const loadedRef = useRef<LoadedState | null>(null);
  // Hover + selection coords HUD (shown above the canvas).
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const [selectionInfo, setSelectionInfo] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [dirty, setDirty] = useState(false);
  // History depth at the last "clean" point (load or save). Comparing
  // the current `historyPastRef.current.length` to this answers "are
  // we back where the saved file is?" — undoing every action until the
  // depth matches drops the dirty badge automatically. With the
  // unified typed history, paint AND structural ops both push onto
  // historyPastRef, so one counter handles both.
  const cleanHistoryDepthRef = useRef(0);
  const [saving, setSaving] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  // User-resizable sidebar widths. Loaded from localStorage so the
  // layout the user landed on last session is restored.
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(loadColumnWidths);
  const columnWidthsRef = useRef(columnWidths);
  columnWidthsRef.current = columnWidths;
  const [resizing, setResizing] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(columnWidths)); }
    catch { /* private mode etc. — non-fatal */ }
  }, [columnWidths]);

  // Layers/Stamps vertical split inside the left sidebar.
  const [layersRatio, setLayersRatio] = useState<number>(loadLayersRatio);
  useEffect(() => {
    try { localStorage.setItem(LAYERS_RATIO_STORAGE_KEY, String(layersRatio)); }
    catch { /* non-fatal */ }
  }, [layersRatio]);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  /**
   * Drag-resize the Layers ↔ Stamps split. Computes a new ratio from the
   * cursor's Y position relative to the sidebar's top, so the panels grow
   * proportionally with the sidebar height (which itself can change as the
   * window resizes).
   */
  const startVerticalSplit = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    setResizing(true);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev: MouseEvent) => {
      const rect = sidebar.getBoundingClientRect();
      // Subtract the handle's own thickness so the ratio reflects what
      // the panes actually get to occupy.
      const usable = Math.max(1, rect.height - 16);
      const y = ev.clientY - rect.top;
      setLayersRatio(clampLayersRatio(y / usable));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setResizing(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);

  /**
   * Drag-resize a sidebar. `which` selects left vs right; the right
   * sidebar grows when the cursor moves LEFT (toward center) so its
   * sign is inverted. Window-level listeners so the drag continues even
   * when the cursor leaves the thin handle strip — common at small
   * sidebar widths where the user's mouse overshoots the handle.
   *
   * The starting width is captured from a ref (not setState) so
   * StrictMode's double-invocation of effects can't attach duplicate
   * window listeners.
   */
  const startColumnResize = useCallback((which: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = columnWidthsRef.current[which];
    setResizing(true);
    // Body cursor + select-none keep the col-resize cursor + prevent
    // text selection across the whole window during the drag.
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const next = which === 'left' ? startW + dx : startW - dx;
      const clamp = which === 'left' ? clampLeft : clampRight;
      setColumnWidths((prev) => ({ ...prev, [which]: clamp(next) }));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      setResizing(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, []);
  const [tool, setTool] = useState<Tool>('stamp');
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState<number>(1);
  // Decoupled string state for the editable zoom field so the user can
  // type partial values (e.g. "12" on the way to "1200") without each
  // keystroke clamping or jumping. Committed on Enter / blur.
  const [zoomInputText, setZoomInputText] = useState<string>('100');
  useEffect(() => {
    // Keep the field in sync when zoom changes from elsewhere (wheel,
    // +/- buttons, Ctrl+0). Skip while the field has focus so we don't
    // overwrite mid-edit.
    if (document.activeElement?.tagName === 'INPUT') return;
    setZoomInputText(`${Math.round(zoom * 100)}`);
  }, [zoom]);
  const commitZoomInput = () => {
    const n = parseFloat(zoomInputText);
    if (!Number.isFinite(n) || n <= 0) {
      setZoomInputText(`${Math.round(zoom * 100)}`);
      return;
    }
    // Clamp to the overall zoom range; allow arbitrary values inside it
    // (not snapped to ZOOM_STEPS — the user typed a specific number).
    const clamped = Math.min(ZOOM_STEPS[ZOOM_STEPS.length - 1], Math.max(ZOOM_STEPS[0], n / 100));
    setZoom(clamped);
    setZoomInputText(`${Math.round(clamped * 100)}`);
  };
  const [addTilesetOpen, setAddTilesetOpen] = useState(false);
  const [resizeMapOpen, setResizeMapOpen] = useState(false);
  // When set, the AnimationEditor (single) or BulkAnimationEditor (multi)
  // modal mounts for that tileset + tile id selection. Cleared on
  // cancel / save. `tileIds.length === 1` → single-tile editor,
  // `> 1` → bulk editor. Decided in the JSX below.
  const [animEdit, setAnimEdit] = useState<{ tilesetIndex: number; tileIds: number[] } | null>(null);
  // Bump to force MapCanvas to re-fetch + re-parse the .tmx from disk.
  // Used after we modify the .tmx on disk (e.g. tileset add).
  const [reloadKey, setReloadKey] = useState(0);
  // Dirty is derived from history depth — see cleanHistoryDepthRef.
  // The effect re-runs every time historyEpoch bumps (push / undo / redo),
  // so undoing back to the baseline depth drops the badge automatically.

  // ============================================================
  // ACTION HISTORY (Phase 1c)
  //
  // ONE typed, chronologically-ordered list of everything the user has
  // done. Replaces the previous dual-stack model (canvas-internal paint
  // stack + parent structural snapshot stack + an action-kind ledger
  // that ordered them). The old model had three places state could
  // drift; this has one.
  //
  // Two action shapes:
  //   - 'cells'    — a paint/erase/fill batch. Cheap to store, cheap to
  //                  undo (per-cell bridge write + sprite sync).
  //   - 'snapshot' — a .tmx-byte snapshot pair (before + after) for any
  //                  op too coarse to express as cell edits (add layer,
  //                  remove layer, resize map, add tileset, …). Undo
  //                  loads `pre` into the wasm map; redo loads `post`.
  //
  // Both stay entirely in memory until the user clicks Save.
  // ============================================================

  type ActionEntry =
    | { kind: 'cells'; label: string; batch: HistoryEntry[] }
    | { kind: 'snapshot'; label: string; preBytes: Uint8Array; postBytes: Uint8Array }
    | {
        // Tile-selection mutation (wand / sameTile / Esc-clear). Tracked
        // through the same chronological history as paints + structural
        // edits, so Ctrl+Z walks selection moves in order. Layer is the
        // flat index the selection targets; -1 = no selection.
        kind: 'selection';
        label: string;
        prevCells: Set<number>;
        prevLayer: number;
        nextCells: Set<number>;
        nextLayer: number;
      };

  const HISTORY_LIMIT = 200;
  const historyPastRef = useRef<ActionEntry[]>([]);
  const historyFutureRef = useRef<ActionEntry[]>([]);
  // Bumped after every history mutation so the toolbar (which reads
  // history lengths via refs) re-evaluates its disabled / tooltip state.
  const [historyEpoch, setHistoryEpoch] = useState(0);
  const bumpHistory = useCallback(() => setHistoryEpoch((n) => n + 1), []);

  // Dirty is derived from history depth vs. last clean baseline. A snapshot
  // entry whose preBytes still differ from postBytes counts as "structurally
  // changed" even if the depth happens to match (e.g. user did one structural
  // edit, then undid it — depth 0 again, files match, badge clears).
  useEffect(() => {
    setDirty(historyPastRef.current.length !== cleanHistoryDepthRef.current);
  }, [historyEpoch]);

  /** Append a new action, truncate any future, enforce the cap. */
  const pushAction = useCallback((entry: ActionEntry) => {
    historyPastRef.current.push(entry);
    if (historyPastRef.current.length > HISTORY_LIMIT) historyPastRef.current.shift();
    historyFutureRef.current = [];
    bumpHistory();
  }, [bumpHistory]);

  /**
   * Capture a "pre" snapshot of the current wasm map. Returns a token
   * the caller pairs with `commitSnapshotAction(token, label)` once the
   * structural mutation has been applied to the wasm map.
   *
   *   const token = beginSnapshot();
   *   bridge.doSomething();
   *   commitSnapshotAction(token, 'add layer');
   *   await applyStructuralEdit();
   */
  const beginSnapshot = useCallback((): Uint8Array | null => {
    return canvasRef.current?.saveBytes() ?? null;
  }, []);

  const commitSnapshotAction = useCallback((preBytes: Uint8Array | null, label: string) => {
    if (!preBytes) return;
    const postBytes = canvasRef.current?.saveBytes();
    if (!postBytes) return;
    pushAction({ kind: 'snapshot', label, preBytes, postBytes });
  }, [pushAction]);

  /**
   * Compatibility shim. Old callsites do
   *   if (!snapshotBefore('label')) return; bridge.doThing(); await applyStructuralEdit();
   * and we don't want to touch every one of them right now. This wraps
   * the new beginSnapshot/commit pair via a microtask that runs after
   * the caller has mutated the bridge but before React's next render —
   * `applyStructuralEdit` is async, so we have a guaranteed seam.
   *
   * NOTE: the snapshot is committed in `applyStructuralEdit` (which the
   * callers always await right after). See pendingSnapshotRef below.
   */
  const pendingSnapshotRef = useRef<{ preBytes: Uint8Array; label: string } | null>(null);
  const snapshotBefore = useCallback((label: string): boolean => {
    const preBytes = beginSnapshot();
    if (!preBytes) return false;
    pendingSnapshotRef.current = { preBytes, label };
    return true;
  }, [beginSnapshot]);

  const onLoaded = useCallback((state: LoadedState) => {
    setLoaded(state);
    loadedRef.current = state;
    // Preserve the current activeLayer across reloads when it still
    // resolves to a tile layer (common case: tileset add, layer
    // authoring). Only fall back to "first tile layer" on initial load or
    // when the previous active is gone (deleted / shifted out of range).
    setActiveLayer((prev) => {
      const stillValid =
        prev >= 0 && prev < state.json.layers.length &&
        state.json.layers[prev]?.type === 'tilelayer';
      if (stillValid) return prev;
      const firstTile = state.json.layers.findIndex((l) => l.type === 'tilelayer');
      return firstTile >= 0 ? firstTile : 0;
    });
    // Drop any selected layers that no longer exist as tile layers (e.g.
    // after a delete). The new active will be re-added below.
    setSelectedLayers((prev) =>
      prev.filter((li) => li < state.json.layers.length && state.json.layers[li]?.type === 'tilelayer')
    );
    // All layers start visible. The PSDK gameplay-metadata layers
    // (systemtags / passages / terrain_tag / borders) used to be
    // auto-hidden as a convenience, but that hid content the user
    // explicitly added — surprising and asymmetric. Now we trust the
    // .tmx's `visible` attribute and only override with the user's own
    // persisted toggles (so manually hiding a layer survives a reorder).
    const initialHidden: Record<number, boolean> = {};
    state.json.layers.forEach((l, i) => {
      const userPref = userVisibilityRef.current[l.name];
      if (userPref !== undefined) initialHidden[i] = userPref;
    });
    setLayerVisibility(initialHidden);
    // Stamp-apply continuation: a stamp triggered structural edits and
    // deferred brush construction until those landed. Now the new state
    // has the tilesets/layers we need — build the brush against it.
    if (pendingStampApplyRef.current) {
      const stamp = pendingStampApplyRef.current;
      pendingStampApplyRef.current = null;
      setSelectedBrush(stampToBrush(stamp, state.tilesets));
    }
    // Stamp-pending selection restore: a stamp asked for layers by name
    // before a structural edit; now that the new state has those layers,
    // resolve names to flat indices and replace the layer selection.
    if (pendingStampSelectionRef.current) {
      const names = pendingStampSelectionRef.current;
      pendingStampSelectionRef.current = null;
      const nameToIdx = new Map<string, number>();
      state.json.layers.forEach((l, i) => {
        if (!nameToIdx.has(l.name)) nameToIdx.set(l.name, i);
      });
      const resolved: number[] = [];
      for (const n of names) {
        const idx = nameToIdx.get(n);
        if (idx !== undefined) resolved.push(idx);
      }
      if (resolved.length > 0) {
        setActiveLayer(resolved[0]);
        setSelectedLayers(resolved);
      }
    }
    setDirty(false);
    historyPastRef.current = [];
    historyFutureRef.current = [];
    cleanHistoryDepthRef.current = 0;
    bumpHistory();
  }, [bumpHistory]);

  const onToggleVisibility = useCallback((idx: number) => {
    setLayerVisibility((prev) => {
      const cur = idx in prev ? prev[idx] : loaded?.json.layers[idx]?.visible ?? true;
      const next = !cur;
      // Persist by name so the toggle survives the index-shuffling that
      // happens on layer add/remove/move (onLoaded rebuilds the index-keyed
      // map; this ref is what carries the user's intent across rebuilds).
      const name = loaded?.json.layers[idx]?.name;
      if (name !== undefined) userVisibilityRef.current[name] = next;
      return { ...prev, [idx]: next };
    });
  }, [loaded]);

  // Whenever visibility state changes, ask the canvas to fully repaint. Using
  // an effect (not a queueMicrotask in the handler) guarantees the prop has
  // landed on MapCanvas — and therefore on its visibilityRef — before the
  // redraw fires.
  useEffect(() => {
    if (loaded) canvasRef.current?.redraw();
  }, [layerVisibility, loaded]);

  // Stable trampolines — onUndoRef.current is bound in a useEffect after
  // the typed history walker has access to canvasRef + bumpHistory.
  const onUndo = useCallback(() => {
    onUndoRef.current?.();
  }, []);
  const onUndoRef = useRef<() => void>();
  const onRedo = useCallback(() => {
    onRedoRef.current?.();
  }, []);
  const onRedoRef = useRef<() => void>();

  const zoomBy = useCallback((direction: 1 | -1) => {
    setZoom((cur) => {
      const idx = ZOOM_STEPS.findIndex((z) => Math.abs(z - cur) < 0.001);
      const safe = idx === -1 ? ZOOM_STEPS.indexOf(DEFAULT_ZOOM) : idx;
      const next = Math.min(ZOOM_STEPS.length - 1, Math.max(0, safe + direction));
      return ZOOM_STEPS[next];
    });
  }, []);

  // Global hotkeys for the editor. Skipped when focus is in a form field
  // (so typing in a search box doesn't switch tools).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField = target && (
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      );
      if (inField) return;

      const meta = e.ctrlKey || e.metaKey;
      if (meta) {
        const key = e.key.toLowerCase();
        if (key === 'z' && !e.shiftKey) { e.preventDefault(); onUndo(); return; }
        if ((key === 'z' && e.shiftKey) || key === 'y') { e.preventDefault(); onRedo(); return; }
        if (key === '=' || key === '+') { e.preventDefault(); zoomBy(1); return; }
        if (key === '-' || key === '_') { e.preventDefault(); zoomBy(-1); return; }
        if (key === '0') { e.preventDefault(); setZoom(DEFAULT_ZOOM); return; }
        // Selection clipboard — Tiled parity.
        //   Ctrl+C  = build a brush from the tile selection, stash it on
        //             the clipboard ref, and set it as the active brush.
        //   Ctrl+X  = same, then erase the selected cells (one undo entry
        //             per side: erase batch + selection-clear).
        //   Ctrl+V  = restore the clipboard brush as active and switch
        //             to the stamp tool so the next click pastes it.
        // The clipboard survives picking other brushes between C and V.
        if (key === 'c' || key === 'x') {
          if (!canvasRef.current?.selectionToBrush) return;
          const b = canvasRef.current.selectionToBrush();
          if (!b) return;
          e.preventDefault();
          clipboardBrushRef.current = b;
          setSelectedBrush(b);
          if (key === 'x') canvasRef.current.eraseTileSelection?.();
          return;
        }
        if (key === 'v') {
          const b = clipboardBrushRef.current;
          if (!b) return;
          e.preventDefault();
          setSelectedBrush(b);
          setTool('stamp');
          return;
        }
        return;
      }
      // Brush flip/rotate (Tiled-parity). Only consume the key when a
      // brush is selected — otherwise let other handlers (like the layer
      // tool's S hotkey) see it.
      const lower = e.key.toLowerCase();
      if (selectedBrush && (lower === 'x' || lower === 'y' || lower === 'z')) {
        e.preventDefault();
        // Functional setSelectedBrush — chained presses (X then Z) MUST see
        // the latest brush even if React hasn't re-rendered yet between
        // keystrokes. Reading from the `selectedBrush` closure here would
        // make Z transform the PRE-X brush on rapid input.
        const shiftKey = e.shiftKey;
        setSelectedBrush((b) => {
          if (!b) return b;
          if (lower === 'x') return flipBrushHorizontal(b);
          if (lower === 'y') return flipBrushVertical(b);
          // Bind Z to CCW (per user preference) — Shift+Z does CW. Tiled's
          // default is the inverse; we deliberately follow the user here.
          return shiftKey ? rotateBrushCw(b) : rotateBrushCcw(b);
        });
        return;
      }

      // Tool hotkeys (Tiled defaults where they exist; the rest match the
      // first letter of the tool name).
      switch (lower) {
        case 'b': setTool('stamp'); break;
        case 'e': setTool('erase'); break;
        case 'f': setTool('fill'); break;
        case 'r': setTool('rect'); break;
        case 'o': setTool('ellipse'); break;
        case 'w': setTool('wand'); break;
        case 's': setTool('sameTile'); break;
        case 't': setTool('select'); break;
        case ',': setShowGrid((v) => !v); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onUndo, onRedo, zoomBy, selectedBrush]);

  // Filenames currently referenced by the .tmx — passed to AddTilesetDialog
  // so we don't double-add. Derived from the loaded state's tilesets list
  // (entries with a source attribute use a path like "../Tilesets/X.tsx";
  // we take the basename).
  const alreadyAddedTilesets = useMemo(() => {
    const set = new Set<string>();
    if (!loaded) return set;
    for (const ts of loaded.tilesets) {
      const src = (ts as { source?: string }).source;
      if (!src) continue;
      const name = src.split(/[\\/]/).pop();
      if (name) set.add(name);
    }
    return set;
  }, [loaded]);

  /**
   * Re-run Studio's `convertTiledMapToTileMetadata` for the current map
   * and merge the returned tileMetadata / sha1 / mtime into the project's
   * map record. Also drops this map from `globalState.mapsModified` so
   * the "Update modified maps" prompt doesn't reappear for files we just
   * wrote ourselves. Skips overview regeneration — that needs the Tiled
   * CLI and isn't always available.
   *
   * Failures are logged but never block the save flow — the .tmx is
   * already on disk; a stale cache only affects Studio's previews.
   */
  const refreshStudioCacheForMap = useCallback(() => {
    if (!projectPath || !map?.tiledFilename || !map.dbSymbol) return;
    const tmxPath = `${projectPath.replaceAll('\\', '/')}/Data/Tiled/Maps/${map.tiledFilename}.tmx`;
    window.api.convertTiledMapToTileMetadata(
      { tmxPath },
      (payload) => {
        const current = studioMaps[map.dbSymbol];
        if (!current) return;
        // The payload is PartialStudioMap & { mtime }; sha1 in it is a
        // plain string but Studio's StudioMap.sha1 is a branded type, so
        // we cast on assignment.
        setStudioMap({
          [map.dbSymbol]: { ...current, ...payload, sha1: payload.sha1 as Sha1 },
        });
        setGlobalState((s) => ({
          ...s,
          mapsModified: (s.mapsModified ?? []).filter((d) => d !== map.dbSymbol),
        }));
      },
      ({ errorMessage }) => {
        console.warn('[tiled] tileMetadata refresh failed:', errorMessage);
      },
    );
  }, [projectPath, map?.tiledFilename, map?.dbSymbol, studioMaps, setStudioMap, setGlobalState]);

  // Reusable inner — add a tileset reference to the map by .tsx filename.
  // Used by the AddTileset dialog AND by onApplyStamp (auto-add tilesets
  // a pasted stamp references but the current map doesn't have).
  //
  // The caller chooses whether to record a snapshot — stamp-apply manages
  // its own snapshot label across multiple structural edits so we don't
  // want a per-tileset entry polluting undo history. Returns true on
  // success, false on any failure (errors logged, caller decides flow).
  const addTilesetByFilename = useCallback(async (
    tsxFilename: string,
    opts: { snapshot: boolean } = { snapshot: true },
  ): Promise<boolean> => {
    if (!canRender || !canvasRef.current) return false;

    const bytes = canvasRef.current.saveBytes();
    if (!bytes) return false;

    // 2) Modify the .tmx XML: insert a new <tileset> reference. libtiled
    //    recomputes firstgids on read from accumulated `nextTileId()` and
    //    rewrites them on save — the value we pick here is essentially
    //    cosmetic, but using max+1 keeps it monotonic in the saved file.
    const xml = new TextDecoder().decode(bytes);
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.querySelector('parsererror')) {
      console.error('[tiled] add-tileset: .tmx XML parse error, aborting');
      return false;
    }
    const mapEl = doc.documentElement;
    const existing = Array.from(mapEl.querySelectorAll(':scope > tileset'));
    const maxFirstGid = existing.reduce((m, el) => {
      const v = parseInt(el.getAttribute('firstgid') ?? '0', 10);
      return v > m ? v : m;
    }, 0);
    const newTileset = doc.createElement('tileset');
    newTileset.setAttribute('firstgid', String(maxFirstGid + 1));
    newTileset.setAttribute('source', `../Tilesets/${tsxFilename}`);
    // Insert after the last existing <tileset>, or before the first child
    // that's a layer/group/etc. — keeps the XML in standard Tiled order.
    if (existing.length > 0) {
      existing[existing.length - 1].after(newTileset);
    } else {
      const firstChild = mapEl.querySelector(':scope > layer, :scope > group, :scope > objectgroup, :scope > imagelayer');
      if (firstChild) mapEl.insertBefore(newTileset, firstChild);
      else mapEl.appendChild(newTileset);
    }
    const updatedXml = new XMLSerializer().serializeToString(doc);
    const updatedBytes = new TextEncoder().encode(updatedXml);

    // 3) Pull the new .tsx + image bytes from disk so we can push them
    //    into the wasm MEMFS. (Both files already exist on disk — the
    //    user either picked an existing .tsx or createTilesetFromImage
    //    just wrote one. We're not touching the .tmx on disk though —
    //    that stays in memory until Save.)
    if (!projectPath) return false;
    if (opts.snapshot && !snapshotBefore('add tileset')) return false;
    let newTsxBytes: ArrayBuffer;
    try {
      newTsxBytes = await new Promise<ArrayBuffer>((resolve, reject) => {
        window.api.readTilesetBytes(
          { projectPath, tsxFilename },
          (payload) => resolve(payload.bytes),
          ({ errorMessage }) => reject(new Error(errorMessage)),
        );
      });
    } catch (e) {
      console.error('[tiled] add-tileset: failed to read new .tsx', e);
      return false;
    }
    // Parse the .tsx to find its <image source="..."/> and optional trans color.
    const tsxXml = new TextDecoder().decode(newTsxBytes);
    const tsxDoc = new DOMParser().parseFromString(tsxXml, 'application/xml');
    const imageEl = tsxDoc.documentElement?.querySelector(':scope > image');
    const imageSource = imageEl?.getAttribute('source') ?? '';
    const transAttr = imageEl?.getAttribute('trans') ?? undefined;
    const transparentColor = transAttr ? `#${transAttr}` : undefined;
    const imageFilename = imageSource.replaceAll('\\', '/').split('/').pop();
    if (!imageFilename) {
      console.error('[tiled] add-tileset: could not extract image filename from .tsx');
      return false;
    }
    let newImageBytes: ArrayBuffer;
    try {
      newImageBytes = await new Promise<ArrayBuffer>((resolve, reject) => {
        window.api.readTilesetImageBytes(
          { projectPath, imageFilename },
          (payload) => resolve(payload.bytes),
          ({ errorMessage }) => reject(new Error(errorMessage)),
        );
      });
    } catch (e) {
      console.error('[tiled] add-tileset: failed to read new image', e);
      return false;
    }

    // 4) In-memory add via the canvas's wasm-MEMFS-aware path. No .tmx
    //    written to disk — the user's pending paint edits stay in memory
    //    and the map only persists when they hit Save.
    const ok = await canvasRef.current.addTilesetInMemory?.({
      modifiedMapBytes: updatedBytes,
      newTsx: {
        relPath: `Data/Tiled/Tilesets/${tsxFilename}`,
        bytes: newTsxBytes,
      },
      newImage: {
        relPath: `Data/Tiled/Assets/${imageFilename}`,
        bytes: newImageBytes,
        transparentColor,
      },
    });
    if (!ok) {
      console.error('[tiled] add-tileset: addTilesetInMemory failed');
      return false;
    }
    setDirty(true);
    return true;
  }, [canRender, projectPath, map?.tiledFilename, snapshotBefore]);

  // Thin wrapper for the AddTileset dialog: closes the dialog + delegates.
  const onAddTileset = useCallback(async (tsxFilename: string) => {
    setAddTilesetOpen(false);
    await addTilesetByFilename(tsxFilename, { snapshot: true });
  }, [addTilesetByFilename]);

  /**
   * Round-trip a wasm-map mutation to disk: serialize the in-memory map,
   * write it, refresh Studio's cache, bump reloadKey so the canvas
   * re-fetches and rebuilds its scene from the now-current .tmx. Used by
   * every layer authoring op and the map-resize flow. Returns true on
   * success.
   */
  const persistAndReload = useCallback(async (): Promise<boolean> => {
    if (!canRender || !canvasRef.current) return false;
    const bytes = canvasRef.current.saveBytes();
    if (!bytes) return false;
    try {
      await saveBytes(projectPath!, map.tiledFilename!, bytes);
    } catch (e) {
      console.error('[tiled] persistAndReload: writeMapBytes failed', e);
      return false;
    }
    refreshStudioCacheForMap();
    setDirty(false);
    cleanHistoryDepthRef.current = historyPastRef.current.length;
    bumpHistory();
    setReloadKey((k) => k + 1);
    return true;
  }, [canRender, projectPath, map?.tiledFilename, refreshStudioCacheForMap, bumpHistory]);

  /**
   * Apply a structural edit (layer add/del/move/rename, map resize) to
   * the in-memory wasm map and refresh the on-screen scene.
   *
   * If the renderer supports in-place rebuild (PixiJS), we skip disk I/O
   * — the user's pending paint edits stay in memory and the map only
   * gets written when they hit Save. Mark dirty so the badge surfaces
   * the unsaved structural change.
   *
   * Falls back to the old persistAndReload (write + reload-from-disk)
   * for the Canvas2D path which doesn't implement rebuildScene.
   */
  const applyStructuralEdit = useCallback(async () => {
    // Commit the pending pre-snapshot (if any) into the typed history
    // by pairing it with the post-mutation bytes. This is the "and then
    // they recorded the action" half of snapshotBefore's one-shot
    // contract.
    const pending = pendingSnapshotRef.current;
    pendingSnapshotRef.current = null;
    if (pending) commitSnapshotAction(pending.preBytes, pending.label);

    const rebuilt = canvasRef.current?.rebuildScene?.() ?? false;
    if (rebuilt) {
      // Structural edit applied in-place; the typed-history push above
      // already bumped the depth, so the dirty effect will surface the
      // unsaved change on the next tick.
      return;
    }
    await persistAndReload();
  }, [persistAndReload, commitSnapshotAction]);

  /** Flat layer index → bridge path (the wasm-side address). */
  const toBridgePath = useCallback((flatIdx: number): number[] | null => {
    const layer = loaded?.json.layers[flatIdx];
    if (!layer) return null;
    const p = (layer as { bridgePath?: number[] }).bridgePath;
    return p && p.length > 0 ? p : null;
  }, [loaded]);

  // "+" button on a folder row in the LayerList: create a new tile layer
  // INSIDE that folder. The bridge always appends to the top-level list,
  // so we follow up with a moveLayerToPath into the target group at idx 0
  // (so the new layer lands at the top of the folder's children, where
  // the user is most likely looking).
  const onAddLayerToFolder = useCallback(async (groupPath: number[]) => {
    if (!canvasRef.current || !loaded) return;
    if (!groupPath || groupPath.length === 0) return;
    const existing = loaded.json.layers.map((l) => l.name);
    let suffix = existing.length + 1;
    while (existing.includes(`Tile Layer ${suffix}`)) suffix++;
    // Count the target group's current direct children so we can land
    // the new layer at the END of that list. The LayerList panel renders
    // sibling order REVERSED (highest sibling index = top of panel), so
    // "top of folder" in the user's view = last child position.
    let directChildCount = 0;
    for (const l of loaded.json.layers) {
      const p = l.bridgePath;
      if (!p || p.length !== groupPath.length + 1) continue;
      let isDirectChild = true;
      for (let i = 0; i < groupPath.length; i++) {
        if (p[i] !== groupPath[i]) { isDirectChild = false; break; }
      }
      if (isDirectChild) directChildCount++;
    }
    if (!snapshotBefore('add layer in folder')) return;
    const newIdx = canvasRef.current.addTileLayer(`Tile Layer ${suffix}`);
    if (newIdx < 0) { pendingSnapshotRef.current = null; return; }
    const ok = canvasRef.current.moveLayerToPath?.([newIdx], groupPath, directChildCount) ?? false;
    if (!ok) {
      console.warn('[layer] moveLayerToPath into folder failed; leaving new layer at top level');
    }
    // Jump to the new layer once the rebuild lands. We can't compute its
    // post-rebuild flat index synchronously (flatten depends on the new
    // group ordering), so stash the name and let onLoaded resolve it —
    // same continuation ref the stamp-apply path already uses.
    const newName = `Tile Layer ${suffix}`;
    pendingStampSelectionRef.current = [newName];
    await applyStructuralEdit();
  }, [loaded, applyStructuralEdit, snapshotBefore]);

  // Apply a stamp: PASSIVE — just set the brush from cells that resolve
  // against the current tilesets, and restore the layer selection for
  // names that already exist. No structural edits, no undo entries, no
  // wasm rebuilds. Auto-adding tilesets/layers all happens lazily in
  // ensureStampReadyForPaint on the first stroke.
  //
  // Tiled-parity: clicking a stamp loads the brush; nothing about the
  // map changes until you commit to painting with it.
  const onApplyStamp = useCallback((stamp: Stamp) => {
    if (!canvasRef.current || !loaded) return;
    const current = loadedRef.current ?? loaded;
    setSelectedBrush(stampToBrush(stamp, current.tilesets));

    const layerNames = stamp.layerNames ?? [];
    if (layerNames.length > 0) {
      const nameToIdx = new Map<string, number>();
      current.json.layers.forEach((l, i) => {
        if (!nameToIdx.has(l.name)) nameToIdx.set(l.name, i);
      });
      const resolved: number[] = [];
      for (const n of layerNames) {
        const idx = nameToIdx.get(n);
        if (idx !== undefined) resolved.push(idx);
      }
      if (resolved.length > 0) {
        setActiveLayer(resolved[0]);
        setSelectedLayers(resolved);
      }
    }
  }, [loaded]);

  // User-initiated: import every tileset + layer the stamp references
  // that the current map doesn't have. Runs as a single undoable action
  // labeled with the stamp name + counts. After import, if the imported
  // stamp is the active brush, rebuild the brush against the post-import
  // tileset list so cells resolve to real tiles instead of nulls.
  //
  // This is the "explicit button" replacement for the old auto-on-paint
  // behavior. Users see a warning badge on stamps with missing deps and
  // click Import when they're ready to commit; nothing structural happens
  // implicitly.
  const onImportStampDeps = useCallback(async (stamp: Stamp): Promise<void> => {
    const cur = loadedRef.current;
    if (!cur || !canvasRef.current) return;

    // Normalize to basename — libtiled may load a .tsx with source
    // "Tilesets/foo.tsx" while we write "../Tilesets/foo.tsx" on add.
    // Without this, a tileset we JUST imported still looks "missing" on
    // the next comparison.
    const haveKeys = new Set(cur.tilesets.map((ts) => normalizeTilesetKey(ts.source ?? ts.name ?? '')));
    const missingTilesets: string[] = [];
    if (stamp.tilesetRefs) {
      for (const [key, tsx] of Object.entries(stamp.tilesetRefs)) {
        if (!haveKeys.has(normalizeTilesetKey(key)) && tsx) missingTilesets.push(tsx);
      }
    }
    const haveLayerNames = new Set(cur.json.layers.map((l) => l.name));
    const layerNames = stamp.layerNames ?? [];
    const missingLayers = layerNames.filter((n) => !haveLayerNames.has(n));

    if (missingTilesets.length === 0 && missingLayers.length === 0) return;

    const label = `import for stamp "${stamp.name}"${missingTilesets.length ? ` (+${missingTilesets.length} tileset${missingTilesets.length === 1 ? '' : 's'})` : ''}${missingLayers.length ? ` (+${missingLayers.length} layer${missingLayers.length === 1 ? '' : 's'})` : ''}`;
    if (!snapshotBefore(label)) return;
    try {
      for (const tsx of missingTilesets) {
        const ok = await addTilesetByFilename(tsx, { snapshot: false });
        if (!ok) console.warn(`[stamp] import tileset "${tsx}" failed`);
      }
      if (missingLayers.length > 0) {
        for (const name of missingLayers) {
          const r = canvasRef.current.addTileLayer(name);
          if (r < 0) console.warn(`[stamp] import layer "${name}" failed`);
        }
        // applyStructuralEdit commits the pending snapshot and rebuilds.
        // Queue brush rebuild + selection restore through the existing
        // onLoaded continuation refs so they land against fresh state.
        pendingStampApplyRef.current = stamp;
        if (layerNames.length > 0) pendingStampSelectionRef.current = layerNames;
        await applyStructuralEdit();
      } else {
        // Tilesets only — addTilesetInMemory already rebuilt the scene
        // (via replaceMapFromBytes). Commit the snapshot manually since
        // applyStructuralEdit would double-rebuild.
        const pending = pendingSnapshotRef.current;
        pendingSnapshotRef.current = null;
        if (pending) commitSnapshotAction(pending.preBytes, pending.label);
        // Rebuild brush from post-import state so the active stamp's
        // cells resolve to the just-loaded tilesets.
        const after = loadedRef.current ?? cur;
        setSelectedBrush(stampToBrush(stamp, after.tilesets));
      }
    } catch (e) {
      console.error('[stamp] onImportStampDeps failed', e);
      pendingSnapshotRef.current = null;
    }
  }, [snapshotBefore, addTilesetByFilename, applyStructuralEdit, commitSnapshotAction]);

  const onRemoveLayer = useCallback(async (idx: number) => {
    if (!canvasRef.current || !loaded) {
      console.warn('[layer-delete] aborted: no canvas or state', { idx });
      return;
    }
    const path = toBridgePath(idx);
    if (!path) {
      console.warn('[layer-delete] aborted: no bridge path for flat idx', idx, loaded.json.layers[idx]);
      return;
    }
    const targetName = loaded.json.layers[idx]?.name;
    console.log('[layer-delete] removing', { flatIdx: idx, path, name: targetName });
    if (!snapshotBefore('delete layer')) {
      console.warn('[layer-delete] aborted: snapshotBefore failed (saveBytes returned null)');
      return;
    }
    // Reposition activeLayer BEFORE the rebuild. Using the flat-list
    // sibling search picks any non-deleted tile layer; rebuildScene's
    // onLoaded keeps this if it lands on a valid index in the new state.
    if (idx === activeLayer) {
      const candidates = loaded.json.layers
        .map((l, i) => ({ l, i }))
        .filter(({ l, i }) => i !== idx && l.type === 'tilelayer');
      const fallback = candidates.find(({ i }) => i < idx) ?? candidates[0];
      setActiveLayer(fallback ? fallback.i - (fallback.i > idx ? 1 : 0) : 0);
    } else if (idx < activeLayer) {
      setActiveLayer((a) => Math.max(0, a - 1));
    }
    const ok = canvasRef.current.removeLayerAtPath?.(path);
    console.log('[layer-delete] bridge removeLayerAtPath returned', ok);
    if (!ok) return;
    await applyStructuralEdit();
    console.log('[layer-delete] rebuild complete');
  }, [loaded, activeLayer, applyStructuralEdit, toBridgePath, snapshotBefore]);

  const onRenameLayer = useCallback(async (idx: number, name: string) => {
    if (!canvasRef.current) return;
    const path = toBridgePath(idx);
    if (!path) return;
    if (!snapshotBefore('rename layer')) return;
    if (!canvasRef.current.renameLayerAtPath?.(path, name)) return;
    await applyStructuralEdit();
  }, [applyStructuralEdit, toBridgePath, snapshotBefore]);

  const onMoveLayer = useCallback(async (from: number, to: number) => {
    if (!canvasRef.current) return;
    const fromPath = toBridgePath(from);
    const toPath = toBridgePath(to);
    if (!fromPath || !toPath) return;
    // moveLayer's classic (same-parent reorder) semantics: drop into the
    // target row's position within its own parent.
    const dstParent = toPath.slice(0, -1);
    const dstIdx = toPath[toPath.length - 1];
    if (!snapshotBefore('move layer')) return;
    // Bridge handles the take/insert index-shift internally now.
    if (!canvasRef.current.moveLayerToPath?.(fromPath, dstParent, dstIdx)) return;
    if (from === activeLayer) setActiveLayer(to);
    await applyStructuralEdit();
  }, [activeLayer, applyStructuralEdit, toBridgePath, snapshotBefore]);

  /**
   * Sibling drop that already knows the exact destination path.
   * LayerList uses this for above/below zones so we can land at
   * "child idx N+1 of folder X" — a position that has no existing
   * layer for `toBridgePath` to resolve. Bridge does the take/insert
   * shift accounting internally.
   */
  const onMoveLayerToPath = useCallback(async (from: number, dstParent: number[], dstIdx: number) => {
    if (!canvasRef.current) return;
    const fromPath = toBridgePath(from);
    if (!fromPath) return;
    if (!snapshotBefore('move layer')) return;
    if (!canvasRef.current.moveLayerToPath?.(fromPath, dstParent, dstIdx)) return;
    await applyStructuralEdit();
  }, [applyStructuralEdit, toBridgePath, snapshotBefore]);

  /**
   * Drag a layer onto a folder row — moves it INSIDE the folder (appended
   * to that folder's children). Different from `onMoveLayer` which drops
   * between rows. LayerList calls this when the drag target is a group.
   */
  const onMoveLayerIntoGroup = useCallback(async (from: number, groupIdx: number) => {
    if (!canvasRef.current || !loaded) return;
    const fromPath = toBridgePath(from);
    const groupPath = toBridgePath(groupIdx);
    if (!fromPath || !groupPath) return;
    const targetLayer = loaded.json.layers[groupIdx];
    if (targetLayer?.type !== 'group') return;
    if (!snapshotBefore('move layer into folder')) return;
    // Append: dstIdx = current child count of the group (read from JSON).
    const childCount = targetLayer.layers?.length ?? 0;
    // Adjust the group's path to account for src being taken first —
    // otherwise the take shifts later siblings (including the target
    // folder) down by 1 and the wasm side can't find the parent.
    if (!canvasRef.current.moveLayerToPath?.(fromPath, groupPath, childCount)) return;
    await applyStructuralEdit();
  }, [loaded, applyStructuralEdit, toBridgePath, snapshotBefore]);

  /**
   * Live opacity update. NO snapshot per tick (would balloon the undo
   * stack on every slider step) and NO full scene rebuild (would freeze
   * the canvas + reset other state via onLoaded). Instead we:
   *   1. Push the new value into the wasm map (so save() persists it).
   *   2. Apply it directly to the affected PIXI.Container's alpha.
   *   3. Mirror it into the React `loaded` state so the LayerList's
   *      slider display stays in sync.
   */
  const onSetLayerOpacity = useCallback((idx: number, opacity: number) => {
    if (!canvasRef.current) return;
    const path = toBridgePath(idx);
    if (!path) return;
    // 1) Persist into wasm so a subsequent Save writes the new opacity.
    canvasRef.current.setLayerOpacityAtPath?.(path, opacity);
    // 2) Live render preview (cheap; just sets container.alpha).
    canvasRef.current.setLayerOpacityLive?.(idx, opacity);
    // 3) Mirror into React state so the slider stays positioned.
    setLoaded((prev) => {
      if (!prev) return prev;
      const layers = prev.json.layers.slice();
      const layer = layers[idx];
      if (!layer) return prev;
      layers[idx] = { ...layer, opacity };
      return { ...prev, json: { ...prev.json, layers } };
    });
    setDirty(true);
  }, [toBridgePath]);

  const onAddGroup = useCallback(async () => {
    if (!canvasRef.current || !loaded) return;
    const existing = loaded.json.layers.map((l) => l.name);
    let suffix = 1;
    while (existing.includes(`Folder ${suffix}`)) suffix++;
    if (!snapshotBefore('new folder')) return;
    const newIdx = canvasRef.current.addGroupLayer?.(`Folder ${suffix}`) ?? -1;
    if (newIdx < 0) { pendingSnapshotRef.current = null; return; }
    await applyStructuralEdit();
  }, [loaded, applyStructuralEdit, snapshotBefore]);

  // ============================================================
  // UNDO / REDO — single typed history walker (Phase 1c)
  //
  // Both Ctrl+Z / Ctrl+Shift+Z and the toolbar buttons funnel through
  // onUndoRef / onRedoRef. Each call pops the most-recent ActionEntry
  // off the past stack, applies its inverse, and pushes the inverted
  // entry onto the future stack (and vice-versa for redo).
  //
  // For 'cells' actions the inverse is computed on the fly by
  // canvas.applyCellBatch — it writes each entry's `oldRaw` back and
  // returns a fresh batch whose `oldRaw` carries what was overwritten,
  // so redo can put the post-paint state back without ever touching the
  // canvas's internal undo stack.
  //
  // For 'snapshot' actions we just swap the pre/post bytes via
  // replaceMapFromBytes — the inverse of (pre, post) is (post, pre).
  // ============================================================
  useEffect(() => {
    onUndoRef.current = () => {
      const entry = historyPastRef.current.pop();
      if (!entry) return;
      if (entry.kind === 'cells') {
        const inverse = canvasRef.current?.applyCellBatch?.(entry.batch);
        if (!inverse) { historyPastRef.current.push(entry); return; }
        historyFutureRef.current.push({ kind: 'cells', label: entry.label, batch: inverse });
        setDirty(true);
        bumpHistory();
      } else if (entry.kind === 'selection') {
        // Restore the prior tile selection. Doesn't touch dirty state —
        // selection isn't part of the saved .tmx, just editor UI state.
        canvasRef.current?.setTileSelection?.(entry.prevCells, entry.prevLayer);
        historyFutureRef.current.push(entry);
        bumpHistory();
      } else {
        void (canvasRef.current?.replaceMapFromBytes?.(entry.preBytes) ?? Promise.resolve(false))
          .then((ok) => {
            if (!ok) { historyPastRef.current.push(entry); return; }
            historyFutureRef.current.push(entry);
            setDirty(true);
            bumpHistory();
          });
      }
    };
    onRedoRef.current = () => {
      const entry = historyFutureRef.current.pop();
      if (!entry) return;
      if (entry.kind === 'cells') {
        const inverse = canvasRef.current?.applyCellBatch?.(entry.batch);
        if (!inverse) { historyFutureRef.current.push(entry); return; }
        historyPastRef.current.push({ kind: 'cells', label: entry.label, batch: inverse });
        setDirty(true);
        bumpHistory();
      } else if (entry.kind === 'selection') {
        canvasRef.current?.setTileSelection?.(entry.nextCells, entry.nextLayer);
        historyPastRef.current.push(entry);
        bumpHistory();
      } else {
        void (canvasRef.current?.replaceMapFromBytes?.(entry.postBytes) ?? Promise.resolve(false))
          .then((ok) => {
            if (!ok) { historyFutureRef.current.push(entry); return; }
            historyPastRef.current.push(entry);
            setDirty(true);
            bumpHistory();
          });
      }
    };
  }, [bumpHistory]);

  const onResizeMap = useCallback(async (newW: number, newH: number, offX: number, offY: number) => {
    setResizeMapOpen(false);
    if (!canvasRef.current) return;
    if (!canvasRef.current.resizeMap(newW, newH, offX, offY)) return;
    await applyStructuralEdit();
  }, [applyStructuralEdit]);

  const onSave = useCallback(async () => {
    if (!canRender || !canvasRef.current || saving) return;
    const bytes = canvasRef.current.saveBytes();
    if (!bytes) return;
    setSaving(true);
    try {
      await saveBytes(projectPath!, map.tiledFilename!, bytes);
      setDirty(false);
      cleanHistoryDepthRef.current = historyPastRef.current.length;
      bumpHistory();
      // Clear this map's "modified" flag eagerly. The focus-based
      // useCheckMapsModified would otherwise re-flag the map on the next
      // window focus (the on-disk mtime/sha1 has changed vs. the cached
      // ones) — refreshStudioCacheForMap updates the sha1 cache, but we
      // also want the dot to drop immediately even if that round-trip
      // fails (Tiled CLI missing etc).
      if (map?.dbSymbol) {
        setGlobalState((s) => ({
          ...s,
          mapsModified: (s.mapsModified ?? []).filter((d) => d !== map.dbSymbol),
        }));
      }
      refreshStudioCacheForMap();
    } catch (e) {
      console.error('[tiled] save failed', e);
      // Could surface via a toast; for now console + leave dirty=true.
    } finally {
      setSaving(false);
    }
  }, [canRender, projectPath, map?.tiledFilename, map?.dbSymbol, saving, refreshStudioCacheForMap, setGlobalState, bumpHistory]);

  // Claim Ctrl+S while the map editor is mounted so the global save
  // shortcut saves THIS map (no project-save prompt, no full project
  // write). Released on unmount so the rest of Studio behaves normally.
  useEffect(() => {
    setSaveShortcutOverride(() => { void onSave(); });
    return () => setSaveShortcutOverride(null);
  }, [onSave]);

  return (
    <PageStyle>
      <TopBar>
        <DataBlockWrapper>
          <MapBreadcrumb />
          <DatabaseTabsBar
            currentTabIndex={1}
            tabs={[
              { label: t('data'), path: '/world/map' },
              { label: t('map'), path: '/world/overview', disabled: !canRender },
            ]}
          />
        </DataBlockWrapper>
        <Toolbar>
          {/* Authoring tools, grouped into a single rounded pill. Shape +
              Select collapse multiple sub-tools into split-button
              dropdowns so the bar stays compact. */}
          <ToolGroup>
            <ToolBtn $active={tool === 'stamp'} onClick={() => setTool('stamp')} title="Draw (B) — paint the active brush">✏ Draw</ToolBtn>
            <ToolBtn $active={tool === 'erase'} onClick={() => setTool('erase')} title="Erase (E)">⌫ Erase</ToolBtn>
          </ToolGroup>
          <ToolDropdown
            groupLabel="Fill"
            activeTool={tool}
            onPick={setTool}
            items={[
              { value: 'fill', label: 'Bucket', icon: '⛁', title: 'Flood fill (F) — fill matching cells with the brush' },
              { value: 'rect', label: 'Rectangle', icon: '▭', title: 'Rectangle fill (R) — drag to fill the brush across a rectangle' },
              { value: 'ellipse', label: 'Ellipse', icon: '◯', title: 'Ellipse fill (O) — drag to fill the brush across an ellipse' },
            ]}
          />
          <ToolDropdown
            groupLabel="Select"
            activeTool={tool}
            onPick={setTool}
            items={[
              { value: 'select', label: 'Rectangle', icon: '▢', title: 'Rectangular select (T) — drag to select cells. Shift=add, Ctrl=subtract, Ctrl+Shift=intersect, right-click=clear' },
              { value: 'sameTile', label: 'Same tile', icon: '⌖', title: 'Select same tile (S) — click to select every cell on the active layer with the same tile' },
              { value: 'wand', label: 'Magic wand', icon: '✨', title: 'Magic wand (W) — click to select contiguous cells with the same tile' },
            ]}
          />
          <SingleToolBtn onClick={() => setResizeMapOpen(true)} disabled={!loaded} title="Resize, crop, or shift the map">
            ⤢ Resize…
          </SingleToolBtn>
          <Spacer />
          <DarkButton
            onClick={onUndo}
            disabled={historyPastRef.current.length === 0}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </DarkButton>
          <DarkButton
            onClick={onRedo}
            disabled={historyFutureRef.current.length === 0}
            title="Redo (Ctrl+Shift+Z)"
          >
            ↷ Redo
          </DarkButton>
          <SaveBadge $dirty={dirty}>{dirty ? 'unsaved changes' : 'all changes saved'}</SaveBadge>
          <PrimaryButton onClick={onSave} disabled={!dirty || saving}>
            {saving ? 'Saving…' : 'Save'}
          </PrimaryButton>
        </Toolbar>
      </TopBar>
      {canRender ? (
        <Workspace
          $leftCollapsed={leftCollapsed}
          $rightCollapsed={rightCollapsed}
          $leftWidth={columnWidths.left}
          $rightWidth={columnWidths.right}
          $resizing={resizing}
        >
          {leftCollapsed ? (
            <CollapseRail
              onClick={() => setLeftCollapsed(false)}
              title="Show layers panel"
            >
              ›
            </CollapseRail>
          ) : (
            <Sidebar ref={sidebarRef}>
              <SidebarPane $flex={layersRatio}>
                {loaded && (
                  <LayerList
                    state={loaded}
                    activeLayer={activeLayer}
                    selectedLayers={selectedLayers}
                    onSelectLayer={(idx, additive) => {
                      if (additive) {
                        // Ctrl/Cmd+click — toggle this layer's membership in
                        // the multi-select. Active layer is always selected,
                        // so toggling it off is a no-op (its selection state
                        // is bound to its active state).
                        setSelectedLayers((prev) =>
                          prev.includes(idx)
                            ? (idx === activeLayer ? prev : prev.filter((i) => i !== idx))
                            : [...prev, idx]
                        );
                      } else {
                        // Plain click — make active + reset multi-select to
                        // just this layer (Tiled's behavior).
                        setActiveLayer(idx);
                        setSelectedLayers([idx]);
                      }
                    }}
                    layerVisibility={layerVisibility}
                    onToggleVisibility={onToggleVisibility}
                    onCollapse={() => setLeftCollapsed(true)}
                    onAddLayerToFolder={onAddLayerToFolder}
                    onAddGroup={onAddGroup}
                    onRemoveLayer={onRemoveLayer}
                    onRenameLayer={onRenameLayer}
                    onMoveLayer={onMoveLayer}
                    onMoveLayerToPath={onMoveLayerToPath}
                    onMoveLayerIntoGroup={onMoveLayerIntoGroup}
                    onSetLayerOpacity={onSetLayerOpacity}
                  />
                )}
              </SidebarPane>
              <VerticalSplit onMouseDown={startVerticalSplit} title="Drag to resize Layers ↔ Stamps" />
              <SidebarPane $flex={1 - layersRatio}>
                <StampsPanel
                  projectPath={projectPath!}
                  loaded={loaded}
                  selectedBrush={selectedBrush}
                  activeLayer={activeLayer}
                  selectedLayers={selectedLayers}
                  onPickBrush={setSelectedBrush}
                  onPickLayers={(active, all) => {
                    setActiveLayer(active);
                    setSelectedLayers(all);
                  }}
                  onApplyStamp={onApplyStamp}
                  onImportStampDeps={onImportStampDeps}
                />
              </SidebarPane>
            </Sidebar>
          )}
          <ResizeHandle
            $hidden={leftCollapsed}
            onMouseDown={startColumnResize('left')}
            title="Drag to resize layers panel"
          />
          <CanvasArea>
            <HudRow>
              <CoordsHud>
                {loaded ? (
                  <>
                    <HudCell>{loaded.json.width} × {loaded.json.height}</HudCell>
                    <HudSep>·</HudSep>
                    <HudCell>{hoverCell ? `[${hoverCell.x}, ${hoverCell.y}]` : '[—, —]'}</HudCell>
                    {selectionInfo && (
                      <>
                        <HudSep>·</HudSep>
                        <HudCell>selected {selectionInfo.w} × {selectionInfo.h} @ [{selectionInfo.x}, {selectionInfo.y}]</HudCell>
                      </>
                    )}
                  </>
                ) : null}
              </CoordsHud>
              <RightHud>
                <SingleToolBtn $active={showGrid} onClick={() => setShowGrid((v) => !v)} title="Toggle grid (,)">
                  ⊞ Grid
                </SingleToolBtn>
                <ZoomBar>
                  <ToolBtn onClick={() => zoomBy(-1)} title="Zoom out (Ctrl+-)">−</ToolBtn>
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
                  <ToolBtn onClick={() => zoomBy(1)} title="Zoom in (Ctrl+=)">+</ToolBtn>
                  <ToolBtn onClick={() => setZoom(DEFAULT_ZOOM)} title="Reset zoom (Ctrl+0)">1×</ToolBtn>
                </ZoomBar>
              </RightHud>
            </HudRow>
          <PixiMapCanvas
            ref={canvasRef}
            projectPath={projectPath!}
            tiledFilename={map.tiledFilename!}
            activeLayer={activeLayer}
            selectedLayers={selectedLayers}
            selectedBrush={selectedBrush}
            layerVisibility={layerVisibility}
            tool={tool}
            showGrid={showGrid}
            zoom={zoom}
            onZoomChange={setZoom}
            reloadKey={reloadKey}
            onLoaded={onLoaded}
            onDirty={() => setDirty(true)}
            onPaintCommit={(batch) => {
              if (batch.length === 0) return;
              pushAction({ kind: 'cells', label: 'paint', batch });
            }}
            onPickBrush={setSelectedBrush}
            onJumpToLayer={(idx) => { setActiveLayer(idx); setSelectedLayers([idx]); }}
            onHoverCell={setHoverCell}
            onSelectionChange={setSelectionInfo}
          />
          </CanvasArea>
          <ResizeHandle
            $hidden={rightCollapsed}
            onMouseDown={startColumnResize('right')}
            title="Drag to resize tilesets panel"
          />
          {rightCollapsed ? (
            <CollapseRail
              onClick={() => setRightCollapsed(false)}
              title="Show tilesets panel"
            >
              ‹
            </CollapseRail>
          ) : (
            <Sidebar>
              {loaded && (
                <TilesetPalette
                  state={loaded}
                  brush={selectedBrush}
                  onPickBrush={setSelectedBrush}
                  onAddTileset={() => setAddTilesetOpen(true)}
                  onCollapse={() => setRightCollapsed(true)}
                  onEditAnimation={(tilesetIndex, tileIds) => setAnimEdit({ tilesetIndex, tileIds })}
                />
              )}
            </Sidebar>
          )}
        </Workspace>
      ) : (
        <Unavailable>
          {!hasMap
            ? 'Select a map from the navigator.'
            : 'This map has no Tiled file associated.'}
        </Unavailable>
      )}
      {addTilesetOpen && canRender && (
        <AddTilesetDialog
          projectPath={projectPath!}
          alreadyAdded={alreadyAddedTilesets}
          onCancel={() => setAddTilesetOpen(false)}
          onConfirm={onAddTileset}
        />
      )}
      {resizeMapOpen && loaded && (
        <ResizeMapDialog
          currentWidth={loaded.json.width}
          currentHeight={loaded.json.height}
          loaded={loaded}
          onCancel={() => setResizeMapOpen(false)}
          onConfirm={onResizeMap}
        />
      )}
      {animEdit && loaded && loaded.tilesets[animEdit.tilesetIndex] && (
        animEdit.tileIds.length <= 1 ? (
          <AnimationEditor
            projectPath={projectPath!}
            tileset={loaded.tilesets[animEdit.tilesetIndex]}
            baseTileId={animEdit.tileIds[0] ?? 0}
            onCancel={() => setAnimEdit(null)}
            onSaved={() => {
              // The .tsx changed on disk; tell the canvas to re-fetch
              // the full bundle so the new animation is picked up by
              // the renderer's anim-index. Studio's mapsModified isn't
              // affected (animations live in the .tsx, not the .tmx).
              setAnimEdit(null);
              setReloadKey((k) => k + 1);
            }}
          />
        ) : (
          <BulkAnimationEditor
            projectPath={projectPath!}
            tileset={loaded.tilesets[animEdit.tilesetIndex]}
            baseTileIds={animEdit.tileIds}
            onCancel={() => setAnimEdit(null)}
            onSaved={() => {
              setAnimEdit(null);
              setReloadKey((k) => k + 1);
            }}
          />
        )
      )}
    </PageStyle>
  );
};
