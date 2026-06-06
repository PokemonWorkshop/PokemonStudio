import EditIcon from '@assets/icons/global/edit-icon.svg';
import ImportIcon from '@assets/icons/global/import-icon.svg';
import PlusIcon from '@assets/icons/global/plus-icon.svg';
import QuestionMarkIcon from '@assets/icons/global/question-mark-icon.svg';
import ReOrderIcon from '@assets/icons/global/reorder.svg';
import React from 'react';
import styled from 'styled-components';
import { DarkButton, SecondaryButton } from './GenericButtons';

type DarkButtonWithPlusIconProps = Omit<Parameters<typeof SecondaryButton>[0], 'theme'>;

export const DarkButtonWithPlusIcon = ({ children, disabled, ...props }: DarkButtonWithPlusIconProps) => (
  <DarkButton disabled={disabled} {...props}>
    <PlusIcon />
    <span>{children}</span>
  </DarkButton>
);

type DarkButtonIconResponsiveContainerProps = {
  breakpoint?: string;
};

const DarkButtonIconResponsiveContainer = styled(DarkButton)<DarkButtonIconResponsiveContainerProps>`
  width: max-content;

  & span,
  & svg {
    pointer-events: none;
  }

  @media ${({ theme, breakpoint }) => (breakpoint ? breakpoint : theme.breakpoints.dataBox422)} {
    padding: 12px 16px 12px 16px;

    & span {
      display: none;
    }
  }
`;

type DarkButtonWithPlusIconResponsiveProps = {
  breakpoint?: string;
} & DarkButtonWithPlusIconProps;

export const DarkButtonWithPlusIconResponsive = ({ children, disabled, breakpoint, ...props }: DarkButtonWithPlusIconResponsiveProps) => (
  <DarkButtonIconResponsiveContainer disabled={disabled} breakpoint={breakpoint} {...props}>
    <PlusIcon />
    <span>{children}</span>
  </DarkButtonIconResponsiveContainer>
);

export const DarkButtonImportResponsive = ({ children, disabled, breakpoint, ...props }: DarkButtonWithPlusIconResponsiveProps) => (
  <DarkButtonIconResponsiveContainer disabled={disabled} breakpoint={breakpoint} {...props}>
    <ImportIcon />
    <span>{children}</span>
  </DarkButtonIconResponsiveContainer>
);

export const DarkButtonReOrderResponsive = ({ children, disabled, breakpoint, ...props }: DarkButtonWithPlusIconResponsiveProps) => (
  <DarkButtonIconResponsiveContainer disabled={disabled} breakpoint={breakpoint} {...props}>
    <ReOrderIcon />
    <span>{children}</span>
  </DarkButtonIconResponsiveContainer>
);

export const DarkButtonEditResponsive = ({ children, disabled, ...props }: DarkButtonWithPlusIconResponsiveProps) => (
  <DarkButton disabled={disabled} {...props}>
    <EditIcon />
    <span>{children}</span>
  </DarkButton>
);

export const DarkButtonQuestionMarkResponsive = ({ children, disabled, ...props }: DarkButtonWithPlusIconResponsiveProps) => (
  <DarkButton disabled={disabled} {...props}>
    <QuestionMarkIcon />
    <span>{children}</span>
  </DarkButton>
);
