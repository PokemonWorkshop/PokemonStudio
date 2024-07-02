import { Editor } from '@components/editor/Editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { useCreaturePage } from '@hooks/usePage';
import { useSelectOptions } from '@hooks/useSelectOptions';
import React, { forwardRef, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateForm } from './useUpdateForm';
import { useZodForm } from '@hooks/useZodForm';
import { useInputAttrsWithLabel } from '@hooks/useInputAttrs';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { ENCOUNTER_EDITOR_SCHEMA } from './EncounterEditor/EncounterEditorSchema';
import { ItemHeldEditor } from './EncounterEditor/ItemHeldEditor';
import { StudioCreatureForm } from '@modelEntities/creature';

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
  const divRef = useRef<HTMLDivElement>(null);
  const { canClose, getFormData, getRawFormData, onInputTouched: onTouched, defaults, formRef } = useZodForm(ENCOUNTER_EDITOR_SCHEMA, initForm(form));
  const { Input, EmbeddedUnitInput, Toggle } = useInputAttrsWithLabel(ENCOUNTER_EDITOR_SCHEMA, defaults);

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

  const isGenderless = Boolean(getRawFormData().isGenderLess ?? defaults.isGenderLess === 'true');

  const onStateChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    const femaleRateElement = formRef.current?.elements.namedItem('femaleRate');
    if (!(femaleRateElement instanceof HTMLInputElement)) return;

    femaleRateElement.value = '0';
    const isGenderless = currentTarget.checked;
    if (divRef.current) divRef.current.style.display = isGenderless ? 'none' : 'block';
  };

  return (
    <Editor type="edit" title={t('encounter')}>
      <InputFormContainer ref={formRef}>
        <Input name="catchRate" label={t('catch_rate')} labelLeft onInput={onTouched} />
        <Toggle name="isGenderLess" label={t('genderless')} onChange={onStateChange} onInput={onTouched} />
        <div style={{ display: isGenderless ? 'none' : undefined }} ref={divRef}>
          <EmbeddedUnitInput name="femaleRate" unit="%" type="number" label={t('female_rate')} labelLeft onInput={onTouched} />
        </div>
        <ItemHeldEditor index={0} options={options} getRawFormData={getRawFormData} defaults={defaults} onTouched={onTouched} />
        <ItemHeldEditor index={1} options={options} getRawFormData={getRawFormData} defaults={defaults} onTouched={onTouched} />
      </InputFormContainer>
    </Editor>
  );
});
EncounterEditor.displayName = 'EncounterEditor';
