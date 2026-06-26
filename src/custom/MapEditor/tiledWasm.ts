/**
 * Typed wrapper around the libtiled-in-WebAssembly bridge.
 *
 * The bridge is built out-of-tree from upstream Tiled at
 * `~/Desktop/tiled-wasm/` (see that folder's README) and shipped as a
 * `.js` shim + `.wasm` blob under `./wasm/`. We load both via Vite's
 * `?url` import so the asset pipeline works in dev and prod alike.
 *
 * **Why a script-tag injection and not an import?**
 * The shim is Emscripten's `MODULARIZE=1 EXPORT_ES6=0` output — a UMD-ish
 * file that assigns its factory to `var tiled_bridge_entry` and (when
 * loaded as a CJS module) hangs it off `module.exports`. Vite can't
 * `import` it as ESM. The cleanest browser-friendly load path is a plain
 * `<script>` tag; after onload the factory is a global on `window`.
 *
 * **Cell encoding.**
 * `getCell` returns a packed `uint32`: high 16 bits = tileset index, low
 * 16 = tile id, all-ones = empty. JS sees the C `uint32` as a signed int
 * when the high bit is set (0xFFFFFFFF arrives as -1), so we coerce with
 * `>>> 0` before extracting bitfields.
 *
 * **Lifecycle.**
 * `TiledModule.load()` instantiates the wasm exactly once and caches it.
 * `TiledMap` owns a handle and exposes `.dispose()` — call it when an
 * editor closes or the wasm leaks ~tens of KB per map.
 */

import bridgeScriptUrl from './wasm/tiled_bridge.js?url';
import bridgeWasmUrl from './wasm/tiled_bridge.wasm?url';

const EMPTY_CELL = 0xffffffff;
const FACTORY_GLOBAL = 'tiled_bridge_entry';

// Emscripten exposes a `_funcname` for every C export plus `_malloc`,
// `_free`, and the `HEAPU8` / `HEAPU32` views into wasm memory. We type
// just the bits we actually call rather than the full Emscripten surface.
type WasmModule = {
  HEAPU8: Uint8Array;
  HEAPU32: Uint32Array;
  _malloc: (n: number) => number;
  _free: (ptr: number) => void;
  _tiled_load_map_from_bytes: (data: number, len: number) => number;
  _tiled_free_map: (handle: number) => void;
  _tiled_last_error: () => number;
  _tiled_map_width: (h: number) => number;
  _tiled_map_height: (h: number) => number;
  _tiled_map_tile_width: (h: number) => number;
  _tiled_map_tile_height: (h: number) => number;
  _tiled_map_layer_count: (h: number) => number;
  _tiled_map_tileset_count: (h: number) => number;
  _tiled_layer_name: (h: number, layer: number) => number;
  _tiled_layer_is_tile: (h: number, layer: number) => number;
  _tiled_get_cell: (h: number, layer: number, x: number, y: number) => number;
  _tiled_set_cell: (h: number, layer: number, x: number, y: number, tsIndex: number, tileId: number) => void;
  _tiled_set_cell_raw: (h: number, layer: number, x: number, y: number, rawGid: number) => void;
  _tiled_add_tile_layer: (h: number, namePtr: number) => number;
  _tiled_remove_layer: (h: number, index: number) => number;
  _tiled_rename_layer: (h: number, index: number, namePtr: number) => number;
  _tiled_move_layer: (h: number, from: number, to: number) => number;
  _tiled_resize_map: (h: number, newW: number, newH: number, offX: number, offY: number) => number;
  // Group authoring + path-based layer addressing (v3 bridge).
  _tiled_add_group_layer: (h: number, namePtr: number) => number;
  _tiled_set_cell_at_path: (h: number, pathPtr: number, pathLen: number, x: number, y: number, tsIdx: number, tileId: number) => void;
  _tiled_set_cell_raw_at_path: (h: number, pathPtr: number, pathLen: number, x: number, y: number, rawGid: number) => void;
  _tiled_rename_layer_at_path: (h: number, pathPtr: number, pathLen: number, namePtr: number) => number;
  _tiled_remove_layer_at_path: (h: number, pathPtr: number, pathLen: number) => number;
  _tiled_move_layer_to_path: (h: number, srcPtr: number, srcLen: number, dstParentPtr: number, dstParentLen: number, dstIdx: number) => number;
  _tiled_set_layer_opacity_at_path: (h: number, pathPtr: number, pathLen: number, opacity: number) => number;
  _tiled_map_as_json: (h: number) => number;
  _tiled_tileset_as_json: (h: number, idx: number) => number;
  _tiled_free_string: (ptr: number) => void;
  _tiled_save_map_to_bytes: (h: number, outLenPtr: number) => number;
  _tiled_free_bytes: (ptr: number) => void;
  _tiled_put_virtual_file: (pathPtr: number, dataPtr: number, len: number) => number;
  _tiled_load_map_from_path: (pathPtr: number) => number;
};

