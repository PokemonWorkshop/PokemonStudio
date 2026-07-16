import React, { useEffect, useState } from 'react';
import { DIRECTION_TO_ROW } from './rmxpEventUtils';

/**
 * Character sheet rendering helpers (RMXP 4×4 sheets: columns = walk
 * pattern 0..3, rows = down/left/right/up).
 *
 * Sheets are arbitrary sizes (small NPCs, big overworld rigs), so all
 * rendering is based on the image's NATURAL size — one cell = (w/4, h/4) —
 * scaled by an integer-friendly factor with pixelated rendering. No more
 * squishing into whatever box the marker happens to be.
 */

const URL_ROOT = 'project://--/';
export const characterSrc = (projectPath: string, characterName: string) => {
  const url = new URL(`graphics/characters/${characterName}`, URL_ROOT);
  url.searchParams.append('projectPath', projectPath);
  url.searchParams.append('type', 'image');
  return url.toString();
};

const sizeCache = new Map<string, { w: number; h: number }>();

/** Natural size of an image URL (cached across all sprites). */
export const useImageSize = (src: string | null): { w: number; h: number } | null => {
  const [size, setSize] = useState<{ w: number; h: number } | null>(src ? (sizeCache.get(src) ?? null) : null);
  useEffect(() => {
    if (!src) return setSize(null);
    const cached = sizeCache.get(src);
    if (cached) return setSize(cached);
    let alive = true;
    const img = new Image();
    img.onload = () => {
      const entry = { w: img.naturalWidth, h: img.naturalHeight };
      sizeCache.set(src, entry);
      if (alive) setSize(entry);
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);
  return size;
};

type CharacterSpriteProps = {
  projectPath: string;
  characterName: string;
  direction: number;
  pattern: number;
  /** css px the cell should be scaled to fit inside (contain, aspect kept). */
  fitW: number;
  fitH: number;
  /** never scale above this factor (1 = native pixels max). */
  maxScale?: number;
  /**
   * Render at EXACTLY this scale (1 sprite px → `exactScale` css px), ignoring
   * fitW/fitH and the integer-snapping. Used on the map so a sprite occupies
   * its true in-game footprint and tracks zoom smoothly.
   */
  exactScale?: number;
  style?: React.CSSProperties;
  className?: string;
};

/** One cell of a character sheet, aspect-correct, pixelated. */
export const CharacterSprite = ({ projectPath, characterName, direction, pattern, fitW, fitH, maxScale, exactScale, style, className }: CharacterSpriteProps) => {
  const src = characterName ? characterSrc(projectPath, characterName) : null;
  const size = useImageSize(src);
  if (!src || !size) return null;
  const cellW = size.w / 4;
  const cellH = size.h / 4;
  let scale: number;
  if (exactScale !== undefined) {
    // Map view: true footprint, no snapping — accuracy beats crispness here.
    scale = exactScale;
  } else {
    scale = Math.min(fitW / cellW, fitH / cellH);
    if (maxScale !== undefined) scale = Math.min(scale, maxScale);
    // Prefer crisp integer scaling when we're at or above 1:1.
    if (scale >= 1) scale = Math.max(1, Math.floor(scale));
  }
  const row = DIRECTION_TO_ROW[direction] ?? 0;
  const col = Math.min(3, Math.max(0, pattern));
  return (
    <div
      className={className}
      style={{
        width: cellW * scale,
        height: cellH * scale,
        backgroundImage: `url("${src}")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${size.w * scale}px ${size.h * scale}px`,
        backgroundPosition: `${-col * cellW * scale}px ${-row * cellH * scale}px`,
        imageRendering: 'pixelated',
        ...style,
      }}
    />
  );
};

/**
 * Animated preview: walks in place (pattern 0→1→2→3). When `direction` is
 * given the sprite keeps facing that way; otherwise it slowly rotates
 * through down → left → right → up.
 */
export const AnimatedCharacterPreview = ({
  projectPath,
  characterName,
  fitW,
  fitH,
  direction,
}: {
  projectPath: string;
  characterName: string;
  fitW: number;
  fitH: number;
  direction?: number;
}) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setTick(0);
    const interval = window.setInterval(() => setTick((v) => v + 1), 180);
    return () => window.clearInterval(interval);
  }, [characterName]);
  const pattern = tick % 4;
  const rotating = [2, 4, 6, 8][Math.floor(tick / 8) % 4];
  return (
    <CharacterSprite projectPath={projectPath} characterName={characterName} direction={direction ?? rotating} pattern={pattern} fitW={fitW} fitH={fitH} />
  );
};
