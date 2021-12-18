import React, { FunctionComponent, ReactNode, useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as UpIcon } from '@assets/icons/global/up-icon.svg';
import { ReactComponent as DownIcon } from '@assets/icons/global/down-icon.svg';
import { InputWithLeftLabelContainer, InputWithTopLabelContainer } from '.';

type CollapseGroupTitleStyleProps = {
  title: string;
  collapse: boolean;
  onClick: () => void;
};

type InputGroupCollapseProps = {
  title: string;
  children?: ReactNode;
  gap?: string;
  collapseByDefault?: true;
};

const CollapseGroupTitleStyle = styled.span`
  display: flex;
`;

const ArrowStyle = styled.div`
  padding: 8px;
  color: ${({ theme }) => theme.colors.text400};
`;

type CollapseGroupTitleContainerProps = {
  collapse: boolean;
};

const CollapseGroupTitleContainer = styled.div<CollapseGroupTitleContainerProps>`
  display: flex;
  width: 228px;
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

const CollapseGroupTitle: FunctionComponent<CollapseGroupTitleStyleProps> = ({ title, collapse, onClick }: CollapseGroupTitleStyleProps) => {
  return (
    <CollapseGroupTitleContainer onClick={onClick} collapse={collapse}>
      <CollapseGroupTitleStyle>{title}</CollapseGroupTitleStyle>
      <ArrowStyle>{collapse ? <UpIcon /> : <DownIcon />}</ArrowStyle>
    </CollapseGroupTitleContainer>
  );
};

type CollapseGroupChildrenProps = {
  gap?: string;
  collapse: boolean;
};

const CollapseGroupChildren = styled.div<CollapseGroupChildrenProps>`
  display: flex;
  flex-direction: column;
  gap: ${({ gap }) => gap || '12px'};
  margin-bottom: ${({ collapse }) => (collapse ? '16px' : '0')};
`;

const InputGroupCollapseContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;

  ${InputWithLeftLabelContainer}, ${InputWithTopLabelContainer} {
    width: 240px;
  }
`;

export const InputGroupCollapse: FunctionComponent<InputGroupCollapseProps> = ({
  title,
  children,
  gap,
  collapseByDefault,
}: InputGroupCollapseProps) => {
  const [collapse, setCollapse] = useState(collapseByDefault || false);
  const onClickedCollapse = () => {
    setCollapse(!collapse);
  };
  return (
    <InputGroupCollapseContainer>
      <CollapseGroupTitle title={title} collapse={collapse} onClick={onClickedCollapse} />
      {collapse && (
        <CollapseGroupChildren gap={gap} collapse={collapse}>
          {children}
        </CollapseGroupChildren>
      )}
    </InputGroupCollapseContainer>
  );
};
