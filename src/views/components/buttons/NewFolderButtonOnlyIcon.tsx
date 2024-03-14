import React from 'react';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { SecondaryButton } from './GenericButtons';
import styled from 'styled-components';

type Size = 's' | 'm';
type NewFolderButtonOnlyIconContainerProps = {
  size: Size;
};

const NewFolderButtonOnlyIconContainer = styled(SecondaryButton)<NewFolderButtonOnlyIconContainerProps>`
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

type NewFolderButtonOnlyIconProps = {
  size?: Size;
} & Omit<Parameters<typeof SecondaryButton>[0], 'theme'>;

export const NewFolderButtonOnlyIcon = ({ size, disabled, ...props }: NewFolderButtonOnlyIconProps) => {
  const color = disabled ? theme.colors.text700 : theme.colors.primaryBase;

  return (
    <NewFolderButtonOnlyIconContainer size={size || 'm'} disabled={disabled} {...props}>
      <BaseIcon icon="newFolder" size="s" color={color} />
    </NewFolderButtonOnlyIconContainer>
  );
};
