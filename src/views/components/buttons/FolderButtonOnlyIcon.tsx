import React from 'react';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { DarkButton } from './GenericButtons';
import styled from 'styled-components';

type FolderButtonOnlyIconProps = Omit<Parameters<typeof DarkButton>[0], 'theme'>;

const FolderButtonOnlyIconContainer = styled(DarkButton)`
  padding: 0 10px;

  & div {
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 15px;
    }
  }
`;

export const FolderButtonOnlyIcon = ({ disabled, ...props }: FolderButtonOnlyIconProps) => {
  const color = disabled ? theme.colors.text700 : theme.colors.text400;

  return (
    <FolderButtonOnlyIconContainer disabled={disabled} {...props}>
      <div>
        <BaseIcon icon="folder" size="s" color={color} />
      </div>
    </FolderButtonOnlyIconContainer>
  );
};
