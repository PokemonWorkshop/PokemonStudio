import { InputContainer, InputWithLeftLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { QuestGoalConditions } from './QuestGoalConditions';
import { QuestGoalProps } from './QuestGoalProps';
import { InputNumber2 } from './InputNumber';
import { useTranslation } from 'react-i18next';
import { StudioQuestObjective } from '@modelEntities/quest';
import React from 'react';

type QuestGoalCatchPokemonProps = {
  setObjective: (objective: StudioQuestObjective) => void;
} & QuestGoalProps;

export const QuestGoalCatchPokemon = ({ objective, refs, checkIsValid, setObjective }: QuestGoalCatchPokemonProps) => {
  const { t } = useTranslation('database_quests');
  return (
    <InputContainer>
      <PaddedInputContainer>
        <InputWithLeftLabelContainer>
          <Label htmlFor="amount-catch-creature">{t('amount')}</Label>
          <InputNumber2
            name="amount-catch-creature"
            ref={refs.valueRef}
            defaultValue={objective.objectiveMethodArgs[1] as number}
            onChange={() => checkIsValid && checkIsValid()}
          />
        </InputWithLeftLabelContainer>
      </PaddedInputContainer>
      <QuestGoalConditions objective={objective} setObjective={setObjective} />
    </InputContainer>
  );
};
