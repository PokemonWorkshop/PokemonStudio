import { z } from 'zod';

export const PROJECT_VALIDATOR = z.object({
  title: z.string(),
  studioVersion: z.string(),
  iconPath: z.string().default('graphics/icons/game.png'),
});
export type StudioProject = z.infer<typeof PROJECT_VALIDATOR>;

export const createProjectStudio = (title: string, studioVersion: string, iconPath: string): StudioProject => ({
  title,
  studioVersion,
  iconPath,
});
