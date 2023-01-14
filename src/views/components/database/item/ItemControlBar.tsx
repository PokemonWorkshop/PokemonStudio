import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectChangeEvent } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import { SelectItem } from '@components/selects';
import { StudioItem } from '@modelEntities/item';
import { useSetCurrentDatabasePath } from '@utils/useSetCurrentDatabasePage';

type ItemControlBarProps = {
  onChange: SelectChangeEvent;
  item: StudioItem;
  onClickNewItem: () => void;
};

export const ItemControlBar = ({ onChange, item, onClickNewItem }: ItemControlBarProps) => {
  const { t } = useTranslation('database_items');
  useSetCurrentDatabasePath();

  return (
    <ControlBar>
      <SecondaryButtonWithPlusIcon onClick={onClickNewItem}>{t('new')}</SecondaryButtonWithPlusIcon>
      <SelectItem dbSymbol={item.dbSymbol} onChange={onChange} />
    </ControlBar>
  );
};
