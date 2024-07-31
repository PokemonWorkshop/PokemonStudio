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
  const item = cloneEntity(currentItem) as StudioEVBoostItem | StudioLevelIncreaseItem | StudioExpIncreaseItem;
  const setItems = useUpdateItem(item);

  const [klass, setKlass] = useState<string>(currentItem.klass);
  const [stat, setStat] = useState((item as StudioEVBoostItem).stat || 'ATK');

  const countRef = useRef<HTMLInputElement>(null);
  const levelCountRef = useRef<HTMLInputElement>(null);
  const expCountRef = useRef<HTMLInputElement>(null);

  const progressOptions = useMemo(
    () => progressCategories.map((category) => ({ value: category, label: t(category) })).sort((a, b) => a.label.localeCompare(b.label)),
    [t]
  );
  const statOptions = useMemo(() => statBoost.map((stat) => ({ value: stat, label: t(stat) })), [t]);

  const handleClose = () => {
    const count = countRef.current?.valueAsNumber ?? (item as StudioEVBoostItem).count;
    const levelCount = levelCountRef.current?.valueAsNumber ?? (item as StudioLevelIncreaseItem).levelCount;
    const expCount = expCountRef.current?.valueAsNumber ?? (item as StudioExpIncreaseItem).expCount;

    const changesToReview = {
      stat,
      count: cleanNaNValue(count),
      levelCount: cleanNaNValue(levelCount),
      expCount: cleanNaNValue(expCount),
    };

    const keysRemove =
      {
        EVBoostItem: ['expCount', 'levelCount'],
        LevelIncreaseItem: ['stat', 'count', 'expCount'],
        ExpGiveItem: ['stat', 'count', 'levelCount'],
      }[klass] || [];

    setItems({ ...changesToReview }, keysRemove);
  };

  const canClose = (): boolean => {
    if (klass === 'EVBoostItem') return !!countRef.current && countRef.current.validity.valid;
    if (klass === 'LevelIncreaseItem') return !!levelCountRef.current && levelCountRef.current.validity.valid;
    if (klass === 'ExpGiveItem') return !!expCountRef.current && expCountRef.current.validity.valid;
    return true;
  };

  useEditorHandlingClose(ref, handleClose, canClose);

  useEffect(() => {
    setKlass(currentItem.klass);
  }, [currentItem.klass]);

  if (LOCKED_ITEM_EDITOR[item.klass].includes('progress')) return null;

  return (
    <Editor type="edit" title={t('progress_title')}>
      <InputContainer>
        <InputWithTopLabelContainer>
          <Label htmlFor="progress_category">{t('progress_category')}</Label>
          <SelectCustomSimple
            id="select-progress-category"
            options={progressOptions}
            value={klass === 'EVBoostItem' ? 'EV_PROGRESS' : klass === 'LevelIncreaseItem' ? 'LEVEL_PROGRESS' : 'EXP_PROGRESS'}
            onChange={(value) => {
              const newKlass = value === 'EV_PROGRESS' ? 'EVBoostItem' : value === 'LEVEL_PROGRESS' ? 'LevelIncreaseItem' : 'ExpGiveItem';
              setKlass(newKlass as StudioItem['klass']);
              setItems(mutateItemToProgressionCategory(item, value as (typeof progressOptions)[number]['value']));
            }}
            noTooltip
          />
        </InputWithTopLabelContainer>
        {klass === 'EVBoostItem' && (
          <InputWithTopLabelContainer>
            <Label htmlFor="progress_stat">{t('progress_stat')}</Label>
            <SelectCustomSimple
              id="select-progress-stat"
              options={statOptions}
              value={`${stat}_STAGE`}
              onChange={(value) => setStat(value.replace('_STAGE', '') as StudioEVBoostItem['stat'])}
            />
          </InputWithTopLabelContainer>
        )}
        <InputWithLeftLabelContainer>
          <Label htmlFor="value">{t('value')}</Label>
          {klass === 'EVBoostItem' && (
            <Input type="number" name="value" defaultValue={cleanNaNValue((item as StudioEVBoostItem).count)} min="-999" max="999" ref={countRef} />
          )}
          {klass === 'LevelIncreaseItem' && (
            <Input
              type="number"
              name="value"
              defaultValue={cleanNaNValue((item as StudioLevelIncreaseItem).levelCount) || 1}
              min="1"
              max="999"
              ref={levelCountRef}
            />
          )}
          {klass === 'ExpGiveItem' && (
            <Input
              type="number"
              name="value"
              defaultValue={cleanNaNValue((item as StudioExpIncreaseItem).expCount) || 1}
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
