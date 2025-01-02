import { InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestUpdateGoalProps } from './QuestGoalProps';
import { SelectPokemon } from '@components/selects/SelectPokemon';
import React from 'react';

export const QuestGoalSeePokemon = ({ objective, updateObjective }: QuestUpdateGoalProps) => {
  const { t } = useTranslation(['database_pokemon', 'select']);
  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-pokemon">{t('database_pokemon:pokemon')}</Label>
        <SelectPokemon
          dbSymbol={objective.objectiveMethodArgs[0] as string}
          onChange={(value) => updateObjective(0, value)}
          undefValueOption={t('select:none')}
          noLabel
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
