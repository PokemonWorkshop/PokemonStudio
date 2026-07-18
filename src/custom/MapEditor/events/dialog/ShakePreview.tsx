import React from 'react';
import styled from 'styled-components';
import { useResourceImageSrc } from '@components/ResourceImage';

/**
 * Fork-owned. Previews a Screen Shake (225) on a snapshot of the ACTUAL current
 * map, animating the exact PSDK/RMXP shake algorithm so the user feels the
 * power/speed/duration before running it.
 *
 * From Game_Screen#update_shake (`200 Game_Screen.rb`):
 *   delta = (power * speed * direction) / 10.0
 *   if duration <= 1 && shake * (shake + delta) < 0: shake = 0
 *   else: shake += delta
 *   direction = -1 if shake >  power * 2
 *   direction =  1 if shake < -power * 2
 *   duration -= 1 while >= 1
 * `shake` is a horizontal pixel offset. command_225 passes `duration * 2` to
 * start_shake, so the effective run is double the stored frame count.
 *
 * Two views, toggled by the user:
 *   • Full map — shakes the whole map snapshot.
 *   • In-game  — frames a PSDK screen (7×10 tiles) on a character and shakes
 *                that, i.e. what the player would actually see. Click to move
 *                the character; its sprite is a per-project setting picked from
 *                graphics/characters. Both views apply the identical shake.
 */

// PSDK's default on-screen tile window.
const SCREEN_TILES_W = 7;
const SCREEN_TILES_H = 10;
// Per-project setting: the preview character graphic (RMXP-style name).
const CHAR_KEY = 'pokemonstudio.fork.mapEditor.previewCharacter';

const Frame = styled.div`
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.dark12};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Shaker = styled.div`
  will-change: transform;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  & img,
  & canvas {
    max-width: 100%;
    max-height: 100%;
    image-rendering: pixelated;
  }
`;

const Placeholder = styled.div`
  width: 70%;
  height: 60%;
  border-radius: 6px;
  background: repeating-linear-gradient(
    45deg,
    ${({ theme }) => theme.colors.dark18},
    ${({ theme }) => theme.colors.dark18} 10px,
    ${({ theme }) => theme.colors.dark20} 10px,
    ${({ theme }) => theme.colors.dark20} 20px
  );
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  flex-wrap: wrap;
`;

const Btn = styled.button`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text100};
  background: ${({ theme }) => theme.colors.dark20};
  border: 1px solid ${({ theme }) => theme.colors.dark14};
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  &:hover { border-color: ${({ theme }) => theme.colors.primaryBase}; }
`;

const Toggle = styled(Btn)<{ $active: boolean }>`
  background: ${({ theme, $active }) => ($active ? theme.colors.primaryBase : theme.colors.dark20)};
  border-color: ${({ theme, $active }) => ($active ? theme.colors.primaryBase : theme.colors.dark14)};
