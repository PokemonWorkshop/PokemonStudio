import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectDataGeneric, SelectItem } from '@components/selects';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { useGetEntityNameText } from '@utils/ReadingProjectText';
import { useProjectItems } from '@hooks/useProjectData';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EvolutionConditionEditorInput } from './InputProps';
import { useSelectOptions } from '@hooks/useSelectOptions';

export const ItemInput = ({ type, state, dispatch }: EvolutionConditionEditorInput) => {
  const { projectDataValues: items } = useProjectItems();
  const getItemName = useGetEntityNameText();
  const stoneOptions = useSelectOptions('itemStone');
  const gemmeOptions = useSelectOptions('itemGem');
  const { t } = useTranslation();
  if (type !== 'gemme' && type !== 'stone' && type !== 'itemHold') return null;

  const dbSymbol = state[type];

  return (
    <InputWithTopLabelContainer>
      <Label>{t('evolution_value_item')}</Label>
      {type !== 'itemHold' ? (
        <SelectDataGeneric
          data={{ value: dbSymbol, label: items[dbSymbol] ? getItemName(items[dbSymbol]) : t('item_deleted') }}
          options={type === 'stone' ? stoneOptions : gemmeOptions}
          onChange={(option) => dispatch({ type: 'update', key: type, value: option.value as DbSymbol })}
          noOptionsText={t('item_not_found')}
          error={!items[dbSymbol]}
          noneValue
        />
      ) : (
        <SelectItem dbSymbol={dbSymbol} onChange={(value) => dispatch({ type: 'update', key: type, value: value as DbSymbol })} noLabel />
      )}
    </InputWithTopLabelContainer>
  );
};
