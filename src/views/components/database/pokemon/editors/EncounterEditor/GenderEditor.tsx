import { useInputAttrsWithLabel } from '@src/hooks/useInputAttrs';
import React, { useRef } from 'react';
import { ENCOUNTER_EDITOR_SCHEMA } from './EncounterEditorSchema';
import { useTranslation } from 'react-i18next';

type GenderEditorProps = {
  getRawFormData: () => Record<string, unknown>;
  onTouched: React.FormEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  defaults: Record<string, unknown>;
  formRef: React.RefObject<HTMLFormElement>;
};

export const GenderEditor = ({ getRawFormData, onTouched, defaults, formRef }: GenderEditorProps) => {
  const { t } = useTranslation('database_pokemon');
  const { EmbeddedUnitInput, Toggle } = useInputAttrsWithLabel(ENCOUNTER_EDITOR_SCHEMA, defaults);
  const divRef = useRef<HTMLDivElement>(null);
  const isGenderless = Boolean(getRawFormData().isGenderLess ?? defaults.isGenderLess === 'true');

  const onStateChange: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget }) => {
    const femaleRateElement = formRef.current?.elements.namedItem('femaleRate');
    if (!(femaleRateElement instanceof HTMLInputElement)) return;

    femaleRateElement.value = '0';
    const isGenderless = currentTarget.checked;
    if (divRef.current) divRef.current.style.display = isGenderless ? 'none' : 'block';
  };

  return (
    <>
      <Toggle name="isGenderLess" label={t('genderless')} onChange={onStateChange} onInput={onTouched} />
      <div style={{ display: isGenderless ? 'none' : undefined }} ref={divRef}>
        <EmbeddedUnitInput name="femaleRate" unit="%" type="number" label={t('female_rate')} labelLeft onInput={onTouched} />
      </div>
    </>
  );
};
