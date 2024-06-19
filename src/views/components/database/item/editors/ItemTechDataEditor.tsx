import React, { forwardRef, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Editor } from '@components/editor';
import { Input, InputContainer, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { SelectMove } from '@components/selects';
import { ITEM_DESCRIPTION_TEXT_ID, LOCKED_ITEM_EDITOR } from '@modelEntities/item';
import { DbSymbol } from '@modelEntities/dbSymbol';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useItemPage } from '@hooks/usePage';
import { useUpdateItem } from './useUpdateItem';
import { useProjectDataReadonly } from '@hooks/useProjectData';
import { useCopyProjectText } from '@utils/ReadingProjectText';
import { MOVE_DESCRIPTION_TEXT_ID } from '@modelEntities/move';

export const ItemTechDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { currentItem: item } = useItemPage();
  const { projectDataValues: moves } = useProjectDataReadonly('moves', 'move');
  const { t } = useTranslation(['database_items', 'database_moves']);
  const setItems = useUpdateItem(item);
  const copyText = useCopyProjectText();

  const flingPowerRef = useRef<HTMLInputElement>(null);

  const isTechItem = item.klass === 'TechItem';
  const [techForm, setTechForm] = useState<{ isHm: boolean; move: DbSymbol }>({
    isHm: isTechItem ? item.isHm : false,
    move: isTechItem ? item.move : ('' as DbSymbol),
  });

  const machineOptions = useMemo(
    () =>
      (['hm', 'tm'] as const)
        .map((machine) => ({ value: machine, label: t(`database_items:${machine}`) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [t]
  );

  const canClose = () => !!flingPowerRef.current && flingPowerRef?.current.validity.valid;

  const handleClose = () => {
    const flingPower = flingPowerRef.current && !isNaN(flingPowerRef.current.valueAsNumber) ? flingPowerRef.current.valueAsNumber : item.flingPower;

    if (isTechItem) {
      const move = moves[techForm.move];
      if (!move) return;

      copyText({ fileId: MOVE_DESCRIPTION_TEXT_ID, textId: move.id + 1 }, { fileId: ITEM_DESCRIPTION_TEXT_ID, textId: item.id + 1 });
      setItems({ ...techForm, flingPower: flingPower });
    } else {
      setItems({ flingPower: flingPower });
    }
  };

  useEditorHandlingClose(ref, handleClose, canClose);

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
              value={machineOptions[techForm.isHm ? 0 : 1].value}
              onChange={(value) => setTechForm((prevFormData) => ({ ...prevFormData, isHm: value === 'hm' }))}
              noTooltip
            />
          </InputWithTopLabelContainer>
        )}
        {isTechItem && (
          <InputWithTopLabelContainer>
            <Label htmlFor="move_learnt">{t('database_items:move_learnt')}</Label>
            <SelectMove
              dbSymbol={techForm.move}
              onChange={(dbSymbol) => setTechForm((prevFormData) => ({ ...prevFormData, move: dbSymbol as DbSymbol }))}
              noLabel
            />
          </InputWithTopLabelContainer>
        )}
        <InputWithLeftLabelContainer>
          <Label htmlFor="fling">{t('database_items:fling')}</Label>
          <Input type="number" name="fling" defaultValue={item.flingPower} ref={flingPowerRef} min="0" max="999" />
        </InputWithLeftLabelContainer>
      </InputContainer>
    </Editor>
  );
});
ItemTechDataEditor.displayName = 'ItemTechDataEditor';