`;

const Note = styled.span`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme }) => theme.colors.text500};
`;

type Props = {
  snapshotUrl: string | null;
  power: number;
  speed: number;
  /** Raw stored frame count (PSDK doubles it at runtime). */
  duration: number;
  projectPath?: string;
  /** Map size in tiles — sets how many snapshot px make up one tile. */
  mapWidthTiles?: number;
  mapHeightTiles?: number;
};

export const ShakePreview: React.FC<Props> = ({ snapshotUrl, power, speed, duration, projectPath, mapWidthTiles, mapHeightTiles }) => {
  const shakerRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const snapImgRef = React.useRef<HTMLImageElement | null>(null);
  const charImgRef = React.useRef<HTMLImageElement | null>(null);
  const [mode, setMode] = React.useState<'map' | 'ingame'>('map');
  const [center, setCenter] = React.useState<{ x: number; y: number } | null>(null);
  const [imgReady, setImgReady] = React.useState(false);
  const [charReady, setCharReady] = React.useState(false);
  const [runId, setRunId] = React.useState(0);
  const paramsRef = React.useRef({ power, speed, duration });
  paramsRef.current = { power, speed, duration };

  // Per-project preview-character setting.
  const [charName, setCharName] = React.useState<string>(() => {
    try { return (projectPath && localStorage.getItem(`${CHAR_KEY}:${projectPath}`)) || ''; } catch { return ''; }
  });
  const charUrl = useResourceImageSrc(`graphics/characters/${charName || '__none__'}`, undefined, undefined, projectPath || undefined);

  const pickCharacter = () => {
    if (!projectPath) return;
    window.api.chooseCharacterGraphic(
      { projectPath },
      ({ name }) => {
        setCharName(name);
        try { localStorage.setItem(`${CHAR_KEY}:${projectPath}`, name); } catch { /* best-effort */ }
      },
      () => { /* cancelled */ },
    );
  };

  // Load the map snapshot (in-game view crops from it).
  React.useEffect(() => {
    snapImgRef.current = null;
    setImgReady(false);
    if (!snapshotUrl) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) { snapImgRef.current = img; setImgReady(true); } };
    img.src = snapshotUrl;
    return () => { cancelled = true; };
  }, [snapshotUrl]);

  // Load the configured character sheet.
  React.useEffect(() => {
    charImgRef.current = null;
    setCharReady(false);
    if (!charName) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => { if (!cancelled) { charImgRef.current = img; setCharReady(true); } };
    img.onerror = () => { if (!cancelled) { charImgRef.current = null; setCharReady(false); } };
    img.src = charUrl;
    return () => { cancelled = true; };
  }, [charUrl, charName]);

  // Screen-fit scale: how many CSS px one snapshot px becomes so that a
  // SCREEN_TILES_W × SCREEN_TILES_H window fills the frame.
  const frameScale = React.useCallback((img: HTMLImageElement, W: number, H: number) => {
    const tpx = mapWidthTiles ? img.naturalWidth / mapWidthTiles : 32;
    const tpy = mapHeightTiles ? img.naturalHeight / mapHeightTiles : 32;
    return { scale: Math.min(W / (SCREEN_TILES_W * tpx), H / (SCREEN_TILES_H * tpy)), tpx, tpy };
  }, [mapWidthTiles, mapHeightTiles]);

  const drawIngame = React.useCallback(() => {
    const cv = canvasRef.current;
    const fr = frameRef.current;
    if (!cv || !fr) return;
    const W = Math.max(1, fr.clientWidth);
    const H = Math.max(1, fr.clientHeight);
    if (cv.width !== W) cv.width = W;
    if (cv.height !== H) cv.height = H;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d0f13';
    ctx.fillRect(0, 0, W, H);

    const img = snapImgRef.current;
    let tileScreen = 32;
    if (img) {
      const { scale, tpx } = frameScale(img, W, H);
      tileScreen = tpx * scale;
      const cx = center?.x ?? img.naturalWidth / 2;
      const cy = center?.y ?? img.naturalHeight / 2;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, W / 2 - cx * scale, H / 2 - cy * scale, img.naturalWidth * scale, img.naturalHeight * scale);
    }

    // Character at the frame centre (the camera follows it). No default graphic
    // — if none is configured the frame just shows the map.
    const charImg = charImgRef.current;
    if (charImg && charImg.naturalWidth > 0) {
      // Assume an RMXP-style 4-frame × 4-direction sheet; use the top-left
      // frame (down, first pattern). PSDK renders character graphics scaled up
      // 2× (like the event markers on the map), so draw it two tiles wide.
      const fw = charImg.naturalWidth / 4;
      const fh = charImg.naturalHeight / 4;
      const drawW = tileScreen * 2;
      const drawH = drawW * (fh / fw);
      const feetY = H / 2 + tileScreen * 0.5; // stand on the centered tile
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(charImg, 0, 0, fw, fh, W / 2 - drawW / 2, feetY - drawH, drawW, drawH);
    }
  }, [center, frameScale]);

  React.useEffect(() => {
    if (mode === 'ingame') drawIngame();
  }, [mode, drawIngame, imgReady, charReady]);

  const onFrameClick = (e: React.MouseEvent) => {
    if (mode !== 'ingame') return;
    const img = snapImgRef.current;
    const fr = frameRef.current;
    if (!img || !fr) return;
    const rect = fr.getBoundingClientRect();
    const { scale } = frameScale(img, rect.width, rect.height);
    const cx = center?.x ?? img.naturalWidth / 2;
    const cy = center?.y ?? img.naturalHeight / 2;
    const nx = cx + (e.clientX - rect.left - rect.width / 2) / scale;
    const ny = cy + (e.clientY - rect.top - rect.height / 2) / scale;
    setCenter({ x: Math.max(0, Math.min(img.naturalWidth, nx)), y: Math.max(0, Math.min(img.naturalHeight, ny)) });
  };

  // The shake run — one pass per Play/Replay, never on mount or slider change.
  React.useEffect(() => {
    if (runId === 0) return;
    const el = shakerRef.current;
    if (!el) return;
    const { power: pw, speed: sp, duration: dur } = paramsRef.current;
    let durationLeft = Math.max(0, dur) * 2;
    let raf = 0;
    let last = 0;
    let acc = 0;
    let shake = 0;
    let direction = 1;

    const step = () => {
      if (durationLeft >= 1 || shake !== 0) {
        const delta = (pw * sp * direction) / 10;
        if (durationLeft <= 1 && shake * (shake + delta) < 0) shake = 0;
        else shake += delta;
        if (shake > pw * 2) direction = -1;
        if (shake < -pw * 2) direction = 1;
        if (durationLeft >= 1) durationLeft -= 1;
      }
    };

    const loop = (t: number) => {
      if (!last) last = t;
      acc += t - last;
      last = t;
      while (acc >= 1000 / 60) {
        step();
        acc -= 1000 / 60;
      }
      el.style.transform = `translateX(${shake.toFixed(2)}px)`;
      if (durationLeft < 1 && shake === 0) {
        el.style.transform = 'translateX(0px)';
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      el.style.transform = 'translateX(0px)';
    };
  }, [runId]);

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <Frame ref={frameRef} onClick={onFrameClick} style={{ cursor: mode === 'ingame' ? 'crosshair' : 'default' }}>
        <Shaker ref={shakerRef}>
          {mode === 'map'
            ? (snapshotUrl ? <img src={snapshotUrl} alt="" /> : <Placeholder />)
            : <canvas ref={canvasRef} />}
        </Shaker>
      </Frame>
      <Bar>
        <Toggle type="button" $active={mode === 'map'} onClick={() => setMode('map')}>Full map</Toggle>
        <Toggle type="button" $active={mode === 'ingame'} onClick={() => setMode('ingame')}>In-game</Toggle>
        <Btn type="button" onClick={() => setRunId((n) => n + 1)}>{runId === 0 ? '▶ Play' : '↻ Replay'}</Btn>
        {mode === 'ingame' && (
          <Btn type="button" onClick={pickCharacter} disabled={!projectPath} title={charName || undefined}>
            {charName ? '🚶 Character…' : '🚶 Choose character…'}
          </Btn>
        )}
        <Note>
          {mode === 'ingame' ? 'Click to place the character · ' : ''}
          power {power} · speed {speed} · {duration} frame(s)
        </Note>
      </Bar>
    </div>
  );
};
