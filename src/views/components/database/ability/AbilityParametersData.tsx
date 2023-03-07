import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataFieldsetFieldCode } from '@components/database/dataBlocks/DataFieldsetField';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '../dataBlocks';
import type { StudioAbility } from '@modelEntities/ability';
import type { AbilityDialogsRef } from './editors/AbilityEditorOverlay';

type Props = {
  ability: StudioAbility;
  dialogsRef: AbilityDialogsRef;
};

export const AbilityParametersData = ({ ability, dialogsRef }: Props) => {
  const { t } = useTranslation('database_abilities');
  const isDisabled = true; // TODO @Aerun: Figure out how this thing is supposed to be enabled/editable.

  return (
    <DataBlockWithTitle
      size="full"
      title={t('params')}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : () => dialogsRef.current?.openDialog('frame')}
    >
      {!isDisabled && (
        <DataGrid columns="1fr" rows="42px 42px 1fr">
          <DataFieldsetField label={t('effect')} data={ability.klass} />
          <DataFieldsetFieldCode label={t('symbol')} data={ability.dbSymbol || '__undef__'} />
        </DataGrid>
      )}
    </DataBlockWithTitle>
  );
};
