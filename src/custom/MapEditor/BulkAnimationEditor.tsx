/**
 * Tiled-style Bulk Animation Editor.
 *
 * Counterpart to {@link AnimationEditor}. Opens when the user selects
 * more than one tile in the tileset palette and clicks the 🎞 button.
 * Instead of editing a single tile's animation, this builds a whole row
 * of animations at once by walking outward from each selected tile in a
 * stride pattern. Mirrors the "Bulk Animation Editor" Tiled plugin —
 * which the user finds essential for animating long strips like water,
 * fire, leaves, etc.
 *
 * Inputs:
 *   - Direction: Right (advance horizontally), Down (advance vertically),
 *     or Both (advance diagonally by both strides each frame).
 *   - Stride (Right) — how many tiles to advance horizontally per frame.
 *     Defaults to the bounding-box width of the user's selection.
 *   - Stride (Down) — same, vertically. Defaults to the selection bbox
 *     height.
 *   - Frames — number of frames per animation. 0 means "continue until
 *     the walking position runs out of tileset bounds".
 *   - Duration — per-frame ms; same default (100) as Tiled.
 *
 * On OK we read the .tsx bytes, build a frame list for each base tile,
 * find-or-create its <tile> element, replace its <animation> with the
 * new frames, then write the whole modified .tsx back. Same DOM-mutate
 * model as AnimationEditor so non-libtiled attributes survive.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import type { LoadedTileset } from './mapEditorTypes';

const DEFAULT_FRAME_MS = 100;

export type BulkDirection = 'right' | 'down' | 'both';

type Frame = { tileid: number; duration: number };

type Props = {
  projectPath: string;
  tileset: LoadedTileset;
  /** Local tile ids selected by the user. >1 entries is what triggers this dialog. */
  baseTileIds: number[];
  onCancel: () => void;
  onSaved: (tsxFilename: string) => void;
};

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.colors.dark16};
  border-radius: 8px;
  width: min(520px, 92vw);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark14};
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text100};
`;

const Body = styled.div`
  flex: 1;
  overflow: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SectionLabel = styled.div`
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text100};
`;

const HelpText = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  line-height: 1.4;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FieldLabel = styled.label`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  flex: 0 0 110px;
`;

const NumberField = styled.input`
  width: 100px;
  padding: 6px 8px;
  background-color: ${({ theme }) => theme.colors.dark20};
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalSmall};
  outline: none;
  text-align: right;
  &:focus { border-color: ${({ theme }) => theme.colors.primaryBase}; }
`;

const Select = styled.select`
  padding: 6px 8px;
  background-color: ${({ theme }) => theme.colors.dark20};
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text100};
  ${({ theme }) => theme.fonts.normalSmall};
  outline: none;
  min-width: 140px;
  &:focus { border-color: ${({ theme }) => theme.colors.primaryBase}; }
`;

const Footer = styled.div`
  padding: 10px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.dark14};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const FooterRight = styled.div`
  display: flex;
  gap: 8px;
`;

const ErrorMsg = styled.div`
  color: ${({ theme }) => theme.colors.dangerBase};
  ${({ theme }) => theme.fonts.normalSmall};
`;

const SummaryBox = styled.div`
  padding: 8px 10px;
  background-color: ${({ theme }) => theme.colors.dark14};
  border-radius: 4px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

const PreviewBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.dark14};
  border-radius: 6px;
  min-height: 96px;
`;

const PreviewCanvas = styled.canvas`
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  background-color: ${({ theme }) => theme.colors.dark20};
  border-radius: 4px;
