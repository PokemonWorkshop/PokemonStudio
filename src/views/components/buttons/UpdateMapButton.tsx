import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import React from 'react';
import styled from 'styled-components';
import { DarkButton, SecondaryButton } from './GenericButtons';

type Size = 's' | 'm';
type UpdateMapButtonContainerProps = {
  size: Size;
};

const UpdateMapButtonContainer = styled(DarkButton)<UpdateMapButtonContainerProps>`
  padding: 0 10px;
  width: ${({ size }) => (size === 's' ? '32px' : '40px')};
  height: ${({ size }) => (size === 's' ? '32px' : '40px')};

  & div {
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;

    svg {
      width: 18px;
    }
  }
`;

type UpdateMapButtonnProps = {
  size?: Size;
  color?: string;
} & Omit<Parameters<typeof SecondaryButton>[0], 'theme'>;

export const UpdateMapButton = ({ size, color, disabled, ...props }: UpdateMapButtonnProps) => {
  const svgColor = disabled ? theme.colors.text700 : color || theme.colors.text400;

  return (
    <UpdateMapButtonContainer size={size || 'm'} disabled={disabled} {...props}>
      <BaseIcon icon="updateMap" size="s" color={svgColor} />
    </UpdateMapButtonContainer>
  );
};
