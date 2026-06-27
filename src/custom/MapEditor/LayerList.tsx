import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import type { LoadedState } from './mapEditorTypes';

/**
 * Tile-layer picker + authoring panel — Tiled-style.
 *
 * - Click a row to make it active. Ctrl/Cmd+click toggles its membership
 *   in the multi-layer pick pool.
 * - Click the dot at the left to toggle visibility.
 * - Drag a row up/down to reorder; a horizontal line marker shows where
 *   the row will land. The drag uses HTML5 dnd so it's keyboardless but
 *   visually responsive.
 * - Right-click a row for the context menu: New, Rename, Delete, plus
 *   Show/Hide on the row that was clicked. (More Tiled actions —
 *   Duplicate, Merge Down, Group, Lock — can land later when the bridge
 *   supports them.)
 *
 * Layer names get all the horizontal space because there are no inline
 * buttons cluttering the right edge.
 *
 * Object/image/group layers are still shown (greyed); right-click works
 * on them for Delete + Rename, but they're not selectable as paint
 * targets and don't accept drops between tile layers.
 */

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
  padding: 10px 12px;
  ${({ theme }) => theme.fonts.titlesOverline};
  color: ${({ theme }) => theme.colors.text400};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark14};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconBtn = styled.button`
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

const List = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 4px 0;
  position: relative;
`;

const Row = styled.div<{ $active: boolean; $selected: boolean; $disabled: boolean; $dragging: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px 5px 10px;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'grab')};
  background-color: ${({ $active, $selected, theme }) =>
    $active ? theme.colors.dark23 : $selected ? theme.colors.dark18 : 'transparent'};
  color: ${({ $active, $selected, $disabled, theme }) =>
    $disabled ? theme.colors.text500
      : $active || $selected ? theme.colors.text100
      : theme.colors.text400};
  ${({ theme }) => theme.fonts.normalSmall};
  /* Same solid blue stripe whether active or multi-selected — the user
     should see at a glance every layer that a right-drag pick will
     sample from. Background tint still differentiates active (solid)
     from multi-selected (subtle). */
  border-left: 3px solid ${({ $active, $selected, theme }) =>
    $active || $selected ? theme.colors.primaryBase : 'transparent'};
  opacity: ${({ $dragging }) => ($dragging ? 0.45 : 1)};
  user-select: none;
  &:hover {
    background-color: ${({ $disabled, $active, $selected, theme }) =>
      $disabled ? 'transparent'
        : $active ? theme.colors.dark23
        : $selected ? theme.colors.dark18
        : theme.colors.dark18};
  }
  &:active { cursor: ${({ $disabled }) => ($disabled ? 'default' : 'grabbing')}; }
`;

const Eye = styled.span<{ $on: boolean }>`
  width: 18px;
  text-align: center;
  opacity: ${({ $on }) => ($on ? 1 : 0.35)};
  user-select: none;
  font-family: monospace;
  cursor: pointer;
  flex-shrink: 0;
`;

const Name = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const NameInput = styled.input`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.dark14};
  border: 1px solid ${({ theme }) => theme.colors.primaryBase};
  border-radius: 4px;
  padding: 2px 6px;
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalSmall};
  outline: none;
  min-width: 0;
`;

const Kind = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
  font-size: 10px;
  text-transform: uppercase;
  flex-shrink: 0;
`;

const Lock = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
  font-size: 11px;
  flex-shrink: 0;
  cursor: help;
`;

const OpacityBar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background-color: ${({ theme }) => theme.colors.dark14};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark12};
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  min-width: 0;     /* allow inner flex children to shrink instead of overflowing */
  overflow: hidden; /* belt + suspenders: clip the slider thumb if column shrinks below safe */
`;

