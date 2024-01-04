import React from 'react';

import { PrimaryButton } from './GenericButtons';
import { useNavigate } from 'react-router-dom';
import { useLoaderRef } from '@utils/loaderContext';
import { useProjectLoad } from '@utils/useProjectLoad';
import { useProjectNew } from '@utils/useProjectNew';
import { useTranslation } from 'react-i18next';
import type { NewProjectData } from '@utils/useProjectNew/types';

type NewProjectButtonProps = {
  newProjectData: Omit<NewProjectData, 'clone'>;
  disabled: boolean;
  closeDialog: () => void;
};

export const NewProjectButton = ({ newProjectData, disabled, closeDialog }: NewProjectButtonProps) => {
  const loaderRef = useLoaderRef();
  const projectNew = useProjectNew();
  const projectLoad = useProjectLoad();
  const navigate = useNavigate();
  const { t } = useTranslation(['loader', 'homepage']);

  const handleClick = async () => {
    projectNew(
      newProjectData,
      ({ projectDirName }) => {
        projectLoad(
          { projectDirName },
          () => {
            loaderRef.current.close();
            navigate('/dashboard');
          },
          ({ errorMessage }) => loaderRef.current.setError('loading_project_error', errorMessage),
          (count) => loaderRef.current.setError('loading_project_error', t('loader:integrity_message', { count }), true)
        );
      },
      ({ errorMessage }) => loaderRef.current.setError('creating_project_error', errorMessage)
    );
  };
  return (
    <PrimaryButton disabled={disabled} onClick={handleClick}>
      {t('homepage:create_my_project')}
    </PrimaryButton>
  );
};
