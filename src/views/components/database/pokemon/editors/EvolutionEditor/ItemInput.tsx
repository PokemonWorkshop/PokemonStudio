import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectDataGeneric, SelectItem } from '@components/selects';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { ProjectData } from '@src/GlobalStateProvider';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useProjectItems } from '@utils/useProjectData';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InputProps } from './InputProps';

type ItemInputProps = InputProps & { currentType: 'gemme' | 'itemHold' | 'stone' };

const getStoneOptions = (allItems: ProjectData['items'], getItemName: ReturnType<typeof useGetEntityNameText>) =>
  Object.values(allItems)
    .filter((itemData) => itemData.klass === 'StoneItem')
    .sort((a, b) => a.id - b.id)
    .map((itemData) => ({ value: itemData.dbSymbol, label: getItemName(itemData) }));

const getGemmeOptions = (allItems: ProjectData['items'], getItemName: ReturnType<typeof useGetEntityNameText>) =>
  Object.values(allItems)
    .filter((itemData) => itemData.klass === 'Item' && itemData.isHoldable)
    .sort((a, b) => a.id - b.id)
    .map((itemData) => ({ value: itemData.dbSymbol, label: getItemName(itemData) }));

export const ItemInput = ({ condition, index, onChange, currentType }: ItemInputProps) => {
  const { projectDataValues: items } = useProjectItems();
  const getItemName = useGetEntityNameText();
  /* eslint-disable react-hooks/exhaustive-deps */
  const stoneOptions = useMemo(() => getStoneOptions(items, getItemName), [items]);
  const gemmeOptions = useMemo(() => getGemmeOptions(items, getItemName), [items]);
  /* eslint-enable react-hooks/exhaustive-deps */
  const { t } = useTranslation(['database_pokemon', 'database_items']);
  if (condition.type !== currentType) return <></>;

  return (
    <InputWithTopLabelContainer>
      <Label>{t('database_pokemon:evolutionValue_item')}</Label>
      {currentType === 'stone' && (
        <SelectDataGeneric
          data={{ value: condition.value, label: items[condition.value] ? getItemName(items[condition.value]) : t('database_items:item_deleted') }}
          options={stoneOptions}
          onChange={(option) => onChange({ type: currentType, value: option.value as DbSymbol }, index)}
          noOptionsText={t('database_items:no_option')}
          error={!items[condition.value]}
          noneValue
        />
      )}
      {currentType === 'gemme' && (
        <SelectDataGeneric
          data={{ value: condition.value, label: items[condition.value] ? getItemName(items[condition.value]) : t('database_items:item_deleted') }}
          options={gemmeOptions}
          onChange={(option) => onChange({ type: currentType, value: option.value as DbSymbol }, index)}
          noOptionsText={t('database_items:no_option')}
          error={!items[condition.value]}
          noneValue
        />
      )}
      {currentType === 'itemHold' && (
        <SelectItem
          dbSymbol={condition.value}
          onChange={(option) => onChange({ type: currentType, value: option.value as DbSymbol }, index)}
          noLabel
        />
      )}
    </InputWithTopLabelContainer>
  );
};
