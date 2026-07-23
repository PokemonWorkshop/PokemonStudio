/**
 * Fork-owned. Runs PSDK's REAL map-overlay fragment shaders in Studio's WebGL
 * context, so the Set Map Overlay preview is the same code the game runs rather
 * than an approximation.
 *
 * PSDK's overlay presets are plain GLSL in `graphics/shaders/overlay_*.frag`,
 * and LiteRGSS already compiles them for OpenGL ES (WebGL's dialect) — see
 * `0 Dependencies/1 LiteRGSS2/011 Shader.rb`. We replicate exactly the rewrites
 * it performs for the GL_ES path:
 *
 *   gl_TexCoord[0] -> v_texture_coordinates
 *   gl_TexCoord[1] -> v_inv_texture_coordinates
 *   gl_Color       -> sf_color
 *   + `precision mediump float;` and the matching varying declarations
 *
 * Everything else (uniform names, blend maths, distance falloff) is untouched,
 * which is what makes the preview faithful.
 */

/** Shader file name for a preset, matching PSDK's `shader_name`. */
export const overlayShaderName = (preset: string): string => `overlay_${preset}`;

/** The varyings LiteRGSS declares for the GL_ES build of these shaders. */
const GL_ES_PREAMBLE = `precision mediump float;
varying vec2 v_texture_coordinates;
varying vec2 v_inv_texture_coordinates;
varying vec4 sf_color;
varying vec2 v_factor_npot;
`;

/**
 * Port a PSDK overlay fragment shader to WebGL, exactly as LiteRGSS does for
 * OpenGL ES. `v_factor_npot` is declared by the shader itself in some presets,
 * so strip any duplicate declaration before prepending ours.
 */
