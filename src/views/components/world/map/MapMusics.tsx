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
      <DataGrid columns="1fr 1fr 1fr" rows="1fr 1fr">
        <DataFieldsetField label={t('background_music')} data={map.bgm.name || t('no_background_music')} disabled={!map.bgm.name} />
        <DataFieldsetField label={t('background_sound')} data={map.bgs.name || t('no_background_sound')} disabled={!map.bgs.name} />
        <DataFieldsetField label={t('volume')} data={`${map.bgm.volume} %`} disabled={!map.bgm.name} />
        <DataFieldsetField label={t('volume')} data={`${map.bgs.volume} %`} disabled={!map.bgs.name} />
        <DataFieldsetField label={t('pitch')} data={`${map.bgm.pitch} %`} disabled={!map.bgm.name} />

        <DataFieldsetField label={t('pitch')} data={`${map.bgs.pitch} %`} disabled={!map.bgs.name} />
      </DataGrid>
    </DataBlockWithTitle>
  );
};