/** A file from the readMapAndAssets bundle, keyed by its relative path. */
export type AssetEntry = { relPath: string; bytes: ArrayBuffer };

type FactoryOptions = {
  locateFile?: (path: string, prefix: string) => string;
  noInitialRun?: boolean;
  print?: (text: string) => void;
  printErr?: (text: string) => void;
};
type Factory = (opts?: FactoryOptions) => Promise<WasmModule>;

let modulePromise: Promise<WasmModule> | null = null;

const loadScriptOnce = (url: string): Promise<void> =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[data-tiled-bridge="1"]`)) return resolve();
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.dataset.tiledBridge = '1';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load tiled_bridge.js from ${url}`));
    document.head.appendChild(script);
  });

const readCString = (mod: WasmModule, ptr: number): string => {
  if (!ptr) return '';
  const u8 = mod.HEAPU8;
  let end = ptr;
  while (u8[end] !== 0) end++;
  return new TextDecoder().decode(u8.subarray(ptr, end));
};

const lastError = (mod: WasmModule): string => readCString(mod, mod._tiled_last_error());

export type Cell = {
  empty: boolean;
  /** Index into the map's tileset list, -1 when empty. */
  tilesetIndex: number;
  /** Tile id within the tileset, -1 when empty. */
  tileId: number;
};

const unpackCell = (raw: number): Cell => {
  const packed = raw >>> 0;
  const empty = packed === EMPTY_CELL;
  return {
    empty,
    tilesetIndex: empty ? -1 : (packed >>> 16) & 0xffff,
    tileId: empty ? -1 : packed & 0xffff,
  };
};

export class TiledMap {
  private constructor(private mod: WasmModule, private handle: number) {}

  static open(mod: WasmModule, bytes: Uint8Array): TiledMap {
    const ptr = mod._malloc(bytes.length);
    mod.HEAPU8.set(bytes, ptr);
    const handle = mod._tiled_load_map_from_bytes(ptr, bytes.length);
    mod._free(ptr);
    if (!handle) throw new Error(`tiled: failed to parse map — ${lastError(mod)}`);
    return new TiledMap(mod, handle);
  }

  /** Wrap a handle produced by another bridge call (e.g. load_map_from_path). */
  static fromHandle(mod: WasmModule, handle: number): TiledMap {
    return new TiledMap(mod, handle);
  }

  get width()        { return this.mod._tiled_map_width(this.handle); }
  get height()       { return this.mod._tiled_map_height(this.handle); }
  get tileWidth()    { return this.mod._tiled_map_tile_width(this.handle); }
  get tileHeight()   { return this.mod._tiled_map_tile_height(this.handle); }
  get layerCount()   { return this.mod._tiled_map_layer_count(this.handle); }
  get tilesetCount() { return this.mod._tiled_map_tileset_count(this.handle); }

  layerName(index: number): string {
    return readCString(this.mod, this.mod._tiled_layer_name(this.handle, index));
  }
  isTileLayer(index: number): boolean {
    return this.mod._tiled_layer_is_tile(this.handle, index) !== 0;
  }

  /** Read a single cell. Fast — designed for tight render loops. */
  getCell(layer: number, x: number, y: number): Cell {
    return unpackCell(this.mod._tiled_get_cell(this.handle, layer, x, y));
  }

  /** Paint a single cell. Pass `tilesetIndex < 0` to erase. */
  setCell(layer: number, x: number, y: number, tilesetIndex: number, tileId: number): void {
    this.mod._tiled_set_cell(this.handle, layer, x, y, tilesetIndex, tileId);
  }

  /**
   * Paint a single cell from a *raw Tiled gid* (top 3 bits = flip flags,
   * low 29 bits = global tile id). Use this on undo/redo where the JS
   * history holds the original raw gid — `setCell` would drop the flip
   * bits because it only takes (tilesetIndex, tileId).
   */
  setCellRaw(layer: number, x: number, y: number, rawGid: number): void {
    // JS numbers are signed when bit 31 is set; coerce to unsigned for the
    // wasm i32 argument. The C side reads as uint32_t.
    this.mod._tiled_set_cell_raw(this.handle, layer, x, y, rawGid >>> 0);
  }

