import { SecondaryButton } from '@components/buttons';
import { DashboardControlBar, DashboardFrame } from '@components/dashboard';
import { DashboardPokedexChart } from '@components/dashboard/pokedexChart/DashboardPokedexChart';
import { DashboardEditorAndDeletionKeys, DashboardEditorOverlay } from '@components/dashboard/editors/DashboardEditorOverlay';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { Onboarding } from '@components/onboarding/Onboarding';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useProjectStudio } from '@hooks/useProjectStudio';
import { PageContainerStyle, PageDataConstrainerStyle } from '@pages/database/PageContainerStyle';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { DashboardPageStyle } from './DashboardPageStyle';

const DashboardContainerStyle = styled(PageContainerStyle)`
  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    display: flex;
  }
  width: calc(100% - 72px);
`;

export const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dialogsRef = useDialogsRef<DashboardEditorAndDeletionKeys>();
  const { projectStudioValues: projectStudio } = useProjectStudio();

  useEffect(() => {
    if (projectStudio.isTiledMode !== null) return;

    if (!dialogsRef.current?.currentDialog) dialogsRef.current?.openDialog('studio_mode_message_box', true);
  }, [dialogsRef, projectStudio]);

  return (
    <DashboardPageStyle>
      <DashboardControlBar dialogsRef={dialogsRef} />
      <DashboardContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <DashboardFrame />
          </DataBlockWrapper>
          <Onboarding />
          <DataBlockWrapper>
            <DashboardPokedexChart />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('project_settings')}>
              <SecondaryButton onClick={() => navigate('/dashboard/infos')}>{t('change_project_settings')}</SecondaryButton>
            </DataBlockWithAction>
          </DataBlockWrapper>
          <DashboardEditorOverlay ref={dialogsRef} />
        </PageDataConstrainerStyle>
      </DashboardContainerStyle>
    </DashboardPageStyle>
  );
};
