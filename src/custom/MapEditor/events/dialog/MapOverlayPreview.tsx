import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useResourceImageSrc } from '@components/ResourceImage';
import { useProjectConfigReadonly } from '@hooks/useProjectConfig';
import { OverlayShaderCanvas, type ShaderStatus } from './OverlayShaderCanvas';
import { OVERLAY_PRESET_CONFIG, presetConfig, type OverlayParams } from './overlayShader';
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
 * Fork-owned. In-game preview for the Set Map Overlay command: frames a PSDK
 * screen on the map (same framing as the shake preview, sharing the per-project
 * preview character) and runs the overlay on top.
 *
 * The overlay is rendered by PSDK's ACTUAL fragment shader in WebGL — see
 * OverlayShaderCanvas — so what you see is the shader the game runs, not a
 * lookalike. All seven registered presets take that path; the canvas
 * approximation below is only a labelled fallback for when the shader can't be
 * loaded (no project path, missing .frag, no WebGL).
 */

// Every registered preset now runs its real shader.
const SHADER_PRESETS = new Set(Object.keys(OVERLAY_PRESET_CONFIG));

/** Space the preview gets; the game screen is scaled to fit it whole. */
const FRAME_HEIGHT = 260;

/** Primary/secondary textures from graphics/fogs (RPG::Cache.fog). */
const textureNames = (preset: string, params: OverlayParams): [string, string] => {
  const cfg = presetConfig(preset);
  return [params.texture1Name || cfg.texture1?.defaultName || '', params.texture2Name || cfg.texture2?.defaultName || ''];
};

/** Holds the game screen centred; the screen itself keeps the game's aspect. */
const FrameBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: ${FRAME_HEIGHT}px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.dark12};
`;

const Frame = styled.div`
  position: relative;
  overflow: hidden;
  cursor: crosshair;
`;

const Layer = styled.div`
  position: absolute;
  inset: 0;
`;

/* Pixel art must never be smoothed on the way to the screen. */
const ApproxCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
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
  &:disabled { opacity: 0.5; cursor: default; }
`;

const Note = styled.span<{ $warn?: boolean }>`
  ${({ theme }) => theme.fonts.normalSmall};
  color: ${({ theme, $warn }) => ($warn ? theme.colors.dangerBase : theme.colors.text500)};
`;

type Props = {
  snapshotUrl: string | null;
  preset: string;
  /** Preset defaults with the form's edits merged over them. */
  params: OverlayParams;
  projectPath?: string;
  mapWidthTiles?: number;
  mapHeightTiles?: number;
};

const EMPTY_GEOMETRY: FrameGeometry = { scale: 1, width: 1, height: 1, cssWidth: 1, cssHeight: 1, tilePx: 32 };

