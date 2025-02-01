import React from 'react';
import { useRefreshUI } from '@components/editor';
import { InputContainer, InputWithTopLabelContainer, Label } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestEarningProps } from './QuestEarningProps';
import { SelectPokemon } from '@components/selects/SelectPokemon';

export const QuestEarningPokemon = ({ earning }: QuestEarningProps) => {
  const { t } = useTranslation();
  const refreshUI = useRefreshUI();
  return (
    <InputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-pokemon">{t('pokemon')}</Label>
        <SelectPokemon
          dbSymbol={earning.earningArgs[0] as string}
          onChange={(value) => refreshUI((earning.earningArgs[0] = value))}
          undefValueOption={t('none')}
          noLabel
        />
      </InputWithTopLabelContainer>
    </InputContainer>
  );
};
