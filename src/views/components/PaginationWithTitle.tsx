import styled from 'styled-components';
import { ReactComponent as LeftIcon } from '@assets/icons/global/navigation-arrow-big-left.svg';
import { ReactComponent as RightIcon } from '@assets/icons/global/navigation-arrow-big-right.svg';
import React from 'react';

const PaginationWithTitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.dark18};
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.text400};
  padding: 8px;
  ${({ theme }) => theme.fonts.normalMedium};
  line-height: 24px;

  & span {
    max-width: 196px;
    overflow: hidden;
    color: ${({ theme }) => theme.colors.text100};
  }

  & svg:hover {
    color: ${({ theme }) => theme.colors.text100};
    cursor: pointer;
  }
`;

export type PaginationWithTitleProps = {
  title: string;
  onChangeIndex: (arrow: 'left' | 'right') => void;
};

export const PaginationWithTitle = ({ title, onChangeIndex }: PaginationWithTitleProps) => {
  const onClickLeft: React.MouseEventHandler<SVGSVGElement> = (event) => {
    event.stopPropagation();
    onChangeIndex('left');
  };

  const onClickRight: React.MouseEventHandler<SVGSVGElement> = (event) => {
    event.stopPropagation();
    onChangeIndex('right');
  };

  return (
    <PaginationWithTitleContainer>
      <LeftIcon onClick={onClickLeft} />
      <span>{title}</span>
      <RightIcon onClick={onClickRight} />
    </PaginationWithTitleContainer>
  );
};
