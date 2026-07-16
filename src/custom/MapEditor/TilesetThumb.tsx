/**
 * Fork-owned. Tileset image previews resolved from a `.tsx`.
 *
 * The `.tsx` names its image with a relative `source` (e.g.
 * `../Assets/Foo.png`); we read the `.tsx` bytes to find that name, then pull
 * the image bytes through IPC and turn them into a `blob:` URL. `file://` URLs
 * can't be used from the renderer — Electron's webSecurity blocks the
 * cross-scheme load — which is why both hops go through the backend tasks.
 *
 * Exports:
 *   - `useTilesetImageUrl` — the resolution hook (shared blob-URL lifecycle).
 *   - `TilesetThumb`        — a fixed-size static thumbnail.
 *   - `TilesetPreviewZoom`  — a large, zoom/pan-able preview (buttons + Ctrl+wheel).
 */

import React from 'react';
import styled from 'styled-components';

const mimeFor = (name: string): string => {
  const ext = name.toLowerCase().split('.').pop();
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'gif') return 'image/gif';
  if (ext === 'bmp') return 'image/bmp';
  return 'image/png';
};

/**
 * Read `<image source>` from a `.tsx`'s bytes → the bare image filename. Only
 * the basename is kept: `readTilesetImageBytes` is path-locked to the Assets
 * dir, so the `../Assets/` prefix is both unnecessary and unwanted.
 */
const imageFilenameFromTsx = (bytes: ArrayBuffer): string | null => {
  const xml = new TextDecoder().decode(new Uint8Array(bytes));
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) return null;
  const source = doc.documentElement?.querySelector(':scope > image')?.getAttribute('source') ?? '';
  const base = source.split(/[\\/]/).pop() ?? '';
  return base || null;
};

type UrlStatus = 'idle' | 'loading' | 'error';

