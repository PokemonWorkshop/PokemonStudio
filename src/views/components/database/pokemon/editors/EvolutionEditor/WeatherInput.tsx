import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { DbSymbol } from '@modelEntities/dbSymbol';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputProps } from './InputProps';

export const WeatherInput = ({ condition, index, onChange }: InputProps) => {
  const { t } = useTranslation('database_pokemon');
  const options = [
    { value: 'none', label: t('evolutionValue_weather_none') },
    { value: 'rain', label: t('evolutionValue_weather_rain') },
    { value: 'sunny', label: t('evolutionValue_weather_sunny') },
    { value: 'sandstorm', label: t('evolutionValue_weather_sandstorm') },
    { value: 'hail', label: t('evolutionValue_weather_hail') },
    { value: 'fog', label: t('evolutionValue_weather_fog') },
    { value: 'hardsun', label: t('evolutionValue_weather_hardsun') },
    { value: 'hardrain', label: t('evolutionValue_weather_hardrain') },
  ];

  if (condition.type === 'weather') {
    return (
      <InputWithTopLabelContainer>
        <Label>{t('evolutionValue_weather')}</Label>
        <SelectCustomSimple
          id="weather-DropDown"
          options={options}
          value={condition.value}
          onChange={(value) => onChange({ type: 'weather', value: value as DbSymbol }, index)}
        />
      </InputWithTopLabelContainer>
    );
  }

  return <></>;
};
