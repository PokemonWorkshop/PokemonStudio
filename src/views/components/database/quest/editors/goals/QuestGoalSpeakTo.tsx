import { Input, InputWithLeftLabelContainer, InputWithTopLabelContainer, Label, PaddedInputContainer, Toggle } from '@components/inputs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QuestGoalProps } from './QuestGoalProps';

export const QuestGoalSpeakTo = ({ objective, refs, checkIsValid }: QuestGoalProps) => {
  const [hiddenByDefault, setHiddenByDefault] = useState(objective.hiddenByDefault);
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
