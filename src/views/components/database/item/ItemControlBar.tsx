import { SecondaryButtonWithPlusIcon } from '@components/buttons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { ControlBar } from '@components/ControlBar';
import ItemModel from '@modelEntities/item/Item.model';
import { SelectItem } from '@components/selects';

type ItemControlBarProps = {
  onChange: (selected: SelectOption) => void;
  item: ItemModel;
  onClickNewItem: () => void;
};

export const ItemControlBar = ({ onChange, item, onClickNewItem }: ItemControlBarProps) => {
  const { t } = useTranslation('database_items');

  return (
    <ControlBar>
      <SecondaryButtonWithPlusIcon onClick={onClickNewItem}>{t('new')}</SecondaryButtonWithPlusIcon>
      <SelectItem dbSymbol={item.dbSymbol} onChange={onChange} />
    </ControlBar>
  );
};
