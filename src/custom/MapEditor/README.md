# Map Editor (PSDK Studio fork)

In-Studio Tiled-style editor for `.tmx` maps under `Data/Tiled/Maps/`.
Reads + writes the same files the regular Tiled desktop app would, but
without needing the user to leave Studio. Lives at route
`/world/overview` (the "Map" tab next to "Data" on the map page).

This README is for me — when I come back to this folder months from now
and need to remember what hooks into what. It is not a user manual.

---

## High-level data flow

```
Disk .tmx + .tsx + .png    (Data/Tiled/{Maps,Tilesets,Assets}/)
        │
        ▼  readMapAndAssets backend task (main process)
Bundle: { tmxBytes, tilesets:[{tsxBytes, pngBytes}] }
        │
        ▼  tiledWasm.ts (renderer side)
libtiled in WebAssembly — owns the canonical Map model
        │   - tiled_map_as_json     → JSON the renderer reads
        │   - tiled_save_map_to_bytes → bytes we write back to disk
        ▼
LoadedState { json, tilesets } in MapCanvas / PixiMapCanvas
        │
        ▼
PIXI scene-graph (one Container per layer, one Sprite per non-empty cell)
        │
        ▼
User edits → bridge mutations → JSON re-emit / live sprite updates
        │
        ▼  writeMapBytes backend task
.tmx back to disk
```

The **wasm bridge is the single source of truth** for map structure during
an editing session. JS holds a rendered mirror (`loadedRef.current.json`)
that we keep in sync after every mutation — but anything that changes
layer count / order / opacity / cell raw bits goes through the bridge so
the next `saveBytes()` includes it.

---

## File map

### Page + composition
- **`MapEditorPage.tsx`** — top-level component for `/world/overview`.
  Owns: toolbar, zoom, active layer, selected layers, brush, layer
  visibility, dirty flag, structural-undo snapshot stacks, save flow,
  Ctrl+S override, the Add-Tileset and Resize-Map dialogs, the
  hover/selection coords HUD, and per-canvas mounts (Canvas2D and PixiJS).
- **`LayerList.tsx`** — Tiled-style layer panel: visibility eye, drag to
  reorder, group folders, opacity slider, context menu (new tile layer /
  new folder / rename / delete). Calls back to MapEditorPage for every
  structural op.
- **`TilesetPalette.tsx`** — right-side tileset tabs + image view. Drag
  selects an N×M brush; click is a 1×1 pick. Zoom is CSS-sized (canvas
  intrinsic resolution stays sharp, CSS up-scales via `image-rendering:
  pixelated`). The "scroll to picked tile" effect re-centers the canvas
  when a Ctrl+right-click pick on the map jumps to another tileset.
- **`CollapsibleWorldNav.tsx`** — Studio's `WorldNavigation` panel
  wrapped so the user can collapse it to claw back horizontal space.
- **`AddTilesetDialog.tsx`** — modal listing `.tsx` files in
  `Data/Tiled/Tilesets/`, plus a "From tileset image…" branch that
  copies a user-picked image into `Data/Tiled/Assets/` and generates a
  new `.tsx`.
- **`ResizeMapDialog.tsx`** — width/height/offset inputs for the
  resize/crop/shift operation.
- **`AnimationEditor.tsx`** — Tiled-style per-tile animation editor.
  Opens when the user has exactly one tile selected and clicks the
  palette toolbar button `🎞`. Reads the `.tsx` bytes off disk, DOM-mutates
  the `<tile id="X"><animation><frame …/></animation></tile>` for the
  target, writes back via `write-tileset-bytes`. Live preview plays the
  in-progress animation; click tiles in the embedded tileset view to
  append frames; per-frame ms input + up/down/× actions.
- **`BulkAnimationEditor.tsx`** — Tiled "Bulk Animation Editor" plugin
  port. Opens when `🎞` is clicked with more than one tile selected.
  Builds an animation for *every* selected base tile by walking from
  that tile in a chosen direction (Right / Down / Both) with a given
  per-frame stride. Stride defaults to the bounding-box dims of the
  selection. Frames=0 means "walk until the next step leaves the
  tileset". One backend round-trip writes every animation at once.
