import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { MoveDataBlock } from '../MoveDataBlock';
import { StatisticsDataBlockField } from './StatisticsDataBlockField';
import { StatisticsDataBlockFieldGroup } from './StatisticsDataBlockFieldGroup';
import { StatisticsDataBlockFieldset } from './StatisticsDataBlockFieldset';

export const StatisticsDataBlock: FunctionComponent = () => {
  const { t } = useTranslation('database_moves');

  return (
    <MoveDataBlock title={t('statistics_modification')} size="s">
      <StatisticsDataBlockFieldset>
        <StatisticsDataBlockFieldGroup>
          <StatisticsDataBlockField label={t('attack')} data={0} />
          <StatisticsDataBlockField label={t('defense')} data={0} />
          <StatisticsDataBlockField label={t('special_attack')} data={0} />
          <StatisticsDataBlockField label={t('special_defense')} data={0} />
          <StatisticsDataBlockField label={t('speed')} data={0} />
        </StatisticsDataBlockFieldGroup>

        <StatisticsDataBlockFieldGroup>
          <StatisticsDataBlockField label={t('evasion')} data={0} />
          <StatisticsDataBlockField label={t('accuracy')} data={0} />
        </StatisticsDataBlockFieldGroup>
      </StatisticsDataBlockFieldset>
    </MoveDataBlock>
  );
};
