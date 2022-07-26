import React, { ReactNode, useEffect, useState } from 'react';
import { DefaultLanguageType, ProjectCreationData } from '@pages/editors';
import { PrimaryButton } from './GenericButtons';
import { createProject } from '@utils/IPCUtils';
import { serializeLanguageConfig, serializeProjectStudio } from '@utils/SerializationUtils';
import IpcService from '@services/IPC/ipc.service';
import ProjectStudioModel from '@modelEntities/ProjectStudio.model';
import { useHistory } from 'react-router-dom';
import LanguageConfigModel from '@modelEntities/config/LanguageConfig.model';
import { useLoaderRef } from '@utils/loaderContext';
import { useTranslation } from 'react-i18next';
import { useProjectLoadV2 } from '@utils/useProjectLoadV2';

type CreateProjectButtonProps = {
  projectData: Omit<ProjectCreationData, 'clone'>;
  children: ReactNode;
  disabled: boolean;
  onBusy: (busy: boolean) => void;
};

const languageTexts: Record<DefaultLanguageType, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
};

const getLanguageConfig = (projectData: Omit<ProjectCreationData, 'clone'>): string => {
  return serializeLanguageConfig(
    Object.assign(new LanguageConfigModel(), {
      klass: 'Configs::Project::Language',
      defaultLanguage: projectData.defaultLanguage,
      choosableLanguageCode: projectData.multiLanguage ? ['en', 'fr', 'es'] : [projectData.defaultLanguage],
      choosableLanguageTexts: projectData.multiLanguage ? ['English', 'French', 'Spanish'] : [languageTexts[projectData.defaultLanguage]],
    })
  );
};

export const CreateProjectButton = ({ projectData, children, disabled, onBusy }: CreateProjectButtonProps) => {
  const [isBusy, setIsBusy] = useState(false);
  const { t } = useTranslation('loader');
  const loaderRef = useLoaderRef();
  const projectLoadV2 = useProjectLoadV2();
  const ipc = new IpcService();
  const history = useHistory();

  useEffect(() => {
    onBusy(isBusy);
  }, [onBusy, isBusy]);

  const handleClick = async () => {
    setIsBusy(true);
    projectData.studioVersion = await window.api.getAppVersion();
    const path = await createProject(
      ipc,
      serializeProjectStudio(Object.assign(new ProjectStudioModel(), projectData)),
      getLanguageConfig(projectData),
      projectData.title,
      projectData.icon,
      projectData.multiLanguage,
      loaderRef,
      t
    )
      .then((path) => {
        loaderRef.current.close();
        return path;
      })
      .catch((err) => {
        loaderRef.current.setError(
          'creating_project_error',
          t((err instanceof Error ? err.message : `${err}`) as 'creating_project_child_folder_exist_error')
        );
        setIsBusy(false);
        return null;
      });
    if (!path) return;

    projectLoadV2(
      { projectDirName: path },
      () => {
        loaderRef.current.close();
        history.push('/dashboard');
      },
      ({ errorMessage }) => loaderRef.current.setError('loading_project_error', errorMessage)
    );
  };
  return (
    <PrimaryButton disabled={isBusy || disabled} onClick={handleClick}>
      {children}
    </PrimaryButton>
  );
};
