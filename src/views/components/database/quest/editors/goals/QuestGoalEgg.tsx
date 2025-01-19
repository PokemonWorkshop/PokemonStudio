import { InputWithLeftLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { InputNumber2 } from './InputNumber';
import { QuestGoalProps } from './QuestGoalProps';
import { ObjectiveEggIndex, ObjectivesEgg } from '@utils/QuestUtils';
import React from 'react';

export const QuestGoalEgg = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const { t } = useTranslation('database_quests');
  const eggMethodName = objective.objectiveMethodName as ObjectivesEgg;

  return (
    <PaddedInputContainer>
      <InputWithLeftLabelContainer>
        <Label htmlFor="amount-egg">{t('amount_egg')}</Label>
        <InputNumber2
          name="amount-egg"
          ref={refs.valueRef}
          defaultValue={objective.objectiveMethodArgs[ObjectiveEggIndex[eggMethodName]] as number}
          onChange={() => checkIsValid && checkIsValid()}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
