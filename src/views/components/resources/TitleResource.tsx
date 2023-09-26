import { Toggle } from '@components/inputs';
import React from 'react';
import styled from 'styled-components';

const TitleResourceContainer = styled.div`
  display: flex;
  justify-content: space-between;
  user-select: none;

  .title {
    ${({ theme }) => theme.fonts.titlesHeadline4}
  }
`;

type TitleResourceProps = {
  title: string;
};

export const TitleResource = ({ title }: TitleResourceProps) => {
  return (
    <TitleResourceContainer>
      <span className="title">{title}</span>
    </TitleResourceContainer>
  );
};

const TitleResourceWithToggleContainer = styled(TitleResourceContainer)`
  .toggle {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 8px 12px;
    gap: 16px;
    box-sizing: border-box;
    height: 35px;
    background: ${({ theme }) => theme.colors.dark14};
    border: 1px solid ${({ theme }) => theme.colors.dark20};
    border-radius: 4px;
    ${({ theme }) => theme.fonts.normalRegular};
  }
`;

type TitleResourceWithToggleProps = {
  isShow: boolean;
  onShow: (b: boolean) => void;
  toggleText: string;
} & TitleResourceProps;

export const TitleResourceWithToggle = ({ title, isShow, toggleText, onShow }: TitleResourceWithToggleProps) => {
  return (
    <TitleResourceWithToggleContainer>
      <span className="title">{title}</span>
      <div className="toggle">
        <span>{toggleText}</span>
        <Toggle name="show-resource" checked={isShow} onChange={(event) => onShow(event.target.checked)} />
      </div>
    </TitleResourceWithToggleContainer>
  );
};
