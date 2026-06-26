/**
 * Parse a `.tmx` file's `<layer>` data blocks directly, bypassing libtiled.
 *
 * **Why we need this.** Tiled's `MapToVariantConverter` (the JSON exporter
 * our wasm bridge calls) recomputes per-tileset `firstgid` from each
 * tileset's `nextTileId()` — a running counter that reflects the *current*
 * highest authored tile id in the .tsx, not the original tile count. If
 * a `.tsx` file has shrunk since the `.tmx` was authored (or just declares
 * fewer explicit tile slots than its image holds), the recomputed firstgid
 * for any later tileset will be smaller than what the `.tmx` actually
 * encoded its cells against. The JSON tileset metadata is emitted with
 * the *file*'s firstgids (so we read those correctly), but the layer data
 * is re-encoded with the *recomputed* firstgids — and every cell in those
 * affected layers ends up pointing at the wrong tileset.
 *
 * Concrete example from the field: Magna's mossy grotto map has `<tileset
 * firstgid="1162" source="...Floors.tsx"/>`. Walls' .tsx defines explicit
 * metadata only up to tile id ~595, so `Walls.nextTileId() = 596`. The
 * bridge emits cells against a recomputed Floors firstgid of 878 instead
 * of 1162 — file value `1245` (Floors localId 83) becomes `961` (Walls
 * localId 679) and the entire ground layer renders as garbage.
 *
 * **The fix.** For every tile layer in the .tmx we extract the raw `<data>`
 * block, decode whatever encoding/compression it uses, and hand back the
 * authoritative `width*height` int array. The caller overrides the
 * bridge-supplied `layer.data` with these values, so cell→gid resolution
 * uses the .tmx's own firstgids (which match the `tilesets` JSON we ALSO
 * read from the bridge).
 *
 * Supported encodings (all Tiled formats prior to v1.10's zstd):
 *   - `encoding="csv"` — plain comma-separated decimal ints.
 *   - `encoding="base64"` (no compression) — packed little-endian uint32s.
 *   - `encoding="base64" compression="gzip"` — via DecompressionStream.
 *   - `encoding="base64" compression="zlib"` (a.k.a. deflate) — same.
 *   - No encoding attribute — XML `<tile gid="..."/>` children.
 *
 * Cells carry the flip/rotation bits in the high 3 bits, so we return
 * raw uint32s; callers mask GID_BITS themselves.
 */

const GID_MASK = 0x1fffffff;

/**
 * Decoded layer data, keyed two ways so callers can match against
 * whatever the bridge gives them:
 *   - `byId`   — keyed on the layer's `id` attribute (unique in a .tmx).
 *   - `byPath` — keyed on the document-order path through the layer
 *                tree, e.g. "0", "1.0", "1.1" (top-level group at idx
 *                1, child at idx 0/1). Matches the bridge's `bridgePath`.
 *
 * Names alone aren't safe — Tiled allows duplicate layer names within
 * a single map and PSDK exporters occasionally produce them
 * (e.g. "▬_Bld_doors_A_1" appearing twice on the same .tmx). A name-
 * keyed map would silently collapse those layers onto one another.
 *
 * `tilesetFirstgids` is the authoritative list of <tileset firstgid=...>
 * values in declaration order — the bridge recomputes these from
 * `nextTileId()` and they can drift from the file when a .tsx declares
 * fewer explicit tile slots than the .tmx allocated gids for.
 */
export type LayerDataOverrides = {
  byId: Map<number, number[]>;
  byPath: Map<string, number[]>;
  tilesetFirstgids: number[];
};

/** Match the bridge's bridgePath array ([0, 2, 1]) against our byPath key. */
export const pathKey = (path: number[]): string => path.join('.');

/**
 * Parse the .tmx file's layer data. Returns one entry per `<layer>` (NOT
 * `<objectgroup>` or `<imagelayer>`), with the decoded raw gid array.
 * Walks into `<group>` containers so nested layers are included.
 *
 * Throws on malformed XML. Individual layers whose data can't be decoded
 * (unknown encoding/compression, bad base64, etc.) are silently skipped —
 * the caller falls back to the bridge's data for those.
 */
export const parseTmxLayerData = async (tmxBytes: ArrayBuffer): Promise<LayerDataOverrides> => {
  const xmlText = new TextDecoder('utf-8').decode(tmxBytes);
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  const root = doc.documentElement;
  if (!root || root.nodeName !== 'map') {
    throw new Error('not a .tmx file (root element is not <map>)');
  }

  // Tileset firstgids in declaration order. Walks only direct children of
  // <map> — Tiled doesn't nest tilesets so deeper recursion isn't needed.
  const tilesetFirstgids: number[] = [];
  for (const child of Array.from(root.children)) {
    if (child.nodeName !== 'tileset') continue;
    const fg = parseInt(child.getAttribute('firstgid') ?? '0', 10);
    if (Number.isFinite(fg) && fg > 0) tilesetFirstgids.push(fg);
  }

  const out: LayerDataOverrides = { byId: new Map(), byPath: new Map(), tilesetFirstgids };
  await walkLayers(root, [], out);
  return out;
};

