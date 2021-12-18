import React from 'react';
import { DataBlockWithTitle, DataGrid } from '../dataBlocks';
import ZoneModel from '@modelEntities/zone/Zone.model';
import { useTranslation } from 'react-i18next';
import { DataFieldsetField, DataFieldsetFieldCode } from '../dataBlocks/DataFieldsetField';

const isPositionUndefined = (zone: ZoneModel) => zone.position.x === null || zone.position.y === null;
const isWarpUndefined = (zone: ZoneModel) => zone.warp.x === null || zone.warp.y === null;

type ZoneTravelProps = {
  zone: ZoneModel;
  onClick: () => void;
};

export const ZoneTravel = ({ zone, onClick }: ZoneTravelProps) => {
  const { t } = useTranslation('database_zones');

  return (
    <DataBlockWithTitle size="half" title={t('travel')} onClick={onClick}>
      <DataGrid columns="136px 1fr" rows="53px 53px">
        <DataFieldsetField label={t('warp')} data={zone.isWarpDisallowed ? t('not_allowed') : t('allowed')} />
        <DataFieldsetField label={t('zone_type')} data={zone.isFlyAllowed ? t('outdoor') : t('indoor')} />
        {isWarpUndefined(zone) ? (
          <DataFieldsetField label={t('landing_coordinates')} data={t('undefined_s')} disabled={true} />
        ) : (
          <DataFieldsetFieldCode label={t('landing_coordinates')} data={`${zone.warp.x},${zone.warp.y}`} size="m" />
        )}
        {isPositionUndefined(zone) ? (
          <DataFieldsetField label={t('worldmap_coordinates')} data={t('undefined')} disabled={true} />
        ) : (
          <DataFieldsetFieldCode label={t('worldmap_coordinates')} data={`${zone.position.x},${zone.position.y}`} size="m" />
        )}
      </DataGrid>
    </DataBlockWithTitle>
  );
};
