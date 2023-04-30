import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EvolutionConditionEditorInput } from './InputProps';

export const GenderInput = ({ state, inputRefs }: EvolutionConditionEditorInput) => {
  const { t } = useTranslation('database_pokemon');
  const [value, setValue] = useState<string | undefined>(state.defaults.gender?.toString());
  const options = useMemo(
    () => [
      { value: '1', label: t('evolutionValue_gender_male') } as const,
      { value: '2', label: t('evolutionValue_gender_female') } as const,
      { value: '0', label: t('evolutionValue_gender_unknown') } as const,
    ],
    []
  );

  return (
    <InputWithTopLabelContainer>
      <Label>{t('evolutionValue_gender')}</Label>
      <SelectCustomSimple
        id="gender-DropDown"
        options={options}
        value={value || '0'}
        onChange={(value) => {
          if (inputRefs.current.gender) inputRefs.current.gender.value = value;
          setValue(value);
        }}
      />
      <input type="hidden" ref={(ref) => (inputRefs.current.gender = ref)} defaultValue={value} />
    </InputWithTopLabelContainer>
  );
};
