import React from 'react';
import { ReactComponent as PlusIcon } from '@assets/icons/global/plus-icon.svg';
import { SecondaryButton } from './GenericButtons';
import styled from 'styled-components';
import { ToolTipContainerForButton, ToolTipForResponsive, ToolTipProps } from '@components/Tooltip';

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

  @media ${({ theme, breakpoint }) => (breakpoint ? breakpoint : theme.breakpoints.dataBox422)} {
    padding: 12px 16px 12px 16px;

    & span {
      display: none;
    }
  }
`;

type SecondaryButtonWithPlusIconResponsiveProps = {
  tooltip: ToolTipProps;
  breakpoint?: string;
} & SecondaryButtonWithPlusIconProps;

export const SecondaryButtonWithPlusIconResponsive = ({
  children,
  disabled,
  tooltip,
  breakpoint,
  ...props
}: SecondaryButtonWithPlusIconResponsiveProps) => (
  <ToolTipContainerForButton>
    <ToolTipForResponsive top={tooltip.top} right={tooltip.right} bottom={tooltip.bottom} left={tooltip.left}>
      <span>{children}</span>
    </ToolTipForResponsive>
    <SecondaryButtonIconResponsiveContainer disabled={disabled} breakpoint={breakpoint} {...props}>
      <PlusIcon />
      <span>{children}</span>
    </SecondaryButtonIconResponsiveContainer>
  </ToolTipContainerForButton>
);
