import React from 'react';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { DarkButton } from './GenericButtons';
import styled from 'styled-components';

type Size = 's' | 'm';
type EditButtonOnlyIconContainerProps = {
  size: Size;
};

export const EditButtonOnlyIconContainer = styled(DarkButton)<EditButtonOnlyIconContainerProps>`
  padding: 0 10px;
  width: ${({ size }) => (size === 's' ? '32px' : '40px')};
  height: ${({ size }) => (size === 's' ? '32px' : '40px')};

  & div {
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 14px;
    }
  }
`;

type EditButtonOnlyIconProps = {
  size?: Size;
  color?: string;
} & Omit<Parameters<typeof DarkButton>[0], 'theme'>;

export const EditButtonOnlyIcon = ({ size, color, disabled, ...props }: EditButtonOnlyIconProps) => {
  const svgColor = disabled ? theme.colors.text700 : color || theme.colors.text400;

  return (
    <EditButtonOnlyIconContainer size={size || 'm'} disabled={disabled} {...props}>
      <div>
        <BaseIcon icon="edit" size="s" color={svgColor} />
      </div>
    </EditButtonOnlyIconContainer>
  );
};
