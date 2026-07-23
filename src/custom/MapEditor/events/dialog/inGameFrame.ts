/**
 * Fork-owned. Shared bits for the "in-game" command previews (Screen Shake,
 * Map Overlay): the PSDK screen framing, the per-project preview character
 * setting, and the drawing math. Keeping these in one place means both
 * previews frame the map identically and share the character you picked.
 *
 * The frame is the game's screen, not an arbitrary box. Its size comes from
 * `Configs.display.game_resolution` and it is only ever scaled by a WHOLE
 * number, exactly like PSDK's window_scale. That buys two things: the shader
 * preview runs over the same UV aspect the game does (several presets — godrays
 * especially — compute their whole effect in UV space, so a differently-shaped
 * viewport visibly distorts them), and every map tile lands on an integer pixel
 * grid, so nothing picks up mixels on the way to the screen.
 *
 * Two tile sizes matter and must not be confused:
 *   • TMX_TILE_PX (32) — how the map and character sheets are AUTHORED, i.e. the
 *     snapshot's pixels-per-tile. RMXP data is always 32px.
 *   • display tile px — how big a tile is drawn ON SCREEN in game-resolution
 *     space. A `Yuki::Tilemap16px` project halves it to 16, so a 320-wide screen
 *     shows 20 tiles, not 10. This is passed in from the display config.
 */

/** How the map and character graphics are authored — RMXP is always 32px. */
export const TMX_TILE_PX = 32;

/** On-screen tile size in game-resolution px, from the project's tilemap class. */
export const displayTilePx = (tilemapClass: string): number => (/16px/i.test(tilemapClass) ? 16 : 32);

export type GameResolution = { x: number; y: number };

export type FrameGeometry = {
  /** Whole-number screen scale, like Configs.display.window_scale. */
  scale: number;
  /** Backing-store size in device pixels — what the canvas is drawn at. */
  width: number;
  height: number;
  /** Layout size in CSS pixels. */
  cssWidth: number;
  cssHeight: number;
  /** Device pixels per map tile on screen — always an integer. */
  tilePx: number;
};

/**
 * Largest whole-number scaling of the game screen that fits the CSS box we have,
 * then a whole-number backing-store multiplier for the display density.
 *
 * Both factors are integers on purpose. The on-screen size is chosen in CSS
 * pixels so the preview doesn't shrink on a HiDPI display, and the backing store
 * is a whole multiple of that so every source pixel still maps to a block of
 * whole device pixels — which is what stops the character sprite picking up
 * mixels.
 *
 * `displayTile` is the game's on-screen tile size (16 for a 16px tilemap, else
 * 32); it decides how many tiles the frame shows — gameRes / displayTile.
 */
export const frameGeometry = (
  gameRes: GameResolution,
  displayTile: number,
  availableCssW: number,
  availableCssH: number,
  devicePixelRatio: number
): FrameGeometry => {
  const w = Math.max(1, gameRes.x);
  const h = Math.max(1, gameRes.y);
  const scale = Math.max(1, Math.floor(Math.min(availableCssW / w, availableCssH / h)));
  const density = Math.max(1, Math.round(devicePixelRatio));
  const total = scale * density;
  return {
    scale: total,
    width: w * total,
    height: h * total,
    cssWidth: w * scale,
    cssHeight: h * scale,
    tilePx: displayTile * total,
  };
};

/** Per-project setting: the preview character graphic (RMXP-style name). */
export const PREVIEW_CHAR_KEY = 'pokemonstudio.fork.mapEditor.previewCharacter';

export const loadPreviewCharacter = (projectPath?: string): string => {
  try {
    return (projectPath && localStorage.getItem(`${PREVIEW_CHAR_KEY}:${projectPath}`)) || '';
  } catch {
    return '';
  }
};

export const savePreviewCharacter = (projectPath: string, name: string) => {
  try {
    localStorage.setItem(`${PREVIEW_CHAR_KEY}:${projectPath}`, name);
  } catch {
    /* best-effort */
  }
};

