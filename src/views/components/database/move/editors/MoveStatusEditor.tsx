import React, { forwardRef, useMemo, useState } from 'react';
import { Editor } from '@components/editor';
import { TFunction, useTranslation } from 'react-i18next';
import { MOVE_STATUS_LIST, StudioMove, StudioMoveStatusList } from '@modelEntities/move';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@utils/usePage';
import { useUpdateMove } from './useUpdateMove';
import { useZodForm } from '@utils/useZodForm';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { cloneEntity } from '@utils/cloneEntity';
import { STATUS_EDITOR_SCHEMA } from './MoveStatusEditor/StatusEditorSchema';
import { StatusEditor } from './MoveStatusEditor/StatusEditor';

type StudioMoveStatusListEditor = Exclude<StudioMoveStatusList, null> | '__undef__';

const moveStatusEntries = (t: TFunction<'database_moves'>) => [
  { value: '__undef__', label: t('none') },
  ...MOVE_STATUS_LIST.map((status) => ({
    value: status,
    label: t(status),
  })).sort((a, b) => a.label.localeCompare(b.label)),
];

const initMoveStatus = (move: StudioMove) => {
  const moveWithStatus = cloneEntity(move);
  const count = 3 - moveWithStatus.moveStatus.length;

  for (let i = 0; i < count; i++) {
    moveWithStatus.moveStatus.push({ status: '__undef__', luckRate: 0 });
  }
  return moveWithStatus;
};

export const MoveStatusEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_moves');
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const moveWithStatus = useMemo(() => initMoveStatus(move), [move]);
  const { canClose, getFormData, getRawFormData, onInputTouched: onTouched, defaults, formRef } = useZodForm(STATUS_EDITOR_SCHEMA, moveWithStatus);
  const statusOptions = useMemo(() => moveStatusEntries(t), [t]);
  const [updateStatus, setUpdateStatus] = useState<boolean>(false);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) {
      const moveStatus = result.data.moveStatus.filter(({ status }) => status !== '__undef__');
      updateMove({ moveStatus });
    }
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('statuses')}>
      <InputFormContainer ref={formRef}>
        <StatusEditor
          index={0}
          options={statusOptions}
          getRawFormData={getRawFormData}
          onTouched={onTouched}
          defaults={defaults}
          updateStatus={updateStatus}
          setUpdateStatus={setUpdateStatus}
        />
        <StatusEditor
          index={1}
          options={statusOptions}
          getRawFormData={getRawFormData}
          onTouched={onTouched}
          defaults={defaults}
          updateStatus={updateStatus}
          setUpdateStatus={setUpdateStatus}
        />
        <StatusEditor
          index={2}
          options={statusOptions}
          getRawFormData={getRawFormData}
          onTouched={onTouched}
          defaults={defaults}
          updateStatus={updateStatus}
          setUpdateStatus={setUpdateStatus}
        />
      </InputFormContainer>
    </Editor>
  );
});
MoveStatusEditor.displayName = 'MoveStatusEditor';
