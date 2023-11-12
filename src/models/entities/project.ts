import { z } from 'zod';

export const PROJECT_VALIDATOR = z.object({
  title: z.string(),
  studioVersion: z.string(),
  iconPath: z.string().default('graphics/icons/game.png'),
  isTiledMode: z.boolean().nullable().default(null),
});
export type StudioProject = z.infer<typeof PROJECT_VALIDATOR>;

export const createProjectStudio = (title: string, studioVersion: string, iconPath: string, isTiledMode: boolean): StudioProject => ({
  title,
  studioVersion,
  iconPath,
  isTiledMode,
});
