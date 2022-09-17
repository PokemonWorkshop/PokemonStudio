import React from 'react';
import styled from 'styled-components';
import { SelectCustom } from '.';
import { SelectCustomProps } from './SelectCustomPropsInterface';

const SelectCustomWithLabelContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  z-index: 10;

  & span {
    ${({ theme }) => theme.fonts.normalRegular};
    user-select: none;
  }
`;

type SelectCustomWithLabelProps = {
  label: string;
} & SelectCustomProps;

export const SelectCustomWithLabel = ({ label, ...props }: SelectCustomWithLabelProps) => {
  return (
    <SelectCustomWithLabelContainer>
      <span>{label}</span>
      <SelectCustom {...props} />
    </SelectCustomWithLabelContainer>
  );
};

type SelectCustomWithLabelResponsiveContainerProps = {
  breakpoint?: string;
};

const SelectCustomWithLabelResponsiveContainer = styled(SelectCustomWithLabelContainer)<SelectCustomWithLabelResponsiveContainerProps>`
  @media ${({ theme, breakpoint }) => (breakpoint ? breakpoint : theme.breakpoints.dataBox422)} {
    & span {
      display: none;
    }
  }
`;

type SelectCustomWithLabelResponsiveProps = {
  breakpoint?: string;
} & SelectCustomWithLabelProps;

export const SelectCustomWithLabelResponsive = ({ breakpoint, label, ...props }: SelectCustomWithLabelResponsiveProps) => {
  return (
    <SelectCustomWithLabelResponsiveContainer breakpoint={breakpoint}>
      <span>{label}</span>
      <SelectCustom {...props} />
    </SelectCustomWithLabelResponsiveContainer>
  );
};
