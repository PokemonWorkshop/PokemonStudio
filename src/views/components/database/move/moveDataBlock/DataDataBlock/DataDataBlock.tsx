import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { MoveDataBlock } from '../MoveDataBlock';
import { MoveDataBlockFieldset } from '../MoveDataBlockFieldset';
import { MoveDataBlockFieldsetField } from '../MoveDataBlockFieldsetField';

export const DataDataBlock: FunctionComponent = () => {
  const { t } = useTranslation('database_moves');

  return (
    <MoveDataBlock title={t('data')} size="m">
      <MoveDataBlockFieldset>
        <MoveDataBlockFieldsetField label={t('power')} data={40} />
        <MoveDataBlockFieldsetField label={t('accuracy')} data={100} />
        <MoveDataBlockFieldsetField label={t('power_points_pp')} data={35} />
        <MoveDataBlockFieldsetField label={t('critical_rate')} data="Normal" />
        <MoveDataBlockFieldsetField label={t('priority')} data={0} />
      </MoveDataBlockFieldset>
    </MoveDataBlock>
  );
};