  // Whether the wasm build includes the layer-authoring + resize exports.
  // Added in the v2 bridge — older `tiled_bridge.wasm` files won't have them.
  // We surface a clear log so "+" / Resize feeling like no-ops resolves to
  // "rebuild your wasm" rather than a silent failure.
  private hasAuthoringFns(): boolean {
    const m = this.mod as unknown as Record<string, unknown>;
    const ok = typeof m._tiled_add_tile_layer === 'function'
      && typeof m._tiled_remove_layer === 'function'
      && typeof m._tiled_rename_layer === 'function'
      && typeof m._tiled_move_layer === 'function'
      && typeof m._tiled_resize_map === 'function';
    if (!ok && !TiledMap.warnedMissingFns) {
      console.warn(
        '[tiled] wasm bridge is missing the v2 authoring exports ' +
        '(_tiled_add_tile_layer / _remove_layer / _rename_layer / _move_layer / _resize_map). ' +
        'Layer add/del/rename/reorder and Map Resize will no-op. ' +
        'Rebuild ~/Desktop/tiled-wasm/ and copy tiled_bridge.{js,wasm} into ' +
        'src/custom/MapEditor/wasm/ to pick up the new bridge.',
      );
      TiledMap.warnedMissingFns = true;
    }
    return ok;
  }
  // Suppress repeat warnings for the same module instance.
  private static warnedMissingFns = false;

  /**
   * Append a new finite tile layer. Returns the new layer index, or -1
   * on failure. The new layer is empty and sized to the map's current
   * width/height. Caller is responsible for re-reading `toJson()` /
   * re-querying layer metadata afterward.
   */
  addTileLayer(name: string): number {
    if (!this.hasAuthoringFns()) return -1;
    const ptr = allocCString(this.mod, name);
    try {
      return this.mod._tiled_add_tile_layer(this.handle, ptr);
    } finally {
      this.mod._free(ptr);
    }
  }

  /** Remove a layer at the given index. Returns 0 on success, -1 otherwise. */
  removeLayer(index: number): number {
    if (!this.hasAuthoringFns()) return -1;
    return this.mod._tiled_remove_layer(this.handle, index);
  }

  /** Rename a layer in place. Returns 0 on success, -1 otherwise. */
  renameLayer(index: number, name: string): number {
    if (!this.hasAuthoringFns()) return -1;
    const ptr = allocCString(this.mod, name);
    try {
      return this.mod._tiled_rename_layer(this.handle, index, ptr);
    } finally {
      this.mod._free(ptr);
    }
  }

  /**
   * Move a layer to a new index. `to` is the position after removal —
   * Qt-style move semantics. Returns 0 on success, -1 otherwise.
   */
  moveLayer(from: number, to: number): number {
    if (!this.hasAuthoringFns()) return -1;
    return this.mod._tiled_move_layer(this.handle, from, to);
  }

  /**
   * Resize the map. `offsetX/Y` shifts existing tile-layer content within
   * the new bounds — positive moves right/down, negative left/up.
   * Cells that fall outside the new dims are dropped. Object/image/group
   * layers are untouched (their geometry is in pixel space). Returns 0
   * on success, -1 otherwise.
   */
  resize(newWidth: number, newHeight: number, offsetX = 0, offsetY = 0): number {
    if (!this.hasAuthoringFns()) return -1;
    return this.mod._tiled_resize_map(this.handle, newWidth, newHeight, offsetX, offsetY);
  }

  // ---- Group authoring + path-based editing (v3 bridge) ------------------

  /** Are the v3 (group + path-based) bridge exports present? */
  private hasGroupFns(): boolean {
    const m = this.mod as unknown as Record<string, unknown>;
    return typeof m._tiled_add_group_layer === 'function'
      && typeof m._tiled_set_cell_at_path === 'function';
  }

  /**
   * Allocate an int32 path array in wasm memory and run `fn` with the
   * pointer + length. Returns whatever `fn` returns. Path memory is freed
   * before returning, so it's safe to call repeatedly without leaking.
   */
  private withPath<T>(path: number[], fn: (ptr: number, len: number) => T): T {
    if (path.length === 0) return fn(0, 0);
    const bytes = path.length * 4;
    const ptr = this.mod._malloc(bytes);
    try {
      // Each int32 is little-endian on wasm.
      for (let i = 0; i < path.length; i++) {
        const offset = (ptr >>> 2) + i;
        this.mod.HEAPU32[offset] = path[i] >>> 0;
      }
      return fn(ptr, path.length);
    } finally {
      this.mod._free(ptr);
    }
  }

