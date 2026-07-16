import fs from 'fs';
import path from 'path';
import { defineBackendServiceFunction } from './defineBackendServiceFunction';

/**
 * Fork-owned backend task: read one audio file from the project's `Audio/`
 * tree and return its bytes.
 *
 * The event editor's SE/BGM preview decodes these with the Web Audio API so it
 * can resample by playback rate — matching how PSDK's audio drivers apply pitch
 * (`set_pitch(pitch/100.0)` = a speed+tone resample). An <audio> element can't
 * do that reliably (its `preservesPitch` flag is meant to PREVENT resampling),
 * so the preview needs the raw samples, hence this reader.
 *
 * RMXP stores the BARE name; the folder + real filename come from the picker.
 * Root-locked to `Audio/` so a malformed name can't escape into arbitrary reads.
 */

export type ReadAudioBytesInput = {
  projectPath: string;
  /** Audio subfolder: 'bgm' | 'bgs' | 'me' | 'se'. */
  folder: string;
  /** Filename WITH extension, as it exists on disk. */
  file: string;
};

export type ReadAudioBytesOutput = {
  bytes: ArrayBuffer;
  size: number;
};

export const registerReadAudioBytes = defineBackendServiceFunction(
  'read-audio-bytes',
  async ({ projectPath, folder, file }: ReadAudioBytesInput): Promise<ReadAudioBytesOutput> => {
    const audioDir = path.resolve(projectPath, 'Audio');
    const target = path.resolve(audioDir, folder, file);

    // Reject anything that resolved outside Audio/ — guards against folder/file
    // containing `..` or absolute path segments.
    const rel = path.relative(audioDir, target);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      throw `readAudioBytes: refusing to read outside Audio/ (${folder}/${file})`;
    }
    if (!fs.existsSync(target)) throw `readAudioBytes: no such file ${folder}/${file}`;

    const buf = await fs.promises.readFile(target);
    // Fresh ArrayBuffer so IPC ships only these bytes, not the shared pool.
    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    return { bytes: arrayBuffer, size: buf.byteLength };
  }
);
