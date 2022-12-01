import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoaderRef } from './loaderContext';
import { useProjectImportFromPSDKv2 } from '@utils/useProjectImportFromPSDK';
import ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import path from 'path';

type ProjectImportFailureCallback = (error: { errorMessage: string }) => void;
type ProjectImportSuccessCallback = (payload: { projectDirName: string }) => void;
type ProjectImportStateObjectWithDirName = {
  state: 'convertingProject' | 'readingTitle' | 'checkingProject';
  projectDirName: string;
};
type ProjectImportStateObjectWithDirNameAndTitle = {
  state: 'readingVersion';
  projectDirName: string;
  projectTitle: string;
};
type ProjectImportStateObjectWritingMeta = {
  state: 'writingMeta';
  projectDirName: string;
  projectTitle: string;
  projectVersion: { studioVersion: string };
};
type ProjectImportStateObject =
  | { state: 'done' | 'choosingProjectFile' }
  | ProjectImportStateObjectWithDirName
  | ProjectImportStateObjectWithDirNameAndTitle
  | ProjectImportStateObjectWritingMeta;

const cleanup = (window: Window & typeof globalThis) => {
  window.api.cleanupChooseProjectFileToOpen();
  window.api.cleanupFileExists();
  window.api.cleanupGetStudioVersion();
  window.api.cleanupGetProjectInfo();
  window.api.cleanupWriteProjectMetadata();
};

const fail = (callbacks: { onFailure: ProjectImportFailureCallback } | undefined, error: unknown) => {
  if (callbacks) {
    callbacks.onFailure({ errorMessage: `${error instanceof Error ? error.message : error}` });
  }
};

export const useProjectImport = () => {
  const loaderRef = useLoaderRef();
  const { t: tl } = useTranslation('loader');
  const projectImportFromPSDKv2 = useProjectImportFromPSDKv2();
  const [callbacks, setCallbacks] = useState<{ onFailure: ProjectImportFailureCallback; onSuccess: ProjectImportSuccessCallback } | undefined>(
    undefined
  );
  const [state, setState] = useState<ProjectImportStateObject>({ state: 'done' });

  useEffect(() => {
    switch (state.state) {
      case 'done':
        return cleanup(window);
      case 'choosingProjectFile':
        loaderRef.current.open('importing_project', 0, 0, tl('importing_project_choose_project'));
        return window.api.chooseProjectFileToOpen(
          { fileType: 'rxproj' },
          ({ dirName }) => setState({ state: 'checkingProject', projectDirName: dirName }),
          () => {
            setState({ state: 'done' });
            loaderRef.current.close();
          }
        );
      case 'checkingProject':
        loaderRef.current.setProgress(1, 5, tl('importing_project_checking'));
        return window.api.fileExists(
          { filePath: path.join(state.projectDirName, 'project.studio') },
          ({ result }) => {
            if (result) {
              setState({ state: 'done' });
              fail(callbacks, tl('importing_not_import_studio_project'));
            } else setState({ ...state, state: 'convertingProject' });
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'convertingProject':
        loaderRef.current.setProgress(2, 5, tl('importing_project_converting'));
        return projectImportFromPSDKv2(
          { projectDirName: state.projectDirName },
          () => setState({ ...state, state: 'readingTitle' }),
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'readingTitle':
        loaderRef.current.setProgress(3, 5, tl('importing_project_reading_title'));
        return window.api.getProjectInfo(
          { path: state.projectDirName },
          ({ gameTitle }) => setState({ ...state, state: 'readingVersion', projectTitle: gameTitle }),
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'readingVersion':
        loaderRef.current.setProgress(4, 5, tl('importing_project_reading_version'));
        return window.api.getStudioVersion(
          {},
          (projectVersion) => setState({ ...state, state: 'writingMeta', projectVersion }),
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
      case 'writingMeta':
        loaderRef.current.setProgress(5, 5, tl('importing_project_writing_meta'));
        const { clone: _, ...metaData } = ProjectStudioModel.createProjectStudio(
          state.projectTitle,
          state.projectVersion.studioVersion,
          'graphics/icons/game.png'
        );
        return window.api.writeProjectMetadata(
          { path: state.projectDirName, metaData },
          () => {
            setState({ state: 'done' });
            if (!callbacks) return loaderRef.current.close();

            callbacks.onSuccess({ projectDirName: state.projectDirName });
          },
          ({ errorMessage }) => {
            setState({ state: 'done' });
            fail(callbacks, errorMessage);
          }
        );
    }
  }, [state, callbacks]);

  return (_: {}, onSuccess: ProjectImportSuccessCallback, onFailure: ProjectImportFailureCallback) => {
    setCallbacks({ onFailure, onSuccess });
    setState({ state: 'choosingProjectFile' });
  };
};
