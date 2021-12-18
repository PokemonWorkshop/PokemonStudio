import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import ItemModel from '@modelEntities/item/Item.model';
import StatBoostItemModel from '@modelEntities/item/StatBoostItem.model';
import { SelectCustomSimple } from '@components/SelectCustom';
import { cleanNaNValue } from '@utils/cleanNaNValue';

type ItemBattleDataEditorProps = {
  item: ItemModel;
};

const stageBoost = ['ATK_STAGE', 'ATS_STAGE', 'DFE_STAGE', 'DFS_STAGE', 'SPD_STAGE', 'EVA_STAGE', 'ACC_STAGE'] as const;

export const ItemBattleDataEditor = ({ item }: ItemBattleDataEditorProps) => {
  const { t } = useTranslation('database_items');
  const refreshUI = useRefreshUI();
  const statBoostItem = item instanceof StatBoostItemModel ? item : undefined;
  const statisticOptions = useMemo(() => stageBoost.map((stage) => ({ value: stage, label: t(stage) })), [t]);

  return item.lockedEditors.includes('battle') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('battle')}>
      {statBoostItem && (
        <InputContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="statistic">{t('statistic')}</Label>
            <SelectCustomSimple
              id="select-statistic"
              options={statisticOptions}
              value={statBoostItem.stat}
              onChange={(value) => refreshUI((statBoostItem.stat = value))}
              noTooltip
            />
          </InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="value">{t('value')}</Label>
            <Input
              type="number"
              value={isNaN(statBoostItem.count) ? '' : statBoostItem.count}
              min="0"
              max="99"
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < 0 || newValue > 99) return event.preventDefault();
                refreshUI((statBoostItem.count = newValue));
              }}
              onBlur={() => refreshUI((statBoostItem.count = cleanNaNValue(statBoostItem.count)))}
            />
          </InputWithLeftLabelContainer>
        </InputContainer>
      )}
    </Editor>
  );
};
