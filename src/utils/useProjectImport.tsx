import ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import IpcService from '@services/IPC/ipc.service';
import { useGlobalState } from '@src/GlobalStateProvider';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { updateProjectStudio } from './IPCUtils';
import { useLoaderRef } from './loaderContext';
import { loadProject } from './loadProject';
import { addProjectToList, updateProjectStudio as updateProjectStudioProjectList } from './projectList';
import { showNotification } from './showNotification';
import { useProjectConfigFromPSDK } from './useProjectConfigFromPSDK';
import { useProjectImportFromPSDK } from './useProjectImportFromPSDK';

type ProjectImportMode = 'createStudioFile' | 'import' | 'load';

export const useProjectImport = () => {
  const ipc = useMemo(() => new IpcService(), []);
  const {
    loading: configLoading,
    error: configError,
    success: configSuccess,
    busy: configBusy,
    psdkConfig,
    start: startGetConfig,
    reset: configReset,
  } = useProjectConfigFromPSDK();
  const { loading, error, success, busy, start, reset } = useProjectImportFromPSDK();
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<Error | undefined>(undefined);
  const [projectPath, setProjectPath] = useState('');
  const loaderRef = useLoaderRef();
  const { t: tl } = useTranslation('loader');
  const [mode, setMode] = useState<ProjectImportMode>('createStudioFile');
  const [, setState] = useGlobalState();
  const history = useHistory();
  const { t } = useTranslation('homepage');

  const manageError = (newError: Error) => {
    setImportLoading(false);
    setImportError(newError);
  };

  useEffect(() => {
    const createStudioFile = async () => {
      const studioVersion = await window.api.getAppVersion();
      if (!psdkConfig) return manageError(new Error('The PSDKConfig is undefined.'));
      const newProjectStudio = ProjectStudioModel.createProjectStudio(psdkConfig.gameTitle, studioVersion, 'graphics/icons/game.png');
      const updateProjectStudioValue = await updateProjectStudio(ipc, projectPath, newProjectStudio);
      if ('error' in updateProjectStudioValue) return manageError(new Error(updateProjectStudioValue.error));
      setMode('import');
    };
    const loadProjectNoDialog = async () => {
      return loadProject(ipc, loaderRef, tl, projectPath)
        .then((projectDataWithPath) => {
          setState((prev) => ({
            ...prev,
            ...projectDataWithPath,
          }));
          addProjectToList({
            projectStudio: projectDataWithPath.projectStudio,
            projectPath: projectDataWithPath.projectPath,
            lastEdit: new Date(),
          });
          updateProjectStudioProjectList(projectDataWithPath.projectPath, projectDataWithPath.projectStudio);
          return history.push('/dashboard');
        })
        .catch((err) => manageError(err));
    };
    if (importLoading) {
      if (mode === 'createStudioFile' && !configLoading && !configSuccess && !configBusy) startGetConfig(projectPath);
      if (mode === 'createStudioFile' && configSuccess && !configBusy) createStudioFile();
      if (mode === 'import' && !loading && !success && !busy) start(projectPath);
      if (mode === 'import' && success && !busy) {
        showNotification('success', t('import'), t('import_success'));
        setMode('load');
      }
      if (mode === 'load') loadProjectNoDialog();
      if (configError || error) setImportLoading(false);
    }
    return () => {};
  }, [
    busy,
    configBusy,
    configError,
    configLoading,
    configSuccess,
    error,
    history,
    importLoading,
    ipc,
    loading,
    mode,
    projectPath,
    psdkConfig,
    setState,
    start,
    startGetConfig,
    success,
    t,
  ]);

  return {
    importLoading,
    importError: configError || error || importError,
    importBusy: busy || configBusy,
    mode,
    startImport: (path: string) => {
      showNotification('info', t('import'), t('import_begin'));
      setProjectPath(path);
      setMode('createStudioFile');
      setImportLoading(true);
      setImportError(undefined);
    },
    resetImport: () => {
      setProjectPath('');
      setImportLoading(false);
      setMode('createStudioFile');
      setImportError(undefined);
      configReset();
      reset();
    },
  };
};
