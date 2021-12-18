import React from 'react';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { DeleteButton } from './GenericButtons';
import styled from 'styled-components';
import { ToolTipContainerForButton, ToolTipForResponsive, ToolTipProps } from '@components/Tooltip';

type DeleteButtonWithIconProps = Omit<Parameters<typeof DeleteButton>[0], 'theme'>;

export const DeleteButtonWithIcon = ({ children, disabled, ...props }: DeleteButtonWithIconProps) => {
  const color = disabled ? theme.colors.text700 : theme.colors.dangerBase;

  return (
    <DeleteButton disabled={disabled} {...props}>
      <BaseIcon icon="delete" size="s" color={color} />
      <span>{children}</span>
    </DeleteButton>
  );
};

type DeleteButtonIconResponsiveContainerProps = {
  breakpoint?: string;
};

const DeleteButtonIconResponsiveContainer = styled(DeleteButton)<DeleteButtonIconResponsiveContainerProps>`
  width: max-content;

  @media ${({ breakpoint }) => (breakpoint ? breakpoint : theme.breakpoints.dataBox422)} {
    padding: 12px 16px 12px 16px;

    & span {
      display: none;
    }
  }
`;

type DeleteButtonWithIconResponsiveProps = {
  tooltip: ToolTipProps;
  breakpoint?: string;
} & DeleteButtonWithIconProps;

export const DeleteButtonWithIconResponsive = ({ children, disabled, tooltip, breakpoint, ...props }: DeleteButtonWithIconResponsiveProps) => {
  const color = disabled ? theme.colors.text700 : theme.colors.dangerBase;

  return (
    <ToolTipContainerForButton>
      <ToolTipForResponsive top={tooltip.top} right={tooltip.right} bottom={tooltip.bottom} left={tooltip.left}>
        <span>{children}</span>
      </ToolTipForResponsive>
      <DeleteButtonIconResponsiveContainer disabled={disabled} breakpoint={breakpoint} {...props}>
        <BaseIcon icon="delete" size="s" color={color} />
        <span>{children}</span>
      </DeleteButtonIconResponsiveContainer>
    </ToolTipContainerForButton>
  );
};
