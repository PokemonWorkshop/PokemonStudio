import React from 'react';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { DarkButton } from './GenericButtons';
import styled from 'styled-components';

type Size = 's' | 'm';
type TuneButtonOnlyIconContainerProps = {
  size: Size;
};

export const TuneButtonOnlyIconContainer = styled(DarkButton)<TuneButtonOnlyIconContainerProps>`
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

type TuneButtonOnlyIconProps = {
  size?: Size;
  color?: string;
} & Omit<Parameters<typeof DarkButton>[0], 'theme'>;

export const TuneButtonOnlyIcon = ({ size, color, disabled, ...props }: TuneButtonOnlyIconProps) => {
  const svgColor = disabled ? theme.colors.text700 : color || theme.colors.text400;

  return (
    <TuneButtonOnlyIconContainer size={size || 'm'} disabled={disabled} {...props}>
      <div>
        <BaseIcon icon="tune" size="s" color={svgColor} />
      </div>
    </TuneButtonOnlyIconContainer>
  );
};