- **`animBadge.ts`** — Helper that draws the film-strip-style "this tile
  is animated" badge at the bottom of a tile. Shared by both
  `TilesetPalette` (main palette) and `AnimationEditor` (picker pane)
  so the look stays consistent.

### Renderers
Two implementations behind a runtime toggle in the toolbar:

- **`MapCanvas.tsx`** — Canvas2D renderer. Editing-complete. Per-layer
  offscreen canvases composited each frame. Lower memory ceiling, slower
  on big animated maps.
- **`pixi/PixiMapCanvas.tsx`** — PixiJS / WebGL renderer. One PIXI
  `Container` per layer; one PIXI `Sprite` per non-empty cell; an
  `animSpritesRef[]` of `{sprite, frames, baseTexCache}` driven by a
  global elapsed-time rAF loop. Tilesets bigger than the GPU
  `MAX_TEXTURE_SIZE` (umbra_autotiles is 256×20128) are sliced into
  horizontal **bands** in `buildTilesetBands`.

Both expose the **same `MapCanvasHandle`** ref API (see
`MapCanvas.tsx`'s `Props.ref` block) so MapEditorPage doesn't care
which is mounted.

### Bridge
- **`tiledWasm.ts`** — TS wrapper around the wasm exports. `TiledMap`
  class lifetimes a map handle, exposes `setCellAtPath`, `addTileLayer`,
  `addGroupLayer`, `moveLayerToPath`, `setLayerOpacityAtPath`, etc.
- **`wasm/tiled_bridge.{js,wasm}`** — Emscripten artifacts. See
  `wasm/README.md` for the rebuild story; the C++ source is in a
  sibling repo (`tiled-wasm/tiled_bridge.cpp`) — not in this Studio fork.

---

## Critical conventions

### Path-based layer addressing
Layers can be nested inside `<group>` elements. Every bridge function
that touches a layer takes an **int32 path array** that walks the tree:

- `[3]` → top-level layer at index 3
- `[3, 1]` → child 1 of the group at top-level index 3
- `[3, 1, 0]` → first child of that child (if it too is a group)

`flattenLayerTree` in PixiMapCanvas produces a document-order list with
synthetic fields `bridgePath: number[]`, `depth`, `ancestorNames`. The
**JS flat index** (`activeLayer`, `selectedLayers`, `layerVisibility`
keys) refers to position in that flat list. `toBridgePath(flatIdx)` in
MapEditorPage is the only conversion site.

**Cross-parent moves**: `tiled_move_layer_to_path` in the bridge handles
the take-then-insert index-shift internally — when src and dst share a
prefix and src is removed first, sibling indices below it shift down by
one. Don't do that adjustment in JS. (The old `adjustDstParentForRemoval`
helper has been deleted.)

### Two undo stacks + a time-ordered ledger
- **Cell-paint undo**: granular per-cell `HistoryEntry { layerIdx, x, y,
  oldRaw }` lists. Lives inside `MapCanvas` / `PixiMapCanvas`. `Ctrl+Z`,
  `Ctrl+Y`, the toolbar button all reach it via `canvasRef.current.undo()`.
- **Structural undo**: `.tmx`-byte snapshots taken before any layer
  add/del/move/rename, group create, resize, opacity, or add-tileset.
  Lives in `structUndoRef` / `structRedoRef` on MapEditorPage.
  Restore is **fully in-memory** via the canvas's `replaceMapFromBytes`
  (opens a new wasm map from the snapshot bytes, swaps the handle,
  rebuilds the scene). NO disk writes — `.tmx` only persists when the
  user clicks Save.
- **`actionUndoRef` ledger**: a chronologically-ordered list of action
  kinds (`'paint' | 'structural'`) lives on MapEditorPage. Every
  snapshot push records `'structural'`; every paint `commitBatch`
  records `'paint'` via the canvas's `onPaintCommit` callback (distinct
  from `onHistoryChange` so undo/redo don't double-count). `onUndoRef`
  pops the ledger to decide WHICH underlying stack to drain — so
  `Ctrl+Z` walks in real time order regardless of action kind.

