import { InputContainer, InputWithLeftLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { QuestGoalConditions } from './QuestGoalConditions';
import { QuestUpdateGoalProps } from './QuestGoalProps';
import { InputNumber } from './InputNumber';
import { useTranslation } from 'react-i18next';
import { StudioQuestObjective } from '@modelEntities/quest';
import React from 'react';

type QuestGoalCatchPokemonProps = {
  setObjective: (objective: StudioQuestObjective) => void;
} & QuestUpdateGoalProps;

export const QuestGoalCatchPokemon = ({ objective, setObjective, updateObjective }: QuestGoalCatchPokemonProps) => {
  const { t } = useTranslation('database_quests');
  return (
    <InputContainer>
      <PaddedInputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="amount-item">{t('amount')}</Label>
          <InputNumber
            name="amount-catch-pokemon"
            value={objective.objectiveMethodArgs[1] as number}
            setValue={(value) => updateObjective(1, value)}
          />
        </InputWithLeftLabelContainer>
      </PaddedInputContainer>
      <QuestGoalConditions objective={objective} setObjective={setObjective} />
    </InputContainer>
  );
};