/** Canvas stand-in used only when the real shader can't be loaded. */
const drawApprox = (ctx: CanvasRenderingContext2D, preset: string, W: number, H: number, t: number, alpha: number) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  if (preset === 'water') {
    ctx.fillStyle = 'rgba(60,130,200,0.45)';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 2;
    for (let y = 0; y < H; y += 10) {
      ctx.beginPath();
      for (let x = 0; x <= W; x += 8) ctx.lineTo(x, y + Math.sin((x + t * 0.05) / 18) * 3);
      ctx.stroke();
    }
  } else if (preset === 'ripple') {
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 2;
    for (let r = (t * 0.06) % 40; r < Math.max(W, H); r += 40) {
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (preset === 'godrays') {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, 'rgba(255,240,180,0.45)');
    g.addColorStop(1, 'rgba(255,240,180,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  } else if (preset === 'nausea') {
    ctx.fillStyle = 'rgba(150,90,180,0.35)';
    ctx.fillRect(0, 0, W, H);
  } else if (preset === 'scroll') {
    ctx.fillStyle = 'rgba(200,200,210,0.25)';
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
};

export const MapOverlayPreview: React.FC<Props> = ({ snapshotUrl, preset, params, projectPath, mapWidthTiles, mapHeightTiles }) => {
  const { t } = useTranslation();
  const { projectConfigValues: display } = useProjectConfigReadonly('display_config');
  const displayTile = displayTilePx(display.tilemapSettings.tilemapClass);
  const boxRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const approxRef = React.useRef<HTMLCanvasElement>(null);
  // The framed map + character, fed to the shader as its base texture.
  const baseRef = React.useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const snapRef = React.useRef<HTMLImageElement | null>(null);
  const charRef = React.useRef<HTMLImageElement | null>(null);
  const texRef = React.useRef<HTMLImageElement | null>(null);
  const tex2Ref = React.useRef<HTMLImageElement | null>(null);
  const [center, setCenter] = React.useState<{ x: number; y: number } | null>(null);
  // The game screen at a whole-number scale, in device pixels.
  const [geo, setGeo] = React.useState<FrameGeometry>(EMPTY_GEOMETRY);
  const [status, setStatus] = React.useState<ShaderStatus>({ ok: true });
  const [, force] = React.useReducer((n) => n + 1, 0);
  const paramsRef = React.useRef({ preset, params });
  paramsRef.current = { preset, params };

  const [charName, setCharName] = React.useState<string>(() => loadPreviewCharacter(projectPath));
  const charUrl = useResourceImageSrc(`graphics/characters/${charName || '__none__'}`, undefined, undefined, projectPath || undefined);
  const [texName, tex2Name] = textureNames(preset, params);
  const texUrl = useResourceImageSrc(`graphics/fogs/${texName || '__none__'}`);
  const tex2Url = useResourceImageSrc(`graphics/fogs/${tex2Name || '__none__'}`);
  const useShader = SHADER_PRESETS.has(preset) && !!projectPath && status.ok !== false;

  // A failure belongs to the preset that caused it — clear it when switching,
  // or one bad shader would knock every other preset onto the fallback.
  React.useEffect(() => setStatus({ ok: true }), [preset]);

  const pickCharacter = () => {
    if (!projectPath) return;
    window.api.chooseCharacterGraphic(
      { projectPath },
      ({ name }) => { setCharName(name); savePreviewCharacter(projectPath, name); },
      () => { /* cancelled */ },
    );
  };

  const useImage = (ref: React.MutableRefObject<HTMLImageElement | null>, url: string | null, enabled: boolean) => {
    React.useEffect(() => {
      ref.current = null;
      force();
      if (!enabled || !url) return;
      let cancelled = false;
      const img = new Image();
      img.onload = () => { if (!cancelled) { ref.current = img; force(); } };
      img.onerror = () => { if (!cancelled) { ref.current = null; force(); } };
      img.src = url;
      return () => { cancelled = true; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, enabled]);
  };

  useImage(snapRef, snapshotUrl, !!snapshotUrl);
  useImage(charRef, charUrl, !!charName);
  useImage(texRef, texUrl, !!texName);
  useImage(tex2Ref, tex2Url, !!tex2Name);

  // Draw the framed map + character into the base canvas every frame; the
  // shader (or the approximation) composites on top of it.
  React.useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    let raf = 0;
    const draw = (t: number) => {
      // Render at device resolution and only ever at a whole-number scale of
      // the game screen: that keeps the shader's UV aspect identical to the
      // game's, and lands every tile on an exact pixel grid.
      const next = frameGeometry(display.gameResolution, displayTile, box.clientWidth, FRAME_HEIGHT, window.devicePixelRatio || 1);
      if (next.width !== geo.width || next.height !== geo.height) setGeo(next);
      const { width: W, height: H } = next;

      const base = baseRef.current;
      if (base.width !== W) base.width = W;
      if (base.height !== H) base.height = H;
      const bctx = base.getContext('2d');
      if (!bctx) return;
      bctx.setTransform(1, 0, 0, 1, 0, 0);
      bctx.clearRect(0, 0, W, H);
      bctx.fillStyle = '#0d0f13';
      bctx.fillRect(0, 0, W, H);
      const snap = snapRef.current;
      if (snap) drawFramedMap(bctx, snap, next, center, mapWidthTiles, mapHeightTiles);
      const ch = charRef.current;
      if (ch) drawPreviewCharacter(bctx, ch, next, display.tilemapSettings.characterSpriteZoom);

      // Approximation path draws base + effect into the visible 2D canvas.
      const cv = approxRef.current;
      if (cv) {
        if (cv.width !== W) cv.width = W;
        if (cv.height !== H) cv.height = H;
        const ctx = cv.getContext('2d');
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.clearRect(0, 0, W, H);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(base, 0, 0);
          const { preset: ps, params: pr } = paramsRef.current;
          if (ps && ps !== 'none') drawApprox(ctx, ps, W, H, t, Math.max(0, Math.min(1, pr.opacity)));
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [center, mapWidthTiles, mapHeightTiles, geo.width, geo.height, display.gameResolution, displayTile]);

  const onFrameClick = (e: React.MouseEvent) => {
    const snap = snapRef.current;
    const fr = frameRef.current;
    if (!snap || !fr) return;
    const rect = fr.getBoundingClientRect();
    // The frame is laid out in CSS px but drawn in device px.
    const toDevice = rect.width > 0 ? geo.width / rect.width : 1;
    const dx = (e.clientX - rect.left) * toDevice;
    const dy = (e.clientY - rect.top) * toDevice;
    setCenter(centerFromClick(snap, geo, dx, dy, center, mapWidthTiles, mapHeightTiles));
  };

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <FrameBox ref={boxRef}>
        <Frame ref={frameRef} onClick={onFrameClick} style={{ width: geo.cssWidth, height: geo.cssHeight }}>
          {/* The 2D canvas is the approximation path; when the real shader is
              live it draws on top of it, so only one is ever visible. */}
          <ApproxCanvas ref={approxRef} />
          {useShader && preset !== 'none' && (
            <Layer>
              <OverlayShaderCanvas
                base={baseRef.current}
                overlayImage={texRef.current}
                overlayImage2={tex2Ref.current}
                preset={preset}
                projectPath={projectPath || ''}
                params={params}
                gameResolution={display.gameResolution}
                characterTileZoom={display.tilemapSettings.characterTileZoom}
                tileSize={displayTile}
                width={geo.width}
                height={geo.height}
                onStatus={setStatus}
              />
            </Layer>
          )}
        </Frame>
      </FrameBox>
      <Bar>
        <Btn type="button" onClick={pickCharacter} disabled={!projectPath} title={charName || undefined}>
          {charName ? '🚶 Character…' : '🚶 Choose character…'}
        </Btn>
        {preset !== 'none' && (
          <Note $warn={status.ok === false}>
            {status.ok === false
              ? t('me_events_overlay_shader_failed', { error: status.error ?? '' })
              : useShader
                ? t('me_events_overlay_shader_live')
                : t('me_events_overlay_shader_approx')}
          </Note>
        )}
      </Bar>
</div>
  );
};
