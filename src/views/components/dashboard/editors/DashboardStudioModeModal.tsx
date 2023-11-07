import React, { useEffect, useState } from 'react';
import { Dialog } from '@components/Dialog';
import { useLoaderRef } from '@utils/loaderContext';
import styled from 'styled-components';
import { SecondaryButton } from '@components/buttons';
import { useProjectStudio } from '@utils/useProjectStudio';
import { useTranslation } from 'react-i18next';
import { useProjectLoad } from '@utils/useProjectLoad';
import { showNotification } from '@utils/showNotification';

const DashboardStudioModeModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;

  .message {
    display: flex;
    //align-items: center;
    //justify-content: center;
    //height: 100%;
    user-select: none;

    ${({ theme }) => theme.fonts.normalRegular}
    color: ${({ theme }) => theme.colors.text400};
  }

  .bottom {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    user-select: none;

    .right-action {
      display: flex;
      flex-direction: row;
      gap: 24px;
      align-items: center;
    }
  }
`;

type DashboardStudioModeModalState = 'select_mode' | 'save' | 'reload_project';

type DashboardStudioModeModalProps = {
  closeDialog: () => void;
};

export const DashboardStudioModeModal = ({ closeDialog }: DashboardStudioModeModalProps) => {
  const loaderRef = useLoaderRef();
  const projectLoad = useProjectLoad();
  const [state, setState] = useState<DashboardStudioModeModalState>('select_mode');
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
    <Dialog title={'Choix du mode de Pokémon Studio'} subTitle={'Choisissez le mode'}>
      <DashboardStudioModeModalContainer>
        <div className="message">Bienvenue dans la version 2.0 ou supérieur de l&apos;application. etc.</div>
        <div className="bottom">
          <div className="right-action">
            <SecondaryButton onClick={() => setMode('rmxp')}>Mode RMXP</SecondaryButton>
            <SecondaryButton onClick={() => setMode('tiled')}>Mode Tiled</SecondaryButton>
          </div>
        </div>
      </DashboardStudioModeModalContainer>
    </Dialog>
  );
};
