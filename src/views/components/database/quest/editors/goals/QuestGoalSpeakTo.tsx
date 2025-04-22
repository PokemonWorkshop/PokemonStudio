import { Input, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer, Toggle } from '@components/inputs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';

export const QuestGoalSpeakTo = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const { t } = useTranslation('database_quests');

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
