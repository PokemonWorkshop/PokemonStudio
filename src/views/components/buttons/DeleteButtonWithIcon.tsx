import React from 'react';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { DeleteButton } from './GenericButtons';

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