  /** Append a new empty group layer at top-level. Returns its index. */
  addGroupLayer(name: string): number {
    if (!this.hasGroupFns()) return -1;
    const np = allocCString(this.mod, name);
    try { return this.mod._tiled_add_group_layer(this.handle, np); }
    finally { this.mod._free(np); }
  }

  /**
   * Paint a single cell on the tile layer at `path`. Path is the
   * document-order walk from the map root — `[3]` for the top-level
   * layer at index 3, `[2, 1]` for the second child of a top-level
   * group at index 2. Pass `tilesetIndex < 0` to erase.
   */
  setCellAtPath(path: number[], x: number, y: number, tilesetIndex: number, tileId: number): void {
    if (!this.hasGroupFns()) return;
    this.withPath(path, (ptr, len) =>
      this.mod._tiled_set_cell_at_path(this.handle, ptr, len, x, y, tilesetIndex, tileId));
  }

  /** Path-based set_cell_raw — preserves flip/rotation bits for undo. */
  setCellRawAtPath(path: number[], x: number, y: number, rawGid: number): void {
    if (!this.hasGroupFns()) return;
    this.withPath(path, (ptr, len) =>
      this.mod._tiled_set_cell_raw_at_path(this.handle, ptr, len, x, y, rawGid >>> 0));
  }

  renameLayerAtPath(path: number[], name: string): number {
    if (!this.hasGroupFns()) return -1;
    const np = allocCString(this.mod, name);
    try {
      return this.withPath(path, (ptr, len) =>
        this.mod._tiled_rename_layer_at_path(this.handle, ptr, len, np));
    } finally { this.mod._free(np); }
  }

  removeLayerAtPath(path: number[]): number {
    if (!this.hasGroupFns()) return -1;
    return this.withPath(path, (ptr, len) =>
      this.mod._tiled_remove_layer_at_path(this.handle, ptr, len));
  }

  /**
   * Move a layer to a new location. `dstParentPath = []` means top-level;
   * `dstIdx` is the position within that parent. The bridge automatically
   * adjusts for the index shift when moving within the same parent toward
   * a higher position.
   */
  moveLayerToPath(srcPath: number[], dstParentPath: number[], dstIdx: number): number {
    if (!this.hasGroupFns()) return -1;
    return this.withPath(srcPath, (sPtr, sLen) =>
      this.withPath(dstParentPath, (dPtr, dLen) =>
        this.mod._tiled_move_layer_to_path(this.handle, sPtr, sLen, dPtr, dLen, dstIdx)));
  }

  /**
   * Set a layer's opacity (0–1). Tile layers self-apply; group layers
   * cascade into their children at render time.
   */
  setLayerOpacityAtPath(path: number[], opacity: number): number {
    const m = this.mod as unknown as Record<string, unknown>;
    if (typeof m._tiled_set_layer_opacity_at_path !== 'function') return -1;
    return this.withPath(path, (ptr, len) =>
      this.mod._tiled_set_layer_opacity_at_path(this.handle, ptr, len, opacity));
  }

  /**
   * Dump the entire map as Tiled JSON (the `.tmj` shape). External tilesets
   * appear as `{firstgid, source}` short-references in `.tilesets[]` — use
   * `tilesetJson(idx)` to pull each one's image dims and tile geometry.
   */
  toJson(): unknown {
    const ptr = this.mod._tiled_map_as_json(this.handle);
    if (!ptr) throw new Error(`tiled: toJson failed — ${lastError(this.mod)}`);
    try {
      return JSON.parse(readCString(this.mod, ptr));
    } finally {
      this.mod._tiled_free_string(ptr);
    }
  }

  /**
   * Per-tileset JSON in standalone (.tsj) shape: image path, image
   * dimensions, tile size, columns, margin/spacing, etc. The companion to
   * `toJson()` for rendering — combine the firstgid from there with the
   * image metadata from here.
   */
  tilesetJson(idx: number): unknown {
    const ptr = this.mod._tiled_tileset_as_json(this.handle, idx);
    if (!ptr) throw new Error(`tiled: tilesetJson(${idx}) failed — ${lastError(this.mod)}`);
    try {
      return JSON.parse(readCString(this.mod, ptr));
    } finally {
      this.mod._tiled_free_string(ptr);
    }
  }

