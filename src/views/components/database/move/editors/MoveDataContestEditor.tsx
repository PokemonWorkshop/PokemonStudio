import React, { forwardRef } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { MOVE_VALIDATOR } from '@modelEntities/move';
import { useMovePage } from '@hooks/usePage';
import { useUpdateMove } from './useUpdateMove';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useZodForm } from '@hooks/useZodForm';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { InputFormContainer } from '@components/inputs/InputContainer';

const DATA_EDITOR_SCHEMA = MOVE_VALIDATOR.pick({
  appeal: true,
  jam: true,
});

export const MoveDataContestEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation();
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const { canClose, getFormData, onInputTouched, defaults, formRef } = useZodForm(DATA_EDITOR_SCHEMA, move);
  const { Input } = useInputAttrsWithLabel(DATA_EDITOR_SCHEMA, defaults);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) updateMove(result.data);
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('data')}>
      <InputFormContainer ref={formRef}>
        <Input name="appeal" label={t('appeal')} labelLeft onInput={onInputTouched} />
        <Input name="jam" label={t('jam')} labelLeft onInput={onInputTouched} />
      </InputFormContainer>
    </Editor>
  );
});
MoveDataContestEditor.displayName = 'MoveDataContestEditor';
