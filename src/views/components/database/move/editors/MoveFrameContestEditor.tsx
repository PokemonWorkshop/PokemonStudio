import React, { forwardRef, useMemo, useRef } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { MOVE_CONDITIONS, MOVE_VALIDATOR } from '@modelEntities/move';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@hooks/usePage';
import { useDialogsRef } from '@hooks/useDialogsRef';
import { MoveTranslationOverlay, TranslationEditorTitle } from './MoveTranslationOverlay';
import { useUpdateMove } from './useUpdateMove';
import { TranslatableTextFields, TranslatableTextFieldsRef } from './MoveFrameEditor/TranslatableTextFields';
import { useZodForm } from '@hooks/useZodForm';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { InputFormContainer } from '@components/inputs/InputContainer';

const moveConditionEntries = (t: TFunction) => MOVE_CONDITIONS.map((condition) => ({ value: condition, label: t(`${condition}`) }));

const FRAME_EDITOR_SCHEMA = MOVE_VALIDATOR.pick({ condition: true });

export const MoveFrameContestEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation();
  const { move, moveName } = useMovePage();
  const updateMove = useUpdateMove(move);
  const dialogsRef = useDialogsRef<TranslationEditorTitle>();
  const tTFR = useRef<TranslatableTextFieldsRef>(null);
  const { canClose, getFormData, defaults, formRef } = useZodForm(FRAME_EDITOR_SCHEMA, move);
  const { Select } = useInputAttrsWithLabel(FRAME_EDITOR_SCHEMA, defaults);
  const conditionOptions = useMemo(() => moveConditionEntries(t), [t]);

  const canCloseEditor = () => {
    if (dialogsRef.current?.currentDialog) return false;
    return canClose();
  };

  const onClose = () => {
    const result = canClose() && getFormData();
    if (!result || !result.success) return;

    tTFR.current?.saveTexts();
    updateMove(result.data);
  };
  useEditorHandlingClose(ref, onClose, canCloseEditor);

  const handleTranslateClick = (editorTitle: TranslationEditorTitle) => () => {
    tTFR.current?.saveTexts();
    setTimeout(() => dialogsRef.current?.openDialog(editorTitle), 0);
  };
  const onTranslationOverlayClose = () => tTFR.current?.onTranslationOverlayClose();

  return (
    <Editor type="edit" title={t('information')}>
      <InputFormContainer ref={formRef}>
        <TranslatableTextFields ref={tTFR} handleTranslateClick={handleTranslateClick} move={move} moveName={moveName} contest={true} />
        <Select name="condition" label={t('contest_condition')} options={conditionOptions} />
      </InputFormContainer>
      <MoveTranslationOverlay move={move} onClose={onTranslationOverlayClose} ref={dialogsRef} />
    </Editor>
  );
});
MoveFrameContestEditor.displayName = 'MoveFrameContestEditor';
