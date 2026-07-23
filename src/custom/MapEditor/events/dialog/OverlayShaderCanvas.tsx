import React from 'react';
import styled from 'styled-components';
import {
  buildProgram,
  makeTexture,
  overlayShaderName,
  presetConfig,
  toWebGLFragmentShader,
  type OverlayParams,
  type UploadedTexture,
} from './overlayShader';

/**
 * Fork-owned. Renders the framed map through PSDK's ACTUAL overlay fragment
 * shader in WebGL, so the Set Map Overlay preview matches the game rather than
 * approximating it. The shader source is read straight out of the project
 * (`graphics/shaders/overlay_<preset>.frag`) and ported with the same rewrites
 * LiteRGSS applies for OpenGL ES.
 *
 * Every uniform the preset can change from an event is driven by `params`, so
 * tuning blend mode / sample colour / distance factor / scroll direction in the
 * form shows the real result rather than the preset's defaults.
 *
 * `onStatus` reports whether the real shader is live, so the caller can say so
 * (and fall back to the canvas approximation if a shader fails to compile).
 */

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
  /* Pixel art: never let the browser smooth the backing store on a HiDPI
     display, or the character sprite and tiles come out blurred. */
  image-rendering: pixelated;
`;

export type ShaderStatus = { ok: boolean; error?: string };

type Props = {
  /** Already-framed map image (the in-game view, character included). */
  base: HTMLCanvasElement | null;
  /** Primary texture (extra_texture / noise, per preset). */
  overlayImage: HTMLImageElement | null;
  /** Secondary texture — only `water` uses one (color_gradient). */
  overlayImage2: HTMLImageElement | null;
  preset: string;
  projectPath: string;
  /** Everything the event can tune, already merged over the preset defaults. */
  params: OverlayParams;
  /** PSDK's game resolution — `resolution` feeds map_affix UV maths. */
  gameResolution: { x: number; y: number };
  /** `Configs.display.tilemap_settings.character_tile_zoom`. */
  characterTileZoom: number;
  /** UVResolver's tilesize: 16 for Yuki::Tilemap16px, 32 otherwise. */
  tileSize: number;
  /** Device pixels — the caller has already applied devicePixelRatio. */
  width: number;
  height: number;
  onStatus?: (s: ShaderStatus) => void;
};

export const OverlayShaderCanvas: React.FC<Props> = ({
  base,
  overlayImage,
  overlayImage2,
  preset,
  projectPath,
  params,
  gameResolution,
  characterTileZoom,
  tileSize,
  width,
  height,
  onStatus,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [source, setSource] = React.useState<string | null>(null);
  // Read through a ref so dragging a slider retunes the live frame instead of
  // tearing down and rebuilding the GL program.
  const paramsRef = React.useRef({ params, gameResolution, characterTileZoom, tileSize });
  paramsRef.current = { params, gameResolution, characterTileZoom, tileSize };
  const statusRef = React.useRef(onStatus);
  statusRef.current = onStatus;

  // Pull the shader source out of the project whenever the preset changes.
  React.useEffect(() => {
    setSource(null);
    let cancelled = false;
    window.api.readOverlayShader(
      { projectPath, shaderName: overlayShaderName(preset) },
      ({ source: src }) => { if (!cancelled) setSource(src); },
      () => { if (!cancelled) { setSource(null); statusRef.current?.({ ok: false, error: 'shader not found' }); } },
    );
    return () => { cancelled = true; };
  }, [preset, projectPath]);

  React.useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || !base || !source) return;
    cv.width = width;
    cv.height = height;
    const gl = cv.getContext('webgl', { premultipliedAlpha: false, alpha: true });
    if (!gl) { statusRef.current?.({ ok: false, error: 'no WebGL context' }); return; }

    let program: WebGLProgram;
    try {
      program = buildProgram(gl, toWebGLFragmentShader(source));
    } catch (e) {
      statusRef.current?.({ ok: false, error: e instanceof Error ? e.message : String(e) });
      return;
    }
    statusRef.current?.({ ok: true });

    // Full-screen quad in 0..1 space; the vertex shader maps it to clip space.
    const quad = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'a_position');
    const aUv = gl.getAttribLocation(program, 'a_texcoord');

    // The base is the render target the game would be drawing to: full 0..1, so
    // no NPOT padding. The overlay textures tile, hence repeat + padding.
    const baseTex = makeTexture(gl, base, false);
    const ovTex: UploadedTexture | null = overlayImage ? makeTexture(gl, overlayImage, true) : null;
    const ov2Tex: UploadedTexture | null = overlayImage2 ? makeTexture(gl, overlayImage2, true) : null;

    const u = (name: string) => gl.getUniformLocation(program, name);
    const cfg = presetConfig(preset);
    const start = performance.now();
    let raf = 0;

    const draw = () => {
      const { params: p, gameResolution: res, characterTileZoom: charZoom, tileSize: tile } = paramsRef.current;
      gl.viewport(0, 0, width, height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
      if (aUv >= 0) {
        gl.enableVertexAttribArray(aUv);
        gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
      }

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, baseTex?.tex ?? null);
      // The base canvas is redrawn in place (map scroll, character move), so
      // re-upload it each frame rather than caching a stale texture.
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, base);
      gl.uniform1i(u('texture'), 0);
      if (ovTex && cfg.texture1) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, ovTex.tex);
        gl.uniform1i(u(cfg.texture1.uniform), 1);
      }
      if (ov2Tex && cfg.texture2) {
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, ov2Tex.tex);
        gl.uniform1i(u(cfg.texture2.uniform), 2);
      }

      const t = (performance.now() - start) / 1000;
      gl.uniform1i(u('blend_mode'), p.blendMode);
      gl.uniform1f(u('opacity'), p.opacity);
      gl.uniform1f(u('time'), t);
      gl.uniform1f(u('dist_factor'), p.distFactor);
      // Color.new(r, g, b, a) is 0..255; the shader wants 0..1.
      gl.uniform4f(u('sample_color'), ...(p.sampleColor.map((v) => v / 255) as [number, number, number, number]));
      gl.uniform2f(u('direction1'), ...p.direction1);
      // `resolution` is the GAME resolution in PSDK (Viewport::CONFIGS[:main]),
      // not the size of this canvas — it only feeds resolve_overlay_uv.
      gl.uniform2f(u('resolution'), res.x, res.y);
      gl.uniform2f(u('image_resolution'), overlayImage?.naturalWidth || 1, overlayImage?.naturalHeight || 1);
      gl.uniform1f(u('zoom'), p.zoom > 0 ? p.zoom : charZoom);
      gl.uniform1i(u('map_affix'), p.mapAffix ? 1 : 0);
      gl.uniform2f(u('position'), ...resolvePosition(p, cfg, res, tile));
      // nausea's `in_snapshot` is for the battle-transition capture, not the map.
      gl.uniform1i(u('in_snapshot'), 0);
      // The base fills its texture, so its npot factor is 1; the overlay
      // textures report whatever fraction of their padded POT size they use.
      gl.uniform2f(u('factor_npot'), 1, 1);
      gl.uniform2f(u('noise_factor_npot'), ...(ovTex?.factor ?? [1, 1]));
      gl.uniform2f(u('extra_texture_factor_npot'), ...(ovTex?.factor ?? [1, 1]));
      gl.uniform2f(u('color_gradient_factor_npot'), ...(ov2Tex?.factor ?? [1, 1]));
      // color/tone are the SpritesetMap compatibility uniforms — neutral here.
      gl.uniform4f(u('color'), 0, 0, 0, 0);
      gl.uniform4f(u('tone'), 0, 0, 0, 0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      gl.deleteBuffer(buf);
      if (baseTex) gl.deleteTexture(baseTex.tex);
      if (ovTex) gl.deleteTexture(ovTex.tex);
      if (ov2Tex) gl.deleteTexture(ov2Tex.tex);
      gl.deleteProgram(program);
    };
  }, [base, source, overlayImage, overlayImage2, preset, width, height]);

  return <Canvas ref={canvasRef} />;
};

/**
 * The `position` uniform, in 0..1 screen UV — what PFM::MapOverlay::UVResolver
 * hands the shader.
 *
 * For the ripple preset the resolver measures from the player:
 *   sx = (src_x - player.x) * tilesize * window_scale + player.screen_x
 *   sy = (player.y - src_y - 0.5) * tilesize * window_scale + player.screen_y
 * and then divides by `resolution * window_scale`, so window_scale cancels and
 * one tile is worth `tilesize / resolution` of UV. The preview always draws the
 * player at the centre of the frame, which is where `0.5` comes from.
 *
 * The image presets resolve against the map origin instead, and their position
 * only feeds resolve_overlay_uv (i.e. it does nothing unless map_affix is on);
 * we treat their coordinates as the same tile offsets for consistency.
 */
const resolvePosition = (
  p: OverlayParams,
  cfg: { position: [number, number] | 'player' },
  res: { x: number; y: number },
  tileSize: number
): [number, number] => {
  const target = p.position ?? cfg.position;
  const perTileX = tileSize / Math.max(1, res.x);
  const perTileY = tileSize / Math.max(1, res.y);
  if (target === 'player') return [0.5, 0.5 - 0.5 * perTileY];
  const [tx, ty] = target;
  return [0.5 + tx * perTileX, 0.5 - (ty + 0.5) * perTileY];
};
