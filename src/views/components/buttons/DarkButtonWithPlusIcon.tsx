import React from 'react';
import { ReactComponent as PlusIcon } from '@assets/icons/global/plus-icon.svg';
import { ReactComponent as ImportIcon } from '@assets/icons/global/import-icon.svg';
import { SecondaryButton, DarkButton } from './GenericButtons';
import styled from 'styled-components';

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
