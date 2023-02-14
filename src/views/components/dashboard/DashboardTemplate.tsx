import React, { ReactNode } from 'react';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { PageContainerStyle, PageDataConstrainerStyle } from '@pages/database/PageContainerStyle';
import { SubPageTitle } from '@components/database/SubPageTitle';
import { useNavigate } from 'react-router-dom';
import { DashboardPageStyle } from '@pages/dashboard/DashboardPageStyle';
import styled from 'styled-components';

type DashboardTemplateProps = {
  title: string;
  children: ReactNode | ReactNode[];
};

type DashboardContainerProps = {
  size: 'full' | 'half' | 'fourth' | 'dashboard';
};

const DashboardContainer = styled.div<DashboardContainerProps>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: ${({ theme, size }) => theme.sizes[size].max}px;
  min-width: ${({ theme, size }) => theme.sizes[size].min}px;
  width: calc(${({ theme, size }) => theme.sizes[size].middle}% - 16px);
`;

export const DashboardTemplate = ({ title, children }: DashboardTemplateProps) => {
  const navigate = useNavigate();
  return (
    <DashboardPageStyle>
      <PageContainerStyle>
        <PageDataConstrainerStyle>
          <DataBlockWrapper>
            <SubPageTitle title={title} size="dashboard" onClickedBack={() => navigate('/dashboard')} />
            <DashboardContainer size="dashboard">{children}</DashboardContainer>
          </DataBlockWrapper>
        </PageDataConstrainerStyle>
      </PageContainerStyle>
    </DashboardPageStyle>
  );
};
