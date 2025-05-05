import { InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';
import { SelectPokemon2 } from '@components/selects/SelectPokemon';
import { DbSymbol } from '@modelEntities/dbSymbol';
import React from 'react';

export const QuestGoalSeePokemon = ({ objective, refs }: QuestGoalProps) => {
  const { t } = useTranslation();
  const defaultCreature = objective.objectiveMethodArgs[0] === '__undef__' ? undefined : (objective.objectiveMethodArgs[0] as DbSymbol);

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="select-pokemon">{t('creature')}</Label>
        <SelectPokemon2 name="select-pokemon" optionRef={refs.entityRef} defaultValue={defaultCreature} />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
