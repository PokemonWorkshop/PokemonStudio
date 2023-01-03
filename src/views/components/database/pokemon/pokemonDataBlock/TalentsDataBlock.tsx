import { useGetEntityNameTextUsingTextId } from '@utils/ReadingProjectText';
import { useProjectAbilities } from '@utils/useProjectData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../../dataBlocks';
import { PokemonDataProps } from '../PokemonDataPropsInterface';

export const TalentsDataBlock = ({ pokemonWithForm, onClick }: PokemonDataProps) => {
  const { form } = pokemonWithForm;
  const { projectDataValues: abilities } = useProjectAbilities();
  const getAbilityName = useGetEntityNameTextUsingTextId();
  const { t } = useTranslation('database_pokemon');

  const getAbilityNameByIndex = (index: number) => {
    if (!form.abilities[index] || form.abilities[index] === '__undef__') return '---';
    if (!abilities[form.abilities[index]]) return t('ability_deleted');

    return getAbilityName(abilities[form.abilities[index]]);
  };

  return (
    <DataBlockWithTitle size="fourth" title={t('abilities')} onClick={onClick}>
      <DataGrid columns="1fr" rows="1fr 1fr 1fr">
        <DataFieldsetField
          label={t('ability_1')}
          data={getAbilityNameByIndex(0)}
          error={abilities[form.abilities[0]] ? false : true}
          disabled={form.abilities[0] === '__undef__'}
        />
        <DataFieldsetField
          label={t('ability_2')}
          data={getAbilityNameByIndex(1)}
          error={abilities[form.abilities[1]] ? false : true}
          disabled={form.abilities[1] === '__undef__'}
        />
        <DataFieldsetField
          label={t('hidden_ability')}
          data={getAbilityNameByIndex(2)}
          error={abilities[form.abilities[2]] ? false : true}
          disabled={form.abilities[2] === '__undef__'}
        />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
