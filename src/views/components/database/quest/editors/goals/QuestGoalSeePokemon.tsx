import React from 'react';
import { useRefreshUI } from '@components/editor';
import { InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';
import { SelectPokemon } from '@components/selects/SelectPokemon';

export const QuestGoalSeePokemon = ({ objective }: QuestGoalProps) => {
  const { t } = useTranslation(['database_pokemon', 'select']);
  const refreshUI = useRefreshUI();
  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-pokemon">{t('database_pokemon:pokemon')}</Label>
        <SelectPokemon
          dbSymbol={objective.objectiveMethodArgs[0] as string}
          onChange={(value) => refreshUI((objective.objectiveMethodArgs[0] = value))}
          undefValueOption={t('select:none')}
          noLabel
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
