import React, { forwardRef, useMemo } from 'react';
import { Editor } from '@components/editor';
import { TFunction, useTranslation } from 'react-i18next';
import { MOVE_BATTLE_ENGINE_METHODS, MOVE_TARGETS, MOVE_VALIDATOR } from '@modelEntities/move';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useMovePage } from '@hooks/usePage';
import { useUpdateMove } from './useUpdateMove';
import { useZodForm } from '@hooks/useZodForm';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { BattleEngineMethodEditor } from './MoveParametersEditor/BattleEngineMethodEditor';

const targetEntries = (t: TFunction<'database_moves'>) => MOVE_TARGETS.map((target) => ({ value: target, label: t(`${target}`) }));

const battleEngineMethodEntries = (t: TFunction<'database_moves'>) => [
  ...MOVE_BATTLE_ENGINE_METHODS.map((beMethod) => ({ value: beMethod, label: t(`${beMethod}`) })),
  { value: '__custom__', label: t('custom') },
];

const PARAMETERS_EDITOR_SCHEMA = MOVE_VALIDATOR.pick({ battleEngineAimedTarget: true, battleEngineMethod: true });

export const MoveParametersEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_moves');
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const { canClose, getFormData, getRawFormData, defaults, formRef } = useZodForm(PARAMETERS_EDITOR_SCHEMA, move);
  const { Select } = useInputAttrsWithLabel(PARAMETERS_EDITOR_SCHEMA, defaults);
  const targetOptions = useMemo(() => targetEntries(t), [t]);
  const categoryOptions = useMemo(() => battleEngineMethodEntries(t), [t]);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) updateMove(result.data);
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('settings')}>
      <InputFormContainer ref={formRef}>
        <Select name="battleEngineAimedTarget" label={t('target')} options={targetOptions} />
        <BattleEngineMethodEditor move={move} options={categoryOptions} getRawFormData={getRawFormData} defaults={defaults} />
      </InputFormContainer>
    </Editor>
  );
});
MoveParametersEditor.displayName = 'MoveParametersEditor';
