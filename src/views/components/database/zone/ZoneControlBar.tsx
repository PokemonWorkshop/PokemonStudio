import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import ZoneModel from '@modelEntities/zone/Zone.model';
import { SelectZone } from '@components/selects';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';

type ZoneControlBarProps = {
  onChange: (selected: SelectOption) => void;
  zone: ZoneModel;
  onClickNewZone: () => void;
};

export const ZoneControlBar = ({ onChange, zone, onClickNewZone }: ZoneControlBarProps) => {
  const { t } = useTranslation('database_zones');

  return (
    <ControlBar>
      <SecondaryButtonWithPlusIcon onClick={onClickNewZone}>{t('new')}</SecondaryButtonWithPlusIcon>
      <SelectZone dbSymbol={zone.dbSymbol} onChange={onChange} />
    </ControlBar>
  );
};
