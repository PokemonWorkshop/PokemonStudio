import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectCustomSimple } from '@components/SelectCustom';
import { DbSymbol } from '@modelEntities/dbSymbol';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EvolutionConditionEditorInput } from './InputProps';

export const WeatherInput = ({ type, state, dispatch }: EvolutionConditionEditorInput) => {
  const { t } = useTranslation();
  const options = useMemo(
    () => [
      { value: '__undef__', label: t('evolution_value_weather_none') } as const,
      { value: 'rain', label: t('evolution_value_weather_rain') } as const,
      { value: 'sunny', label: t('evolution_value_weather_sunny') } as const,
      { value: 'sandstorm', label: t('evolution_value_weather_sandstorm') } as const,
      { value: 'hail', label: t('evolution_value_weather_hail') } as const,
      { value: 'fog', label: t('evolution_value_weather_fog') } as const,
      { value: 'hardsun', label: t('evolution_value_weather_hardsun') } as const,
      { value: 'hardrain', label: t('evolution_value_weather_hardrain') } as const,
    ],
    [t]
  );
  if (type !== 'weather') return null;

  return (
    <InputWithTopLabelContainer>
      <Label>{t('evolution_value_weather')}</Label>
      <SelectCustomSimple
        id="weather-DropDown"
        options={options}
        value={state[type]}
        onChange={(value) => dispatch({ type: 'update', key: type, value: value as DbSymbol })}
      />
    </InputWithTopLabelContainer>
  );
};
