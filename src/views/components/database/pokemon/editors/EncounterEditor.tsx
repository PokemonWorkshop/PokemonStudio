import { Editor } from '@components/editor/Editor';
import { EditorHandlingClose, useEditorHandlingClose } from '@components/editor/useHandleCloseEditor';
import { InputWithLeftLabelContainer, Label, Toggle } from '@components/inputs';
import { useCreaturePage } from '@utils/usePage';
import { useSelectOptions } from '@utils/useSelectOptions';
import React, { forwardRef, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateForm } from './useUpdateForm';
import { useZodForm } from '@utils/useZodForm';
import { useInputAttrsWithLabel } from '@utils/useInputAttrs';
import { InputFormContainer } from '@components/inputs/InputContainer';
import { ENCOUNTER_EDITOR_SCHEMA } from './EncounterEditor/EncounterEditorSchema';
import { ItemHeldEditor } from './EncounterEditor/ItemHeldEditor';

export const EncounterEditor = forwardRef<EditorHandlingClose>((_, ref) => {
  const { t } = useTranslation('database_pokemon');
  const { t: tSelect } = useTranslation('select');
  const { creature, form } = useCreaturePage();
  const updateForm = useUpdateForm(creature, form);
  const itemOptions = useSelectOptions('itemHeld');
  const options = useMemo(() => [{ value: 'none', label: tSelect('none') }, ...itemOptions], []);
  const divRef = useRef<HTMLDivElement>(null);
  const genderlessRef = useRef<HTMLInputElement>(null);
  const { canClose, getFormData, getRawFormData, onInputTouched: onTouched, defaults, formRef } = useZodForm(ENCOUNTER_EDITOR_SCHEMA, form);
  const { Input, EmbeddedUnitInput } = useInputAttrsWithLabel(ENCOUNTER_EDITOR_SCHEMA, defaults);

  const onClose = () => {
    const result = canClose() && getFormData();
    if (result && result.success) {
      const femaleRate = result.data.femaleRate;
      const hasFemale = femaleRate <= 0 || femaleRate === 100 ? femaleRate === 100 : form.resources.hasFemale;
      updateForm({ ...result.data, resources: { ...form.resources, hasFemale } });
    }
  };
  useEditorHandlingClose(ref, onClose, canClose);

  const isGenderless = Number(getRawFormData().femaleRate ?? defaults.femaleRate) === -1;
  const onStateChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    const isFemaleRate = currentTarget.name === 'femaleRate';
    const femaleRateElement = isFemaleRate ? currentTarget : formRef.current?.elements.namedItem('femaleRate');
    if (!(femaleRateElement instanceof HTMLInputElement) || !genderlessRef.current) return;

    const isGenderless = isFemaleRate ? currentTarget.valueAsNumber === -1 : currentTarget.checked;
    if (isFemaleRate && genderlessRef.current) genderlessRef.current.checked = isGenderless;
    if (!isFemaleRate) femaleRateElement.value = `${isGenderless ? -1 : Math.max(0, form.femaleRate)}`;
    if (divRef.current) divRef.current.style.display = isGenderless ? 'none' : 'block';
  };

  return (
    <Editor type="edit" title={t('encounter')}>
      <InputFormContainer ref={formRef}>
        <Input name="catchRate" label={t('catch_rate')} labelLeft onInput={onTouched} />
        <InputWithLeftLabelContainer>
          <Label>{t('genderless')}</Label>
          <Toggle defaultChecked={isGenderless} onChange={onStateChange} ref={genderlessRef} />
        </InputWithLeftLabelContainer>
        <div style={{ display: isGenderless ? 'none' : undefined }} ref={divRef}>
          <EmbeddedUnitInput name="femaleRate" unit="%" type="number" label={t('female_rate')} labelLeft onInput={onTouched} onBlur={onStateChange} />
        </div>
        <ItemHeldEditor index={0} options={options} getRawFormData={getRawFormData} defaults={defaults} onTouched={onTouched} />
        <ItemHeldEditor index={1} options={options} getRawFormData={getRawFormData} defaults={defaults} onTouched={onTouched} />
      </InputFormContainer>
    </Editor>
  );
});
EncounterEditor.displayName = 'EncounterEditor';
