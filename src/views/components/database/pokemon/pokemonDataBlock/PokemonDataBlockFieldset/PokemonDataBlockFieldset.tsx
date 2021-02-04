import React, { FunctionComponent } from 'react';
import { PokemonDataBlockFieldsetProps } from './PokemonDataBlockFieldsetPropsInterface';
import { PokemonDataBlockFieldsetStyle } from './PokemonDataBlockFieldsetStyle';

export const PokemonDataBlockFieldset: FunctionComponent<PokemonDataBlockFieldsetProps> = (
  props: PokemonDataBlockFieldsetProps
) => {
  const { children, size } = props;
  return (
    <PokemonDataBlockFieldsetStyle size={size}>
      {children}
    </PokemonDataBlockFieldsetStyle>
  );
};