const OpacitySlider = styled.input`
  flex: 1 1 0;      /* explicit 0 basis so the slider shrinks to fit the column */
  min-width: 0;
  appearance: none;
  height: 4px;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.dark23};
  outline: none;
  cursor: pointer;
  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.primaryBase};
    cursor: pointer;
  }
  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.primaryBase};
    border: none;
    cursor: pointer;
  }
`;

const OpacityValue = styled.span`
  color: ${({ theme }) => theme.colors.text100};
  font-variant-numeric: tabular-nums;
  min-width: 32px;
  text-align: right;
  flex-shrink: 0;
`;

const OpacityLabel = styled.span`
  flex-shrink: 0;
`;

const DropMarker = styled.div<{ $top: number }>`
  position: absolute;
  left: 6px;
  right: 6px;
  top: ${({ $top }) => $top}px;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.primaryBase};
  border-radius: 1px;
  pointer-events: none;
  box-shadow: 0 0 6px ${({ theme }) => theme.colors.primaryBase};
`;

const ContextMenu = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  z-index: 200;
  background-color: ${({ theme }) => theme.colors.dark18};
  border: 1px solid ${({ theme }) => theme.colors.dark23};
  border-radius: 6px;
  padding: 4px 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  min-width: 180px;
`;

const MenuItem = styled.button<{ $danger?: boolean }>`
  all: unset;
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 6px 16px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ $danger, theme }) => ($danger ? theme.colors.dangerBase : theme.colors.text100)};
  cursor: pointer;
  &:hover { background-color: ${({ theme }) => theme.colors.dark23}; }
  &:disabled { opacity: 0.35; cursor: default; background-color: transparent; }
`;

const MenuSep = styled.div`
  height: 1px;
  margin: 4px 0;
  background-color: ${({ theme }) => theme.colors.dark23};