The `onPaintCommit` callback is what bridges the canvas's internal
paint commits into the parent's ledger. Without it, paint actions
would have to be inferred from `onHistoryChange`, which also fires on
undo/redo and would inflate the ledger incorrectly.

### `flip-preserving` cell writes
Tile cells in libtiled carry rotation/flip flags in the top 3 bits of
the GID. When painting, we use `setCellRawAtPath(path, x, y, raw)` to
preserve flags from the brush; the bridge's `setCellAt` accepts a tile
ID only and clears flags. The renderer always paints from raw.

### Save model + Studio's `mapsModified`
Studio tracks "this map's on-disk content has changed vs. what Studio
last cached" via `globalState.mapsModified`. The map editor integrates as
follows (see `onSave` in MapEditorPage):

1. `saveBytes` writes the new `.tmx` (atomic temp-rename via the
   `writeMapBytes` backend task).
2. **Eagerly** removes the current map from `mapsModified` so the dot
   drops immediately — even if step 3 fails.
3. `refreshStudioCacheForMap` calls `convertTiledMapToTileMetadata` to
   regenerate Studio's tile-metadata cache + sha1/mtime, so the
   focus-driven `useCheckMapsModified` doesn't re-flag the map.

The yellow dot in the map tree + the yellow icon-only button in
`MapFrame` are surfaced when the current map is in `mapsModified`.
Clicking either fires a **single-map update** via `useMapUpdate({ type:
'auto_detection', subsetDbSymbols: [dbSymbol] })`.

### Ctrl+S override
While `MapEditorPage` is mounted it claims `setSaveShortcutOverride`
(`src/hooks/saveShortcutOverride.ts`) with its `onSave`. `SaveProjectButton`
checks `getSaveShortcutOverride()` before its default save flow — so
Ctrl+S in the map editor saves the current map only and skips Studio's
project-save prompt. Released on unmount.

### Renderer-quality gotchas
- **Integer cell coords only** when placing sprites. Sub-pixel positions
  cause shimmer with `image-rendering: pixelated`.
- **Bottom-left anchor** for cells, not top-left — Tiled uses
  bottom-left for `tileheight > tilewidth` tiles. `syncSpriteAt` adjusts.
