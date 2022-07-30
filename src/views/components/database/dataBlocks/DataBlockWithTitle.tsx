import React, { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { DataBlockContainer, DataBlockContainerProps } from './DataBlockContainer';
import { ReactComponent as UpIcon } from '@assets/icons/global/up-icon.svg';
import { ReactComponent as DownIcon } from '@assets/icons/global/down-icon.svg';
import { Pagination, PaginationProps } from '@components/Pagination';

export type DataBlockWithTitleProps = {
  title: string;
  disabled?: boolean;
  // eslint-disable-next-line react/require-default-props
  children?: ReactNode;
  onClick?: () => void;
} & DataBlockContainerProps;

export const DataBlockWithTitleStyle = styled(DataBlockContainer)`
  h2 {
    user-select: none;
    margin-bottom: 20px;
  }

  & img {
    max-width: 32px;
    max-height: 32px;
  }

  // TODO: Remove h2 rule from global style & remove '#root ' from here!
  #root &[data-disabled='true'] h2 {
    color: ${({ theme }) => theme.colors.dark20};
  }
`;

export const DataBlockWithTitle = ({ title, size, children, disabled, onClick }: DataBlockWithTitleProps) => (
  <DataBlockWithTitleStyle size={size} data-disabled={disabled && 'true'} onClick={onClick}>
    <h2>{title}</h2>
    {children}
  </DataBlockWithTitleStyle>
);

export const DataBlockWithTitleNoActive = ({ title, size, children, disabled }: DataBlockWithTitleProps) => (
  <DataBlockWithTitleStyle size={size} data-disabled={disabled && 'true'} data-noactive>
    <h2>{title}</h2>
    {children}
  </DataBlockWithTitleStyle>
);

type DataBlockWithTitleCollapseStyleProps = {
  collapse: boolean;
};

const DataBlockWithTitleCollapseStyle = styled(DataBlockWithTitleStyle)<DataBlockWithTitleCollapseStyleProps>`
  h2 {
    margin-bottom: 0px;
  }
`;

const Wrap = styled.div<DataBlockWithTitleCollapseStyleProps>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ collapse }) => (collapse ? '16px' : '0px')};
  transition: 0.2s;
  cursor: pointer;
`;

const ArrowStyle = styled.div`
  padding: 8px;
  color: ${({ theme }) => theme.colors.text400};
`;

export const DataBlockWithTitleCollapse = ({ title, size, children, disabled }: DataBlockWithTitleProps) => {
  const [collapse, setCollapse] = useState(false);
  const onClickedCollapse = () => {
    setCollapse(!collapse);
  };
  return (
    <DataBlockWithTitleCollapseStyle size={size} data-disabled={disabled && 'true'} data-noactive collapse={collapse}>
      <Wrap collapse={collapse} onClick={onClickedCollapse}>
        <h2>{title}</h2>
        <ArrowStyle>{collapse ? <UpIcon /> : <DownIcon />}</ArrowStyle>
      </Wrap>
      {collapse ? children : <></>}
    </DataBlockWithTitleCollapseStyle>
  );
};

export type DataBlockWithTitlePaginationProps = DataBlockWithTitleProps & PaginationProps;

const DataBlockWithTitlePaginationStyle = styled(DataBlockWithTitleStyle)`
  & div.title-with-pagination {
    display: flex;
    justify-content: space-between;
  }

  & div.pagination {
    margin: 2px 0 0 0;
  }
`;

export const DataBlockWithTitlePagination = ({
  title,
  size,
  children,
  disabled,
  index,
  max,
  onChangeIndex,
  onClick,
}: DataBlockWithTitlePaginationProps) => {
  return (
    <DataBlockWithTitlePaginationStyle size={size} data-disabled={disabled && 'true'} onClick={onClick}>
      <div className="title-with-pagination">
        <h2>{title}</h2>
        {max > 1 && (
          <div className="pagination">
            <Pagination index={index} max={max} onChangeIndex={onChangeIndex} />
          </div>
        )}
      </div>
      {children}
    </DataBlockWithTitlePaginationStyle>
  );
};
