import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataGrid, DataFieldgroup, DataFieldgroupField } from '../../dataBlocks';
import { PokemonDataProps } from '../PokemonDataPropsInterface';

export const StatisticsDataBlock = ({ pokemonWithForm, onClick }: PokemonDataProps) => {
  const { form } = pokemonWithForm;
  const { t } = useTranslation('database_pokemon');
  return (
    <DataBlockWithTitle size="half" title={t('stats')} onClick={onClick}>
      <DataGrid columns="1fr 1fr" gap="64px">
        <DataFieldgroup title={t('base_stats')}>
          <DataFieldgroupField label={t('hit_points')} data={form.baseHp} />
          <DataFieldgroupField label={t('attack')} data={form.baseAtk} />
          <DataFieldgroupField label={t('defense')} data={form.baseDfe} />
          <DataFieldgroupField label={t('special_attack')} data={form.baseAts} />
          <DataFieldgroupField label={t('special_defense')} data={form.baseDfs} />
          <DataFieldgroupField label={t('speed')} data={form.baseSpd} />
        </DataFieldgroup>
        <DataFieldgroup title={t('effort_value_ev')}>
          <DataFieldgroupField label={t('hit_points')} data={form.evHp} />
          <DataFieldgroupField label={t('attack')} data={form.evAtk} />
          <DataFieldgroupField label={t('defense')} data={form.evDfe} />
          <DataFieldgroupField label={t('special_attack')} data={form.evAts} />
          <DataFieldgroupField label={t('special_defense')} data={form.evDfs} />
          <DataFieldgroupField label={t('speed')} data={form.evSpd} />
        </DataFieldgroup>
      </DataGrid>
    </DataBlockWithTitle>
  );
};