/** Snapshot pixels per map tile. An uncapped snapshot gives TMX_TILE_PX. */
const tilePixels = (img: HTMLImageElement, mapWidthTiles?: number, mapHeightTiles?: number) => ({
  tpx: mapWidthTiles ? img.naturalWidth / mapWidthTiles : TMX_TILE_PX,
  tpy: mapHeightTiles ? img.naturalHeight / mapHeightTiles : TMX_TILE_PX,
});

/**
 * Draw the map snapshot into the frame, centred on (cx, cy) in snapshot px.
 * The destination is rounded to whole device pixels so the nearest-neighbour
 * sampling stays on grid.
 */
export const drawFramedMap = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  geo: FrameGeometry,
  center: { x: number; y: number } | null,
  mapWidthTiles?: number,
  mapHeightTiles?: number
): void => {
  const { tpx, tpy } = tilePixels(img, mapWidthTiles, mapHeightTiles);
  const sx = geo.tilePx / tpx;
  const sy = geo.tilePx / tpy;
  // Always land on a tile centre — the player can never stand between tiles,
  // so this keeps the framing honest even before the user clicks.
  const onTile = (v: number, step: number) => (step > 0 ? (Math.floor(v / step) + 0.5) * step : v);
  const cx = onTile(center?.x ?? img.naturalWidth / 2, tpx);
  const cy = onTile(center?.y ?? img.naturalHeight / 2, tpy);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    img,
    Math.round(geo.width / 2 - cx * sx),
    Math.round(geo.height / 2 - cy * sy),
    Math.round(img.naturalWidth * sx),
    Math.round(img.naturalHeight * sy)
  );
};

/**
 * Draw the configured character at the frame centre, sized like the game.
 *
 * PSDK does NOT scale character sprites by the tile downscale — a sprite is
 * drawn at its native resolution × `character_sprite_zoom` in game-resolution
 * space, so on a 16px tilemap the character is drawn twice the size of a tile
 * relative to a 32px sheet. We reproduce that: native frame px × spriteZoom ×
 * the device scale (`geo.scale` = game-px → device-px). The sheets are
 * horizontal 4-frame × 4-direction strips, so use the top-left frame.
 */
export const drawPreviewCharacter = (
  ctx: CanvasRenderingContext2D,
  charImg: HTMLImageElement,
  geo: FrameGeometry,
  spriteZoom = 1
) => {
  if (!charImg.naturalWidth) return;
  const fw = charImg.naturalWidth / 4;
  const fh = charImg.naturalHeight / 4;
  const drawW = Math.round(fw * spriteZoom * geo.scale);
  const drawH = Math.round(fh * spriteZoom * geo.scale);
  const feetY = geo.height / 2 + geo.tilePx * 0.5;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(charImg, 0, 0, fw, fh, Math.round(geo.width / 2 - drawW / 2), Math.round(feetY - drawH), drawW, drawH);
};

/**
 * Convert a click inside the frame to a new centre point in snapshot px,
 * SNAPPED to a tile centre — the player can only ever stand on a tile, so a
 * free-floating character would misrepresent what the effect looks like in
 * game. `deviceX`/`deviceY` are offsets within the frame, in device pixels.
 */
export const centerFromClick = (
  img: HTMLImageElement,
  geo: FrameGeometry,
  deviceX: number,
  deviceY: number,
  center: { x: number; y: number } | null,
  mapWidthTiles?: number,
  mapHeightTiles?: number
): { x: number; y: number } => {
  const { tpx, tpy } = tilePixels(img, mapWidthTiles, mapHeightTiles);
  const sx = geo.tilePx / tpx;
  const sy = geo.tilePx / tpy;
  const cx = center?.x ?? img.naturalWidth / 2;
  const cy = center?.y ?? img.naturalHeight / 2;
  const nx = cx + (deviceX - geo.width / 2) / sx;
  const ny = cy + (deviceY - geo.height / 2) / sy;
  // Snap to the centre of the tile the click landed in.
  const snap = (v: number, step: number, max: number) => {
    if (!(step > 0)) return Math.max(0, Math.min(max, v));
    const tile = Math.floor(v / step);
    const tiles = Math.max(1, Math.round(max / step));
    return (Math.max(0, Math.min(tiles - 1, tile)) + 0.5) * step;
  };
  return { x: snap(nx, tpx, img.naturalWidth), y: snap(ny, tpy, img.naturalHeight) };
};
