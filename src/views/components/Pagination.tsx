import React, { MouseEvent } from 'react';
import styled from 'styled-components';
import { ReactComponent as LeftIcon } from '@assets/icons/global/left-icon.svg';
import { ReactComponent as RightIcon } from '@assets/icons/global/right-icon.svg';

const PaginationContainer = styled.div`
  display: flex;
  width: 63px;
  height: 22px;
  align-items: center;
  padding: 2px;
  background-color: ${({ theme }) => theme.colors.dark20};
  border-radius: 4px;
  box-sizing: border-box;
  justify-content: space-between;
  user-select: none;

  & span {
    ${({ theme }) => theme.fonts.normalSmall}
    color: ${({ theme }) => theme.colors.text100};
  }
`;

const ArrowStyle = styled.button`
  padding: 4px;
  color: ${({ theme }) => theme.colors.text400};
  background: none;
  color: inherit;
  border: none;
  font: inherit;
  cursor: pointer;
  outline: inherit;
`;

export type PaginationProps = {
  index: number;
  max: number;
  onChangeIndex: (arrow: 'left' | 'right') => void;
};

export const Pagination = ({ index, max, onChangeIndex }: PaginationProps) => {
  const onClickLeft = (event: MouseEvent) => {
    event.stopPropagation();
    onChangeIndex('left');
  };

  const onClickRight = (event: MouseEvent) => {
    event.stopPropagation();
    onChangeIndex('right');
  };

  return (
    <PaginationContainer>
      <ArrowStyle onClick={onClickLeft}>
        <LeftIcon />
      </ArrowStyle>
      <span>
        {index + 1}/{max}
      </span>
      <ArrowStyle onClick={onClickRight}>
        <RightIcon />
      </ArrowStyle>
    </PaginationContainer>
  );
};
