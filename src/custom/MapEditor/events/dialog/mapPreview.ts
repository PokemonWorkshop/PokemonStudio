/**
 * Standalone, read-only renderer for ANY map in the project.
 *
 * The main editor turns a .tmx into a LoadedState through the wasm bridge, but
 * that path only ever holds the ONE map currently open — and a Transfer Player
 * destination is almost always a different map. This loads a map straight from
 * its bytes with DOMParser and paints it to a canvas: no wasm, no editing, no
 * shared state with PixiMapCanvas.
 *
 * Deliberately faithful to the editor in the ways that matter:
 *   * layer `visible` / `opacity` are honoured exactly as the editor honours
 *     them (it trusts the .tmx rather than auto-hiding PSDK's metadata layers),
 *   * the tileset `trans` colour key is applied, or every tile would sit on a
 *     block of magenta,
 *   * gid → tileset uses Tiled's rule (highest firstgid that is still <= gid).
 */

/** Tiled packs orientation into the high bits of each gid. */
const GID_FLAGS = 0x80000000 | 0x40000000 | 0x20000000;
const GID_MASK = ~GID_FLAGS;
/** Cap the rendered canvas so a huge map can't allocate an absurd bitmap. */
const MAX_DIM = 4096;

/**
 * PSDK's gameplay-metadata layers — passages, system tags (incl. the bridge
 * variant), terrain tags. They're authoring aids, not scenery, so a clean map
 * preview (e.g. a warp-destination picker) hides them by name. The visual
 * bridge layers (`bridges1`, `bridgeLayer4`, …) don't match, so real content
 * stays.
 */
const isMetadataLayer = (name: string): boolean => /passage|systemtag|terrain/i.test(name);

export type MapPreview = {
  /** Map size in tiles. */
  width: number;
  height: number;
  /** Rendered map. One canvas pixel per source pixel, up to MAX_DIM. */
  canvas: HTMLCanvasElement;
  /** Rendered size of one tile, in canvas pixels (may be < tilewidth if scaled). */
  cellSize: number;
};

type PreviewTileset = {
  firstgid: number;
  columns: number;
  tilewidth: number;
  tileheight: number;
  bitmap: ImageBitmap;
};

/** Resolve a relative `source` against the referring file's directory. */
const resolveRelative = (fromRelPath: string, source: string): string => {
  const parts = fromRelPath.split('/').slice(0, -1).concat(source.split('/'));
  const out: string[] = [];
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
};

const parseTransparentColor = (s: string | null): [number, number, number] | null => {
  if (!s) return null;
  const hex = s.replace('#', '');
  if (hex.length !== 6 && hex.length !== 8) return null;
  const start = hex.length === 8 ? 2 : 0;
  const r = parseInt(hex.substring(start, start + 2), 16);
  const g = parseInt(hex.substring(start + 2, start + 4), 16);
  const b = parseInt(hex.substring(start + 4, start + 6), 16);
  return Number.isNaN(r + g + b) ? null : [r, g, b];
};

/** Knock out the tileset's colour-key pixels, exactly as the editor does. */
const applyTransparentColor = async (src: ImageBitmap, trans: string | null): Promise<ImageBitmap> => {
  const rgb = parseTransparentColor(trans);
  if (!rgb) return src;
  const [tr, tg, tb] = rgb;
  const work = document.createElement('canvas');
  work.width = src.width;
  work.height = src.height;
  const ctx = work.getContext('2d', { willReadFrequently: true });
  if (!ctx) return src;
  ctx.drawImage(src, 0, 0);
  const img = ctx.getImageData(0, 0, work.width, work.height);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === tr && data[i + 1] === tg && data[i + 2] === tb) data[i + 3] = 0;
  }
  ctx.putImageData(img, 0, 0);
  src.close?.();
  return createImageBitmap(work);
};

const readAssets = (projectPath: string, tiledFilename: string) =>
  new Promise<{ map: { relPath: string; bytes: ArrayBuffer }; tilesets: { relPath: string; bytes: ArrayBuffer }[]; images: { relPath: string; bytes: ArrayBuffer }[] }>(
    (resolve, reject) => {
      window.api.readMapAndAssets({ projectPath, tiledFilename }, resolve, ({ errorMessage }) => reject(new Error(errorMessage)));
    },
  );

const decodeXml = (bytes: ArrayBuffer): Document => new DOMParser().parseFromString(new TextDecoder().decode(bytes), 'text/xml');

