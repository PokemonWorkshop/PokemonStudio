import fs from 'fs';
import path from 'path';

export type RMXPAudio = {
  name: string;
  volume: number;
  pitch: number;
};
export type RMXPAudioType = 'bgm' | 'bgs' | 'me' | 'se';
export type AudioData = { '@name': string; '@volume': number; '@pitch': number };

export const isRecord = (object: unknown): object is Record<string | symbol, unknown> => typeof object === 'object' && object !== null;

export const addAudioExtensionFile = (projectPath: string, filename: string, type: RMXPAudioType) => {
  if (!filename) return '';

  const filePath = path.join(projectPath, 'audio', type, filename);
  const ext = ['ogg', 'mp3', 'midi', 'mid', 'aac', 'wav', 'flac'].find((ext) => fs.existsSync(`${filePath}.${ext}`));
  if (!ext) return filename;

  return `${filename}.${ext}`;
};