/** Resolve a `.tsx` → a `blob:` URL for its image, with the blob-URL lifecycle managed. */
export const useTilesetImageUrl = (projectPath: string, tsxFilename: string | null): { url: string | null; status: UrlStatus } => {
  const [url, setUrl] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<UrlStatus>('idle');

  React.useEffect(() => {
    if (!tsxFilename) {
      setUrl(null);
      setStatus('idle');
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    setStatus('loading');
    setUrl(null);

    window.api.readTilesetBytes(
      { projectPath, tsxFilename },
      ({ bytes }) => {
        if (cancelled) return;
        const imageFilename = imageFilenameFromTsx(bytes);
        if (!imageFilename) {
          setStatus('error');
          return;
        }
        window.api.readTilesetImageBytes(
          { projectPath, imageFilename },
          ({ bytes: imgBytes }) => {
            if (cancelled) return;
            objectUrl = URL.createObjectURL(new Blob([imgBytes], { type: mimeFor(imageFilename) }));
            setUrl(objectUrl);
            setStatus('idle');
          },
          () => !cancelled && setStatus('error'),
        );
      },
      () => !cancelled && setStatus('error'),
    );

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [projectPath, tsxFilename]);

  return { url, status };
};

/** A transparency checkerboard so a transparent tileset reads as transparent, not black. */
const checkerboard = `
  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.06) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255, 255, 255, 0.06) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.06) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.06) 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0;
`;

const Frame = styled.div<{ $w: number; $h: number }>`
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.dark20};
  ${checkerboard}
  color: ${({ theme }) => theme.colors.text500};
  ${({ theme }) => theme.fonts.normalSmall};
`;

const Img = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
`;

type ThumbProps = {
  projectPath: string;
  /** Filename WITH `.tsx`, or null to render an empty frame. */
  tsxFilename: string | null;
  width?: number;
  height?: number;
};

/** Small, self-contained static tileset image preview. */
export const TilesetThumb: React.FC<ThumbProps> = ({ projectPath, tsxFilename, width = 220, height = 220 }) => {
  const { url, status } = useTilesetImageUrl(projectPath, tsxFilename);
  return (
    <Frame $w={width} $h={height}>
      {url ? <Img src={url} alt={tsxFilename ?? ''} /> : status === 'loading' ? '…' : status === 'error' ? '⚠' : ''}
    </Frame>
  );
};

// --- zoomable preview -----------------------------------------------------------

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 12;
const clampZoom = (z: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));

const ZoomWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  width: 100%;
`;

const Viewport = styled.div<{ $panning: boolean }>`
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.dark20};
  ${checkerboard}
  cursor: ${({ $panning }) => ($panning ? 'grabbing' : 'grab')};
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ZoomImg = styled.img<{ $z: number; $x: number; $y: number }>`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) translate(${({ $x }) => $x}px, ${({ $y }) => $y}px) scale(${({ $z }) => $z});
  transform-origin: center center;
  image-rendering: pixelated;
  user-select: none;
  -webkit-user-drag: none;
  max-width: none;
  max-height: none;
`;

const ZoomBar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
`;

const ZoomBtn = styled.button`
  all: unset;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.dark20};
  color: ${({ theme }) => theme.colors.text100};
  &:hover { background-color: ${({ theme }) => theme.colors.dark18}; }
  &:disabled { opacity: 0.4; cursor: default; }
`;

const ZoomLabel = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  min-width: 48px;
  text-align: center;
`;

type ZoomProps = {
  projectPath: string;
  tsxFilename: string | null;
  /** Height of the preview viewport in px. */
  height?: number;
};

/**
 * A large tileset preview the user can inspect closely: Ctrl+scroll zooms
 * toward the cursor, the +/−/⟲ buttons step and reset, and dragging pans once
 * zoomed in. Resets whenever the previewed tileset changes.
 */
export const TilesetPreviewZoom: React.FC<ZoomProps> = ({ projectPath, tsxFilename, height = 300 }) => {
  const { url, status } = useTilesetImageUrl(projectPath, tsxFilename);
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const drag = React.useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [panning, setPanning] = React.useState(false);

  React.useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [tsxFilename]);

  const applyZoom = (next: number) => {
    const z = clampZoom(next);
    setZoom(z);
    if (z <= 1) setPan({ x: 0, y: 0 });
  };

  const onWheel = (e: React.WheelEvent) => {
    // Ctrl+scroll is the zoom gesture everywhere in the editor; a plain scroll
    // is left alone so the surrounding list can still scroll.
    if (!e.ctrlKey) return;
    e.preventDefault();
    applyZoom(zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (zoom <= 1) return;
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setPanning(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPan({ x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) });
  };
  const onPointerUp = () => {
    drag.current = null;
    setPanning(false);
  };

  return (
    <ZoomWrap>
      <Viewport
        style={{ height }}
        $panning={panning}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        title="Ctrl+scroll to zoom · drag to pan"
      >
        {url ? (
          <ZoomImg src={url} alt={tsxFilename ?? ''} $z={zoom} $x={pan.x} $y={pan.y} draggable={false} />
        ) : status === 'loading' ? (
          '…'
        ) : status === 'error' ? (
          '⚠'
        ) : (
          ''
        )}
      </Viewport>
      <ZoomBar>
        <ZoomBtn onClick={() => applyZoom(zoom / 1.5)} disabled={!url || zoom <= ZOOM_MIN + 1e-9} title="Zoom out">−</ZoomBtn>
        <ZoomLabel>{Math.round(zoom * 100)}%</ZoomLabel>
        <ZoomBtn onClick={() => applyZoom(zoom * 1.5)} disabled={!url || zoom >= ZOOM_MAX - 1e-9} title="Zoom in">＋</ZoomBtn>
        <ZoomBtn onClick={() => applyZoom(1)} disabled={!url || (zoom === 1 && pan.x === 0 && pan.y === 0)} title="Reset">⟲</ZoomBtn>
      </ZoomBar>
    </ZoomWrap>
  );
};