/** Render one map to a canvas. Throws with a readable message if it can't. */
export const loadMapPreview = async (
  projectPath: string,
  tiledFilename: string,
  options: { hideMetadataLayers?: boolean } = {},
): Promise<MapPreview> => {
  const assets = await readAssets(projectPath, tiledFilename);
  const byPath = new Map<string, ArrayBuffer>();
  [...assets.tilesets, ...assets.images].forEach((f) => byPath.set(f.relPath, f.bytes));

  const doc = decodeXml(assets.map.bytes);
  const mapEl = doc.querySelector('map');
  if (!mapEl) throw new Error('Not a Tiled map');
  const width = Number(mapEl.getAttribute('width')) || 0;
  const height = Number(mapEl.getAttribute('height')) || 0;
  const tileWidth = Number(mapEl.getAttribute('tilewidth')) || 32;
  const tileHeight = Number(mapEl.getAttribute('tileheight')) || 32;
  if (width <= 0 || height <= 0) throw new Error('Map has no size');

  // --- tilesets -----------------------------------------------------------
  const tilesets: PreviewTileset[] = [];
  for (const tsEl of Array.from(doc.querySelectorAll('map > tileset'))) {
    const firstgid = Number(tsEl.getAttribute('firstgid')) || 0;
    const source = tsEl.getAttribute('source');
    // An embedded tileset has its <image> inline; an external one points at a .tsx.
    let defEl: Element = tsEl;
    let defPath = assets.map.relPath;
    if (source) {
      defPath = resolveRelative(assets.map.relPath, source);
      const tsBytes = byPath.get(defPath);
      if (!tsBytes) continue; // missing tileset — skip rather than fail the whole map
      const tsDoc = decodeXml(tsBytes);
      const root = tsDoc.querySelector('tileset');
      if (!root) continue;
      defEl = root;
    }
    const imageEl = defEl.querySelector('image');
    const imageSource = imageEl?.getAttribute('source');
    if (!imageEl || !imageSource) continue;
    const imgBytes = byPath.get(resolveRelative(defPath, imageSource));
    if (!imgBytes) continue;

    const raw = await createImageBitmap(new Blob([imgBytes]));
    const bitmap = await applyTransparentColor(raw, imageEl.getAttribute('trans'));
    const tw = Number(defEl.getAttribute('tilewidth')) || tileWidth;
    const th = Number(defEl.getAttribute('tileheight')) || tileHeight;
    tilesets.push({
      firstgid,
      columns: Number(defEl.getAttribute('columns')) || Math.max(1, Math.floor(bitmap.width / tw)),
      tilewidth: tw,
      tileheight: th,
      bitmap,
    });
  }

  // --- canvas -------------------------------------------------------------
  const cellSize = Math.max(1, Math.min(tileWidth, Math.floor(MAX_DIM / Math.max(width, height))));
  const canvas = document.createElement('canvas');
  canvas.width = width * cellSize;
  canvas.height = height * cellSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get a 2D context');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'medium';

  const cache = new Map<number, PreviewTileset | null>();
  const lookup = (gid: number): PreviewTileset | null => {
    const hit = cache.get(gid);
    if (hit !== undefined) return hit;
    let best: PreviewTileset | null = null;
    for (const ts of tilesets) if (ts.firstgid <= gid && (!best || ts.firstgid > best.firstgid)) best = ts;
    cache.set(gid, best);
    return best;
  };

  // --- layers -------------------------------------------------------------
  // Walk the tree rather than flat-querying <layer>: Tiled nests layers inside
  // <group>, and a group's `visible`/`opacity` apply to everything under it.
  // A flat query would draw the contents of a hidden group (the real data has
  // one), and would ignore group opacity.
  const drawLayers = (parent: Element, inheritedAlpha: number): void => {
    for (const el of Array.from(parent.children)) {
      const visible = el.getAttribute('visible') !== '0';
      const own = el.getAttribute('opacity');
      const alpha = inheritedAlpha * (own === null ? 1 : Number(own));

      if (el.tagName === 'group') {
        if (visible) drawLayers(el, alpha);
        continue;
      }
      if (el.tagName !== 'layer') continue;
      // Honour the .tmx exactly as the editor does — it trusts `visible` rather
      // than auto-hiding PSDK's systemtags/passages layers.
      if (!visible) continue;
      // ...but a clean preview can additionally drop the metadata layers.
      if (options.hideMetadataLayers && isMetadataLayer(el.getAttribute('name') ?? '')) continue;
      drawLayer(el, alpha);
    }
  };

  const drawLayer = (layerEl: Element, alpha: number): void => {
    const dataEl = layerEl.querySelector('data');
    if (!dataEl || dataEl.getAttribute('encoding') !== 'csv') return;
    ctx.globalAlpha = alpha;

    const gids = (dataEl.textContent ?? '').split(',');
    for (let i = 0; i < gids.length && i < width * height; i++) {
      const raw = Number(gids[i].trim());
      if (!raw) continue;
      const gid = raw & GID_MASK;
      if (!gid) continue;
      const ts = lookup(gid);
      if (!ts) continue;
      const local = gid - ts.firstgid;
      const sx = (local % ts.columns) * ts.tilewidth;
      const sy = Math.floor(local / ts.columns) * ts.tileheight;
      if (sy + ts.tileheight > ts.bitmap.height) continue;
      const dx = (i % width) * cellSize;
      // Tall tiles hang UPWARD from the cell's bottom edge — the same anchor
      // the editor uses, or anything taller than one tile renders shifted.
      const scale = cellSize / tileWidth;
      const dh = ts.tileheight * scale;
      const dy = (Math.floor(i / width) + 1) * cellSize - dh;
      ctx.drawImage(ts.bitmap, sx, sy, ts.tilewidth, ts.tileheight, dx, dy, ts.tilewidth * scale, dh);
    }
  };

  drawLayers(mapEl, 1);
  ctx.globalAlpha = 1;
  tilesets.forEach((ts) => ts.bitmap.close?.());

  return { width, height, canvas, cellSize };
};
