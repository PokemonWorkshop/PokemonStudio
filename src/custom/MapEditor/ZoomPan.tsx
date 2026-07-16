/**
 * Fork-owned. A reusable zoom/pan viewport for previews: Ctrl+scroll zooms,
 * dragging pans once zoomed in, and −/＋/⟲ buttons step and reset. Content is
 * scaled from the center. Pass `resetKey` — whenever it changes (e.g. the
 * previewed tileset or map snapshot swaps) zoom/pan snap back to 1×/centered.
 *
 * Used by the tileset preview and the tone-command map preview so every map/
 * tileset preview in the editor zooms the same way.
 */

import React from 'react';
import styled from 'styled-components';

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 12;
const clampZoom = (z: number) => Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  width: 100%;
`;

const Viewport = styled.div<{ $panning: boolean }>`
  position: relative;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 6px;
  /* Static transparency checkerboard (does NOT scale with the content). */
  background-color: ${({ theme }) => theme.colors.dark20};
  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.06) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255, 255, 255, 0.06) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.06) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.06) 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0;
  cursor: ${({ $panning }) => ($panning ? 'grabbing' : 'grab')};
  color: ${({ theme }) => theme.colors.text500};
  ${({ theme }) => theme.fonts.normalSmall};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div<{ $z: number; $x: number; $y: number }>`
  transform: translate(${({ $x }) => $x}px, ${({ $y }) => $y}px) scale(${({ $z }) => $z});
  transform-origin: center center;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  max-height: 100%;
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
`;

const Btn = styled.button`
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

const Label = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text400};
  min-width: 48px;
  text-align: center;
`;

type Props = {
  height?: number;
  /** Zoom/pan resets to 1×/centered whenever this changes. */
  resetKey?: unknown;
  children: React.ReactNode;
};

export const ZoomPan: React.FC<Props> = ({ height = 300, resetKey, children }) => {
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const drag = React.useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [panning, setPanning] = React.useState(false);

  React.useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [resetKey]);

  const applyZoom = (next: number) => {
    const z = clampZoom(next);
    setZoom(z);
    if (z <= 1) setPan({ x: 0, y: 0 });
  };

  const onWheel = (e: React.WheelEvent) => {
    // Ctrl+scroll is the zoom gesture everywhere in the editor; a plain scroll
    // is left alone so a surrounding list can still scroll.
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
    <Wrap>
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
        <Content $z={zoom} $x={pan.x} $y={pan.y}>
          {children}
        </Content>
      </Viewport>
      <Bar>
        <Btn onClick={() => applyZoom(zoom / 1.5)} disabled={zoom <= ZOOM_MIN + 1e-9} title="Zoom out">−</Btn>
        <Label>{Math.round(zoom * 100)}%</Label>
        <Btn onClick={() => applyZoom(zoom * 1.5)} disabled={zoom >= ZOOM_MAX - 1e-9} title="Zoom in">＋</Btn>
        <Btn onClick={() => applyZoom(1)} disabled={zoom === 1 && pan.x === 0 && pan.y === 0} title="Reset">⟲</Btn>
      </Bar>
    </Wrap>
  );
};