`;

const PreviewLabel = styled.div`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  margin-bottom: 4px;
`;

const tsxFilenameOf = (source: string | undefined): string | null => {
  if (!source) return null;
  const parts = source.replaceAll('\\', '/').split('/');
  const last = parts[parts.length - 1];
  return last && last.toLowerCase().endsWith('.tsx') ? last : null;
};

const directionLabel = (d: BulkDirection): string =>
  d === 'right' ? 'Right' : d === 'down' ? 'Down' : 'Both';

const directionHelp = (d: BulkDirection): string =>
  d === 'right'
    ? 'Each animation advances to the right by Stride (Right) per frame. Stride (Down) is ignored.'
    : d === 'down'
      ? 'Each animation advances downward by Stride (Down) per frame. Stride (Right) is ignored.'
      : 'Each animation advances diagonally — Stride (Right) per frame horizontally AND Stride (Down) per frame vertically.';

export const BulkAnimationEditor: React.FC<Props> = ({
  projectPath, tileset, baseTileIds, onCancel, onSaved,
}) => {
  const tsxFilename = useMemo(() => tsxFilenameOf(tileset.source), [tileset.source]);

  // Tileset grid dims — match the formulas Tiled's plugin uses
  // (`getNumCols`, `getNumRows`) so our extent + idStride + maxFrames
  // math agrees with Tiled's on margin/spacing-heavy tilesets too.
  const cols = tileset.columns || 1;
  const rows = useMemo(() => {
    const margin = tileset.margin ?? 0;
    const spacing = tileset.spacing ?? 0;
    const H = tileset.imageheight ?? tileset.bitmap?.height ?? 0;
    const h = tileset.tileheight;
    return Math.max(1, Math.floor((H + spacing - 2 * margin) / (h + spacing)));
  }, [tileset]);
  const totalTiles = cols * rows;

  // Selection extent — (x, y) is the top-left of the bbox, (width, height)
  // is its size in tile cells. Direct equivalent of Tiled's
  // `getSelectionExtent()`.
  const extent = useMemo(() => {
    let minC = Infinity, maxC = -Infinity, minR = Infinity, maxR = -Infinity;
    for (const id of baseTileIds) {
      const c = id % cols;
      const r = Math.floor(id / cols);
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
    }
    if (!Number.isFinite(minC)) return { x: 0, y: 0, width: 1, height: 1 };
    return { x: minC, y: minR, width: maxC - minC + 1, height: maxR - minR + 1 };
  }, [baseTileIds, cols]);

  // Tiled treats sparse / non-rectangular selections specially: default
  // stride collapses to 1 (since "bbox dim" is meaningless when there are
  // gaps). Check whether every cell in the bbox is actually selected.
  const isSelectionRectangular = useMemo(() => {
    if (baseTileIds.length !== extent.width * extent.height) return false;
    const set = new Set(baseTileIds);
    for (let r = extent.y; r < extent.y + extent.height; r++) {
      for (let c = extent.x; c < extent.x + extent.width; c++) {
        if (!set.has(r * cols + c)) return false;
      }
    }
    return true;
  }, [baseTileIds, extent, cols]);

  // Tiled's defaults — direction chosen by tileset aspect, stride by
  // selection bbox when rectangular (else 1).
  const imageW = tileset.imagewidth ?? tileset.bitmap?.width ?? 0;
  const imageH = tileset.imageheight ?? tileset.bitmap?.height ?? 0;
  const defaultDirection: BulkDirection = imageW >= imageH ? 'right' : 'down';
  const defaultStrideR = isSelectionRectangular ? extent.width : 1;
  const defaultStrideD = isSelectionRectangular ? extent.height : 1;

  const [direction, setDirection] = useState<BulkDirection>(defaultDirection);
  // Mirror Tiled's `updateStrideInputs`: the inactive stride is zeroed on
  // open. Since `defaultDirection` is 'right' for landscape tilesets,
  // Stride (Down) lands at 0 by default — which is what Tiled users are
  // used to seeing.
  const [strideRight, setStrideRight] = useState<string>(
    defaultDirection === 'down' ? '0' : String(defaultStrideR),
  );
  const [strideDown, setStrideDown] = useState<string>(
    defaultDirection === 'right' ? '0' : String(defaultStrideD),
  );
  // Default to 1 (not 0) so the input shows a concrete starting value;
  // the user typically bumps this up to the number of art frames they
  // have. Typing 0 still means "use the computed max" — see help text.
  const [framesCount, setFramesCount] = useState<string>('1');
  const [duration, setDuration] = useState<string>(String(DEFAULT_FRAME_MS));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cancelledRef = useRef(false);

  /**
   * Linear "id stride" — how many spots forward in `tileset.tiles[]` to
   * jump between successive frames. This is Tiled's formula, NOT a 2D
   * (dx, dy) walk: for 'both' that produces a wrapping/spiral pattern
   * that's deliberately different from a pure diagonal step.
   */
  const getIdStride = (dir: BulkDirection, sR: number, sD: number): number => {
    if (dir === 'right') return sR;
    if (dir === 'down') return cols * sD;
    return sR + cols * sD; // both
  };

  /** Max stride in a given direction before walking off the tileset. */
  const getMaxStride = (which: 'r' | 'd'): number => {
    if (which === 'r') return Math.max(0, cols - (extent.x + extent.width));
    return Math.max(0, rows - (extent.y + extent.height));
  };

  /**
   * Tiled's `getMaxFrames`: the cap that lets the animation walk to the
   * tileset's edge from the selection extent. For 'both' it's the
   * multiplicative grid count — a safe upper bound for the linear walk
   * because positions past the in-bounds region land on null tiles and
   * get skipped. The user sees "0" in the Frames input which means
   * "use this max".
   */
  const getMaxFrames = (dir: BulkDirection, sR: number, sD: number): number => {
    const extentR = extent.x + extent.width;
    const extentB = extent.y + extent.height;
    if (dir === 'right') {
      return sR <= 0 ? 0 : 1 + Math.floor((cols - extentR) / sR);
    }
    if (dir === 'down') {
      return sD <= 0 ? 0 : 1 + Math.floor((rows - extentB) / sD);
    }
    if (sR <= 0 || sD <= 0) return 0;
    return (1 + Math.floor((cols - extentR) / sR)) * (1 + Math.floor((rows - extentB) / sD));
  };

  /** Parsed-and-clamped settings, shared by preview AND save. */
  const parsed = useMemo(() => {
    const sR = Math.max(0, parseInt(strideRight, 10) || 0);
    const sD = Math.max(0, parseInt(strideDown, 10) || 0);
    const userFrames = Math.max(0, parseInt(framesCount, 10) || 0);
    const durMs = Math.max(1, parseInt(duration, 10) || DEFAULT_FRAME_MS);
    const maxFrames = getMaxFrames(direction, sR, sD);
    // "0" in the Frames input means "use the computed maximum" — exactly
    // Tiled's behavior (`this.config.frames = input.value === 0 ? this.getMaxFrames() : input.value`).
    const effectiveFrames = userFrames === 0 ? maxFrames : Math.min(userFrames, maxFrames);
    const idStride = getIdStride(direction, sR, sD);
    return { sR, sD, userFrames, durMs, maxFrames, effectiveFrames, idStride };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [direction, strideRight, strideDown, framesCount, duration, extent, cols, rows]);

  /**
   * Per-base-tile frame lists, computed by walking `tileset.tiles[]`
   * linearly by `idStride` and skipping any landing position that's
   * outside the tileset. Matches Tiled's `getFrames` exactly.
   *
   * Reused for BOTH the live preview AND the save handler — so what the
   * user previews is exactly what we write.
   */
  const animFramesPerTile = useMemo(() => {
    const out = new Map<number, Frame[]>();
    const { idStride, effectiveFrames, durMs } = parsed;
    for (const baseId of baseTileIds) {
      const frames: Frame[] = [];
      if (effectiveFrames <= 0 || idStride === 0) {
        // Degenerate — fall back to showing the static base tile so the
        // preview keeps giving feedback while the user is mid-edit.
        frames.push({ tileid: baseId, duration: durMs });
      } else {
        let tileIndex = baseId;
        for (let i = 0; i < effectiveFrames; i++) {
          if (tileIndex >= 0 && tileIndex < totalTiles) {
            frames.push({ tileid: tileIndex, duration: durMs });
          }
          tileIndex += idStride;
        }
      }
      out.set(baseId, frames);
    }
    return out;
  }, [baseTileIds, parsed, totalTiles]);

  // ---- direction-change side-effect (mirrors Tiled's updateStrideInputs)
  // When the user flips direction we re-default the strides the same way
  // Tiled does — so common cases ("oh right, I want Down now") don't
  // require manually retyping the stride.
  const onDirectionChange = (next: BulkDirection) => {
    setDirection(next);
    if (next === 'right') {
      setStrideDown('0');
      if ((parseInt(strideRight, 10) || 0) <= 0) {
        setStrideRight(String(defaultStrideR));
      }
    } else if (next === 'down') {
      setStrideRight('0');
      if ((parseInt(strideDown, 10) || 0) <= 0) {
        setStrideDown(String(defaultStrideD));
      }
    } else { // both
      // Bump tiny / cleared values back up to the rectangular default —
      // matches Tiled's `if (input.value === 1) value = default`.
      if ((parseInt(strideRight, 10) || 0) <= 1) setStrideRight(String(defaultStrideR));
      if ((parseInt(strideDown, 10) || 0) <= 1) setStrideDown(String(defaultStrideD));
    }
  };

  // Pixel-perfect preview sizing. Render the selection's bbox at the
  // largest integer pixel-art scale that fits in MAX_PREVIEW_SIZE — keeps
  // the preview crisp without scrollbars. Bigger tiles or huge bboxes
  // can fall back to <1 scale via CSS image-rendering: pixelated.
  const MAX_PREVIEW_SIZE = 320;
  const { previewScale, previewW, previewH, bboxMinC, bboxMinR } = useMemo(() => {
    let minC = Infinity, minR = Infinity, maxC = -Infinity, maxR = -Infinity;
    for (const id of baseTileIds) {
      const c = id % cols;
      const r = Math.floor(id / cols);
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
    }
    if (!Number.isFinite(minC)) {
      return { previewScale: 1, previewW: tileset.tilewidth, previewH: tileset.tileheight, bboxMinC: 0, bboxMinR: 0 };
    }
    const bboxW = (maxC - minC + 1) * tileset.tilewidth;
    const bboxH = (maxR - minR + 1) * tileset.tileheight;
    const natural = Math.min(MAX_PREVIEW_SIZE / bboxW, MAX_PREVIEW_SIZE / bboxH);
    const scale = Math.min(4, Math.max(0.25, natural));
    return {
      previewScale: scale,
      previewW: Math.round(bboxW * scale),
      previewH: Math.round(bboxH * scale),
      bboxMinC: minC,
      bboxMinR: minR,
    };
  }, [baseTileIds, cols, tileset.tilewidth, tileset.tileheight]);

  // rAF-driven preview. On every frame we draw each selected tile at
  // its bbox position, picking the active frame for the current elapsed
  // time. Restart timing whenever the settings change so the cycle stays
  // aligned with whatever the user just adjusted.
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !tileset.bitmap) return;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const tilePitchX = tileset.tilewidth + (tileset.spacing ?? 0);
    const tilePitchY = tileset.tileheight + (tileset.spacing ?? 0);
    const margin = tileset.margin ?? 0;
    let raf = 0;
    const start = performance.now();
    const draw = () => {
      const elapsed = performance.now() - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animFramesPerTile.forEach((frames, baseId) => {
        if (frames.length === 0) return;
        const totalCycle = frames.reduce((s, f) => s + Math.max(1, f.duration), 0);
        const t = totalCycle > 0 ? elapsed % totalCycle : 0;
        let acc = 0;
        let active = frames[0];
        for (const f of frames) {
          acc += Math.max(1, f.duration);
          if (t < acc) { active = f; break; }
        }
        const baseCol = baseId % cols;
        const baseRow = Math.floor(baseId / cols);
        const destX = (baseCol - bboxMinC) * tileset.tilewidth * previewScale;
        const destY = (baseRow - bboxMinR) * tileset.tileheight * previewScale;
        const srcCol = active.tileid % cols;
        const srcRow = Math.floor(active.tileid / cols);
        const srcX = margin + srcCol * tilePitchX;
        const srcY = margin + srcRow * tilePitchY;
        ctx.drawImage(
          tileset.bitmap!,
          srcX, srcY, tileset.tilewidth, tileset.tileheight,
          destX, destY,
          tileset.tilewidth * previewScale, tileset.tileheight * previewScale,
        );
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [animFramesPerTile, tileset, cols, previewScale, bboxMinC, bboxMinR]);

  const previewSummary = useMemo(() => {
    let totalFrames = 0;
    let minFrames = Infinity;
    let maxFrames = -Infinity;
    animFramesPerTile.forEach((frames) => {
      totalFrames += frames.length;
      if (frames.length < minFrames) minFrames = frames.length;
      if (frames.length > maxFrames) maxFrames = frames.length;
    });
    const count = animFramesPerTile.size;
    if (count === 0) return '';
    const avg = count > 0 ? Math.round(totalFrames / count) : 0;
    return minFrames === maxFrames
      ? `${count} tile${count === 1 ? '' : 's'} · ${minFrames} frame${minFrames === 1 ? '' : 's'} each · ${parsed.durMs} ms/frame`
      : `${count} tiles · ${minFrames}–${maxFrames} frames (avg ${avg}) · ${parsed.durMs} ms/frame`;
  }, [animFramesPerTile, parsed.durMs]);

  const onConfirm = () => {
    if (!tsxFilename) {
      setError(`Tileset "${tileset.name ?? '(unnamed)'}" has no .tsx source path — cannot edit.`);
      return;
    }
    // Validate strides the way Tiled's `validateConfig` does — surface
    // a clear error instead of silently producing zero/garbage frames.
    const rightUsed = direction === 'right' || direction === 'both';
    const downUsed = direction === 'down' || direction === 'both';
    if (rightUsed && parsed.sR <= 0) {
      setError('Stride (Right) must be greater than 0.');
      return;
    }
    if (downUsed && parsed.sD <= 0) {
      setError('Stride (Down) must be greater than 0.');
      return;
    }
    const maxR = getMaxStride('r');
    const maxD = getMaxStride('d');
    if (rightUsed && parsed.sR > maxR) {
      setError(`Stride (Right) too large. Max for this selection + tileset is ${maxR}.`);
      return;
    }
    if (downUsed && parsed.sD > maxD) {
      setError(`Stride (Down) too large. Max for this selection + tileset is ${maxD}.`);
      return;
    }
    if (parsed.userFrames > parsed.maxFrames) {
      setError(`Frames exceeds maximum ${parsed.maxFrames} for these settings.`);
      return;
    }

    setBusy(true);
    setError(null);
    cancelledRef.current = false;

    window.api.readTilesetBytes(
      { projectPath, tsxFilename },
      ({ bytes }) => {
        if (cancelledRef.current) return;
        try {
          const xml = new TextDecoder().decode(bytes);
          const doc = new DOMParser().parseFromString(xml, 'application/xml');
          if (doc.querySelector('parsererror')) throw new Error('Could not parse .tsx XML.');
          const tilesetEl = doc.documentElement;

          let touched = 0;
          // Reuse the same per-tile frame lists the preview is using —
          // guarantees "what you saw is what gets written".
          animFramesPerTile.forEach((frames, baseId) => {
            // Skip degenerate single-frame animations — they animate
            // nothing and just clutter the .tsx.
            if (frames.length < 2) return;
            let tileEl = Array.from(tilesetEl.querySelectorAll(':scope > tile'))
              .find((el) => parseInt(el.getAttribute('id') ?? '-1', 10) === baseId);
            if (!tileEl) {
              tileEl = doc.createElement('tile');
              tileEl.setAttribute('id', String(baseId));
              tilesetEl.appendChild(tileEl);
            }
            const oldAnim = tileEl.querySelector(':scope > animation');
            if (oldAnim) oldAnim.remove();
            const animEl = doc.createElement('animation');
            for (const f of frames) {
              const frameEl = doc.createElement('frame');
              frameEl.setAttribute('tileid', String(f.tileid));
              frameEl.setAttribute('duration', String(f.duration));
              animEl.appendChild(frameEl);
            }
            tileEl.appendChild(animEl);
            touched++;
          });

          if (touched === 0) {
            throw new Error('No animation could be built — the stride / frames settings produced single-frame animations only.');
          }

          const serialized = new XMLSerializer().serializeToString(doc);
          const outBytes = new TextEncoder().encode(serialized);
          window.api.writeTilesetBytes(
            { projectPath, tsxFilename, bytes: outBytes.buffer.slice(outBytes.byteOffset, outBytes.byteOffset + outBytes.byteLength) as ArrayBuffer },
            () => { setBusy(false); onSaved(tsxFilename); },
            (e) => { setBusy(false); setError(e.errorMessage); },
          );
        } catch (e) {
          setBusy(false);
          setError((e as Error).message);
        }
      },
      (e) => { setBusy(false); setError(e.errorMessage); },
    );
  };

  // Bulk-strip <animation> from every tile in baseTileIds. Mirrors
  // onConfirm's read-modify-write pattern but only deletes — no frame
  // building, no stride math. Used by the "Remove animations" footer
  // button when the user wants to undo a previous bulk apply (or just
  // wipe a region's animations).
  const onRemoveAll = () => {
    if (!tsxFilename) { setError('Tileset file unknown.'); return; }
    setBusy(true);
    setError(null);
    cancelledRef.current = false;
    window.api.readTilesetBytes(
      { projectPath, tsxFilename },
      ({ bytes }) => {
        if (cancelledRef.current) return;
        try {
          const xml = new TextDecoder().decode(bytes);
          const doc = new DOMParser().parseFromString(xml, 'application/xml');
          if (doc.querySelector('parsererror')) throw new Error('Could not parse .tsx XML.');
          const tilesetEl = doc.documentElement;
          const wantedIds = new Set(baseTileIds);
          let touched = 0;
          // Iterate a copy — we may remove tile elements mid-loop.
          for (const tileEl of Array.from(tilesetEl.querySelectorAll(':scope > tile'))) {
            const id = parseInt(tileEl.getAttribute('id') ?? '-1', 10);
            if (!wantedIds.has(id)) continue;
            const animEl = tileEl.querySelector(':scope > animation');
            if (!animEl) continue;
            animEl.remove();
            touched++;
            // Drop the wrapping <tile> if it carries no other content —
            // id-only tiles are noise (libtiled treats their absence as
            // identical).
            if (tileEl.children.length === 0 && tileEl.attributes.length === 1) {
              tileEl.remove();
            }
          }
          if (touched === 0) {
            setBusy(false);
            // Treat "nothing to remove" as success so the modal closes —
            // surprising-but-ok beats a stuck dialog when the user
            // selected a region with no animations.
            onSaved(tsxFilename);
            return;
          }
          const serialized = new XMLSerializer().serializeToString(doc);
          const outBytes = new TextEncoder().encode(serialized);
          window.api.writeTilesetBytes(
            { projectPath, tsxFilename, bytes: outBytes.buffer.slice(outBytes.byteOffset, outBytes.byteOffset + outBytes.byteLength) as ArrayBuffer },
            () => { setBusy(false); onSaved(tsxFilename); },
            (e) => { setBusy(false); setError(e.errorMessage); },
          );
        } catch (e) {
          setBusy(false);
          setError((e as Error).message);
        }
      },
      (e) => { setBusy(false); setError(e.errorMessage); },
    );
  };

  return (
    <Backdrop onClick={() => { cancelledRef.current = true; onCancel(); }}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>Bulk Animation Editor</Header>

        <Body>
          <Section>
            <SectionLabel>Direction</SectionLabel>
            <HelpText>
              Current Direction: <strong>{directionLabel(direction)}</strong>. {directionHelp(direction)}
            </HelpText>
            <Row>
              <FieldLabel>Direction</FieldLabel>
              <Select
                value={direction}
                onChange={(e) => onDirectionChange(e.target.value as BulkDirection)}
              >
                <option value="right">Right</option>
                <option value="down">Down</option>
                <option value="both">Both</option>
              </Select>
            </Row>
          </Section>

          <Section>
            <HelpText>
              Stride is the number of tiles to advance between frames in the chosen direction.
              Defaults are based on the selection's bounding-box size (or 1 if the selection
              isn't a perfect rectangle). For "Both", advances are linear in the tileset —
              wrapping rows just like Tiled does (idStride = R + cols·D).
            </HelpText>
            <Row>
              <FieldLabel htmlFor="bulk-sr">Stride (Right)</FieldLabel>
              <NumberField
                id="bulk-sr"
                type="number"
                min={0}
                max={getMaxStride('r') || undefined}
                value={strideRight}
                onChange={(e) => setStrideRight(e.target.value)}
                disabled={direction === 'down'}
                title={direction === 'down' ? 'Disabled — direction is Down' : `Max ${getMaxStride('r')}`}
              />
            </Row>
            <Row>
              <FieldLabel htmlFor="bulk-sd">Stride (Down)</FieldLabel>
              <NumberField
                id="bulk-sd"
                type="number"
                min={0}
                max={getMaxStride('d') || undefined}
                value={strideDown}
                onChange={(e) => setStrideDown(e.target.value)}
                disabled={direction === 'right'}
                title={direction === 'right' ? 'Disabled — direction is Right' : `Max ${getMaxStride('d')}`}
              />
            </Row>
          </Section>

          <Section>
            <HelpText>
              Number of frames per animation. Enter 0 to use the maximum the tileset allows
              (computed from selection extent + stride; matches Tiled's behavior).
              {parsed.maxFrames > 0 && ` Max for current settings: ${parsed.maxFrames}.`}
            </HelpText>
            <Row>
              <FieldLabel htmlFor="bulk-frames">Frames</FieldLabel>
              <NumberField
                id="bulk-frames"
                type="number"
                min={0}
                max={parsed.maxFrames || undefined}
                value={framesCount}
                onChange={(e) => setFramesCount(e.target.value)}
              />
            </Row>
          </Section>

          <Section>
            <HelpText>
              Duration (ms) for every frame of every animation.
            </HelpText>
            <Row>
              <FieldLabel htmlFor="bulk-dur">Duration</FieldLabel>
              <NumberField
                id="bulk-dur"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
              <span style={{ color: 'inherit' }}>ms</span>
            </Row>
          </Section>

          <Section>
            <PreviewLabel>Preview ({previewSummary})</PreviewLabel>
            <PreviewBox>
              {tileset.bitmap ? (
                <PreviewCanvas
                  ref={previewCanvasRef}
                  width={previewW}
                  height={previewH}
                />
              ) : (
                <span style={{ opacity: 0.6 }}>This tileset has no image bytes loaded.</span>
              )}
            </PreviewBox>
          </Section>

          <SummaryBox>
            About to (re-)animate <strong>{baseTileIds.length}</strong> tile{baseTileIds.length === 1 ? '' : 's'}.
            Existing animations on these tiles will be replaced.
          </SummaryBox>
        </Body>

        <Footer>
          <div>{error && <ErrorMsg>{error}</ErrorMsg>}</div>
          <FooterRight>
            <DarkButton onClick={() => { cancelledRef.current = true; onCancel(); }} disabled={busy}>Cancel</DarkButton>
            <DarkButton
              onClick={onRemoveAll}
              disabled={busy || !tsxFilename}
              title="Strip <animation> elements from every selected tile"
            >
              {busy ? '…' : 'Remove animations'}
            </DarkButton>
            <PrimaryButton onClick={onConfirm} disabled={busy || !tsxFilename}>
              {busy ? 'Building…' : 'OK'}
            </PrimaryButton>
          </FooterRight>
        </Footer>
      </Modal>
    </Backdrop>
  );
};
