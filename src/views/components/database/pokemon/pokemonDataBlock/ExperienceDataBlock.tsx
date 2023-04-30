import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../../dataBlocks';
import { PokemonDataProps } from '../PokemonDataPropsInterface';

export const ExperienceDataBlock = ({ pokemonWithForm, dialogsRef }: PokemonDataProps) => {
  const { form } = pokemonWithForm;
  const { t } = useTranslation('database_pokemon');
  const curveTypes = [t('fast'), t('normal'), t('slow'), t('parabolic'), t('erratic'), t('fluctuating')];

  return (
    <DataBlockWithTitle size="fourth" title={t('experience')} onClick={() => dialogsRef.current?.openDialog('exp')}>
      <DataGrid columns="1fr" rows="1fr 1fr 1fr">
        <DataFieldsetField label={t('curveType')} data={curveTypes[form.experienceType]} />
        <DataFieldsetField label={t('base_experience')} data={form.baseExperience} />
        <DataFieldsetField label={t('base_friendship')} data={form.baseLoyalty} />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
