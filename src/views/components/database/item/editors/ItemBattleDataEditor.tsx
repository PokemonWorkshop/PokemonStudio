import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { cleanNaNValue } from '@utils/cleanNaNValue';
import { LOCKED_ITEM_EDITOR, StudioStatBoostItem } from '@modelEntities/item';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@hooks/usePage';
import { cloneEntity } from '@utils/cloneEntity';
import { useUpdateItem } from './useUpdateItem';

const stageBoost = ['ATK_STAGE', 'ATS_STAGE', 'DFE_STAGE', 'DFS_STAGE', 'SPD_STAGE', 'EVA_STAGE', 'ACC_STAGE'] as const;

export const ItemBattleDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem } = useItemPage();
  const item: StudioStatBoostItem = cloneEntity(currentItem) as StudioStatBoostItem;
  const setItems = useUpdateItem(item);
  const { t } = useTranslation('database_items');
  const isStatBoostItem: boolean = item.klass === 'StatBoostItem';
  const statisticOptions = useMemo(() => stageBoost.map((stage) => ({ value: stage, label: t(stage) })), [t]);

  const countRef = useRef<HTMLInputElement>(null);
  const [stat, setStat] = useState(item.stat);

  const handleClose = () => {
    setItems({
      stat: stat,
      count:
        countRef.current && !isNaN(countRef.current.valueAsNumber) && countRef.current.validity.valid
          ? cleanNaNValue(countRef.current.valueAsNumber)
          : item.count,
    });
  };
  useEditorHandlingClose(ref, handleClose);

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
              value={stat}
              onChange={(value) => setStat(value as StudioStatBoostItem['stat'])}
              noTooltip
            />
          </InputWithTopLabelContainer>
          <InputWithLeftLabelContainer>
            <Label htmlFor="value">{t('value')}</Label>
            <Input type="number" defaultValue={item.count} ref={countRef} min="0" max="99" />
          </InputWithLeftLabelContainer>
        </InputContainer>
      )}
    </Editor>
  );
});
ItemBattleDataEditor.displayName = 'ItemBattleDataEditor';