/**
 * Walk every layer/group child of `parent` in document order, tracking the
 * full path from the map root. Group children inherit the path prefix so
 * nested layers get unique keys (e.g. path [1, 0] = first child of the
 * second top-level entry).
 */
const walkLayers = async (parent: Element, prefix: number[], out: LayerDataOverrides): Promise<void> => {
  let i = -1;
  for (const child of Array.from(parent.children)) {
    if (child.nodeName !== 'layer' && child.nodeName !== 'group' && child.nodeName !== 'objectgroup' && child.nodeName !== 'imagelayer') {
      continue;
    }
    i++;
    const path = [...prefix, i];
    if (child.nodeName === 'layer') {
      const name = child.getAttribute('name') ?? '';
      const idStr = child.getAttribute('id');
      const id = idStr ? parseInt(idStr, 10) : NaN;
      const w = parseInt(child.getAttribute('width') ?? '0', 10);
      const h = parseInt(child.getAttribute('height') ?? '0', 10);
      if (w <= 0 || h <= 0) continue;
      const dataEl = child.getElementsByTagName('data')[0];
      if (!dataEl) continue;
      try {
        const arr = await decodeDataElement(dataEl, w, h);
        if (arr) {
          if (Number.isFinite(id)) out.byId.set(id, arr);
          out.byPath.set(pathKey(path), arr);
        }
      } catch (e) {
        console.warn(`[tmxLayerData] failed to decode layer "${name}" (id=${idStr}):`, e);
      }
    } else if (child.nodeName === 'group') {
      await walkLayers(child, path, out);
    }
    // objectgroup / imagelayer take a position in the index sequence but
    // never carry tile data — fall through.
  }
};

const decodeDataElement = async (data: Element, w: number, h: number): Promise<number[] | null> => {
  const expected = w * h;
  const encoding = data.getAttribute('encoding'); // null | 'csv' | 'base64'
  const compression = data.getAttribute('compression'); // null | 'gzip' | 'zlib' | 'zstd'

  // XML form: <tile gid="..."/> children, document order = row-major.
  if (!encoding) {
    const tiles = data.getElementsByTagName('tile');
    if (tiles.length === 0) return null;
    const out = new Array<number>(expected).fill(0);
    for (let i = 0; i < Math.min(tiles.length, expected); i++) {
      const g = parseInt(tiles[i].getAttribute('gid') ?? '0', 10);
      out[i] = g >>> 0;
    }
    return out;
  }

  if (encoding === 'csv') {
    const text = data.textContent ?? '';
    // Tiled writes CSV with trailing commas + newlines between rows. Split
    // on commas, trim whitespace, drop empty tokens (the trailing comma
    // before each newline produces one).
    const out: number[] = [];
    let i = 0;
    const len = text.length;
    while (i < len && out.length < expected) {
      // skip whitespace
      while (i < len && (text.charCodeAt(i) <= 32 || text.charCodeAt(i) === 44)) i++;
      if (i >= len) break;
      // read number
      const start = i;
      while (i < len && text.charCodeAt(i) > 32 && text.charCodeAt(i) !== 44) i++;
      if (i > start) {
        const n = Number(text.slice(start, i));
        out.push(Number.isFinite(n) ? (n >>> 0) : 0);
      }
    }
    // Pad with zeros if the .tmx is short (shouldn't happen on finite maps,
    // but defensive against malformed files).
    while (out.length < expected) out.push(0);
    return out;
  }

  if (encoding === 'base64') {
    const b64 = (data.textContent ?? '').replace(/\s+/g, '');
    if (!b64) return null;
    let bytes = base64ToBytes(b64);
    if (compression === 'gzip' || compression === 'zlib') {
      // DecompressionStream uses 'deflate' for zlib-wrapped data and
      // 'gzip' for gzip. Both are supported in modern Chromium/Electron.
      const format = compression === 'gzip' ? 'gzip' : 'deflate';
      bytes = await decompress(bytes, format);
    } else if (compression && compression !== '') {
      // zstd not supported by DecompressionStream. We'd need a zstd JS
      // decoder (or build one into the wasm bridge). Bail; caller falls
      // back to bridge data.
      console.warn(`[tmxLayerData] unsupported compression: ${compression}`);
      return null;
    }
    if (bytes.byteLength < expected * 4) {
      console.warn(`[tmxLayerData] data shorter than expected: ${bytes.byteLength} < ${expected * 4}`);
      return null;
    }
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const out = new Array<number>(expected);
    for (let i = 0; i < expected; i++) out[i] = view.getUint32(i * 4, true) >>> 0;
    return out;
  }

  console.warn(`[tmxLayerData] unknown encoding: ${encoding}`);
  return null;
};

