import React from 'react';
import { BaseIcon } from '@components/icons/BaseIcon';
import theme from '@src/AppTheme';
import { DarkButton } from './GenericButtons';
import styled from 'styled-components';

type ClearButtonOnlyIconProps = Omit<Parameters<typeof DarkButton>[0], 'theme'>;

const ClearButtonOnlyIconContainer = styled(DarkButton)`
  padding: 0 10px;

  & div {
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 12px;
    }
  }
`;

export const ClearButtonOnlyIcon = ({ disabled, ...props }: ClearButtonOnlyIconProps) => {
  const color = disabled ? theme.colors.text700 : theme.colors.text400;

  return (
    <ClearButtonOnlyIconContainer disabled={disabled} {...props}>
      <div>
        <BaseIcon icon="clear" size="s" color={color} />
      </div>
    </ClearButtonOnlyIconContainer>
  );
};
