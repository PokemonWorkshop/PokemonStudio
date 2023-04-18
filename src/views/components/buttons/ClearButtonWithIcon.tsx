import React from 'react';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { DeleteButton } from './GenericButtons';
import styled from 'styled-components';
import { ToolTipContainerForButton, ToolTipForResponsive, ToolTipProps } from '@components/Tooltip';
import SvgContainer from '@components/icons/BaseIcon/SvgContainer';

const ClearButton = styled(DeleteButton)`
  ${SvgContainer} {
    display: flex;
    align-items: center;
    justify-content: center;

    & svg {
      width: 12px;
    }
  }
`;

type ClearButtonWithIconProps = Omit<Parameters<typeof DeleteButton>[0], 'theme'>;

export const ClearButtonWithIcon = ({ children, disabled, ...props }: ClearButtonWithIconProps) => {
  const color = disabled ? theme.colors.text700 : theme.colors.dangerBase;

  return (
    <ClearButton disabled={disabled} {...props}>
      <BaseIcon icon="clear" size="s" color={color} />
      <span>{children}</span>
    </ClearButton>
  );
};

type ClearButtonIconResponsiveContainerProps = {
  breakpoint?: string;
};

const ClearButtonIconResponsiveContainer = styled(ClearButton)<ClearButtonIconResponsiveContainerProps>`
  width: max-content;

  @media ${({ breakpoint }) => (breakpoint ? breakpoint : theme.breakpoints.dataBox422)} {
    padding: 12px 16px 12px 16px;

    & span {
      display: none;
    }
  }
`;

type ClearButtonWithIconResponsiveProps = {
  tooltip: ToolTipProps;
  breakpoint?: string;
} & ClearButtonWithIconProps;

export const ClearButtonWithIconResponsive = ({ children, disabled, tooltip, breakpoint, ...props }: ClearButtonWithIconResponsiveProps) => {
  const color = disabled ? theme.colors.text700 : theme.colors.dangerBase;

  return (
    <ToolTipContainerForButton>
      <ToolTipForResponsive top={tooltip.top} right={tooltip.right} bottom={tooltip.bottom} left={tooltip.left}>
        <span>{children}</span>
      </ToolTipForResponsive>
      <ClearButtonIconResponsiveContainer disabled={disabled} breakpoint={breakpoint} {...props}>
        <BaseIcon icon="clear" size="s" color={color} />
        <span>{children}</span>
      </ClearButtonIconResponsiveContainer>
    </ToolTipContainerForButton>
  );
};
