import React from 'react';
import styled from 'styled-components';
import { useResourceImageSrc } from '@components/ResourceImage';
import { useProjectConfigReadonly } from '@hooks/useProjectConfig';
import {
  centerFromClick,
  drawFramedMap,
  drawPreviewCharacter,
  displayTilePx,
  frameGeometry,
  loadPreviewCharacter,
  savePreviewCharacter,
  type FrameGeometry,
} from './inGameFrame';

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
 *   • In-game  — frames the game's screen (from Configs.display.game_resolution,
 *                scaled by a whole number like window_scale) on a character and shakes
 *                that, i.e. what the player would actually see. Click to move
 *                the character; its sprite is a per-project setting picked from
 *                graphics/characters. Both views apply the identical shake.
 */

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
  const { projectConfigValues: display } = useProjectConfigReadonly('display_config');
  const displayTile = displayTilePx(display.tilemapSettings.tilemapClass);
  const [mode, setMode] = React.useState<'map' | 'ingame'>('map');
  const geoRef = React.useRef<FrameGeometry>({ scale: 1, width: 1, height: 1, cssWidth: 1, cssHeight: 1, tilePx: 32 });
  const [center, setCenter] = React.useState<{ x: number; y: number } | null>(null);
  const [imgReady, setImgReady] = React.useState(false);
  const [charReady, setCharReady] = React.useState(false);
  const [runId, setRunId] = React.useState(0);
  const paramsRef = React.useRef({ power, speed, duration });
  paramsRef.current = { power, speed, duration };

  // Per-project preview-character setting.
  const [charName, setCharName] = React.useState<string>(() => loadPreviewCharacter(projectPath));
  const charUrl = useResourceImageSrc(`graphics/characters/${charName || '__none__'}`, undefined, undefined, projectPath || undefined);

  const pickCharacter = () => {
    if (!projectPath) return;
    window.api.chooseCharacterGraphic(
      { projectPath },
      ({ name }) => { setCharName(name); savePreviewCharacter(projectPath, name); },
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

  const drawIngame = React.useCallback(() => {
    const cv = canvasRef.current;
    const fr = frameRef.current;
    if (!cv || !fr) return;
    // Render the game's screen at a whole-number scale in device pixels and
    // let CSS size it back down, so pixel art never gets resampled.
    const geo = frameGeometry(display.gameResolution, displayTile, fr.clientWidth, fr.clientHeight, window.devicePixelRatio || 1);
    geoRef.current = geo;
    const { width: W, height: H } = geo;
    if (cv.width !== W) cv.width = W;
    if (cv.height !== H) cv.height = H;
    cv.style.width = `${geo.cssWidth}px`;
    cv.style.height = `${geo.cssHeight}px`;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d0f13';
    ctx.fillRect(0, 0, W, H);

    // Shared with the Map Overlay preview so both frame the map identically
    // (and both snap the character to a tile).
    const img = snapImgRef.current;
    if (img) drawFramedMap(ctx, img, geo, center, mapWidthTiles, mapHeightTiles);

    // No default graphic — if none is configured the frame just shows the map.
    const charImg = charImgRef.current;
    if (charImg) drawPreviewCharacter(ctx, charImg, geo, display.tilemapSettings.characterSpriteZoom);
  }, [center, mapWidthTiles, mapHeightTiles, display.gameResolution, displayTile]);

  React.useEffect(() => {
    if (mode === 'ingame') drawIngame();
  }, [mode, drawIngame, imgReady, charReady]);

  const onFrameClick = (e: React.MouseEvent) => {
    if (mode !== 'ingame') return;
    const img = snapImgRef.current;
    const cv = canvasRef.current;
    if (!img || !cv) return;
    const rect = cv.getBoundingClientRect();
    // The canvas is laid out in CSS px but drawn in device px.
    const geo = geoRef.current;
    const toDevice = rect.width > 0 ? geo.width / rect.width : 1;
    const dx = (e.clientX - rect.left) * toDevice;
    const dy = (e.clientY - rect.top) * toDevice;
    setCenter(centerFromClick(img, geo, dx, dy, center, mapWidthTiles, mapHeightTiles));
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
