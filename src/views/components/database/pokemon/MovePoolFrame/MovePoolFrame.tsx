import React, { FunctionComponent } from 'react';
import { SecondaryButton } from '../../../buttons/SecondaryButton';
import { MovePoolFrameStlye } from './MovePoolFrameStyle';

export const MovePoolFrame: FunctionComponent = () => {
  return (
    <MovePoolFrameStlye>
      <h2>Movepool</h2>
      <SecondaryButton>
        <span>Ouvrir l&apos;éditeur de movepool</span>
      </SecondaryButton>
    </MovePoolFrameStlye>
  );
};
