import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataGrid, DataFieldsetField } from '../dataBlocks';
import { StudioNature } from '@modelEntities/nature';
import { NatureDialogsRef } from './editors/NatureEditorOverlay';

type NatureDataProps = {
  nature: StudioNature;
  dialogsRef: NatureDialogsRef;
};

export const NatureFlavors = ({ nature, dialogsRef }: NatureDataProps) => {
  const { t } = useTranslation('database_natures');

  return (
    <DataBlockWithTitle size="half" title={t('flavors')} onClick={() => dialogsRef?.current?.openDialog('flavors')}>
      <DataGrid columns="1fr" rows="1fr 1fr">
        <DataFieldsetField label={t('favourite_flavor')} data={t(nature.flavors.favourite)} />
        <DataFieldsetField label={t('detested_flavor')} data={t(nature.flavors.detested)} />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
