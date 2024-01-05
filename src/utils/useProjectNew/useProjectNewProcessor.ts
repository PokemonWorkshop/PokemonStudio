import { join } from '@utils/path';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderRef } from '@utils/loaderContext';
import type { DefaultLanguageType, ProjectNewFunctionBinding, ProjectNewStateObject } from './types';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@utils/useProcess';
import { handleFailure } from './helpers';
import { StudioLanguageConfig } from '@modelEntities/config';

const DEFAULT_BINDING: ProjectNewFunctionBinding = {
  onFailure: () => {},
  onSuccess: () => {},
};

const languageTexts: Record<DefaultLanguageType, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
};

const getLanguageConfig = (projectData: { defaultLanguage: DefaultLanguageType; multiLanguage: boolean }): string => {
  const config: StudioLanguageConfig = {
    klass: 'Configs::Project::Language',
    defaultLanguage: projectData.defaultLanguage,
    choosableLanguageCode: projectData.multiLanguage ? ['en', 'fr', 'es'] : [projectData.defaultLanguage],
    choosableLanguageTexts: projectData.multiLanguage ? ['English', 'French', 'Spanish'] : [languageTexts[projectData.defaultLanguage]],
  };
  return JSON.stringify(config, null, 2);
};

export const useProjectNewProcessor = () => {
  const loaderRef = useLoaderRef();
  const { t: tl } = useTranslation('loader');
  const binding = useRef<ProjectNewFunctionBinding>(DEFAULT_BINDING);
  const processors: SpecialStateProcessors<ProjectNewStateObject> = useMemo(
    () => ({
      ...PROCESS_DONE_STATE,
      choosingDestinationFolder: (state, setState) => {
        loaderRef.current.open('creating_project', 0, 0, tl('creating_project_opening_path'));
        return window.api.chooseFolder(
          {},
          ({ folderPath }) => setState({ ...state, state: 'checkingFolderExist', projectDirName: join(folderPath, state.payload.title) }),
          () => {
            setState(DEFAULT_PROCESS_STATE);
            loaderRef.current.close();
          }
        );
      },
      checkingFolderExist: (state, setState) => {
        loaderRef.current.setProgress(1, 4, tl('creating_project_checking'));
        return window.api.fileExists(
          { filePath: state.projectDirName },
          ({ result }) => {
            if (result) {
              handleFailure(setState, binding)({ errorMessage: tl('creating_project_child_folder_exist_error') });
            } else {
              setState({ ...state, state: 'readingVersion' });
            }
          },
          handleFailure(setState, binding)
        );
      },
      readingVersion: (state, setState) => {
        loaderRef.current.setProgress(2, 4, tl('importing_project_reading_version'));
        return window.api.getStudioVersion(
          {},
          (projectVersion) => setState({ ...state, state: 'extract', studioVersion: projectVersion.studioVersion }),
          handleFailure(setState, binding)
        );
      },
      extract: (state, setState) => {
        loaderRef.current.setProgress(3, 4, tl('creating_project_extraction', { progress: 0 }));
        return window.api.extractNewProject(
          { projectDirName: state.projectDirName },
          () => setState({ ...state, state: 'configure' }),
          handleFailure(setState, binding),
          ({ step }) => loaderRef.current.setProgress(3, 4, tl('creating_project_extraction', { progress: step.toFixed(1) }))
        );
      },
      configure: (state, setState) => {
        loaderRef.current.setProgress(4, 4, tl('creating_project_configuration'));
        const newProjectData = state.payload;
        return window.api.configureNewProject(
          {
            projectDirName: state.projectDirName,
            metaData: {
              projectStudioData: JSON.stringify(
                {
                  title: newProjectData.title,
                  studioVersion: state.studioVersion,
                  iconPath: 'project_icon.png',
                  isTiledMode: null,
                },
                null,
                2
              ),
              projectTitle: newProjectData.title,
              iconPath: newProjectData.icon,
              languageConfig: getLanguageConfig({ defaultLanguage: newProjectData.defaultLanguage, multiLanguage: newProjectData.multiLanguage }),
              multiLanguage: newProjectData.multiLanguage,
            },
          },
          () => {
            binding.current.onSuccess({ projectDirName: state.projectDirName });
            setState(DEFAULT_PROCESS_STATE);
          },
          handleFailure(setState, binding)
        );
      },
    }),
    []
  );

  return { processors, binding };
};
