import { useLoaderRef } from '@utils/loaderContext';
import { useProjectImportV2 } from '@utils/useProjectImportV2';
import { useProjectLoadV2 } from '@utils/useProjectLoadV2';
import React, { ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import { SecondaryButton } from './GenericButtons';

type ImportProjectButtonProps = {
  children: ReactNode;
};

export const ImportProjectButton = ({ children }: ImportProjectButtonProps) => {
  const projectImportV2 = useProjectImportV2();
  const projectLoadV2 = useProjectLoadV2();
  const history = useHistory();
  const loaderRef = useLoaderRef();

  const handleClick = async () => {
    projectImportV2(
      {},
      async ({ projectDirName }) => {
        projectLoadV2(
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