const base64ToBytes = (b64: string): Uint8Array => {
  const bin = atob(b64);
  const len = bin.length;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) out[i] = bin.charCodeAt(i);
  return out;
};

const decompress = async (bytes: Uint8Array, format: 'gzip' | 'deflate'): Promise<Uint8Array> => {
  // DecompressionStream is available in Electron's Chromium since ~2022.
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
};

/** Mask any flip/rotation bits — returns the bare gid. */
export const stripFlipBits = (raw: number): number => (raw >>> 0) & GID_MASK;

/**
 * Rewrite every `<layer>` data block in a .tmx byte buffer to CSV encoding.
 * Source can be CSV (no-op), base64, or base64+gzip/zlib. Returns new
 * bytes; doesn't mutate the input.
 *
 * We do this after `tiled_save_map_to_bytes` because the bridge preserves
 * whatever encoding the source .tmx used — so a map originally authored
 * with base64+gzip would round-trip as base64+gzip even though everything
 * else in the toolchain (PSDK, our editor, Tiled itself) handles CSV
 * better. Forcing CSV on save makes the on-disk format consistent, keeps
 * git diffs human-readable, and side-steps the half-broken libtiled
 * base64 path that swallowed cells in our wasm build.
 *
 * If anything goes wrong (malformed XML, unsupported compression), we
 * fall back to the original bytes — never block the save.
 */
export const enforceCsvLayerData = async (tmxBytes: ArrayBuffer): Promise<ArrayBuffer> => {
  try {
    const xmlText = new TextDecoder('utf-8').decode(tmxBytes);
    const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
    const root = doc.documentElement;
    if (!root || root.nodeName !== 'map') return tmxBytes;

    let converted = 0;
    let alreadyCsv = 0;
    const convertLayer = async (layerEl: Element): Promise<void> => {
      const w = parseInt(layerEl.getAttribute('width') ?? '0', 10);
      const h = parseInt(layerEl.getAttribute('height') ?? '0', 10);
      if (w <= 0 || h <= 0) return;
      const dataEl = layerEl.getElementsByTagName('data')[0];
      if (!dataEl) return;
      const encoding = dataEl.getAttribute('encoding');
      if (encoding === 'csv') { alreadyCsv++; return; }
      const decoded = await decodeDataElement(dataEl, w, h);
      if (!decoded) return; // unsupported encoding / decode error
      writeCsvData(dataEl, decoded, w);
      converted++;
    };

    const walk = async (el: Element): Promise<void> => {
      for (const child of Array.from(el.children)) {
        if (child.nodeName === 'layer') await convertLayer(child);
        else if (child.nodeName === 'group') await walk(child);
      }
    };
    await walk(root);

    if (converted === 0) return tmxBytes; // nothing to rewrite (file is already all-CSV)
    console.log(`[map-editor] enforced CSV layer data on save: ${converted} converted, ${alreadyCsv} already CSV`);

    const serialized = new XMLSerializer().serializeToString(doc);
    // libtiled's writer starts every file with the XML declaration; preserve
    // that so the on-disk file looks the same to other tools / diffs.
    const xmlDecl = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const finalText = serialized.startsWith('<?xml') ? serialized : xmlDecl + serialized;
    return new TextEncoder().encode(finalText).buffer;
  } catch (e) {
    console.warn('[map-editor] enforceCsvLayerData failed; saving original bytes', e);
    return tmxBytes;
  }
};

/** Replace a `<data>` element's encoding/compression attrs + text content
 *  with a CSV serialization of `cells`. Mirrors Tiled's own CSV output:
 *  one row per layer-row, trailing comma after each value, newline between. */
const writeCsvData = (dataEl: Element, cells: number[], width: number): void => {
  dataEl.setAttribute('encoding', 'csv');
  dataEl.removeAttribute('compression');
  // Clear existing text/children.
  while (dataEl.firstChild) dataEl.removeChild(dataEl.firstChild);
  const lines: string[] = [];
  for (let y = 0; y * width < cells.length; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) row.push(cells[y * width + x] >>> 0);
    lines.push(row.join(','));
  }
  // Leading + trailing newlines match Tiled's own formatting so saves look
  // like Tiled's saves — no spurious diff on first save through us.
  dataEl.appendChild(dataEl.ownerDocument.createTextNode('\n' + lines.join(',\n') + '\n'));
};
