import { InputWithLeftLabelContainer, Label, PaddedInputContainer, Toggle } from '@components/inputs';
import { ObjectiveEggIndex, ObjectivesEgg } from '@utils/QuestUtils';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InputNumber2 } from './InputNumber';
import { QuestGoalProps } from './QuestGoalProps';

export const QuestGoalEgg = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const { t } = useTranslation('database_quests');
  const eggMethodName = objective.objectiveMethodName as ObjectivesEgg;
  const [hiddenByDefault, setHiddenByDefault] = useState(objective.hiddenByDefault);

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
          ref={refs.valueRef}
          name="hidden-by-default"
          checked={hiddenByDefault}
          onChange={(event) => {
            objective.hiddenByDefault = event.target.checked;
            setHiddenByDefault(event.target.checked);
            checkIsValid?.();
          }}
        />
      </InputWithLeftLabelContainer>
    </PaddedInputContainer>
  );
};
