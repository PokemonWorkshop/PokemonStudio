import { useLoaderRef } from '@utils/loaderContext';
import { useProjectImport } from '@utils/useProjectImport';
import { useProjectLoad } from '@utils/useProjectLoad';
import React, { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import { SecondaryButton } from './GenericButtons';

type ImportProjectButtonProps = {
  children: ReactNode;
};

export const ImportProjectButton = ({ children }: ImportProjectButtonProps) => {
  const projectImport = useProjectImport();
  const projectLoad = useProjectLoad();
  const history = useHistory();
  const loaderRef = useLoaderRef();

  const handleClick = async () => {
    projectImport(
      {},
      async ({ projectDirName }) => {
        projectLoad(
          { projectDirName },
          () => {
            loaderRef.current.close();
            history.push('/dashboard');
          },
          ({ errorMessage }) => loaderRef.current.setError('loading_project_error', errorMessage)
        );
      },
      ({ errorMessage }) => loaderRef.current.setError('importing_project_error', errorMessage)
    );
  };

  return (
    <SecondaryButton disabled={window.api.platform !== 'win32'} onClick={handleClick}>
      {children}
    </SecondaryButton>
  );
};
