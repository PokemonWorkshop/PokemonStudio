import log from 'electron-log';
import path from 'path';
import fsPromises from 'fs/promises';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

/**
 * Fork-only backend task: read a map-overlay fragment shader's SOURCE from the
 * project so Studio can render the map-overlay preview with the exact same GLSL
 * the game runs, rather than an approximation.
 *
 * PSDK's overlay presets are plain GLSL (`graphics/shaders/overlay_*.frag`) and
 * LiteRGSS already ships a GL-ES variant of them (see `011 Shader.rb`), so the
 * same source compiles in Studio's WebGL context after the same small rewrites.
 *
 * Path-locked to `graphics/shaders` and to `.frag` files — the name is used to
 * build a filename, so it must not be able to wander off.
 */

export type ReadOverlayShaderInput = { projectPath: string; shaderName: string };
export type ReadOverlayShaderOutput = { source: string };

export const readOverlayShader = async ({ projectPath, shaderName }: ReadOverlayShaderInput): Promise<ReadOverlayShaderOutput> => {
  // Only a bare shader name — no separators, no traversal, no extension games.
  if (!/^[a-z0-9_]+$/i.test(shaderName)) throw `readOverlayShader: invalid shader name "${shaderName}"`;

  const shaderDir = path.resolve(projectPath, 'graphics', 'shaders');
  const filePath = path.resolve(shaderDir, `${shaderName}.frag`);
  const rel = path.relative(shaderDir, filePath);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw `readOverlayShader: refusing to read outside graphics/shaders`;

  const source = await fsPromises.readFile(filePath, 'utf-8');
  log.info('read-overlay-shader', { shaderName, length: source.length });
  return { source };
};

export const registerReadOverlayShader = defineBackendServiceFunction('read-overlay-shader', readOverlayShader);
