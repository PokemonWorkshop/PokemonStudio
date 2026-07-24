import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecondaryButton } from '../GenericButtons';
import { useLoaderRef } from '@utils/loaderContext';
import { useProjectLoad } from '@hooks/useProjectLoad';
import { playSound } from '@utils/sound';
import { useTranslation } from 'react-i18next';
import { RmxpMigrationDialog } from '@components/home/RmxpMigrationDialog';

type LoadProjectButtonProps = { children: ReactNode };

export const LoadProjectButton = ({ children }: LoadProjectButtonProps) => {
  const navigate = useNavigate();
  const loaderRef = useLoaderRef();
  const projectLoad = useProjectLoad();
  const { t } = useTranslation();
  const continueRef = useRef<(() => void) | null>(null);
  const [showRmxpDialog, setShowRmxpDialog] = useState(false);

  const handleClick = async (projectDirName?: string) => {
    projectLoad(
      { projectDirName },
      () => {
        loaderRef.current.close();
        playSound('sparkle');
        navigate('/dashboard');
      },
      ({ errorMessage }) => loaderRef.current.setError('loading_project_error', errorMessage),
      (count) => loaderRef.current.setError('loading_project_error', t('integrity_message', { count }), true),
      (onContinue) => {
        continueRef.current = onContinue;
        setShowRmxpDialog(true);
      },
    );
  };

  useEffect(
    () =>
      window.api.startupStudioFile(
        {},
        ({ projectPath }) => {
          if (projectPath) handleClick(projectPath);
        },
        () => {},
      ),
    [],
  );

  return (
    <>
      <SecondaryButton onClick={() => handleClick()}>{children}</SecondaryButton>
      {showRmxpDialog && (
        <RmxpMigrationDialog
          onContinue={() => continueRef.current?.()}
          closeDialog={() => setShowRmxpDialog(false)}
        />
      )}
    </>
  );
};
