import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import ZoneModel from '@modelEntities/zone/Zone.model';
import { SelectZone } from '@components/selects';

type MapLinkControlBarProps = {
  onChange: (selected: SelectOption) => void;
  zone: ZoneModel;
};

export const MapLinkControlBar = ({ onChange, zone }: MapLinkControlBarProps) => {
  const { t } = useTranslation('database_zones');

  return (
    <ControlBar>
      <SelectZone noLabel dbSymbol={zone.dbSymbol} onChange={onChange} />
    </ControlBar>
  );
};