`;

type Props = {
  state: LoadedState;
  activeLayer: number;
  selectedLayers: number[];
  /** Click handler. `additive` = Ctrl/Cmd (toggle membership);
   *  `range` = Shift (replace selection with a contiguous range from the
   *  current anchor — typically `activeLayer` — up to / down to `idx`,
   *  filtered to tile layers). The two flags are mutually exclusive at
   *  the call site; if both arrive true, range wins. */
  onSelectLayer: (idx: number, additive: boolean, range?: boolean) => void;
  layerVisibility: Record<number, boolean>;
  onToggleVisibility: (idx: number) => void;
  onCollapse?: () => void;
  /** Per-folder "+" button: create a new tile layer INSIDE the given
   *  group. `groupPath` is the group layer's bridgePath (used as the
   *  parent path when placing the new layer at index 0 of the group's
   *  children). */
  onAddLayerToFolder?: (groupPath: number[]) => void;
  /** New: create a new group/folder at top-level. */
  onAddGroup?: () => void;
  onRemoveLayer?: (idx: number) => void;
  onRenameLayer?: (idx: number, name: string) => void;
  onMoveLayer?: (from: number, to: number) => void;
  /**
   * Path-based drop for above/below zones. Pass the destination parent
   * path + child index directly — avoids the ambiguity of resolving a
   * flat index when the user is dropping at the very edge of a folder
   * (no layer exists there yet, so `toBridgePath(dest)` would either
   * miss or fall into the wrong parent). MapEditorPage hands this
   * straight to the bridge's `moveLayerToPath`.
   */
  /** Move one or more layers into a parent at a specific child index.
   *  When `from` is an array of length > 1, the caller must move every
   *  source layer to the destination as a single undoable batch. Used
   *  by multi-drag after a Shift/Ctrl-built selection. */
  onMoveLayerToPath?: (from: number | number[], dstParent: number[], dstIdx: number) => void;
  /** New: drag a layer onto a folder row to move it INSIDE the folder. */
  onMoveLayerIntoGroup?: (from: number, groupIdx: number) => void;
  /** New: change a layer's opacity (0..1). LayerList renders the slider. */
  onSetLayerOpacity?: (idx: number, opacity: number) => void;
};

type ContextMenuState = { idx: number; x: number; y: number };
type DragState = {
  fromIdx: number;
  overIdx: number | null;
  /** 'above' / 'below' = sibling drop relative to overIdx. 'inside' = into folder. */
  overZone: 'above' | 'inside' | 'below' | null;
};

export const LayerList: React.FC<Props> = ({
  state, activeLayer, selectedLayers, onSelectLayer, layerVisibility, onToggleVisibility, onCollapse,
  onAddLayerToFolder, onAddGroup, onRemoveLayer, onRenameLayer, onMoveLayer, onMoveLayerToPath, onMoveLayerIntoGroup,
  onSetLayerOpacity,
}) => {
  // Per-folder expand state, keyed by `bridgePath.join('.')`. Default-
  // expanded: a folder only collapses after the user explicitly clicks
  // its chevron. We DON'T persist this — it resets on map reload.
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(() => new Set());
  const pathKey = (p?: number[]) => (p ?? []).join('.');
  const toggleFolder = (p: number[]) => setCollapsedFolders((prev) => {
    const next = new Set(prev);
    const k = pathKey(p);
    if (next.has(k)) next.delete(k); else next.add(k);
    return next;
  });

  // Scroll the active layer's row into view whenever it changes — covers
  // Ctrl+right-click jump-to-layer from the canvas, the "land on new
  // layer" effect after add-layer, and stamp-recall layer restoration.
  // Also auto-expands any collapsed ancestor folders so the row is
  // actually visible to scroll to. Skips re-collapsing the user's
  // folders when the active layer is already visible.
  const activeLayerForEffect = activeLayer; // capture for the deps array
  useEffect(() => {
    const target = state.json.layers[activeLayerForEffect];
    if (!target || target.type !== 'tilelayer') return;
    const path = target.bridgePath ?? [];
    // Expand every ancestor folder if collapsed (parent paths are
    // prefixes of `path`). Updates state synchronously — the row ref
    // becomes valid in the next render, where the effect re-runs and
    // scrolls. The deps array picks up collapsedFolders so the scroll
    // happens after the expand commit.
    setCollapsedFolders((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (let i = 1; i < path.length; i++) {
        const ancestorKey = path.slice(0, i).join('.');
        if (next.delete(ancestorKey)) changed = true;
      }
      return changed ? next : prev;
    });
    const row = rowRefs.current.get(activeLayerForEffect);
    if (row) {
      // "nearest" so we don't jump the panel when the row is already
      // on-screen — only scrolls when it genuinely isn't visible.
      row.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }, [activeLayerForEffect, state.json.layers, collapsedFolders]);

  // Build the visible row list: walk the flat layer array; skip children
  // of collapsed folders. (Flatten was already done in the renderer; here
  // we just filter for what's currently visible given collapse state.)
  type Row = { layer: typeof state.json.layers[number]; idx: number };
  const visibleRows: Row[] = React.useMemo(() => {
    const out: Row[] = [];
    // Track the path prefix of any collapsed folder we're inside.
    let skipPrefix: string | null = null;
    for (let i = 0; i < state.json.layers.length; i++) {
      const layer = state.json.layers[i];
      const p = layer.bridgePath ?? [];
      const myKey = pathKey(p);
      // If we're skipping inside a collapsed folder, drop this row if
      // it's a descendant (path starts with the collapsed prefix + '.').
      if (skipPrefix !== null) {
        if (myKey.startsWith(skipPrefix + '.')) continue;
        skipPrefix = null;
      }
      out.push({ layer, idx: i });
      if (layer.type === 'group' && collapsedFolders.has(myKey)) {
        skipPrefix = myKey;
      }
    }
    // Reverse for top-of-list = top-of-stack at EVERY depth (Tiled's
    // convention). The folder header stays first in its block; the
    // siblings under it are reversed recursively so a folder shown
    //
    //   📁 folder
    //     child A   (top — highest child idx)
    //     child B   (bottom — lowest child idx)
    //
    // matches what Tiled would show + makes "drop below child B in this
    // folder" → "lowest child idx" arithmetically. Without the recursive
    // reverse, the bottom of a folder visually was the TOP of its child
    // stack, and the drop math placed new children at the wrong end.
    const reverseSiblings = (rows: Row[]): Row[] => {
      if (rows.length <= 1) return rows;
      const header = rows[0];
      const headerDepth = header.layer.depth ?? 0;
      const childDepth = headerDepth + 1;
      // Split the descendants into sub-groups by direct-child boundary —
      // each direct child starts a sub-group that runs until the next
      // direct child OR end of the parent's range.
      const subGroups: Row[][] = [];
      let cur: Row[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const d = row.layer.depth ?? 0;
        if (d === childDepth) {
          if (cur.length) subGroups.push(cur);
          cur = [row];
        } else {
          cur.push(row);
        }
      }
      if (cur.length) subGroups.push(cur);
      return [header, ...subGroups.reverse().flatMap(reverseSiblings)];
    };
    const groups: Row[][] = [];
    let current: Row[] = [];
    for (const row of out) {
      const depth = row.layer.depth ?? 0;
      if (depth === 0) {
        if (current.length) groups.push(current);
        current = [row];
      } else {
        current.push(row);
      }
    }
    if (current.length) groups.push(current);
    return groups.map(reverseSiblings).reverse().flat();
  }, [state.json.layers, collapsedFolders]);

  const selectedSet = React.useMemo(() => new Set(selectedLayers), [selectedLayers]);

  // Inline rename state.
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  // Drag-drop reorder state.
  const [drag, setDrag] = useState<DragState | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  // Right-click context menu state.
  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  // Dismiss context menu on outside click / Esc.
  useEffect(() => {
    if (!menu) return;
    const onDown = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null); };
    // Bubble phase (NOT capture). The ContextMenu element has an
    // onMouseDown={e.stopPropagation()} below that prevents this from
    // firing when the user clicks INSIDE the menu. With capture phase
    // we'd dismiss BEFORE the MenuItem's onClick had a chance to fire —
    // React unmounts the menu on setMenu(null), so by the time mouseup
    // arrives, the target is gone and click never registers (which is
    // why Delete silently did nothing).
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const beginRename = (idx: number, currentName: string) => {
    setEditingIdx(idx);
    setEditingName(currentName);
    setMenu(null);
  };
  const commitRename = () => {
    if (editingIdx === null) return;
    const trimmed = editingName.trim();
    if (trimmed) onRenameLayer?.(editingIdx, trimmed);
    setEditingIdx(null);
    setEditingName('');
  };
  const cancelRename = () => { setEditingIdx(null); setEditingName(''); };

  // --- drag-drop -----------------------------------------------------------

  const onRowDragStart = (idx: number) => (e: React.DragEvent) => {
    const layer = state.json.layers[idx];
    if (!layer || (layer.type !== 'tilelayer' && layer.type !== 'group')) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(idx));
    setDrag({ fromIdx: idx, overIdx: idx, overZone: 'below' });
  };

  const onRowDragOver = (idx: number) => (e: React.DragEvent) => {
    if (!drag) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const row = rowRefs.current.get(idx);
    if (!row) return;
    const rect = row.getBoundingClientRect();
    const layer = state.json.layers[idx];
    const dy = e.clientY - rect.top;
    // Three zones on group rows so the user can drop INSIDE the folder:
    // top 25% = above, middle 50% = inside, bottom 25% = below.
    // Leaf rows keep 50/50 above/below.
    let zone: 'above' | 'inside' | 'below';
    if (layer?.type === 'group') {
      if (dy < rect.height * 0.25) zone = 'above';
      else if (dy > rect.height * 0.75) zone = 'below';
      else zone = 'inside';
    } else {
      zone = dy < rect.height / 2 ? 'above' : 'below';
    }
    setDrag((prev) => (prev && (prev.overIdx !== idx || prev.overZone !== zone)
      ? { ...prev, overIdx: idx, overZone: zone }
      : prev));
  };

  const onRowDrop = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!drag) return;
    const from = drag.fromIdx;
    const zone = drag.overZone ?? 'below';
    setDrag(null);
    if (from === idx && zone === 'below') return;
    if (zone === 'inside') {
      const target = state.json.layers[idx];
      if (target?.type !== 'group') return;
      // Disallow dropping a folder into its own descendant.
      const targetPath = target.bridgePath ?? [];
      const sourcePath = state.json.layers[from]?.bridgePath ?? [];
      const isDescendant = targetPath.length > sourcePath.length
        && sourcePath.every((seg, i) => seg === targetPath[i]);
      if (isDescendant) return;
      // Multi-drag: when the dragged row is part of a multi-selection,
      // move ALL selected tile layers into this folder. We route through
      // onMoveLayerToPath (which is array-aware) instead of the legacy
      // single-source onMoveLayerIntoGroup so the whole batch lands as
      // one undoable action. Drop target = end of the folder's children
      // (top of the visual list, matching the per-folder "+" placement).
      const movingMulti = selectedSet.has(from) && selectedLayers.length > 1;
      if (movingMulti && onMoveLayerToPath) {
        const childCount = state.json.layers.filter((l) => {
          const p = l.bridgePath;
          return p && p.length === targetPath.length + 1
            && targetPath.every((seg, i) => p[i] === seg);
        }).length;
        onMoveLayerToPath(selectedLayers, targetPath, childCount);
      } else {
        onMoveLayerIntoGroup?.(from, idx);
      }
      return;
    }
    // Sibling drop: derive the destination from the TARGET's bridge
    // path so we land in the right parent regardless of whether the
    // target is the last child of a folder (a flat-index-based dest
    // there would resolve to the next layer OUTSIDE the folder).
    //
    // Children are reversed visually (Tiled convention), so:
    //   'below' visually = lower child idx within the parent → dstIdx = target's childIdx
    //   'above' visually = higher child idx within the parent → dstIdx = target's childIdx + 1
    const targetLayer = state.json.layers[idx];
    const targetPath = targetLayer?.bridgePath ?? [];
    if (targetPath.length === 0) return; // shouldn't happen — every layer has a path
    const dstParent = targetPath.slice(0, -1);
    const targetChildIdx = targetPath[targetPath.length - 1];
    const dstIdx = zone === 'above' ? targetChildIdx + 1 : targetChildIdx;
    // No-op: dropping onto own position in same parent.
    const fromPath = state.json.layers[from]?.bridgePath ?? [];
    const samePosition = fromPath.length === dstParent.length + 1
      && dstParent.every((seg, i) => seg === fromPath[i])
      && fromPath[fromPath.length - 1] === dstIdx;
    if (samePosition) return;
    if (onMoveLayerToPath) {
      // Multi-drag: if the dragged row is part of the current selection
      // and that selection covers more than one layer, move ALL selected
      // tile layers to the destination as a single batch. Otherwise just
      // move the dragged one.
      const movingMulti = selectedSet.has(from) && selectedLayers.length > 1;
      onMoveLayerToPath(movingMulti ? selectedLayers : from, dstParent, dstIdx);
    } else {
      // Fallback for callers that haven't wired the new path-based
      // callback yet. The old behavior worked for top-level rows.
      const targetJsonIdx = idx;
      let dest = zone === 'above' ? targetJsonIdx + 1 : targetJsonIdx;
      if (from < dest) dest -= 1;
      if (dest < 0) dest = 0;
      if (dest >= state.json.layers.length) dest = state.json.layers.length - 1;
      if (dest === from) return;
      onMoveLayer?.(from, dest);
    }
  };

  const onRowDragEnd = () => setDrag(null);

  // Drop indicator: for above/below it's a line at the row edge; for
  // 'inside' a folder it's a tinted background highlight on the folder.
  const dropMarkerTop = (() => {
    if (!drag || drag.overIdx === null || !listRef.current) return null;
    if (drag.overZone === 'inside') return null; // styled differently
    const row = rowRefs.current.get(drag.overIdx);
    if (!row) return null;
    const listRect = listRef.current.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const base = rowRect.top - listRect.top + listRef.current.scrollTop;
    return drag.overZone === 'above' ? base - 1 : base + rowRect.height - 1;
  })();

  // --- context menu --------------------------------------------------------

  const openMenu = (idx: number) => (e: React.MouseEvent) => {
    if (editingIdx !== null) return;
    e.preventDefault();
    setMenu({ idx, x: e.clientX, y: e.clientY });
  };

  const menuLayer = menu ? state.json.layers[menu.idx] : null;
  const menuIsTile = menuLayer?.type === 'tilelayer';
  const menuIsGroup = menuLayer?.type === 'group';
  const menuVisible = menu
    ? (menu.idx in layerVisibility ? layerVisibility[menu.idx] : (menuLayer?.visible ?? true))
    : false;

  return (
    <Wrap>
      <Header>
        <span>Layers</span>
        <HeaderActions>
          {/* Layers must live inside a folder — header only offers
              "add folder", per-row "+" handles per-folder layer adds. */}
          {onAddGroup && (
            <IconBtn onClick={onAddGroup} title="Add new folder (group)">📁</IconBtn>
          )}
          {onCollapse && (
            <IconBtn onClick={onCollapse} title="Collapse panel">‹</IconBtn>
          )}
        </HeaderActions>
      </Header>
      {onSetLayerOpacity && (() => {
        // Show the active layer's opacity below the header. The value
        // comes from the layer JSON; commit on change for live preview.
        // For PSDK-style maps where most painting happens at full
        // opacity, this lives quietly out of the way until you need it.
        const active = state.json.layers[activeLayer];
        if (!active) return null;
        const opacity = active.opacity ?? 1;
        return (
          <OpacityBar>
            <OpacityLabel>Opacity</OpacityLabel>
            <OpacitySlider
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={opacity}
              onChange={(e) => onSetLayerOpacity(activeLayer, parseFloat(e.target.value))}
              title={`"${active.name}" opacity`}
            />
            <OpacityValue>{Math.round(opacity * 100)}%</OpacityValue>
          </OpacityBar>
        );
      })()}
      <List ref={listRef}>
        {visibleRows.map(({ layer, idx }) => {
          const isTile = layer.type === 'tilelayer';
          const isGroup = layer.type === 'group';
          const visible = idx in layerVisibility ? layerVisibility[idx] : layer.visible;
          const isEditing = editingIdx === idx;
          const isSelected = isTile && selectedSet.has(idx);
          const isDragging = drag?.fromIdx === idx;
          const depth = layer.depth ?? 0;
          const path = layer.bridgePath ?? [];
          const isCollapsed = isGroup && collapsedFolders.has(pathKey(path));
          const isDropTarget = drag?.overIdx === idx && drag.overZone === 'inside';

          return (
            <Row
              key={idx}
              ref={(el) => {
                if (el) rowRefs.current.set(idx, el);
                else rowRefs.current.delete(idx);
              }}
              $active={isTile && activeLayer === idx}
              $selected={isSelected || isDropTarget}
              $disabled={false}
              $dragging={!!isDragging}
              draggable={(isTile || isGroup) && !isEditing && !!onMoveLayer}
              onClick={(e) => {
                if (isEditing) return;
                if (isGroup) { toggleFolder(path); return; }
                if (isTile) onSelectLayer(idx, e.ctrlKey || e.metaKey, e.shiftKey);
              }}
              onContextMenu={openMenu(idx)}
              onDragStart={onRowDragStart(idx)}
              onDragOver={onRowDragOver(idx)}
              onDrop={onRowDrop(idx)}
              onDragEnd={onRowDragEnd}
              title={isGroup
                ? `Folder "${layer.name}" — click to expand/collapse, drop layers inside`
                : isTile
                  ? 'Click to select · Ctrl+click for multi-layer pick · Drag to reorder or onto a folder · Right-click for menu'
                  : layer.type}
              style={depth > 0 ? { paddingLeft: 10 + depth * 14 } : undefined}
            >
              {/* Chevron slot — only folders show one. Leaves keep the same
                  left padding so names align across types. */}
              {isGroup ? (
                <Eye
                  $on
                  onClick={(e) => { e.stopPropagation(); toggleFolder(path); }}
                  title={isCollapsed ? 'Expand folder' : 'Collapse folder'}
                >
                  {isCollapsed ? '▸' : '▾'}
                </Eye>
              ) : (
                <Eye
                  $on={visible}
                  onClick={(e) => { e.stopPropagation(); onToggleVisibility(idx); }}
                  title={visible ? 'Visible — click to hide' : 'Hidden — click to show'}
                >
                  {visible ? '●' : '○'}
                </Eye>
              )}
              {isEditing ? (
                <NameInput
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); commitRename(); }
                    else if (e.key === 'Escape') { e.preventDefault(); cancelRename(); }
                  }}
                />
              ) : (
                <Name onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (isTile || isGroup) beginRename(idx, layer.name);
                }}>{isGroup ? `📁 ${layer.name}` : layer.name}</Name>
              )}
              {!isTile && !isGroup && !isEditing && <Kind>{layer.type.replace('layer', '')}</Kind>}
              {isGroup && !isEditing && onAddLayerToFolder && (
                <IconBtn
                  onClick={(e) => { e.stopPropagation(); onAddLayerToFolder(path); }}
                  title={`Add a new tile layer inside "${layer.name}"`}
                  aria-label={`Add layer to ${layer.name}`}
                >
                  +
                </IconBtn>
              )}
            </Row>
          );
        })}
        {dropMarkerTop !== null && <DropMarker $top={dropMarkerTop} />}
      </List>
      {menu && menuLayer && (
        <ContextMenu $x={menu.x} $y={menu.y} onMouseDown={(e) => e.stopPropagation()}>
          {/* Layers must live inside a folder — only offer "New Tile
              Layer" when the right-click target IS a folder. */}
          {menuIsGroup && onAddLayerToFolder && menuLayer.bridgePath && (
            <MenuItem onClick={() => {
              const path = menuLayer.bridgePath ?? [];
              setMenu(null);
              onAddLayerToFolder(path);
            }}>
              New Tile Layer in this Folder
            </MenuItem>
          )}
          {onAddGroup && (
            <MenuItem onClick={() => { setMenu(null); onAddGroup(); }}>
              New Folder
            </MenuItem>
          )}
          {(menuIsGroup || onAddGroup) && <MenuSep />}
          <MenuItem
            disabled={!onRenameLayer}
            onClick={() => { if (onRenameLayer) beginRename(menu.idx, menuLayer.name); }}
          >
            Rename
          </MenuItem>
          {!menuIsGroup && (
            <MenuItem onClick={() => { setMenu(null); onToggleVisibility(menu.idx); }}>
              {menuVisible ? 'Hide Layer' : 'Show Layer'}
            </MenuItem>
          )}
          <MenuSep />
          <MenuItem
            $danger
            disabled={!onRemoveLayer}
            onClick={() => {
              setMenu(null);
              if (onRemoveLayer) onRemoveLayer(menu.idx);
            }}
          >
            {menuIsGroup ? 'Delete Folder (with contents)' : 'Delete Layer'}
          </MenuItem>
        </ContextMenu>
      )}
    </Wrap>
  );
};
