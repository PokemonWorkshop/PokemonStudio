import { Editor } from '@components/editor/Editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useCreaturePage } from '@hooks/usePage';
import { useSelectOptions } from '@hooks/useSelectOptions';
import React, { forwardRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateForm } from './useUpdateForm';
import { useZodForm } from '@hooks/useZodForm';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { ENCOUNTER_EDITOR_SCHEMA } from './EncounterEditor/EncounterEditorSchema';
import { ItemHeldEditor } from './EncounterEditor/ItemHeldEditor';
import { StudioCreatureForm } from '@modelEntities/creature';
import { GenderEditor } from './EncounterEditor/GenderEditor';

const initForm = (form: StudioCreatureForm) => {
  return {
    ...form,
    isGenderLess: form.femaleRate === -1,
    femaleRate: form.femaleRate === -1 ? 0 : form.femaleRate,
  };
};

export const EncounterEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { t: tSelect } = useTranslation('select');
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const itemOptions = useSelectOptions('itemHeld');
  const options = useMemo(() => [{ value: 'none', label: tSelect('none') }, ...itemOptions], []);
  const { canClose, getFormData, getRawFormData, onInputTouched: onTouched, defaults, formRef } = useZodForm(ENCOUNTER_EDITOR_SCHEMA, initForm(form));
  const { Input } = useInputAttrsWithLabel(ENCOUNTER_EDITOR_SCHEMA, defaults);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) {
      const { isGenderLess, ...data } = result.data;
      const femaleRate = isGenderLess ? -1 : data.femaleRate;
      const hasFemale = femaleRate <= 0 || femaleRate === 100 ? femaleRate === 100 : form.resources.hasFemale;
      updateForm({ ...data, femaleRate, resources: { ...form.resources, hasFemale } });
    }
  };
  useEditorHandlingClose(ref, onClose, canClose);

  return (
    <Editor type="edit" title={t('encounter')}>
      <InputFormContainer ref={formRef}>
        <Input name="catchRate" label={t('catch_rate')} labelLeft onInput={onTouched} />
        <GenderEditor getRawFormData={getRawFormData} defaults={defaults} onTouched={onTouched} formRef={formRef} />
        <ItemHeldEditor index={0} options={options} getRawFormData={getRawFormData} defaults={defaults} onTouched={onTouched} formRef={formRef} />
        <ItemHeldEditor index={1} options={options} getRawFormData={getRawFormData} defaults={defaults} onTouched={onTouched} formRef={formRef} />
      </InputFormContainer>
    </Editor>
  );
});
EncounterEditor.displayName = 'EncounterEditor';
