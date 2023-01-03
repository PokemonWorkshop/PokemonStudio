import React, { ReactNode } from 'react';
import { DefaultLanguageType, ProjectCreationData } from '@pages/editors';
import { PrimaryButton } from './GenericButtons';
import { useHistory } from 'react-router-dom';
import { useLoaderRef } from '@utils/loaderContext';
import { useProjectLoad } from '@utils/useProjectLoad';
import { useProjectNew } from '@utils/useProjectNew';
import { StudioLanguageConfig } from '@modelEntities/config';

type CreateProjectButtonProps = {
  projectData: Omit<ProjectCreationData, 'clone'>;
  children: ReactNode;
  disabled: boolean;
};

const languageTexts: Record<DefaultLanguageType, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
};

const getLanguageConfig = (projectData: Omit<ProjectCreationData, 'clone'>): string => {
  const config: StudioLanguageConfig = {
    klass: 'Configs::Project::Language',
    defaultLanguage: projectData.defaultLanguage,
    choosableLanguageCode: projectData.multiLanguage ? ['en', 'fr', 'es'] : [projectData.defaultLanguage],
    choosableLanguageTexts: projectData.multiLanguage ? ['English', 'French', 'Spanish'] : [languageTexts[projectData.defaultLanguage]],
  };
  return JSON.stringify(config, null, 2);
};

export const CreateProjectButton = ({ projectData, children, disabled }: CreateProjectButtonProps) => {
  const loaderRef = useLoaderRef();
  const projectNew = useProjectNew();
  const projectLoad = useProjectLoad();
  const history = useHistory();

  const handleClick = async () => {
    projectNew(
      {
        projectStudioData: projectData as Omit<ProjectCreationData, 'clone' | 'icon' | 'defaultLanguage' | 'multiLanguage'>,
        languageConfig: getLanguageConfig(projectData),
        projectTitle: projectData.title,
        iconPath: projectData.icon,
        multiLanguage: projectData.multiLanguage,
      },
      ({ projectDirName }) => {
        projectLoad(
          { projectDirName },
          () => {
            loaderRef.current.close();
            history.push('/dashboard');
          },
          ({ errorMessage }) => loaderRef.current.setError('loading_project_error', errorMessage)
        );
      },
      ({ errorMessage }) => loaderRef.current.setError('creating_project_error', errorMessage)
    );
  };
  return (
    <PrimaryButton disabled={disabled} onClick={handleClick}>
      {children}
    </PrimaryButton>
  );
};
