import React, { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import { SecondaryButton } from '../GenericButtons';
import { useLoaderRef } from '@utils/loaderContext';
import { useProjectLoad } from '@utils/useProjectLoad';
import { useTranslation } from 'react-i18next';

type LoadProjectButtonProps = { children: ReactNode };

export const LoadProjectButton = ({ children }: LoadProjectButtonProps) => {
  const history = useHistory();
  const loaderRef = useLoaderRef();
  const projectLoad = useProjectLoad();
  const { t } = useTranslation(['loader']);

  const handleClick = async () => {
    projectLoad(
      {},
      () => {
        loaderRef.current.close();
        history.push('/dashboard');
      },
      ({ errorMessage }) => loaderRef.current.setError('loading_project_error', errorMessage),
      (count) => loaderRef.current.setError('loading_project_error', t('loader:integrity_message', { count }), true)
    );
  };

  return <SecondaryButton onClick={handleClick}>{children}</SecondaryButton>;
};
