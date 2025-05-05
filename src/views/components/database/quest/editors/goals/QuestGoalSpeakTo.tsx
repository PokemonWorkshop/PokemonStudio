import { Input, InputWithTopLabelContainer, Label, PaddedInputContainer } from '@components/inputs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';

export const QuestGoalSpeakTo = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const { t } = useTranslation();

  return (
    <PaddedInputContainer>
      <InputWithTopLabelContainer>
        <Label htmlFor="speak-to" required>
          {t('event_name')}
        </Label>
        <Input
          ref={refs.nameRef}
          type="text"
          name="speak-to"
          defaultValue={objective.objectiveMethodArgs[1] as string}
          onChange={() => checkIsValid && checkIsValid()}
          placeholder={t('example_speak_to')}
        />
      </InputWithTopLabelContainer>
    </PaddedInputContainer>
  );
};
