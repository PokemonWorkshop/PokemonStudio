import { PROJECT_VALIDATOR, StudioProject } from '@modelEntities/project';
import { IpcMainEvent } from 'electron';
import fsPromises from 'fs/promises';
import path from 'path';
import { LANGUAGE_CONFIG_VALIDATOR, getProjectLanguagesTranslationFromLanguageConfig } from '@modelEntities/config';

const PRE_MIGRATION_PROJECT_VALIDATOR = PROJECT_VALIDATOR.omit({ languagesTranslation: true });

export const addLanguagesTranslationAvailables = async (_: IpcMainEvent, projectPath: string) => {
  const configLanguageFile = await fsPromises.readFile(path.join(projectPath, 'Data/configs/language_config.json'), { encoding: 'utf-8' });
  const configLanguageParsed = LANGUAGE_CONFIG_VALIDATOR.safeParse(JSON.parse(configLanguageFile));
  if (!configLanguageParsed.success) throw new Error('Fail to parse language_config.json file');

  const projectStudioPath = path.join(projectPath, 'project.studio');
  const projectStudioFile = await fsPromises.readFile(projectStudioPath, { encoding: 'utf-8' });
  const projectStudioParsed = PRE_MIGRATION_PROJECT_VALIDATOR.safeParse(JSON.parse(projectStudioFile));
  if (!projectStudioParsed.success) throw new Error('Fail to parse project.studio file');

  const newProjectStudio: StudioProject = {
    ...projectStudioParsed.data,
    languagesTranslation: getProjectLanguagesTranslationFromLanguageConfig(configLanguageParsed.data),
  };
  await fsPromises.writeFile(projectStudioPath, JSON.stringify(newProjectStudio, null, 2));
};
