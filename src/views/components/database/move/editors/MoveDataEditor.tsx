import React, { forwardRef, useMemo } from 'react';
import { Editor } from '@components/editor';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { MOVE_CRITICAL_RATES, MOVE_VALIDATOR, TEXT_CRITICAL_RATES } from '@modelEntities/move';
import { useMovePage } from '@hooks/usePage';
import { useUpdateMove } from './useUpdateMove';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useZodForm } from '@hooks/useZodForm';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { InputFormContainer } from '@components/inputs/InputContainer';

const moveCrititalRateEntries = (t: TFunction<'database_moves'>) =>
  MOVE_CRITICAL_RATES.map((critialRate) => ({ value: critialRate.toString(), label: t(TEXT_CRITICAL_RATES[critialRate]) }));

const DATA_EDITOR_SCHEMA = MOVE_VALIDATOR.pick({
  power: true,
  accuracy: true,
  pp: true,
  effectChance: true,
  priority: true,
  mapUse: true,
  movecriticalRate: true,
});

export const MoveDataEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_moves');
  const { move } = useMovePage();
  const updateMove = useUpdateMove(move);
  const { canClose, getFormData, onInputTouched, defaults, formRef } = useZodForm(DATA_EDITOR_SCHEMA, move);
  const { EmbeddedUnitInput, Input, Select } = useInputAttrsWithLabel(DATA_EDITOR_SCHEMA, defaults);
  const criticalRateOptions = useMemo(() => moveCrititalRateEntries(t), [t]);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) updateMove(result.data);
  };

  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('data')}>
      <InputFormContainer ref={formRef}>
        <Input name="power" label={t('power')} labelLeft onInput={onInputTouched} />
        <Input name="accuracy" label={t('accuracy')} labelLeft onInput={onInputTouched} />
        <Input name="pp" label={t('pp')} labelLeft onInput={onInputTouched} />
        <Select name="movecriticalRate" label={t('critical_rate')} options={criticalRateOptions} data-input-type="number" />
        <EmbeddedUnitInput name="effectChance" label={t('effect_chance')} labelLeft onInput={onInputTouched} />
        <Input name="priority" label={t('priority')} labelLeft onInput={onInputTouched} />
        <Input name="mapUse" label={t('common_event')} labelLeft onInput={onInputTouched} />
      </InputFormContainer>
    </Editor>
  );
});
MoveDataEditor.displayName = 'MoveDataEditor';
