import { POSITIVE_OR_ZERO_INT } from '@modelEntities/common';
import { z } from 'zod';

export const COMPILATION_DIALOG_SCHEMA = z.object({
  gameName: z.string(),
  gameVersion: POSITIVE_OR_ZERO_INT,
  updateVisual: z.boolean(),
  updateData: z.boolean(),
  updateLibraries: z.boolean(),
  updateAudio: z.boolean(),
  updateBinaries: z.boolean(),
});

export type StudioCompilation = z.infer<typeof COMPILATION_DIALOG_SCHEMA>;
export type StudioOptionCompilation = 'updateVisual' | 'updateData' | 'updateLibraries' | 'updateAudio' | 'updateBinaries';
