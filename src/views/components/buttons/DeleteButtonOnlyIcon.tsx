import React from 'react';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { DeleteButton } from './GenericButtons';
import styled from 'styled-components';

type Size = 's' | 'm';
type DeleteButtonOnlyIconContainerProps = {
  size: Size;
};

const DeleteButtonOnlyIconContainer = styled(DeleteButton)<DeleteButtonOnlyIconContainerProps>`
  padding: 0 10px;
  width: ${({ size }) => (size === 's' ? '32px' : '40px')};
  height: ${({ size }) => (size === 's' ? '32px' : '40px')};

  & div {
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 18px;
    }
  }
`;

type DeleteButtonOnlyIconProps = {
  size?: Size;
} & Omit<Parameters<typeof DeleteButton>[0], 'theme'>;

export const DeleteButtonOnlyIcon = ({ size, disabled, ...props }: DeleteButtonOnlyIconProps) => {
  const color = disabled ? theme.colors.text700 : theme.colors.dangerBase;

  return (
    <DeleteButtonOnlyIconContainer size={size || 'm'} disabled={disabled} {...props}>
      <BaseIcon icon="delete" size="s" color={color} />
    </DeleteButtonOnlyIconContainer>
  );
};
