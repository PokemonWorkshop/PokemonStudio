import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import ItemModel from '@modelEntities/item/Item.model';
import { UseProjectItemReturnType } from '@utils/useProjectData';
import EVBoostItemModel from '@modelEntities/item/EVBoostItem.model';
import LevelIncreaseItemModel from '@modelEntities/item/LevelIncreaseItem.model';
import { SelectCustomSimple } from '@components/SelectCustom';
import { mutateItemToProgressionCategory, progressCategories } from './mutateItemToProgressionCategory';
import { cleanNaNValue } from '@utils/cleanNaNValue';

type ItemProgressDataEditorProps = {
  item: ItemModel;
  setItems: UseProjectItemReturnType['setProjectDataValues'];
};

const statBoost = ['ATK_STAGE', 'ATS_STAGE', 'DFE_STAGE', 'DFS_STAGE', 'SPD_STAGE', 'EVA_STAGE', 'ACC_STAGE', 'HP_STAGE'] as const;

export const ItemProgressDataEditor = ({ item, setItems }: ItemProgressDataEditorProps) => {
  const { t } = useTranslation('database_items');
  const refreshUI = useRefreshUI();
  const evItem = item instanceof EVBoostItemModel ? item : undefined;
  const evStat = evItem ? `${evItem.stat}_STAGE` : '';
  const levelItem = item instanceof LevelIncreaseItemModel ? item : undefined;
  const progressOptions = useMemo(
    () => progressCategories.map((category) => ({ value: category, label: t(category) })).sort((a, b) => a.label.localeCompare(b.label)),
    [t]
  );
  const statOptions = useMemo(() => statBoost.map((stat) => ({ value: stat, label: t(stat) })), [t]);

  return item.lockedEditors.includes('progress') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('progress_title')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="progress_category">{t('progress_category')}</Label>
          <SelectCustomSimple
            id="select-progress-category"
            options={progressOptions}
            value={(evItem ?? levelItem)?.progressType || '???'}
            onChange={(value) => {
              setItems({ [item.dbSymbol]: mutateItemToProgressionCategory(item, value as typeof progressOptions[number]['value']) });
            }}
            noTooltip
          />
        </InputWithTopLabelContainer>
        {evItem && (
          <InputWithTopLabelContainer>
            <Label htmlFor="progress_stat">{t('progress_stat')}</Label>
            <SelectCustomSimple
              id="select-progress-stat"
              options={statOptions}
              value={evStat}
              onChange={(value) => refreshUI((evItem.stat = value.replace('_STAGE', '')))}
            />
          </InputWithTopLabelContainer>
        )}
        <InputWithLeftLabelContainer>
          <Label htmlFor="value">{t('value')}</Label>
          {evItem && (
            <Input
              type="number"
              name="value"
              value={isNaN(evItem.count) ? '' : evItem.count}
              min="-999"
              max="999"
              onChange={(event) => {
                const value = parseInt(event.target.value);
                if (value < -999 || value > 999) return event.preventDefault();
                refreshUI((evItem.count = value));
              }}
              onBlur={() => refreshUI((evItem.count = cleanNaNValue(evItem.count)))}
            />
          )}
          {levelItem && (
            <Input
              type="number"
              name="value"
              value={isNaN(levelItem.levelCount) ? '' : levelItem.levelCount}
              min="-999"
              max="999"
              onChange={(event) => {
                const value = parseInt(event.target.value);
                if (value < -999 || value > 999) return event.preventDefault();
                refreshUI((levelItem.levelCount = value));
              }}
              onBlur={() => refreshUI((levelItem.levelCount = cleanNaNValue(levelItem.levelCount)))}
            />
          )}
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
