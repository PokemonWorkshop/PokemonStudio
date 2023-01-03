import { CREATURE_SPECIE_TEXT_ID } from '@modelEntities/creature';
import { useGetProjectText } from '@utils/ReadingProjectText';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../../dataBlocks';
import { PokemonDataProps } from '../PokemonDataPropsInterface';

export const PokedexDataBlock = ({ pokemonWithForm, onClick }: PokemonDataProps) => {
  const { species, form } = pokemonWithForm;
  const { t } = useTranslation('database_pokemon');
  const getText = useGetProjectText();

  return (
    <DataBlockWithTitle size="fourth" title="Pokédex" onClick={onClick}>
      <DataGrid columns="1fr" rows="1fr 1fr 1fr">
        <DataFieldsetField label={t('height')} data={form.height + ' m'} />
        <DataFieldsetField label={t('weight')} data={form.weight + ' kg'} />
        <DataFieldsetField label={t('species')} data={getText(CREATURE_SPECIE_TEXT_ID, species.id)} />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