export const toWebGLFragmentShader = (source: string): string => {
  const body = source
    .replace(/\bgl_TexCoord\[0\]/g, 'v_texture_coordinates')
    .replace(/\bgl_TexCoord\[1\]/g, 'v_inv_texture_coordinates')
    .replace(/\bgl_Color\b/g, 'sf_color')
    // The shaders declare this themselves; ours is in the preamble.
    .replace(/^\s*varying\s+vec2\s+v_factor_npot\s*;\s*$/gm, '')
    // `texture` is a reserved word in some GLSL ES compilers when used as a
    // sampler name is fine, but a local `vec4 texture;` (static_image) shadows
    // it — rename the local to keep strict compilers happy.
    .replace(/\bvec4\s+texture\s*;/g, 'vec4 tex_local;')
    .replace(/\btexture\s*=\s*vec4\(texture2D\(/g, 'tex_local = vec4(texture2D(')
    .replace(/\btexture\s*=\s*texture2D\(/g, 'tex_local = texture2D(')
    .replace(/return\s+vec4\(texture\.rgb,\s*min\(dist,\s*texture\.a\)\)/g, 'return vec4(tex_local.rgb, min(dist, tex_local.a))');
  return `${GL_ES_PREAMBLE}\n${body}`;
};

/**
 * Vertex shader for our full-screen quad. The two coordinate sets the overlay
 * presets read have DELIBERATELY OPPOSITE Y, because they live in different
 * spaces:
 *
 *   • gl_TexCoord[0] (v_texture_coordinates) samples our BASE canvas, which is
 *     drawn top-origin (row 0 = top of the map). Our quad maps a_position.y = 0
 *     to the bottom of clip space, so this set is flipped to put the top of the
 *     map at the top of the screen.
 *
 *   • gl_TexCoord[1] (v_inv_texture_coordinates) is the map render target's own
 *     space, which PSDK's godrays / ripple / nausea presets compute their
 *     effect in. That target is a SFML RenderTexture — bottom-origin, y = 0 at
 *     the bottom of the screen — which is exactly the raw attribute. Flipping
 *     it lands godrays' bottom-fade at the top, i.e. upside down.
 *
 * So: flip the base, leave the effect coordinates raw.
 */
export const OVERLAY_VERTEX_SHADER = `attribute vec2 a_position;
attribute vec2 a_texcoord;
uniform vec2 factor_npot;
varying vec2 v_texture_coordinates;
varying vec2 v_inv_texture_coordinates;
varying vec4 sf_color;
varying vec2 v_factor_npot;
void main() {
  v_texture_coordinates = vec2(a_texcoord.x, 1.0 - a_texcoord.y);
  v_inv_texture_coordinates = a_texcoord;
  v_factor_npot = factor_npot;
  sf_color = vec4(1.0, 1.0, 1.0, 1.0);
  gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
}
`;

/** A texture the preset binds, loaded from graphics/fogs (RPG::Cache.fog). */
export type PresetTexture = { uniform: string; defaultName: string };

/** ALLOWED_BLEND_MODES, in PSDK's order — the shader takes the index. */
export const OVERLAY_BLEND_MODES = ['normal', 'add', 'subtract', 'multiply', 'overlay', 'screen'] as const;

/**
 * The knobs a preset actually exposes. Each one maps to a real attribute on the
 * preset class in `003 Overlay Presets.rb`, so anything listed here can be set
 * from an event; anything NOT listed has no setter and could only be changed by
 * patching PSDK. (`fog`, for instance, has a `direction1` uniform its shader
 * reads, but no accessor — so it stays at 0 in game and we don't offer it.)
 */
export type OverlayParam =
  | 'blendMode'
  | 'opacity'
  | 'distFactor'
  | 'sampleColor'
  | 'direction1'
  | 'extraTexture'
  | 'noiseTexture'
  | 'gradientTexture'
  | 'mapAffix'
  | 'zoom'
  | 'position';

export type PresetConfig = {
  /** Index into OVERLAY_BLEND_MODES. */
  blendMode: number;
  distFactor: number;
  /** `sample_color` as PSDK writes it: Color.new(r, g, b, a), 0..255. */
  sampleColor: [number, number, number, number];
  /**
   * `direction1` is ONLY assigned by the scroll preset in PSDK — fog and water
   * declare the uniform but never set it, so it is 0 in game. Matching that
   * matters: a non-zero value makes the noise drift more than it really does.
   */
  direction1: [number, number];
  texture1?: PresetTexture;
  texture2?: PresetTexture;
  /** Tile coordinates for the UVResolver; ripple defaults to the player. */
  position: [number, number] | 'player';
  /** Which attributes this preset lets an event change. */
  params: readonly OverlayParam[];
};

const ALWAYS: readonly OverlayParam[] = ['blendMode', 'opacity'];
// PresetWithMapAffix prepends PresetWithPosition + PresetWithResolution, so the
// image presets get map_affix, zoom and position on top of their own settings.
const IMAGE_PARAMS: readonly OverlayParam[] = [...ALWAYS, 'extraTexture', 'distFactor', 'mapAffix', 'zoom', 'position'];

const BASE: PresetConfig = {
  blendMode: 0,
  distFactor: 1.5,
  sampleColor: [255, 255, 255, 255],
  direction1: [0, 0],
  position: [0, 0],
  params: ALWAYS,
};

/** Per-preset defaults, straight from `003 Overlay Presets.rb`. */
export const OVERLAY_PRESET_CONFIG: Record<string, PresetConfig> = {
  // PresetStaticImage: extra_texture 'fog_base', dist 1.5.
  static_image: { ...BASE, texture1: { uniform: 'extra_texture', defaultName: 'fog_base' }, params: IMAGE_PARAMS },
  // PresetScrollImage: extra_texture 'noise_texture', direction1 [0.1, 0.1].
  scroll: {
    ...BASE,
    direction1: [0.1, 0.1],
    texture1: { uniform: 'extra_texture', defaultName: 'noise_texture' },
    params: [...IMAGE_PARAMS, 'direction1'],
  },
  // PresetFogOverlay: noise 'noise_texture', sample_color (204,204,204).
  fog: {
    ...BASE,
    sampleColor: [204, 204, 204, 255],
    texture1: { uniform: 'noise', defaultName: 'noise_texture' },
    params: [...ALWAYS, 'noiseTexture', 'sampleColor', 'distFactor'],
  },
  // PresetWaterOverlay: noise + colour gradient, blend :multiply.
  water: {
    ...BASE,
    blendMode: 3,
    texture1: { uniform: 'noise', defaultName: 'noise_texture' },
    texture2: { uniform: 'color_gradient', defaultName: 'water_color_gradient' },
    params: [...ALWAYS, 'noiseTexture', 'gradientTexture', 'distFactor'],
  },
  // PresetNausea: no texture, no sample colour — opacity and blend only.
  nausea: { ...BASE },
  // PresetRippleOverlay: sample_color (0,26,26,128), centred on the player.
  ripple: { ...BASE, sampleColor: [0, 26, 26, 128], position: 'player', params: [...ALWAYS, 'sampleColor', 'position'] },
  // PresetGodRaysOverlay: sample_color (153,102,26,128), blend :screen.
  godrays: { ...BASE, sampleColor: [153, 102, 26, 128], blendMode: 5, params: [...ALWAYS, 'sampleColor'] },
};

export const presetConfig = (preset: string): PresetConfig => OVERLAY_PRESET_CONFIG[preset] ?? BASE;

/** True when the preset has a real setter for this attribute in PSDK. */
export const overlaySupports = (preset: string, param: OverlayParam): boolean => presetConfig(preset).params.includes(param);

/**
 * The uniform values the preview should render with — preset defaults, with the
 * user's edits applied on top. Built by the command form; consumed by
 * MapOverlayPreview / OverlayShaderCanvas.
 */
export type OverlayParams = {
  blendMode: number;
  opacity: number;
  distFactor: number;
  /** 0..255, as typed in the form and as PSDK's Color.new takes it. */
  sampleColor: [number, number, number, number];
  direction1: [number, number];
  mapAffix: boolean;
  /** 0 means "leave it at the project's characterTileZoom". */
  zoom: number;
  /** Tile coordinates, 'player', or null for the preset default. */
  position: [number, number] | 'player' | null;
  /** Overrides for the preset's textures; empty string keeps the default. */
  texture1Name: string;
  texture2Name: string;
};

export const defaultOverlayParams = (preset: string): OverlayParams => {
  const cfg = presetConfig(preset);
  return {
    blendMode: cfg.blendMode,
    opacity: 1,
    distFactor: cfg.distFactor,
    sampleColor: [...cfg.sampleColor],
    direction1: [...cfg.direction1],
    mapAffix: false,
    zoom: 0,
    position: null,
    texture1Name: '',
    texture2Name: '',
  };
};

const compile = (gl: WebGLRenderingContext, type: number, src: string): WebGLShader => {
  const sh = gl.createShader(type);
  if (!sh) throw new Error('createShader failed');
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(sh) || 'unknown';
    gl.deleteShader(sh);
    throw new Error(`shader compile failed: ${info}`);
  }
  return sh;
};

export const buildProgram = (gl: WebGLRenderingContext, fragSource: string): WebGLProgram => {
  const vs = compile(gl, gl.VERTEX_SHADER, OVERLAY_VERTEX_SHADER);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSource);
  const prog = gl.createProgram();
  if (!prog) throw new Error('createProgram failed');
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(prog) || 'unknown';
    gl.deleteProgram(prog);
    throw new Error(`program link failed: ${info}`);
  }
  return prog;
};

