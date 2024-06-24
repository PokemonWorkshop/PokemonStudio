import React, { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecondaryButton } from '../GenericButtons';
import { useLoaderRef } from '@utils/loaderContext';
import { useProjectLoad } from '@hooks/useProjectLoad';
import { useTranslation } from 'react-i18next';

type LoadProjectButtonProps = { children: ReactNode };

export const LoadProjectButton = ({ children }: LoadProjectButtonProps) => {
  const navigate = useNavigate();
  const loaderRef = useLoaderRef();
  const projectLoad = useProjectLoad();
  const { t } = useTranslation(['loader']);

  const handleClick = async (projectDirName?: string) => {
    projectLoad(
      { projectDirName },
      () => {
        loaderRef.current.close();
        navigate('/dashboard');
      },
      ({ errorMessage }) => loaderRef.current.setError('loading_project_error', errorMessage),
      (count) => loaderRef.current.setError('loading_project_error', t('loader:integrity_message', { count }), true)
    );
  };

  useEffect(
    () =>
      window.api.startupStudioFile(
        {},
        ({ projectPath }) => {
          if (projectPath) handleClick(projectPath);
        },
        () => {}
      ),
    []
  );

  return <SecondaryButton onClick={() => handleClick()}>{children}</SecondaryButton>;
};
