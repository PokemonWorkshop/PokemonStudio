import { DarkButton } from '@components/buttons';
import React from 'react';
import styled from 'styled-components';
import { ReactComponent as BackIcon } from '@assets/icons/global/back.svg';

type SubPageTitleContainerProps = {
  size: 'full' | 'half' | 'fourth' | 'default';
  hasBack: boolean;
};

export const SubPageTitleContainer = styled.div<SubPageTitleContainerProps>`
  display: flex;
  gap: 32px;
  padding: 16px 0 24px ${({ hasBack }) => (hasBack ? 0 : '24px')};
  margin: 0 8px 16px 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark16};
  max-width: ${({ theme, size }) => theme.sizes[size].max}px;
  min-width: ${({ theme, size }) => theme.sizes[size].min}px;
  width: calc(${({ theme, size }) => theme.sizes[size].middle}% - 16px);
  user-select: none;

  ${DarkButton} {
    min-width: 48px;
    height: 48px;
  }
`;

export type SubPageTitleProps = {
  title: string;
  size?: 'full' | 'half' | 'fourth' | 'default';
  onClickedBack?: () => void;
};

export const SubPageTitle = ({ title, size, onClickedBack }: SubPageTitleProps) => {
  return (
    <SubPageTitleContainer size={size || 'full'} hasBack={!!onClickedBack}>
      {onClickedBack && (
        <DarkButton onClick={onClickedBack}>
          <BackIcon />
        </DarkButton>
      )}
      <h1>{title}</h1>
    </SubPageTitleContainer>
  );
};
