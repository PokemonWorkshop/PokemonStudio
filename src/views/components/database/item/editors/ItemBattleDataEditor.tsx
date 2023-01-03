import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { LOCKED_ITEM_EDITOR, StudioItem, StudioStatBoostItem } from '@modelEntities/item';

type ItemBattleDataEditorProps = {
  item: StudioItem;
};

const stageBoost = ['ATK_STAGE', 'ATS_STAGE', 'DFE_STAGE', 'DFS_STAGE', 'SPD_STAGE', 'EVA_STAGE', 'ACC_STAGE'] as const;

export const ItemBattleDataEditor = ({ item }: ItemBattleDataEditorProps) => {
  const { t } = useTranslation('database_items');
  const refreshUI = useRefreshUI();
  const isStatBoostItem = item.klass === 'StatBoostItem';
  const statisticOptions = useMemo(() => stageBoost.map((stage) => ({ value: stage, label: t(stage) })), [t]);

  return LOCKED_ITEM_EDITOR[item.klass].includes('battle') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('battle')}>
      {isStatBoostItem && (
        <InputContainer>
          <InputWithTopLabelContainer>
            <Label htmlFor="statistic">{t('statistic')}</Label>
            <SelectCustomSimple
              id="select-statistic"
              options={statisticOptions}
              value={item.stat}
              onChange={(value) => refreshUI((item.stat = value as StudioStatBoostItem['stat']))}
              noTooltip
            />
          </InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="value">{t('value')}</Label>
            <Input
              type="number"
              value={isNaN(item.count) ? '' : item.count}
              min="0"
              max="99"
              onChange={(event) => {
                const newValue = parseInt(event.target.value);
                if (newValue < 0 || newValue > 99) return event.preventDefault();
                refreshUI((item.count = newValue));
              }}
              onBlur={() => refreshUI((item.count = cleanNaNValue(item.count)))}
            />
          </InputWithLeftLabelContainer>
        </InputContainer>
      )}
    </Editor>
  );
};
