import React from 'react';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { DeleteButton } from './GenericButtons';
import styled from 'styled-components';
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
