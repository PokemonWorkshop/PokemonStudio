import { SecondaryButton } from '@components/buttons';
import { DashboardControlBar, DashboardFrame } from '@components/dashboard';
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
// Import des composants Chart.js
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Enregistrement des éléments nécessaires pour le donut chart
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

  // MOCK DATA
  const chartData = {
    labels: ['1', '2', '3', '4'],
    datasets: [
      {
        label: t('project_data'),
        data: [65, 59, 80, 45],
        backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: t('project_statistics'),
      },
    },
  };

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
            <DataBlockWithAction size="full" title={t('project_statistics')}>
              <ChartContainerStyle>
                <Doughnut data={chartData} options={chartOptions} />
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
