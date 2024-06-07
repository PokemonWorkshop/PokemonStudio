import React, { forwardRef, useMemo, useState } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { StudioMove, StudioMoveStatus } from '@modelEntities/move';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@utils/usePage';
import { useUpdateMove } from './useUpdateMove';
import { useZodForm } from '@utils/useZodForm';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { cloneEntity } from '@utils/cloneEntity';
import { STATUS_EDITOR_SCHEMA } from './MoveStatusEditor/StatusEditorSchema';
import { StatusesEditor } from './MoveStatusEditor/StatusesEditor';
import { Label } from '@components/inputs';

const initMoveStatus = (move: StudioMove) => {
  const moveWithStatus = cloneEntity(move);
  const count = 3 - moveWithStatus.moveStatus.length;

  for (let i = 0; i < count; i++) {
    moveWithStatus.moveStatus.push({ status: '__undef__', luckRate: 100 });
  }
  return moveWithStatus;
};

const cleanMoveStatus = (moveStatus: StudioMoveStatus[]) => {
  const index = moveStatus.findIndex(({ status }) => status === '__undef__');
  if (index !== -1) {
    moveStatus.splice(index, moveStatus.length - index);
  }
  return moveStatus;
};

export const MoveStatusEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_moves');
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const moveWithStatus = useMemo(() => initMoveStatus(move), [move]);
  const {
    canClose: canZodClose,
    getFormData,
    getRawFormData,
    onInputTouched: onTouched,
    defaults,
    formRef,
  } = useZodForm(STATUS_EDITOR_SCHEMA, moveWithStatus);
  const [error, setError] = useState<string>('');

  const canClose = () => {
    if (!canZodClose()) return false;

    const formData = getFormData();
    if (!formData.success) return false;

    const moveStatus = cleanMoveStatus(cloneEntity(formData.data.moveStatus));
    const luckRate = moveStatus.reduce((prev, { luckRate }) => prev + luckRate, 0);
    if (luckRate > 100) {
      setError(t('error_overflow'));
      return false;
    }

    const status = moveStatus.map(({ status }) => status);
    if (new Set(status).size !== status.length) {
      setError(t('error_status'));
      return false;
    }

    return true;
  };

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) {
      const moveStatus = result.data.moveStatus;
      cleanMoveStatus(moveStatus);
      updateMove({ moveStatus });
    }
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('statuses')}>
      <InputFormContainer ref={formRef}>
        <StatusesEditor getRawFormData={getRawFormData} onTouched={onTouched} defaults={defaults} />
        {error && (
          <Label>
            <span>{error}</span>
          </Label>
        )}
      </InputFormContainer>
    </Editor>
  );
});
MoveStatusEditor.displayName = 'MoveStatusEditor';
