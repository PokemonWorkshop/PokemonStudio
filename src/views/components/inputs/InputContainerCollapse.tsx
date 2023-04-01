import React, { FunctionComponent, ReactNode, useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as UpIcon } from '@assets/icons/global/up-icon.svg';
import { ReactComponent as DownIcon } from '@assets/icons/global/down-icon.svg';
import { ReactComponent as DeleteIcon } from '@assets/icons/global/delete-icon.svg';

type CollapseGroupTitleStyleProps = {
  title: string;
  collapse: boolean;
  onClick: () => void;
  onDelete?: () => void;
};

type InputGroupCollapseProps = {
  title: string;
  children?: ReactNode;
  gap?: string;
  noMargin?: true;
  collapseByDefault?: true;
  onDelete?: () => void;
};

const CollapseGroupTitleStyle = styled.span`
  display: flex;
`;

const IconContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  color: ${({ theme }) => theme.colors.text400};

  .delete-icon:hover {
    color: ${({ theme }) => theme.colors.text100};
  }
`;

type CollapseGroupTitleContainerProps = {
  collapse: boolean;
};

const CollapseGroupTitleContainer = styled.div<CollapseGroupTitleContainerProps>`
  display: flex;
  min-width: 228px;
  width: calc(100% - 32px);
  height: 40px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.dark18};
  border-radius: 4px;
  padding: 0 16px;
  margin-bottom: ${({ collapse }) => (collapse ? '24px' : '0')};
  font-size: 14px;
  cursor: pointer;
`;

const CollapseGroupTitle: FunctionComponent<CollapseGroupTitleStyleProps> = ({
  title,
  collapse,
  onClick,
  onDelete,
}: CollapseGroupTitleStyleProps) => {
  return (
    <CollapseGroupTitleContainer onClick={onClick} collapse={collapse}>
      <CollapseGroupTitleStyle>{title}</CollapseGroupTitleStyle>
      {
        <IconContainer>
          {onDelete ? (
            <DeleteIcon
              className="delete-icon"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
            />
          ) : (
            <></>
          )}
          {collapse ? <UpIcon /> : <DownIcon />}
        </IconContainer>
      }
    </CollapseGroupTitleContainer>
  );
};

type CollapseGroupChildrenProps = {
  gap?: string;
  noMargin: boolean;
  collapse: boolean;
};

const CollapseGroupChildren = styled.div<CollapseGroupChildrenProps>`
  display: flex;
  flex-direction: column;
  gap: ${({ gap }) => gap || '12px'};
  margin-bottom: ${({ collapse, noMargin }) => (collapse && !noMargin ? '16px' : '0')};
  width: calc(100% - 32px);
  min-width: 240px;
`;

const InputGroupCollapseContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
`;

export const InputGroupCollapse: FunctionComponent<InputGroupCollapseProps> = ({
  title,
  children,
  gap,
  noMargin,
  collapseByDefault,
  onDelete,
}: InputGroupCollapseProps) => {
  const [collapse, setCollapse] = useState(collapseByDefault || false);
  const onClickedCollapse = () => {
    setCollapse(!collapse);
  };
  return (
    <InputGroupCollapseContainer>
      <CollapseGroupTitle title={title} collapse={collapse} onClick={onClickedCollapse} onDelete={onDelete} />
      {collapse && (
        <CollapseGroupChildren gap={gap} noMargin={noMargin || false} collapse={collapse}>
          {children}
        </CollapseGroupChildren>
      )}
    </InputGroupCollapseContainer>
  );
};
