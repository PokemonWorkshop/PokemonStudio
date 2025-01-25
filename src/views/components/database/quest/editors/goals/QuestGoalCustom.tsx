import { InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';
import { InputNumber2 } from './InputNumber';
import React from 'react';

export const QuestGoalCustom = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const { t } = useTranslation('database_quests');
  const defaultValue = Array.isArray(objective.objectiveMethodArgs[0]) ? (objective.objectiveMethodArgs[0][1] as number) : 0;

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="custom-objective" required>
          {t('custom_text')}
        </Label>
        <InputNumber2 ref={refs.valueRef} name="custom-objective" defaultValue={defaultValue} onChange={() => checkIsValid && checkIsValid()} />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
