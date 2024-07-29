import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { mutateItemToProgressionCategory, progressCategories } from './mutateItemToProgressionCategory';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { LOCKED_ITEM_EDITOR, StudioEVBoostItem, StudioExpIncreaseItem, StudioItem, StudioLevelIncreaseItem } from '@modelEntities/item';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@hooks/usePage';
import { useUpdateItem } from './useUpdateItem';
import { cloneEntity } from '@utils/cloneEntity';

const statBoost = ['ATK_STAGE', 'ATS_STAGE', 'DFE_STAGE', 'DFS_STAGE', 'SPD_STAGE', 'EVA_STAGE', 'ACC_STAGE', 'HP_STAGE'] as const;

export const ItemProgressDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_items');
  const { currentItem } = useItemPage();
  const item: StudioEVBoostItem | StudioLevelIncreaseItem | StudioItem | StudioExpIncreaseItem = cloneEntity(currentItem);
  const setItems = useUpdateItem(item);

  const [isItemEvBoost, setEvBoost] = useState<boolean>(currentItem.klass === 'EVBoostItem');
  const [isItemLevel, setItemLevel] = useState<boolean>(currentItem.klass === 'LevelIncreaseItem');
  const [isItemExp, setItemExp] = useState<boolean>(currentItem.klass === 'ExpGiveItem');

  const [klass, setKlass] = useState<string>(currentItem.klass);
  const [stat, setStat] = useState((item as StudioEVBoostItem).stat);

  const countRef = useRef<HTMLInputElement>(null);
  const levelCountRef = useRef<HTMLInputElement>(null);
  const expCountRef = useRef<HTMLInputElement>(null);

  const progressOptions = useMemo(
    () => progressCategories.map((category) => ({ value: category, label: t(category) })).sort((a, b) => a.label.localeCompare(b.label)),
    [t]
  );
  const statOptions = useMemo(() => statBoost.map((stat) => ({ value: stat, label: t(stat) })), [t]);

  const handleClose = () => {
    const count = countRef.current && !isNaN(countRef.current.valueAsNumber) ? countRef.current.valueAsNumber : (item as StudioEVBoostItem).count;
    const levelCount =
      levelCountRef.current && !isNaN(levelCountRef.current.valueAsNumber)
        ? levelCountRef.current.valueAsNumber
        : (item as StudioLevelIncreaseItem).levelCount;
    const expCount =
      expCountRef.current && !isNaN(expCountRef.current.valueAsNumber) ? expCountRef.current.valueAsNumber : (item as StudioExpIncreaseItem).expCount;
    const changesToReview = {
      stat,
      count: cleanNaNValue(count),
      levelCount: cleanNaNValue(levelCount),
      expCount: cleanNaNValue(expCount),
    };

    const r = !isItemEvBoost ? 'count' : !isItemLevel ? 'levelCount' : 'expCount';
    const { [r]: removedProperty, ...changes } = changesToReview;
    setItems({ klass, ...changes } as Partial<StudioItem>);
  };

  const canClose = () => {
    if (isItemEvBoost) {
      return !!countRef.current && countRef?.current.validity.valid;
    }
    if (isItemLevel) {
      return !!levelCountRef.current && levelCountRef?.current.validity.valid;
    }
    if (isItemExp) {
      return !!expCountRef.current && expCountRef?.current.validity.valid;
    }
    return true;
  };

  useEditorHandlingClose(ref, handleClose, canClose);

  useEffect(() => {
    if (klass === 'EVBoostItem') {
      setEvBoost(true);
      setItemLevel(false);
      setItemExp(false);
    } else if (klass === 'LevelIncreaseItem') {
      setEvBoost(false);
      setItemLevel(true);
      setItemExp(false);
    } else if (klass === 'ExpGiveItem') {
      setEvBoost(false);
      setItemLevel(false);
      setItemExp(true);
    }
  }, [klass]);

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
            value={isItemEvBoost ? 'EV_PROGRESS' : isItemLevel ? 'LEVEL_PROGRESS' : 'EXP_PROGRESS'}
            onChange={(value) => {
              if (value === 'EV_PROGRESS') {
                setKlass('EVBoostItem');
              }
              if (value === 'LEVEL_PROGRESS') {
                setKlass('LevelIncreaseItem');
              }
              if (value === 'EXP_PROGRESS') {
                setKlass('ExpGiveItem');
              }
              setItems(mutateItemToProgressionCategory(item, value as (typeof progressOptions)[number]['value']));
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
              value={stat + '_STAGE'}
              onChange={(value) => setStat(value.replace('_STAGE', '') as StudioEVBoostItem['stat'])}
            />
          </InputWithTopLabelContainer>
        )}
        <InputWithLeftLabelContainer>
          <Label htmlFor="value">{t('value')}</Label>
          {isItemEvBoost && (
            <Input type="number" name="value" defaultValue={cleanNaNValue((item as StudioEVBoostItem).count)} min="-999" max="999" ref={countRef} />
          )}
          {isItemLevel && (
            <Input
              type="number"
              name="value"
              defaultValue={cleanNaNValue((item as StudioLevelIncreaseItem).levelCount)}
              min="1"
              max="999"
              ref={levelCountRef}
            />
          )}
          {isItemExp && (
            <Input
              type="number"
              name="value"
              defaultValue={cleanNaNValue((item as StudioExpIncreaseItem).expCount)}
              min="1"
              max="99999"
              ref={expCountRef}
            />
          )}
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
});
ItemProgressDataEditor.displayName = 'ItemProgressDataEditor';
