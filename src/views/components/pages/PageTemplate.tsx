import React, { ReactNode } from 'react';
import { DataBlockWrapper } from '@components/database/dataBlocks';
import { PageContainerStyle, PageDataConstrainerStyle } from '@pages/database/PageContainerStyle';
import { SubPageTitle } from '@components/pages/SubPageTitle';
import { DashboardPageStyle } from '@pages/dashboard/DashboardPageStyle';
import styled from 'styled-components';

type PageTemplateContainerProps = {
  size: 'full' | 'half' | 'fourth' | 'default';
};

type PageTemplateProps = {
  title: string;
  size: PageTemplateContainerProps['size'];
  children: ReactNode | ReactNode[];
  onClickBack?: () => void;
};

const PageTemplateContainer = styled.div<PageTemplateContainerProps>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: ${({ theme, size }) => theme.sizes[size].max}px;
  min-width: ${({ theme, size }) => theme.sizes[size].min}px;
  width: calc(${({ theme, size }) => theme.sizes[size].middle}% - 16px);
`;

export const PageTemplate = ({ title, size, children, onClickBack }: PageTemplateProps) => (
  <DashboardPageStyle>
    <PageContainerStyle>
      <PageDataConstrainerStyle>
        <DataBlockWrapper>
          <SubPageTitle title={title} size={size} onClickedBack={onClickBack} />
          <PageTemplateContainer size={size}>{children}</PageTemplateContainer>
        </DataBlockWrapper>
      </PageDataConstrainerStyle>
    </PageContainerStyle>
  </DashboardPageStyle>
);