const nextPowerOfTwo = (v: number) => {
  let p = 1;
  while (p < v) p *= 2;
  return p;
};

/** True when both dimensions are powers of two (REPEAT needs POT in WebGL1). */
export const isPowerOfTwo = (w: number, h: number) => (w & (w - 1)) === 0 && (h & (h - 1)) === 0;

/** An uploaded texture plus the `<name>_factor_npot` its shaders need. */
export type UploadedTexture = { tex: WebGLTexture; factor: [number, number] };

/**
 * Upload an image for the overlay shaders.
 *
 * Two details matter for fidelity. First, SFML textures are unsmoothed by
 * default, so the game samples NEAREST — using LINEAR here would soften pixel
 * art the game renders crisply. Second, LiteRGSS pads non-power-of-two textures
 * up to POT and hands the shader the fraction actually used as
 * `<name>_factor_npot`; the presets then `mod()` against that to tile. We do the
 * same, which is also what makes REPEAT legal on NPOT images in WebGL1.
 */
export const makeTexture = (gl: WebGLRenderingContext, img: HTMLImageElement | HTMLCanvasElement, repeat: boolean): UploadedTexture | null => {
  const tex = gl.createTexture();
  if (!tex) return null;
  const w = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
  const h = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
  let source: HTMLImageElement | HTMLCanvasElement = img;
  let factor: [number, number] = [1, 1];

  if (repeat && w > 0 && h > 0 && !isPowerOfTwo(w, h)) {
    const potW = nextPowerOfTwo(w);
    const potH = nextPowerOfTwo(h);
    const pad = document.createElement('canvas');
    pad.width = potW;
    pad.height = potH;
    const pctx = pad.getContext('2d');
    if (pctx) {
      pctx.imageSmoothingEnabled = false;
      pctx.drawImage(img, 0, 0);
      source = pad;
      factor = [w / potW, h / potH];
    }
  }

  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  const wrap = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return { tex, factor };
};
