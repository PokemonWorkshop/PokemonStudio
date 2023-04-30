import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EvolutionConditionEditorInput } from './InputProps';

export const DayNightInput = ({ state, inputRefs }: EvolutionConditionEditorInput) => {
  const { t } = useTranslation('database_pokemon');
  const [value, setValue] = useState<string | undefined>(state.defaults.dayNight?.toString());
  const options = useMemo(
    () => [
      { value: '3', label: t('evolutionValue_dayNight_day') } as const,
      { value: '1', label: t('evolutionValue_dayNight_sunset') } as const,
      { value: '0', label: t('evolutionValue_dayNight_night') } as const,
      { value: '2', label: t('evolutionValue_dayNight_morning') } as const,
    ],
    []
  );

  return (
    <InputWithTopLabelContainer>
      <Label>{t('evolutionValue_dayNight')}</Label>
      <SelectCustomSimple
        id="dayNight-DropDown"
        options={options}
        value={value || '0'}
        onChange={(value) => {
          if (inputRefs.current.dayNight) inputRefs.current.dayNight.value = value;
          setValue(value);
        }}
      />
      <input type="hidden" ref={(ref) => (inputRefs.current.dayNight = ref)} defaultValue={value} />
    </InputWithTopLabelContainer>
  );
};
