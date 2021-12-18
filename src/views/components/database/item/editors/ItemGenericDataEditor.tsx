import React, { useMemo } from 'react';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import ItemModel, { pocketMapping } from '@modelEntities/item/Item.model';
import { ProjectText } from '@src/GlobalStateProvider';
import { getText } from '@utils/ReadingProjectText';
import { useTranslation } from 'react-i18next';
import { SelectCustomSimple } from '@components/SelectCustom';
import { useProjectItems } from '@utils/useProjectData';
import { cleanNaNValue } from '@utils/cleanNaNValue';

const pocketOptions = (projectText: ProjectText) =>
  pocketMapping
    .slice(1)
    .map((i) => ({ value: i.toString(), label: getText(projectText, 15, i) }))
    .sort((a, b) => a.label.localeCompare(b.label));

type ItemGenericDataEditorProps = {
  item: ItemModel;
};

export const ItemGenericDataEditor = ({ item }: ItemGenericDataEditorProps) => {
  const { t } = useTranslation('database_items');
  const refreshUI = useRefreshUI();
  const options = useMemo(() => (item.projectText ? pocketOptions(item.projectText) : []), [item]);
  const itemPocket = (pocketMapping[item.socket] ?? item.socket).toString();
  const { projectDataValues: items } = useProjectItems();

  return item.lockedEditors.includes('generic') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('data')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label>{t('item_socket')} </Label>
          <SelectCustomSimple
            id="select-item-socket"
            options={options}
            onChange={(value) => refreshUI((item.socket = pocketMapping.indexOf(Number(value), 1)))}
            value={itemPocket}
            noTooltip
          />
        </InputWithTopLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="price">{t('price')}</Label>
          <Input
            type="number"
            name="price"
            value={isNaN(item.price) ? '' : item.price}
            min="0"
            max="999999999"
            onChange={(event) => {
              const newValue = parseInt(event.target.value);
              if (newValue < 0 || newValue > 999_999_999) return event.preventDefault();
              refreshUI((item.price = newValue));
            }}
            onBlur={() => refreshUI((item.price = cleanNaNValue(item.price)))}
          />
        </InputWithLeftLabelContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="position">{t('order_sort')}</Label>
          <Input
            type="number"
            name="position"
            min="0"
            max={Object.entries(items).length}
            value={isNaN(item.position) ? '' : item.position}
            onChange={(event) => {
              const newValue = parseInt(event.target.value);
              if (newValue < 0 || newValue > Object.entries(items).length) return event.preventDefault();
              refreshUI((item.position = newValue));
            }}
            onBlur={() => refreshUI((item.position = cleanNaNValue(item.position)))}
          />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
