import React, { useEffect, useState } from 'react';
import { useLoaderRef } from '@utils/loaderContext';
import { PrimaryButton } from '@components/buttons';
import { useProjectStudio } from '@hooks/useProjectStudio';
import { useTranslation } from 'react-i18next';
import { useProjectLoad } from '@hooks/useProjectLoad';
import {
  MessageBoxActionContainer,
  MessageBoxCancelLink,
  MessageBoxContainer,
  MessageBoxIconContainer,
  MessageBoxTextContainer,
  MessageBoxTitleIconContainer,
} from '@components/MessageBoxContainer';
import theme from '@src/AppTheme';
import { BaseIcon } from '@components/icons/BaseIcon';
import { useProjectSave } from '@hooks/useProjectSave';

type DashboardStudioModeMessageBoxState = 'select_mode' | 'save' | 'reload_project';

type DashboardStudioModeMessageBoxProps = {
  closeDialog: () => void;
};

export const DashboardStudioModeMessageBox = ({ closeDialog }: DashboardStudioModeMessageBoxProps) => {
  const loaderRef = useLoaderRef();
  const { save } = useProjectSave();
  const projectLoad = useProjectLoad();
  const [state, setState] = useState<DashboardStudioModeMessageBoxState>('select_mode');
  const [mode, setMode] = useState<'tiled' | 'rmxp' | undefined>(undefined);
  const { projectStudioValues: projectStudio, setProjectStudioValues: setProjectStudio, state: globalState } = useProjectStudio();
  const { t } = useTranslation();

  useEffect(() => {
    switch (state) {
      case 'select_mode':
        if (mode) {
          setProjectStudio({ ...projectStudio, isTiledMode: mode === 'tiled' });
          setState('save');
        }
        return;
      case 'save':
        return save(
          () => setState('reload_project'),
          ({ errorMessage }) => {
            loaderRef.current.setError('saving_project_error', errorMessage);
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
          (count) => loaderRef.current.setError('loading_project_error', t('integrity_message', { count }), true)
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
        <h3>{t('title_studio_mode_message_box')}</h3>
      </MessageBoxTitleIconContainer>
      <MessageBoxTextContainer>
        <p>{t('message_studio_mode_message_box')}</p>
        <p className="red" style={{ marginTop: '1rem' }}>
          {t('warning_message')}
        </p>
      </MessageBoxTextContainer>
      <MessageBoxActionContainer>
        <MessageBoxCancelLink onClick={() => (projectStudio?.isTiledMode === null ? setMode('rmxp') : closeDialog())}>
          {t('cancel')}
        </MessageBoxCancelLink>
        <PrimaryButton onClick={() => setMode('tiled')}>{t('button_use_tiled')}</PrimaryButton>
      </MessageBoxActionContainer>
    </MessageBoxContainer>
  );
};
