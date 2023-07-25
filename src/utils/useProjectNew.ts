import { StudioProject } from '@modelEntities/project';
import { join } from '@utils/path';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderRef } from './loaderContext';

type ProjectNewStateObject =
  | { state: 'done' }
  | { state: 'choosingDestinationFolder'; payload: ProjectNewPayload }
  | { state: 'checkingFolderExist' | 'readingVersion'; payload: ProjectNewPayload; projectDirName: string }
  | { state: 'extract' | 'configure'; payload: ProjectNewPayload; projectDirName: string; studioVersion: string };

type ProjectNewFailureCallback = (error: { errorMessage: string }) => void;
type ProjectNewSuccessCallback = (payload: { projectDirName: string }) => void;
type ProjectNewPayload = {
  projectStudioData: StudioProject;
  languageConfig: string;
  projectTitle: string;
  iconPath: string | undefined;
  multiLanguage: boolean;
};

const fail = (callbacks: { onFailure: ProjectNewFailureCallback } | undefined, error: unknown) => {
  if (callbacks) {
    callbacks.onFailure({ errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const useProjectNew = () => {
  const loaderRef = useLoaderRef();
  const { t: tl } = useTranslation('loader');
  const [callbacks, setCallbacks] = useState<{ onFailure: ProjectNewFailureCallback; onSuccess: ProjectNewSuccessCallback } | undefined>(undefined);
  const [state, setState] = useState<ProjectNewStateObject>({ state: 'done' });

  useEffect(() => {
    switch (state.state) {
      case 'choosingDestinationFolder':
        loaderRef.current.open('creating_project', 0, 0, tl('creating_project_opening_path'));
        return window.api.chooseFolder(
          {},
          ({ folderPath }) => setState({ ...state, state: 'checkingFolderExist', projectDirName: join(folderPath, state.payload.projectTitle) }),
          () => {
            setState({ state: 'done' });
            loaderRef.current.close();
          }
        );
      case 'checkingFolderExist':
        loaderRef.current.open('creating_project', 1, 4, tl('creating_project_checking'));
        return window.api.fileExists(
          { filePath: state.projectDirName },
          ({ result }) => {
            if (result) {
              loaderRef.current.setError('creating_project_error', tl('creating_project_child_folder_exist_error'));
              setState({ state: 'done' });
            } else setState({ ...state, state: 'readingVersion' });
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'readingVersion':
        loaderRef.current.setProgress(2, 4, tl('importing_project_reading_version'));
        return window.api.getStudioVersion(
          {},
          (projectVersion) => setState({ ...state, state: 'extract', studioVersion: projectVersion.studioVersion }),
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'extract':
        loaderRef.current.open('creating_project', 3, 4, tl('creating_project_extraction', { progress: 0 }));
        return window.api.extractNewProject(
          { projectDirName: state.projectDirName },
          () => setState({ ...state, state: 'configure' }),
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          },
          ({ step }) => loaderRef.current.open('creating_project', 3, 4, tl('creating_project_extraction', { progress: step }))
        );
      case 'configure':
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
            setState({ ...state, state: 'done' });
            callbacks?.onSuccess({ projectDirName: state.projectDirName });
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, callbacks]);

  return (payload: ProjectNewPayload, onSuccess: ProjectNewSuccessCallback, onFailure: ProjectNewFailureCallback) => {
    setCallbacks({ onFailure, onSuccess });
    setState({ state: 'choosingDestinationFolder', payload });
  };
};
