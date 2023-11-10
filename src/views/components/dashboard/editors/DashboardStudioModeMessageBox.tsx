import React, { useEffect, useState } from 'react';
import { useLoaderRef } from '@utils/loaderContext';
import { PrimaryButton, SecondaryButton } from '@components/buttons';
import { useProjectStudio } from '@utils/useProjectStudio';
import { useTranslation } from 'react-i18next';
import { useProjectLoad } from '@utils/useProjectLoad';
import { showNotification } from '@utils/showNotification';
import {
  MessageBoxActionContainer,
  MessageBoxContainer,
  MessageBoxIconContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from '@components/MessageBoxContainer';
import theme from '@src/AppTheme';
import { BaseIcon } from '@components/icons/BaseIcon';

type DashboardStudioModeMessageBoxState = 'select_mode' | 'save' | 'reload_project';

type DashboardStudioModeMessageBoxProps = {
  closeDialog: () => void;
};

export const DashboardStudioModeMessageBox = ({ closeDialog }: DashboardStudioModeMessageBoxProps) => {
  const loaderRef = useLoaderRef();
  const projectLoad = useProjectLoad();
  const [state, setState] = useState<DashboardStudioModeMessageBoxState>('select_mode');
  const [mode, setMode] = useState<'tiled' | 'rmxp' | undefined>(undefined);
  const { projectStudioValues: projectStudio, state: globalState } = useProjectStudio();
  const { t } = useTranslation(['loader', 'dashboard']);

  useEffect(() => {
    switch (state) {
      case 'select_mode':
        if (mode) return setState('save');
        return;
      case 'save':
        return window.api.writeProjectMetadata(
          { path: globalState.projectPath!, metaData: JSON.stringify({ ...projectStudio, isTiledMode: mode === 'tiled' }, null, 2) },
          () => setState('reload_project'),
          ({ errorMessage }) => {
            showNotification('danger', t('loader:saving_project_error'), errorMessage);
            closeDialog();
          }
        );
      case 'reload_project':
        return projectLoad(
          { projectDirName: globalState.projectPath! },
          () => {
            // we wait the end of the close dialog animation to close the loader
            setTimeout(() => loaderRef.current.close(), 200);
            closeDialog();
          },
          ({ errorMessage }) => loaderRef.current.setError('loading_project_error', errorMessage),
          (count) => loaderRef.current.setError('loading_project_error', t('loader:integrity_message', { count }), true)
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, mode]);

  return (
    <MessageBoxContainer>
      <MessageBoxTitleIconContainer>
        <MessageBoxIconContainer>
          <BaseIcon icon="map" size="s" color={theme.colors.primaryBase} />
        </MessageBoxIconContainer>
        <h3>{t('dashboard:title_studio_mode_message_box')}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        <p>{t('dashboard:message_studio_mode_message_box')}</p>
      </MessageBoxTextContainer>
      <MessageBoxActionContainer>
        <SecondaryButton onClick={() => setMode('rmxp')}>{t('dashboard:button_use_rmxp')}</SecondaryButton>
        <PrimaryButton onClick={() => setMode('tiled')}>{t('dashboard:button_use_tiled')}</PrimaryButton>
      </MessageBoxActionContainer>
    </MessageBoxContainer>
  );
};
