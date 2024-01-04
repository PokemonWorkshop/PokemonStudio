import { join } from '@utils/path';
import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderRef } from '@utils/loaderContext';
import type { ProjectNewFunctionBinding, ProjectNewStateObject } from './types';
import { DEFAULT_PROCESS_STATE, PROCESS_DONE_STATE, SpecialStateProcessors } from '@utils/useProcess';
import { handleFailure } from './helpers';

const DEFAULT_BINDING: ProjectNewFunctionBinding = {
  onFailure: () => {},
  onSuccess: () => {},
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
          ({ folderPath }) => setState({ ...state, state: 'checkingFolderExist', projectDirName: join(folderPath, state.payload.projectTitle) }),
          () => {
            setState(DEFAULT_PROCESS_STATE);
            loaderRef.current.close();
          }
        );
      },
      checkingFolderExist: (state, setState) => {
        loaderRef.current.open('creating_project', 1, 4, tl('creating_project_checking'));
        return window.api.fileExists(
          { filePath: state.projectDirName },
          ({ result }) => {
            if (result) {
              loaderRef.current.setError('creating_project_error', tl('creating_project_child_folder_exist_error'));
              setState(DEFAULT_PROCESS_STATE);
            } else setState({ ...state, state: 'readingVersion' });
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
        loaderRef.current.open('creating_project', 3, 4, tl('creating_project_extraction', { progress: 0 }));
        return window.api.extractNewProject(
          { projectDirName: state.projectDirName },
          () => setState({ ...state, state: 'configure' }),
          handleFailure(setState, binding),
          ({ step }) => loaderRef.current.open('creating_project', 3, 4, tl('creating_project_extraction', { progress: step.toFixed(1) }))
        );
      },
      configure: (state, setState) => {
        loaderRef.current.open('creating_project', 4, 4, tl('creating_project_configuration'));
        return window.api.configureNewProject(
          {
            projectDirName: state.projectDirName,
            metaData: {
              ...state.payload,
              projectStudioData: JSON.stringify({ ...state.payload.projectStudioData, studioVersion: state.studioVersion }, null, 2),
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
