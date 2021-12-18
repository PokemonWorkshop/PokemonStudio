import React from 'react';
import { InputContainer, InputWithLeftLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { PokemonQuestCondition } from '@modelEntities/quest/Quest.model';
import { QuestGoalConditions } from './QuestGoalConditions';
import { QuestGoalProps } from './QuestGoalProps';
import { useRefreshUI } from '@components/editor';
import { InputNumber } from './InputNumber';
import { useTranslation } from 'react-i18next';

export const QuestGoalCatchPokemon = ({ objective }: QuestGoalProps) => {
  const { t } = useTranslation('database_quests');
  const refreshUI = useRefreshUI();
  return (
    <InputContainer>
      <PaddedInputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="amount-item">{t('amount')}</Label>
          <InputNumber
            name="amount-catch-pokemon"
            value={objective.objectiveMethodArgs[1] as number}
            setValue={(value: number) => refreshUI((objective.objectiveMethodArgs[1] = value))}
          />
        </InputWithLeftLabelContainer>
      </PaddedInputContainer>
      <QuestGoalConditions conditions={objective.objectiveMethodArgs[0] as PokemonQuestCondition[]} />
    </InputContainer>
  );
};
