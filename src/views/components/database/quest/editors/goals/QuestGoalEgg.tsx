import { useRefreshUI } from '@components/editor';
import { InputWithLeftLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputNumber } from './InputNumber';
import { QuestGoalProps } from './QuestGoalProps';

type ObjectivesEgg = 'objective_obtain_egg' | 'objective_hatch_egg';

export const QuestGoalEgg = ({ objective }: QuestGoalProps) => {
  const { t } = useTranslation('database_quests');
  const refreshUI = useRefreshUI();
  const eggMethodName = objective.objectiveMethodName as ObjectivesEgg;

  const index: Record<ObjectivesEgg, number> = {
    objective_obtain_egg: 0,
    objective_hatch_egg: 1,
  };

  return (
    <PaddedInputContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-egg">{t('amount_egg')}</Label>
        <InputNumber
          name="amount-egg"
          value={objective.objectiveMethodArgs[index[eggMethodName]] as number}
          setValue={(value: number) => refreshUI((objective.objectiveMethodArgs[index[eggMethodName]] = value))}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
