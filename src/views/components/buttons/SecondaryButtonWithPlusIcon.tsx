import React from 'react';
import { ReactComponent as PlusIcon } from '@assets/icons/global/plus-icon.svg';
import { SecondaryButton } from './GenericButtons';
import styled from 'styled-components';

type SecondaryButtonWithPlusIconProps = Omit<Parameters<typeof SecondaryButton>[0], 'theme'>;

export const SecondaryButtonWithPlusIcon = ({ children, disabled, ...props }: SecondaryButtonWithPlusIconProps) => (
  <SecondaryButton disabled={disabled} {...props}>
    <PlusIcon />
    <span>{children}</span>
  </SecondaryButton>
);

type SecondaryButtonIconResponsiveContainerProps = {
  breakpoint?: string;
};

const SecondaryButtonIconResponsiveContainer = styled(SecondaryButton)<SecondaryButtonIconResponsiveContainerProps>`
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

type SecondaryButtonWithPlusIconResponsiveProps = {
  breakpoint?: string;
} & SecondaryButtonWithPlusIconProps;

export const SecondaryButtonWithPlusIconResponsive = ({ children, disabled, breakpoint, ...props }: SecondaryButtonWithPlusIconResponsiveProps) => (
  <SecondaryButtonIconResponsiveContainer disabled={disabled} breakpoint={breakpoint} {...props}>
    <PlusIcon />
    <span>{children}</span>
  </SecondaryButtonIconResponsiveContainer>
);
