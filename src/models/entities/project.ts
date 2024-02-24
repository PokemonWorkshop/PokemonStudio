import { z } from 'zod';

export const PROJECT_LANGUAGE_TRANSLATION_VALIDATOR = z.object({
  code: z.string(),
  name: z.string(),
});
export type StudioProjectLanguageTranslation = z.infer<typeof PROJECT_LANGUAGE_TRANSLATION_VALIDATOR>;

export const PROJECT_VALIDATOR = z.object({
  title: z.string(),
  studioVersion: z.string(),
  iconPath: z.string().default('graphics/icons/game.png'),
  isTiledMode: z.boolean().nullable().default(null),
  languagesTranslation: z.array(PROJECT_LANGUAGE_TRANSLATION_VALIDATOR),
});
export type StudioProject = z.infer<typeof PROJECT_VALIDATOR>;

export const PROJECT_VERSION_VALIDATOR = z.object({
  studioVersion: z.string(),
});

export const createProjectStudio = (
  title: string,
  studioVersion: string,
  iconPath: string,
  isTiledMode: boolean,
  languagesTranslation: StudioProjectLanguageTranslation[]
): StudioProject => ({
  title,
  studioVersion,
  iconPath,
  isTiledMode,
  languagesTranslation,
});
