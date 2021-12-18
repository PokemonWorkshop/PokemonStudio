import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataFieldsetFieldCode } from '@components/database/dataBlocks/DataFieldsetField';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import { AbilityDataProps } from './AbilityDataPropsInterface';

export const AbilityParametersData = ({ ability, onClick }: AbilityDataProps) => {
  const { t } = useTranslation('database_abilities');
  const isDisabled = ability.lockedEditors.includes('parameters');

  return (
    <DataBlockWithTitle size="full" title={t('params')} disabled={isDisabled} onClick={isDisabled ? undefined : onClick}>
      {!isDisabled && (
        <DataGrid columns="1fr" rows="42px 42px 1fr">
          <DataFieldsetField label={t('effect')} data={ability.klass} />
          <DataFieldsetFieldCode label={t('symbol')} data={ability.dbSymbol || '__undef__'} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
