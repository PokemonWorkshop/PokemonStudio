import { InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectPokemon } from '@components/selects';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputProps } from './InputProps';

type PokemonInputProps = InputProps & { currentType: 'tradeWith' };

export const PokemonInput = ({ condition, index, onChange, currentType }: PokemonInputProps) => {
  const { t } = useTranslation('database_pokemon');
  if (condition.type !== currentType) return <></>;

  return (
    <InputWithTopLabelContainer>
      <Label>{t('evolutionValue_pokemon')}</Label>
      <SelectPokemon dbSymbol={condition.value} onChange={(option) => onChange({ type: currentType, value: option.value }, index)} noLabel />
    </InputWithTopLabelContainer>
  );
};
