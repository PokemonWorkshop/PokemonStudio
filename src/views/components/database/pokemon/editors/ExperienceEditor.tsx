import { Editor } from '@components/editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useCreaturePage } from '@utils/usePage';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateForm } from './useUpdateForm';
import { useZodForm } from '@utils/useZodForm';
import { useInputAttrsWithLabel } from '@utils/useInputAttrs';
import { CREATURE_FORM_VALIDATOR } from '@modelEntities/creature';
import { InputFormContainer } from '@components/inputs/InputContainer';

const xpCurveEntries = (curves: string[]) =>
  curves.map((curveType, index) => ({ value: index.toString(), label: curveType })).sort((a, b) => a.label.localeCompare(b.label));

const EXPERIENCE_EDITOR_SCHEMA = CREATURE_FORM_VALIDATOR.pick({ experienceType: true, baseExperience: true, baseLoyalty: true });

export const ExperienceEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const { canClose, getFormData, onInputTouched, defaults, formRef } = useZodForm(EXPERIENCE_EDITOR_SCHEMA, form);
  const { Input, Select } = useInputAttrsWithLabel(EXPERIENCE_EDITOR_SCHEMA, defaults);
  const xpCurveOptions = useMemo(() => xpCurveEntries([t('fast'), t('normal'), t('slow'), t('parabolic'), t('erratic'), t('fluctuating')]), []);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) updateForm(result.data);
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('experience')}>
      <InputFormContainer ref={formRef}>
        <Select name="experienceType" label={t('curveType')} options={xpCurveOptions} data-input-type="number" />
        <Input name="baseExperience" label={t('base_experience')} labelLeft onInput={onInputTouched} />
        <Input name="baseLoyalty" label={t('base_friendship')} labelLeft onInput={onInputTouched} />
      </InputFormContainer>
    </Editor>
  );
});
ExperienceEditor.displayName = 'ExperienceEditor';
