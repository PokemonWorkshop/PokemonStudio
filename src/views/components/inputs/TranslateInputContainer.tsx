import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { ReactComponent as TranslateIcon } from '@assets/icons/global/translate.svg';

const TranslateInputContainerStyle = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;

  svg {
    position: absolute;
    top: 11px;
    right: 16px;
    display: none;
    color: ${({ theme }) => theme.colors.text500};
  }

  :hover svg {
    display: unset;
    cursor: pointer;
    background-color: ${({ theme }) => theme.colors.dark12};
  }

  & svg:hover {
    color: ${({ theme }) => theme.colors.text400};
  }
`;

type TranslateInputContainerProps = {
  onTranslateClick: () => void;
  children: ReactNode;
};

export const TranslateInputContainer = ({ onTranslateClick, children }: TranslateInputContainerProps) => {
  return (
    <TranslateInputContainerStyle>
      {children}
      <TranslateIcon onClick={onTranslateClick} />
    </TranslateInputContainerStyle>
  );
};
