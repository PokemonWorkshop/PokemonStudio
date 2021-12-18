import { useProjectPokemon } from '@utils/useProjectData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataGrid, DataFieldsetField } from '../../dataBlocks';
import { PokemonDataProps } from '../PokemonDataPropsInterface';

export const ReproductionDataBlock = ({ pokemonWithForm, onClick }: PokemonDataProps) => {
  const { projectDataValues: pokemons } = useProjectPokemon();
  const { form } = pokemonWithForm;
  const { t } = useTranslation('database_pokemon');
  const groups = {
    group1: t(`${form.breedingGroups()[0]}` as never),
    group2: t(`${form.breedingGroups()[1]}` as never),
  };

  return (
    <DataBlockWithTitle size="fourth" title={t('breeding')} onClick={onClick}>
      <DataGrid columns="1fr" rows="1fr 1fr 1fr">
        <DataFieldsetField
          label={t('baby')}
          data={form.babyDbSymbol === '__undef__' ? '-' : pokemons[form.babyDbSymbol] ? pokemons[form.babyDbSymbol].name() : t('pokemon_deleted')}
          error={!pokemons[form.babyDbSymbol]}
        />
        <DataFieldsetField
          label={t('egg_groups')}
          data={
            form.breedingGroups()[0] === form.breedingGroups()[1] ? groups.group1 : t('egg_data', { group1: groups.group1, group2: groups.group2 })
          }
        />
        <DataFieldsetField label={t('hatch_steps')} data={form.hatchSteps} />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
