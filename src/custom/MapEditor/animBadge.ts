/**
 * Draw a tiny "film strip" badge at the bottom of a tile to indicate that
 * the tile has an <animation> defined. Used by both the main tileset
 * palette and the animation editor's picker so the look stays consistent.
 *
 * Renders a dark horizontal bar across the bottom of the tile with a row
 * of small yellow squares as sprocket holes — reads as "animated" at a
 * glance and stays unobtrusive on the underlying tile art.
 *
 * Coordinate convention matches the rest of the editor: (sx, sy) is the
 * top-left of the tile in canvas pixels.
 */

export function drawAnimationBadge(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  tileW: number,
  tileH: number,
): void {
  // Scale strip size to the tile so it looks reasonable on 16px and 48px
  // tiles alike. Clamp the minimums so it stays visible on tiny tiles.
  const barH = Math.max(3, Math.floor(tileH / 8));
  const padX = Math.max(2, Math.floor(tileW / 12));
  const padY = Math.max(1, Math.floor(tileH / 16));
  const barW = tileW - 2 * padX;
  if (barW <= 0 || barH <= 0) return;
  const bx = sx + padX;
  const by = sy + tileH - padY - barH;

  ctx.save();
  // Dark backdrop for contrast on light tiles.
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(bx, by, barW, barH);
  // Sprocket holes — white squares evenly spaced inside the bar.
  const holes = 4;
  const holeSize = Math.max(1, Math.floor(barH * 0.6));
  const holeGap = (barW - holes * holeSize) / (holes + 1);
  const holeY = by + Math.floor((barH - holeSize) / 2);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < holes; i++) {
    const hx = bx + holeGap + i * (holeSize + holeGap);
    ctx.fillRect(Math.round(hx), holeY, holeSize, holeSize);
  }
  ctx.restore();
}
