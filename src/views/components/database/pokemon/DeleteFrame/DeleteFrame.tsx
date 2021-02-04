import React, { FunctionComponent, useContext } from 'react';
import { ThemeContext } from 'styled-components';
import { DeleteButton } from '../../../buttons/DeleteButton';
import { BaseIcon } from '../../../icons/BaseIcon';
import { DeleteFrameStlye } from './DeleteFrameStyle';

export const DeleteFrame: FunctionComponent = () => {
  const theme = useContext(ThemeContext);
  return (
    <DeleteFrameStlye>
      <h2>Suppression</h2>
      <DeleteButton>
        <BaseIcon icon="delete" size="s" color={theme.colors.dangerBase} />
        <span>Supprimer ce pokémon</span>
      </DeleteButton>
    </DeleteFrameStlye>
  );
};
