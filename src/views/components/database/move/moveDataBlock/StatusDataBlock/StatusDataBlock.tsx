import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { MoveDataBlock } from '../MoveDataBlock';
import { StatusDataBlockFieldset } from './StatusDataBlockFieldset';
import { StatusDataBlockFieldsetField } from './StatusDataBlockFieldsetField';

export const StatusDataBlock: FunctionComponent = () => {
  const { t } = useTranslation('database_moves');

  return (
    <MoveDataBlock title={t('status')} size="s">
      <StatusDataBlockFieldset>
        <StatusDataBlockFieldsetField label={t('status_1')} data="Gel" />
        <StatusDataBlockFieldsetField label={t('status_2')} data="none" />
        <StatusDataBlockFieldsetField label={t('status_3')} data="none" />
        <StatusDataBlockFieldsetField label={t('chance')} data="10 %" />
        <StatusDataBlockFieldsetField label={t('chance')} data="0 %" />
        <StatusDataBlockFieldsetField label={t('chance')} data="0 %" />
      </StatusDataBlockFieldset>
    </MoveDataBlock>
  );
};
