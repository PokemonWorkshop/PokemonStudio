import React, { FunctionComponent } from 'react';
import { PokemonDataBlockProps } from './PokemonDataBlockPropsInterface';
import { PokemonDataBlockStyle } from './PokemonDataBlockStyle';

export const PokemonDataBlock: FunctionComponent<PokemonDataBlockProps> = (
  props: PokemonDataBlockProps
) => {
  const { size = 's', children, title } = props;
  return (
    <PokemonDataBlockStyle size={size}>
      <h2>{title}</h2>
      {children}
    </PokemonDataBlockStyle>
  );
};
