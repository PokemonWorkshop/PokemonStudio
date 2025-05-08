import { InputWithLeftLabelContainer, Label, PaddedInputContainer, Toggle } from '@components/inputs';
import { ObjectiveEggIndex, ObjectivesEgg } from '@utils/QuestUtils';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { InputNumber2 } from './InputNumber';
import { QuestGoalProps } from './QuestGoalProps';

export const QuestGoalEgg = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const { t } = useTranslation();
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
      <InputWithLeftLabelContainer>
        <Label htmlFor="hidden-by-default">{t('hidden_default')}</Label>
        <Toggle
          ref={refs.hiddenByDefaultRef}
          name="hidden-by-default"
          defaultChecked={objective.hiddenByDefault}
          onChange={() => checkIsValid && checkIsValid()}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
