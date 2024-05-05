import { PROJECT_VALIDATOR, StudioProject } from '@modelEntities/project';
import { IpcMainEvent } from 'electron';
import fsPromises from 'fs/promises';
import path from 'path';
import { DEFAULT_OTHER_LANGUAGES } from '@modelEntities/config';
import { parseJSON } from '@utils/json/parse';

const addMissingLanguages = (studioProject: StudioProject) => {
  const arr = [...studioProject.languagesTranslation, ...DEFAULT_OTHER_LANGUAGES];
  return arr.filter(({ code }, index, self) => index === self.findIndex((t) => t.code === code));
};

export const addOtherLanguages = async (_: IpcMainEvent, projectPath: string) => {
  const projectStudioPath = path.join(projectPath, 'project.studio');
  const projectStudioFile = await fsPromises.readFile(projectStudioPath, { encoding: 'utf-8' });
  const projectStudioParsed = PROJECT_VALIDATOR.safeParse(parseJSON(projectStudioFile, 'project.studio'));
  if (!projectStudioParsed.success) throw new Error('Fail to parse project.studio file');

  const newProjectStudio: StudioProject = {
    ...projectStudioParsed.data,
    languagesTranslation: addMissingLanguages(projectStudioParsed.data),
  };
  await fsPromises.writeFile(projectStudioPath, JSON.stringify(newProjectStudio, null, 2));
};
