import fs from 'fs';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

/**
 * Fork-owned. Materializes a fresh Tiled tileset (.tsx + image) from an
 * image the user picked off their disk. Used by the "From tileset image…"
 * branch of AddTilesetDialog.
 *
 * Layout follows the existing PSDK Tiled convention:
 *   Data/Tiled/Tilesets/<name>.tsx         (XML)
 *   Data/Tiled/Assets/<name>.<ext>         (image — extension from src)
 *
 * Refuses to overwrite an existing .tsx OR image with the same name.
 * Path-locked: both writes must resolve inside their respective subtrees.
 */

export type CreateTilesetFromImageInput = {
  projectPath: string;
  /** Absolute path to the source image the user picked. */
  srcImagePath: string;
  /** Tileset name (without .tsx). Used for both .tsx file AND image file. */
  name: string;
  tilewidth: number;
  tileheight: number;
  /** Pixel dims of the source image (renderer reads them via ImageBitmap). */
  imageWidth: number;
  imageHeight: number;
  /** Optional Tiled trans color, lowercase hex without '#', e.g. "ff00ff". */
  trans?: string;
};

export type CreateTilesetFromImageOutput = {
  tsxFilename: string;
  imageFilename: string;
};

const escapeXmlAttr = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const registerCreateTilesetFromImage = defineBackendServiceFunction(
  'create-tileset-from-image',
  async (input: CreateTilesetFromImageInput): Promise<CreateTilesetFromImageOutput> => {
    const { projectPath, srcImagePath, name, tilewidth, tileheight, imageWidth, imageHeight, trans } = input;

    if (!name || /[\\/:*?"<>|]/.test(name)) {
      throw new Error(`createTilesetFromImage: invalid tileset name "${name}"`);
    }
    if (tilewidth <= 0 || tileheight <= 0) {
      throw new Error(`createTilesetFromImage: tile size must be > 0`);
    }

    const tilesetsDir = path.resolve(projectPath, 'Data', 'Tiled', 'Tilesets');
    const assetsDir = path.resolve(projectPath, 'Data', 'Tiled', 'Assets');
    const ext = path.extname(srcImagePath).toLowerCase() || '.png';
    const tsxFilename = `${name}.tsx`;
    const imageFilename = `${name}${ext}`;
    const tsxPath = path.resolve(tilesetsDir, tsxFilename);
    const imagePath = path.resolve(assetsDir, imageFilename);

    // Path lock: refuse anything that escapes the expected subtrees.
    for (const [base, target, label] of [
      [tilesetsDir, tsxPath, 'Data/Tiled/Tilesets'],
      [assetsDir, imagePath, 'Data/Tiled/Assets'],
    ] as const) {
      const rel = path.relative(base, target);
      if (rel.startsWith('..') || path.isAbsolute(rel)) {
        throw new Error(`createTilesetFromImage: refusing to write outside ${label} (${name})`);
      }
    }

    // Refuse to clobber. User explicitly opted for this conflict policy.
    if (fs.existsSync(tsxPath)) {
      throw new Error(`A tileset named "${tsxFilename}" already exists. Pick a different name.`);
    }
    if (fs.existsSync(imagePath)) {
      throw new Error(`An asset named "${imageFilename}" already exists in Data/Tiled/Assets. Pick a different name.`);
    }

    if (!fs.existsSync(srcImagePath)) {
      throw new Error(`Source image not found: ${srcImagePath}`);
    }

    await fs.promises.mkdir(tilesetsDir, { recursive: true });
    await fs.promises.mkdir(assetsDir, { recursive: true });

    // Copy image first; if .tsx write fails afterwards we'll roll the
    // image back so the user doesn't end up with an orphan asset.
    await fs.promises.copyFile(srcImagePath, imagePath);

    const columns = Math.max(1, Math.floor(imageWidth / tilewidth));
    const rows = Math.max(1, Math.floor(imageHeight / tileheight));
    const tilecount = columns * rows;

    const transAttr = trans ? ` trans="${escapeXmlAttr(trans)}"` : '';
    const tsx =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<tileset version="1.10" tiledversion="1.12.1" name="${escapeXmlAttr(name)}" ` +
      `tilewidth="${tilewidth}" tileheight="${tileheight}" tilecount="${tilecount}" columns="${columns}">\n` +
      ` <image source="../Assets/${escapeXmlAttr(imageFilename)}" width="${imageWidth}" height="${imageHeight}"${transAttr}/>\n` +
      `</tileset>\n`;

    try {
      const tmp = `${tsxPath}.tmp-${process.pid}-${Date.now()}`;
      await fs.promises.writeFile(tmp, tsx, 'utf8');
      await fs.promises.rename(tmp, tsxPath);
    } catch (e) {
      // Best-effort rollback of the image copy.
      try { await fs.promises.unlink(imagePath); } catch { /* ignored */ }
      throw e;
    }

    return { tsxFilename, imageFilename };
  },
);
