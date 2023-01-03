import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor, useRefreshUI } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { UseProjectItemReturnType } from '@utils/useProjectData';
import { SelectCustomSimple } from '@components/SelectCustom';
import { mutateItemToProgressionCategory, progressCategories } from './mutateItemToProgressionCategory';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { LOCKED_ITEM_EDITOR, StudioEVBoostItem, StudioItem } from '@modelEntities/item';

type ItemProgressDataEditorProps = {
  item: StudioItem;
  setItems: UseProjectItemReturnType['setProjectDataValues'];
};

const statBoost = ['ATK_STAGE', 'ATS_STAGE', 'DFE_STAGE', 'DFS_STAGE', 'SPD_STAGE', 'EVA_STAGE', 'ACC_STAGE', 'HP_STAGE'] as const;

export const ItemProgressDataEditor = ({ item, setItems }: ItemProgressDataEditorProps) => {
  const { t } = useTranslation('database_items');
  const refreshUI = useRefreshUI();
  const isItemEvBoost = item.klass === 'EVBoostItem';
  const isItemLevel = item.klass === 'LevelIncreaseItem';
  const evStat = isItemEvBoost ? `${item.stat}_STAGE` : '';
  const progressOptions = useMemo(
    () => progressCategories.map((category) => ({ value: category, label: t(category) })).sort((a, b) => a.label.localeCompare(b.label)),
    [t]
  );
  const statOptions = useMemo(() => statBoost.map((stat) => ({ value: stat, label: t(stat) })), [t]);

  return LOCKED_ITEM_EDITOR[item.klass].includes('progress') ? (
    <></>
  ) : (
    <Editor type="edit" title={t('progress_title')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="progress_category">{t('progress_category')}</Label>
          <SelectCustomSimple
            id="select-progress-category"
            options={progressOptions}
            value={isItemEvBoost ? 'EV_PROGRESS' : 'LEVEL_PROGRESS'}
            onChange={(value) => {
              setItems({ [item.dbSymbol]: mutateItemToProgressionCategory(item, value as typeof progressOptions[number]['value']) });
            }}
            noTooltip
          />
        </InputWithTopLabelContainer>
        {isItemEvBoost && (
          <InputWithTopLabelContainer>
            <Label htmlFor="progress_stat">{t('progress_stat')}</Label>
            <SelectCustomSimple
              id="select-progress-stat"
              options={statOptions}
              value={evStat}
              onChange={(value) => refreshUI((item.stat = value.replace('_STAGE', '') as StudioEVBoostItem['stat']))}
            />
          </InputWithTopLabelContainer>
        )}
        <InputWithLeftLabelContainer>
          <Label htmlFor="value">{t('value')}</Label>
          {isItemEvBoost && (
            <Input
              type="number"
              name="value"
              value={isNaN(item.count) ? '' : item.count}
              min="-999"
              max="999"
              onChange={(event) => {
                const value = parseInt(event.target.value);
                if (value < -999 || value > 999) return event.preventDefault();
                refreshUI((item.count = value));
              }}
              onBlur={() => refreshUI((item.count = cleanNaNValue(item.count)))}
            />
          )}
          {isItemLevel && (
            <Input
              type="number"
              name="value"
              value={isNaN(item.levelCount) ? '' : item.levelCount}
              min="-999"
              max="999"
              onChange={(event) => {
                const value = parseInt(event.target.value);
                if (value < -999 || value > 999) return event.preventDefault();
                refreshUI((item.levelCount = value));
              }}
              onBlur={() => refreshUI((item.levelCount = cleanNaNValue(item.levelCount)))}
            />
          )}
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
};
