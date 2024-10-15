import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataGrid, DataFieldgroup, DataFieldgroupField } from '../dataBlocks';
import { StudioNature, STUDIO_NATURE_STATS_LIST } from '@modelEntities/nature';
import { NatureDialogsRef } from './editors/NatureEditorOverlay';

const showStat = (stat: number) => {
  const fixedStat = stat - 100;
  if (fixedStat > 0) return `+${fixedStat}%`;
  if (fixedStat < 0) return `${fixedStat}%`;

  return '-';
};

type NatureDataProps = {
  nature: StudioNature;
  dialogsRef: NatureDialogsRef;
};

export const NatureChangingStats = ({ nature, dialogsRef }: NatureDataProps) => {
  const { t } = useTranslation('database_natures');

  return (
    <DataBlockWithTitle size="half" title={t('changing_stats')} onClick={() => dialogsRef?.current?.openDialog('stats')}>
      <DataGrid columns="1fr 1fr">
        <DataFieldgroup title="">
          {STUDIO_NATURE_STATS_LIST.map((stat) => (
            <DataFieldgroupField label={t(`changing_stat_${stat}`)} data={showStat(nature.stats[stat])} width="197px" key={`changing_stat_${stat}`} />
          ))}
        </DataFieldgroup>
      </DataGrid>
    </DataBlockWithTitle>
  );
};
