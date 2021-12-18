import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputProps } from './InputProps';

export const DayNightInput = ({ condition, index, onChange }: InputProps) => {
  const { t } = useTranslation('database_pokemon');
  const options = [
    { value: '3', label: t('evolutionValue_dayNight_day') },
    { value: '1', label: t('evolutionValue_dayNight_sunset') },
    { value: '0', label: t('evolutionValue_dayNight_night') },
    { value: '2', label: t('evolutionValue_dayNight_morning') },
  ];

  if (condition.type === 'dayNight') {
    return (
      <InputWithTopLabelContainer>
        <Label>{t('evolutionValue_dayNight')}</Label>
        <SelectCustomSimple
          id="dayNight-DropDown"
          options={options}
          value={condition.value.toString()}
          onChange={(value) => onChange({ type: 'dayNight', value: Number(value) }, index)}
        />
      </InputWithTopLabelContainer>
    );
  }

  return <></>;
};
