import { InputWithLeftLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { InputNumber2 } from './InputNumber';
import { QuestGoalProps } from './QuestGoalProps';
import React from 'react';

type ObjectivesEgg = 'objective_obtain_egg' | 'objective_hatch_egg';

export const QuestGoalEgg = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const { t } = useTranslation('database_quests');
  const eggMethodName = objective.objectiveMethodName as ObjectivesEgg;

  const index: Record<ObjectivesEgg, number> = {
    objective_obtain_egg: 0,
    objective_hatch_egg: 1,
  };

  return (
    <PaddedInputContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-egg">{t('amount_egg')}</Label>
        <InputNumber2
          name="amount-egg"
          ref={refs.valueRef}
          defaultValue={objective.objectiveMethodArgs[index[eggMethodName]] as number}
          onChange={() => checkIsValid && checkIsValid()}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
