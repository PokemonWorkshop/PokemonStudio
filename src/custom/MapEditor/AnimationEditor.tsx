/**
 * Tiled-style per-tile animation editor.
 *
 * Layout deliberately mirrors Tiled's "Tile Animation Editor" window so
 * users transferring habits don't have to relearn:
 *
 *   ┌─ Toolbar ───────────────────────────────────────────────────────────┐
 *   │ Frame Duration: [   ms ] [Apply]                                     │
 *   ├──────────────────────┬───────────────────────────────────────────────┤
 *   │ Frame list           │ Tileset image (click a tile to append it as a │
 *   │  ▸ [thumb]  200 ms   │  frame). Animated tiles get a "•••" badge.    │
 *   │  ▸ [thumb]  200 ms   │  Base tile is outlined.                       │
 *   │  ▸ [thumb]  200 ms   │                                               │
 *   │  …                   │                                               │
 *   ├──────────────────────┤                                               │
 *   │ Preview ▶ [tile]     │                                               │
 *   └──────────────────────┴───────────────────────────────────────────────┘
 *   Cancel  Save animation
 *
 * Interaction model (matches Tiled):
 *   - Click a tile in the right panel → appended to the frame list with
 *     the duration currently in the toolbar input. Selection moves to the
 *     newly-added frame.
 *   - Click a frame in the list → it becomes the "active" frame. Editing
 *     the toolbar duration + clicking Apply updates the active frame's
 *     duration. (Same model as Tiled: top-toolbar Apply targets the
 *     selected row.)
 *   - ↑/↓ keys (or the row buttons) reorder; Delete (or "×" button)
 *     removes.
 *
 * Persistence:
 *   We read the raw `.tsx` bytes from disk, DOM-mutate just the
 *   <tile id="X"><animation>…</animation></tile> for the target tile,
 *   and write back. Nothing else in the .tsx is touched — keeps
 *   properties / terrain / wangsets / formatting byte-identical.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { DarkButton, PrimaryButton } from '@components/buttons';
import type { LoadedTileset } from './mapEditorTypes';
import { drawAnimationBadge } from './animBadge';

const DEFAULT_FRAME_MS = 100;

type Frame = { tileid: number; duration: number };

type Props = {
  projectPath: string;
  tileset: LoadedTileset;
  baseTileId: number;
  onCancel: () => void;
  onSaved: (tsxFilename: string) => void;
};

// ----- styled components ---------------------------------------------------

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
  width: min(1040px, 94vw);
  height: min(720px, 90vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark14};
  ${({ theme }) => theme.fonts.normalRegular};
  color: ${({ theme }) => theme.colors.text100};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

const SubHeader = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

const Toolbar = styled.div`
  padding: 8px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark14};
  display: flex;
  align-items: center;
  gap: 8px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

const ToolbarLabel = styled.label`
  color: ${({ theme }) => theme.colors.text400};
`;

const DurationInput = styled.input`
  width: 96px;
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

const ApplyBtn = styled.button`
  all: unset;
  padding: 6px 14px;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primaryBase};
  border-radius: 4px;
  cursor: pointer;
  ${({ theme }) => theme.fonts.normalSmall};
  &:hover { background-color: ${({ theme }) => theme.colors.secondaryHover}; }
  &[disabled] { opacity: 0.5; cursor: not-allowed; }
`;

const Body = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 0;
`;

const LeftCol = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.dark14};
`;

const FrameList = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

const FrameRow = styled.div<{ $selected: boolean }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text100};
  background-color: ${({ $selected, theme }) => ($selected ? theme.colors.dark23 : 'transparent')};
  &:hover { background-color: ${({ $selected, theme }) => ($selected ? theme.colors.dark23 : theme.colors.dark18)}; }
`;

const FrameThumb = styled.canvas`
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  background-color: ${({ theme }) => theme.colors.dark20};
  border-radius: 3px;
`;

const FrameMs = styled.span`
  color: ${({ theme }) => theme.colors.text400};
  font-variant-numeric: tabular-nums;
`;

const RowBtns = styled.div`
  display: flex;
  gap: 2px;
  opacity: 0;
  ${FrameRow}:hover & { opacity: 1; }
`;

const TinyBtn = styled.button`
  all: unset;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  color: ${({ theme }) => theme.colors.text400};
  background-color: ${({ theme }) => theme.colors.dark20};
  cursor: pointer;
  &:hover { background-color: ${({ theme }) => theme.colors.dark22}; color: ${({ theme }) => theme.colors.text100}; }
  &[disabled] { opacity: 0.4; cursor: not-allowed; }
`;

const PreviewPane = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.dark14};
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: ${({ theme }) => theme.colors.dark14};
  flex-shrink: 0;
`;

const PreviewCanvas = styled.canvas`
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  background-color: ${({ theme }) => theme.colors.dark20};
  border-radius: 4px;
`;

const PreviewInfo = styled.div`
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
`;

const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const TilesetHint = styled.div`
  padding: 6px 12px;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark14};
`;

const TilesetScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  background-color: ${({ theme }) => theme.colors.dark14};
  padding: 8px;
`;

const TilesetCanvas = styled.canvas`
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  cursor: crosshair;
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

const Empty = styled.div`
  padding: 16px;
  text-align: center;
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
`;

// ----- helpers -------------------------------------------------------------

const tsxFilenameOf = (source: string | undefined): string | null => {
  if (!source) return null;
  const parts = source.replaceAll('\\', '/').split('/');
  const last = parts[parts.length - 1];
  return last && last.toLowerCase().endsWith('.tsx') ? last : null;
};

// ----- component -----------------------------------------------------------

export const AnimationEditor: React.FC<Props> = ({
  projectPath, tileset, baseTileId, onCancel, onSaved,
}) => {
  const tsxFilename = useMemo(() => tsxFilenameOf(tileset.source), [tileset.source]);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  // The duration shown in the toolbar input. Decoupled from the selected
  // frame's duration so the user can type a value, then hit Apply to push
  // it onto the active frame — same as Tiled.
  const [durationInput, setDurationInput] = useState<string>(String(DEFAULT_FRAME_MS));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const tsxBytesRef = useRef<ArrayBuffer | null>(null);

  // Tileset geometry — mirrors TilesetPalette's TilesetView.
  const geom = useMemo(() => {
    const cols = tileset.columns || 1;
    const margin = tileset.margin ?? 0;
    const spacing = tileset.spacing ?? 0;
    const tilePitchX = tileset.tilewidth + spacing;
    const tilePitchY = tileset.tileheight + spacing;
    const rows = tileset.bitmap
      ? Math.max(1, Math.floor((tileset.bitmap.height - margin + spacing) / tilePitchY))
      : 1;
    return { cols, rows, margin, spacing, tilePitchX, tilePitchY };
  }, [tileset]);

  // Animation badge — tile ids in this tileset that already have an
  // animation. We mark them with "•••" in the picker.
  const animatedTileIds = useMemo(() => {
    const out = new Set<number>();
    const tiles = (tileset as unknown as { tiles?: Array<{ id: number; animation?: unknown[] }> }).tiles;
    if (!tiles) return out;
    for (const t of tiles) {
      if (t.animation && Array.isArray(t.animation) && t.animation.length > 0) out.add(t.id);
    }
    return out;
  }, [tileset]);

  // ----- Load on mount + seed initial frames ------------------------------

  useEffect(() => {
    if (!tsxFilename) {
      setError(`Tileset "${tileset.name ?? '(unnamed)'}" has no .tsx source path — cannot edit.`);
      return;
    }
    window.api.readTilesetBytes(
      { projectPath, tsxFilename },
      ({ bytes }) => {
        tsxBytesRef.current = bytes;
        const xml = new TextDecoder().decode(bytes);
        const doc = new DOMParser().parseFromString(xml, 'application/xml');
        if (doc.querySelector('parsererror')) { setError('Could not parse the .tsx XML.'); return; }
        const tileEl = Array.from(doc.querySelectorAll('tileset > tile'))
          .find((el) => parseInt(el.getAttribute('id') ?? '-1', 10) === baseTileId);
        const animEl = tileEl?.querySelector('animation');
        if (animEl) {
          const seed: Frame[] = Array.from(animEl.querySelectorAll('frame')).map((f) => ({
            tileid: parseInt(f.getAttribute('tileid') ?? '0', 10),
            duration: parseInt(f.getAttribute('duration') ?? `${DEFAULT_FRAME_MS}`, 10),
          }));
          setFrames(seed);
          if (seed.length > 0) {
            setSelectedIdx(0);
            setDurationInput(String(seed[0].duration));
          }
        } else {
          // Default: one frame containing the base tile itself.
          setFrames([{ tileid: baseTileId, duration: DEFAULT_FRAME_MS }]);
          setSelectedIdx(0);
        }
      },
      (e) => setError(e.errorMessage),
    );
  }, [projectPath, tsxFilename, baseTileId, tileset.name]);

  // ----- Tileset picker canvas --------------------------------------------

  const tilesetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = tilesetCanvasRef.current;
    if (!canvas || !tileset.bitmap) return;
    canvas.width = tileset.bitmap.width;
    canvas.height = tileset.bitmap.height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tileset.bitmap, 0, 0);
    // Film-strip badges on every tile that already has an <animation>.
    if (animatedTileIds.size > 0) {
      for (const id of animatedTileIds) {
        const row = Math.floor(id / geom.cols);
        const col = id % geom.cols;
        if (row >= geom.rows) continue;
        const sx = geom.margin + col * geom.tilePitchX;
        const sy = geom.margin + row * geom.tilePitchY;
        drawAnimationBadge(ctx, sx, sy, tileset.tilewidth, tileset.tileheight);
      }
    }
    // Base-tile outline (the one we're editing).
    const baseCol = baseTileId % geom.cols;
    const baseRow = Math.floor(baseTileId / geom.cols);
    const bx = geom.margin + baseCol * geom.tilePitchX;
    const by = geom.margin + baseRow * geom.tilePitchY;
    ctx.save();
    ctx.strokeStyle = '#ffd000';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 1, by + 1, tileset.tilewidth - 2, tileset.tileheight - 2);
    ctx.restore();
  }, [tileset, baseTileId, geom, animatedTileIds]);

  const onTilesetClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = tilesetCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = Math.floor(sx * scaleX);
    const py = Math.floor(sy * scaleY);
    const col = Math.floor((px - geom.margin) / geom.tilePitchX);
    const row = Math.floor((py - geom.margin) / geom.tilePitchY);
    if (col < 0 || row < 0 || col >= geom.cols || row >= geom.rows) return;
    const tileid = row * geom.cols + col;
    // Append using the duration currently in the toolbar — that's what
    // "Frame Duration: 800 ms" sets up to mean in Tiled (the default for
    // newly-added frames + the apply target for the selected frame).
    const dur = Math.max(1, parseInt(durationInput, 10) || DEFAULT_FRAME_MS);
    setFrames((cur) => {
      const next = [...cur, { tileid, duration: dur }];
      setSelectedIdx(next.length - 1);
      return next;
    });
  };

  // ----- Preview animation ------------------------------------------------

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !tileset.bitmap || frames.length === 0) return;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const totalCycle = frames.reduce((s, f) => s + Math.max(1, f.duration), 0);
    if (totalCycle <= 0) return;
    let raf = 0;
    const start = performance.now();
    const draw = () => {
      const elapsed = (performance.now() - start) % totalCycle;
      let acc = 0;
      let active = frames[0];
      for (const f of frames) {
        acc += Math.max(1, f.duration);
        if (elapsed < acc) { active = f; break; }
      }
      const col = active.tileid % geom.cols;
      const row = Math.floor(active.tileid / geom.cols);
      const sx = geom.margin + col * geom.tilePitchX;
      const sy = geom.margin + row * geom.tilePitchY;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        tileset.bitmap!,
        sx, sy, tileset.tilewidth, tileset.tileheight,
        0, 0, canvas.width, canvas.height,
      );
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [frames, tileset, geom]);

  // Static thumbnail draw — used inside the frame list rows.
  const drawTileTo = useCallback((canvas: HTMLCanvasElement | null, tileid: number) => {
    if (!canvas || !tileset.bitmap) return;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const col = tileid % geom.cols;
    const row = Math.floor(tileid / geom.cols);
    const sx = geom.margin + col * geom.tilePitchX;
    const sy = geom.margin + row * geom.tilePitchY;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      tileset.bitmap,
      sx, sy, tileset.tilewidth, tileset.tileheight,
      0, 0, canvas.width, canvas.height,
    );
  }, [tileset, geom]);

  // ----- Frame list mutations ---------------------------------------------

  const removeFrame = (idx: number) => {
    setFrames((cur) => cur.filter((_, i) => i !== idx));
    setSelectedIdx((cur) => {
      // Keep selection on a reasonable neighbor after the delete.
      if (cur === idx) return Math.min(idx, frames.length - 2);
      if (cur > idx) return cur - 1;
      return cur;
    });
  };
  const moveFrame = (idx: number, dir: -1 | 1) => {
    setFrames((cur) => {
      const next = [...cur];
      const swap = idx + dir;
      if (swap < 0 || swap >= next.length) return cur;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      // Carry selection with the moved row.
      setSelectedIdx((sel) => (sel === idx ? swap : sel === swap ? idx : sel));
      return next;
    });
  };
  const selectFrame = (idx: number) => {
    setSelectedIdx(idx);
    setDurationInput(String(frames[idx]?.duration ?? DEFAULT_FRAME_MS));
  };
  const applyDuration = () => {
    if (selectedIdx < 0 || selectedIdx >= frames.length) return;
    const n = Math.max(1, parseInt(durationInput, 10));
    if (!Number.isFinite(n)) return;
    setFrames((cur) => cur.map((f, i) => (i === selectedIdx ? { ...f, duration: n } : f)));
  };

  // Delete / arrow-key shortcuts inside the frame list.
  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (selectedIdx < 0) return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      removeFrame(selectedIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (e.altKey) moveFrame(selectedIdx, -1);
      else if (selectedIdx > 0) selectFrame(selectedIdx - 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (e.altKey) moveFrame(selectedIdx, 1);
      else if (selectedIdx < frames.length - 1) selectFrame(selectedIdx + 1);
    }
  };

  // ----- Save -------------------------------------------------------------

  // Strip the <animation> element off the target tile and write the
  // .tsx back. Lighter than onSave (no frame validation, no need to
  // build a new animation element) — mirrors the cleanup branch onSave
  // takes when frames is empty. Used by the "Remove animation" button
  // so the user doesn't have to clear every frame manually first.
  const removeAnimation = () => {
    if (!tsxBytesRef.current || !tsxFilename) {
      setError('Tileset bytes not loaded yet.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const xml = new TextDecoder().decode(tsxBytesRef.current);
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      if (doc.querySelector('parsererror')) throw new Error('Could not parse .tsx XML.');
      const tilesetEl = doc.documentElement;
      const tileEl = Array.from(tilesetEl.querySelectorAll(':scope > tile'))
        .find((el) => parseInt(el.getAttribute('id') ?? '-1', 10) === baseTileId);
      if (!tileEl) {
        // Nothing to remove — treat as success so the user closes cleanly.
        setBusy(false);
        onSaved(tsxFilename);
        return;
      }
      const animEl = tileEl.querySelector(':scope > animation');
      if (animEl) animEl.remove();
      // Drop the wrapping <tile> if it carries nothing else (id-only tile
      // elements add noise; libtiled treats their absence as identical).
      if (tileEl.children.length === 0 && tileEl.attributes.length === 1) {
        tileEl.remove();
      }
      const serialized = new XMLSerializer().serializeToString(doc);
      const bytes = new TextEncoder().encode(serialized);
      window.api.writeTilesetBytes(
        { projectPath, tsxFilename, bytes: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) },
        () => { setBusy(false); onSaved(tsxFilename); },
        (e) => { setBusy(false); setError(e.errorMessage); },
      );
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : 'Failed to remove animation.');
    }
  };

  const onSave = () => {
    if (!tsxBytesRef.current || !tsxFilename) {
      setError('Tileset bytes not loaded yet.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const xml = new TextDecoder().decode(tsxBytesRef.current);
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      if (doc.querySelector('parsererror')) throw new Error('Could not parse .tsx XML.');
      const tilesetEl = doc.documentElement;
      let tileEl = Array.from(tilesetEl.querySelectorAll(':scope > tile'))
        .find((el) => parseInt(el.getAttribute('id') ?? '-1', 10) === baseTileId);
      if (!tileEl) {
        tileEl = doc.createElement('tile');
        tileEl.setAttribute('id', String(baseTileId));
        tilesetEl.appendChild(tileEl);
      }
      const oldAnim = tileEl.querySelector(':scope > animation');
      if (oldAnim) oldAnim.remove();
      if (frames.length > 0) {
        const animEl = doc.createElement('animation');
        for (const f of frames) {
          const frameEl = doc.createElement('frame');
          frameEl.setAttribute('tileid', String(f.tileid));
          frameEl.setAttribute('duration', String(Math.max(1, f.duration)));
          animEl.appendChild(frameEl);
        }
        tileEl.appendChild(animEl);
      } else if (tileEl.children.length === 0 && tileEl.attributes.length === 1) {
        tileEl.remove();
      }
      const serialized = new XMLSerializer().serializeToString(doc);
      const bytes = new TextEncoder().encode(serialized);
      window.api.writeTilesetBytes(
        { projectPath, tsxFilename, bytes: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) },
        () => { setBusy(false); onSaved(tsxFilename); },
        (e) => { setBusy(false); setError(e.errorMessage); },
      );
    } catch (e) {
      setBusy(false);
      setError((e as Error).message);
    }
  };

  const totalMs = frames.reduce((s, f) => s + Math.max(1, f.duration), 0);
  const previewSize = Math.max(64, Math.min(96, tileset.tilewidth * 3));

  return (
    <Backdrop onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <span>Edit tile animation</span>
          <SubHeader>{tileset.name ?? '(unnamed tileset)'} · tile #{baseTileId}</SubHeader>
        </Header>

        <Toolbar>
          <ToolbarLabel htmlFor="anim-dur">Frame Duration:</ToolbarLabel>
          <DurationInput
            id="anim-dur"
            type="number"
            min={1}
            value={durationInput}
            onChange={(e) => setDurationInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyDuration(); } }}
            title="Duration in ms. Click Apply to assign to the selected frame, or click a tile in the tileset to append a new frame with this duration."
          />
          <span>ms</span>
          <ApplyBtn
            onClick={applyDuration}
            disabled={selectedIdx < 0 || selectedIdx >= frames.length}
            title="Set the selected frame's duration to the value above"
          >Apply</ApplyBtn>
        </Toolbar>

        <Body>
          <LeftCol>
            <FrameList
              tabIndex={0}
              onKeyDown={onListKeyDown}
            >
              {frames.length === 0 ? (
                <Empty>No frames. Click a tile on the right to add one.</Empty>
              ) : frames.map((f, i) => (
                <FrameRow
                  key={`${i}-${f.tileid}`}
                  $selected={i === selectedIdx}
                  onClick={() => selectFrame(i)}
                >
                  <FrameThumb
                    ref={(el) => drawTileTo(el, f.tileid)}
                    width={tileset.tilewidth}
                    height={tileset.tileheight}
                    style={{ width: 32, height: 32 }}
                  />
                  <FrameMs>{f.duration}</FrameMs>
                  <RowBtns onClick={(e) => e.stopPropagation()}>
                    <TinyBtn onClick={() => moveFrame(i, -1)} disabled={i === 0} title="Move up (Alt+↑)">↑</TinyBtn>
                    <TinyBtn onClick={() => moveFrame(i, 1)} disabled={i === frames.length - 1} title="Move down (Alt+↓)">↓</TinyBtn>
                    <TinyBtn onClick={() => removeFrame(i)} title="Remove (Delete)">×</TinyBtn>
                  </RowBtns>
                </FrameRow>
              ))}
            </FrameList>
            <PreviewPane>
              <PreviewCanvas
                ref={previewCanvasRef}
                width={previewSize}
                height={previewSize}
              />
              <PreviewInfo>
                <span>{frames.length} frame{frames.length === 1 ? '' : 's'}</span>
                <span>{totalMs} ms cycle</span>
              </PreviewInfo>
            </PreviewPane>
          </LeftCol>

          <RightCol>
            <TilesetHint>Click any tile to add it as the next frame. Animated tiles show a film-strip badge. Base tile is outlined.</TilesetHint>
            <TilesetScroll>
              {tileset.bitmap ? (
                <TilesetCanvas ref={tilesetCanvasRef} onClick={onTilesetClick} />
              ) : (
                <Empty>This tileset has no image bytes loaded.</Empty>
              )}
            </TilesetScroll>
          </RightCol>
        </Body>

        <Footer>
          <div>{error && <ErrorMsg>{error}</ErrorMsg>}</div>
          <FooterRight>
            <DarkButton onClick={onCancel} disabled={busy}>Cancel</DarkButton>
            {/* Only meaningful when an animation actually exists — if
                there's nothing to remove, hide the button rather than
                show a no-op control. animatedTiles is the picker's set
                of tile ids with <animation> elements; we check this
                tile is in it. */}
            {animatedTiles.has(baseTileId) && (
              <DarkButton
                onClick={removeAnimation}
                disabled={busy || !tsxFilename}
                title="Strip the <animation> element from this tile"
              >
                {busy ? '…' : 'Remove animation'}
              </DarkButton>
            )}
            <PrimaryButton onClick={onSave} disabled={busy || !tsxFilename}>
              {busy ? 'Saving…' : 'Save animation'}
            </PrimaryButton>
          </FooterRight>
        </Footer>
      </Modal>
    </Backdrop>
  );
};
