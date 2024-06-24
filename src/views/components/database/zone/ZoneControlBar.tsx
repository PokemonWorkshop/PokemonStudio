import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import { SelectZone } from '@components/selects';
import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import { StudioZone } from '@modelEntities/zone';
import { useSetCurrentDatabasePath } from '@hooks/useSetCurrentDatabasePage';

type ZoneControlBarProps = {
  onChange: SelectChangeEvent;
  zone: StudioZone;
  onClickNewZone: () => void;
};

export const ZoneControlBar = ({ onChange, zone, onClickNewZone }: ZoneControlBarProps) => {
  const { t } = useTranslation('database_zones');
  useSetCurrentDatabasePath();

  return (
    <ControlBar>
      <SecondaryButtonWithPlusIcon onClick={onClickNewZone}>{t('new')}</SecondaryButtonWithPlusIcon>
      <SelectZone dbSymbol={zone.dbSymbol} onChange={onChange} />
    </ControlBar>
  );
};
