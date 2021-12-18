import { SecondaryButton } from '@components/buttons';
import { DataBlockWithAction, DataBlockWrapper } from '@components/database/dataBlocks';
import { PageContainerStyle, PageDataConstrainerStyle } from '@pages/database/PageContainerStyle';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { DashboardFrame } from '../../components/dashboard';
import { DashboardPageStyle } from './DashboardPageStyle';

const DashboardContainerStyle = styled(PageContainerStyle)`
  @media ${({ theme }) => theme.breakpoints.dataBox422} {
    display: flex;
  }
`;

export const DashboardPage = () => {
  const { t } = useTranslation('dashboard');
  const history = useHistory();
  return (
    <DashboardPageStyle>
      <DashboardContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <DashboardFrame />
          </DataBlockWrapper>
          <DataBlockWrapper>
            <DataBlockWithAction size="full" title={t('project_settings')}>
              <SecondaryButton onClick={() => history.push('/dashboard/infos')}>{t('change_project_settings')}</SecondaryButton>
            </DataBlockWithAction>
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </DashboardContainerStyle>
    </DashboardPageStyle>
  );
};
