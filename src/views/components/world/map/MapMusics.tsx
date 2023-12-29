import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataBlockWithTitle, DataFieldsetField, DataGrid } from '@components/database/dataBlocks';
import { StudioMap } from '@modelEntities/map';
import { MapDialogsRef } from './editors/MapEditorOverlay';

type Props = {
  map: StudioMap;
  dialogsRef: MapDialogsRef;
  disabled: boolean;
};

export const MapMusics = ({ map, dialogsRef, disabled }: Props) => {
  const { t } = useTranslation('database_maps');

  return (
    <DataBlockWithTitle size="full" title={t('musics')} disabled={disabled} onClick={() => dialogsRef.current?.openDialog('musics')}>
      <DataGrid columns="1fr" rows="1fr 1fr">
        <DataFieldsetField label={t('background_music')} data={map.bgm || t('no_background_music')} disabled={!map.bgm} />
        <DataFieldsetField label={t('background_sound')} data={map.bgs || t('no_background_sound')} disabled={!map.bgs} />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
