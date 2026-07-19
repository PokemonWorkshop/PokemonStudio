import React from 'react';
import styled from 'styled-components';
import { useResourceImageSrc } from '@components/ResourceImage';

/**
 * Fork-owned. Preview for Change Windowskin (131): renders a sample message
 * window from the chosen skin using the RMXP windowskin layout — a 192×128
 * sheet where the top-left 128×128 is the stretched background and the 64×64
 * region at (128,0) is the 9-slice border (16px corners). PSDK's Change
 * Windowskin drives $game_system.windowskin_name, which uses this format.
 */

const Frame = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.dark20};
  padding: 8px;
  display: flex;
  justify-content: center;
`;

const Canvas = styled.canvas`
  image-rendering: pixelated;
  max-width: 100%;
`;

type Props = { name: string };

const W = 260;
const H = 80;

export const WindowskinPreview: React.FC<Props> = ({ name }) => {
  const hasSkin = !!name && name !== '__undef__';
  const url = useResourceImageSrc(`graphics/windowskins/${hasSkin ? name : '__none__'}`);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    if (!hasSkin) return;

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      ctx.imageSmoothingEnabled = false;
      // Background: the top-left square, stretched to fill.
      const bg = Math.min(img.naturalWidth, img.naturalHeight, 128);
      ctx.drawImage(img, 0, 0, bg, bg, 2, 2, W - 4, H - 4);
      // Border 9-slice from the 64×64 region at (128, 0), 16px corners.
      const bx = 128;
      const by = 0;
      const c = 16; // corner size
      const s = (sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number) =>
        ctx.drawImage(img, bx + sx, by + sy, sw, sh, dx, dy, dw, dh);
      // corners
      s(0, 0, c, c, 0, 0, c, c);
      s(64 - c, 0, c, c, W - c, 0, c, c);
      s(0, 64 - c, c, c, 0, H - c, c, c);
      s(64 - c, 64 - c, c, c, W - c, H - c, c, c);
      // edges (stretched)
      s(c, 0, 64 - 2 * c, c, c, 0, W - 2 * c, c);
      s(c, 64 - c, 64 - 2 * c, c, c, H - c, W - 2 * c, c);
      s(0, c, c, 64 - 2 * c, 0, c, c, H - 2 * c);
      s(64 - c, c, c, 64 - 2 * c, W - c, c, c, H - 2 * c);
      // sample text
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.font = '13px sans-serif';
      ctx.fillText('The quick brown Poké…', 18, 34);
      ctx.fillText('▼', W - 26, H - 18);
    };
    img.onerror = () => { if (!cancelled) ctx.clearRect(0, 0, W, H); };
    img.src = url;
    return () => { cancelled = true; };
  }, [url, hasSkin]);

  if (!hasSkin) return null;
  return (
    <Frame>
      <Canvas ref={canvasRef} width={W} height={H} />
    </Frame>
  );
};
