import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { SelectMove } from '@components/selects';
import { LOCKED_ITEM_EDITOR, StudioItem } from '@modelEntities/item';
import { DbSymbol } from '@modelEntities/dbSymbol';

type ItemTechDataEditorProps = {
  item: StudioItem;
};

export const ItemTechDataEditor = ({ item }: ItemTechDataEditorProps) => {
  const { t } = useTranslation(['database_items', 'database_moves']);
  const refreshUI = useRefreshUI();
  const machineOptions = useMemo(
    () =>
      (['hm', 'tm'] as const)
        .map((machine) => ({ value: machine, label: t(`database_items:${machine}`) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [t]
  );
  const isTechItem = item.klass === 'TechItem';

  return LOCKED_ITEM_EDITOR[item.klass].includes('tech') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('database_items:techniques')}>
      <InputContainer>
        {isTechItem && (
          <InputWithTopLabelContainer>
            <Label htmlFor="machines_category">{t('database_items:machines_category')}</Label>
            <SelectCustomSimple
              id="select-machines_category"
              options={machineOptions}
              value={machineOptions[item.isHm ? 0 : 1].value}
              onChange={(value) => refreshUI((item.isHm = value === 'hm'))}
              noTooltip
            />
          </InputWithTopLabelContainer>
        )}
        {isTechItem && (
          <InputWithTopLabelContainer>
            <Label htmlFor="move_learnt">{t('database_items:move_learnt')}</Label>
            <SelectMove dbSymbol={item.move} onChange={(dbSymbol) => refreshUI((item.move = dbSymbol as DbSymbol))} noLabel />
          </InputWithTopLabelContainer>
        )}
        <InputWithLeftLabelContainer>
          <Label htmlFor="fling">{t('database_items:fling')}</Label>
          <Input
            type="number"
            name="fling"
            value={isNaN(item.flingPower) ? '' : item.flingPower}
            min="0"
            max="999"
            onChange={(event) => {
              const newValue = parseInt(event.target.value);
              if (newValue < 0 || newValue > 999) return event.preventDefault();
              refreshUI((item.flingPower = newValue));
            }}
            onBlur={() => refreshUI((item.flingPower = cleanNaNValue(item.flingPower)))}
          />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
