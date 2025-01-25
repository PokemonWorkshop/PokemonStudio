import { InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';
import { InputNumber2 } from './InputNumber';
import React from 'react';

export const QuestGoalCustom = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const { t } = useTranslation('database_quests');

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="custom-objective" required>
          {t('objective_custom')}
        </Label>
        <InputNumber2
          ref={refs.nameRef}
          name="custom-objective"
          defaultValue={objective.objectiveMethodArgs[1] as number}
          onChange={() => checkIsValid && checkIsValid()}
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
