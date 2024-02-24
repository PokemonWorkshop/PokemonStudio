import { join } from '@utils/path';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderRef } from '@utils/loaderContext';
import type { DefaultLanguageType, ProjectNewFunctionBinding, ProjectNewStateObject } from './types';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@utils/useProcess';
import { handleFailure } from './helpers';
import { StudioLanguageConfig, getProjectLanguagesTranslationFromLanguageConfig } from '@modelEntities/config';
import { downloadSpeed } from '@utils/downloadSpeed';

const DEFAULT_BINDING: ProjectNewFunctionBinding = {
  onFailure: () => {},
  onSuccess: () => {},
};
const REPOSITORY_URL = 'https://github.com/PokemonWorkshop/PSDKTechnicalDemo/releases/latest/download/';

const languageTexts: Record<DefaultLanguageType, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  pt: 'Portuguese',
  de: 'German',
};

const getLanguageConfig = (projectData: { defaultLanguage: DefaultLanguageType; multiLanguage: boolean }): StudioLanguageConfig => {
  return {
    klass: 'Configs::Project::Language',
    defaultLanguage: projectData.defaultLanguage,
    choosableLanguageCode: projectData.multiLanguage ? Object.keys(languageTexts) : [projectData.defaultLanguage],
    choosableLanguageTexts: projectData.multiLanguage ? Object.values(languageTexts) : [languageTexts[projectData.defaultLanguage]],
  };
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
        loaderRef.current.setProgress(1, 6, tl('creating_project_checking'));
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
        loaderRef.current.setProgress(2, 6, tl('importing_project_reading_version'));
        return window.api.getStudioVersion(
          {},
          (projectVersion) => setState({ ...state, state: 'checkingNeedDownload', studioVersion: projectVersion.studioVersion }),
          handleFailure(setState, binding)
        );
      },
      checkingNeedDownload: (state, setState) => {
        loaderRef.current.setProgress(3, 6, tl('creating_project_checking_need_download'));
        return window.api.checkDownloadNewProject(
          { url: new URL('latest.json', REPOSITORY_URL).href },
          (output) => {
            if (output.needDownload) {
              return setState({ ...state, state: 'download', latestFile: { filename: output.filename, sha1: output.sha1 } });
            }
            setState({ ...state, state: 'extract' });
          },
          handleFailure(setState, binding)
        );
      },
      download: (state, setState) => {
        loaderRef.current.setProgress(4, 6, tl('creating_project_downloading', { progress: 0, speed: downloadSpeed(0, tl) }));
        return window.api.downloadFile(
          {
            url: new URL(state.latestFile.filename, REPOSITORY_URL).href,
            dest: { target: 'studio', filename: 'new-project.zip' },
            sha1: state.latestFile.sha1,
          },
          () => setState({ ...state, state: 'extract' }),
          handleFailure(setState, binding),
          ({ step, stepText }) => {
            const speed = downloadSpeed(Number(stepText), tl);
            loaderRef.current.setProgress(4, 6, tl('creating_project_downloading', { progress: `${step.toFixed(1)}`, speed }));
          }
        );
      },
      extract: (state, setState) => {
        loaderRef.current.setProgress(5, 6, tl('creating_project_extraction', { progress: 0 }));
        return window.api.extractNewProject(
          { projectDirName: state.projectDirName },
          () => setState({ ...state, state: 'configure' }),
          handleFailure(setState, binding),
          ({ step }) => loaderRef.current.setProgress(3, 4, tl('creating_project_extraction', { progress: step.toFixed(1) }))
        );
      },
      configure: (state, setState) => {
        loaderRef.current.setProgress(6, 6, tl('creating_project_configuration'));
        const newProjectData = state.payload;
        const config = getLanguageConfig({ defaultLanguage: newProjectData.defaultLanguage, multiLanguage: newProjectData.multiLanguage });
        return window.api.configureNewProject(
          {
            projectDirName: state.projectDirName,
            metaData: {
              projectStudioData: JSON.stringify(
                {
                  title: newProjectData.title,
                  studioVersion: state.studioVersion,
                  iconPath: 'project_icon.png',
                  isTiledMode: true,
                  languagesTranslation: getProjectLanguagesTranslationFromLanguageConfig(config),
                },
                null,
                2
              ),
              projectTitle: newProjectData.title,
              iconPath: newProjectData.icon,
              languageConfig: JSON.stringify(config, null, 2),
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
