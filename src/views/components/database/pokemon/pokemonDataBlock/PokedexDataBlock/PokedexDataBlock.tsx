import React, { FunctionComponent } from 'react';
import { PokemonDataBlock } from '../PokemonDataBlock';
import { PokemonDataBlockFieldset } from '../PokemonDataBlockFieldset';
import { PokemonDataBlockFieldsetField } from '../PokemonDataBlockFieldsetField';

export const PokedexDataBlock: FunctionComponent = () => {
  return (
    <PokemonDataBlock title="Pokédex">
      <PokemonDataBlockFieldset>
        <PokemonDataBlockFieldsetField label="Taille" data="0.7 m" />
        <PokemonDataBlockFieldsetField label="Poids" data="6.9 kg" />
        <PokemonDataBlockFieldsetField label="Espèce" data="Graine" />
      </PokemonDataBlockFieldset>
    </PokemonDataBlock>
  );
};
