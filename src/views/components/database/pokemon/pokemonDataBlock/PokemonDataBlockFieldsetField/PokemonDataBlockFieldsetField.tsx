import React, { FunctionComponent } from 'react';
import { PokemonDataBlockFieldsetFieldProps } from './PokemonDataBlockFieldsetFieldPropsInterface';
import { PokemonDataBlockFieldsetFieldStyle } from './PokemonDataBlockFieldsetFieldStyle';

export const PokemonDataBlockFieldsetField: FunctionComponent<PokemonDataBlockFieldsetFieldProps> = (
  props: PokemonDataBlockFieldsetFieldProps
) => {
  const { label, data, size } = props;
  return (
    <PokemonDataBlockFieldsetFieldStyle size={size}>
      <span>{label}</span>
      <span>{data}</span>
    </PokemonDataBlockFieldsetFieldStyle>
  );
};
