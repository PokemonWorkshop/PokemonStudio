import fs from 'fs';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

/**
 * Fork-owned. Bundles every file the wasm renderer needs to display one
 * map in a single IPC round-trip:
 *
 *   1. The .tmx itself.
 *   2. Every `<tileset source="..."/>` it references (the .tsx file).
 *   3. Every `<image source="..."/>` referenced by those .tsx files.
 *
 * The renderer pushes each file into the wasm bridge's MEMFS at the
 * relative path the .tmx expects, then calls `tiled_load_map_from_path`.
 * libtiled then auto-resolves the external references and fully populates
 * tileset metadata (image dims, tile size, columns) — which is what the
 * canvas renderer needs to slice tileset PNGs into individual tiles.
 *
 * All file reads are root-locked to `Data/Tiled/` so a malformed source
 * attribute can't escape into arbitrary disk access.
 */

export type ReadMapAndAssetsInput = {
  projectPath: string;
  tiledFilename: string;
};

export type FileEntry = {
  /** Path relative to Data/Tiled/ — used as the virtual-FS path on the renderer. */
  relPath: string;
  bytes: ArrayBuffer;
};

export type ReadMapAndAssetsOutput = {
  /** The map file (always under Maps/). */
  map: FileEntry;
  /** Every external tileset referenced by the map. */
  tilesets: FileEntry[];
  /** Every image referenced by any of the tilesets above. */
  images: FileEntry[];
};

const TILED_ROOT = 'Data/Tiled';

const toArrayBuffer = (buf: Buffer): ArrayBuffer =>
  buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

// Resolve `relPath` against `tiledRootAbs` and reject anything that escapes
// out. Returns the absolute path or throws.
const resolveSafe = (tiledRootAbs: string, relPath: string): string => {
  const abs = path.resolve(tiledRootAbs, relPath);
  const rel = path.relative(tiledRootAbs, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`readMapAndAssets: refusing to read outside ${TILED_ROOT}: ${relPath}`);
  }
  return abs;
};

// Strip XML/HTML comments before regex scanning. Without this, a
// commented-out `<!-- <tileset source="old.tsx"/> -->` would be falsely
// "found" — we'd try to read a file that doesn't exist, fail the whole
// load, or worse, miss tilesets after the unbalanced comment.
const stripXmlComments = (xml: string): string => xml.replace(/<!--[\s\S]*?-->/g, '');

// Scan an XML blob for `<tag source="..."/>` style references. Returns the
// raw source attribute values. Regex (not a full XML parser) because the
// .tmx/.tsx grammar is small and we only care about one attribute. We
// accept either single or double quotes around the value, and allow `source`
// to appear in any attribute position.
const scanSourceAttrs = (xml: string, tag: 'tileset' | 'image'): string[] => {
  const cleaned = stripXmlComments(xml);
  const re = new RegExp(`<${tag}\\b[^>]*?\\bsource\\s*=\\s*["']([^"']+)["']`, 'g');
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned)) !== null) out.push(m[1]);
  return out;
};

// Normalize a source attribute to a path relative to Data/Tiled/.
// In .tmx files, tileset sources look like `../Tilesets/foo.tsx` (the .tmx
// lives in Maps/, so `..` climbs out of Maps and Tilesets/ is the sibling).
// In .tsx files, image sources look like `../Assets/foo.png`.
const normalizeRel = (relativeToFile: string, source: string): string => {
  const dirOfReferent = path.dirname(relativeToFile);
  return path.posix.normalize(path.posix.join(dirOfReferent, source).replaceAll('\\', '/'));
};

const dedupeBy = <T, K>(items: T[], key: (t: T) => K): T[] => {
  const seen = new Set<K>();
  return items.filter((it) => {
    const k = key(it);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

export const registerReadMapAndAssets = defineBackendServiceFunction(
  'read-map-and-assets',
  async ({ projectPath, tiledFilename }: ReadMapAndAssetsInput): Promise<ReadMapAndAssetsOutput> => {
    const tiledRoot = path.resolve(projectPath, TILED_ROOT);

    // --- Map -------------------------------------------------------------
    const mapRel = `Maps/${tiledFilename}.tmx`;
    const mapAbs = resolveSafe(tiledRoot, mapRel);
    const mapBuf = await fs.promises.readFile(mapAbs);
    const mapXml = mapBuf.toString('utf8');

    // --- Tilesets referenced by the map ---------------------------------
    const tilesetRels = dedupeBy(
      scanSourceAttrs(mapXml, 'tileset').map((src) => normalizeRel(mapRel, src)),
      (r) => r,
    );
    const tilesets: FileEntry[] = await Promise.all(
      tilesetRels.map(async (rel) => {
        const abs = resolveSafe(tiledRoot, rel);
        const bytes = await fs.promises.readFile(abs);
        return { relPath: rel, bytes: toArrayBuffer(bytes) };
      }),
    );

    // --- Images referenced by any tileset -------------------------------
    const imageRels: string[] = [];
    for (const ts of tilesets) {
      const tsXml = new TextDecoder().decode(ts.bytes);
      for (const src of scanSourceAttrs(tsXml, 'image')) {
        imageRels.push(normalizeRel(ts.relPath, src));
      }
    }
    const uniqueImageRels = dedupeBy(imageRels, (r) => r);
    const images: FileEntry[] = await Promise.all(
      uniqueImageRels.map(async (rel) => {
        const abs = resolveSafe(tiledRoot, rel);
        const bytes = await fs.promises.readFile(abs);
        return { relPath: rel, bytes: toArrayBuffer(bytes) };
      }),
    );

    return {
      map: { relPath: mapRel, bytes: toArrayBuffer(mapBuf) },
      tilesets,
      images,
    };
  },
);
