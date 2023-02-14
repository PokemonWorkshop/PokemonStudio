import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputProps } from './InputProps';

export const GenderInput = ({ condition, index, onChange }: InputProps) => {
  const { t } = useTranslation('database_pokemon');
  const options = [
    { value: '1', label: t('evolutionValue_gender_male') },
    { value: '2', label: t('evolutionValue_gender_female') },
    { value: '0', label: t('evolutionValue_gender_unknown') },
  ];

  if (condition.type === 'gender') {
    return (
      <InputWithTopLabelContainer>
        <Label>{t('evolutionValue_gender')}</Label>
        <SelectCustomSimple
          id="gender-DropDown"
          options={options}
          value={condition.value.toString()}
          onChange={(value) => onChange({ type: 'gender', value: Number(value) as 0 | 1 | 2 }, index)}
        />
      </InputWithTopLabelContainer>
    );
  }

  return <></>;
};
