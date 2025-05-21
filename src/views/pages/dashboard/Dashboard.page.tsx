import { SecondaryButton } from '@components/buttons';
import { DashboardControlBar, DashboardFrame } from '@components/dashboard';
import { DashboardEditorAndDeletionKeys, DashboardEditorOverlay } from '@components/dashboard/editors/DashboardEditorOverlay';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { Onboarding } from '@components/onboarding/Onboarding';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { useProjectStudio } from '@hooks/useProjectStudio';
import { PageContainerStyle, PageDataConstrainerStyle } from '@pages/database/PageContainerStyle';
import { useDashboardChart } from '@src/hooks/useDashboardChart';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React, { useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { DashboardPageStyle } from './DashboardPageStyle';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardContainerStyle = styled(PageContainerStyle)`
  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    display: flex;
  }
  width: calc(100% - 72px);
`;

const ChartContainerStyle = styled.div`
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  padding: 15px;
`;

export const DashboardPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dialogsRef = useDialogsRef<DashboardEditorAndDeletionKeys>();
  const { projectStudioValues: projectStudio } = useProjectStudio();
  const { getPokemonTypeChartSettings } = useDashboardChart();

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
            <DataBlockWithAction size="full" title={'Graphique des types du pokédex'}>
              <ChartContainerStyle>
                <Doughnut data={getPokemonTypeChartSettings().chartData} options={getPokemonTypeChartSettings().chartOptions} />
              </ChartContainerStyle>
            </DataBlockWithAction>
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
