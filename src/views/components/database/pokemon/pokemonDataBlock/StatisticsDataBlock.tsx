import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataGrid, DataFieldgroup, DataFieldgroupField } from '../../dataBlocks';
import { PokemonDataProps } from '../PokemonDataPropsInterface';

export const StatisticsDataBlock = ({ pokemonWithForm, dialogsRef }: PokemonDataProps) => {
  const { form } = pokemonWithForm;
  const { t } = useTranslation('database_pokemon');

  const totalBaseStats = form.baseHp + form.baseAtk + form.baseDfe + form.baseAts + form.baseDfs + form.baseSpd

  return (
    <DataBlockWithTitle size="half" title={t('stats')} onClick={() => dialogsRef.current?.openDialog('stats')}>
      <DataGrid columns="1fr 1fr" gap="64px">
        <DataFieldgroup title={t('base_stats')} data={totalBaseStats}>
          <DataFieldgroupField label={t('hp')} data={form.baseHp} />
          <DataFieldgroupField label={t('attack')} data={form.baseAtk} />
          <DataFieldgroupField label={t('defense')} data={form.baseDfe} />
          <DataFieldgroupField label={t('special_attack')} data={form.baseAts} />
          <DataFieldgroupField label={t('special_defense')} data={form.baseDfs} />
          <DataFieldgroupField label={t('speed')} data={form.baseSpd} />
        </DataFieldgroup>
        <DataFieldgroup title={t('effort_value_ev')}>
          <DataFieldgroupField label={t('hp')} data={form.evHp} />
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