- **D-flag flip**: Tiled's diagonal-flip flag means `rotate(90deg) +
  scale(1, -1)`, not a simple rotate. Don't simplify it.
- **Animations**: a single global `elapsed` counter (rAF-incremented)
  drives every animated sprite — guarantees all instances of the same
  tile animate in lock-step, matching Tiled.
- **MapWriter path arg is the parent DIRECTORY, not the full filename**
  — pass `QFileInfo(fullPath).absolutePath()` in the bridge, or libtiled
  treats the filename as a dir and produces `../../Tilesets/foo.tsx`
  references. We also defensively collapse those in JS via
  `fixTilesetSourcesInTmx` after save.
- **Force CSV layer-data in `tiled_map_as_json`**: `setLayerDataFormat(CSV)`
  before `toVariant`, restore after. libtiled's
  `MapToVariantConverter` emits base64+gzip layer data as a STRING when
  the .tmx asked for it, which our reader doesn't handle.

---

## Add-tileset flow

Two branches in `AddTilesetDialog.tsx`:

1. **Existing `.tsx`** — original behaviour. Picks a file from
   `Data/Tiled/Tilesets/`, MapEditorPage's `onAddTileset`:
   1. Snapshots in-memory edits via `saveBytes()` so unsaved work isn't
      lost, AND pushes a structural-undo snapshot.
   2. DOM-parses the `.tmx` XML, inserts a new
      `<tileset firstgid="…" source="../Tilesets/X.tsx"/>` before the
      first `<layer>` (or after the last existing `<tileset>`).
   3. Reads the new `.tsx` bytes + its image bytes off disk (existing
      files; we don't write the `.tmx`).
   4. Calls the canvas's `addTilesetInMemory` which pushes the new
      `.tsx` + image into the wasm MEMFS, opens the modified `.tmx`
      bytes into a fresh wasm handle, decodes the image bitmap, builds
      its texture cache, and rebuilds the scene. NO disk writes — the
      `.tmx` only persists when the user clicks Save.
2. **From tileset image…** — opens OS file picker, asks for name + tile
   size + optional transparent color, then calls the
   `create-tileset-from-image` backend task
   (`src/backendTasks/createTilesetFromImage.ts`). That task copies the
   image to `Data/Tiled/Assets/<name>.<ext>`, writes a new `.tsx` to
   `Data/Tiled/Tilesets/<name>.tsx` with computed columns/tilecount,
   atomically (rolls back the image copy on failure). Refuses to
   overwrite an existing `.tsx` or asset. After success, falls through
   to the same `onAddTileset(tsxFilename)` path.

libtiled recomputes `firstgid` values on read from accumulated
`nextTileId()`, so the value we write in the XML is purely cosmetic for
monotonicity.

---

## Studio integration touchpoints (search keys)

When this stuff drifts, these are the files to inspect:

- **Route registration** — `src/views/router.tsx` maps `/world/overview`
  to `Overview.page.tsx`, which re-exports `MapEditorPage`.
- **Tabs bar** — `Map.page.tsx` and `MapEditorPage.tsx` both render
  `DatabaseTabsBar` with `[Data, Map]`. Keep their tab definitions in
  sync.
- **Modified-dot per row** —
  `src/views/components/world/map/tree/MapTreeComponent.tsx`
  (`isModified`, `updateSingleMap`). Styles in
  `tree/style/TreeStyle.tsx` (`.modified-indicator`).
- **Yellow update-all button** — `MapMenu.tsx`
  (`ModifiedUpdateMapButton` + `handleUpdateAll`).
- **Yellow icon button on map header** — `MapFrame.tsx`
  (`InlineUpdateButton`). Wired up in `Map.page.tsx` via
  `isModified` + `onUpdateMap` + `updateDisabled` props.
- **Single-map update support** — `useMapUpdate` accepts
  `subsetDbSymbols`; `getTmxList` filters by it (`hooks/useMapUpdate/`).
- **Ctrl+S override** — `src/hooks/saveShortcutOverride.ts`,
  consumed by `SaveProjectButton.tsx`.

---

## Backend tasks owned by the fork

(In `src/backendTasks/`, registered in `src/main/index.ts` and exposed
to the renderer via `src/preload.ts`.)

- `readMapBytes` / `writeMapBytes` — bytes round-trip for the `.tmx`.
- `readMapAndAssets` — `.tmx` + every referenced `.tsx` + every `.png`
  bundled in one IPC call. Strips XML comments to make the regex scan
  in there safe.
- `createTilesetFromImage` — described above. Path-locked to
  `Data/Tiled/{Tilesets,Assets}/`.
- `readTilesetBytes` / `writeTilesetBytes` — single-file `.tsx` round-trip
  used by the animation editor. Atomic temp-rename on write. Path-locked
  to `Data/Tiled/Tilesets/`.

---

## Debug flag

PixiMapCanvas has an end-to-end paint-chain logger gated behind a
localStorage key:

```js
localStorage.MAP_EDITOR_DEBUG = '1'   // then reload Studio
localStorage.removeItem('MAP_EDITOR_DEBUG')  // to turn off
```

Categories (each line is prefixed `[me:<cat>]`):

| Category | What you'll see |
|---|---|
| `load`    | Initial map open: layer count, per-layer dims + `data.length` + bridge path |
| `rebuild` | Same dump after every structural rebuild (addLayer, undo, …) |
| `layer`   | `addTileLayer` / `addGroupLayer` outcomes |
| `click`   | Paint mousedown — active layer index, brush size |
| `stamp`   | Per-cell: old raw, new gid, bridge return code, JS-side re-read (`OK` or `MISMATCH`) |
| `sync`    | sprite create/update/destroy outcome per `syncSpriteAt`, or which guard caused a bail (no container? no tileset cache? gid 0?) |

Use this whenever paint isn't visibly landing. The `sync` lines will
name the exact bail point.

## When something is broken, look here first

- Cells in a layer look wrong / missing → `tiled_map_as_json` CSV-vs-base64
  case in the bridge; also the JSON shape sanity check inside
  PixiMapCanvas's load effect (it warns when sprite-count ≠ filled-cell
  count).
- Drag-into-folder silently doing nothing → bridge cross-parent shift in
  `tiled_move_layer_to_path`. Don't add the adjustment in JS — the bridge
  owns it now.
- Opacity slider freezes the canvas → check `setLayerOpacityLive` is the
  one being called (not a full `rebuildScene`). Only `onSave` / structural
  ops should rebuild.
- Black tiles for a particular tileset → texture-band check. The PNG is
  probably wider OR taller than `gl.MAX_TEXTURE_SIZE`.
- `../../Tilesets/foo.tsx` showing up in a saved `.tmx` → the MapWriter
  path-arg bug. `fixTilesetSourcesInTmx` should catch it; if it doesn't,
  the bridge is regressing on `QFileInfo(fullPath).absolutePath()`.
- Tab switch loses brush selection → that's intentional; the brush is
  scoped to the active tab. Don't "fix" it without checking palette
  state isolation first.

---

## Rebuilding the wasm bridge

Source lives in a **sibling project folder** at
`C:\Users\becra\OneDrive\Desktop\tiled-wasm\`. That folder is
self-contained — it vendors its own toolchain inside it (not a
system-wide install):

- `tiled-wasm/emsdk/` — Emscripten SDK
- `tiled-wasm/Qt/6.8.3/wasm_singlethread/` — Qt for WebAssembly
- `tiled-wasm/Qt/6.8.3/mingw_64/` — Qt host tools (needed by Qt's
  moc/rcc/etc. during the wasm build)
- `tiled-wasm/.venv/` — Python venv for aqtinstall + helpers
- `tiled-wasm/setup-env.sh` — sources all of the above onto PATH
- `tiled-wasm/CMakeLists.txt` + `tiled_bridge.cpp` — the build
- `tiled-wasm/build/` — Ninja build directory (not Make)

`emsdk`, `emmake`, `emcc`, `qmake`, etc. only exist in the shell AFTER
`setup-env.sh` is sourced. Every new terminal needs to source it again.

### Build steps (Git Bash, recommended)

```bash
cd /c/Users/becra/OneDrive/Desktop/tiled-wasm
source setup-env.sh
cmake --build build --target tiled_bridge
cp build/tiled_bridge.js build/tiled_bridge.wasm \
   "/c/Users/becra/OneDrive/Desktop/PokemonStudio - Forked/src/custom/MapEditor/wasm/"
```

`cmake --build` works with whatever generator the build directory was
configured with — here that's Ninja (see `build/build.ninja`), so under
the hood it runs `ninja tiled_bridge`. Both `tiled_bridge.js` (the
Emscripten glue) and `tiled_bridge.wasm` (the binary blob) are
required — copy them together, restart Studio.

### If `cmake --build` complains the build dir is missing or stale

Re-configure first, then build:

```bash
cd /c/Users/becra/OneDrive/Desktop/tiled-wasm
source setup-env.sh
rm -rf build
emcmake cmake -B build -G Ninja
cmake --build build --target tiled_bridge
```

`emcmake` wraps cmake so the toolchain detection picks up Emscripten's
compilers instead of the system ones.

### When NOT to rebuild

Most of the fork's work is renderer + main-process TypeScript (this
folder + `src/backendTasks/` + `src/main/index.ts` + `src/preload.ts`).
None of that needs the wasm rebuild — just stop Studio and `npm start`
again. The wasm rebuild is only needed if you actually edited
`tiled_bridge.cpp` or any of the libtiled sources the bridge pulls in.
