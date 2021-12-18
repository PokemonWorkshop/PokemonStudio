import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectOption } from '@components/SelectCustom/SelectCustomPropsInterface';
import { SelectDataGeneric, SelectItem } from '@components/selects';
import { ProjectData } from '@src/GlobalStateProvider';
import { useProjectItems } from '@utils/useProjectData';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InputProps } from './InputProps';

type ItemInputProps = InputProps & { currentType: 'gemme' | 'itemHold' | 'stone' };

const getStoneOptions = (allItems: ProjectData['items']): SelectOption[] =>
  Object.entries(allItems)
    .filter(([, itemData]) => itemData.category === 'stone')
    .map(([value, itemData]) => ({ value, label: itemData.name(), index: itemData.id }))
    .sort((a, b) => a.index - b.index);

const getGemmeOptions = (allItems: ProjectData['items']): SelectOption[] =>
  Object.entries(allItems)
    .filter(([, itemData]) => itemData.category === 'generic' && itemData.isHoldable)
    .map(([value, itemData]) => ({ value, label: itemData.name(), index: itemData.id }))
    .sort((a, b) => a.index - b.index);

export const ItemInput = ({ condition, index, onChange, currentType }: ItemInputProps) => {
  const { projectDataValues: items } = useProjectItems();
  const stoneOptions = useMemo(() => getStoneOptions(items), [items]);
  const gemmeOptions = useMemo(() => getGemmeOptions(items), [items]);
  const { t } = useTranslation(['database_pokemon', 'database_items']);
  if (condition.type !== currentType) return <></>;

  return (
    <InputWithTopLabelContainer>
      <Label>{t('database_pokemon:evolutionValue_item')}</Label>
      {currentType === 'stone' && (
        <SelectDataGeneric
          data={{ value: condition.value, label: items[condition.value]?.name() || t('database_items:item_deleted') }}
          options={stoneOptions}
          onChange={(option) => onChange({ type: currentType, value: option.value }, index)}
          noOptionsText={t('database_items:no_option')}
          error={!items[condition.value]}
          noneValue
        />
      )}
      {currentType === 'gemme' && (
        <SelectDataGeneric
          data={{ value: condition.value, label: items[condition.value]?.name() || t('database_items:item_deleted') }}
          options={gemmeOptions}
          onChange={(option) => onChange({ type: currentType, value: option.value }, index)}
          noOptionsText={t('database_items:no_option')}
          error={!items[condition.value]}
          noneValue
        />
      )}
      {currentType === 'itemHold' && (
        <SelectItem dbSymbol={condition.value} onChange={(option) => onChange({ type: currentType, value: option.value }, index)} noLabel />
      )}
    </InputWithTopLabelContainer>
  );
};
