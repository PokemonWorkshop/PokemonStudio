import { useProjectAbilities } from '@utils/useProjectData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../../dataBlocks';
import { PokemonDataProps } from '../PokemonDataPropsInterface';

export const TalentsDataBlock = ({ pokemonWithForm, onClick }: PokemonDataProps) => {
  const { form } = pokemonWithForm;
  const { projectDataValues: abilities } = useProjectAbilities();
  const { t } = useTranslation('database_pokemon');

  return (
    <DataBlockWithTitle size="fourth" title={t('abilities')} onClick={onClick}>
      <DataGrid columns="1fr" rows="1fr 1fr 1fr">
        <DataFieldsetField
          label={t('ability_1')}
          data={
            form.abilities[0]
              ? abilities[form.abilities[0]]
                ? abilities[form.abilities[0]].name()
                : form.abilities[0] === '__undef__'
                ? '---'
                : t('ability_deleted')
              : '---'
          }
          error={abilities[form.abilities[0]] ? false : true}
          disabled={form.abilities[0] === '__undef__'}
        />
        <DataFieldsetField
          label={t('ability_2')}
          data={
            form.abilities[1]
              ? abilities[form.abilities[1]]
                ? abilities[form.abilities[1]].name()
                : form.abilities[1] === '__undef__'
                ? '---'
                : t('ability_deleted')
              : '---'
          }
          error={abilities[form.abilities[1]] ? false : true}
          disabled={form.abilities[1] === '__undef__'}
        />
        <DataFieldsetField
          label={t('hidden_ability')}
          data={
            form.abilities[2]
              ? abilities[form.abilities[2]]
                ? abilities[form.abilities[2]].name()
                : form.abilities[2] === '__undef__'
                ? '---'
                : t('ability_deleted')
              : '---'
          }
          error={abilities[form.abilities[2]] ? false : true}
          disabled={form.abilities[2] === '__undef__'}
        />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
