import { DarkButton } from '@components/buttons';
import React from 'react';
import styled from 'styled-components';
import { ReactComponent as BackIcon } from '@assets/icons/global/back.svg';
import { SubPageTitleContainer, SubPageTitleProps } from './SubPageTitle';

type SubPageTitleWithIconProps = {
  icon: string;
} & SubPageTitleProps;

const BackIconWithIconContainer = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;

  & img {
    height: 32px;
    width: auto;
  }
`;

export const SubPageTitleWithIcon = ({ title, size, onClickedBack, icon }: SubPageTitleWithIconProps) => {
  return (
    <SubPageTitleContainer size={size || 'full'}>
      <DarkButton onClick={onClickedBack}>
        <BackIconWithIconContainer>
          <BackIcon />
          <img src={icon} />
        </BackIconWithIconContainer>
      </DarkButton>
      <h1>{title}</h1>
    </SubPageTitleContainer>
  );
};
