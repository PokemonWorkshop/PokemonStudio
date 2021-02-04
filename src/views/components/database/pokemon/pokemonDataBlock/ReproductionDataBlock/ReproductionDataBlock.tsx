import React, { FunctionComponent } from 'react';
import { PokemonDataBlock } from '../PokemonDataBlock';
import { PokemonDataBlockFieldset } from '../PokemonDataBlockFieldset';
import { PokemonDataBlockFieldsetField } from '../PokemonDataBlockFieldsetField';

export const ReproductionDataBlock: FunctionComponent = () => {
  return (
    <PokemonDataBlock title="Reproduction" size="m">
      <PokemonDataBlockFieldset size="m">
        <PokemonDataBlockFieldsetField
          size="m"
          label="Bébé"
          data="Bulbizarre"
        />
        <PokemonDataBlockFieldsetField
          label="Groupe Oeuf 1"
          data="Monstrueux"
        />
        <PokemonDataBlockFieldsetField
          size="m"
          label="Taux de femelles"
          data="20 %"
        />
        <PokemonDataBlockFieldsetField
          size="m"
          label="Pas avant éclosion"
          data="5120"
        />
        <PokemonDataBlockFieldsetField
          size="m"
          label="Groupe Oeuf 2"
          data="Végétal"
        />
      </PokemonDataBlockFieldset>
    </PokemonDataBlock>
  );
};
