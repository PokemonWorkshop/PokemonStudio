import React, { ReactNode } from 'react';
import styled from 'styled-components';

const PageEmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 360px;
  gap: 32px;
  user-select: none;

  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80px;
    height: 80px;
    border-radius: 100%;
    background-color: ${({ theme }) => theme.colors.dark18};

    svg {
      color: ${({ theme }) => theme.colors.text400};
      width: 36px;
      height: 36px;
    }
  }

  .title-description {
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: ${({ theme }) => theme.colors.text100};

    .title {
      text-align: center;
      ${({ theme }) => theme.fonts.titlesHeadline4}
    }

    .description {
      text-align: center;
      color: ${({ theme }) => theme.fonts.normalRegular};
    }
  }
`;

type PageEmptyStateProps = {
  title: string;
  icon: ReactNode;
  description: string;
  children: ReactNode;
};

export const PageEmptyState = ({ title, icon, description, children }: PageEmptyStateProps) => {
  return (
    <PageEmptyStateContainer>
      <div className="icon">{icon}</div>
      <div className="title-description">
        <span className="title">{title}</span>
        <span className="description">{description}</span>
      </div>
      {children}
    </PageEmptyStateContainer>
  );
};