  /** Serialize the current map back to .tmx bytes. */
  save(): Uint8Array {
    const lenPtr = this.mod._malloc(4);
    try {
      const bytesPtr = this.mod._tiled_save_map_to_bytes(this.handle, lenPtr);
      if (!bytesPtr) throw new Error(`tiled: save failed — ${lastError(this.mod)}`);
      const len = this.mod.HEAPU32[lenPtr >>> 2];
      const out = new Uint8Array(len);
      out.set(this.mod.HEAPU8.subarray(bytesPtr, bytesPtr + len));
      this.mod._tiled_free_bytes(bytesPtr);
      return out;
    } finally {
      this.mod._free(lenPtr);
    }
  }

  dispose(): void {
    if (this.handle) {
      this.mod._tiled_free_map(this.handle);
      this.handle = 0;
    }
  }
}

export const TiledModule = {
  /**
   * Load (and cache) the wasm bridge. The 14 MB blob is downloaded once
   * per session; subsequent calls return the same promise.
   */
  load(): Promise<WasmModule> {
    if (modulePromise) return modulePromise;
    modulePromise = (async () => {
      await loadScriptOnce(bridgeScriptUrl);
      const factory = (window as unknown as Record<string, Factory>)[FACTORY_GLOBAL];
      if (typeof factory !== 'function') {
        throw new Error(`tiled: bridge script loaded but ${FACTORY_GLOBAL} is missing`);
      }
      return factory({
        // Emscripten resolves the .wasm relative to the .js by default,
        // but Vite hashes asset filenames in prod so we redirect explicitly.
        locateFile: (file) => (file.endsWith('.wasm') ? bridgeWasmUrl : file),
        noInitialRun: true,
        print: (t) => console.log('[tiled]', t),
        printErr: (t) => console.warn('[tiled]', t),
      });
    })();
    return modulePromise;
  },

  /** Convenience: load + open from a bytes blob (no external tilesets resolved). */
  async openMap(bytes: Uint8Array): Promise<TiledMap> {
    const mod = await TiledModule.load();
    return TiledMap.open(mod, bytes);
  },

  /**
   * Load + open with external tileset/image dependencies. Every entry's
   * `relPath` is mounted into the wasm MEMFS at `/<relPath>` so libtiled's
   * MapReader can resolve `<tileset source="../Tilesets/foo.tsx"/>` chains.
   * This is the path used by the canvas renderer; `openMap` alone gives you
   * only firstgid + source for external tilesets, no image dims.
   */
  async openMapWithAssets(
    mapEntry: AssetEntry,
    extraFiles: AssetEntry[],
  ): Promise<TiledMap> {
    const mod = await TiledModule.load();
    const allFiles = [mapEntry, ...extraFiles];

    // Push every file into MEMFS at `/<relPath>`.
    for (const file of allFiles) {
      const bytes = new Uint8Array(file.bytes);
      const dataPtr = mod._malloc(bytes.length);
      mod.HEAPU8.set(bytes, dataPtr);
      const pathPtr = allocCString(mod, '/' + file.relPath);
      const rc = mod._tiled_put_virtual_file(pathPtr, dataPtr, bytes.length);
      mod._free(pathPtr);
      mod._free(dataPtr);
      if (rc !== 0) {
        throw new Error(`tiled: put_virtual_file failed for ${file.relPath} (rc=${rc}) — ${readCString(mod, mod._tiled_last_error())}`);
      }
    }

    const mapPathPtr = allocCString(mod, '/' + mapEntry.relPath);
    const handle = mod._tiled_load_map_from_path(mapPathPtr);
    mod._free(mapPathPtr);
    if (!handle) {
      throw new Error(`tiled: load_map_from_path failed — ${readCString(mod, mod._tiled_last_error())}`);
    }
    return TiledMap.fromHandle(mod, handle);
  },
};

// Helper: malloc + copy a JS string as UTF-8 + null-terminate. Caller frees.
function allocCString(mod: WasmModule, str: string): number {
  const utf8 = new TextEncoder().encode(str);
  const ptr = mod._malloc(utf8.length + 1);
  mod.HEAPU8.set(utf8, ptr);
  mod.HEAPU8[ptr + utf8.length] = 0;
  return ptr;
}
