import React from 'react';
import { useRefreshUI } from '@components/editor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { SelectPokemon } from '@components/selects';
import { useTranslation } from 'react-i18next';
import { QuestEarningProps } from './QuestEarningProps';

export const QuestEarningPokemon = ({ earning }: QuestEarningProps) => {
  const { t } = useTranslation('database_pokemon');
  const refreshUI = useRefreshUI();
  return (
    <InputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-pokemon">{t('pokemon')}</Label>
        <SelectPokemon
          dbSymbol={earning.earningArgs[0] as string}
          onChange={(selected) => refreshUI((earning.earningArgs[0] = selected.value))}
          noLabel
          noneValue
        />
      </InputWithTopLabelContainer>
    </InputContainer>
  );
};
