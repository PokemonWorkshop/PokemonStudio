import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestEarningProps } from './QuestEarningProps';
import { SelectPokemon2 } from '@components/selects/SelectPokemon';
import { DbSymbol } from '@modelEntities/dbSymbol';
import React from 'react';

export const QuestEarningPokemon = ({ earning, refs }: QuestEarningProps) => {
  const { t } = useTranslation('database_pokemon');
  const defaultCreature = earning.earningArgs[0] === '__undef__' ? undefined : (earning.earningArgs[0] as DbSymbol);

  return (
    <InputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-creature">{t('pokemon')}</Label>
        <SelectPokemon2 name="select-creature" optionRef={refs.entityRef} defaultValue={defaultCreature} />
      </InputWithTopLabelContainer>
    </InputContainer>
  );
};
