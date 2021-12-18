import React from 'react';
import { useRefreshUI } from '@components/editor';
import { InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { SelectPokemon } from '@components/selects';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';

export const QuestGoalSeePokemon = ({ objective }: QuestGoalProps) => {
  const { t } = useTranslation('database_pokemon');
  const refreshUI = useRefreshUI();
  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-pokemon">{t('pokemon')}</Label>
        <SelectPokemon
          dbSymbol={objective.objectiveMethodArgs[0] as string}
          onChange={(selected) => refreshUI((objective.objectiveMethodArgs[0] = selected.value))}
          noLabel
          noneValue
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
